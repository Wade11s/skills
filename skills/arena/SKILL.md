---
name: arena
description: "Compare N candidates at the same task, pick a base, and graft the strongest parts of the others into it. Use for /arena, 'arena this', 'throw it in the arena', or when one attempt at a non-trivial artifact would lock in the wrong shape."
---

# Arena

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

Open a native todo list or Markdown checklist with one entry per phase (Frame, Fan out, Cross-judge, Pick, Graft, Verify) before launching anything. Named principle skills are optional; the steps here state the required checks.

## Phase A: Frame

Every candidate gets the same prompt, so the prompt is the contract.

1. State the artifact each candidate is producing.
2. Derive the rubric, 3-6 concrete gradeable criteria for what success looks like on *this* task. It is the picker's tool in Phase D. Candidates only see the task.
3. Resolve `arena runners` by the startup precedence, unless the caller explicitly supplies a panel override. The portable default is `inherit-parent, inherit-parent`. A panel replaces the whole list; every entry creates one candidate, including repeated IDs and aliases. Omit model selection for `inherit-parent` / `auto`. Use only confirmed IDs supported by the host's worker interface. If enumeration is unavailable, ask for supported IDs or offer parent-model workers. If a configured entry is rejected, report the role and failure; ask for an alternative or an explicitly authorized parent-model fallback, rather than guessing a family or rewriting an ID. A missing preference file is normal; surface invalid or unreadable affected preferences before use rather than treating them as missing. Use the project budget, then global budget, through supported host settings independently of the ID; disclose unapplied effort. More candidates can cover more design directions. Repeated parent or single-family workers are separate attempts with **no model-family diversity**.
4. Give each candidate its own authorized output location, using isolated worktrees only when supported and permitted, otherwise separate temporary directories. Never have candidates write the same files. No branch publication or destructive cleanup is implied.

## Phase B: Fan out

Launch ordinary candidate workers concurrently when the host supports it, otherwise sequentially. Each gets the task, shared grounding, its own output path, and instructions to produce the artifact and a short rationale naming alternatives considered and rejected. Forward the original project root, preference paths, effective roles, budget, and explicit overrides. Background execution is optional; collect terminal results through the host's supported interface and clean up created workers.

Without delegation, produce the candidates in separate sequential passes and label them same-context attempts. They are not independent workers or a multi-model panel. If a candidate produces no output, proceed with N-1 and note the dropout; with fewer than two artifacts, report the comparison gap rather than claiming a successful arena.

## Phase C: Cross-judge

After all Phase B candidates finish writing, resolve `arena cross-judge pool` by the startup precedence, default `inherit-parent`. This is a selection pool, not a worker count. Choose one confirmed entry, preferring a different family from the parent's when available, under the same validation and fallback rules as the runners. Use one ordinary judge worker with read-only scope. It sees the rubric and candidates by path label, scores each criterion, and recommends a base with rationale. It may run alongside your reading in Phase D if supported.

Without a separate judge, score the candidates directly and label this self-review; independent cross-judgment remains unverified. A same-family judge supplies another assessment, not model diversity.

## Phase D: Pick a base

Read every candidate end to end before picking. Score each against the rubric criterion by criterion, not on holistic feel, and compare with the cross-judge when available. Agreement supports the pick but is not proof of correctness. On disagreement, check both rationales and the rubric before deciding. A self-review cannot supply independent agreement.

Pick the base a future maintainer can extend most easily without breaking invariants. When two feel tied, prefer the cleaner boundary or smaller API, per the Laziness Protocol.

## Phase E: Graft

Walk each losing candidate once more for what is worth porting into the base, usually one or two things per candidate, not most of it. Fold each graft in by hand, per the **redesign-from-first-principles** principle skill, so the result stays coherent under one mental model. Don't paste mechanically.

If the candidates converge on one shape, that is strong agreement. Note it and ship the consensus shape. No graft is needed. If they wildly diverge, Phase A was under-specified. Reframe and re-run rather than averaging the divergence.

## Phase F: Verify

Verify the synthesized artifact with the task's concrete acceptance checks, using **prove-it-works** if available. If that companion or a verification capability is absent, perform the scoped checks available and name the unverified gates. If verification finds a problem the arena missed, either Phase A was wrong (re-frame and re-run) or a candidate caught it and you missed the graft (go back to Phase E). Don't paper over it.

## Outputs

One synthesized artifact, with a short synthesis note alongside naming the base and why, the cross-judge's verdict or missing independent gate, each graft with its source candidate, what was rejected and why, any convergence or dropouts, worker/model diversity limits, and the checks actually performed.
