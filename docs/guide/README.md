# The pstack guide

pstack works best when you stop micromanaging the agent. You describe what you want and how you'll know it's done. `/skill:pstack-poteto-mode` picks the playbook, runs the other skills as the steps need them, and shows you the evidence. This guide teaches that habit with realistic prompts.

Here's what you'll learn:

1. [Set up pstack](./01-setup.md). Install the pack and pick your models.
2. [Route work through `/skill:pstack-poteto-mode`](./02-poteto-mode.md). Give it a goal and watch it pick a playbook.
3. [Understand the code](./03-understand.md). A read-only investigation, then `/skill:pstack-how`, `/skill:pstack-why`, `/skill:pstack-teach`, and `/skill:pstack-recall` before you edit anything.
4. [Design the change](./04-design.md). `/skill:pstack-architect`, `/skill:pstack-arena`, `/skill:pstack-swarm`, `/skill:pstack-interrogate`, prototypes, and plans before code locks in a shape.
5. [Build and clean the change](./05-build-and-clean.md). The build playbooks, `/skill:pstack-tdd`, `/skill:pstack-unslop`, and `/skill:pstack-no-comments`.
6. [Verify and ship](./06-verify-and-ship.md). Prove behavior on the real app, formally verify what tests rarely reach, vet numbers with `/skill:pstack-benchmark-checklist`, then open a focused PR and drive it to merged.
7. [Run work while you sleep](./07-overnight.md). Trust before loops, an overnight contract, a decision log you can audit, and parallel worktrees that scale past one agent.
8. [Steer with principle names](./08-principles.md). The 24 names that redirect an agent mid-task.
9. [Make it yours](./09-make-it-yours.md). Your own mode skill, `/skill:pstack-correct` for repeated mistakes, and how to test a skill change.
10. [Recipes and pitfalls](./10-recipes-and-pitfalls.md). Prompts to copy and mistakes to skip.

Read the pages in order the first time. After that, each page stands alone.

When you're stuck, or can't tell which skill fits, type [`/skill:pstack-help`](../../skills/pstack-pi/pstack-help/SKILL.md) with your question:

```text
/skill:pstack-help which skill should i use to review this branch?
```

It answers, hands you a prompt to send, and links the skill or guide page the answer came from. It doesn't start the work, because a pstack run spends real tokens, so you send the prompt when you're ready. It runs only when you type it.

## If you only remember one thing

Give the agent a goal and a way to check it, in your own words:

```text
/skill:pstack-poteto-mode the export writes duplicate rows when a retry lands mid-run. repro first, then fix and verify.
```

You don't need to name a playbook or list skills. "repro first" and a checkable outcome are all the routing signal `/skill:pstack-poteto-mode` needs. It matches the Bug fix playbook, copies the steps into the run's todo file, and calls the right skills as each step fires.

A one-page Chinese quickstart lives at [`zh/quickstart.md`](./zh/quickstart.md).

Next: [Set up pstack](./01-setup.md).
