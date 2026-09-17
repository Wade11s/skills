# Failure and Recovery

Every wave needs an answer for silence, for work that never converges, for a user who changes their mind, and for a Main session that lost its notes. This reference owns those four.

## Stall ladder

Silence is a stall signal, not progress. A Dispatch is stalled when its `check --wait` window closes with no matching message, or when a requested heartbeat cadence is missed twice. Climb one rung at a time, recording what each rung showed:

1. `worker-show <dispatch> --json` for Dispatch state and terminal accounting.
2. One bounded `worker-read` to see whether the agent is working, waiting on input, or dead.
3. When it is waiting on a decision it never turned into an `ask`, send that guidance once with `send --to dispatch:<id>`.
4. On a second empty window, `worker-stop` it; when its process cannot be proven stopped, `worker-abandon` it.
5. Relaunch with `worker-start --retry-of <dispatch>` carrying the full role Task plus the durable artifacts (commits, review report, active findings), because a replacement session has no cached context.
6. After two failed relaunches on one ticket, that ticket becomes `blocked` and Main receives the escalation with the ladder evidence.

The ladder tops out where the runtime does: Orca circuit-breaks a dispatch context after three consecutive failures on one Task and marks the Task `failed`, which is the original attempt plus those two relaunches.

A stalled Dispatch stays visibly unsettled until one of these rungs resolves it. Keep the Task row honest as it moves: `task-update --id <task> --status blocked|failed --result <json>` records what the ticket outcome already says, so a later `task-list --run` sweep reads the same truth.

## Per-ticket terminal states

Every wave ticket ends in exactly one state, and `wave_done` reports it:

| State | Meaning | Required handling |
|---|---|---|
| `integrated` | reviewed, merged, tracker completion applied and read back | normal cleanup |
| `submitted` | reviewed, validated, and published for human merge under the frozen mode | normal cleanup |
| `blocked` | cannot proceed without a decision or an unmet dependency | escalate to Main with evidence; preserve commits, branch, worktree, and review artifacts |
| `abandoned` | the user stopped it, or repair attempts were exhausted | preserve the same artifacts and name the reason |

Apply publication and tracker completion through
[Main advance and publication](issue-worktree-loop.md#main-advance-and-publication)
and [Completion](tracker-adapter.md#completion).

Apply dependency-failure propagation and launchability through the
[blocker evidence contract](tracker-adapter.md#blocker-evidence-contract).

**Review that never converges.** After the manifest's `maxIncrementalReReviews` focused cycles, run one clean-room review with a fresh Reviewer and the full Task. If that pass also returns `REQUEST_CHANGES`, stop dispatching fixes: the ticket is `blocked`, and Main receives both review artifacts and the surviving finding list.

**Worker `outcome=failed`.** Retain the terminal and keep the worktree. A mechanical or environment failure the report already diagnoses earns one delta re-dispatch; a product, scope, or design failure goes straight to Main as an escalation.

## User abort

When the user asks to stop an active ticket or the whole wave:

1. Main sends the exact ticket or wave scope to the Coordinator Run and waits
   for acknowledgement. This is the explicit-wait case for `check --wait`.
2. The Coordinator stops affected live Dispatches with `worker-stop`, or
   `worker-abandon` where a process cannot be proven stopped, and leaves
   committed work in place.
3. Main stays unchanged for affected work. An in-flight integration candidate
   is discarded rather than advanced.
4. The configured tracker keeps its current lifecycle state: unfinished tickets
   get no completion comment or classification write, only a report of where
   they stopped.
5. Record each affected ticket as `abandoned` with reason `user abort` and the
   retained worktrees and terminals that would let it resume. A ticket-scoped
   abort leaves unrelated tickets running and appears in the eventual
   `wave_done`; a wave-scoped abort sends `wave_done` immediately after every
   affected Dispatch settles.
6. Main closes the Coordinator terminal only for a wave-scoped abort and
   reports the stopping point to the user.

## Resume

Durable wave state lives in Orca rows, the configured tracker, and the two
temporary files, never in a chat transcript:

| State | Source |
|---|---|
| Main Run binding | `ORCA orchestration run-current --json` |
| Alignment and wave Tasks | `task-list --run <run> --brief --json` |
| Terminal ownership | `worker-list --run <run> --json` |
| Confirmed Wave Manifest and handoff | the OS temporary wave directory whose name is derived from `waveId` |
| Ticket truth | the full-read operation in `docs/agents/issue-tracker.md` |

To resume:

1. Re-establish the Main Run with `run-current --json`.
2. Sweep the inbox with plain `check --json` and process any unacknowledged mail
   batch first; replay is by design, so nothing else happens until that batch is
   handled.
3. Scope `task-list --run` and `worker-list --run` to that Run to see what is live, retained, or settled.
4. Compute the OS temporary wave directory from `waveId` and read the Wave
   Manifest there. If it is gone, re-run the complete Execution Gate and get
   fresh user confirmation instead of inferring parameters from running
   terminals.
5. Reconcile each ticket through the Wave Manifest's Tracker Adapter plus its worktree `HEAD` before dispatching anything new.

If the current integration identity or Adapter revision differs from the Wave Manifest, preserve the wave and report setup drift. Do not migrate an active wave or switch providers during recovery.

Broad inventory commands (`run-list`, `terminal list`, `worktree list`) belong to this recovery path and an explicit legacy-run handoff, not to the normal loop.
