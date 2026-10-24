---
name: swarm
description: "Coordinate N workers, collect their evidence, and return one report. Use for /swarm, 'swarm this', or parallel coverage, races, gauntlets, and exploration."
---

# Swarm

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

## Start

Open a native todo list or Markdown checklist with one entry per phase before launching anything.

1. Frame
2. Fan out
3. Aggregate
4. Report

## Phase A: Frame

1. State the done predicate and the artifact or report the swarm must return.
2. Choose the shape. Partition into slices, race N workers on identical briefs, or mix both. For a race or mixed shape, declare `first pass`, `rank all`, or `best-of` before spawning.
3. Resolve `swarm workers` by the startup precedence, default `inherit-parent`. Omit model selection for `inherit-parent` / `auto`. Use only confirmed IDs supported by the worker interface. If a configured model is rejected, report it and ask for an alternative or an explicitly authorized parent-model fallback. A missing preference file is normal; surface invalid or unreadable affected preferences before use rather than treating them as missing. Use the project budget, then global budget, through supported host settings; disclose unapplied effort without changing model IDs. For a model race, confirm each arm's override up front. Same-family or parent-model arms are separate attempts with **no model-family diversity**, not a multi-model comparison. Model selection requires no companion skill; if an optional orchestration companion is absent, perform these steps directly and disclose it.
4. Give each worker its own writable output when it writes. When workers verify or measure commits, each brief names the exact SHAs. A measurement brief also names the method (sample count, what one sample is, order). The worker records both in its result.

## Phase B: Fan out

Use ordinary workers through the host's available delegation interface. Check concurrency, background execution, checkout isolation, and local/remote access before depending on them. Choose an environment that can access the authorized inputs; do not upload private code or publish a branch merely to obtain a remote worker. Each worker must start from the exact supplied ref or SHA when the task requires one. If that baseline cannot be provided, mark the arm blocked rather than substituting another.

Launch concurrently when supported, otherwise sequentially and disclose lost parallel timing. Without delegation, execute separable slices directly as scoped checks. Label them same-context work, not independent workers. A parallel race, independent-verification requirement, or timing comparison remains unverified without the needed capability; do not manufacture results. Forward the original project root, preference paths, effective roles, budget, and overrides with every brief.

Every brief stands alone. Include the goal, scope, exact slice or race arm, how to verify, and what to report. Reports use `PASS`, `ISSUES`, or `BLOCKED` with evidence. A worker that can prove a defect reports `ISSUES` and lists every issue it can prove, not only the first.

If a worker drops out, proceed with N-1 and note it. Collect terminal results and clean up workers through the host's supported interface. File edits, destructive cleanup, and external writes remain within the user's authorization.

## Phase C: Aggregate

Read the terminal results and inspect their evidence artifacts rather than trusting status labels alone. Drop a result that does not record the SHAs and method its brief names, and retry that worker or direct scoped check once when permitted. After a second miss, record a gap. A gap does not count as a pass. For coverage, every required slice needs a result. For a race, apply the selection rule declared up front. Use first pass, rank all, or best-of; only claim the parallel race result when parallel execution actually occurred. Do not paste raw worker dumps.

## Phase D: Report

Return one consolidated in-chat report with a result table, issue one-liners, evidence checked, gaps or dropouts, the race rule when used, and independence, timing, or model-diversity limits.
