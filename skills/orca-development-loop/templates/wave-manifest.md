# Wave Manifest Template

```yaml
version: 1
waveId: <stable human-readable wave id>
objective: <one sentence>
baseBranch: <main or master>
mainRunId: <return Run id>
tickets:
  - id: <Linear identifier>
    blockedBy: []
    complexity: <simple|standard|complex, read from the ticket's signal or defaulted>
    # pin: {worker: w2, reviewer: r1}   # omit to let the Coordinator assign
confirmedByUserAt: <ISO timestamp or source message reference>
profilesSource: <docs/agents/agent-profiles.md@<exploredAt> | fresh-discovery>
complexitySignal: <label|estimate|none, copied from the profile file>

profiles:
  coordinator:
    harness: <pi|claude|codex|cursor|other>
    model: <exact harness/provider model identifier>
    family: <model lineage - gpt|claude|gemini|glm|kimi|grok|deepseek|qwen|other>
    reasoning:
      flag: <--effort|--thinking|none>
      level: <exact level accepted by that agent and model>
    launchPath: <worker-start-composed|terminal-argv-then-worker-start>
    headroomAtConfirmation: <observed window or balance, with its source>
  # Pools hold one or more confirmed tuples. One entry is the common case;
  # several let the Coordinator spread a multi-ticket wave across providers.
  workerPool:
    - id: <short stable id, e.g. w1>
      harness: <...>
      model: <...>
      family: <...>
      reasoning: {flag: <...>, level: <...>}
      launchPath: <...>
      tiers: [<subset of simple, standard, complex>]
      maxConcurrent: <live Dispatches this entry may hold at once>
      headroomAtConfirmation: <observed window or balance, or unknown>
  reviewerPool:
    - id: <e.g. r1>
      harness: <...>
      model: <...>
      family: <...>
      reasoning: {flag: <...>, level: <...>}
      launchPath: <...>
      tiers: [<...>]
      maxConcurrent: <...>
      headroomAtConfirmation: <...>
  integrationWorker:
    inherit: workerPool
    # Or replace inherit with an explicit tuple. A deliberately cheap worker
    # pool is the wrong thing to inherit for conflict work.
  integrationReviewer:
    inherit: reviewerPool
    # Or replace inherit with an explicit tuple.

validation:
  source: <docs/agents/environment.md | package.json scripts | Makefile | CI config | user>
  fastTier: <exact command run before every commit>
  fullSuite: <exact build/test command gating worker_done>
  repoSpecific:
    - <exact acceptance check this repository requires, or none>
  sharedCoreModules:
    - <path whose change forces a full-suite rerun during a fix pass>

policies:
  worktree: one-per-executable-ticket
  reviewCheckout: same-as-worker
  contextRetention: retain-through-integration-with-delta-tasks
  maxIncrementalReReviews: 2
  maxParallelTickets: <integer>
  reviewerIndependence: <different-family-from-worker | same-family-accepted-by-user>
  assignment:
    strategy: <most-headroom-then-round-robin | round-robin | pinned>
    stickyPerTicket: true
    escalationPrefersUnusedEntry: true
  integrationStaging: lazy-reuse-issue-worktree-after-clean-preflight
  integrationWorktree: conflict-only
  mergeConflict: integration-worker-and-reviewer
  pushRemote: false
```

Resolve `validation` at the Execution Profile Gate, in this order: `docs/agents/environment.md` when it exists, then the repository's own scripts (`package.json`, Makefile, CI config), then one question to the user. Record which source answered in `validation.source`, because a manifest value that came from a document goes stale differently than one derived from the environment.

Save the confirmed manifest beside the Coordinator handoff in the OS temporary directory and record both paths in Main's session state; that pair is the only durable copy of the confirmed parameters.

`reviewerIndependence` defaults to `different-family-from-worker`. The alternative is a recorded user decision, not a silent fallback, and the Coordinator refuses to dispatch a same-family review pair unless the manifest carries it. Pools must therefore contain at least one family combination that satisfies it.

`profilesSource` records whether the pools came from `docs/agents/agent-profiles.md` or from fresh discovery, so a later reader can tell which confirmation this wave rests on.

Every pool entry is user-confirmed, which is what makes in-pool failover and clean-room variety possible without another confirmation round trip. The Coordinator's per-ticket assignment rules are in [Coordinator](../references/coordinator.md).

Record each role's discovery source alongside its tuple when a host lacks the usual tools; `headroomAtConfirmation: unknown` is a valid, meaningful value and states that the wave launched without a usage source.

A confirmed manifest is immutable. Changing tickets or any role profile creates a new version and requires explicit user confirmation. Record whether the new version applies only to future Tasks or replaces an active role.
