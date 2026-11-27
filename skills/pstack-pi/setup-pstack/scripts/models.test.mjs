import assert from "node:assert/strict";
import { appendFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "models.mjs");

const catalogue = `provider       model                     context  max-out  thinking  images
magpie         zhipu/glm-5.4             200K     32K      yes       no
magpie         devin/gemini-4-neon       1.0M     64K      yes       yes
magpie         deepai/deepseek-v4.1      128K     16K      yes       no
antigravity    claude-opus-4-6           250K     64K      yes       yes
`;

function setup({ user, project } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "pstack-models-"));
  const agent = path.join(root, "agent");
  const cwd = path.join(root, "repo");
  mkdirSync(agent);
  mkdirSync(path.join(cwd, ".pi"), { recursive: true });
  writeFileSync(path.join(root, "catalogue.txt"), catalogue);
  if (user) writeFileSync(path.join(agent, "settings.json"), JSON.stringify({ enabledModels: user }));
  if (project) {
    writeFileSync(path.join(cwd, ".pi", "settings.json"), JSON.stringify({ enabledModels: project }));
  }
  return { root, agent, cwd };
}

function run(ctx, args) {
  return spawnSync(
    process.execPath,
    [script, ...args, "--catalogue", path.join(ctx.root, "catalogue.txt")],
    {
      cwd: ctx.cwd,
      encoding: "utf8",
      env: { ...process.env, PI_CODING_AGENT_DIR: ctx.agent },
    },
  );
}

test("resolves exact ids and recursive globs against the catalogue", () => {
  const ctx = setup({ user: ["magpie/**", "antigravity/claude-opus-4-6"] });
  const result = run(ctx, ["scope", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  const models = JSON.parse(result.stdout).map((m) => `${m.provider}/${m.model}`);
  assert.deepEqual(models, [
    "magpie/zhipu/glm-5.4",
    "magpie/devin/gemini-4-neon",
    "magpie/deepai/deepseek-v4.1",
    "antigravity/claude-opus-4-6",
  ]);
});

test("a single-star glob does not cross a provider segment", () => {
  const ctx = setup({ user: ["magpie/*"] });
  const result = run(ctx, ["scope"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /match no available model/);
});

test("a bare pattern fuzzy-matches a model id", () => {
  const ctx = setup({ user: ["glm"] });
  const result = run(ctx, ["scope"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "magpie/zhipu/glm-5.4");
});

test("a bare provider name does not fuzzy-match every model", () => {
  const ctx = setup({ user: ["magpie"] });
  const result = run(ctx, ["scope"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /match no available model/);
});

test("a fuzzy pattern keeps only Pi's best match", () => {
  const ctx = setup({ user: ["glm"] });
  appendFileSync(
    path.join(ctx.root, "catalogue.txt"),
    "magpie         zhipu/glm-5.3             128K     16K      yes       no\n",
  );
  const result = run(ctx, ["scope"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "magpie/zhipu/glm-5.4");
});

test("a colon suffix that is not a thinking level stays in the pattern", () => {
  const ctx = setup({ user: ["magpie/zhipu/glm-5.4:bogus"] });
  const result = run(ctx, ["scope"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /match no available model/);
});

test("a pattern can pin a thinking level", () => {
  const ctx = setup({ user: ["magpie/zhipu/glm-5.4:high"] });
  const result = run(ctx, ["scope", "--json"]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [
    { provider: "magpie", model: "zhipu/glm-5.4", thinking: "high" },
  ]);
});

test("a project scope replaces the user scope", () => {
  const ctx = setup({ user: ["magpie/*"], project: ["antigravity/*"] });
  const result = run(ctx, ["scope"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "antigravity/claude-opus-4-6");
});

test("no scope is an error, never the full catalogue", () => {
  const ctx = setup({});
  const result = run(ctx, ["scope"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /no scoped models/);
});

test("check accepts a scoped id and rejects the rest", () => {
  const ctx = setup({ user: ["magpie/**"] });
  assert.equal(run(ctx, ["check", "magpie/zhipu/glm-5.4"]).status, 0);
  const rejected = run(ctx, ["check", "antigravity/claude-opus-4-6"]);
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /not in the scoped set/);
});
