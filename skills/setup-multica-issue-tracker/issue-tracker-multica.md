# Issue tracker: Multica

Issues and PRDs for this repo live as Multica issues. Use the `multica` CLI for issue tracker operations.

## Setup

- **Authenticate**: `multica login`
- **Check auth**: `multica auth status`
- **Select workspace**: `multica workspace switch <id-or-slug>`
- **Use a workspace for one command**: pass `--workspace-id <id>`

## Conventions

- **Create an issue**: `multica issue create --title "..." --description "..."`
- **Read an issue**: `multica issue get <id> --output json`
- **List issues**: `multica issue list --output json`
- **Comment on an issue**: `multica issue comment add <id> --content "..."`
- **Read comments**: `multica issue comment list <id>`
- **Set triage role metadata**: `multica issue metadata set <id> --key triage_role --value <role>`
- **List by triage role**: `multica issue list --metadata triage_role=<role> --output json`
- **Close / won't-fix**: post an explanation with `multica issue comment add <id> --content "..."`, set `triage_role` to `wontfix`, then run `multica issue status <id> cancelled`

Use Multica metadata as the source of truth for triage roles. Do not treat Multica status as authoritative because agents may also move issues through execution statuses like `in_progress` and `done`.

## Triage Roles

Use `triage_role` metadata as the source of truth:

- `needs-triage`
- `needs-info`
- `ready-for-agent`
- `ready-for-human`
- `wontfix`

## Optional Status Mirror

For board visibility, you may mirror the triage role into a coarse Multica status:

- `needs-triage` -> `backlog`
- `needs-info` -> `blocked`
- `ready-for-agent` -> `todo`
- `ready-for-human` -> `todo`
- `wontfix` -> `cancelled`

## When a skill says "publish to the issue tracker"

Create a Multica issue, then set its `triage_role` metadata if the skill specifies a role.

## When a skill says "fetch the relevant ticket"

Run:

```bash
multica issue get <id> --output json
multica issue comment list <id>
```
