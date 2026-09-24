# Reviewer Task Template

## Role and profile

Read-only Reviewer for `<TICKET-REF>` in the implementation's existing Issue Worktree.

Confirmed profile: `<harness> / <model> / <reasoning>`.
Stop and report a mismatch before review.

## Fixed comparison

- Tracker ticket/spec: `<canonical references>`
- Fixed point/base: `<sha>`
- Reviewed head: `<sha>`
- Diff command: `<exact command>`
- Worker report: `<artifact or bounded summary>`
- Design reference: `<none or codebase-design entry point and relevant design concern; read-only>`

## Required skills

- `code-review`: `<installed entry point reachable from this checkout>`
  <or replace with the explicitly confirmed alternative review protocol>
- Apply the [unattended role skill contract](../references/communication-contract.md#unattended-role-skills).

Do not edit files, commit, implement fixes, or change tracker state. You are
the independently dispatched role that owns code review and the verdict; the
Coordinator has not reviewed the patch. Load and execute the Required review
protocol before reporting a verdict.

## Review

Review Standards and Spec independently. Verify the worker's claimed tests and the ticket's acceptance criteria. Report severity, file/line or concrete evidence, and residual risk.

## Result

Report process outcome separately from verdict:

- completed and acceptable: `outcome=succeeded`, `verdict=ACCEPT`;
- completed with blocking findings: `outcome=succeeded`, `verdict=REQUEST_CHANGES`;
- review could not be completed: `outcome=failed`.

Send one `worker_done` through the injected lifecycle command with process
outcome, verdict, commands, findings, evidence, and residual risks; then idle.
