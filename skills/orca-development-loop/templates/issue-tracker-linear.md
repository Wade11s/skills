# Issue tracker: Linear through Orca

Seed for `docs/agents/issue-tracker.md`. `/setup-matt-pocock-skills` records Linear as an "other" tracker in freeform prose; this file is that prose, already written. Copy it to `docs/agents/issue-tracker.md` and edit the placeholders.

Issues and specs for this repo live in Linear team `<TEAM-KEY>`, project `<project or none>`. Every operation goes through the `orca linear` CLI, which holds the workspace connection; no direct Linear API or MCP call is needed.

## Conventions

- **Create an issue**: `orca linear create --title "..." --team <TEAM-KEY> --body-file - --json`, reading a multi-line body from stdin. Add `--project`, `--label`, `--parent <id>`, `--state`, `--priority`, `--estimate` as needed.
- **Create or update in one call**: `orca linear save-issue [<id>] --team <TEAM-KEY> --title ... --description ...`.
- **Read an issue**: `orca linear issue <id> --full --json` for body, comments, children, relations, and attachments. `--comments`, `--children --depth <n>`, `--relations`, and `--activity` narrow it.
- **List issues**: `orca linear list-issues --team <TEAM-KEY> --label "<label>" --json`, plus `--state`, `--parent-id`, `--project`, `--assignee`, `--updated-at`, `--limit`, and `--cursor` for paging.
- **Comment**: `orca linear comment add <id> --body-file - --json`.
- **Status**: `orca linear status set <id> --to "<exact state name>" --json`. Discover exact names with `orca linear team states --team <TEAM-KEY> --json`.
- **Labels**: `orca linear label add|remove|set <id> --label "<exact label>" --json`. Discover exact names with `orca linear team labels --team <TEAM-KEY> --json`.
- **Attach a link**: `orca linear attach <id> --url <url> --title "PR/MR link" --json`.
- **Search**: `orca linear search "<query>" --json` across connected workspaces.
- **Inside a linked Orca worktree**: `--current` replaces the identifier for every read and write.

Writes take a `--write-id <uuid>`. When a write returns `linear_write_unconfirmed`, replay the same command with the same `--write-id` instead of issuing a second create; that is how duplicate issues and comments are avoided.

## Triage roles

Canonical roles map to Linear labels through `docs/agents/triage-labels.md`. Apply them with `orca linear label add|set`, and read the exact strings from `orca linear team labels` before writing so a typo cannot create a near-duplicate label.

Ticket complexity is a separate vocabulary owned by `docs/agents/agent-profiles.md`, applied with the same commands and subject to the same rule: the label must already exist in the team.

## Blocking edges

Linear's native relations are the canonical representation:

- add: `orca linear relation add <blocked> --related <blocker> --type blocked-by --json`
- remove: `orca linear relation remove <blocked> --related <blocker> --type blocked-by --json`
- read: `orca linear issue <id> --relations --json`

A ticket is unblocked when every `blocked-by` relation points at a completed issue. Parent/child structure uses `--parent <id>` (or `--parent-current`), not a relation.

## Frontier query

1. `orca linear list-issues --team <TEAM-KEY> --label "<AFK-ready label>" --json`, then drop issues already in a completed or cancelled state.
2. For each survivor, read `orca linear issue <id> --relations --json` and drop any with an open `blocked-by`.
3. What remains is launchable now; the rest are labeled but blocked.

## When a skill says "publish to the issue tracker"

Create a Linear issue with `orca linear create`, parented to the spec issue when one exists.

## When a skill says "fetch the relevant ticket"

Run `orca linear issue <id> --full --json`, or `orca linear issue --current --full --json` inside a linked worktree.

## Pull requests as a triage surface

**PRs as a request surface: no.** Linear does not host pull requests; code review arrives through the Git host and is linked back with `orca linear attach`. Leave this flag `no` unless this repo starts triaging external PRs, in which case describe that host's workflow here too.

## Wayfinding operations

Used by `/wayfinder`. The **map** is one Linear issue whose **children** are the tickets.

- **Map**: `orca linear create --title "<topic> map" --team <TEAM-KEY> --label wayfinder:map`.
- **Child ticket**: `orca linear create --title "..." --parent <map-id> --label wayfinder:<research|prototype|grilling|task>`.
- **Blocking**: `orca linear relation add <child> --related <blocker> --type blocked-by`.
- **Frontier**: the frontier query above, scoped with `--parent-id <map-id>` and dropping assigned issues.
- **Claim**: `orca linear assignee set <id> --me` as the session's first write.
- **Resolve**: `orca linear comment add <id> --body "<answer>"`, then `orca linear status set <id> --to "<completed state>"`, then append the decision pointer to the map body with `orca linear save-issue <map-id> --description ...`.
