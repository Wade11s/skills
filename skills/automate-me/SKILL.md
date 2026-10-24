---
name: automate-me
description: "Use for \"automate me\", \"create/update/refresh my -mode skill\", \"turn/capture my preferences or working style into a skill\", or wanting agents to follow how the user works. Drafts or revises a personal -mode skill from the user's choices and available history, with optional authoring and prose companions."
---

# Automate me

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

A guided flow for turning the user's working conventions into a skill agents will follow. The output is one `-mode` skill tailored to them (e.g. `jay-mode`, `priya-mode`).

Mine evidence, author the skill, then tighten its prose. Use **create-skill** or a skill-writing guide and **unslop** when the active catalog provides them. Without them, use the authoring checks in step 4 and a direct plain-language review; disclose the missing companions.

## Flow

### 0. Check for an existing skill

Resolve an existing mode skill matching the user's handle from the active catalog, then check the project's `.agents/skills/` and, with authorized access, `~/.agents/skills/`. Use the host's path-search tools. If one exists, confirm intent through a question capability (`AskQuestion` or plain-text choices and a wait), unless they already said "update my skill" or similar:

- Update the existing skill (default for repeat runs)
- Start fresh (rare, ask why before doing it)

Update mode changes the rest of the flow:
- Step 1 mines only history since the skill was last edited. Use its last Git edit time when available; otherwise confirm a cutoff with the user and state any uncertainty.
- Step 2 asks what's changed or missing, not what to capture from zero.
- Step 4 edits the existing file in place. Preserve sections the user hasn't contradicted. Revise ones with new evidence. Add new sections only for genuinely new rules.

### 1. Mine their history

Discover the active agent's history API or documented, authorized transcript location. Agree on this project's time window before reading. If history is unavailable, use the current conversation and user-provided exports, identify the evidence gap, and rely on direct questions rather than inferred habits. Never search unrelated projects.

Survey recent conversations within that scope for recurring patterns (e.g. last 2-4 weeks). If delegation is available, split a large corpus into slices and pass the authorized source and cutoff to each ordinary worker. Use the resolved `reflect tooling` role, default `inherit-parent`; apply effort only through supported host settings. Otherwise mine slices sequentially and disclose that cross-checks are same-context. Each slice returns patterns with evidence pointers. Default signals worth hunting:

- Response preferences (length, tone, format, "dumb it down" corrections)
- Delegation habits (subagents, models, specialized workflows, parallelism)
- Verification posture (what "done" means, unit tests vs live repro, reviewers)
- Code and prose discipline (style, principles cited, lint/format tools)
- Process conventions (worktrees, commits, PRs, review/merge tooling)
- Meta preferences (fixing skills mid-task, proposing new ones)

Cross-check across slices before elevating a signal. Patterns seen in 2+ slices are high-confidence. Lone signals are weak and usually get dropped.

### 2. Ask the user directly

Mining misses intent that hasn't come up yet. Offer structured choices through the available question capability, or list the same choices in chat and wait.

Shape: one or two questions with 4-6 options each, allowing multiple selections for category questions. Start broad ("Which areas matter most?"), then follow up on selected areas with specific options. After the structured rounds, one free-form chat question catches anything the options missed.

Don't dump 20 questions.

### 3. Cluster findings

Group the combined signals into sections. Common ones (use only what applies):

- **Response style**: length, tone, format.
- **Autonomy**: how much to do without asking, MCP tool use.
- **Understand first**: which skills to reach for when scoping or investigating a change.
- **Subagents**: default, parallelism, model-to-task, specialized workflows.
- **Prose / code discipline**: principles, lint tools, style guides.
- **Review and verify**: repro posture, verification skills, live-testing tools.
- **Process**: git worktrees, commits, PRs, review/merge tooling.
- **Skills**: skill-authoring habits, fix-the-skill-first, proposing new skills.

If **poteto-mode** is in the active catalog, it can be an optional example of granularity, not a source of this user's preferences. Otherwise use the sections above. Keep only rules supported by evidence or the user's explicit choices.

### 4. Draft the skill

Use the catalog's optional authoring guide, or author directly with the checks below. Write the generated `SKILL.md` and every bundled resource in English, including prompts, examples, script comments, and messages. User-facing questions and explanations may follow the user's language. Placement:

- Path: update an existing skill in place within the approved scope. New skills default to `<project-root>/.agents/skills/<handle>-mode/SKILL.md`. Use `~/.agents/skills/<handle>-mode/SKILL.md` only when the user chooses and authorizes global scope.
- Handle: the user's first name or chosen identifier.
- Frontmatter `description`: trigger on their name + `/<handle>-mode` + "work in their style", not on generic keywords like "write code" or "review PR".
- Authoring checks: match frontmatter `name` to the directory, keep `description` as one valid YAML scalar, use ordered steps and checkable completion criteria, and bundle runtime resources under the skill with conditional relative pointers. Resolve companion skills by catalog name, not machine-specific installation paths.
- Frontmatter `disable-model-invocation: true` by default. Opt out only if the user explicitly wants their mode to apply on every turn.

### 5. Iterate on prose

Apply available authoring and **unslop** guidance to every line. Without those companions, cut filler, duplicate rules, and unsupported claims directly and state which review was unavailable.

Show the draft to the user and take feedback. Expect multiple iterations. Cut ruthlessly. A mode skill is not a manual.

### 6. Land it

Leave the approved local draft and summarize what changed. Use a worktree if requested or required by the project. Commit, push, or open a PR only with the user's applicable authorization; never treat drafting a mode as permission to publish private history.

## Guardrails

- **Don't overfit to one conversation.** A preference stated once and contradicted another time is noise. Require multiple instances before codifying it.
- **Don't be clever.** Restating other skills' contents, inventing metaphors, or writing "poetic" prose for an agent reader is cost without benefit. Keep it operational.
- **Reference, don't inline.** Name optional skills through the active catalog and say what to do if absent. Use relative paths only for bundled resources, and explicit conditional pointers for project docs. Do not bake a personal installation path into the draft.
- **Keep sections minimal.** Only add a section if the user has a specific, non-default rule there. "Communicate clearly" is not a section. "Short paragraphs. Tables when comparing options. Bullets only when items are genuinely parallel." is.
- **Name conventions generic.** Use "the user" or "the human" in imperatives, not the author's first name.
- **Don't force symmetry.** If a user has no process rules worth writing down, skip the Process section entirely.

## Evaluation

A `-mode` skill is subjective output. A `create-skill`-style test/iterate benchmark loop isn't useful here. Vibe-check with the user: does it read like them? Did it miss anything? Then hand off the local skill for the user's chosen publication workflow.

Run a description-optimization loop only if the skill's trigger accuracy turns out to be a problem in practice.

## When not to use

- User wants a task-specific skill (not working conventions): use an available authoring guide or author directly, without history mining.
- User wants to capture one narrow workflow (e.g. "how I write commit messages"). That's a regular skill, not a mode skill.
