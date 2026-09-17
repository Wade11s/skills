# Integration Reviewer Task Template

## Role and profile

Read-only Integration Reviewer for `<TICKET-REF>` in the assigned integration checkout.

Confirmed profile: `<harness> / <model> / <reasoning>`.
Checkout: `<existing Issue Worktree after clean-preflight repair | dedicated Integration Worktree after conflict resolution>`.

## Fixed comparison

- Main before integration: `<sha>`
- Accepted implementation head: `<sha>`
- Integration result head: `<sha>`
- Original implementation review: `<reference>`
- Conflict-resolution report: `<reference>`

Review the final integrated state and the integration-repair delta. For a conflict path, include the conflict resolution; for a clean-preflight validation repair, compare against the preserved mechanical candidate. Verify that the result preserves accepted ticket behaviour and current main behaviour, introduces no unrelated change, and passes the required final checks. Do not edit or commit.

Report `outcome` separately from `verdict`; `REQUEST_CHANGES` uses
`outcome=succeeded`. Send one `worker_done` through the injected lifecycle
command with findings, evidence, and verdict, then idle.
