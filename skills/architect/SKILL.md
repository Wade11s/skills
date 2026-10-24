---
name: architect
description: "Sketch types, signatures, and module structure before code, then stay in the loop while implementation fills in. Use for /architect, 'architect this', 'design this', or non-trivial work where jumping to code would lock in the wrong shape."
---

# Architect

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

Sketch types, function signatures, class shapes, and module boundaries with `not implemented` bodies and pseudocode. Synthesize separately produced candidates, then fill in code against the chosen sketch within the user's authorized scope.

## Start

Open a native todo list or Markdown checklist with one entry per phase before starting.

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Phase A: Ground the problem

Build a real mental model of every system the new code touches. Use **how** when available over the relevant subsystems. Naming a file isn't grounding. Trace components, runtime flow, ownership, boundaries, and gotchas with file citations. If the design redefines ownership or layering, also use **why** when available to investigate the existing rationale through history and available records. Separate cited intent from inference and unknowns so the rationale becomes a constraint, not a guess.

The named companions and principle skills in this workflow are optional catalog entries. When one is missing, disclose it and perform the scoped steps described here directly. Do not claim that an absent companion or a same-context pass supplied independent proof.

Skip Phase A only when the work is genuinely greenfield with no surrounding system to integrate.

## Phase B: Sketch

Use **arena** when available with the design-sketch task and the Phase A grounding artifacts. Read [`references/runner-prompt.md`](references/runner-prompt.md) for every candidate brief.

Resolve `architect runners` by the startup precedence, with a portable default of `inherit-parent, inherit-parent`. Pass that complete panel to arena as this invocation's runner override, rather than substituting `arena runners`. Each list entry creates a candidate, including repeated IDs and aliases; lists replace rather than append. Omit model selection for `inherit-parent` / `auto`. Use only confirmed worker-model IDs. If an entry is unavailable or rejected, report it and ask for an alternative or an explicitly authorized parent-model fallback. A missing preference file is normal; surface invalid or unreadable affected preferences before use rather than treating them as missing. Use the project budget, then global budget, through supported host settings; disclose unapplied effort instead of changing model-ID suffixes.

Use ordinary design workers, not custom agent types. Forward the original project root, preference paths, effective roles, budget, and invocation overrides. If arena is missing, frame a rubric, generate isolated candidates, compare each against it, choose a base, graft useful parts, and verify the synthesized sketch directly. Without delegation, do these as sequential design passes and label them self-review; the independent cross-judge gate remains unverified. Parent-model or single-family workers provide separate attempts, not model diversity. Disclose that degradation.

Design it twice. Require at least two structurally distinct candidates before synthesis, even when the first looks sufficient. If the configured panel yields fewer, request another design pass or an explicit panel expansion rather than silently changing its worker count. This is the **exhaust-the-design-space** principle skill made concrete. Whole-shape alternatives, not point fixes inside one shape.

Screen every candidate against [`references/design-red-flags.md`](references/design-red-flags.md) before synthesis. Assume the next contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Prefer the design where a change that looks right from one file is right for the whole repo.

Compare viable candidates on interface depth. Prefer the design that hides more complexity behind a smaller, simpler public surface. A rich interface can keep call chains short by concentrating capability instead of scattering it across layers.

Arena, or the direct comparison when it is absent, returns one synthesized design package. The comparison fills the rationale's "Synthesis decision" section with the actual independence and verification limits.

## Phase C: Agree (opt-in)

Default: proceed directly to implementation with the synthesized design only when implementation is already authorized. A design-only request stops at the design package. No additional design checkpoint is needed within the authorized scope.

Opt in to a checkpoint when the invoker explicitly asks: "/architect with checkpoint," "stop and show me before implementing," or similar. Then surface the synthesized design and pause for sign-off.

The synthesis can be a separate scaffold-first commit when the user authorizes committing. Planned and scoped breakage during fill-in is fine within the agreed work boundary, per the **outcome-oriented-execution** principle skill. For adversarial pressure before implementing, use **interrogate** when available on the synthesized sketch. Otherwise challenge correctness, boundaries, and maintainability directly and label the result self-review, not an independent verdict.

If the human pushes back on the shape (in a checkpoint or after the fact), treat that as Phase A evidence. Re-ground and re-run Phase B before writing more code.

## Phase D: Implement against the sketch

Replace `not implemented` bodies with code, pseudocode with logic. The synthesized sketch is the contract. Deviations from it are signal to surface, not friction to absorb silently. If a function needs a parameter the sketch didn't anticipate, ask whether the sketch was wrong, the requirement was missed, or the implementation is overreaching.

## Phase E: Scrap when the architecture is wrong

If implementation keeps producing friction the sketch can't absorb, throw the sketch out. Don't bolt fixes onto a wrong design, per the **redesign-from-first-principles** and **fix-root-causes** principle skills.

The signal is a *pattern*, not single instances. Tells:

- The same shape of workaround appearing repeatedly across unrelated code.
- Multiple unrelated edge cases that all need special-case branches.
- Types that need escape hatches (`any`, casts, optional fields always set in practice) to compile.
- The "we need a lock" reflex when the sketch said the state wasn't shared.
- Callers having to know the abstraction's internal rules to use it.
- Two or more independent Phase D deviations of the same shape across the implementation.

Use judgment. A few edge cases don't condemn an architecture. Some problems are legitimately complex. Complexity in the data is not complexity in the design.

When you scrap:

1. Repeat Phase A grounding over what's been built, using **how** when available.
2. Redesign as if the new constraints had been day-one assumptions, per redesign-from-first-principles.
3. Subtract before adding, per the **subtract-before-you-add** principle skill. The new sketch should be smaller than the old one before it grows.
4. Return to Phase B and repeat the candidate comparison, using arena when available.

## Outputs

The caller's usage is written first and the type sketch derived from it. One file with new types and signatures for small changes. Module map plus type definitions for larger work. The rationale ships alongside, shaped per `references/rationale-template.md`, including the usage sketch and the synthesis decision.
