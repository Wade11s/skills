# Agent Profiles Template

Seed for `docs/agents/agent-profiles.md`: this repository's durable answer to "which agent runs which role, and what makes a ticket hard". Main proposes it after the first successful Execution Profile Gate; the user confirms once and it is committed with the repo.

It stores **capability and preference**, never per-run observations. Headroom readings and launch receipts belong to a Wave Manifest, because they are true for one wave only. It is committed, so it carries model ids and plan names and never a credential.

```yaml
schemaVersion: 1
exploredAt: <ISO date of the discovery this records>
confirmedByUserAt: <ISO date or source message reference>
maxAgeDays: 14

host:
  name: <hostname or human label for the machine explored>
  os: <macos|linux|windows>
  discoverySources: [<orca>, <pi>, <codexbar>, <...>]

roles:
  coordinator:
    - id: c1
      harness: <pi|claude|codex|cursor|other>
      model: <exact provider model id>
      family: <model lineage>
      reasoning: {flag: <--effort|--thinking|none>, level: <level>}
      launchPath: <worker-start-composed|terminal-argv-then-worker-start>
      tiers: [simple, standard, complex]
      maxConcurrent: 1
  workerPool:
    - id: w1
      harness: <...>
      model: <...>
      family: <...>
      reasoning: {flag: <...>, level: <...>}
      launchPath: <...>
      tiers: [<subset of simple, standard, complex>]
      maxConcurrent: <live Dispatches at once>
      verification:
        authProbe: <ready|not_ready|unavailable>
        probeReason: <exact reason string when not ready, else null>
        smokeTest: <passed|failed|not-run>
        vouchedByUserAt: <ISO date when the user accepted a provider its probe rejected, else null>
  reviewerPool:
    - id: r1
      harness: <...>
      model: <...>
      family: <must differ from the worker entry it reviews>
      reasoning: {flag: <...>, level: <...>}
      launchPath: <...>
      tiers: [<...>]
      maxConcurrent: <...>
  integrationWorker: {inherit: workerPool}
  integrationReviewer: {inherit: reviewerPool}
  alignment:
    - id: a1
      harness: <...>
      model: <...>
      family: <...>
      reasoning: {flag: <...>, level: <...>}
      launchPath: <...>

complexity:
  signal: <label|estimate|none>
  labels:
    simple: <exact Linear label string>
    standard: <exact Linear label string>
    complex: <exact Linear label string>
  # For signal: estimate, map the team's exact estimate values instead:
  # estimates: {simple: [1, 2], standard: [3], complex: [5, 8]}
  default: standard
  anchors:
    sharedContracts:
      - <module, public API, schema, or migration path that makes a ticket complex here>
    examples:
      simple: [<PROJECT-id of a real past ticket>]
      standard: [<PROJECT-id>]
      complex: [<PROJECT-id>]

assignmentDefaults:
  strategy: most-headroom-then-round-robin
  stickyPerTicket: true
  crossFamilyReview: different-family-from-worker
  escalationPrefersUnusedEntry: true
  maxParallelTickets: <integer>
  maxIncrementalReReviews: 2
```

## How a gate uses it

The file replaces rediscovery, not confirmation. At a profile gate Main reads it, revalidates cheaply, proposes the stored pools as a one-line summary, and takes a one-word confirmation. Profiles stay user-confirmed parameters for every wave; what the file removes is the tedium, not the gate.

Revalidate only what this wave will launch:

1. `schemaVersion` is understood and the YAML parses.
2. `host.name` matches this machine. A repo cloned onto a second machine has different tools and different accounts, so a host mismatch means rediscovery, not inheritance.
3. Each proposed entry's model still appears in the harness catalog, and its recorded `verification` still holds: a `ready` probe is re-checked cheaply, while an entry carrying `vouchedByUserAt` is trusted without re-asking the user, since that decision was theirs to make and it survives until a launch actually fails.
4. Headroom is read fresh, since the file deliberately stores none.
5. `exploredAt` is within `maxAgeDays`.

Rediscover, then offer to update the file, when any check fails, when a stored model has left the catalog, or when the user asks for a different combination. A vouched provider whose launch fails loses its vouch: report the provider error, fail over inside the pool, and update the file.

## Complexity signal

The four tiers and their criteria are defined once in [the Alignment Agent reference](../references/alignment-agent.md), so every repository judges them the same way. What belongs here is the part that is genuinely local: the exact label strings, and the `anchors` that tell an Alignment Agent what "shared contract" means in this codebase plus one or two real tickets per tier to calibrate against. Rubric drift is what makes difficulty labels useless over time, and past examples are the cheapest fix for it.

Expect the distribution to lean low. Tiers measure what this ticket's own decision costs, and alignment exists to settle those decisions before the ticket is written, so a healthy wave is mostly `simple`.

`default: standard` is deliberately not the expected majority: an unlabelled ticket has no evidence behind it, and routing unexamined work to the cheapest entry is the expensive mistake. The default is a safety setting; the distribution is an observation.

The tier keys above are the skill's vocabulary; `labels` maps them to whatever strings the team actually created in Linear, so renaming a label never touches the routing logic.

`complexity.signal` decides where a ticket's difficulty comes from:

- `label` keeps difficulty explicit and orthogonal to the team's estimate convention. The three label strings must already exist in the Linear team, because `orca linear label add` resolves an existing label rather than creating one. Verify once with `orca linear team labels --team <key> --json`.
- `estimate` reuses Linear's native field when the team does not otherwise use estimates, mapping exact values to tiers.
- `none` sends every ticket to `complexity.default`.

A ticket with no usable signal takes `complexity.default`. Difficulty is a routing hint, so a missing or wrong label degrades assignment quality without blocking the wave.
