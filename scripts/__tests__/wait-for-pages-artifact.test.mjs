import test from "node:test";
import assert from "node:assert/strict";
import {
  backendIdsFromToken,
  artifactNames,
  waitForArtifact,
} from "../wait-for-pages-artifact.mjs";

/**
 * The probe stands between a finished upload and a deploy that cannot find the
 * artifact. If it reports "not there" when the artifact IS there, the deploy
 * fails; if it reports "there" when it is not, the deploy fails. Both
 * directions are pinned here.
 */

/** Build an unsigned JWT with the given claims — only the payload is read. */
const jwt = (claims) => {
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${enc({ alg: "none" })}.${enc(claims)}.signature`;
};

const RUN_ID = "ce7f54c7-61c7-4aae-887f-30da475f5f1a";
const JOB_ID = "ca395085-040a-526b-2ce8-bdc85f692774";

test("backendIdsFromToken: reads the run and job ids from the Actions.Results scope", () => {
  const token = jwt({ scp: `Actions.ExampleScope Actions.Results:${RUN_ID}:${JOB_ID}` });
  assert.deepEqual(backendIdsFromToken(token), {
    workflowRunBackendId: RUN_ID,
    workflowJobRunBackendId: JOB_ID,
  });
});

test("backendIdsFromToken: a token with no Actions.Results scope is rejected", () => {
  assert.throws(() => backendIdsFromToken(jwt({ scp: "Actions.ExampleScope" })), /Actions.Results/);
});

test("backendIdsFromToken: a malformed scope is rejected, not silently half-parsed", () => {
  assert.throws(
    () => backendIdsFromToken(jwt({ scp: `Actions.Results:${RUN_ID}` })),
    /malformed/,
  );
});

test("backendIdsFromToken: a token with no scp claim is rejected", () => {
  assert.throws(() => backendIdsFromToken(jwt({})), /scp/);
});

test("artifactNames: pulls the names out of a ListArtifacts response", () => {
  assert.deepEqual(
    artifactNames({ artifacts: [{ name: "github-pages", id: 1 }, { name: "other", id: 2 }] }),
    ["github-pages", "other"],
  );
});

test("artifactNames: an empty or missing artifact list yields no names", () => {
  assert.deepEqual(artifactNames({ artifacts: [] }), []);
  assert.deepEqual(artifactNames({}), []);
});

/** Serve a fake artifact service: the artifact appears on the Nth call. */
const fakeService = (appearOnCall) => {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    const listed = calls.length >= appearOnCall;
    return new Response(
      JSON.stringify({ artifacts: listed ? [{ name: "github-pages", id: 42 }] : [] }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
};

const token = jwt({ scp: `Actions.ExampleScope Actions.Results:${RUN_ID}:${JOB_ID}` });

test("waitForArtifact: polls until the service lists the artifact", async () => {
  const svc = fakeService(3);
  try {
    const found = await waitForArtifact({
      attempts: 5,
      delayMs: 0,
      origin: "https://results.example",
      token,
      log: () => {},
    });
    assert.equal(found, true);
    assert.equal(svc.calls.length, 3, "it must poll until the artifact appears");
  } finally {
    svc.restore();
  }
});

test("waitForArtifact: asks the artifact service, not the REST API", async () => {
  const svc = fakeService(1);
  try {
    await waitForArtifact({
      attempts: 2,
      delayMs: 0,
      origin: "https://results.example/base/path",
      token,
      log: () => {},
    });
    const { url, init } = svc.calls[0];
    assert.equal(
      url,
      "https://results.example/twirp/github.actions.results.api.v1.ArtifactService/ListArtifacts",
    );
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Authorization, `Bearer ${token}`);
    assert.deepEqual(JSON.parse(init.body), {
      workflowRunBackendId: RUN_ID,
      workflowJobRunBackendId: JOB_ID,
    });
  } finally {
    svc.restore();
  }
});

test("waitForArtifact: gives up after the attempt budget", async () => {
  const svc = fakeService(Number.MAX_SAFE_INTEGER);
  try {
    const found = await waitForArtifact({
      attempts: 3,
      delayMs: 0,
      origin: "https://results.example",
      token,
      log: () => {},
    });
    assert.equal(found, false);
    assert.equal(svc.calls.length, 3);
  } finally {
    svc.restore();
  }
});

test("waitForArtifact: a transient service error does not end the wait", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    if (calls === 1) return new Response("upstream is down", { status: 503 });
    return new Response(JSON.stringify({ artifacts: [{ name: "github-pages" }] }), { status: 200 });
  };
  try {
    const found = await waitForArtifact({
      attempts: 4,
      delayMs: 0,
      origin: "https://results.example",
      token,
      log: () => {},
    });
    assert.equal(found, true);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
  }
});

test("waitForArtifact: missing runner credentials fail loudly", async () => {
  await assert.rejects(
    () =>
      waitForArtifact({
        attempts: 1,
        delayMs: 0,
        origin: "",
        token: "x",
        log: () => {},
      }),
    /ACTIONS_RESULTS_URL/,
  );
});
