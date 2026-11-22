/**
 * Wait for the Actions artifact service to list an artifact.
 *
 * This is a JavaScript action and not a `run:` step on purpose. The runner
 * injects ACTIONS_RESULTS_URL and ACTIONS_RUNTIME_TOKEN only into JavaScript
 * action steps — Runner.Worker/Handlers/NodeScriptActionHandler.cs — and
 * those two are exactly what the artifact service needs. A `run:` step never
 * sees them; the probe there fails with "ACTIONS_RESULTS_URL is not set",
 * which is how this was found.
 *
 * `actions/deploy-pages` is a JavaScript action too, so it gets the same
 * environment this does, and asks the same service this polls.
 *
 * The logic lives in scripts/wait-for-pages-artifact.mjs so it can be unit
 * tested; this file only wires the inputs through to it.
 */
import { waitForArtifact } from "../../../scripts/wait-for-pages-artifact.mjs";

const name = process.env.INPUT_ARTIFACT_NAME || "github-pages";
const attempts = Number(process.env.INPUT_ATTEMPTS || "30");
const delayMs = Number(process.env.INPUT_DELAY_MS || "4000");

const found = await waitForArtifact({ name, attempts, delayMs });

if (!found) {
  console.error(
    `::error::The artifact service never listed "${name}" for this run after ${attempts} attempts.`,
  );
  process.exit(1);
}
