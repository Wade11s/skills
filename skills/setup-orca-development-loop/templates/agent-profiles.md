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

## Local host profile pool

Seed for gitignored `docs/agents/agent-hosts.local.yaml`. Schema 4 normalizes
shared launch mechanics instead of copying them into every profile:

- `pipelines` own Orca command capabilities;
- `launchers` own agent argv construction and effective-profile evidence;
- `profiles` contain only model-specific values and optional routing overrides;
- `roleBindings` select profiles.

```yaml
schemaVersion: 4
hosts:
  <Orca host key>:
    identity:
      label: <human-readable host>
      os: <macos|linux|windows>

    recipeSurface:
      orcaVersionObserved: <provenance, not an equality gate>
      checkedAt: <ISO timestamp>

    defaults:
      tiers: [simple, standard, complex]
      maxConcurrent: <positive integer>

    roleBindings:
      alignment: <one profile id>
      coordinator: <one profile id>
      workerPool: [<profile ids>]
      reviewerPool: [<profile ids>]
      integrationWorker: [<profile ids>]
      integrationReviewer: [<profile ids>]

    pipelines:
      <pipeline id>:
        purpose: <supervised|fullHandoff>
        mode: <worker-start|precreated-terminal>
        commands:
          - command: <exact Orca subcommand>
            requiredFlags: [<flag names used by this pipeline>]
            incompatibleFlagSets: [[<mutually exclusive flags>]]
        readinessSignal: <tui-idle|none>
        startReceiptFields: [<receipt fields read by this pipeline>]

    launchers:
      <launcher id>:
        agent: <Orca agent id>
        # Required only for precreated-terminal pipelines. Placeholders must be
        # complete array elements; {reasoning} immediately follows its flag.
        argvTemplate: ["<executable>", "--model", "{model}", "--reasoning-flag", "{reasoning}"]
        evidence:
          mode: <receipt|attestation|user-attested>
          command: <one read-only command or null>
        pipelines:
          supervised: <compatible supervised pipeline id>
          # Omit unsupported purposes.
          fullHandoff: <compatible fullHandoff pipeline id>

    profiles:
      <profile id>:
        launcher: <launcher id>
        model: <exact model id|inherit-agent-default>
        reasoning: <exact level|none>
        family: <model lineage|unknown>
        # Omit either field to inherit host defaults.
        tiers: [<subset of simple, standard, complex>]
        maxConcurrent: <positive integer>
```

Store only role-bound profiles and the pipelines/launchers they reference. The
pipeline definition is the canonical command-surface fingerprint; do not copy
it under profiles. A launcher may support several purposes and profiles.

For a pre-created terminal, render `argvTemplate` by replacing only complete
`{model}` and `{reasoning}` tokens with the selected profile values. Do not use
shell interpolation. Define another launcher when fixed flags or evidence
differ. For `worker-start`, omit `argvTemplate`; the runtime materializes
`agent`, `model`, and reasoning directly.

The required launch purpose comes from the role: Alignment, Worker, Reviewer,
and both Integration roles use `supervised`; Coordinator uses `fullHandoff`.
Missing launcher/pipeline references block that role.

Do not store per-profile copies of host key, Orca version, pipeline commands,
evidence mode, unused-purpose nulls, `not-required` records, smoke logs,
certification history, amendment prose, terminal/Task/Dispatch IDs, credentials,
or current headroom. Runtime verifies every real launch and freezes the
materialized selected profiles into the Alignment record or Wave Manifest.
