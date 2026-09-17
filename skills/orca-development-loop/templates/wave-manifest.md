# Wave Manifest Template

```yaml
schemaVersion: 4
version: <positive integer; start at 1>
supersedes: <prior version or null>
revisionReason: <reason or null>
waveId: <stable path-safe human-readable wave id>
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
  type: <docs/agents/agent-hosts.local.yaml|one-wave-override|mixed>
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

Freeze `mode`, `remote`, `pullRequestCreateCommand`, and
`pullRequestReadbackCommand`, then execute them through the
[main-advance and publication procedure](../references/issue-worktree-loop.md#main-advance-and-publication).

## Blocker evidence

Populate the frozen `tickets[].blockers` and `deliveryOrder` shape under the
[blocker evidence contract](../references/tracker-adapter.md#blocker-evidence-contract).

## Self-contained profiles

Populate the frozen `profiles`, `roleBindings`, and ticket-pin shape through
[Freeze a self-contained profile catalog](../references/profile-gate-and-launch.md#freeze-a-self-contained-profile-catalog).

Copy setup-certified and current-wave facts into the YAML shape above.

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

Save the manifest beside the Coordinator handoff in the OS temporary wave
directory whose name is `waveId`. Repository configuration is durable policy;
this manifest is the only authoritative snapshot of current-wave parameters.
