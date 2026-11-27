---
name: pstack-help
description: Answer questions about pstack on Pi and route to the right skill, playbook, or principle. Use for /skill:pstack-help, "which pstack skill", "how do I use pstack", or when a pstack run is stuck.
disable-model-invocation: true
---

# pstack help

pstack is a set of rigorous workflows for Pi. One orchestrator, 22 playbooks, 24 principles,
and the skills those steps route to. Answer the question, then hand the user a command to
type.

Platform rules live in
[`../pstack-poteto-mode/references/harness.md`](../pstack-poteto-mode/references/harness.md).
Read it before answering anything about delegation, models, or sessions.

## Install

Two channels, same files. Use one, not both.

```sh
npx skills add Wade11s/skills -g --agent pi
pi install git:github.com/Wade11s/skills
```

## First run

1. `/skill:setup-pstack` picks a model per role from the user's scoped models and writes
   `~/.pi/agent/pstack-models.json`.
2. `/skill:pstack-poteto-mode <task>` is the entry point for anything non-trivial.
3. `/skill:pstack-help <question>` is this skill.

There are no defaults for roles. A delegating skill with no role is unassigned, and the
harness says whether it asks or uses a fallback.

## How a skill stays on

There are no custom modes. A skill runs for the message that invoked it, or until the task
finishes. To keep pstack's rules in every turn, tell the user to copy the rules they want
into the project's `AGENTS.md`; do not claim a mode exists.

## Index

Every skill is invoked as `/skill:<name>`. `setup-pstack` is the one name without the
`pstack-` prefix.

| Skill | Use when |
|---|---|
| `pstack-poteto-mode` | any non-trivial task; the default entry |
| `setup-pstack` | choose a model per role |
| `pstack-help` | this index, or a stuck run |
| `pstack-how` | how a subsystem works, or where code belongs |
| `pstack-why` | why something was built this way, from the record |
| `pstack-teach` | explain a body of work so a person understands it |
| `pstack-recall` | rebuild recent working context before resuming |
| `pstack-reflect` | mine the session for lessons and route them to skill edits |
| `pstack-ketchup` | catch up on this chat since the user's last message |
| `pstack-bro` | restate the last message in plain language |
| `pstack-in-your-own-words` | play the goal back before starting |
| `pstack-sharpen` | deepen a prompt before sending it |
| `pstack-reframe` | find the expert words for what is being built |
| `pstack-architect` | sketch types, signatures, and structure before code |
| `pstack-arena` | run parallel candidates, pick a base, graft the best parts |
| `pstack-swarm` | fan out workers, drain them, one report |
| `pstack-interrogate` | adversarial review that only keeps proven findings |
| `pstack-figure-it-out` | design a rigorous run when no playbook fits |
| `pstack-blast-radius` | find what a change could break outside the diff |
| `pstack-tdd` | a failing test first, when the test path is cheap |
| `pstack-unslop` | cut AI tells from writing |
| `pstack-no-comments` | purge narration and workaround comments |
| `pstack-technical-writing` | docs, RFCs, READMEs, PR descriptions, commits |
| `pstack-typescript-best-practices` | reading or editing TypeScript |
| `pstack-correct` | turn repeated corrections into structural checks |
| `pstack-benchmark-checklist` | vet a number before reporting it |
| `pstack-show-me-your-work` | keep an auditable decision trail |
| `pstack-create-verification-skill` | generate a skill that drives the real app |
| `pstack-maintain-verification-skill` | keep that skill and its feature map honest |
| `pstack-create-formal-verification-skill` | generate a model-checking skill |
| `pstack-maintain-formal-verification-skill` | re-sync a formal model after code changes |
| `pstack-statechart` | check a TLA+ model and draw it |
| `pstack-automate-me` | turn working habits into a personal mode skill |

## Principles

There are 24, one per rule, all `pstack-principle-*`: attack the premise, boundary
discipline, build the lever, encode lessons in structure, exhaust the design space,
experience first, explain the number, fix root causes, foundational thinking, guard the
context window, laziness protocol, make operations idempotent, migrate callers then delete
legacy APIs, minimize reader load, model the domain, never block on the human, outcome
oriented execution, prove it works, redesign from first principles, separate before
serializing shared state, sequence verifiable units, subtract before you add, test behavior
not implementation, type system discipline. `pstack-poteto-mode` reads the leaf `SKILL.md`
when a rule applies and cites it by name.

## Playbooks

Playbooks are steps inside `pstack-poteto-mode`, not skills, so they have no command. Name
the task and it picks one, or name the playbook: Investigation, Bug fix, Perf issue,
Hillclimb, Runtime forensics, Trace forensics, Feature, Refactoring, Prototype, Visual
parity, Authoring a skill, Eval, Babysit, Shipping, Autonomous run, Autopilot-full,
Autopilot-stack, Session pickup, Pause safely, Multi-phase plan, Worktree cleanup,
Opening a PR.

A playbook that is not ported yet fails with a named error instead of improvising.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `setup-pstack` says there is no scoped set | run `/scoped-models`, then retry |
| A role is unassigned | run `/skill:setup-pstack` |
| A model is not in the scoped set | pick another in setup; the fallback covers a model that leaves the set later |
| `todo.sh` reports a stale lock | `todo.sh unlock <slug>`; nothing steals a lock automatically |
| A skill never loads on its own | expected: pstack skills are slash-only, so type `/skill:<name>` |
| A playbook is missing | it is not ported yet; the orchestrator names the error |
| A run costs more than expected | models are per role; pick cheaper ones in setup, and shorten panel lists |
| The reply claims success from a green build | ask for the command, flow, stored value, or profile; that is the prove-it-works principle |

## Make it yours

- `/skill:pstack-automate-me` drafts a personal `-mode` skill from the user's history.
- `/skill:pstack-reflect` turns this session's lessons into skill edits the user approves.
- `/skill:pstack-poteto-mode write a skill for <workflow>` runs the authoring playbook.
- Fix a misbehaving skill in its own PR, not inside feature work.

## Reply

Lead with the answer. Give at most one command or prompt in a code block, then one line
naming the skill or harness section it came from. Keep it short unless the user asked for
the whole map.
