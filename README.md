# skills

Personal agent skills for [Pi](https://github.com/earendil-works/pi), laid out for the
[vercel-labs/skills](https://github.com/vercel-labs/skills) conventions. One repository,
two install channels, one skill format.

面向 Pi 的个人 skills 仓库。目录与发现规则遵循 vercel-labs/skills，`npx skills add` 与
`pi install` 两条通道装的是同一批文件。

## The pack

**pstack-for-pi** is [pstack](https://github.com/cursor/plugins/tree/main/pstack), ported to
Pi and stripped of everything that only works in Cursor.

- 57 skills: one orchestrator, 22 playbooks, 24 principles, and the situational skills they
  route to.
- Rigorous by default: repro first, prove on the real artifact, keep a decision trail.
- Parallel when it helps: arena, swarm, and interrogate fan out through local rex delegates,
  capped at four at once.
- Local only. No cloud agents, no hosted automations, no Bugbot.

Migration decisions and the per-file change list: [`docs/planning/pstack-for-pi.md`](docs/planning/pstack-for-pi.md).

## Install

Two channels, the same files. Use one, not both.

```bash
# Agent Skills channel. Pi reads ~/.agents/skills/ natively.
npx skills add Wade11s/skills -g --agent pi

# Pi package channel.
pi install git:github.com/Wade11s/skills
```

Then, in Pi:

```text
/skill:setup-pstack
/skill:pstack-poteto-mode <your task>
```

`setup-pstack` asks for a model per role from your scoped models and writes
`~/.pi/agent/pstack-models.json`. There are no defaults and no parent-model fallback.

## First five minutes

1. Scope your models with `/scoped-models`, or `setup-pstack` will stop and ask you to.
2. Run `/skill:setup-pstack` and answer the role questions.
3. Run `/skill:pstack-poteto-mode` with a real, small task and a checkable finish condition.
4. Watch `.pstack/<slug>/todo.md` for progress. The file wins over the reply.
5. Ask `/skill:pstack-help` when you do not know which skill fits.

A one-page Chinese quickstart: [`docs/guide/zh/quickstart.md`](docs/guide/zh/quickstart.md).

## What is in the box

| Area | Skills |
|---|---|
| Entry | `pstack-poteto-mode`, `setup-pstack`, `pstack-help` |
| Understand | `pstack-how`, `pstack-why`, `pstack-teach`, `pstack-recall`, `pstack-reflect`, `pstack-ketchup`, `pstack-bro`, `pstack-in-your-own-words`, `pstack-sharpen`, `pstack-reframe` |
| Design | `pstack-architect`, `pstack-arena`, `pstack-swarm`, `pstack-interrogate`, `pstack-figure-it-out`, `pstack-blast-radius` |
| Build | `pstack-tdd`, `pstack-unslop`, `pstack-no-comments`, `pstack-technical-writing`, `pstack-typescript-best-practices`, `pstack-correct`, `pstack-benchmark-checklist` |
| Verify | `pstack-show-me-your-work`, `pstack-create-verification-skill`, `pstack-maintain-verification-skill`, `pstack-create-formal-verification-skill`, `pstack-maintain-formal-verification-skill`, `pstack-statechart` |
| Meta | `pstack-automate-me` |
| Principles | 24 `pstack-principle-*` skills |

Skills are slash-only. They never load on their own, and they never enter the system prompt
until you invoke one.

## Layout

```
skills/pstack-pi/pstack-<name>/SKILL.md
skills/pstack-pi/pstack-<name>/{playbooks,references,scripts}/
scripts/validate-skills.mjs
scripts/skill-manifest.json
docs/guide/                 the user guide
docs/harness/pi.md          pointer to the runtime harness
```

## Validate

```bash
npm run validate                 # structure, references, forbidden tokens
npm run validate -- --strict     # release gate: every declared skill exists
node --test skills/pstack-pi/pstack-poteto-mode/scripts/todo.test.mjs
node --test skills/pstack-pi/setup-pstack/scripts/models.test.mjs
```

## License

MIT for this repository. The ported pstack skills remain MIT, copyright Lauren Tan. See
[`NOTICE.md`](NOTICE.md) and [`UPSTREAM.md`](UPSTREAM.md).
