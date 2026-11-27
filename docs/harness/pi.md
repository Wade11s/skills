# pstack on Pi

Every pstack skill points here instead of restating platform rules. Read the section a step
needs; do not copy this file into a skill.

If this file and a skill disagree, this file wins, and the skill is a bug.

This file describes the target state of the pack. Two scripts it names land with later
tickets: `scripts/models.mjs` with `setup-pstack`, and
`pstack-poteto-mode/scripts/todo.sh` with the orchestrator.

## 1. Names and paths

- A skill is invoked as `/skill:pstack-<name>`. `setup-pstack` keeps its upstream name and
  is invoked as `/skill:setup-pstack`.
- A skill that runs another skill reads it and follows it:
  `read <this skill dir>/../pstack-<name>/SKILL.md`. Do not call a skill catalog, and do
  not assume a `Skill` tool exists.
- `` the `**x** skill` `` means the sibling directory `pstack-x`. The short upstream name
  stays in prose; only the command form carries the prefix.
- Sibling relative paths are the only correct cross-skill form. They resolve identically
  after a git checkout (`skills/pstack-pi/pstack-a/`), after `npx skills add`, which
  flattens skills into `.agents/skills/pstack-a/`, and after `pi install`, which keeps the
  tree. A path that leaves the skill's pack breaks in at least one of those.
- An absolute path is needed only when handing work to a delegate that runs in another
  directory. Use the absolute path Pi reported for this skill when it loaded it.

## 2. Cursor to Pi

| Cursor | Pi |
|---|---|
| `Task` with `subagent_type` | Delegation tier, section 4 |
| `model: "<cursor-slug>"` | `provider` + `model` + `thinking`, resolved in section 5 |
| `readonly: true` | tool allowlist: rex `tools: "read,grep,find"`, headless `--tools read,grep,find` |
| `run_in_background: true` | the default; drop the field |
| `environment: "cloud"`, `cloud_base_branch` | local only; use `cwd` for a worktree |
| `resume` | `rex-subagent send <handle> ...` on the same rex run |
| `~/.cursor/rules/pstack-models.mdc` | `~/.pi/agent/pstack-models.json` |
| `~/.cursor/skills/`, `.cursor/skills/` | `~/.agents/skills/`, `.agents/skills/` |
| `agent-transcripts/<uuid>.jsonl` | `$PI_SESSION_FILE`, or the workspace session directory |
| parent vendor check | `$PI_PROVIDER` and `$PI_MODEL` |
| todolist tool | the run's `todo.md`, section 7 |
| `AskQuestion` | numbered options in the reply |
| `/loop` | removed; no mapping |
| `cursor-team-kit`, `control-*`, `/deslop` | the project's verification skill, or the repo's own lint and format |
| Bugbot, Automations, cloud agents, Grok Bot UI | removed |

## 3. Hard rules

1. **Skill calls go through the sibling file.** Read it, then follow it. Never claim a
   skill ran when its `SKILL.md` was not read.
2. **Delegate through a tier.** Use the first tier available in section 4, and say which
   one you used when it is not rex.
3. **The kickoff starts with the operator rules.** The first line of every delegated brief
   is `Read <absolute path>/pstack-poteto-mode/worker.md before anything else.` A delegate
   that does not read it does not have the operator's rules.
4. **Models come from the role config.** Never invent a model id, never fall back to the
   parent model silently, and never exceed the configured thinking level. Section 5.
5. **Read-only is a tool allowlist.** Say it with the tool list, not with adjectives.
6. **Close what you opened.** After reading and verifying a delegate's result, call
   `rex_stop {handle, remove: true}`. An idle tab is not a finished task.
7. **Fan out at most four at once.** Queue the rest. More is allowed only when the user
   asks for it, and the reason is stated.
8. **Cursor-only features are deleted, not emulated.** Do not write "if on Cursor"
   branches. If a step needs a removed feature, drop the step and say so in one line.
9. **Keep the pack discoverable.** No `SKILL.md` at the pack root, no skill deeper than
   three levels, no nested skill. The validator enforces this.

## 4. Delegation

### 4.1 Tiers

Pick the first tier that exists in this session.

**Tier 1: rex-subagent.** Preferred when the `rex_spawn` tool is available.

- Parameters: `prompt`, `name`, `group`, `cwd`, `provider`, `model`, `thinking`, `tools`,
  `excludeTools`.
- One objective per `group`; one role name per `name` (`arena-runner-1`, `judge`,
  `verifier-a`).
- Spawn, do independent local work, then `rex_wait {handles, any: true}`. Process finished
  handles and wait again for the rest.
- Read the full result. `rex-subagent logs <handle>` when the tool result is thin.
- Clean up with `rex_stop {remove: true}` (rule 6).

**Tier 2: headless Pi.** Use when rex is absent.

```sh
pi --mode json -p --no-session \
   [--model <provider/model>] [--thinking <level>] [--tools read,grep,find] \
   [--append-system-prompt <persona-file>] \
   "Read <abs>/pstack-poteto-mode/worker.md first. Task: <task>"
```

- One turn per process. No steering and no resume: a follow-up is a new process with the
  earlier result pasted into the brief.
- Parse the JSON event stream and keep the last assistant message. Cap the result at 50 KB;
  if the delegate needs to return more, have it write a file and return the path.
- Run at most four processes at once, backgrounded, each writing to its own temporary file.
- Non-zero exit or a spawn error is a failed delegate, not an empty result.

**Tier 3: inline.** Use when neither exists. Do the work sequentially, in the parent, and
open the reply with one line saying no delegate was used. Arena candidates still get
separate directories; the parent judges them itself.

### 4.2 The brief

Every brief stands alone. It contains:

1. `Read <abs>/pstack-poteto-mode/worker.md before anything else.`
2. The goal, in the user's terms, and the smallest change that meets it.
3. Scope: paths, named symbols, and what is out of scope.
4. How to verify, with the exact command when one exists.
5. What to report: `PASS`, `ISSUES`, or `BLOCKED`, plus the command and its output for each
   claim. A worker that can prove a defect lists every one it can prove.

Point at files; do not paste file contents. One brief, one output location.

### 4.3 Accepting a result

Read the result against its brief. Rerun the verification the brief named, or the check the
result claims. A missing SHA, command, or output means the result is unverified: respawn
once with the gap named, then record the gap. A gap never counts as a pass.

## 5. Role models

### 5.1 Config

`~/.pi/agent/pstack-models.json`, with `.pi/pstack-models.json` taking precedence.

```json
{
  "version": 1,
  "roles": {
    "feature, refactoring": { "provider": "magpie", "model": "zhipu/glm-5.4", "thinking": "xhigh" },
    "bug-fix": { "provider": "magpie", "model": "zhipu/glm-5.4", "thinking": "xhigh" },
    "arena runners": [
      { "provider": "magpie", "model": "devin/gemini-4-neon", "thinking": "xhigh" },
      { "provider": "another-provider", "model": "another-model", "thinking": "high" }
    ]
  },
  "fallback": {
    "code": { "provider": "magpie", "model": "zhipu/glm-5.4", "thinking": "high" },
    "judgment": { "provider": "magpie", "model": "zhipu/glm-5.4", "thinking": "high" },
    "panel": [{ "provider": "magpie", "model": "devin/gemini-4-neon", "thinking": "high" }],
    "workers": { "provider": "magpie", "model": "zhipu/glm-5.3-flash", "thinking": "medium" }
  },
  "on_unassigned": "ask"
}
```

- The repository ships no model names. Every value is chosen by the user in `setup-pstack`.
- There is no `inherit-parent` and no `auto`. A role either names a model or the step stops.

### 5.2 Role families

| Role | Family |
|---|---|
| `feature, refactoring`, `bug-fix`, `perf-issue`, `hillclimb` | `code` |
| `judgment and prose` | `judgment` |
| `arena runners`, `arena cross-judge pool`, `interrogate reviewers` | `panel` |
| `swarm workers` | `workers` |

### 5.3 Where models come from

Scoped models only: `enabledModels` in the user settings, overridden by the project
settings, using the same format as `--models` (exact id, fuzzy match, case-insensitive
glob, optional `:thinking` suffix). `scripts/models.mjs scope` (shipped with `setup-pstack`) resolves those patterns against
`pi --list-models` and prints the usable set. Never offer the full catalogue.

`--models` is a per-run flag that a skill cannot read. If a user scopes per run, the same
ids must also be in `enabledModels` for setup to see them.

### 5.4 Resolution order

For a role, take the first step that yields a model:

1. The role's entry, if it is in the scoped set.
2. The nearest sibling in the same family: same provider, and the first dash/dot/underscore
   segment of the model basename is the same (`claude`, `glm`, `deepseek`, `gemini`, `k3`).
   Among those, prefer the longest common prefix with the intended id, then the shortest id.
   Pass the intended thinking level through.
3. `fallback[family]`. For a list role, fill the missing seats from `panel` in order; if it
   still falls short, reduce the panel and say so.
4. Stop. Report the role and the fix: run `/skill:setup-pstack`.

Thinking levels are `off`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`. Pi clamps a
level the model does not support; do not pre-validate per model.

An unassigned role with `on_unassigned: "ask"` sends the reader to
`../setup-pstack/SKILL.md` for the role step, then resumes. `"fallback"` uses
`fallback[family]` directly.

### 5.5 Panels

- A list role keeps its order. One delegate per entry.
- A cross-judge must come from a provider other than the parent's: compare with
  `$PI_PROVIDER`. If no entry qualifies, skip the judge and say so.
- Never hardcode a vendor name, model name, or default panel.

## 6. Session facts

Pi gives every shell command these values:

| Variable | Use |
|---|---|
| `PI_SESSION_FILE` | this run's transcript; audit and reflection read it |
| `PI_SESSION_ID` | identify the run in notes and handoffs |
| `PI_PROVIDER`, `PI_MODEL` | parent vendor and model for panel and judge decisions |
| `PI_REASONING_LEVEL` | the parent's current thinking level |

Earlier sessions for the same working directory live under
`~/.pi/agent/sessions/--<cwd with / \ : replaced by ->--/*.jsonl`. Read only this
workspace's directory. Never scan another workspace's sessions.

## 7. Progress: the run's todo file

A reply checklist is not progress. Progress is a file and a script.

- State root: `${PSTACK_STATE_DIR:-.pstack}/<task-slug>/`.
- Files: `todo.md` (steps), `decisions.tsv` (the decision log), optional `notes.md`.
- Script: `../pstack-poteto-mode/scripts/todo.sh` (shipped with the orchestrator), shared by
every phased skill.
- Format:

  ```markdown
  # pstack todo: fix-auth-timeout
  <!-- pstack:todo v1 -->
  - [ ] 01 frame - done means: the drift reproduces in a script
  - [x] 02 repro - repro.ts fails at HEAD (2026-11-27T10:12:00Z)
  ```

- Commands: `init <slug> "<title>"`, `add <slug> "<text>"`, `done <slug> <id> [--note]`,
  `open <slug>`, `check <slug>`.
- A phase is not complete until `todo.sh done` exits 0. When the file and the reply
  disagree, the file wins.
- A resume reads `todo.sh open` before doing anything else.
- Default location is gitignored. A run that must survive the machine, or that a reviewer
  must audit, sets `PSTACK_STATE_DIR=docs/pstack/<slug>` so the file is committed and
  pushed with the work.

## 8. Long runs

`/goal` belongs to the user. Do not create a goal; if one is active, respect its objective
and budget. There is no periodic tick: when a long run needs another audit, the user asks
for it or a delegate's report triggers it.

## 9. Porting checklist

1. Read the upstream skill and the matching section of
   `docs/planning/pstack-for-pi.md`.
2. Create `skills/pstack-pi/pstack-<name>/SKILL.md` with the same name as its directory.
3. Replace platform references using sections 2 to 7. Keep the judgement rules, the reply
   contract, and `disable-model-invocation`.
4. Add `## Delegation` and `## Role models` sections only where the skill delegates.
5. Add `## Todo file` only where the skill runs phases.
6. Update every reference to the skill: `/skill:pstack-<name>`, `../pstack-<name>/`, and
   `**<name>** skill`.
7. Run `npm run validate`. A broken link or an unresolved skill reference is a blocker.
