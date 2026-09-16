# Profile Gate and Launch

Load this reference only at an Alignment or Execution profile gate. Long-lived
profile discovery and certification belong to `/setup-orca-development-loop`;
runtime revalidates and assigns already user-confirmed entries.

## Stored configuration

Read `docs/agents/agent-profiles.md` and select the exact host key named by the
setup manifest. Require:

- understood schema;
- current Orca project/host identity;
- a compatible Orca CLI/runtime version;
- setup certification for every proposed profile's actual launch purpose;
- complete role bindings and launch recipes;
- project complexity and assignment policy.

A missing host, unsupported schema, stale launch recipe, or changed Orca
capability is setup drift. Stop and ask for `/setup-orca-development-loop`
instead of scanning the machine for replacement models.

## Cheap revalidation

Check only entries this phase may launch:

1. the configured agent remains launchable;
2. its exact model/reasoning selection remains accepted;
3. one bounded account/auth check succeeds, or its recorded user vouch remains
   valid until a real launch disproves it;
4. current headroom is read once when a usage source exists;
5. family, tier coverage, and `maxConcurrent` satisfy the proposed assignment.

Current headroom is never loaded from the profile file. With no usage source,
record it as `unknown` and say so at confirmation; unknown is not unlimited.

Do not enumerate every account, model, agent, executable, or quota. If a
configured profile fails, try another already confirmed entry in that role's
pool. When none remains, stop with the exact failure.

## Per-phase confirmation

Setup certification removes rediscovery, not user confirmation.

For Alignment, show the one configured profile, effective headroom, and launch
mode. For Execution, show role bindings/pools, ticket tier coverage,
Worker/Reviewer families, each entry's `maxConcurrent`,
`maxParallelTickets`, and the resulting maximum live Dispatch count.

Wait for explicit confirmation before creating a Task, handoff, or terminal.
Ticket, Adapter, validation, or profile changes invalidate confirmation.

## Freeze a self-contained profile catalog

Before generating the Coordinator handoff:

1. Collect every unique profile ID referenced by Coordinator, Worker,
   Reviewer, Integration Worker, Integration Reviewer, and ticket pins.
2. Copy each complete definition into the Wave Manifest's `profiles`
   dictionary: exact agent/model/reasoning, family, tier coverage,
   `maxConcurrent`, current headroom, launch recipes, and certification facts.
3. Store role pools and integration assignments under `roleBindings` as IDs
   into that dictionary.
4. Require the dictionary keys to equal the unique referenced IDs and validate
   each role's launch purpose. Require ticket pins to belong to their
   corresponding Worker/Reviewer binding.

An independent Integration profile receives the same complete frozen definition
even when it is absent from ordinary pools. After handoff, the Coordinator
resolves profiles only from the Wave Manifest and never rereads mutable
`docs/agents/agent-profiles.md`.

## One-wave override

When the user explicitly supplies an out-of-pool profile, validate only that
candidate using the bounded static checks above: agent/model/reasoning
acceptance, auth, family, and launch expressiveness. Record it in this Wave
Manifest's profile dictionary, bind the affected role to its ID, and set
`profilesSource.type` to `one-wave-override` or `mixed`; do not edit the
repository profile file.

Do not create a setup Probe Run during delivery. The real role launch is the
override's launch test: verify its receipt or attestation before allowing work,
and stop on mismatch or failure.

Never invent or recommend an override on the user's behalf. A same-family
review override requires a separate explicit decision in the manifest.

## Launch recipes

Render the structured recipe frozen in the Wave Manifest; do not reconstruct
one from model-name conventions or mutable repository configuration.

Supervised roles use `launch.supervised` and its matching certification. The
top-level Coordinator uses `launch.fullHandoff`; success on one purpose never
certifies the other.

For a composed supervised launch:

```text
orca orchestration worker-start --task <task> --worktree <selector> \
  --agent <agent> --model <model> --effort <level> --run <run> --json
```

Omit model/effort only when the stored recipe explicitly uses
`inherit-agent-default`. Compare `launch.requested` with `launch.effective`.

For a pre-created terminal:

```text
orca terminal create --worktree <selector> --command <rendered argv> --json
orca terminal wait --terminal <handle> --for tui-idle \
  --timeout-ms <bounded> --json
orca orchestration worker-start --task <task> --worktree <selector> \
  --terminal <handle> --run <run> --json
```

The Task's harness-native attestation supplies effective-profile evidence. Keep
argv as structured values until rendering and use the version-matched guide for
quoting on the current platform.

The top-level Coordinator uses its certified full-handoff recipe, not
`worker-start`: create a fresh current-checkout terminal, wait for readiness,
send the handoff, and stop monitoring inner work.

## Alignment launch order

1. Create the complete Alignment Task first.
2. Launch through its certified supervised recipe.
3. Read one bounded post-launch receipt or attestation.
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

An out-of-pool substitute requires a new Wave Manifest and user confirmation.
If a vouched provider fails its real launch, the vouch no longer holds; report
setup drift after any in-pool failover is exhausted.

## Bounded evidence

An effective profile comes from the launch receipt or one harness-native
attestation. Never use broad process scans, environment dumps, shell history,
or repeated full-terminal reads. Those paths are both unreliable and capable of
leaking credentials.
