import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "todo.sh");

function run(cwd, args, env = {}) {
  return spawnSync("bash", [script, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, PSTACK_STATE_DIR: ".pstack", ...env },
  });
}

function ok(cwd, args, env) {
  const result = run(cwd, args, env);
  assert.equal(result.status, 0, `${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout.trim();
}

test("init, add, open, done, check", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));

  const file = ok(cwd, ["init", "fix-drift", "fix the 750ms drift"]);
  assert.equal(file, path.join(realpathSync(cwd), ".pstack/fix-drift/todo.md"));

  assert.equal(ok(cwd, ["add", "fix-drift", "frame the repro"]), "01");
  assert.equal(ok(cwd, ["add", "fix-drift", "write the failing script"]), "02");

  const open = ok(cwd, ["open", "fix-drift"]);
  assert.match(open, /^01\tframe the repro$/m);
  assert.match(open, /^02\twrite the failing script$/m);

  const duplicate = run(cwd, ["add", "fix-drift", "frame the repro"]);
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr, /duplicate step/);

  assert.equal(ok(cwd, ["done", "fix-drift", "01", "--note", "repro confirmed"]), "done: 01");
  const again = ok(cwd, ["done", "fix-drift", "01"]);
  assert.equal(again, "already done: 01");

  const remaining = ok(cwd, ["open", "fix-drift"]);
  assert.doesNotMatch(remaining, /^01\t/m);
  assert.match(remaining, /^02\t/m);

  assert.equal(ok(cwd, ["check", "fix-drift"]), "ok");
  const text = readFileSync(file, "utf8");
  assert.match(text, /^- \[x\] 01 frame the repro \(/m);
  assert.match(text, /repro confirmed/);
});

test("check rejects a malformed line", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  const file = ok(cwd, ["init", "bad", "bad run"]);
  writeFileSync(file, `${readFileSync(file, "utf8")}- not a step\n`);
  const result = run(cwd, ["check", "bad"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /bad line 3/);
});

test("state root override is the parent of the slug", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  const file = ok(cwd, ["init", "audited", "audit run"], { PSTACK_STATE_DIR: "docs/pstack" });
  assert.equal(file, path.join(realpathSync(cwd), "docs/pstack/audited/todo.md"));
});

test("invalid slug is rejected", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  const result = run(cwd, ["init", "../escape", "nope"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /invalid slug/);
});

test("done on a missing id fails", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  ok(cwd, ["init", "run", "run"]);
  const result = run(cwd, ["done", "run", "07"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /no open step 07/);
});

test("init refuses to overwrite without --force", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  ok(cwd, ["init", "run", "run"]);
  const result = run(cwd, ["init", "run", "again"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /already exists/);
  ok(cwd, ["init", "run", "again", "--force"]);
});
