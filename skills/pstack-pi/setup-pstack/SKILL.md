---
name: setup-pstack
description: Configure which model pstack uses per role, from your scoped Pi models. Writes ~/.pi/agent/pstack-models.json. Use for /skill:setup-pstack, "configure pstack models", "pstack roles", or changing pstack's model choices.
disable-model-invocation: true
---

# Setup pstack

Write `~/.pi/agent/pstack-models.json`, the per-role model file every delegating skill reads.
Write `.pi/pstack-models.json` instead when the user wants the choice tied to one project.

There are no default models and no parent-model alias. Every role names a model the user
picked from their scoped set.

## 1. Read the scoped set

Run this skill's `scripts/models.mjs` from the project root, so `.pi/settings.json`
resolves. `<skill-dir>` is the absolute path Pi reported for this skill:

```sh
node <skill-dir>/scripts/models.mjs scope
```

This reads `enabledModels` (user settings, project override) and resolves it against
`pi --list-models` with `--models` semantics: exact, `*` within one segment, `**` across
segments, case-insensitive, a bare pattern fuzzy-matches, and a trailing `:level` pins the
thinking level when it names a real level. If it reports no scope, stop and tell the user to run `/scoped-models`
first, then return. Never offer the full catalogue.

## 2. Read the current config

If `~/.pi/agent/pstack-models.json` or `.pi/pstack-models.json` exists, read it and treat
its values as current. A role with no entry is unassigned.

## 3. Ask for the roles

Show the scoped set once, numbered. Then ask for all nine roles in one message, listing each
role with its current value (or `unassigned`). Ask the user to reply as `role = number`,
using comma-separated numbers for a list role.

| Role | Family | Notes |
|---|---|---|
| `feature, refactoring` | code | features and mechanical refactors |
| `bug-fix` | code | repro-first fixes |
| `perf-issue` | code | measured perf work |
| `hillclimb` | code | one metric, many iterations |
| `judgment and prose` | judgment | docs, review prose, design judgement |
| `arena runners` | panel | list, one candidate per entry |
| `arena cross-judge pool` | panel | list, ordered by preference |
| `swarm workers` | workers | list or single; list = one model per arm |
| `interrogate reviewers` | panel | list, one adversary per entry |

A panel list is a list: order sets priority, and a cross-judge must come from a provider
other than the parent's (`$PI_PROVIDER`).

## 4. Ask for the fallbacks

Ask for one fallback per family: `code`, `judgment`, `panel` (a list), `workers`. These are
used only when a role's model leaves the scoped set. They are answers to the same numbered
list.

## 5. Validate

For every chosen id:

```sh
node <skill-dir>/scripts/models.mjs check <provider/model>
```

Run it the same way, from the project root.

It must pass. `thinking` must be one of `off`, `minimal`, `low`, `medium`, `high`, `xhigh`,
`max`. Pi clamps a level the model does not support, so do not try to predict that here.

## 6. Write the file

Write the whole file, atomically, in this shape:

```json
{
  "version": 1,
  "roles": {
    "feature, refactoring": { "provider": "<p>", "model": "<m>", "thinking": "xhigh" },
    "bug-fix": { "provider": "<p>", "model": "<m>", "thinking": "xhigh" },
    "perf-issue": { "provider": "<p>", "model": "<m>", "thinking": "xhigh" },
    "hillclimb": { "provider": "<p>", "model": "<m>", "thinking": "xhigh" },
    "judgment and prose": { "provider": "<p>", "model": "<m>", "thinking": "high" },
    "arena runners": [
      { "provider": "<p>", "model": "<m>", "thinking": "xhigh" }
    ],
    "arena cross-judge pool": [
      { "provider": "<p>", "model": "<m>", "thinking": "high" }
    ],
    "swarm workers": { "provider": "<p>", "model": "<m>", "thinking": "high" },
    "interrogate reviewers": [
      { "provider": "<p>", "model": "<m>", "thinking": "high" }
    ]
  },
  "fallback": {
    "code": { "provider": "<p>", "model": "<m>", "thinking": "high" },
    "judgment": { "provider": "<p>", "model": "<m>", "thinking": "high" },
    "panel": [{ "provider": "<p>", "model": "<m>", "thinking": "high" }],
    "workers": { "provider": "<p>", "model": "<m>", "thinking": "medium" }
  },
  "on_unassigned": "ask"
}
```

`on_unassigned` is `ask` (send the reader back to this skill) or `fallback` (use
`fallback[family]` directly).

## 7. Confirm

Tell the user the file was written, where, and that the next delegated step reads it. Re-running
this skill updates it in place.

## 8. Offer the verification skills, once each

- If the project has no scripted way to drive the app, offer
  `/skill:pstack-create-verification-skill`.
- If the project has no formal verification skill, offer
  `/skill:pstack-create-formal-verification-skill`.

On yes, read the sibling `SKILL.md` and run it. On no, move on.
