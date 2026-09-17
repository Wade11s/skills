# Profile Gate and Launch

Load this reference only at an Alignment or Execution profile gate. Long-lived
profile discovery and certification belong to `/setup-orca-development-loop`;
runtime revalidates and assigns already user-confirmed entries.

## Stored configuration

Read project policy from `docs/agents/agent-profiles.md`, then select the exact
host key named by the setup manifest from
`docs/agents/agent-hosts.local.yaml`. Require:

- understood schema;
- current Orca project/host identity;
- a compatible Orca CLI/runtime version;
- setup certification for every proposed profile's actual launch purpose;
- complete role bindings and launch recipes;
- project complexity and assignment policy.

A missing local host file or host entry, unsupported schema, stale launch
recipe, or changed Orca capability is setup drift. Stop and ask for
`/setup-orca-development-loop` instead of scanning the machine for replacement
models.

## Cheap revalidation

Check only entries this phase may launch:

1. the configured agent remains launchable;
2. its exact model/reasoning selection remains accepted;
3. one bounded account/auth check succeeds, or its recorded user vouch remains
   valid until a real launch disproves it;
4. current headroom is read once when a usage source exists;
5. family, tier coverage, and `maxConcurrent` satisfy the proposed assignment.

Current headroom is never loaded from either profile file. With no usage source,
record it as `unknown` and say so at confirmation; unknown is not unlimited.

Do not enumerate every account, model, agent, executable, or quota. If a
configured profile fails, try another already confirmed entry in that role's
pool. When none remains, stop with the exact failure; a persistent replacement
requires `/setup-orca-development-loop`, while a user-supplied temporary
candidate follows the one-wave override below.

## Per-ticket assignment policy

Resolve every role binding and ticket pin through the Wave Manifest's frozen
profile dictionary; a pin must also belong to its corresponding role binding.
Filter by complexity tier, require Worker and Reviewer families to differ unless
the manifest records the user's exception, and enforce each profile's
`maxConcurrent`. Apply the configured assignment strategy; for
`most-headroom-then-round-robin`, prefer current headroom and break ties by least
recently assigned. Keep the selected pair sticky through fix and re-review, and
prefer a previously unused Reviewer for a requested clean-room pass.

Integration-created state uses only `roleBindings.integrationWorker` and
`roleBindings.integrationReviewer`, and its Reviewer differs in family from the
profile that produced that state unless the same-family exception is recorded.
Fail over only within the confirmed binding to an entry that still satisfies
tier, family, and concurrency policy, and record the provider error and
substitution. No out-of-pool profile is an automatic fallback.

## Per-phase confirmation

Setup certification removes rediscovery, not user confirmation.

For Alignment, show the one configured profile, effective headroom, and launch
mode. For Execution, show role bindings/pools, ticket tier coverage,
Worker/Reviewer families, each entry's `maxConcurrent`,
`maxParallelTickets`, and the resulting maximum live Dispatch count.
Whenever a selected entry uses `user-attested` evidence, also state that its
exact argv was user-confirmed but provider/model cannot be independently
observed.

Wait for explicit confirmation before creating a Task, handoff, or terminal.
Ticket, Adapter, validation, or profile changes invalidate confirmation.

## Freeze a self-contained profile catalog

Before generating the Coordinator handoff:

1. Collect every unique profile ID referenced by Coordinator, Worker,
   Reviewer, Integration Worker, Integration Reviewer, and ticket pins.
2. Copy each complete definition into the Wave Manifest's `profiles`
   dictionary: exact agent/model/reasoning, family, tier coverage,
   `maxConcurrent`, current headroom, effective-profile evidence, launch
   recipes, and certification facts.
3. Store role pools and integration assignments under `roleBindings` as IDs
   into that dictionary.
4. Require the dictionary keys to equal the unique referenced IDs and validate
   each role's launch purpose. Require ticket pins to belong to their
   corresponding Worker/Reviewer binding.

An independent Integration profile receives the same complete frozen definition
even when it is absent from ordinary pools. After handoff, the Coordinator
resolves profiles only from the Wave Manifest and never rereads mutable
repository profile configuration.

A missing ID, a wrong launch purpose, a pin outside its own role binding, or a
duplicate or conflicting definition invalidates the manifest. The receiving
agent reports setup drift, creates no Run, and never fills the gap from
repository configuration.

## One-wave override

When the user explicitly supplies an out-of-pool profile, validate only that
candidate using the bounded static checks above: agent/model/reasoning
acceptance, auth, family, and launch expressiveness. Record it in this Wave
Manifest's profile dictionary, bind the affected role to its ID, and set
`profilesSource.type` to `one-wave-override` or `mixed`; do not edit the
repository profile files.

Do not create a setup Probe Run during delivery. The real role launch is the
override's launch test: apply the bounded evidence rule before allowing work.
`pending-runtime-launch` is valid only for an explicit override and the launch
purpose that role will use. If replacement is needed after Coordinator startup,
use the confirmed manifest-revision channel rather than an informal wait.

Never invent or recommend an override on the user's behalf. A same-family
review override requires a separate explicit decision in the manifest.

For a running wave, Main delivers an override only as the next user-confirmed
manifest version through `--type handoff --subject manifest_revision
--report-path "$manifest_path"`. The Coordinator revalidates it at the safe
point defined in its manifest revision gate.

## Launch recipes

Render the structured recipe frozen in the Wave Manifest; do not reconstruct
one from model-name conventions or mutable repository configuration.

Supervised roles use `launch.supervised` and its matching certification. The
top-level Coordinator uses `launch.fullHandoff`; success on one purpose never
certifies the other. Apply the matching frozen `effectiveProfileEvidence`.

For a composed supervised launch:

```text
ORCA orchestration worker-start --task <task> --worktree <selector> \
  --agent <agent> --model <model> --effort <level> --run <run> --json
```

Omit model/effort only when the stored recipe explicitly uses
`inherit-agent-default`. The start receipt's `launch.effective` is normative and
sufficient. Compare it with `launch.requested`; do not run an in-Task profile
probe.

For a pre-created terminal:

```text
ORCA terminal create --worktree <selector> --command <rendered argv> --json
ORCA terminal wait --terminal <handle> --for tui-idle \
  --timeout-ms <bounded> --json
ORCA orchestration worker-start --task <task> --worktree <selector> \
  --terminal <handle> --run <run> --json
```

The start receipt cannot report the pre-created terminal's provider/model. Use
the one harness-documented read-only command frozen under
`effectiveProfileEvidence` when its mode is `attestation`. When its mode is
`user-attested`, run no substitute command; compare the exact launched argv with
the confirmed argv and carry the independent-verification limitation. Keep argv
as structured values until rendering and use the version-matched guide for
quoting on the current platform.

The top-level Coordinator uses its certified full-handoff recipe, not
`worker-start`: create a fresh current-checkout terminal, wait for readiness,
send the handoff, and stop monitoring inner work.

## Alignment launch order

1. Create the complete Alignment Task first.
2. Launch through its certified supervised recipe.
3. Read one bounded post-launch receipt. For a composed launch, compare its
   `launch.requested` and `launch.effective` and inline those verified values in
   the Task; no Alignment-agent probe follows. For a pre-created terminal,
   apply its `attestation` command or `user-attested` argv rule.
4. On mismatch, send `profile_mismatch`, perform no requirement work, and
   reclaim the incorrect launch using its receipt.
5. Ask the user to switch only after effective values match.

## Launch failures

`worker-start` exits successfully only for a ready Dispatch. On `failed` or
`outcome_unknown`:

1. inspect `failedStage`, `effects`, `residualResources`, and returned recovery
   commands;
2. resolve an ambiguous request with `request-show` or its exact
   `--retry-request` ID;
3. reclaim or fence residual resources before another attempt;
4. use `worker-start --retry-of` for an authoritative retry, repeating placement
   and profile fields;
5. fail over only to another confirmed pool entry satisfying tier and family
   policy.

An out-of-pool substitute requires the confirmed manifest-revision channel for
not-yet-launched work. Continue under the accepted version until the Coordinator
returns `manifest_accepted`.
If a vouched provider fails its real launch, the vouch no longer holds; report
setup drift after any in-pool failover is exhausted.

## Bounded evidence

Use exactly one evidence rule:

- a composed `worker-start --agent --model --effort` launch uses its start
  receipt's `launch.effective`; this is normative and needs no in-Task probe;
- a pre-created-terminal or custom-argv launch uses one harness-documented,
  read-only attestation command frozen at setup;
- when the harness documents no such command, use `user-attested` evidence with
  `command: null` and the exact confirmed argv, state its limitation at every
  profile confirmation, and proceed.

Never use broad process scans, environment dumps, shell history, or repeated
full-terminal reads. Those paths are unreliable and can leak credentials.
