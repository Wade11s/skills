# skills

Personal agent skills for [Pi](https://github.com/earendil-works/pi), laid out for the
[vercel-labs/skills](https://github.com/vercel-labs/skills) conventions.

面向 Pi 的个人 skills 仓库，目录与发现规则遵循 vercel-labs/skills。

## Packs

| Pack | Status | Source |
|---|---|---|
| `pstack-for-pi` | in progress | port of [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack) |

`pstack-for-pi` brings pstack's rigorous workflows to Pi: one orchestrator, 22 playbooks,
24 principles, and the situational skills they route to. The port keeps upstream structure
and judgement, and replaces Cursor-only machinery (subagents, model roles, transcripts,
progress tracking) with Pi equivalents.

Migration plan and change log: [`docs/planning/pstack-for-pi.md`](docs/planning/pstack-for-pi.md).

## Install

Two channels, same files. Use one of them, not both.

```bash
# Agent Skills channel. Pi reads ~/.agents/skills/ natively.
npx skills add Wade11s/skills -g --agent pi

# Pi package channel. Installs the repository as a package.
pi install git:github.com/Wade11s/skills
```

## Repository rules

Contribution rules, naming, and the forbidden-token list live in [`AGENTS.md`](AGENTS.md).
Validate every change:

```bash
npm run validate
```

## License

MIT for this repository. The ported pstack skills remain MIT, copyright Lauren Tan; see
[`NOTICE.md`](NOTICE.md).
