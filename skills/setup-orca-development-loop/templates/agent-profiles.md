# Agent Profiles

Seed for `docs/agents/agent-profiles.md`. It stores project routing policy plus
host-specific, user-supplied profiles and certified launch recipes. It never
stores credentials or current headroom.

```yaml
schemaVersion: 2

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
    crossFamilyReview: different-family-from-worker
    escalationPrefersUnusedEntry: true
    maxParallelTickets: <positive integer>
    maxIncrementalReReviews: 2

hosts:
  <Orca host key>:
    identity:
      label: <human-readable host>
      os: <macos|linux|windows>
    orcaVersion: <certified CLI/runtime version>
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
        family: <model lineage>
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
          fullHandoff:
            # Use null when this profile is not bound to Coordinator.
            mode: precreated-terminal
            argv: [<exact argv entries>]
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
            orcaVersion: <same version>
            certifiedAt: <ISO timestamp or null>
            requestedEffectiveMatch: <true|false|null>
            lifecycleCompleted: <true|false|null>
            repositoryUnchanged: <true|false|null>
          fullHandoff:
            status: <passed|failed|not-required>
            hostKey: <same host key>
            orcaVersion: <same version>
            certifiedAt: <ISO timestamp or null>
            requestedEffectiveMatch: <true|false|null>
            repositoryUnchanged: <true|false|null>
```

## Runtime revalidation

The file replaces discovery, not per-wave confirmation. Revalidate only the
entries the wave will launch:

1. schema and exact host entry;
2. compatible Orca version and certified launch mode;
3. agent/model availability and one bounded auth check;
4. fresh provider headroom;
5. Worker/Reviewer family and tier coverage.

Every role-binding ID resolves in the same host's `profiles` map. Integration
bindings may point at dedicated profiles outside the ordinary pools, but those
definitions must still be complete and certified for supervised launch.

Use `receipt` only for a composed `worker-start --agent --model --effort`
launch; its start receipt's `launch.effective` is normative, so `command` is
`null`. A pre-created-terminal or full-handoff recipe uses one
harness-documented read-only `attestation` command. When none exists, use
`user-attested`, set `command` to `null`, retain the exact user-confirmed
`argv`, and surface that limitation whenever the profile is confirmed.

If a configured entry fails, use another already confirmed pool entry. A
profile outside the pool is a one-wave user-confirmed override or requires
rerunning `/setup-orca-development-loop`.

