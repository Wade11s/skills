### Autonomous run

**You own the exit condition. Define done, then drive to it without stopping.**

1. State the exit condition as a checkable predicate before the first iteration (tests green, repro fixed, all N PRs merged, pixel-diff zero).
2. Check the host's wake capabilities before choosing one. For CI, merges, or ref changes, prefer a supported event watcher; add a long heartbeat only if scheduling is available. Otherwise use bounded in-session polling sized to when the result is worth checking. Without persistent wake support, disclose that unattended continuation is unavailable and leave a durable checkpoint when the session ends. Use supported worker settings per the Subagents section.
3. Each iteration makes the smallest change the evidence justifies, verifies it against the predicate, commits if it advanced, discards changes that didn't help. Belt-and-suspenders that "might help" gets reverted, not left to ride.
   Sequence the work via the **sequence-verifiable-units** principle skill, verifying each unit before the next instead of batching checks at the end.
4. Handle discoveries only inside the authorized scope. Diagnose broken skills, related bugs, flaky verifiers, tooling failures, and drift; park out-of-scope follow-ups with evidence. Make a separate fix or PR only when authorized. Questions about access, approval, or operator-only decisions remain real gates, using a structured question capability or plain text. Continue unrelated reversible work while those gates wait. Return to the predicate after each in-scope side fix.
5. Checkpoint every iteration via the **show-me-your-work** skill, a row for what changed and whether the predicate moved.
6. Stop when the predicate is met, the operator stops the run, a permission gate blocks all useful work, or the session/time/cost budget ends. A plateau calls for a new evidence-based approach, not a relaxed predicate. Surface a genuine dead end or checkpoint rather than spinning or promising an unavailable future wake.

**Reply:** the exit condition, iterations run, what landed, what was discarded, final predicate state.
