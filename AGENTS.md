# Working in This Repository

## Purpose and Scope

This repository publishes reusable agent skills. Treat each skill as a small
product: its trigger, instructions, supporting files, and evaluations must
describe one coherent behavior.

- Active skills live in `skills/<skill-name>/`.
- Retired skills live in `deprecated/`; change them only when the task
  explicitly concerns a retired skill.
- Keep a change scoped to the requested skill. Preserve attribution and license
  notes in adapted or forked skills.
- Do not add credentials, private transcripts, machine-specific paths, or
  generated output.

## Repository Map

Files are optional unless marked required.

| Path | Role |
|---|---|
| `skills/<name>/SKILL.md` | Required entry point, trigger contract, and operating instructions |
| `skills/<name>/references/` | Detailed material loaded only for the branch that needs it |
| `skills/<name>/templates/` | Files or task bodies the skill copies or adapts |
| `skills/<name>/scripts/` | Executable helpers and their tests |
| `skills/<name>/assets/` | Static runtime assets |
| `skills/<name>/evals/evals.json` | Behavioral evaluation cases |
| `skills/<name>/evals/trigger-evals.json` | Positive and negative trigger cases |
| `skills/<name>/agents/openai.yaml` | Optional interface metadata |
| `README.md` | Installation instructions and active-skill index |
| `CHANGELOG.md` | Dated, user-visible skill changes |

Keep skill-local material inside that skill. Share a file across skills only
when it has one clear owner and the consumers link to that owner.

## Change Workflow

### 1. Establish the current contract

Before editing:

1. Run `git status --short`.
2. List the target skill's files and read its complete `SKILL.md`.
3. Read every referenced file affected by the requested behavior.
4. Inspect existing evaluations and tests before changing a trigger, workflow,
   script, or output contract.

Do not overwrite unrelated work already present in the worktree.

### 2. Design the smallest coherent change

Identify:

- the behavior or routing decision that must change;
- the single source of truth for each affected rule;
- every supporting file, evaluation, and index coupled to that rule.

Fix the rule rather than adding a one-off exception for the reported example.
Prefer editing an existing authority over repeating the same instruction in
several files.

### 3. Edit the skill

Every `SKILL.md` must start with valid YAML front matter containing:

```yaml
---
name: skill-directory-name
description: What the skill does and the distinct situations that should invoke it.
---
```

The `name` must exactly match the kebab-case directory name.

Treat `description` as routing logic:

- state the capability first;
- name each genuinely distinct trigger branch;
- distinguish neighboring skills when their scopes could overlap;
- keep implementation detail in the body.

Treat the body as an executable runbook:

- use ordered steps for workflows and explicit completion criteria;
- keep definitions, rules, and caveats beside the step that uses them;
- move branch-specific detail to `references/` and link it from the decision
  point;
- keep each rule in one authoritative location;
- write direct, positive instructions instead of vague advice;
- state assumptions and the working directory for commands that depend on
  either;
- make examples copy-pasteable and use paths relative to the skill directory
  where practical.

Use short Markdown sections, actionable bullets, fenced code blocks for
commands, and backticks for paths, commands, and metadata keys. Prefer ASCII
punctuation unless the skill's content requires otherwise.

### 4. Synchronize coupled artifacts

Update only the rows made relevant by the change:

| Change | Required follow-up |
|---|---|
| Add, remove, rename, or materially re-scope a skill | Update the active or deprecated list in `README.md` |
| Change when a skill should run | Update `description` and `evals/trigger-evals.json` when present |
| Change observable workflow behavior | Update `evals/evals.json` and affected templates or references when present |
| Change a script interface or output | Update its examples, callers, and tests |
| Change user-visible skill behavior | Add a dated entry to `CHANGELOG.md` |
| Change display metadata | Update `agents/openai.yaml` when present |

Do not add an eval, script, reference, or metadata file merely to make every
skill look structurally identical.

### 5. Validate proportionally

There is no repository-wide build. Run the narrowest checks that exercise every
changed artifact.

Always:

```bash
git diff --check
git diff --stat
git diff
```

Then verify:

- front matter is valid YAML and `name` matches the directory;
- every changed relative link and referenced file resolves;
- commands use real paths, flags, and stated prerequisites;
- templates contain all placeholders and instructions expected by consumers;
- `README.md` and `CHANGELOG.md` are synchronized when required.

Use the applicable executable checks:

```bash
# JSON files
python3 -m json.tool skills/<name>/evals/evals.json >/dev/null
python3 -m json.tool skills/<name>/evals/trigger-evals.json >/dev/null

# skill-doctor Python tests
python3 -m unittest discover -s skills/skill-doctor/scripts -p 'test_*.py'

# Changed JavaScript modules
node --check skills/<name>/scripts/<file>.mjs
```

If behavior depends on a helper script, also run one representative success
case and one relevant failure or boundary case from the documented working
directory. Do not use the published installation command
`bunx skills add Wade11s/skills` as validation for uncommitted local changes.

## Definition of Done

A change is complete when:

- the requested behavior is implemented in the correct source of truth;
- trigger wording, runbook steps, references, templates, and evaluations agree;
- all affected links and command examples have been checked;
- applicable tests pass, and any unavailable check is reported;
- the final diff contains no unrelated edits or generated artifacts.

When reporting completion, summarize the behavior change and list the validation
commands run. When asked to commit, use a short focused subject such as
`Clarify Orca loop trigger boundaries`.
