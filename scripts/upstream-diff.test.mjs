import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { localPath } from "./upstream-diff.mjs";

const p = (...parts) => path.join(...parts);

test("maps a normal skill", () => {
  assert.equal(
    localPath("pstack/skills/arena/SKILL.md"),
    p("skills", "pstack-pi", "pstack-arena", "SKILL.md"),
  );
});

test("maps the two naming exceptions", () => {
  assert.equal(
    localPath("pstack/skills/poteto-help/SKILL.md"),
    p("skills", "pstack-pi", "pstack-help", "SKILL.md"),
  );
  assert.equal(
    localPath("pstack/skills/setup-pstack/SKILL.md"),
    p("skills", "pstack-pi", "setup-pstack", "SKILL.md"),
  );
});

test("maps agent personas into their skill", () => {
  assert.equal(
    localPath("pstack/agents/poteto-agent.md"),
    p("skills", "pstack-pi", "pstack-poteto-mode", "references", "poteto-agent.md"),
  );
  assert.equal(
    localPath("pstack/agents/comment-sicko.md"),
    p("skills", "pstack-pi", "pstack-no-comments", "references", "comment-sicko.md"),
  );
});

test("marks removed paths", () => {
  for (const removed of [
    "pstack/skills/make-bot-ui/SKILL.md",
    "pstack/skills/ketchup-video/SKILL.md",
    "pstack/automations/benny/README.md",
    "pstack/skills/poteto-mode/references/bugbot-triage.md",
    "pstack/skills/poteto-mode/scripts/watch-pr/cli.ts",
  ]) {
    assert.equal(localPath(removed), "(removed)");
  }
});

test("marks unknown paths instead of inventing one", () => {
  assert.equal(localPath("pstack/README.md"), "(unmapped) README.md");
});
