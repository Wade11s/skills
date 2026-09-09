# Issue Worktree Loop

An **Issue Worktree** belongs to one executable Linear ticket. Agent sessions rotate through it; the checkout is not recreated for each role.

One mutation owner holds it at a time: the active Writer, or the Coordinator while it stages a clean integration candidate. Reviewers are read-only, and retained terminals stay idle until a new Dispatch hands ownership back.

## Validation tiers

The Wave Manifest carries three command sets, resolved once at the Execution Profile Gate from `docs/agents/environment.md`, else the repository's own scripts, else one question to the user:

- **fast tier**: the Worker's development inner loop, run before every commit;
- **full suite**: the build/test gate for `worker_done`, reported in the payload with the change-specific runtime checks;
- **repo-specific acceptance checks**: whatever this repository additionally requires of a finished change.

A `REQUEST_CHANGES` fix pass reruns the full suite when the ticket is `complex`, when the fix touches the manifest's shared core modules, or when the Reviewer flags cross-cutting risk. Otherwise the fast tier plus affected-target tests cover the fix, and integration-time full-suite validation backstops the wave. The Reviewer validates those reported claims instead of rediscovering defects.

## Preconditions

Before implementation:

- read the full ticket and comments with `orca linear issue <id> --full --json`;
- record current main/base commit;
- create a top-level worktree from the confirmed base;
- run configured setup;
- confirm the worktree has one mutation owner and no unrelated terminal;
- render a Worker Task with this ticket's pinned Worker entry, the manifest's validation commands, and the communication contract.

## Implementation

1. Launch a fresh implementation Worker in the Issue Worktree.
2. Verify requested and effective harness/model/reasoning settings match.
3. Dispatch the implementation Task.
4. Wait for one valid `worker_done` with an explicit process outcome.
5. Require committed work and a clean worktree before review. An incomplete or dirty result returns to the Worker rather than entering review.
6. Retain the settled Worker terminal so its implementation context survives review.

Retained means parked and idle: a Worker's turn ends with `worker_done`.

Before review dispatch, the Coordinator's boundary is metadata-only: lifecycle IDs/outcome, commit existence, exact `HEAD`, clean status, and base ancestry. Reading the diff or changed files, loading `code-review`, rerunning acceptance tests, and forming a code-quality or spec verdict are the Reviewer's work. Format the fixed comparison for the Reviewer and let the Reviewer run it.

## Review in the same worktree

1. Pin the review base and exact implementation head.
2. Create the read-only Review Task immediately after metadata checks.
3. Launch a fresh Reviewer terminal in the same Issue Worktree using this ticket's pinned Reviewer entry, whose family differs from the Worker's.
4. Give that Reviewer the Task rendered from the Reviewer template.
5. Require the **Reviewer Agent** to load and execute the repository `code-review` protocol or another explicitly confirmed review protocol.
6. The Reviewer reports a process outcome and a separate verdict. There is no Coordinator-generated verdict and no direct implementation-to-integration transition.

```text
outcome=succeeded + verdict=ACCEPT
outcome=succeeded + verdict=REQUEST_CHANGES
outcome=failed    + review could not be completed
```

Review independence comes from a fresh role session, fixed comparison points, and read-only authority rather than another checkout.

## Fix and re-review

On `REQUEST_CHANGES`:

1. Retain the settled Reviewer terminal.
2. Render the delta [Fix Task](../templates/fix-task.md) with the verdict, concrete findings, reviewed head, and any changed acceptance criteria or reference invalidations.
3. Re-dispatch the original retained Worker terminal in the same Issue Worktree. Send the runtime-required fresh lifecycle envelope, but keep stable role/profile/Orca/doc instructions in cached session context.
4. After its new `worker_done`, retain it again.
5. Render the delta [Re-review Task](../templates/re-review-task.md) and re-dispatch the original retained Reviewer terminal.

Reuse is an optimization, not the source of truth. Every delta pass carries exact commits and complete active findings. Durable Task/report artifacts must also be sufficient to replace a stale or vanished terminal; a replacement receives the full first-role Task plus the delta artifact. If the current Orca runtime rejects retained-terminal re-dispatch, launch that replacement in the same Issue Worktree, keeping lifecycle work inside `worker-start` rather than untracked `terminal send`.

After the manifest's `maxIncrementalReReviews` focused cycles, or whenever the fix materially redesigns the solution, launch a fresh Reviewer for a clean-room pass with the full Reviewer Task. Preserve prior findings as an artifact rather than relying on conversation memory. A clean-room pass that still returns `REQUEST_CHANGES` ends the fix loop: see [Failure and recovery](failure-and-recovery.md).

## Integration gate

After final `ACCEPT`, retain the Worker and Reviewer until the accepted state is integrated and all final checks pass. Use **lazy integration**: preflight first, reuse the Issue Worktree for a clean candidate, and allocate a dedicated Integration Worktree only for content conflicts. The durable main checkout stays unchanged until validation passes.

### Take the mutation lock first

Staging in the Issue Worktree writes to a checkout a retained Worker still owns. Before touching it:

1. confirm the Worker and Reviewer Dispatches are settled and their terminals idle (`worker-list --run <run> --json` reports terminal accounting separately from Task status);
2. record the Coordinator as the worktree's current mutation owner;
3. give ownership back with a new Dispatch, or remove the worktree, when integration ends.

A retained terminal that must resume work mid-integration waits for that handback.

### Preflight and conflict-free integration

1. Record current main and run `git merge-tree --write-tree --messages <current-main> <accepted-head>` (or a version-matched non-mutating equivalent). Capture its exit status, tree OID, and conflict messages; this command may write Git objects but must not touch an index or checkout. Preserve the accepted SHA and review artifact as immutable evidence.
2. If `git merge-base --is-ancestor <current-main> <accepted-head>` succeeds, keep that exact accepted head checked out in the Issue Worktree and run all required combined-state build, test, and smoke checks there.
3. If histories diverge and merge-tree succeeds, create the mechanical merge commit from its tree OID with current main as first parent and accepted head as second parent, then switch the clean Issue Worktree onto a temporary integration branch at that commit. Leave the accepted implementation branch where it is. The candidate tree must equal the preflight tree, with product repair and manual content resolution left to the Integration Worker.
4. Run the required combined-state checks in that Issue Worktree.
5. Confirm main still equals the recorded head, then advance it to the validated candidate, preferring a fast-forward; verify main is clean and tree-equivalent.

If combined-state validation fails, main remains unchanged. The Issue Worktree already contains the cleanly merged candidate, so dispatch an Integration Worker there to diagnose/fix it, then require a fresh Integration Reviewer before main advances. The accepted SHA, rather than the worktree's current checkout, remains the original reviewed evidence.

When `git merge-tree --write-tree` is unavailable (Git older than 2.38), get the same non-mutating answer from a throwaway index, for example `GIT_INDEX_FILE=$(mktemp) git read-tree -m --aggressive <merge-base> <current-main> <accepted-head>`, and record which form produced the preflight evidence.

### Conflict integration

Only when preflight reports content conflicts:

1. preserve main and the Issue Worktree's accepted state, then create a dedicated Integration Worktree/branch from recorded current main;
2. launch an Integration Worker there with the accepted branch, original review report, conflict list, and `resolving-merge-conflicts` skill;
3. run tests and commit the integration result;
4. launch a fresh Integration Reviewer in that Integration Worktree;
5. repeat fix/re-review there if required;
6. confirm main has not advanced, then advance it only from the accepted and validated integration result.

Any conflict resolution or validation repair creates product-code state not covered by the original review, so it requires Integration Review. If main advances during staging, preserve the stale evidence and repeat against the new head; use the Issue Worktree again after a clean preflight, or recreate the dedicated Integration Worktree when conflicts remain.

## Linear completion and cleanup

After main advances, post the reviewed/integrated commit and validation evidence with `orca linear comment add <id>`, apply the team's exact completed status and final labels without regressing lifecycle state, then read the issue back with `orca linear issue <id> --json`. Completion invalidates queue semantics, so the finished ticket drops the AFK-ready role label. A successful implementation that remains In Progress or In Review is not complete.

Sweep ancestors before cleanup: for every wave ticket, read its parent through `orca linear`. Close a parent whose children are now all complete, applying the same completion-evidence and readback rules; report a parent with open children or scope beyond its children to Main rather than auto-closing it. The sweep is complete when every swept ancestor is either closed or explicitly left open with a reason the wave report carries.

After integration and Linear readback succeed:

1. release retained Worker and Reviewer Dispatch resources;
2. release Integration Worker/Reviewer resources when present;
3. verify every involved worktree has no live terminal and is clean;
4. remove the Issue Worktree and any conflict-only Integration Worktree safely;
5. preserve orchestration rows, Linear comments, commit references, and review artifacts.

If the user asks to keep a terminal or worktree, record that exception explicitly in `wave_done`.
