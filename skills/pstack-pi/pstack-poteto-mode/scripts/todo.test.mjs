import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, utimesSync, writeFileSync } from "node:fs";
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

test("a duplicate is detected after the file grows", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  ok(cwd, ["init", "long", "long run"]);
  for (let i = 0; i < 120; i += 1) {
    ok(cwd, ["add", "long", `step number ${i}`]);
  }
  const result = run(cwd, ["add", "long", "step number 1"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /duplicate step/);
});

test("newlines are rejected in text and notes", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  ok(cwd, ["init", "run", "run"]);
  const added = run(cwd, ["add", "run", "line one\n- [x] 99 injected"]);
  assert.notEqual(added.status, 0);
  assert.match(added.stderr, /single line/);

  ok(cwd, ["add", "run", "first"]);
  const done = run(cwd, ["done", "run", "01", "--note", "bad\ninjected"]);
  assert.notEqual(done.status, 0);
  assert.match(done.stderr, /single line/);
});

test("ids are literal digits", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  ok(cwd, ["init", "run", "run"]);
  ok(cwd, ["add", "run", "first"]);
  const result = run(cwd, ["done", "run", ".*"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /id must be digits/);
  assert.match(ok(cwd, ["open", "run"]), /^01\tfirst$/m);
});

test("a stale lock is taken over", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  ok(cwd, ["init", "run", "run"]);
  const lock = path.join(cwd, ".pstack/run/todo.md.lock");
  mkdirSync(lock);
  writeFileSync(path.join(lock, "pid"), "999999\n");
  const result = run(cwd, ["add", "run", "after a killed holder"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), "01");
});

test("check rejects duplicate ids", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  const file = ok(cwd, ["init", "run", "run"]);
  appendFileSync(file, "- [ ] 01 first\n- [x] 01 second (2026-01-01T00:00:00Z)\n");
  const result = run(cwd, ["check", "run"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /duplicate id 01/);
});

test("a completed step cannot be added again", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  ok(cwd, ["init", "run", "run"]);
  ok(cwd, ["add", "run", "write the repro"]);
  ok(cwd, ["done", "run", "01"]);
  const result = run(cwd, ["add", "run", "write the repro"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /duplicate step/);
});

test("step text is stored literally", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  const file = ok(cwd, ["init", "run", "run"]);
  const text = "quote \" and ' and \\ and $(touch pwn) and * and [x]";
  ok(cwd, ["add", "run", text]);
  assert.ok(readFileSync(file, "utf8").includes(text));
  assert.equal(existsSync(path.join(cwd, "pwn")), false);
});

test("a timestamp-like suffix in step text is not stripped", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  ok(cwd, ["init", "run", "run"]);
  ok(cwd, ["add", "run", "ship (2026-01-01T00:00:00Z) build"]);
  ok(cwd, ["done", "run", "01"]);
  const result = run(cwd, ["add", "run", "ship"]);
  assert.equal(result.status, 0, result.stderr);
});

test("a lock held by a live process is not stolen", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  ok(cwd, ["init", "run", "run"]);
  const lock = path.join(cwd, ".pstack/run/todo.md.lock");
  mkdirSync(lock);
  writeFileSync(path.join(lock, "pid"), `${process.pid}\n`);
  const result = run(cwd, ["add", "run", "blocked"], { PSTACK_LOCK_SPINS: "5" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /lock is held by a live process/);
});

test("a lock without a pid is stolen after the grace period", () => {
  const cwd = mkdtempSync(path.join(tmpdir(), "pstack-todo-"));
  ok(cwd, ["init", "run", "run"]);
  const lock = path.join(cwd, ".pstack/run/todo.md.lock");
  mkdirSync(lock);
  const past = new Date(Date.now() - 10_000);
  utimesSync(lock, past, past);
  const result = run(cwd, ["add", "run", "after a crash"]);
  assert.equal(result.status, 0, result.stderr);
});
