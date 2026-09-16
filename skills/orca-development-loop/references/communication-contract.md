# Communication Contract

Workers and Reviewers follow the preamble Orca injects plus this bounded contract; they do not relearn the command surface through repeated skill or help calls.

## Task spec and injected preamble

Every dispatched prompt has two authors:

| Part | Author | How it gets there |
|---|---|---|
| **Lifecycle preamble**: Task/Dispatch IDs, capability, the exact `worker_done` command with its correct `--from`, heartbeat and `ask` instructions | Orca | injected automatically by `worker-start`, or by `dispatch --inject` |
| **Task spec**: role, fixed context, deliverable, validation commands, communication expectations | this skill's templates | `task-create --spec <text>`, rendered from `templates/` |

So the Coordinator writes only the spec body. It never hand-writes a lifecycle envelope, and a re-dispatch gets a fresh preamble from the runtime rather than a copied one. To see the exact preamble a Dispatch would deliver, use `dispatch --dry-run --return-preamble`; to inspect one already delivered, use `dispatch-show --task <id> --json`.

The same split explains why the delivery Coordinator arrives through a full handoff. Nested worker depth is counted from the terminal that issues the command and defaults to one generation, and creating a new Run does not reset it, so a Coordinator that was itself a supervised Dispatch could not dispatch Workers at all.

## Command surface

Orca accepts a fixed `--type` enum: `status`, `dispatch`, `worker_done`, `merge_ready`, `escalation`, `handoff`, `question`, `decision_gate`, `heartbeat`. The lifecycle names this skill uses are **subjects carried by those types**, so every send maps through this table and every receiver routes on `subject`.

| Lifecycle signal | Sender to recipient | Command shape |
|---|---|---|
| Coordinator ready | Coordinator to Main Run | `send --to run:<mainRun> --type status --subject coordinator_ready --phase coordinator_ready --body <run id + manifest version>` |
| Profile mismatch | any role to its owning Run | `send --to run:<owner> --type escalation --subject profile_mismatch --body <expected vs actual>` |
| User-level escalation | Coordinator to Main Run | `send --to run:<mainRun> --type escalation --subject "escalation: <topic>" --body <decision needed>` |
| Wave completion | Coordinator to Main Run | `send --to run:<mainRun> --type handoff --subject wave_done --body <bounded report>` plus `--report-path` when a durable artifact exists |
| Implementation or review completion | Worker or Reviewer to owning Run | the injected envelope: `send --type worker_done --subject <status> --outcome succeeded\|failed --task-id <id> --dispatch-id <id> --files-modified <csv>` |
| Blocking decision | Worker to Coordinator | `ask`, resuming the same question rather than opening a duplicate |
| Liveness | Worker to owning Run | `send --type heartbeat --subject alive --phase <phase>` |

Payload rules for every send:

- prefer the structured flags (`--task-id`, `--dispatch-id`, `--outcome`, `--files-modified`, `--report-path`, `--phase`) over raw `--payload` JSON, and never mix the two forms in one command;
- `worker_done` requires an explicit `--outcome`, is an exact-Dispatch signal that cannot target a group, and is sent exactly once per Dispatch;
- each lifecycle signal is sent once. A signal that already succeeded is never re-sent.

When a send fails with `invalid_argument`, take the valid flag set from that error and retry exactly once. When a call returns `outcome_unknown` or an ambiguous failure, resolve it with `request-show` or replay it with the same `--retry-request` id rather than sending a second copy blind. `dispatch` and `worker-start` refuse preflight cases with a stable `error.code` (`task_not_found`, `task_not_startable`, `inject_rejected`, `runtime_error`) whose recovery the version-matched guide tabulates; read the code and treat `error.data.nextSteps` as the recovery text. After `worktree rm` or a terminal close, that handle is never queried again.

## Coordinator receive policy

`check --wait` first reads the inbox, then blocks only when no matching message exists. A matching message wakes it immediately; the timeout is only the maximum empty window.

Filter on the types that must wake the Coordinator: `worker_done`, `escalation`, and `question`. Profile mismatches arrive as `escalation`, so that filter already catches them. Routine `status` and `heartbeat` messages do not need to wake it.

A Delivery is a transaction:

1. read its complete batch;
2. process every message, routing on `subject`;
3. make retain/reuse/release decisions for settled Dispatches;
4. reply or escalate where needed;
5. acknowledge the Delivery once.

Unacknowledged Deliveries replay by design. Parse complete JSON and select fields afterward instead of truncating raw JSON with `tail`.

## Worker contract

A Worker:

- follows the exact Task and Dispatch IDs in its injected preamble;
- checks structured guidance at natural checkpoints named in the Task, normally task start, before commit, and before completion;
- uses `ask` for a blocking decision and resumes the same question rather than creating duplicates;
- sends heartbeat only at the requested cadence for genuinely long work;
- sends exactly one `worker_done` with explicit `succeeded` or `failed` outcome;
- includes changed files, commits, commands/tests, findings, and residual risk;
- ends the dispatched turn after `worker_done` and remains idle.

A valid `worker_done` settles the active Task/Dispatch, so no extra `SETTLED` status message is required.

## Reviewer contract

A Reviewer follows the Worker lifecycle but remains read-only and reports two separate dimensions:

- **process outcome**: whether review completed;
- **verdict**: `ACCEPT` or `REQUEST_CHANGES`.

A completed review that requests changes uses `outcome=succeeded`. Its report names the fixed point, reviewed head, commands, findings with severity/evidence, verdict, and residual risks. It leaves fixes to the Worker and performs no tracker write unless the Task explicitly grants one through the configured Adapter.

## Follow-up ownership

Alignment is the exception to the retained-context loop. After Main accepts a valid Alignment completion Delivery and determines that no immediate alignment follow-up is needed, it calls `worker-release` before acknowledging. Later requirement work starts a fresh Alignment Agent.

For delivery Workers and Reviewers, after `worker_done` the Coordinator accounts for the terminal before acknowledging the Delivery:

- `worker-retain` parks it for a likely fix/re-review cycle;
- `worker-start --task <next> --terminal <handle>` reuses that retained session, taking the handle from `worker.agent_terminal_handle` in `worker-show --dispatch <id> --json` so Orca transfers cleanup ownership to the new Dispatch;
- a retained-session Task is a delta: send the mandatory fresh lifecycle envelope plus changed commits, complete active findings, acceptance changes, and explicit reference invalidations;
- keep stable role/profile, Orca guidance, tracker ticket/spec, and project docs in cached session context rather than repeating them in the delta Task;
- if retained-session reuse is rejected or stale, a fresh role terminal in the same worktree receives the full role Task plus durable commits/report/findings;
- `worker-release` closes a settled owned resource when its context is no longer needed;
- `worker-stop` cancels a live supervised Worker, and `worker-abandon` fences one whose process cannot be proven stopped.

Retained terminals are context caches. The worktree, commits, configured tracker ticket, and review artifact remain the durable source of truth, so replacement remains safe. `worker-list --run <run>` reports terminal accounting separately from Task status when ownership needs an audit.

## Main and Coordinator

The top-level Coordinator is not a Main Run Dispatch. It creates its own Run and sends the four bounded upstream signals from the table above: coordinator ready, profile mismatch, user-level escalation, and wave completion.

Main sends any approved answer to the Coordinator Run. Inner questions, status, heartbeat, Worker completion, and Reviewer completion stay inside the Coordinator Run.

Main stays idle for chat and sweeps its Run with plain `check --json` at the start of turns while work is active. An injected "You have orchestration mail" prompt is only a wake notification; Main still calls `check` for the Delivery. Coordinator correctness relies on rolling `check --wait`, not on idle notification injection.

## Profile mismatch

Every launch receipt must prove requested and effective role profiles match. On mismatch, the launched role performs no work: it reports expected and actual harness/model/reasoning settings to the owning Run under the `profile_mismatch` subject and waits for a revised, user-confirmed Wave Manifest.
