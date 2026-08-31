---
name: setup-multica-issue-tracker
description: Configure the current repo to use Multica as the project issue tracker for Matt Pocock engineering skills. Use when the user wants to keep upstream mattpocock/skills updated but override only docs/agents/issue-tracker.md with Multica CLI instructions.
---

# Setup Multica Issue Tracker

Configure this repo to use Multica as the issue tracker consumed by `to-prd`, `to-issues`, and `triage`.

This is an overlay for `setup-matt-pocock-skills`, not a replacement for it. Only manage Multica issue tracker configuration:

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

For Multica repos, `docs/agents/triage-labels.md` is still useful. Treat its right-hand column as both the canonical `triage_role` metadata value and the Multica label name to apply when the workflow says to add a label.

### 2. Confirm Workspace

Check authentication with `multica auth status`. If the token is invalid, expired, or missing, tell the user to run `multica login`. Do not run `multica login` automatically because it creates a new token.

Ask for the Multica workspace id or slug unless it is already clear from the conversation.

Ask whether commands should:

- rely on `multica workspace switch <id-or-slug>`, or
- include `--workspace-id <id>` in command examples.

Default to `multica workspace switch <id-or-slug>` when the user has no preference.

### 3. Resolve Project

Ask whether issues should be scoped to a Multica project.

If the user gives a project id, use it directly in command examples with `--project <project-id>`.

If the user gives a project name or says to infer it from the repo, use the CLI:

- `multica project list --output json`
- `multica project resource list <project-id> --output json`

For a project name, match against project `title`. For repo inference, match project resources against the current repo remote. A `github_repo` resource with `resource_ref.url` matching the current Git remote identifies the project. Normalize common GitHub URL forms when comparing, such as `git@github.com:OWNER/REPO.git` and `https://github.com/OWNER/REPO.git`.

If no project can be resolved, keep the tracker workspace-scoped and tell the user that issue commands will omit `--project`.

### 4. Write Issue Tracker Doc

Create `docs/agents/` if needed.

Write `docs/agents/issue-tracker.md` from `issue-tracker-multica.md`, customized with the workspace choice and project choice if needed.

Translate Matt Pocock's triage roles into Multica labels when the workflow asks to apply or remove a label. The Multica CLI supports workspace labels with `multica label create/list/get/update/delete` and per-issue labels with `multica issue label add/list/remove`.

Also write the same value into Multica metadata under `triage_role`. The current CLI supports first-class issue filtering by metadata via `multica issue list --metadata triage_role=<role>`, but does not expose an equivalent `issue list --label` filter. Use metadata as the query/filter source of truth and labels as the visible issue label surface.

### 5. Update Agent Config

If `CLAUDE.md` exists, update only its `## Agent skills` > `### Issue tracker` summary.

Else if `AGENTS.md` exists, update only its `## Agent skills` > `### Issue tracker` summary.

Use this summary:

```markdown
Issues and PRDs live in Multica. See `docs/agents/issue-tracker.md`.
```

If neither file exists, do not create one unless the user asks.

### 6. Verify

Confirm:

- `docs/agents/issue-tracker.md` exists
- it contains Multica create/read/list/comment/status commands
- it contains project discovery and optional `--project <project-id>` commands
- it documents `triage_role` metadata
- it documents Multica label create/list/apply/remove commands
- it warns agents to serialize mutating commands against the same issue
- the agent config file was updated only if one already existed

Tell the user that `/to-prd`, `/to-issues`, and `/triage` will now use Multica through `docs/agents/issue-tracker.md`.
