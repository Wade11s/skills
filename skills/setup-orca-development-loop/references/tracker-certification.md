# Tracker Certification

Use this reference only while selecting and configuring the primary work
tracker. The selected integration must be visible to Orca; its command
transport may be Orca-native or a separately verified provider CLI.

## One tracker, separate review surface

The primary work tracker owns specs, executable tickets, lifecycle state,
triage, complexity, and dependency truth. A Git provider may remain the
code-review surface while another integration owns tickets. A current linked
issue is only evidence; it never overrides the user's repository-level choice.

## Candidate eligibility

Before proposing a tracker, use only read-only checks:

1. Orca identifies the project and integration.
2. Authentication or a bounded read succeeds.
3. Issue/work-item identity and scope can be resolved.
4. Worktree linkage has a documented, version-matched path.
5. The command transport and its help/guide can be loaded.
6. Lifecycle, classification, and relationship metadata can be inspected.

Do not enumerate unrelated accounts, organizations, repositories, or tickets.
Do not recommend an integration that fails a required read. Never start an
interactive login or create credentials; report the exact authentication step
the user must complete.

## Adapter contract

`docs/agents/issue-tracker.md` implements the runtime Tracker Adapter and
exposes these normalized operations:

| Group | Operations |
|---|---|
| Inspect | read one full ticket, search/list, list lifecycle values, list classification values, read parent/dependencies |
| Publish | create or update a ticket/spec, add a comment |
| Classify | set lifecycle, triage role, and complexity |
| Relate | set parent, add/remove dependency, link worktree, attach code-review evidence |
| Verify | compute the ready frontier and read final state back |

The implementation may use several commands, but callers should need only this
operation vocabulary plus the documented error/retry rule.

Record capabilities individually:

```yaml
capabilities:
  issueRead: true
  issueSearch: true
  issueCreate: true
  issueUpdate: true
  commentWrite: true
  lifecycleRead: true
  lifecycleWrite: true
  triageRoleRead: true
  triageRoleWrite: true
  complexityReadWrite: true
  parentReadWrite: true
  dependencyReadWrite: true
  worktreeLink: true
  codeReviewLink: true
```

Do not synthesize `true` from a nearby capability. For example, a PR link does
not prove issue writes, and a worktree issue field does not prove dependency
queries.

## Readiness

`full` requires enough capabilities to publish a verified Alignment manifest
and complete Execution. `execution-only` requires reads, deterministic launch
eligibility, completion writes, evidence linking, and readback for an existing
ticket. Select and test a dependency evidence mode using the authoritative
[blocker evidence contract](../../orca-development-loop/references/tracker-adapter.md#blocker-evidence-contract).
`unsupported` means no phase can meet its correctness contract.

Record readiness per phase in `docs/agents/orca-development-loop.md` rather
than duplicating it in the Adapter:

```yaml
readiness:
  alignment: ready
  execution: ready
  requiresWriteConfirmation: false
  dependencyEvidenceMode: adapter-readback
```

## Certification levels

Read-only setup is the default. One bounded, correctly scoped ticket read plus
the version-matched transport guide produces `reads: passed` when identity,
scope, lifecycle/classification values, relations, and the required operation
surface agree.

An unexercised write path records:

```yaml
certification:
  reads: passed
  writes: declared-not-exercised
  probeReference: none
```

This is the normal result for a new Adapter. Do not ask the user to create a
temporary item, and do not leave a probe item open for a later profile or
worktree check. Preserve `writes: passed` without another write when an existing
Adapter's revision, scope, transport, and required command surface are
unchanged.

A write is `passed` only after a real response and readback prove it. Enter that
branch during setup only when the user explicitly requests deep verification.
Before doing so, show the exact external writes and obtain separate consent.
Use one clearly named temporary item and only the applicable sequence:

1. create and read;
2. update and comment;
3. lifecycle and classification;
4. parent/dependency, when supported;
5. worktree/review linking only when an explicit disposable target exists;
6. final readback;
7. close or cancel.

Use provider idempotency keys or retry identifiers when available. After an
ambiguous write, resolve that same operation instead of issuing a second create.
If the integration cannot delete the item, close it and report its reference.
Never phrase `declared-not-exercised` as full write certification.

Before deriving phase readiness, apply the authoritative
[write eligibility gate](../../orca-development-loop/references/tracker-adapter.md#write-eligibility-gate).
When writes are `declared-not-exercised` and the other gates pass, set
`requiresWriteConfirmation: true` and keep the affected phases usable. Do not
collect or persist a standing `writeRiskAcceptance` waiver. A failed or missing
required write still blocks the affected phase; setup may save those blocked
results. The first confirmed real phase applies the configured write and
readback rule; it does not silently promote the whole Adapter to `passed`.

## Existing configuration

An existing `docs/agents/issue-tracker.md` is a preference only after its Orca
integration, scope, transport, and required reads still validate. On mismatch,
show existing and discovered facts side by side, recommend one resolution, and
wait. Preserve the old file until the user confirms the complete replacement.

