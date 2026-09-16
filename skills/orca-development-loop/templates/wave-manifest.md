# Wave Manifest Template

```yaml
version: 3
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
  pushRemote: false
```

## Blocker evidence

Populate and validate `tickets[].blockers` and `deliveryOrder` under the
[blocker evidence contract](../references/tracker-adapter.md#blocker-evidence-contract)
before confirming this manifest. That contract owns fallback and launchability;
this template owns the frozen storage shape.

## Self-contained profiles

`profiles` contains every profile this wave may launch, exactly once. Every ID
under `roleBindings` and every ticket pin must resolve in that dictionary. The
dictionary includes exact agent/model/reasoning, family, concurrency, fresh
headroom, launch recipes, and certification facts even when an Integration
profile is not in the ordinary Worker or Reviewer pool.

A ticket's Worker and Reviewer pins must also belong to the corresponding role
binding; dictionary membership alone does not grant that role.

The Coordinator uses only this frozen dictionary after handoff; it never reads
mutable repository profile configuration to fill a missing definition.
Coordinator requires `launch.fullHandoff`; supervised roles require
`launch.supervised`. A missing ID, wrong launch purpose, or duplicate/conflicting
definition invalidates the manifest before `run-create`.

`pending-runtime-launch` is valid only for an explicit one-wave override and
only on the purpose that role will use. Its actual launch receipt or attestation
must match before that role performs work; failure does not authorize a
substitute outside the confirmed dictionary.

Copy tracker, workspace, validation, and selected profile facts from
setup-certified documents, then add current blocker evidence, delivery order,
headroom, ticket pins, and user confirmation. Include only referenced profiles;
the set of dictionary keys must equal the unique IDs referenced by role
bindings and pins.

A manifest is immutable. Changing its ticket set, blocker evidence, Adapter
revision, write-risk acceptance, validation, profile dictionary/bindings, or policy creates a new
version and requires confirmation. In-pool failover needs no new confirmation
because every entry and its launch recipe are already frozen; record the
substitution and provider error.

Save the manifest beside the Coordinator handoff in the OS temporary directory
and retain both paths in Main session state. Repository configuration is
durable policy; this manifest is the only authoritative snapshot of current-wave
parameters.
