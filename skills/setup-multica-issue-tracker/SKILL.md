---
name: setup-multica-issue-tracker
description: Configure the current repo to use Multica as the project issue tracker for Matt Pocock engineering skills. Use when the user wants to keep upstream mattpocock/skills updated but override only docs/agents/issue-tracker.md with Multica CLI instructions.
---

# Setup Multica Issue Tracker

Configure this repo to use Multica as the issue tracker consumed by `to-prd`, `to-issues`, and `triage`.

This is an overlay for `setup-matt-pocock-skills`. Only manage Multica issue tracker configuration:

- Write `docs/agents/issue-tracker.md`
- Optionally update the Issue tracker summary in `CLAUDE.md` or `AGENTS.md`
- Do not edit `docs/agents/triage-labels.md` or `docs/agents/domain.md`

## Process

### 1. Inspect

Read the current repo state:

- `docs/agents/`
- `docs/agents/issue-tracker.md`
- `docs/agents/triage-labels.md`
- `docs/agents/domain.md`
- `CLAUDE.md`
- `AGENTS.md`

If `docs/agents/triage-labels.md` or `docs/agents/domain.md` is missing, tell the user that `/setup-matt-pocock-skills` should normally be run first. Continue if they only want the Multica issue tracker file.

### 2. Confirm Workspace

Ask for the Multica workspace id or slug unless it is already clear from the conversation.

Ask whether commands should:

- rely on `multica workspace switch <id-or-slug>`, or
- include `--workspace-id <id>` in command examples.

Default to `multica workspace switch <id-or-slug>` when the user has no preference.

### 3. Write Issue Tracker Doc

Create `docs/agents/` if needed.

Write `docs/agents/issue-tracker.md` from `issue-tracker-multica.md`, customized with the workspace choice.

Use Multica metadata as the source of truth for triage roles:

- key: `triage_role`
- values: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`

Multica status may be mirrored for board visibility, but it is not authoritative because agents may also move issues through execution statuses like `in_progress` and `done`.

### 4. Update Agent Config

If `CLAUDE.md` exists, update only its `## Agent skills` > `### Issue tracker` summary.

Else if `AGENTS.md` exists, update only its `## Agent skills` > `### Issue tracker` summary.

Use this summary:

```markdown
Issues and PRDs live in Multica. See `docs/agents/issue-tracker.md`.
```

If neither file exists, do not create one unless the user asks.

### 5. Verify

Confirm:

- `docs/agents/issue-tracker.md` exists
- it contains Multica create/read/list/comment/status commands
- it documents `triage_role` metadata
- the agent config file was updated only if one already existed

Tell the user that `/to-prd`, `/to-issues`, and `/triage` will now use Multica through `docs/agents/issue-tracker.md`.
