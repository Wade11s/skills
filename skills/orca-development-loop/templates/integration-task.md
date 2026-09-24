# Integration Task Template

## Role and profile

Integration Worker for accepted ticket `<TICKET-REF>`.

Confirmed profile: `<harness> / <model> / <reasoning>`.
Work only in the assigned integration checkout `<selector/path>` at candidate `<sha>`.
Checkout class: `<existing Issue Worktree after clean preflight | dedicated Integration Worktree after conflict preflight>`.

## Inputs

- Accepted implementation branch/head: `<ref/sha>`
- Original review verdict: `<reference>`
- Merge preflight/conflicts: `<artifact or exact list>`
- Required final acceptance and post-integration checks: `<references>`

## Required skills

<Exact names, installed entry points, and prerequisite inputs selected by the
[unattended role skill contract](../references/communication-contract.md#unattended-role-skills).>

When the preflight contains content conflicts, this Task must use the dedicated Integration Worktree. When a clean candidate fails combined-state validation, this Task reuses the existing Issue Worktree. Load and execute every Required skill. Preserve both accepted implementation intent and current main behaviour; do not invent unrelated product behaviour. Resolve or repair and commit the result, run the required checks, and leave the assigned checkout clean.

The resulting state is new and requires an Integration Reviewer in this same checkout before main advances.

Send one `worker_done` through the injected lifecycle command with the
integration commit, resolved files, decisions, tests, and residual risk; then
idle.
