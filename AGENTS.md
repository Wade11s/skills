# AGENTS.md

Rules for this repository. They apply to humans and agents equally.

## What this repository is

A personal collection of agent skills for Pi, laid out the way
[vercel-labs/skills](https://github.com/vercel-labs/skills) discovers skills, so the same
files install with `npx skills add` and with `pi install`.

The first pack is `pstack-for-pi`, a port of [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack)
adapted to Pi. Other packs may be added later; every rule below applies to all of them.

## Layout

```
skills/<pack>/<skill>/SKILL.md
skills/<pack>/<skill>/{playbooks,references,scripts,assets}/...
scripts/skill-manifest.json      # every skill the pack intends to ship
```

The manifest is the release target. During an incremental port, references to a declared
skill that has no directory yet are allowed, so a branch can land before its neighbours.
A discovered skill that is not declared is an error, and `--strict` additionally requires
every declared skill to exist.

- A pack is a directory directly under `skills/`. Today that is `skills/pstack-pi/`.
- A skill is a directory containing `SKILL.md`, at most three levels below `skills/`.
- **Never put `SKILL.md` in a pack directory.** Discovery treats it as the skill for the
  whole subtree, so every skill below it disappears. `scripts/validate-skills.mjs` fails
  when this happens.
- Skill folders never nest. A skill's supporting files live inside the skill folder.

## Naming

- Skill directory: `pstack-<upstream-name>`.
- Frontmatter `name` equals the directory name. `scripts/validate-skills.mjs` enforces it.
- Two exceptions: `setup-pstack` keeps its upstream name, directory and frontmatter; the
  help skill is `pstack-help` (upstream `poteto-help`) because the shorter command is the
  one users type.
- Names are lowercase letters, digits, and hyphens, at most 64 characters. They never
  start or end with a hyphen and never contain two in a row.

## Platform rules

Runtime rules live in [`docs/harness/pi.md`](docs/harness/pi.md): delegation tiers, role
models, session variables, and the todo file. A skill points there instead of restating
them. Repository-level rules stay in this file.

## Frontmatter

Required: `name`, `description`. Supported optional fields: `license`,
`compatibility`, `metadata`, `allowed-tools`, `disable-model-invocation`.

- `description` states what the skill does and when to use it, at most 1024 characters.
- Keep `disable-model-invocation: true` on skills that are meant to be invoked
  explicitly. Pi then leaves them out of the system prompt entirely, so they cost no
  context until someone runs `/skill:<name>`.
- No Cursor-only keys: `icon`, `color`, `paths`, `alwaysApply`.

## References between skills

- A link inside a skill is relative to that skill: `playbooks/foo.md`,
  `references/bar.md`, `../pstack-arena/SKILL.md`.
- Sibling references are the only correct cross-skill path. They work in a git checkout,
  after `npx skills add` (which flattens each skill into `.agents/skills/<name>/`), and
  after `pi install`.
- `the **x** skill` means the sibling directory `pstack-x`. Write the short upstream name
  in prose; write the command as `/skill:pstack-x`.
- `setup-pstack` is referenced as `/skill:setup-pstack` and `../setup-pstack/SKILL.md`.

## Forbidden tokens

The port targets Pi only. Cursor-only names must not survive:

`Task`, `subagent_type`, `AskQuestion`, `run_in_background`, `environment: "cloud"`,
`cursor-team-kit`, `control-ui`, `control-cli`, `control-notes`, `/deslop`, `Bugbot`,
`api2.cursor.sh`, `update_state`, `SendToUser`, `~/.cursor/`, `.cursor/`, `agent-transcripts`,
`inherit-parent`, `create-skill`, `/loop`, and hardcoded vendor model slugs
(`claude-*`, `gemini-*`, `grok-*`).

Platform notes belong in `docs/harness/pi.md`, not in skill bodies.

## Upstream

- Upstream: `cursor/plugins`, directory `pstack`, version `0.15.48`, commit `b7b93c3`.
- Porting rule: keep upstream structure, order, and judgement. Change platform
  semantics only: tool names, paths, model config, progress mechanism, and the removal of
  Cursor-only features. Do not rewrite prose that already reads correctly on Pi.
- `docs/planning/pstack-for-pi.md` records every adaptation decision and the per-file
  change list. Read it before porting a skill.
- Attribution lives in `NOTICE.md`. Do not remove it, and do not add per-file copyright
  headers.

## Commands

```bash
npm run validate                          # scripts/validate-skills.mjs
npm run validate -- --strict              # release gate: every declared skill exists
npx skills add ./ --list                  # what the skills CLI sees
pi -e . -p '/skill:pstack-bro say hi'     # load the package for one run
```

CI runs the validator on every push and pull request.

## Adding or porting a skill

1. Read the upstream skill and the matching section of `docs/planning/pstack-for-pi.md`.
2. Add the skill to `scripts/skill-manifest.json`, then create
   `skills/pstack-pi/pstack-<name>/SKILL.md` with the same name as its directory.
3. Rewrite platform references using the harness rules. Keep the judgement rules.
4. Update every reference to it: `/skill:pstack-<name>` in prose, `../pstack-<name>/` in
   links, and the `**<name>** skill` mentions.
5. Run `npm run validate`. A local link that no longer resolves is a blocker, not a warning.

## Issue workflow

Issues live in this repository's GitHub Issues. The tracker configuration and label
vocabulary are in `docs/agents/issue-tracker.md`.
