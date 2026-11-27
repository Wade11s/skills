---
name: pstack-arena
description: "Spawn N parallel candidates at the same task, pick a base, graft the strongest parts of the losers into it. Use for /skill:pstack-arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
disable-model-invocation: true
---

# Arena

Create the run's todo file (`../pstack-poteto-mode/scripts/todo.sh init <slug> "<title>"`) and copy the six phases (Frame, Fan out, Cross-judge, Pick, Graft, Verify) into it before launching anything. Every phase ends with `todo.sh done <slug> <id>`; the file wins over the reply. Delegation and models follow [`../pstack-poteto-mode/references/harness.md`](../pstack-poteto-mode/references/harness.md); Arena owns the shape.

## Phase A: Frame

Every candidate gets the same prompt, so the prompt is the contract.

1. State the artifact each candidate is producing.
2. Derive the rubric, 3-6 concrete gradeable criteria for what success looks like on *this* task. It is the picker's tool in Phase D. Candidates only see the task.
3. Pick the runners from the `arena runners` role, resolved per the harness. One delegate per entry; a list sets both the count and the order. When an entry leaves the scoped set, the harness's same-family and fallback rules decide, and you say which one you used. Keep at least two runners; drop a seat and say so rather than run one. Spawn more for multiple design directions, and repeat one model when the work is generation-bound, not judgment-sensitive. Pick each delegate's model and level per the harness.
4. Give each candidate its own output location (a git worktree where possible, otherwise `/tmp/arena-<slug>/candidate-<n>/`), per the **separate-before-serializing-shared-state** principle skill.

## Phase B: Fan out

Spawn the runners, at most four at once, each with the task, the path to the shared grounding, its own output path, and instructions to produce the artifact and a short rationale naming the alternatives it considered and what it rejected. Wait with `rex_wait {handles, any: true}` and take each result as it lands. Close every runner with `rex_stop {handle, remove: true}` once its output is read.

If a candidate produces no output, proceed with N-1 and note the dropout.

## Phase C: Cross-judge

After all Phase B candidates complete, delegate one judge whose tool set is `read`, `grep`, and `find`, from the `arena cross-judge pool` role, resolved per the harness. The judge must come from a provider other than the parent's: compare with `$PI_PROVIDER` and take the first pool entry that differs. If no entry qualifies, skip the judge and say the vendor check could not run. When an entry leaves the scoped set, the harness resolves it or the seat is skipped, and you say which. While you read in Phase D, the judge scores each candidate, by path label, on each rubric criterion and recommends a base.

## Phase D: Pick a base

Read every candidate end to end before picking. Score each against the rubric criterion by criterion, not on holistic feel, and compare with the cross-judge when Phase C ran one. Agreement on the base confirms the pick. Disagreement means one of you is biased or the rubric was ambiguous. Read both rationales before deciding.

Pick the base a future maintainer can extend most easily without breaking invariants. When two feel tied, prefer the cleaner boundary or smaller API, per the Laziness Protocol.

## Phase E: Graft

Walk each losing candidate once more for what is worth porting into the base, usually one or two things per candidate, not most of it. Fold each graft in by hand, per the **redesign-from-first-principles** principle skill, so the result stays coherent under one mental model. Don't paste mechanically.

If the candidates converge on one shape, that is strong agreement. Note it and ship the consensus shape. No graft is needed. If they wildly diverge, Phase A was under-specified. Reframe and re-run rather than averaging the divergence.

## Phase F: Verify

Verify the synthesized artifact like any other output, per the **prove-it-works** principle skill. If verification finds a problem the arena missed, either Phase A was wrong (re-frame and re-run) or a candidate caught it and you missed the graft (go back to Phase E). Don't paper over it.

## Outputs

One synthesized artifact, with a short synthesis note alongside naming the base and why, the cross-judge's verdict or that Phase C skipped the judge, each graft with its source candidate, what was rejected and why, any convergence or dropouts, and the verification result.
