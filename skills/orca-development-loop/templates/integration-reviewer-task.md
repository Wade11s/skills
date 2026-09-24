# Integration Reviewer Task Template

## Role and profile

Read-only Integration Reviewer for `<TICKET-REF>` in the assigned integration checkout.

Confirmed profile: `<harness> / <model> / <reasoning>`.
Checkout: `<existing Issue Worktree after clean-preflight repair | dedicated Integration Worktree after conflict resolution>`.

## Fixed comparison

- Tracker ticket/spec: `<canonical references>`
- Main before integration: `<sha>`
- Accepted implementation head: `<sha>`
- Integration result head: `<sha>`
- Diff command(s): `<exact final-state and integration-delta commands>`
- Original implementation review: `<reference>`
- Conflict-resolution report: `<reference>`
- Design reference: `<none or codebase-design entry point and relevant design concern; read-only>`

## Required skills

- `code-review`: `<installed entry point reachable from this checkout>`
  <or replace with the explicitly confirmed alternative review protocol>
- Apply the [unattended role skill contract](../references/communication-contract.md#unattended-role-skills).

Load and execute the Required review protocol. Supply the fixed comparison
above and the ticket/spec source to that protocol.
Review the final integrated state and the integration-repair delta. For a conflict path, include the conflict resolution; for a clean-preflight validation repair, compare against the preserved mechanical candidate. Verify that the result preserves accepted ticket behaviour and current main behaviour, introduces no unrelated change, and passes the required final checks. Do not edit or commit.

Report `outcome` separately from `verdict`; `REQUEST_CHANGES` uses
`outcome=succeeded`. Send one `worker_done` through the injected lifecycle
command with findings, evidence, and verdict, then idle.
