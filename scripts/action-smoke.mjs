/**
 * action-smoke.mjs — exercise the local action against a mock artifact service.
 *
 * Runs the real entry point of .github/actions/wait-for-pages-artifact with a
 * fake service that only lists the artifact on the third call, then asserts
 * the action polled, hit the right endpoint, sent the runtime token and the
 * run and job backend ids, and exited 0.
 *
 * It exists because the probe is the one step of the deploy that cannot be
 * checked by the normal unit tests: it needs the runner's environment
 * (ACTIONS_RESULTS_URL, ACTIONS_RUNTIME_TOKEN) and the runner only hands
 * those to JavaScript action steps. A broken action would otherwise be
 * discovered by a failed deploy rather than by the test run.
 *
 * Run by `npm test` (test:scripts), so CI fails on a broken action before the
 * deploy needs it.
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** The repo root, from this file — not the working directory, and not a path
 *  that only exists on one machine. */
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const RUN_ID = "ce7f54c7-61c7-4aae-887f-30da475f5f1a";
const JOB_ID = "ca395085-040a-526b-2ce8-bdc85f692774";

const jwt = (claims) => {
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${enc({ alg: "none" })}.${enc(claims)}.sig`;
};

let calls = 0;
let lastBody = null;
let lastAuth = null;
let lastPath = null;

const server = http.createServer((req, res) => {
  calls++;
  lastPath = req.url;
  lastAuth = req.headers.authorization;
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    lastBody = body;
    // The artifact appears only on the 3rd call — the race, on purpose.
    const listed = calls >= 3;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ artifacts: listed ? [{ name: "github-pages", id: 99 }] : [] }));
  });
});

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const child = spawn(process.execPath, [".github/actions/wait-for-pages-artifact/main.js"], {
  cwd: REPO_ROOT,
  env: {
    ...process.env,
    ACTIONS_RESULTS_URL: `http://127.0.0.1:${port}/some/base`,
    ACTIONS_RUNTIME_TOKEN: jwt({ scp: `Actions.ExampleScope Actions.Results:${RUN_ID}:${JOB_ID}` }),
    INPUT_ARTIFACT_NAME: "github-pages",
    INPUT_ATTEMPTS: "10",
    INPUT_DELAY_MS: "50",
  },
  stdio: "inherit",
});

const code = await new Promise((r) => child.on("close", r));
server.close();

console.log("\n--- assertions ---");
const ok = (label, cond) => console.log(`${cond ? "  ok  " : "  FAIL"} ${label}`);
ok("action exited 0", code === 0);
ok("polled 3 times (appeared on the 3rd)", calls === 3);
ok(
  "hit the Twirp ListArtifacts path",
  lastPath === "/twirp/github.actions.results.api.v1.ArtifactService/ListArtifacts",
);
ok("sent the runtime token", lastAuth === `Bearer ${jwt({ scp: `Actions.ExampleScope Actions.Results:${RUN_ID}:${JOB_ID}` })}`);
ok(
  "sent the run and job backend ids",
  lastBody === JSON.stringify({ workflowRunBackendId: RUN_ID, workflowJobRunBackendId: JOB_ID }),
);
process.exit(code === 0 && calls === 3 ? 0 : 1);
