# Prompts worth copying

Swap in real paths, available skills, and done checks. Use the user's language and the host's actual invocation syntax; slash names are shorthand. Companion skills, recordings, workers, and schedulers are optional. If absent, request direct scoped checks and a disclosed gap instead of invented proof. Informal wording works.

## Understand

- `/poteto-mode read <thread>. restate the underlying issue plainly in my language.`
- `/in-your-own-words <long or messy ask>`
- `/sharpen <the prompt you're about to send>`
- `/poteto-mode investigate why <symptom>. give me what we know, what data you used, and your best hypotheses. don't change any code yet.`
- `use /how to understand <subsystem>. then use /why to find out why it broke recently.`
- `/recall my work on <topic> from last week, then read <issue>.`
- `/teach me why you implemented it this way and not <other way>. what did you trade off?`
- `/poteto-mode take over this branch. read the decision log, find what's done, and continue. don't redo finished work.`

## Build

- Bug: `/poteto-mode <symptom>. repro first, then fix and verify.`
- Bug in an app: `/poteto-mode repro this with the available verify-<app> harness or surface driver. if it repros on the base branch, fix it and show me recorded evidence. if live access is unavailable, say what remains unverified.`
- Bug with a cheap test: `/poteto-mode repro <bug> first. if there's a cheap test path, /tdd it. then fix and rerun.`
- Feature: `/poteto-mode add <behavior>. <current output> stays byte-identical. verify both.`
- Refactor: `/poteto-mode move <code> into one module, zero behavior change. record the current output first and prove it's unchanged after.`
- Perf: `/poteto-mode <operation> takes <time> on <fixture>. trace it, fix the measured cause, show me before and after.`

## Design and plan

- `/poteto-mode prototype a few options for <feature>. take screenshots or videos for me to compare.`
- `/poteto-mode we need <feature>. /architect it first, and answer open questions with prototypes. let me review before proceeding.`
- `/poteto-mode write a tutorial for how i would use <new package> first. then /teach me why it beats the current one.`
- `ask /arena for a second opinion on this thread and our approach.`
- `/poteto-mode turn this design into a plan. small verifiable PRs, each with its own verification steps.`
- `/poteto-mode plan the migration of <library> to <target>. small verifiable PRs. the result must match the original exactly, bugs included.`

## Review and ship

- `/interrogate the whole branch, but skeptically. don't change anything yet. no nitpicks unless it's a real bug or regression.` Read the dismissals too.
- `/create-formal-verification-skill prove <property> holds in <module>, even when <steps> interleave or retry.` After merges or refactors in that code: `/maintain-formal-verification-skill`.
- `/swarm check every package under <dir> against its check script. one worker per package. one report.`
- `/poteto-mode open the pr. small ordered commits, evidence in the description.`
- `/poteto-mode babysit this pr. get it green.` For status only: `/poteto-mode check on pr <number>. anything outstanding?`
- `/poteto-mode land the stack.`

## Away and back

- `/poteto-mode I'm stepping away. <goal> in an isolated worktree off <base> if supported. done means <checks>. keep a local decision log. local commits are allowed; no push, PR, messages, merge, deployment, or deletion. use an available scheduler only if confirmed; otherwise work within this session and leave a resume checkpoint. if stuck or the budget ends, stop and explain why.`
- `/show-me-your-work catch me up on what you did last night.` Read its Attention section first.
- `/ketchup` catches you up on this chat since your last message and lists every call that waits on you.
- `/poteto-mode plan full autopilot on this queue. each item is independent. show capability gaps and publication/merge gates first; do not execute until I approve.`
- `/poteto-mode autopilot these changes but stack them, don't ship. i'll land the stack.`
- `/reflect capture what we learned so the next run doesn't repeat it.` Approve only edits that change a future decision.
- `/bro` restates the last reply in plain words.
