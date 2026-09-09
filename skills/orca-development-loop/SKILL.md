---
name: orca-development-loop
description: >-
  Two-phase Orca delivery loop for a Linear-tracked repository. Use when the user
  proposes a feature, gives product feedback, wants requirements shaped into
  Linear tickets, or asks to develop, fix, integrate, or coordinate a wave of
  Linear issues through Worker, Reviewer, and merge cycles. For one supervised
  worker with no ticket lifecycle use `orchestration`; for a plain ownership
  transfer use `orca-cli`.
---

# Orca Development Loop

Preconditions: an Orca runtime with orchestration enabled, and Linear reachable through `orca linear`.

This skill is the **router** for two phases sharing one durable chat entry point:

1. **Alignment** turns feature ideas, feedback, and bugs into verified Linear tickets.
2. **Execution** gives an approved ticket manifest to a top-level Coordinator, which owns implementation through integration.

The user talks to the Main Agent. The one deliberate exception is Alignment: the user switches to the Alignment Agent so iterative requirement discussion stays out of Main's context.

`Delivery` always means Orca's unacknowledged FIFO mail batch, never the Execution phase.

## Project context

Repository configuration reaches the session through the root `AGENTS.md` / `CLAUDE.md` `## Agent skills` block that `/setup-matt-pocock-skills` writes. Read a file below at the step that needs it, not at startup.

| Fact | Source | When it is absent |
|---|---|---|
| Issue tracker workflow | `docs/agents/issue-tracker.md` | tell the user to run `/setup-matt-pocock-skills`, then stop |
| Triage label strings | `docs/agents/triage-labels.md` | use the canonical role names as the literal strings and say so once |
| Domain and ADR layout | `docs/agents/domain.md` | proceed silently |
| Confirmed role pools, complexity vocabulary, assignment defaults | `docs/agents/agent-profiles.md` | run full discovery at the gate, then offer to persist it from [the template](templates/agent-profiles.md) |
| Fast tier, full suite, repo-specific acceptance checks | `docs/agents/environment.md`, else `package.json` scripts / Makefile / CI config, else one question to the user | resolved at the Execution Gate and frozen in the Wave Manifest |

This skill names the canonical triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). The literal label strings come from the mapping table in `docs/agents/triage-labels.md`, whose right-hand column each repository may rename.

At the ticket gate, confirm that `docs/agents/issue-tracker.md` records Linear through `orca linear`. Any other tracker means Alignment publishes where Execution cannot read, so stop and tell the user; [the Linear tracker seed](templates/issue-tracker-linear.md) is the file to drop in.

Resolve the Orca executable once, load only the version-matched Orca guide the current operation needs, and cache discovered command capabilities for the rest of the session. A guide already in context counts as loaded on every surface (file read, `orca skills get`, `--help`), across the Main and Coordinator roles alike.

## Bootstrap the Main Run

Before launching Alignment or generating a Coordinator return address:

1. Call bounded `orca orchestration run-current --json` once.
2. If it returns this terminal's current coordinator binding, record that Main Run ID and terminal handle as session state. If no current Run exists, create one, then call `run-current --json` once to verify the new binding.
3. Use that Run as the only Alignment lifecycle mailbox and Coordinator return address.

The normal path stays inside Run-scoped commands: `run-current`, `task-list --run`, and `worker-list --run` are bounded and allowed; `run-list`, `terminal list`, and `worktree list/current` are for an explicit legacy-run recovery handoff. If binding or ownership cannot be verified, stop before creating Tasks, terminals, or handoffs.

To recover a wave whose Main session lost its notes, follow the resume procedure in [Failure and recovery](references/failure-and-recovery.md).

## Invariants

- Main stays in the repository's `main` or `master` checkout as the durable control point: it routes, gates, and reports, and leaves implementation, review, and product merge decisions to dispatched roles.
- Alignment and Coordinator agents get fresh sessions in the current checkout; they need no new Git worktree.
- Alignment is single-use. Main releases that terminal as soon as it accepts the completion Delivery, and a later requirement request gets a fresh profile gate, Task, and Agent.
- The delivery Coordinator is a **top-level handoff**, not a supervised nested Worker: nested worker depth is counted from the issuing terminal and a new Run does not reset it, so only a handoff Coordinator can dispatch Workers at all. It creates its own Run and sends bounded lifecycle mail to the Main Run.
- The Coordinator is orchestration-only. A separately dispatched Reviewer Agent owns every implementation verdict.
- One executable ticket owns one **Issue Worktree** with one mutation owner at a time. Worker, Reviewer, fix passes, re-reviews, and clean integration staging take turns in it; Reviewers are read-only and retained terminals stay idle.
- A retained Worker or Reviewer is a **context cache**. Re-dispatch it with a **delta Task**: Orca's freshly injected lifecycle preamble plus a spec body carrying only changed commits, findings, acceptance changes, or invalidated references.
- Reviewer `ACCEPT` on the exact reviewed head gates integration, and integration is **lazy**: preflight first, reuse the Issue Worktree for a conflict-free candidate, and create an Integration Worktree only once preflight proves content conflicts.
- Role profiles are user-confirmed parameters frozen in an artifact before launch, never defaults hard-coded here. A role may carry a pool of confirmed tuples; the Coordinator assigns one per ticket and pins it.

## Route the request

### Feature, feedback, or unclear bug

Start with an **Alignment Profile Gate**. Read [Alignment Agent](references/alignment-agent.md) and [Profile discovery and launch](references/profile-discovery-and-launch.md), but create no Task or terminal yet.

1. Preserve the user's complete feedback as a bounded, self-contained Initial Request for inlining in the Alignment Task. A fresh session cannot dereference Main's conversation history, and the user should never be asked to repeat it.
2. Discover one recommended Alignment harness/model/reasoning combination through the bounded profile-query path. Enumerate the machine's agent/model/account inventory only when the user asks for alternatives.
3. Propose one exact Alignment profile and wait for explicit user confirmation.
4. Freeze the confirmation in [the Alignment Profile](templates/alignment-profile.md).
5. Only then create a supervised Alignment Task in the current checkout using [the task template](templates/alignment-task.md).
6. Launch and attach the fresh Alignment terminal using the deterministic recipe in the launch reference.
7. Read one bounded post-dispatch attestation. On mismatch, stop and release the incorrect launch, then return to the user with the exact expected and actual values.

The state transition is:

```text
FEEDBACK_RECEIVED
  -> ALIGNMENT_PROFILE_PROPOSED
  -> USER_CONFIRMED
  -> ALIGNMENT_TASK_CREATED
  -> ALIGNMENT_DISPATCH_ATTACHED
  -> ALIGNMENT_PROFILE_VERIFIED
  -> USER_SWITCH_REQUESTED
```

After verification, tell the user the terminal name and confirmed profile, then ask them to switch there. Direct discussion is intentional, so keep its interview questions out of Main. The Initial Request already travels in the Task, so the Alignment Agent works from it instead of bouncing the user back to Main.

The Alignment Agent owns the conversation until it has verified the final Linear ticket manifest and sent its completion. Main then processes that Delivery, keeps the accepted spec and ticket identifiers as the only executable manifest, releases the settled terminal with `worker-release` before acknowledging, and tells the user Alignment is complete. Delivery starts on an explicit request, not on the manifest's arrival.

Tickets reaching the AFK-ready role are not themselves a reason to start a Coordinator.

### Deliver or fix approved Linear issues

Run the **Execution Profile Gate** before generating a handoff or launching a Coordinator.

1. Read every user-supplied or Alignment-produced ticket back through `orca linear`.
2. Require executable tickets to carry the AFK-ready role label, observable acceptance criteria, the intended project/parent relationships, and validated blocking edges. Exclude the needs-info, ready-for-human, and wontfix roles, closed/cancelled tickets, and unresolved tickets unless the user changes their lifecycle first.
3. Compute the current delivery frontier separately from label readiness; a labeled ticket whose blockers remain open is not launchable yet.
4. Audit tracker drift in one bounded sweep: list the tickets' team/project issues through `orca linear` and compare each open issue's state and labels against reality. A spec or parent whose children are all complete is drifting while it sits in a backlog/todo state, and an AFK-ready label on completed work is stale. Correct forward-only, or report the mismatch to the user. The audit ends when every open issue's state and labels agree with its children and scope.
5. Resolve the repository's fast tier, full suite, and repo-specific acceptance checks using the Project context table above.
6. Read each ticket's complexity signal, using the vocabulary in `docs/agents/agent-profiles.md`; a ticket with no usable signal takes the configured default.
7. Read stored role pools from `docs/agents/agent-profiles.md` and revalidate them cheaply, or fall back to the bounded discovery, headroom, and session-cache rules in [Profile discovery and launch](references/profile-discovery-and-launch.md). Finding facts is Main's job; full inventory scans are not.
8. Propose profiles for Coordinator, Worker, Reviewer, Integration Worker, and Integration Reviewer against each role's actual demand, with the Worker and Reviewer drawn from **different model families**. For a multi-ticket wave, propose a small pool per implementation and review role, each entry marked with the ticket complexities it is trusted with. State the parallel-ticket limit and the concurrent-dispatch count it implies, since that product is what the wave actually spends.
9. Wait for explicit user confirmation. Stored, revalidated pools earn a one-line summary and a one-word confirmation; a same-family review pair needs the user's explicit decision, recorded in the manifest.
10. Freeze the confirmed values in [the Wave Manifest](templates/wave-manifest.md) and save it beside the handoff in the OS temporary directory. When discovery ran fresh, offer to persist the result to `docs/agents/agent-profiles.md`.

The state transition is:

```text
TICKETS_READY
  -> PROFILE_PROPOSED
  -> USER_CONFIRMED
  -> HANDOFF_GENERATED
  -> COORDINATOR_PROFILE_VERIFIED
  -> COORDINATOR_RUN_CREATED
  -> EXECUTION_ACTIVE
```

Confirmation is invalidated if the ticket set or any role profile changes. An active Dispatch keeps its confirmed profile; ask whether a revised profile applies only to future Tasks or requires a stop and replacement.

## Generate the Coordinator handoff

After profile confirmation, generate a temporary handoff using [the Coordinator handoff template](templates/coordinator-handoff.md). Follow the generic `/handoff` principles without invoking that user-only skill:

- save outside the repository in the OS temporary directory;
- reference Linear issues, specs, ADRs, and project docs instead of copying them;
- redact secrets and personal data;
- include suggested skills;
- include the Main Run return address and confirmed Wave Manifest.

Launch a fresh Coordinator agent terminal in the current checkout through Orca's **full-handoff** path, deliver the handoff path, and stop monitoring its inner work. A full handoff creates no orchestration Task or Dispatch for the Coordinator.

The Coordinator verifies its actual harness/model/reasoning setting against the manifest before `run-create`. On mismatch it reports a profile mismatch to the Main Run, creates no Run, and idles.

Every orchestration call follows the command surface in [Communication Contract](references/communication-contract.md): the message-type mapping, the structured payload flags, one send per lifecycle signal, and the idempotent retry path. Read [Coordinator](references/coordinator.md) for its full contract.

## Main Run inbox policy

Main stays available for chat rather than blocking for a whole execution wave.

While Alignment or Execution is active:

- sweep the Main Run inbox with plain `check --json` at the start of each new Main Agent turn;
- treat Orca's idle control-mail prompt as a notification to call `check`, not as the Delivery itself;
- route each message by its `subject` lifecycle name, since Orca's `--type` values are a fixed enum shared by several signals;
- use `check --wait` only when the user explicitly asks Main to wait for an answer;
- process every message in the complete FIFO Delivery, perform the required release/close/reply actions, then acknowledge that whole Delivery once;
- accept only bounded Alignment completion, coordinator readiness, escalation, profile mismatch, and wave completion messages.

Inner Worker, Reviewer, heartbeat, and fix-pass messages belong to the Coordinator's Run.

When a wave produces no mail for longer than its expected cadence, follow the stall ladder in [Failure and recovery](references/failure-and-recovery.md) instead of waiting indefinitely.

## Completion

A wave is complete only when `wave_done` arrives in the schema the [Coordinator](references/coordinator.md) reference defines: every ticket resolved as `integrated`, `blocked`, or `abandoned`, with integrated commits, post-integration validation, Linear readback, swept ancestors, settled Dispatches, terminal and worktree disposition, and residual risks. A report missing any of those is incomplete, and Main asks for the remainder before closing the wave.

After processing it, close the top-level Coordinator terminal by its stored handle, then acknowledge the complete Main Run Delivery. It is a full-handoff terminal rather than a supervised Worker, so `worker-release` does not apply to it.

## References

- [Communication Contract](references/communication-contract.md) - message types, payloads, ownership, idempotent retries
- [Coordinator](references/coordinator.md) - wave planning, supervision, integration, reporting
- [Issue Worktree Loop](references/issue-worktree-loop.md) - per-ticket implementation, review, fix, integration
- [Alignment Agent](references/alignment-agent.md) - requirement shaping and ticket verification
- [Profile discovery and launch](references/profile-discovery-and-launch.md) - bounded profile queries, per-harness launch paths
- [Failure and recovery](references/failure-and-recovery.md) - stall ladder, terminal states, abort, resume
