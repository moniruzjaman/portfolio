import { test } from "node:test";
import assert from "node:assert/strict";
import { descriptionFromReadme } from "../lib/readme-description.mjs";

test("descriptionFromReadme: takes the first readable prose paragraph", () => {
  const readme = [
    "# My Cool App",
    "",
    "A searchable, resistance-aware pesticide field guide for extension officers.",
    "",
    "## Features",
  ].join("\n");
  assert.equal(
    descriptionFromReadme(readme),
    "A searchable, resistance-aware pesticide field guide for extension officers.",
  );
});

test("descriptionFromReadme: strips markdown links and emphasis", () => {
  const readme = "# Title\n\nSee the **[field guide](https://example.com)** for `soil` _health_.";
  assert.equal(descriptionFromReadme(readme), "See the field guide for soil health.");
});

test("descriptionFromReadme: skips badges, code, tables, lists and nav headings", () => {
  const readme = [
    "# App",
    "![badge](https://img.shields.io/badge/x-y)",
    "| col | col |",
    "```bash",
    "npm install",
    "```",
    "- point one",
    "> a quote",
    "[![deep badge](https://x)](https://y)",
    "",
    "The real description lives here after the ceremony.",
  ].join("\n");
  assert.equal(
    descriptionFromReadme(readme),
    "The real description lives here after the ceremony.",
  );
});

test("descriptionFromReadme: caps at 160 characters with an ellipsis", () => {
  const line = `A very long description. ${"word ".repeat(40)}`.trim();
  const out = descriptionFromReadme(`# App\n\n${line}`);
  assert.ok(out.length <= 160, `length ${out.length}`);
  assert.ok(out.endsWith("…"));
});

test("descriptionFromReadme: returns null for ceremony-only readmes", () => {
  assert.equal(descriptionFromReadme("# App\n\n## Install\n\n```\nnpm i\n```"), null);
  assert.equal(descriptionFromReadme(""), null);
  assert.equal(descriptionFromReadme(undefined), null);
});

test("descriptionFromReadme: accepts Bangla prose", () => {
  const out = descriptionFromReadme(
    "# শিরোনাম\n\nকৃষকদের জন্য বাংলা ভাষার একটি স্মার্ট কৃষি সহায়ক অ্যাপ্লিকেশন।",
  );
  assert.ok(out && out.includes("কৃষকদের"));
});
