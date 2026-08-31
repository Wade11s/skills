# Supported harnesses

This file is the single source of truth for harness support in `skill-doctor`. Reference it instead of repeating harness lists in `SKILL.md`.

## Startup gate

| Harness | Collector ID | Local conversation source |
| --- | --- | --- |
| Pi | `pi` | `~/.pi/agent/sessions` JSONL (or `PI_CODING_AGENT_SESSION_DIR`) |
| Warp | `warp` | Read-only Warp conversation databases |
| Claude Code | `claude` | Project-history JSONL |
| Codex | `codex` | Rollout JSONL |

At startup, identify the harness executing the skill from the runtime context. Do not infer it from conversation files found on disk.

| Harness | Runtime signals |
| --- | --- |
| Pi | `PI_CODING_AGENT=true`, `AI_AGENT=pi`, or `PI_SESSION_FILE` / `PI_SESSION_ID` set |
| Warp | Warp agent runtime / Warp-specific tool names in the current process |
| Claude Code | Claude Code runtime (`CLAUDE_CODE`, `CLAUDE_CONFIG_DIR` process markers) |
| Codex | Codex runtime (`CODEX_HOME` process markers, `codex` CLI session) |

If the executing harness is not listed above, or cannot be identified confidently, stop before creating a report directory or reading conversation history. Tell the user:

> skill-doctor currently supports Pi, Warp, Claude Code, and Codex. This run appears to be using an unsupported harness, so no conversations were read.

## Collector source selection

- `--harness auto` scans every locally available supported source and is the default.
- `--harness all` also requests every supported source.
- `--harness <collector-id>` restricts collection to one source from the table.
- A report containing one source uses its collector ID in `inventory.json`; a report containing multiple sources uses `mixed`.

Harness-specific source overrides:

- `--pi-home PATH` — Pi config directory (default: `PI_CODING_AGENT_DIR` or `~/.pi/agent`).
- `--pi-sessions-dir PATH` — Pi session storage (default: `PI_CODING_AGENT_SESSION_DIR` or `<pi-home>/sessions`).
- `--claude-home PATH` — nonstandard Claude Code configuration directory.
- `--codex-home PATH` — nonstandard Codex home.
- `--warp-db PATH` — explicit Warp database; repeatable.
- `--warp-data-dir PATH` — nonstandard Warp channel-data directory.

## Skill locations

Project skills are discovered from:

- `.pi/skills`
- `.agents/skills`
- `.claude/skills`
- `.codex/skills`

Global skills are discovered from the corresponding directories under the user's home and configured harness homes when `--include-global-skills` is set, including `~/.pi/agent/skills` and `~/.agents/skills`.

Pi discovers `SKILL.md` files recursively. A skill counts as used in a Pi session when a tool call reads that skill's `SKILL.md` (or another file under its directory), or when a user message invokes `/skill:<name>`.

## Pi session layout

Parent sessions:

```
<sessions-dir>/--<cwd-with-slashes-as-dashes>--/<timestamp>_<uuid>.jsonl
```

Each file is JSONL. The first line is a `session` header with `id` and `cwd`. Later `message` entries hold `user`, `assistant` (text / thinking / `toolCall`), and `toolResult` payloads.

Child sessions live next to the parent file, not in the cwd-dir top level:

```
<sessions-dir>/--<cwd>--/<parent-file-stem>/<runId>/run-<n>/session.jsonl
```

`--include-subagents` includes those nested `session.jsonl` files. `subagent-artifacts/` transcripts are never scored.
