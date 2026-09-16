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

Do not edit files, commit, implement fixes, or change tracker state. You are the independently dispatched role that owns code review and the verdict; the Coordinator has not reviewed the patch. Load and execute the repository `code-review` protocol unless the Wave Manifest names another protocol.

## Review

Review Standards and Spec independently. Verify the worker's claimed tests and the ticket's acceptance criteria. Report severity, file/line or concrete evidence, and residual risk.

## Result

Report process outcome separately from verdict:

- completed and acceptable: `outcome=succeeded`, `verdict=ACCEPT`;
- completed with blocking findings: `outcome=succeeded`, `verdict=REQUEST_CHANGES`;
- review could not be completed: `outcome=failed`.

Follow the injected Orca lifecycle command and IDs. Send exactly one `worker_done`, end the turn, remain idle for retain/reuse/release, and do not send an extra SETTLED status.
