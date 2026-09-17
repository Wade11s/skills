# Wave Manifest Template

```yaml
schemaVersion: 4
version: <positive integer; start at 1>
supersedes: <prior version or null>
revisionReason: <reason or null>
waveId: <stable human-readable wave id>
objective: <one sentence>
baseRef: <exact configured base ref>
mainRunId: <return Run id>
confirmedByUserAt: <ISO timestamp or source message reference>

tracker:
  provider: <configured provider>
  project: <configured scope>
  adapterRevision: <exact Adapter certification.revision>
  mode: <full|execution-only>
  codeReviewSurface: <provider or none>
  writesCertification: <passed|declared-not-exercised>
  writeRiskAcceptance:
    unexercisedWritesAcceptedByUserAt: <explicit message reference or null>
    adapterRevision: <matching revision or null>
    scope: <matching scope or null>
    phases: [<accepted phases, or empty>]
    operations: [<accepted write operation names, or empty>]
  dependencyEvidenceMode: <adapter-readback|verified-alternate|user-attestation-required>

tickets:
  - ref: <canonical tracker reference>
    complexity: <simple|standard|complex, resolved from configured representation/default>
    blockers:
      source: <adapter-readback|verified-alternate|user-attestation-required>
      observedAt: <ISO timestamp or source message reference>
      completenessEvidence: <readback/procedure output reference or user confirmation reference>
      completeIncludingExternal: true
      confirmedByUserAt: <source message reference or null>
      items:
        - ref: <blocking ticket reference>
          inWave: <true|false>
          stateAtConfirmation: <exact tracker state or user-attested state>
          satisfied: <true|false>
          evidence: <readback or user-attestation reference>
    # pin: {worker: w2, reviewer: r1}

deliveryOrder:
  source: <dependency-graph|user-confirmed>
  waves:
    - [<ticket refs safe to launch together>]
  confirmedByUserAt: <source message reference or null>

profilesSource:
  type: <docs/agents/agent-profiles.md|one-wave-override|mixed>
  hostKey: <Orca host key>
  certifiedOrcaVersion: <version>
  frozenAt: <timestamp>

roleBindings:
  coordinator: <profile id>
  workerPool: [<profile ids>]
  reviewerPool: [<profile ids>]
  integrationWorker: [<profile ids>]
  integrationReviewer: [<profile ids>]

profiles:
  <profile id>:
    agent: <Orca agent id>
    model: <exact id|inherit-agent-default>
    family: <model lineage>
    reasoning: {flag: <flag|none>, level: <level|none>}
    tiers: [<subset of simple, standard, complex, or empty for Coordinator>]
    maxConcurrent: <positive integer>
    headroomAtConfirmation: <observed value and source|unknown>
    launch:
      supervised: <frozen structured recipe or null>
      fullHandoff: <frozen structured recipe or null>
    effectiveProfileEvidence:
      # Omit a launch purpose not used by this profile.
      supervised:
        mode: <receipt|attestation|user-attested>
        command: <exact read-only command or null>
      fullHandoff:
        mode: <attestation|user-attested>
        command: <exact read-only command or null>
    certification:
      source: <setup|one-wave-override>
      supervised:
        status: <passed|pending-runtime-launch|not-required>
        hostKey: <same host key>
        orcaVersion: <version>
        certifiedAt: <timestamp or null>
        requestedEffectiveMatch: <true|false|null>
        lifecycleCompleted: <true|false|null>
        repositoryUnchanged: <true|false|null>
      fullHandoff:
        status: <passed|pending-runtime-launch|not-required>
        hostKey: <same host key>
        orcaVersion: <version>
        certifiedAt: <timestamp or null>
        requestedEffectiveMatch: <true|false|null>
        repositoryUnchanged: <true|false|null>

workspace:
  setupPolicy: <run|skip|inherit>
  setupCommand: <exact command|none>

publication:
  mode: <local-only|push-base|pull-request>
  remote: <exact remote name or none>
  pullRequestCreateCommand: <exact command template or none>
  pullRequestReadbackCommand: <exact command template or none>

validation:
  source: <docs/agents/environment.md plus fingerprint>
  workingDirectory: <repository-relative path>
  fastTier: <exact command>
  fullSuite: <exact command>
  repoSpecific:
    - <exact command, or use an empty list>
  sharedCoreModules:
    - <path, or use an empty list>

policies:
  worktree: one-per-executable-ticket
  reviewCheckout: same-as-worker
  contextRetention: retain-through-integration-with-delta-tasks
  maxIncrementalReReviews: <configured positive integer>
  maxParallelTickets: <configured positive integer>
  reviewerIndependence: <different-family-from-worker|same-family-accepted-by-user>
  assignment:
    strategy: <most-headroom-then-round-robin|round-robin|pinned>
    stickyPerTicket: true
    escalationPrefersUnusedEntry: true
  integrationStaging: lazy-reuse-issue-worktree-after-clean-preflight
  integrationWorktree: conflict-only
```

## Publication authority

The frozen `publication.mode` is authority for exactly that behavior:

- `local-only` advances the local base ref and pushes nothing;
- `push-base` advances the local base ref, then fast-forward pushes that base to
  `publication.remote` and reads the remote ref back;
- `pull-request` leaves the local base ref unchanged, pushes the accepted
  implementation branch to `publication.remote`, and runs the exact PR-create
  command through the configured code-review surface.

Force push, a different branch, or another remote requires separate explicit
user authority.

## Blocker evidence

Populate and validate `tickets[].blockers` and `deliveryOrder` under the
[blocker evidence contract](../references/tracker-adapter.md#blocker-evidence-contract)
before confirming this manifest. That contract owns fallback and launchability;
this template owns the frozen storage shape.

## Self-contained profiles

`profiles` contains every profile this wave may launch, exactly once. Every ID
under `roleBindings` and every ticket pin must resolve in that dictionary. The
dictionary includes exact agent/model/reasoning, family, concurrency, fresh
headroom, launch recipes, `effectiveProfileEvidence`, and certification facts
even when an Integration profile is not in the ordinary Worker or Reviewer
pool.

A ticket's Worker and Reviewer pins must also belong to the corresponding role
binding; dictionary membership alone does not grant that role.

The Coordinator uses only this frozen dictionary after handoff; it never reads
mutable repository profile configuration to fill a missing definition.
Coordinator requires `launch.fullHandoff`; supervised roles require
`launch.supervised`. A missing ID, wrong launch purpose, or duplicate/conflicting
definition invalidates the manifest before `run-create`.

`pending-runtime-launch` is valid only for an explicit one-wave override and
only on the purpose that role will use. A composed launch's
`launch.effective` receipt is normative; a pre-created-terminal or full-handoff
launch uses its recorded attestation command, or the exact user-confirmed argv
in `user-attested` mode. Failure on observable evidence does not authorize a
substitute outside the confirmed dictionary. Every confirmation names the
independent-verification limitation of a `user-attested` profile.

## Publication

Copy `publication` from `docs/agents/environment.md` and show it at wave
confirmation. The confirmed mode is authority for its exact remote and branch
flow: `local-only` publishes nothing, `push-base` advances and pushes only the
base ref, and `pull-request` pushes only accepted implementation branches and
uses the frozen PR/MR commands. A force push, another branch, or another remote
still requires explicit user authority.

Copy tracker, workspace, validation, and selected profile facts from
setup-certified documents, then add current blocker evidence, delivery order,
headroom, ticket pins, and user confirmation. Include only referenced profiles;
the set of dictionary keys must equal the unique IDs referenced by role
bindings and pins.

`schemaVersion` identifies this template's shape; `version` counts the
confirmed revisions of one wave. They change independently.

A manifest version is immutable. The first confirmed file uses `version: 1`,
`supersedes: null`, and `revisionReason: null`. A permitted revision increments
`version`, names the prior version in `supersedes`, records a reason, preserves
`waveId`, and requires confirmation. In-pool failover needs no revision because
every entry and its launch recipe are already frozen; record the substitution
and provider error.

A revision may rebind roles or profiles, remove tickets, or refresh blocker
evidence and delivery order only for not-yet-launched work. It may not add
tickets or retroactively change validation commands or the Adapter revision for
an integrated ticket. In-flight tickets finish under the version that launched
them. A needed change to an in-flight ticket uses user abort, then a new wave.
Follow the manifest-revision channel in the
[Communication Contract](../references/communication-contract.md#manifest-revision-channel).

Save the manifest beside the Coordinator handoff in the OS temporary directory
and retain both paths in Main session state. Repository configuration is
durable policy; this manifest is the only authoritative snapshot of current-wave
parameters.
