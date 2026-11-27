# Set up pstack

Install the pack, choose a model per role, and run a first task. Setup is one command plus a short conversation.

## Install

Two channels, the same files. Use one, not both.

```sh
# Agent Skills channel. Pi reads ~/.agents/skills/ natively.
npx skills add Wade11s/skills -g --agent pi

# Pi package channel.
pi install git:github.com/Wade11s/skills
```

pstack skills are slash-only. Type `/skill:pstack-poteto-mode` to start one; nothing loads on its own.

## Pick your models

Run:

```text
/skill:setup-pstack
```

[`/skill:setup-pstack`](../../skills/pstack-pi/setup-pstack/SKILL.md) reads your scoped models (`enabledModels`, project override), shows the numbered set, and asks for the nine roles plus one fallback per family. It writes `~/.pi/agent/pstack-models.json`.

There are no default models. Every role names a model you picked from the scoped set, and a role with no entry is unassigned. To change a role later, rerun setup; it overwrites the file.

The roles:

- `feature, refactoring`, `bug-fix`, `perf-issue`, `hillclimb`: code work, one role per playbook.
- `judgment and prose`: docs, review prose, design calls.
- `arena runners`, `arena cross-judge pool`: the candidate panel and its judge.
- `swarm workers`: the default for each worker, or one model per arm.
- `interrogate reviewers`: the adversaries.

The four fallback families (`code`, `judgment`, `panel`, `workers`) cover a role whose model leaves your scoped set later. They are not defaults. The cross-judge must come from a provider other than your parent model's (`$PI_PROVIDER`); when the pool has no such entry, the judge is skipped and says so.

If `/scoped-models` has never been run, setup stops and asks you to scope your models first. It never falls back to the full catalogue.

## Accept the verification offers, or don't

At the end of setup, [`/skill:setup-pstack`](../../skills/pstack-pi/setup-pstack/SKILL.md) looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`/skill:pstack-create-verification-skill`](../../skills/pstack-pi/pstack-create-verification-skill/SKILL.md).

Say yes and it writes `.agents/skills/verify-<app>/`, a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run the generator yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in depth.

Then setup offers once to generate a formal verification skill with [`/skill:pstack-create-formal-verification-skill`](../../skills/pstack-pi/pstack-create-formal-verification-skill/SKILL.md), unless the project already has one. Tests check the cases someone thought to write. A formal verification skill checks one key property of your code, such as "a job never runs twice at once", in every case within a stated scope. Say yes when your code has concurrency, retries, a state machine, or a parser, where a bug is costly and tests rarely reach the case that breaks. Otherwise say no and run it later if that changes.

## Keep the cost in check

pstack spends extra tokens on delegates and review panels. To spend fewer:

- Rerun `/skill:setup-pstack` and pick cheaper models, especially for `swarm workers` and `judgment and prose`.
- Shorten a panel list. Each entry runs one delegate.
- Save `/skill:pstack-poteto-mode` for work that needs rigor. A small, obvious edit does not.

## Run your first task

Pick something real but small, and describe it the way you would describe it to a colleague:

```text
/skill:pstack-poteto-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

The run writes its plan to `.pstack/<slug>/todo.md` and copies the matched playbook's steps into it, the Feature playbook for this prompt. Watch that file, not the reply, for what has actually landed.

There are no custom modes. A skill runs for the message that invoked it, or until the task finishes. To keep pstack's rules in every turn, copy the rules you want into the project's `AGENTS.md`; do not expect the skill to stay attached.

Next: [Route work through `/skill:pstack-poteto-mode`](./02-poteto-mode.md).
