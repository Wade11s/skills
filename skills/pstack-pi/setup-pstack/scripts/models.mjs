#!/usr/bin/env node
/**
 * Resolve the models pstack may use, from the user's scoped set.
 *
 * Pi scopes models with `enabledModels` (settings) in the same format as `--models`:
 * exact ids, fuzzy matches, case-insensitive globs, and an optional `:thinking` suffix.
 * There is no CLI that prints the resolved scope, so this script applies the patterns to
 * `pi --list-models` and prints the result.
 *
 * Usage:
 *   models.mjs scope [--json] [--catalogue <file>]
 *   models.mjs check <provider/model> [--catalogue <file>]
 *
 * Settings are read from $PI_CODING_AGENT_DIR/settings.json and .pi/settings.json, the
 * same order Pi loads them. A project `enabledModels` replaces the user-level list.
 */

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

function fail(message) {
  process.stderr.write(`models.mjs: ${message}\n`);
  process.exit(1);
}

function readSettings(file) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${file} is not valid JSON: ${error.message}`);
  }
}

function scopedPatterns() {
  const agentDir =
    process.env.PI_CODING_AGENT_DIR ?? path.join(os.homedir(), ".pi", "agent");
  const user = readSettings(path.join(agentDir, "settings.json"));
  const project = readSettings(path.join(process.cwd(), ".pi", "settings.json"));
  const projectPatterns = project?.enabledModels;
  if (Array.isArray(projectPatterns) && projectPatterns.length > 0) {
    return projectPatterns;
  }
  const userPatterns = user?.enabledModels;
  if (Array.isArray(userPatterns) && userPatterns.length > 0) {
    return userPatterns;
  }
  return null;
}

function catalogueFrom(text) {
  const models = [];
  for (const line of text.split("\n")) {
    if (!line.trim() || /^provider\s+model\b/.test(line)) continue;
    const columns = line.trim().split(/\s{2,}/);
    if (columns.length < 2) continue;
    models.push({ provider: columns[0], model: columns[1] });
  }
  return models;
}

function readCatalogue(file) {
  if (file) {
    return catalogueFrom(readFileSync(file, "utf8"));
  }
  const result = spawnSync("pi", ["--list-models"], { encoding: "utf8" });
  if (result.status !== 0 || !result.stdout) {
    fail("could not read `pi --list-models`; pass --catalogue <file>");
  }
  return catalogueFrom(result.stdout);
}

const THINKING_LEVELS = new Set(["off", "minimal", "low", "medium", "high", "xhigh", "max"]);

function globToRegExp(pattern) {
  let source = "";
  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i];
    if (char === "*") {
      if (pattern[i + 1] === "*") {
        source += ".*";
        i += 1;
      } else {
        source += "[^/]*";
      }
    } else if (char === "?") {
      source += "[^/]";
    } else {
      source += char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${source}$`, "i");
}

function exactMatch(pattern, entry) {
  const needle = pattern.toLowerCase();
  return (
    needle === `${entry.provider}/${entry.model}`.toLowerCase() ||
    needle === entry.model.toLowerCase()
  );
}

function globMatch(pattern, entry) {
  const matcher = globToRegExp(pattern);
  return matcher.test(`${entry.provider}/${entry.model}`) || matcher.test(entry.model);
}

function isAlias(id) {
  return id.endsWith("-latest") || !/-\d{8}$/.test(id);
}

// Pi's bestFuzzyMatch: prefer aliases, then the highest id.
function bestFuzzy(pattern, catalogue) {
  const needle = pattern.toLowerCase();
  const matches = catalogue.filter((entry) => entry.model.toLowerCase().includes(needle));
  if (matches.length === 0) return [];
  const aliases = matches.filter((entry) => isAlias(entry.model));
  const pool = aliases.length > 0 ? aliases : matches;
  const best = [...pool].sort((a, b) => b.model.localeCompare(a.model))[0];
  // The same id on several providers is kept for each, as `--models` does.
  return catalogue.filter((entry) => entry.model === best.model);
}

function scope(patterns, catalogue) {
  const out = [];
  const seen = new Set();

  for (const raw of patterns) {
    const index = raw.lastIndexOf(":");
    const suffix = index > 0 ? raw.slice(index + 1) : "";
    const thinking = THINKING_LEVELS.has(suffix) ? suffix : undefined;
    const pattern = thinking ? raw.slice(0, index) : raw;

    let matched;
    if (/[*?]/.test(pattern)) {
      matched = catalogue.filter((entry) => globMatch(pattern, entry));
    } else {
      const exact = catalogue.filter((entry) => exactMatch(pattern, entry));
      matched = exact.length > 0 ? exact : bestFuzzy(pattern, catalogue);
    }

    for (const entry of matched) {
      const full = `${entry.provider}/${entry.model}`;
      const key = `${full}:${thinking ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(thinking ? { ...entry, thinking } : { ...entry });
    }
  }

  return out;
}

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const command = process.argv[2] ?? "";
const catalogue = readCatalogue(option("--catalogue"));
const patterns = scopedPatterns();

if (command === "check") {
  const target = process.argv[3];
  if (!target) fail("check needs <provider/model>");
  if (!patterns) fail("no scoped models configured; run /scoped-models first");
  const resolved = scope(patterns, catalogue);
  if (!resolved.some((entry) => `${entry.provider}/${entry.model}` === target)) {
    fail(`not in the scoped set: ${target}`);
  }
  process.stdout.write(`${target}\n`);
  process.exit(0);
}

if (command === "scope") {
  if (!patterns) fail("no scoped models configured; run /scoped-models first");
  const resolved = scope(patterns, catalogue);
  if (resolved.length === 0) fail("the scoped patterns match no available model");
  if (process.argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify(resolved, null, 2)}\n`);
  } else {
    for (const entry of resolved) {
      process.stdout.write(`${entry.provider}/${entry.model}${entry.thinking ? `:${entry.thinking}` : ""}\n`);
    }
  }
  process.exit(0);
}

fail("usage: models.mjs scope [--json] [--catalogue <file>] | check <provider/model>");
