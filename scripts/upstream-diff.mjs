#!/usr/bin/env node
/**
 * Report upstream pstack files that changed since the pinned commit, mapped to local paths.
 *
 * Read-only. Clones `cursor/plugins` into .cache/ if needed, fetches the default branch, and
 * prints one line per changed upstream path with its local counterpart.
 *
 * Usage: node scripts/upstream-diff.mjs [--json]
 */

import { existsSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache", "upstream-plugins");
const UPSTREAM = "https://github.com/cursor/plugins.git";
const PIN = "b7b93c36be9bcc36a74db438e0fd385d660bc559";
const SCOPE = "pstack/";

function git(args, options = {}) {
  const result = spawnSync("git", args, { encoding: "utf8", ...options });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

function ensureClone() {
  if (!existsSync(CACHE)) {
    mkdirSync(path.dirname(CACHE), { recursive: true });
    git(["clone", "--filter=blob:none", "--sparse", UPSTREAM, CACHE]);
    git(["sparse-checkout", "set", "pstack"], { cwd: CACHE });
  }
  git(["fetch", "--quiet", "origin"], { cwd: CACHE });
  try {
    git(["cat-file", "-e", `${PIN}^{commit}`], { cwd: CACHE });
  } catch {
    git(["fetch", "--quiet", "origin", PIN], { cwd: CACHE });
  }
}

function defaultBranch() {
  const ref = git(
    ["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"],
    { cwd: CACHE },
  ).trim();
  return ref.replace(/^origin\//, "");
}

function localPath(upstreamPath) {
  const relative = upstreamPath.slice(SCOPE.length);
  const skills = relative.match(/^skills\/([a-z0-9-]+)\/(.*)$/);
  if (skills) {
    const [, name, rest] = skills;
    const local = name === "setup-pstack" ? name : `pstack-${name}`;
    return path.join("skills", "pstack-pi", local, rest);
  }
  const agents = relative.match(/^agents\/(.+)$/);
  if (agents) {
    return path.join("skills", "pstack-pi", "pstack-no-comments", "references", agents[1]);
  }
  if (relative.startsWith("docs/guide/")) {
    return path.join("docs", relative.slice("docs/".length));
  }
  return path.join("(removed or unmapped)", relative);
}

function main() {
  ensureClone();
  const branch = defaultBranch();
  const output = git(
    ["log", "--name-only", "--pretty=format:", `${PIN}..origin/${branch}`, "--", SCOPE],
    { cwd: CACHE },
  );
  const changed = [...new Set(output.split("\n").map((line) => line.trim()).filter(Boolean))].sort();

  const rows = changed.map((file) => ({ upstream: file, local: localPath(file) }));

  if (process.argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify({ pin: PIN, branch, files: rows }, null, 2)}\n`);
    return;
  }

  if (rows.length === 0) {
    process.stdout.write(`no upstream changes since ${PIN.slice(0, 7)} on ${branch}\n`);
    return;
  }

  process.stdout.write(`${rows.length} file(s) changed upstream since ${PIN.slice(0, 7)} on ${branch}:\n`);
  for (const row of rows) {
    process.stdout.write(`  ${row.upstream}\n    -> ${row.local}\n`);
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`upstream-diff: ${error.message}\n`);
  process.exitCode = 1;
}
