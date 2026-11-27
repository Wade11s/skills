#!/usr/bin/env node
/**
 * Validate every skill in this repository against the rules recorded in AGENTS.md.
 *
 * The checks mirror what the `skills` CLI and Pi will accept at install time, plus
 * the project rules that keep a ported pack coherent:
 *
 *   1. discovery: no SKILL.md at the pack root, no skill deeper than 3 levels
 *   2. identity: name matches the directory (`pstack-<dir>`, allowlisted exceptions)
 *   3. frontmatter: required fields, length limits, no Cursor-only keys
 *   4. forbidden tokens: no leftover Cursor-only tool, path, model, or command names
 *   5. references: every local link, every `/skill:*` command, every `**x** skill`
 *   6. orphans: every playbook, reference, and root markdown file is linked
 *
 * Usage: node scripts/validate-skills.mjs [--json]
 */

import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const PACK_DIR = path.join(SKILLS_DIR, "pstack-pi");
const NAME_PREFIX = "pstack-";
const NAME_ALLOWLIST = new Set(["setup-pstack"]);
const MAX_CONTAINER_DEPTH = 3;
const FORBIDDEN_FRONTMATTER_KEYS = new Set(["icon", "color", "paths", "alwaysApply"]);

const FORBIDDEN_TOKENS = [
  [/\bsubagent_type\b/, "Cursor subagent_type"],
  [/`Task`/, "Cursor Task tool"],
  [/\bAskQuestion\b/, "Cursor AskQuestion tool"],
  [/\brun_in_background\b/, "Cursor run_in_background flag"],
  [/\benvironment:\s*"?cloud"?/, "Cursor cloud execution"],
  [/\bcursor-team-kit\b/, "cursor-team-kit plugin"],
  [/\bcontrol-(?:ui|cli|notes)\b/, "control-* plugin"],
  [/\/deslop\b/, "cursor-team-kit /deslop"],
  [/\bBugbot\b/, "Cursor Bugbot"],
  [/\bapi2\.cursor\.sh\b/, "Cursor automations endpoint"],
  [/\bSendToUser\b|\bupdate_state\b/, "Cursor automations API"],
  [/(?:~|\.)?\/\.cursor\//, "Cursor config path"],
  [/\.cursor\/(?:skills|rules|plugins)\//, "Cursor skills/rules path"],
  [/agent-transcripts\//, "Cursor transcript path"],
  [/\binherit-parent\b/, "removed model alias"],
  [/\bcreate-skill\b/, "Cursor built-in create-skill"],
  [/\/loop\b/, "Cursor /loop command"],
  [/\bclaude-(?:opus|sonnet|haiku|fable)-\d/, "Cursor model slug"],
  [/\bgemini-\d/, "Cursor model slug"],
  [/\bgrok-\d/, "Cursor model slug"],
  [/\bopus 5\.5|\bfable 5\.2|\bgemini 4\b/i, "Cursor model name"],
];

const errors = [];
const warnings = [];

function fail(file, message, line) {
  errors.push({ file: rel(file), line, message });
}

function warn(file, message, line) {
  warnings.push({ file: rel(file), line, message });
}

function rel(file) {
  return path.relative(ROOT, file) || ".";
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseFrontmatter(text) {
  if (!text.startsWith("---")) {
    return { data: {}, body: text, error: "missing frontmatter" };
  }
  const end = text.indexOf("\n---", 3);
  if (end === -1) {
    return { data: {}, body: text, error: "unterminated frontmatter" };
  }
  const raw = text.slice(4, end);
  const bodyStart = text.indexOf("\n", end + 1);
  const body = bodyStart === -1 ? "" : text.slice(bodyStart + 1);
  const data = {};
  const lines = raw.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith("#") || /^\s/.test(line)) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rest] = match;

    const takeIndented = () => {
      const buffer = [];
      while (i + 1 < lines.length && (/^\s/.test(lines[i + 1]) || lines[i + 1].trim() === "")) {
        buffer.push(lines[(i += 1)]);
      }
      return buffer;
    };

    if (rest === "") {
      data[key] = takeIndented()
        .map((entry) => entry.trim())
        .filter(Boolean)
        .join("\n");
      continue;
    }

    const block = rest.match(/^([>|])([+-]?)$/);
    if (block) {
      const buffer = takeIndented().map((entry) => entry.replace(/^\s+/, ""));
      data[key] = (block[1] === ">" ? buffer.join(" ") : buffer.join("\n")).trim();
      continue;
    }

    data[key] = unquote(rest);
  }

  return { data, body, error: null };
}

async function findSkills() {
  const skills = [];
  const depthErrors = [];

  if (!existsSync(SKILLS_DIR)) {
    fail(SKILLS_DIR, "skills/ does not exist");
    return { skills, depthErrors };
  }

  if (existsSync(path.join(SKILLS_DIR, "SKILL.md"))) {
    fail(SKILLS_DIR, "skills/SKILL.md shadows every skill below it");
  }
  if (existsSync(path.join(PACK_DIR, "SKILL.md"))) {
    fail(PACK_DIR, "skills/pstack-pi/SKILL.md shadows every skill in the pack");
  }

  const walk = async (dir, depth) => {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules") {
        continue;
      }
      const child = path.join(dir, entry.name);
      if (existsSync(path.join(child, "SKILL.md"))) {
        if (depth > MAX_CONTAINER_DEPTH) {
          depthErrors.push(child);
          fail(child, `skill is nested deeper than ${MAX_CONTAINER_DEPTH} levels`);
        } else {
          skills.push(child);
        }
        continue;
      }
      if (depth >= MAX_CONTAINER_DEPTH) {
        const nested = await readdir(child, { withFileTypes: true });
        if (nested.some((item) => item.isDirectory() && existsSync(path.join(child, item.name, "SKILL.md")))) {
          depthErrors.push(child);
          fail(child, `nested skill exceeds the ${MAX_CONTAINER_DEPTH}-level discovery limit`);
        }
        continue;
      }
      await walk(child, depth + 1);
    }
  };

  await walk(SKILLS_DIR, 1);
  return { skills, depthErrors };
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

function checkLinks(dir, file, text, body) {
  let inFence = false;
  for (const [index, line] of text.split("\n").entries()) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    for (const match of line.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      const target = match[1];
      if (/^(?:https?:|mailto:|#|tel:)/i.test(target)) continue;
      if (target.includes("://") || target.startsWith("//")) continue;
      const clean = target.split("#")[0];
      if (!clean) continue;
      const resolved = path.resolve(dir, clean);
      if (!existsSync(resolved)) {
        fail(file, `link target does not exist: ${target}`, index + 1);
      }
    }
  }
}

function checkCommands(file, text, skillNames) {
  let inFence = false;
  for (const [index, line] of text.split("\n").entries()) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    for (const match of line.matchAll(/\/skill:([a-z0-9-]+)/g)) {
      const after = line.slice(match.index + match[0].length);
      if (after.startsWith("<") || after.startsWith("{")) continue;
      if (!skillNames.has(match[1])) {
        fail(file, `unknown skill command: /skill:${match[1]}`, index + 1);
      }
    }

    for (const match of line.matchAll(/\*\*([a-z][a-z0-9-]*)\*\*\s+skill\b/g)) {
      const candidate = `${NAME_PREFIX}${match[1]}`;
      if (!skillNames.has(candidate)) {
        fail(file, `skill reference does not resolve: **${match[1]}** skill (expected ${candidate})`, index + 1);
      }
    }
  }
}

function checkForbidden(file, text) {
  for (const [pattern, label] of FORBIDDEN_TOKENS) {
    const match = pattern.exec(text);
    if (match) {
      fail(file, `forbidden token (${label}): ${match[0]}`, lineOf(text, match.index));
    }
  }
}

async function collectMarkdown(dir) {
  const out = [];
  const walk = async (current) => {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "scripts" || entry.name === "assets" || entry.name.startsWith(".")) continue;
        await walk(full);
      } else if (entry.name.endsWith(".md")) {
        out.push(full);
      }
    }
  };
  await walk(dir);
  return out;
}

function checkOrphans(dir, skillFile, files, texts) {
  const requiredDirs = ["playbooks", "references"];
  for (const markdown of files) {
    if (markdown === skillFile) continue;
    const relative = path.relative(dir, markdown).split(path.sep).join("/");
    const inRequiredDir = requiredDirs.some((name) => relative.startsWith(`${name}/`));
    const atRoot = !relative.includes("/");
    if (!inRequiredDir && !atRoot) continue;

    const prefixes = [];
    let cursor = relative;
    while (cursor.includes("/")) {
      cursor = cursor.slice(0, cursor.lastIndexOf("/"));
      prefixes.push(`${cursor}/`);
    }

    const referenced = texts.some(({ file, text }) => {
      if (file === markdown) return false;
      return text.includes(relative) || prefixes.some((prefix) => text.includes(prefix));
    });

    if (!referenced) {
      fail(markdown, `orphan file: no skill file links ${relative}`);
    }
  }
}

async function main() {
  const json = process.argv.includes("--json");
  const { skills } = await findSkills();

  const records = [];
  for (const dir of skills) {
    const skillFile = path.join(dir, "SKILL.md");
    const text = await readFile(skillFile, "utf8");
    const { data, error } = parseFrontmatter(text);
    const directory = path.basename(dir);
    const expectedName = directory;

    if (error) {
      fail(skillFile, error);
      continue;
    }

    if (typeof data.name !== "string" || data.name.trim() === "") {
      fail(skillFile, "frontmatter is missing `name`");
    } else {
      if (!NAME_ALLOWLIST.has(directory) && !directory.startsWith(NAME_PREFIX)) {
        fail(skillFile, `skill directory must start with "${NAME_PREFIX}" or be allowlisted: ${directory}`);
      }
      if (data.name !== expectedName) {
        fail(skillFile, `name "${data.name}" must equal "${expectedName}" for directory "${directory}"`);
      }
      if (!/^[a-z0-9-]+$/.test(data.name)) {
        fail(skillFile, "name may contain only lowercase letters, digits, and hyphens");
      }
      if (data.name.startsWith("-") || data.name.endsWith("-") || data.name.includes("--")) {
        fail(skillFile, "name must not start or end with a hyphen, or contain two in a row");
      }
      if (data.name.length > 64) {
        fail(skillFile, "name exceeds 64 characters");
      }
    }

    if (typeof data.description !== "string" || data.description.trim() === "") {
      fail(skillFile, "frontmatter is missing `description`");
    } else if (data.description.length > 1024) {
      fail(skillFile, `description exceeds 1024 characters (${data.description.length})`);
    }

    for (const key of Object.keys(data)) {
      if (FORBIDDEN_FRONTMATTER_KEYS.has(key)) {
        fail(skillFile, `Cursor-only frontmatter key: ${key}`);
      }
    }

    records.push({ dir, skillFile, text, name: data.name });
  }

  const skillNames = new Set(records.map((record) => record.name).filter(Boolean));
  for (const record of records) {
    checkForbidden(record.skillFile, record.text);
    checkLinks(record.dir, record.skillFile, record.text, record.text);
    checkCommands(record.skillFile, record.text, skillNames);

    const files = await collectMarkdown(record.dir);
    const texts = [];
    for (const file of files) {
      texts.push({ file, text: file === record.skillFile ? record.text : await readFile(file, "utf8") });
    }
    checkOrphans(record.dir, record.skillFile, files, texts);
  }

  for (const warning of warnings) {
    console.warn(`${warning.file}:${warning.line ?? "?"}: warning: ${warning.message}`);
  }

  if (json) {
    console.log(JSON.stringify({ skills: [...skillNames].sort(), errors }, null, 2));
  } else {
    for (const error of errors) {
      console.error(`${error.file}:${error.line ?? "?"}: ${error.message}`);
    }
    console.log(`${skillNames.size} skill(s) checked, ${errors.length} error(s), ${warnings.length} warning(s)`);
  }

  if (errors.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
