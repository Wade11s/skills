# Agent Profiles

## Shared project policy

Seed for committed `docs/agents/agent-profiles.md`. It stores only shared
project routing policy and names the local host-profile file.

```yaml
schemaVersion: 4
hostProfilesFile: docs/agents/agent-hosts.local.yaml

projectPolicy:
  complexity:
    representation: <label|estimate|custom-field|none>
    values:
      simple: <exact tracker value or null>
      standard: <exact tracker value or null>
      complex: <exact tracker value or null>
    default: standard
    anchors:
      sharedContracts:
        - <module/API/schema/migration path, or use an empty list>
      examples:
        simple: []
        standard: []
        complex: []

  assignment:
    strategy: most-headroom-then-round-robin
    stickyPerTicket: true
    crossFamilyReview: prefer-different-family
    escalationPrefersUnusedEntry: true
    maxParallelTickets: <positive integer>
    maxIncrementalReReviews: 2
```

## Local host profiles

Seed for gitignored `docs/agents/agent-hosts.local.yaml`. It stores
host-specific, user-supplied profiles and certified launch recipes, never
credentials or current headroom.

```yaml
schemaVersion: 2
hosts:
  <Orca host key>:
    identity:
      label: <human-readable host>
      os: <macos|linux|windows>
    orcaVersionObservedAtCertification: <provenance>
    certifiedAt: <ISO timestamp>

    roleBindings:
      alignment: [<profile id>]
      coordinator: [<profile id>]
      workerPool: [<profile ids>]
      reviewerPool: [<profile ids>]
      integrationWorker: [<profile id or inherited qualified ids>]
      integrationReviewer: [<profile id or inherited qualified ids>]

    profiles:
      <profile id>:
        suppliedByUser:
          agent: <Orca agent id>
          model: <exact model id|inherit-agent-default>
          reasoning:
            flag: <--effort|--thinking|other|none>
            level: <exact level|none>
        family: <model lineage|unknown>
        tiers: [<subset of simple, standard, complex>]
        maxConcurrent: <positive integer>
        launch:
          supervised:
            # Use null when this profile is not bound to a supervised role.
            mode: <worker-start|precreated-terminal>
            agent: <agent id or null>
            model: <model id or null>
            effort: <level or null>
            argv: [<exact argv entries, or use an empty list>]
            recipeFingerprint:
              launchMode: <worker-start|precreated-terminal>
              # Include one entry for every command in the launch pipeline.
              commands:
                - command: <exact Orca subcommand>
                  requiredFlags: [<flag names the recipe uses>]
                  incompatibleFlagSets: [[<mutually exclusive flags>]]
              readinessSignal: <tui-idle|none>
              startReceiptFields: [<receipt fields the evidence rule reads>]
              evidenceMode: <receipt|attestation|user-attested>
          fullHandoff:
            # Use null when this profile is not bound to Coordinator.
            mode: precreated-terminal
            argv: [<exact argv entries>]
            recipeFingerprint:
              launchMode: precreated-terminal
              commands:
                - command: terminal create
                  requiredFlags: [worktree, command, json]
                  incompatibleFlagSets: []
                - command: terminal wait
                  requiredFlags: [terminal, for, timeout-ms, json]
                  incompatibleFlagSets: []
                - command: terminal send
                  requiredFlags: [terminal, text, enter, wait-submit, json]
                  incompatibleFlagSets: []
              readinessSignal: tui-idle
              startReceiptFields: []
              evidenceMode: <attestation|user-attested>
        effectiveProfileEvidence:
          # Omit a launch purpose not used by this profile.
          supervised:
            mode: <receipt|attestation|user-attested>
            command: <exact read-only command or null>
          fullHandoff:
            mode: <attestation|user-attested>
            command: <exact read-only command or null>
        verification:
          authProbe: <ready|not-ready|inconclusive>
          smokeTest: <passed|failed|not-run>
          vouchedByUserAt: <timestamp/reference or null>
        certification:
          supervised:
            status: <passed|failed|not-required>
            hostKey: <same host key>
            orcaVersionObservedAtCertification: <provenance>
            certifiedAt: <ISO timestamp or null>
            requestedEffectiveMatch: <true|false|null>
            lifecycleCompleted: <true|false|null>
            repositoryUnchanged: <true|false|null>
          fullHandoff:
            status: <passed|failed|not-required>
            hostKey: <same host key>
            orcaVersionObservedAtCertification: <provenance>
            certifiedAt: <ISO timestamp or null>
            requestedEffectiveMatch: <true|false|null>
            repositoryUnchanged: <true|false|null>
```
