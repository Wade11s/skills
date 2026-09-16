# Incremental Re-review Task Template

This is a **delta Task** for the retained Reviewer. The original role, confirmed profile, tracker ticket/spec context, project docs, Orca guidance, and loaded review protocol remain valid unless listed under Invalidations. The fresh Dispatch lifecycle envelope supplies the new IDs, capability, and exact completion command.

## Delta

- Previously reviewed head: `<sha>`
- New head: `<sha>`
- Diff command: `<exact incremental command>`
- Prior verdict/report: `<reference>`
- Findings and Worker dispositions: `<complete bounded list>`
- Changed acceptance criteria: `<none or exact changes>`
- Invalidated references to reload: `<none or references>`

Review the incremental diff against every active prior finding and confirm that the fix introduces no regression or unrelated change. Continue using the already loaded review protocol; reload only an explicitly invalidated reference.

Report process outcome separately from `ACCEPT` or `REQUEST_CHANGES`. Send exactly one `worker_done` through the fresh lifecycle envelope, then end the turn and remain idle.
