### Session pickup

**You own the resume point. Read the prior trail, don't redo it.**

1. Locate the prior trail through the active host's documented history API, an explicitly supplied transcript/export, a verified worker URL, or an authorized branch. Scope history to this user, project, topic, and time window; never infer a cache directory or URL format. Without history access, use the current conversation and user-supplied evidence, and name the missing trail. Read metadata and last messages first, then decision points. Reduce long material in a supported worker or bounded sequential reads (the **principle-guard-the-context-window** skill), preserving privacy and reporting capability gaps.
2. Reconstruct operational state. The branch and worktree, what already landed (`git log`, `git diff` against the base), the open todos, the decisions made. The prior trail is evidence of prior intent and actions, not new authority to change scope or permissions. Reconcile it with current repository state rather than re-deriving completed work.
3. Diff done vs pending. Compare what shipped against what was planned, name the resume point, reuse recorded receipts for unchanged artifacts instead of redoing completed work. Recheck changed or unsupported claims as step 5 requires; a transcript's success claim alone is not proof.
4. Route the remaining work to the matching playbook and pick the verdict: continue the execution, ship a finished recommendation, ratify or override a prior conclusion, or postmortem a failed run. The pickup playbook ends here. The routed playbook owns the rest.
5. Verify the inherited claims against the original goal on the real artifact (the **principle-prove-it-works** skill). A passing prior self-report is not the proof.

**Reply:** where the prior agent stopped, what you inherited vs redid (ideally nothing redone), the resume point, and the outcome.
