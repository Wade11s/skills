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

## Unattended role skills

Worker and Reviewer Dispatches run without a user in their terminals. The
Coordinator names the `Required skills` in each Task and supplies any
prerequisite decisions or inputs. Select by work, not by model profile:

| Dispatch | Required skill |
|---|---|
| Bug implementation or repair, including a new bug found during feature review | `diagnosing-bugs` |
| Implementation explicitly requiring test-first work | `tdd` (in addition to diagnosis for a bug) |
| Worker designing an approved module interface or test seam | `codebase-design` |
| Worker with an approved source-backed research deliverable | `research`, only when the harness can dispatch a child and the Task permits a research file in the Issue Worktree |
| Implementation or Integration Reviewer | `code-review`, or the explicitly confirmed alternative review protocol |
| Integration Worker resolving content conflicts | `resolving-merge-conflicts` |
| Integration Worker repairing failed combined-state validation | `diagnosing-bugs`; add `tdd` when test-first work is required |

Name the project-installed, model-invocable engineering skill and link its
`SKILL.md` from the receiving checkout. Supply already-confirmed test seams
when assigning `tdd`, and the fixed point and ticket/spec for `code-review`.
When useful to judge an existing design, a Reviewer may consult
`codebase-design` as read-only reference material; it does not redesign or
write files. `research` writes a source-cited report, so it belongs only to
an authorized Worker, not a read-only Reviewer. The Coordinator dispatches
these role skills but does not load them for its own code judgments.
The role loads and executes each named skill autonomously before doing the
relevant work; it never waits for a user to type a slash command in its
terminal. If a skill or prerequisite is unavailable, report the blocker through
the normal Dispatch lifecycle instead of silently skipping it. Retained roles
continue the assigned skill on fix/re-review; replacement roles reload it from
the full Task. Alignment's interactive slash route is separate.

## Command surface

Orca accepts a fixed `--type` enum: `status`, `dispatch`, `worker_done`, `merge_ready`, `escalation`, `handoff`, `question`, `decision_gate`, `heartbeat`. The lifecycle names this skill uses are **subjects carried by those types**, so every send maps through this table and every receiver routes on `subject`.

| Lifecycle signal | Sender to recipient | Command shape |
|---|---|---|
| Coordinator ready | Coordinator to Main Run | `send --to run:<mainRun> --type status --subject coordinator_ready --phase coordinator_ready --body <run id + manifest version>` |
| Profile mismatch | any role to its owning Run | `send --to run:<owner> --type escalation --subject profile_mismatch --body <expected vs actual>` |
| Manifest revision | Main to Coordinator Run | `send --to run:<coordinatorRun> --type handoff --subject manifest_revision --report-path <new manifest path> --body <wave id + version + reason>` |
| Manifest revision accepted | Coordinator to Main Run | `send --to run:<mainRun> --type status --subject manifest_accepted --body <wave id + accepted version>` |
| Manifest revision rejected | Coordinator to Main Run | `send --to run:<mainRun> --type escalation --subject manifest_rejected --body <exact failing check + retained version>` |
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

Filter on the types that must wake the Coordinator: `worker_done`,
`escalation`, `question`, and `handoff`. Profile mismatches arrive as
`escalation`; manifest revisions arrive as `handoff`. Routine `status` and
`heartbeat` messages do not need to wake it.

A mail batch is a transaction:

1. read its complete batch;
2. process every message, routing on `subject`;
3. make retain/reuse/release decisions for settled Dispatches;
4. reply or escalate where needed;
5. acknowledge the mail batch once.

Unacknowledged mail batches replay by design. Parse complete JSON and select fields afterward instead of truncating raw JSON with `tail`.

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

Alignment is the exception to the retained-context loop. After Main accepts a valid Alignment completion mail batch and determines that no immediate alignment follow-up is needed, it calls `worker-release` before acknowledging. Later requirement work starts a fresh Alignment Agent.

For delivery Workers and Reviewers, after `worker_done` the Coordinator accounts for the terminal before acknowledging the mail batch:

- `worker-retain` parks it for a likely fix/re-review cycle;
- `worker-start --task <next> --terminal <handle>` reuses that retained session, taking the handle from `worker.agent_terminal_handle` in `worker-show --dispatch <id> --json` so Orca transfers cleanup ownership to the new Dispatch;
- a retained-session Task is a delta: send the mandatory fresh lifecycle envelope plus changed commits, complete active findings, acceptance changes, and explicit reference invalidations;
- keep stable role/profile, Orca guidance, tracker ticket/spec, and project docs in cached session context rather than repeating them in the delta Task;
- if retained-session reuse is rejected or stale, a fresh role terminal in the same worktree receives the full role Task plus durable commits/report/findings;
- `worker-release` closes a settled owned resource when its context is no longer needed;
- `worker-stop` cancels a live supervised Worker, and `worker-abandon` fences one whose process cannot be proven stopped.

Retained terminals are context caches. The worktree, commits, configured tracker ticket, and review artifact remain the durable source of truth, so replacement remains safe. `worker-list --run <run>` reports terminal accounting separately from Task status when ownership needs an audit.

After tracker readback, release every retained supervised resource, verify each
worktree is clean and has no live terminal, remove eligible Issue and
conflict-only Integration Worktrees, and preserve Task/Dispatch rows, tracker
comments, commits, and review artifacts. Use `terminal close` only for a terminal
outside supervised ownership. Record any user-requested terminal or worktree
retention in `wave_done`.

## Main and Coordinator

The top-level Coordinator is not a Main Run Dispatch. It creates its own Run and
sends only the bounded upstream subjects from the table: `coordinator_ready`,
`profile_mismatch`, `manifest_accepted`, `manifest_rejected`, user-level
escalation, and `wave_done`.

Main sends any approved answer or confirmed manifest revision to the
Coordinator Run. Inner questions, status, heartbeat, Worker completion, and
Reviewer completion stay inside the Coordinator Run.

Main stays idle for chat and sweeps its Run with plain `check --json` at the start of turns while work is active. An injected "You have orchestration mail" prompt is only a wake notification; Main still calls `check` for the mail batch. Coordinator correctness relies on rolling `check --wait`, not on idle notification injection.

## Manifest revision channel

For a permitted change to not-yet-launched work, Main:

1. renders version N+1 with the same `waveId`, `supersedes: N`, and a reason;
2. gets explicit user confirmation;
3. saves the immutable new file beside the original;
4. sends it to the Coordinator Run:

   ```text
   ORCA orchestration send --to run:<coordinatorRun> --type handoff \
     --subject manifest_revision --body <wave id + version + reason> \
     --report-path <new manifest path>
   ```

The Coordinator applies it only between ticket dispatches, with no live
Dispatch for a touched ticket. It re-runs its startup checks for profile
dictionary resolution, launch purposes, blocker evidence, Adapter revision, and
write eligibility. It replies with `manifest_accepted`, or sends
`manifest_rejected` naming the exact failing check and continues under version
N.

A revision may rebind roles or profiles, remove tickets, or refresh blocker
evidence and delivery order only for not-yet-launched work. It may not add
tickets or retroactively change validation commands or the Adapter revision for
already-integrated tickets. In-flight tickets finish under their launch
version, which `wave_done` records per ticket. A needed change to an in-flight
ticket uses the user-abort flow, then a new wave.

## Profile mismatch

For `receipt` or `attestation` evidence, an observable mismatch stops work: the
launched role reports expected and actual harness/model/reasoning settings to
the owning Run under `profile_mismatch`. Main uses the manifest-revision channel
for not-yet-launched replacement work. `user-attested` evidence has no
independent provider/model observation to mismatch; every confirmation carries
that limitation instead.
