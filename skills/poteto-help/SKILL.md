---
name: poteto-help
description: Guides users through pstack setup, /poteto-mode, and picking the skill, playbook, or principle for a task. Type /poteto-help with a question.
disable-model-invocation: true
---

# Poteto help

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

Answer the user's question about pstack, hand them a prompt they can send, and link the file the answer came from. For a help question, don't start the work. The user asked how, and a pstack run spends real tokens, so let them send the prompt.

A message that asks for work, such as "use pstack to fix this bug", is not a help question. Resolve optional **poteto-mode** from the active catalog and read it before acting within the user's scope. If absent, do the scoped task directly with baseline, change, and verification checks; disclose the missing playbook. A help question itself never authorizes execution or configuration writes.

This file maps questions to skills and local references. Resolve named companions from the active catalog; sibling links below are navigation hints for a full installation, not required dependencies. Read the resolved file before quoting or recommending its procedure. If it is missing, explain the available equivalent, such as direct code tracing, a scoped diff review, or a repository harness, and name any unfulfilled gate. Do not install companions automatically or claim independent proof from self-review.

Answer in the user's language. Link the actual file you read, or a verified public URL for that installed version. Do not manufacture links to an upstream tree that may differ from this adaptation. Installed skills and this skill's `references/` own runtime guidance; repository-root READMEs and guide pages are not runtime dependencies.

## Find out what they need

Infer the need from the message and the conversation. A named situation, such as "which skill reviews a PR?", goes straight to its section. If the need is still unclear, ask one multiple-choice question with these options, then answer only the section they pick:

- Get set up
- Start a task with `/poteto-mode`
- Pick a skill for a situation
- Fix a run that went wrong
- Make pstack my own

Check the state that changes the answer, and mention it only when it does:

- Inspect `<project-root>/.agents/pstack-models.md` first and `~/.agents/pstack-models.md` for missing roles. Missing files are normal and do not prove setup never ran. Each role resolves project > global > supported skill default > `inherit-parent`. A project `auto` or `inherit-parent` explicitly masks the global value. Surface malformed or unreadable preferences rather than silently falling back.
- No `verify-*` skill or other app harness in the project means agents have no scripted way to drive the app. Mention `/create-verification-skill` when the question is about proving a change works.
- No formal verification skill in the project means no property is checked past what tests reach. Mention `/create-formal-verification-skill` when the question is about a race, an invariant, or another case tests rarely hit. When one exists and the code it covers changed after the commit it records as last in sync, mention `/maintain-formal-verification-skill` if the question touches that code.

When explicit preferences are missing and it matters, ask whether the user wants to pick supported models and a reasoning budget now. It matters when the user is new, the question is about setup or cost, or the answer depends on which models run. Ask at most once per chat. If the need is also unclear, ask both questions together. Offer two choices:

- Now: if **setup-pstack** is available, give its host-supported invocation and answer the question too. If absent, explain the two preference paths and layered resolution without creating files.
- Later: answer the question and say unconfigured portable roles use `inherit-parent`. Existing project/global choices still apply.

## Get set up

1. Check the active host's skill catalog. If the requested skill is absent, explain how to load its source directory using that host's documented skill mechanism. Confirm the host before giving installation commands; help does not install anything.
2. Resolve and read optional **setup-pstack**. It asks for project-level or global-level scope, discovers exact supported delegate models, proposes a reasoning budget and role overrides, and confirms the destination and contents before writing. It configures plain preferences, not an always-applied host rule. Verification-skill creation is a separate opt-in.
3. Start a real task with the host's invocation for **poteto-mode**, a goal, and a check that can pass or fail. Slash names here are shorthand; use the host's actual syntax.

For configuration questions, read setup-pstack's `references/agent-runtime.md` when installed. The project file supplies each role first, then global fills gaps. Panel lists replace the whole inherited list and keep duplicates. A cross-judge pool instead selects one eligible judge; it is not a worker count. Portable scalar defaults are `inherit-parent`; panel defaults may be `inherit-parent, inherit-parent`. That means two worker attempts when delegation exists, explicitly **no model diversity**. Without per-worker model selection, disclose that limitation. A rejected configured model needs an alternative or an explicitly authorized parent fallback, not a silent family swap.

A budget is an effort preference, independent of model IDs. Use only supported host controls; do not append effort or speed suffixes. Missing model enumeration calls for supported IDs from the user or parent inheritance, not paid discovery spawns. Re-resolve preferences on the next task or invocation after a change, and forward the original root and resolved context to delegates in other checkouts. Do not promise a host-specific reload or new-chat requirement.

If cost is the worry, explain that extra attempts and review panels consume tokens. A shorter panel runs fewer workers, one per entry. A supported cheaper model or lower effort may help; `inherit-parent` alone is not a cost guarantee. Without delegation, useful checks can run sequentially as self-review, never as an independent panel.

Offer to word the first prompt using [`references/prompting.md`](references/prompting.md). This adaptation uses host capabilities rather than requiring a particular editor, plugin bundle, cloud environment, or recurring-loop command.

## Start a task with `/poteto-mode`

`/poteto-mode` matches the task to a playbook, copies the playbook's steps into the todo list, and runs the other skills as the steps need them. A step it skips stays in the list as `skip: <reason>`. A good prompt states the goal and how to tell it's done. It doesn't list skills, because a hand-written sequence tends to drop or reorder steps the playbook would keep. Read [`references/prompting.md`](references/prompting.md) before you help word one.

Skill persistence depends on the host. Confirm its documented behavior rather than prescribing editor hotkeys or promising a persistent mode. Re-invoke **poteto-mode** for a new task when needed. Mid-chat, "new task" makes it match a fresh playbook.

The parent runs the playbook. For implementation or helper workers, poteto-mode supplies `references/poteto-agent.md` as a local prompt through a generic delegate interface. No custom agent type is required. The parent forwards the original project root, preference paths, effective roles, budget, scope, and approval boundaries. Without workers, it runs useful checks sequentially and identifies any lost independence.

## Pick a skill

The default answer is `/poteto-mode`, which runs most of the others when its steps need them. Name a skill directly when the user wants more or less of something than the playbook gives. Read the skill before you recommend it, and give one example prompt.

| The user wants to | Skill |
|---|---|
| Do any non-trivial task with rigor | [`/poteto-mode`](../poteto-mode/SKILL.md) |
| Check that the agent understood their goal and the problem before it starts | [`/in-your-own-words`](../in-your-own-words/SKILL.md) |
| Get a prompt rewritten deeper, not bigger, before sending it: what a top professional would add, their raw material and methods, and an outside check. It returns the prompt and doesn't do the task | [`/sharpen`](../sharpen/SKILL.md) |
| Know how code works now, or where new code should live | [`/how`](../how/SKILL.md) |
| Know why code is shaped this way, or where a number came from | [`/why`](../why/SKILL.md) |
| Understand a change or subsystem, explained plainly | [`/teach`](../teach/SKILL.md) |
| Catch up on their own recent work on a topic | [`/recall`](../recall/SKILL.md) |
| Catch up on what changed in this chat since their last message, in plain words and small visuals, with every item waiting on them listed and decidable from the reply alone | [`/ketchup`](../ketchup/SKILL.md) |
| Catch up like `/ketchup`, in a short silent video of slides, with the waiting calls as text under it | [`/ketchup-video`](../ketchup-video/SKILL.md) |
| Know what a small diff could break outside itself | [`/blast-radius`](../blast-radius/SKILL.md) |
| Settle types and module shape before code that crosses a function boundary | [`/architect`](../architect/SKILL.md) |
| Get several attempts at one brief, merged into the best one | [`/arena`](../arena/SKILL.md) |
| Run checks over slices or race workers when parallel execution is available | [`/swarm`](../swarm/SKILL.md) |
| Have separate reviewers try to break a diff, with model diversity when supported | [`/interrogate`](../interrogate/SKILL.md) |
| Fix a bug test-first when a cheap local test exists | [`/tdd`](../tdd/SKILL.md) |
| Apply TypeScript rules to `.ts` or `.tsx` work | [`/typescript-best-practices`](../typescript-best-practices/SKILL.md) |
| Strip comments before review, using a reviewer that didn't write them | [`/no-comments`](../no-comments/SKILL.md) |
| Clean AI tells out of prose | [`/unslop`](../unslop/SKILL.md) |
| Write docs, an RFC, a README, a PR description, or a commit message to a standard | [`/technical-writing`](../technical-writing/SKILL.md) |
| Hear the last reply again in plain words | [`/bro`](../bro/SKILL.md) |
| Give agents a scripted way to drive the app and prove behavior | [`/create-verification-skill`](../create-verification-skill/SKILL.md) |
| Bring a verification skill and its feature map back in line with the app | [`/maintain-verification-skill`](../maintain-verification-skill/SKILL.md) |
| Formally verify a race, invariant, or other property that tests rarely reach | [`/create-formal-verification-skill`](../create-formal-verification-skill/SKILL.md) |
| Bring a formal verification back in line after the code it covers changed, and learn whether a failure is drift or a bug | [`/maintain-formal-verification-skill`](../maintain-formal-verification-skill/SKILL.md) |
| Show a PM or designer what the user sees as a chart checked by a model, with each bug drawn as a numbered path, turn an agreed chart into a TLA+ skeleton, or audit the code against its TLA+ spec | [`/statechart`](../statechart/SKILL.md) |
| Vet a performance number before reporting or acting on it | [`/benchmark-checklist`](../benchmark-checklist/SKILL.md) |
| Run a large or cross-cutting change, or one to review after stepping away | [`/figure-it-out`](../figure-it-out/SKILL.md) |
| Keep a decision log during a run, and review it afterward | [`/show-me-your-work`](../show-me-your-work/SKILL.md) |
| Pick a model for each role and a reasoning budget | [`/setup-pstack`](../setup-pstack/SKILL.md) |
| Turn their own working habits into a personal mode skill | [`/automate-me`](../automate-me/SKILL.md) |
| Turn what a finished task taught into skill edits | [`/reflect`](../reflect/SKILL.md) |
| Stop agents from repeating the same mistakes in this repo | [`/correct`](../correct/SKILL.md) |
| Build a page whose buttons wake a Grok Bot over a webhook | [`/make-bot-ui`](../make-bot-ui/SKILL.md) |
| Find their way around pstack | `/poteto-help` |

If a skill in the active catalog is missing from the table, read its frontmatter and route by its description. The `principle-*` directories are covered under principles below.

Close calls:

- `/how` explains what the code does. `/why` explains the reasons. `/teach` runs one or both and explains the result plainly.
- `/arena` gives every worker the same brief and merges the best parts. `/swarm` splits work into slices or a race and returns one report.
- `/architect` implements right after it settles the design. Add "with checkpoint" to review the design before it writes code.
- `/interrogate` reviews the diff. `/blast-radius` looks for breakage outside the diff and proves the one fact that makes the change safe.
- `/recall` rebuilds context across recent chats. `/ketchup` covers only this chat since the user's last message. Resuming one specific chat or branch is the Session pickup playbook.
- `/figure-it-out` designs one rigorous run. The Orchestrate playbook runs a program that spans days and many PRs. The Autonomous run playbook drives one task to a finish condition.

Optional integrations, not prerequisites:

- **deslop**, or a direct scoped diff-quality review before commit.
- A browser, native UI, simulator, or terminal driver, or a repository verification harness. **control-ui** and **control-cli** are possible catalog entries. Missing live access leaves live verification unfulfilled, not passed.
- A scheduler or event watcher for unattended work. Without one, run bounded in-session iterations and leave a checkpoint; do not promise future wakeups.
- A skill-writing guide such as **writing-for-agents** or **create-skill**. Without one, check name/frontmatter, relative resources, ordered workflow, and completion criteria directly. Generated SKILL.md files and their bundled resources must be English, including examples, comments, templates, prompts, errors, and guides; session replies use the user's language.
- Orchestrate is a poteto-mode playbook, not a required companion skill. A host command with that name may belong to another integration.

## Playbooks and principles

Playbooks are step lists inside `/poteto-mode`, not skills, so they have no slash command. Inside `/poteto-mode`, describing the task picks one, and these phrases name one directly:

- "babysit this pr" or "check on pr 123" runs Babysit. It drives the PR to merge-ready and stops there. It doesn't merge unless the user asks to merge, land, or ship.
- "land the stack" runs Shipping.
- "take over this branch" runs Session pickup.
- "pause safely" runs Pause safely.
- "full autopilot on this queue" runs Autopilot-full. "stack them, don't ship" runs Autopilot-stack.
- "run the eval playbook" runs Eval.

Use an explicit **poteto-mode** invocation to select its workflow rather than a similarly named host integration. Its Playbooks section lists every playbook and when it applies. Resolve it from the catalog and link that installed file when explaining a route.

For work spanning phases or stacked PRs, its [Multi-phase plan playbook](../poteto-mode/playbooks/multi-phase-plan.md) writes the plan and stops, without implementation or publication. Read that file only when explaining multi-phase planning. For a design question, the Prototype playbook or available **architect** skill can settle empirical unknowns with a scoped sketch.

Principles are one-rule skills that poteto-mode reads and cites when present. Users can steer with a name, such as "apply prove it works. show me the real output." Invoke one directly using the host's skill syntax if available. If the leaf is absent, explain its scoped check and the limitation rather than claiming it loaded.

## Fix a run that went wrong

| Symptom | Fix |
|---|---|
| The style stopped applying after a few turns | Check the host's skill persistence; re-invoke poteto-mode for the task rather than assuming a persistent mode. |
| A question got treated as the next step of the last task | Say "new task", or say the turn doesn't need the mode. |
| A new model choice had no effect | Re-read project then global preferences for this task. Check project masks, original-root forwarding, and whether the host supports per-worker selection. |
| Runs cost more than expected | See the cost paragraph under Get set up. |
| A skill didn't load on its own | Check its catalog entry, description, invocation policy, and the host's discovery behavior. Do not assume every companion is installed or model-invokable. |
| Parallel agents overwrote each other | Give each writer an isolated worktree or disjoint paths. If isolation is unavailable, serialize writes. Remote execution alone is not an isolation guarantee. |
| An overnight run moved but finished nothing | Define a pass/fail predicate, a budget, and a verified wake mechanism. Without scheduling support, use bounded in-session work and an explicit resume checkpoint. |
| The reply claims success from a green build | Ask for the real command, flow, stored value, or profile. That's the prove-it-works principle. |

For a run that drifts, [`references/prompting.md`](references/prompting.md) has one-line steers; [`references/recipes.md`](references/recipes.md) has example prompts. Publication, messages, ticket changes, merges, and destructive cleanup still require the applicable authorization.

## Make pstack my own

- [`/automate-me`](../automate-me/SKILL.md) drafts a personal mode skill from the user's own history, to use alongside `/poteto-mode`.
- [`/reflect`](../reflect/SKILL.md) after a session turns its lessons into skill edits the user approves.
- `/poteto-mode write a skill for <workflow>` runs the authoring playbook. Its SKILL.md and bundled resources are written in English; session replies follow the user's language. The eval playbook tests a skill change blind.
- Propose a separate change for a misbehaving skill. Edit its source or publish a PR only within the user's authorization, not as an automatic side effect of feature work.

## Reply

Lead with the answer in the user's language. Give at most one example prompt in a code block, adapted from [`references/recipes.md`](references/recipes.md) when one fits, then link the actual source read. Name capability or companion gaps when they change the answer. Keep it short unless the user asked for the whole map.
