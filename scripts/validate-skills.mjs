#!/usr/bin/env node
/**
 * Validate every skill in this repository against the rules recorded in AGENTS.md.
 *
 * The checks mirror what the `skills` CLI and Pi accept at install time, plus the
 * repository rules that keep a ported pack coherent:
 *
 *   1. discovery: no SKILL.md shadows a pack, no skill deeper than 3 levels,
 *      no nested skill inside a skill
 *   2. identity: name matches the directory, prefixed unless allowlisted
 *   3. frontmatter: required fields, length limits, no Cursor-only keys
 *   4. forbidden tokens: no leftover Cursor-only tool, path, model, or command names,
 *      in SKILL.md and in every supporting markdown file
 *   5. references: local links resolve and stay installable, `/skill:*` commands
 *      resolve, `**x** skill` resolves to a sibling skill
 *   6. orphans: every playbook, reference, and root markdown file is reachable
 *
 * Usage: node scripts/validate-skills.mjs [--json]
 */

import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const MAPPING_FILE = path.join(
  SKILLS_DIR,
  "pstack-pi",
  "pstack-poteto-mode",
  "references",
  "harness.md",
);
const MANIFEST = path.join(ROOT, "scripts", "skill-manifest.json");
const NAME_PREFIX = "pstack-";
const NAME_ALLOWLIST = new Set(["setup-pstack"]);
const MAX_CONTAINER_DEPTH = 3;
const MAX_SCAN_DEPTH = 8;
const SKIP_DIRS = new Set([".git", "node_modules", "assets", "scripts"]);
const FORBIDDEN_FRONTMATTER_KEYS = new Set(["icon", "color", "paths", "alwaysApply"]);

const FORBIDDEN_TOKENS = [
  [/\bsubagent_type\b/, "Cursor subagent_type"],
  [/`Task`/, "Cursor Task tool"],
  [/\bTask\s*\(/, "Cursor Task tool"],
  [/\bAskQuestion\b/, "Cursor AskQuestion tool"],
  [/\brun_in_background\b/, "Cursor run_in_background flag"],
  [/\benvironment:\s*"?cloud"?/, "Cursor cloud execution"],
  [/\bcursor-team-kit\b/, "cursor-team-kit plugin"],
  [/\bcontrol-(?:ui|cli|notes)\b/, "control-* plugin"],
  [/\/deslop\b/, "cursor-team-kit /deslop"],
  [/\bBugbot\b/, "Cursor Bugbot"],
  [/\bapi2\.cursor\.sh\b/, "Cursor automations endpoint"],
  [/\bSendToUser\b|\bupdate_state\b/, "Cursor automations API"],
  [/\.cursor\//, "Cursor config path"],
  [/agent-transcripts\//, "Cursor transcript path"],
  [/\binherit-parent\b/, "removed model alias"],
  [/\bcreate-skill\b/, "Cursor built-in create-skill"],
  [/(?<![\w/])\/loop\b/, "Cursor /loop command"],
  [/\bclaude-(?:opus|sonnet|haiku|fable)-\d/, "Cursor model slug"],
  [/\bclaude-?\d/, "Cursor model slug"],
  [/\bgemini-\d/, "Cursor model slug"],
  [/\bgrok-\d/, "Cursor model slug"],
  [/\bopus 5\.5|\bfable 5\.2|\bgemini 4\b/i, "Cursor model name"],
];

const errors = [];

function fail(file, message, line) {
  errors.push({ file: path.relative(ROOT, file) || ".", line, message });
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

function stripComment(value) {
  if (value.startsWith('"') || value.startsWith("'")) return value;
  const index = value.indexOf(" #");
  return index === -1 ? value : value.slice(0, index);
}

export function parseFrontmatter(input) {
  const text = input.replace(/^\uFEFF/, "");
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
      while (
        i + 1 < lines.length &&
        (/^\s/.test(lines[i + 1]) || lines[i + 1].trim() === "")
      ) {
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

    const scalar = unquote(stripComment(rest));
    const continuation = takeIndented()
      .map((entry) => entry.trim())
      .filter(Boolean);
    data[key] = continuation.length > 0 ? `${scalar} ${continuation.join(" ")}`.trim() : scalar;
  }

  return { data, body, error: null };
}

async function listMarkdown(dir, options = {}) {
  const out = [];
  const skip = options.skip ?? SKIP_DIRS;
  const walk = async (current) => {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.name.startsWith(".") || skip.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.name.endsWith(".md")) {
        out.push(full);
      }
    }
  };
  await walk(dir);
  return out;
}

function loadManifest() {
  if (!existsSync(MANIFEST)) {
    fail(MANIFEST, "skill manifest is missing");
    return new Set();
  }
  let data;
  try {
    data = JSON.parse(readFileSync(MANIFEST, "utf8"));
  } catch (error) {
    fail(MANIFEST, `skill manifest is not valid JSON: ${error.message}`);
    return new Set();
  }
  if (!Array.isArray(data.skills)) {
    fail(MANIFEST, "skill manifest must contain a skills array");
    return new Set();
  }
  const names = new Set();
  for (const name of data.skills) {
    if (typeof name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) {
      fail(MANIFEST, `invalid skill name in manifest: ${JSON.stringify(name)}`);
      continue;
    }
    if (!name.startsWith(NAME_PREFIX) && !NAME_ALLOWLIST.has(name)) {
      fail(MANIFEST, `manifest name must start with "${NAME_PREFIX}" or be allowlisted: ${name}`);
      continue;
    }
    if (names.has(name)) {
      fail(MANIFEST, `duplicate skill name in manifest: ${name}`);
      continue;
    }
    names.add(name);
  }
  return names;
}

async function findSkills() {
  const skills = [];
  if (!existsSync(SKILLS_DIR)) {
    fail(SKILLS_DIR, "skills/ does not exist");
    return skills;
  }
  if (existsSync(path.join(SKILLS_DIR, "SKILL.md"))) {
    fail(SKILLS_DIR, "skills/SKILL.md shadows every skill below it");
  }

  const nestedSkills = async (dir) => {
    const found = [];
    const walk = async (current) => {
      const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules") {
          continue;
        }
        const full = path.join(current, entry.name);
        if (existsSync(path.join(full, "SKILL.md"))) {
          found.push(full);
          continue;
        }
        await walk(full);
      }
    };
    await walk(dir);
    return found;
  };

  const walk = async (dir, depth) => {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name === "node_modules") {
        continue;
      }
      const child = path.join(dir, entry.name);
      if (existsSync(path.join(child, "SKILL.md"))) {
        if (depth > MAX_CONTAINER_DEPTH) {
          fail(child, `skill is nested deeper than ${MAX_CONTAINER_DEPTH} levels`);
          continue;
        }
        const nested = await nestedSkills(child);
        for (const nestedSkill of nested) {
          fail(nestedSkill, "skill folders may not contain another SKILL.md");
        }
        if (depth === 1 && nested.length > 0) {
          fail(path.join(child, "SKILL.md"), "SKILL.md at the pack root shadows every skill below it");
          continue;
        }
        skills.push(child);
        continue;
      }
      if (depth >= MAX_SCAN_DEPTH) continue;
      await walk(child, depth + 1);
    }
  };

  await walk(SKILLS_DIR, 1);
  return skills;
}

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

function pendingSkillLink(resolved, declared) {
  // Only a direct skill path can be pending: skills/<pack>/<declared-name>/...
  // Anything else that happens to contain a declared name is a broken link.
  const relative = path.relative(SKILLS_DIR, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return false;
  const segments = relative.split(path.sep);
  if (segments.length < 2) return false;
  const name = segments[1];
  if (!declared.has(name)) return false;
  return !existsSync(path.join(SKILLS_DIR, segments[0], name));
}

function isInside(parent, target) {
  const relative = path.relative(parent, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function localLinkTargets(file, text) {
  const targets = [];
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
      targets.push({ target: clean, display: target, line: index + 1 });
    }
  }
  return targets;
}

function checkForbidden(file, text) {
  // The one place Cursor names may appear is the mapping block the harness owns.
  let inMapping = false;
  let blocks = 0;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/<!--\s*pstack:mapping:start\s*-->/.test(line)) {
      if (file !== MAPPING_FILE) {
        fail(file, "mapping block is only allowed in references/harness.md", i + 1);
      }
      if (inMapping) {
        fail(file, "nested mapping block", i + 1);
      }
      inMapping = true;
      blocks += 1;
      continue;
    }
    if (/<!--\s*pstack:mapping:end\s*-->/.test(line)) {
      if (!inMapping) {
        fail(file, "mapping block ends without a start", i + 1);
      }
      inMapping = false;
      continue;
    }
    if (inMapping) continue;
    for (const [pattern, label] of FORBIDDEN_TOKENS) {
      const match = pattern.exec(line);
      if (match) {
        fail(file, `forbidden token (${label}): ${match[0]}`, i + 1);
      }
    }
  }
  if (inMapping) {
    fail(file, "mapping block is not closed", lines.length);
  }
  if (file === MAPPING_FILE && blocks !== 1) {
    fail(file, `expected exactly one mapping block, found ${blocks}`);
  }
}

function checkReferences(file, text, skillNames) {
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
      const name = match[1];
      if (!skillNames.has(name) && !skillNames.has(`${NAME_PREFIX}${name}`)) {
        fail(
          file,
          `skill reference does not resolve: **${name}** skill (expected ${NAME_PREFIX}${name})`,
          index + 1,
        );
      }
    }
  }
}

function titleOf(basename) {
  return basename.replace(/\.md$/, "").replace(/-/g, " ");
}

function mentionsWord(text, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function checkOrphans(skillDir, skillFile, skillText, files, links) {
  for (const markdown of files) {
    if (markdown === skillFile) continue;
    const relative = path.relative(skillDir, markdown).split(path.sep).join("/");
    const inReferences = relative.startsWith("references/");
    const inPlaybooks = relative.startsWith("playbooks/");
    const atRoot = !relative.includes("/");
    if (!inReferences && !inPlaybooks && !atRoot) continue;

    if (links.has(markdown)) continue;

    if (inPlaybooks) {
      const title = titleOf(path.basename(markdown));
      const kebab = path.basename(markdown, ".md");
      if (mentionsWord(skillText, title) || mentionsWord(skillText, kebab)) continue;
    } else if (atRoot) {
      if (mentionsWord(skillText, path.basename(markdown))) continue;
    }

    const where = inReferences ? "links" : "mentions";
    fail(markdown, `orphan file: SKILL.md neither ${where} nor covers ${relative}`);
  }
}

async function main() {
  const json = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const declared = loadManifest();
  const skills = await findSkills();
  const records = [];

  for (const dir of skills) {
    const skillFile = path.join(dir, "SKILL.md");
    const text = (await readFile(skillFile, "utf8")).replace(/^\uFEFF/, "");
    const { data, error } = parseFrontmatter(text);
    const directory = path.basename(dir);

    if (error) {
      fail(skillFile, error);
      continue;
    }

    if (typeof data.name !== "string" || data.name.trim() === "") {
      fail(skillFile, "frontmatter is missing `name`");
    } else {
      if (data.name !== directory) {
        fail(skillFile, `name "${data.name}" must equal the skill directory "${directory}"`);
      }
      if (!NAME_ALLOWLIST.has(directory) && !directory.startsWith(NAME_PREFIX)) {
        fail(skillFile, `skill directory must start with "${NAME_PREFIX}" or be allowlisted: ${directory}`);
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

  const discovered = new Set(records.map((record) => record.name).filter(Boolean));
  const skillNames = new Set([...declared, ...discovered]);

  for (const record of records) {
    if (!declared.has(record.name)) {
      fail(record.skillFile, `skill is not declared in scripts/skill-manifest.json: ${record.name}`);
    }
  }
  if (strict) {
    for (const name of declared) {
      if (!discovered.has(name)) {
        fail(MANIFEST, `declared skill has no directory yet: ${name}`);
      }
    }
  }

  for (const record of records) {
    const files = await listMarkdown(record.dir);
    const texts = new Map();
    for (const file of files) {
      texts.set(file, (await readFile(file, "utf8")).replace(/^\uFEFF/, ""));
    }

    const links = new Set();
    for (const [file, text] of texts) {
      checkForbidden(file, text);
      checkReferences(file, text, skillNames);

      for (const { target, display, line } of localLinkTargets(file, text)) {
        const resolved = path.resolve(path.dirname(file), target);
        if (!isInside(SKILLS_DIR, resolved)) {
          fail(file, `link escapes the pack and breaks after install: ${display}`, line);
          continue;
        }
        if (!existsSync(resolved)) {
          if (pendingSkillLink(resolved, declared)) continue;
          fail(file, `link target does not exist: ${display}`, line);
          continue;
        }
        if (path.extname(resolved) === ".md") {
          links.add(resolved);
        } else {
          for (const nested of await listMarkdown(resolved)) links.add(nested);
        }
      }
    }

    checkOrphans(record.dir, record.skillFile, record.text, files, links);
  }

  if (json) {
    process.stdout.write(`${JSON.stringify({ skills: [...discovered].sort(), errors }, null, 2)}\n`);
  } else {
    for (const error of errors) {
      console.error(`${error.file}:${error.line ?? "?"}: ${error.message}`);
    }
    process.stdout.write(
      `${discovered.size}/${declared.size} skill(s) present, ${errors.length} error(s)\n`,
    );
  }

  // Set the code instead of calling process.exit(): exiting immediately can cut off
  // pending stdout writes when the output is a pipe.
  if (errors.length > 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
