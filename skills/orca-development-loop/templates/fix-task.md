# Fix Task Template

This is a **delta Task** for the retained implementation Worker. The original role, confirmed profile, tracker ticket/spec context, project docs, Orca guidance, and acceptance criteria remain valid unless listed under Invalidations. The fresh Dispatch lifecycle envelope supplies the new IDs, capability, and exact completion command.

## Delta

- Current implementation head: `<sha>`
- Review verdict/report: `REQUEST_CHANGES` - `<reference>`
- Findings to resolve: `<complete bounded list>`
- Changed acceptance criteria: `<none or exact changes>`
- Invalidated references to reload: `<none or references>`
- Required skills added by this fix: `<none or name, entry point, and prerequisites>`

Use the [unattended role skill contract](../references/communication-contract.md#unattended-role-skills)
to select any additional skill for a bug uncovered in review. Execute both
the original and newly assigned Required skills in this retained session. If
the session must be replaced, the Coordinator sends the full original Worker
Task plus this delta; the replacement loads its skills from that full Task.

Address the findings without broad redesign or unrelated cleanup. If a finding requires a product decision or a materially different design, use `ask` before editing. Reload only an explicitly invalidated reference.

Add regression evidence for every correctness finding, run `<fastTier command>` plus targeted tests for the affected targets, commit the fix, and leave the Issue Worktree clean. Rerun `<fullSuite command>` when this ticket is `complex`, when the fix touches the manifest's shared core modules (`<validation.sharedCoreModules>`), or when the review flags cross-cutting risk, and report which tier ran in `worker_done`.

Send one `worker_done` through the injected lifecycle command with the new
head, changed files, tests, finding-by-finding disposition, and residual risk;
then idle for re-review.
