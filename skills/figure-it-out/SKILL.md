---
name: figure-it-out
description: "Design an auditable playbook when no narrower one fits: a large migration, an ambitious multi-part change, or work a human reviews after stepping away. Scales rigor to the task, runs a hypothesis loop, and logs decisions. Use for /figure-it-out or 'figure it out'."
---

# Figure it out

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

When the task matches no playbook, design one. The deliverable before any code is the workflow itself: a sequence of phases that scales rigor to the task, runs the scientific method, and leaves a decision trail a human can audit after stepping away.

## Start

Use a native todo list or a Markdown checklist. Resolve optional **poteto-mode** from the active catalog and read its Principles section when available. Then add the phases below. The parent owns this workflow; delegates receive scoped units, not the whole playbook.

Resolve every named companion from the active catalog before use, not a vendor installation path. If missing, perform its scoped work directly, name the missing skill, and mark any unmet gate. Without poteto-mode, use the discipline below directly: baseline first, smallest verifiable units, isolated writes, evidence over self-report, and an auditable decision trail. Do not claim to have read missing principle leaves.

All model roles default to `inherit-parent`. For delegates, resolve the relevant code role, `hardest tasks`, or `judgment and prose` through project > global > supported default > `inherit-parent`. Forward the original root, both preference paths, effective roles, budget, and explicit overrides even across worktrees. Use exact confirmed host model IDs and supported effort controls separately; report a rejected preference rather than silently switching families. Repeated parent-model attempts provide no model diversity.

Execution stays within the user's grant. Commit, push, PR publication, external messages, merges, paid runs, destructive cleanup, and credential changes require the applicable authorization. A request to design a playbook is not permission to execute it. If a unit authors or edits a skill, require English SKILL.md and bundled resources, including examples, comments, templates, prompts, errors, and guides. Session replies use the user's language.

## Phase A: Frame

Ground first, then commit. Don't start the run until you can state:

- The definition of done as a falsifiable predicate (the **principle-prove-it-works** skill).
- Scope, quantified: rough units and effort, plus the blockers grounding surfaced.
- The rigor level, biased high. One-way doors and high blast radius get more. Reversible low-stakes steps get less. Rigor is gates and artifacts, not "try harder".

Present the framing and tradeoffs before committing to a long run. Authorized reversible prep proceeds (the **principle-never-block-on-the-human** skill), but a multi-hour run earns one checkpoint. A plan-only request stops after the designed workflow; execution waits for the user's go.

## Phase B: Design the workflow

Decompose into atomic, independently-landable units. Sequence riskiest-unknown-first. Scaffold and verification come before features (the **principle-foundational-thinking** skill).

- Build the verification harness before the work, with the baseline captured from the pre-change state, so the check reads as "old value vs new value".
- For one-way-door design decisions, use optional **architect** and **arena** for alternatives and review. If absent, compare concrete alternatives directly, prototype unknowns, and record the lost independent design review. Skip this for mechanical work whose shape is already concrete. A second bakeoff over a settled design is over-engineering (the **principle-laziness-protocol** skill).
- Decide what fans out. Parallelize only across seams, with one writer per isolated worktree or branch (the **principle-separate-before-serializing-shared-state** skill). Check delegation, isolation, nesting, and background support first. Use the host's generic workers; when poteto-mode is present, follow its Subagents section and local delegate prompt. Without delegation, execute useful separable units sequentially and label review as self-review. Record lost parallel timing and independence.
- Write the designed phase list down. That list is what the human reviews.

Then execute the design. Add its steps to the todolist as concrete items between the Phase C and Phase D entries. Run each under the Phase C loop discipline, and weave the Phase D log through them, a row as each step lands, rather than saving the whole trail for the end.

## Phase C: Run the loop

Each unit is an experiment. State the hypothesis, make the smallest change, measure against the predicate on the real artifact, keep it if it advanced, revert it if it didn't. Apply the **principle-sequence-verifiable-units** skill, verifying each unit before starting the next instead of batching checks at the end.

- Verify by inspecting the artifact, never a self-report. When something passes too easily, suspect the observation method before the system.
- Pair delegated work with a separate judge when supported. No separate reviewer means self-review only, with independent proof still unverified. If a worker games the gate, reset its authorized changes and harden the contract. If the gate itself is wrong, propose or make a separately authorized gate change rather than routing around it.
- A verdict is VERIFIED, NOT VERIFIED, or INCONCLUSIVE. Inconclusive is not a pass. Don't hide a negative.

## Phase D: Keep the audit trail

Use optional **show-me-your-work**. If absent, maintain a local Markdown or TSV log with one row per unit: hypothesis, action, evidence, keep/revert verdict, and open decisions. Use a host-provided writable store or an agreed project-local scratch path, and report that path. Keep private context and secrets out of public artifacts. Commit or publish a sanitized trail only when authorized. The trail plus the diff lets the human audit the run; it does not replace independent proof.

## Phase E: Verify and hand back

Check the whole against the Phase A predicate on the real product, not just the harness. Encode any recurring correction as a gate, a lint rule, a check, or a script (the **principle-encode-lessons-in-structure** skill).

**Reply, in the user's language:** the playbook you designed, the rigor level and why, the decision-trail path (or not started for plan-only), what's verified against the predicate, and what's still open. Name missing companions or capabilities, and distinguish measured evidence, self-review, and independent verification.
