---
name: resolving-merge-conflicts
description: "Resolve an in-progress git merge/rebase conflict or an assigned integration conflict after preflight. Use for conflict resolution in a named worktree, not for ordinary integration without conflicts."
---

1. **Confirm the assigned worktree and conflict.** Work only in the worktree assigned by the user or Orca Task. Check its git history, merge/rebase state, and conflicting files. If no worktree is assigned in an unattended Dispatch, request the assignment through the Coordinator before acting.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made, and what the original intent was. Read the commit messages, check the PRs, check original issues/tickets.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour. If resolution is blocked by missing intent, access, or an unsafe state, report the blocker to the user or, for an unattended Dispatch, through the Coordinator rather than forcing a resolution or aborting the assigned operation.

4. Discover the project's **automated checks** and run them, typically typecheck, then tests, then format. Fix anything the merge broke.

5. **Finish the merge/rebase** when all conflicts are safely resolved and checks pass. Stage resolved files and commit the merge. If rebasing, continue the rebase process until all commits are rebased. If blocked, leave the operation intact and report its exact state and next required decision.
