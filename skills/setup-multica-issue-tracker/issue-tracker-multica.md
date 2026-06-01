# Issue tracker: Multica

Issues and PRDs for this repo live as Multica issues. Use the `multica` CLI for all operations.

## Conventions

- **Authenticate**: `multica login`. Check with `multica auth status`.
- **Select workspace**: `multica workspace switch <id-or-slug>`. For one-off commands, pass `--workspace-id <id>`.
- **Create an issue**: `multica issue create --title "..." --description "..."`. Use a heredoc for multi-line descriptions.
- **Read an issue**: `multica issue get <id> --output json`, then fetch comments with `multica issue comment list <id>`.
- **List issues**: `multica issue list --output json` with appropriate `--metadata triage_role=<role>` filters.
- **Comment on an issue**: `multica issue comment add <id> --content "..."`
- **Apply / change triage role**: `multica issue metadata set <id> --key triage_role --value "<role>"`
- **Close**: `multica issue status <id> cancelled`. For won't-fix, post the explanation first with `multica issue comment add <id> --content "..."`, set `triage_role` to `wontfix`, then close.

Multica does not use GitHub/GitLab-style labels for this workflow. When a skill says "apply a label" or refers to `docs/agents/triage-labels.md`, treat the mapped value as the Multica metadata value for `triage_role`.

`docs/agents/triage-labels.md` may still call these values labels because the upstream skills are tracker-agnostic. In a Multica repo, read that file as a role mapping table, not as instructions to create labels.

Use these canonical metadata values unless `docs/agents/triage-labels.md` explicitly maps them to different strings:

- `needs-triage`
- `needs-info`
- `ready-for-agent`
- `ready-for-human`
- `wontfix`

Do not create Multica labels to mirror these roles. If a role cannot be represented with metadata, stop and ask the user how to map it.

For board visibility only, you may also mirror triage roles into coarse Multica statuses:

- `needs-triage` -> `backlog`
- `needs-info` -> `blocked`
- `ready-for-agent` -> `todo`
- `ready-for-human` -> `todo`
- `wontfix` -> `cancelled`

Do not treat Multica status as the source of truth for triage. Agents may also move issues through execution statuses like `in_progress` and `done`.

## When a skill says "publish to the issue tracker"

Create a Multica issue.

## When a skill says "fetch the relevant ticket"

Run `multica issue get <id> --output json` and `multica issue comment list <id>`.
