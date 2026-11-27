# Upstream

pstack-for-pi is a port of **pstack**, part of
[cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack).

| | |
|---|---|
| Upstream version | pstack `0.15.48` |
| Pinned commit | `b7b93c36be9bcc36a74db438e0fd385d660bc559` (2026-11-26) |
| Local root | `skills/pstack-pi/` |
| License | MIT, copyright Lauren Tan. See `NOTICE.md`. |

## Naming

- A ported skill is `pstack-<upstream-name>`, and its directory matches.
- `setup-pstack` is the only skill that keeps the upstream name and directory.
- The help skill is `pstack-help` for upstream `poteto-help`, because the shorter command is
  the one users type.

## What was removed

| Upstream | Why |
|---|---|
| `make-bot-ui` | Grok Bot webhook and Cursor Automations, with no local equivalent |
| `ketchup-video` | depended on the upstream video pipeline |
| `automations/benny/*` | Cursor Automations configuration |
| `poteto-mode/references/bugbot-triage.md` | Bugbot-specific |
| `poteto-mode/scripts/watch-pr` | Bun CLI used only by `/loop` watchers; replaced with `gh` polling |
| `agents/*.md` | Pi has no agent definitions; the personas became `references/*.md` |

Everything else is ported. Platform differences are documented in
`skills/pstack-pi/pstack-poteto-mode/references/harness.md` and in
`docs/planning/pstack-for-pi.md`.

## Sync

```bash
node scripts/upstream-diff.mjs
```

The script clones the upstream repository into `.cache/` once, fetches the default branch and
the pinned commit, then prints every upstream path that changed since the pin, mapped to its
local counterpart. It does not modify anything. Delete `.cache/upstream-plugins` after moving
the pin, so the cache refetches from scratch.

To take a change:

1. Read the upstream diff for that path.
2. Decide whether it is judgement or platform. Judgement changes are ported; platform ones
   are translated through the harness.
3. Update the pinned commit in this file and in `scripts/upstream-diff.mjs`.
