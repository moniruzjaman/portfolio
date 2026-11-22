#!/usr/bin/env node
/**
 * wait-for-pages-artifact.mjs — block until the artifact service can see the
 * pages artifact, so `actions/deploy-pages` finds it.
 *
 * WHY THE REST API IS NOT ENOUGH
 * -------------------------------
 * `actions/deploy-pages@v5` does not read the artifact over the REST API. It
 * asks the **Actions Results Service** — a Twirp endpoint reached with the
 * runner's runtime token — for the artifacts belonging to *this run and this
 * job*. That service indexes an upload asynchronously: for a short window
 * after `upload-pages-artifact` reports success, the service still answers
 * "no artifacts" while the REST API already lists it.
 *
 * Run 45020962655 (2026-11-21) failed exactly that way. A REST poll found
 * artifact 14754205711 immediately, and `deploy-pages` then said
 * "Found 0 artifact(s)". Polling the wrong backend cannot fix a race that
 * lives in the other backend.
 *
 * So this probe asks the same service, with the same scope and the same
 * filter, that `deploy-pages` will ask. When it reports the artifact as
 * present, `deploy-pages` will find it.
 *
 * The request is exactly what `@actions/artifact` sends:
 *   POST {origin}/twirp/github.actions.results.api.v1.ArtifactService/ListArtifacts
 *   Authorization: Bearer $ACTIONS_RUNTIME_TOKEN
 *   {"workflowRunBackendId": "...", "workflowJobRunBackendId": "..."}
 *
 * The two ids come from the runtime token's `scp` claim:
 *   scp: "... Actions.Results:<run-backend-id>:<job-backend-id>"
 *
 * Dependency-free by design, like `sync-repos.mjs` — it must not be able to
 * drift out of sync with the workflow that calls it.
 *
 * Usage: node scripts/wait-for-pages-artifact.mjs [name] [attempts] [delayMs]
 */

const SERVICE = "github.actions.results.api.v1.ArtifactService";
const METHOD = "ListArtifacts";

/** Decode a JWT payload without verifying it — we are not authenticating, only reading claims. */
function decodeJwtPayload(token) {
  const parts = String(token || "").split(".");
  if (parts.length < 2 || !parts[1]) throw new Error("runtime token is not a JWT");
  const json = Buffer.from(parts[1], "base64url").toString("utf8");
  return JSON.parse(json);
}

/**
 * Pull the run and job backend ids out of the runtime token.
 *
 * The scope claim looks like:
 *   "Actions.ExampleScope Actions.Results:<run-backend-id>:<job-backend-id>"
 * and the ids are what scope the artifact service to one run and one job.
 */
export function backendIdsFromToken(token) {
  const claims = decodeJwtPayload(token);
  const scp = claims?.scp;
  if (typeof scp !== "string") throw new Error("runtime token has no scp claim");
  for (const scope of scp.split(" ")) {
    const parts = scope.split(":");
    if (parts[0] !== "Actions.Results") continue;
    if (parts.length !== 3) throw new Error(`malformed Actions.Results scope: ${scope}`);
    return { workflowRunBackendId: parts[1], workflowJobRunBackendId: parts[2] };
  }
  throw new Error("runtime token has no Actions.Results scope");
}

/** The artifact names a ListArtifacts response offers. */
export function artifactNames(response) {
  const artifacts = response?.artifacts ?? [];
  return artifacts.map((a) => a?.name).filter((n) => typeof n === "string");
}

/** Ask the artifact service for the artifacts of this run and job. */
export async function listArtifacts({ origin, token, ids }) {
  const url = `${origin}/twirp/${SERVICE}/${METHOD}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(ids),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ListArtifacts → HTTP ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function waitForArtifact({
  name = "github-pages",
  attempts = 30,
  delayMs = 4000,
  origin,
  token,
  log = (msg) => console.log(msg),
} = {}) {
  const resultsUrl = origin ?? process.env.ACTIONS_RESULTS_URL;
  const runtimeToken = token ?? process.env.ACTIONS_RUNTIME_TOKEN;
  if (!resultsUrl) throw new Error("ACTIONS_RESULTS_URL is not set");
  if (!runtimeToken) throw new Error("ACTIONS_RUNTIME_TOKEN is not set");

  const ids = backendIdsFromToken(runtimeToken);
  const base = new URL(resultsUrl).origin;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    let names = [];
    try {
      names = artifactNames(await listArtifacts({ origin: base, token: runtimeToken, ids }));
    } catch (err) {
      // A transient service error is the same race in another shape. Keep polling.
      log(`  attempt ${attempt}/${attempts}: ${err.message}`);
    }
    if (names.includes(name)) {
      log(`✔ the artifact service can see "${name}" (attempt ${attempt}/${attempts}).`);
      return true;
    }
    log(`  attempt ${attempt}/${attempts}: the artifact service does not list "${name}" yet.`);
    if (attempt < attempts) await sleep(delayMs);
  }
  return false;
}

const isMain = (() => {
  try {
    return process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
  } catch {
    return false;
  }
})();

if (isMain) {
  const name = process.argv[2] || "github-pages";
  const attempts = Number(process.argv[3] || 30);
  const delayMs = Number(process.argv[4] || 4000);
  try {
    const found = await waitForArtifact({ name, attempts, delayMs });
    if (!found) {
      console.error(
        `::error::The artifact service never listed "${name}" for this run after ${attempts} attempts.`,
      );
      process.exit(1);
    }
  } catch (err) {
    console.error(`::error::${err.message}`);
    process.exit(1);
  }
}
