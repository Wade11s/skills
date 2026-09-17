# Profile Gate and Launch

Load this reference only at an Alignment or Execution profile gate. Long-lived
profile discovery and certification belong to `/setup-orca-development-loop`;
runtime revalidates and assigns already user-confirmed entries.

## Stored configuration

For an explicit resume or abort of a pre-v5 wave, use the profiles, role
bindings, launch purposes, and recipes frozen in that manifest. Do not read
mutable profile configuration or require the current schema or
`recipeFingerprint`; add no ticket or profile.

For new work or a current-schema wave, read project policy from
`docs/agents/agent-profiles.md`, then select the exact host key named by the
setup manifest from `docs/agents/agent-hosts.local.yaml`. Require:

- understood schema;
- current Orca project/host identity;
- setup certification for every proposed profile's actual launch purpose;
- a capability-compatible `recipeFingerprint` for each selected launch purpose,
  per
  [Capability compatibility](#capability-compatibility);
- complete role bindings and launch recipes;
- project complexity and assignment policy.

A missing local host file or host entry, unsupported schema, stale launch
recipe, or missing or changed required capability is setup drift. An Orca
version change alone is not. Stop and ask for `/setup-orca-development-loop`
instead of scanning the machine for replacement models.

## Capability compatibility

Store the Orca version observed during certification as provenance, not as an
equality gate. Certification is keyed by host, agent, model, reasoning, launch
purpose, launch mode, and the launch-purpose `recipeFingerprint`.

Each certified launch purpose stores one canonical structured fingerprint of
the command surface and receipt/evidence fields that recipe needs:

```yaml
recipeFingerprint:
  launchMode: <worker-start|precreated-terminal>
  commands:
    - command: <exact Orca subcommand>
      requiredFlags: [<flag names the recipe uses>]
      incompatibleFlagSets: [[<mutually exclusive flags>]]
  readinessSignal: <tui-idle|none>
  startReceiptFields: [<receipt fields the evidence rule reads>]
  evidenceMode: <receipt|attestation|user-attested>
```

Record one `commands` entry for every command the launch pipeline runs. A
composed supervised launch covers `orchestration worker-start`. A pre-created
supervised launch covers `terminal create`, `terminal wait`, and the
`orchestration worker-start --terminal` attach. A full handoff covers `terminal
create`, `terminal wait`, and `terminal send`. Do not hash help prose or include
unrelated CLI additions.

For example, a composed launch with an explicit model stores:

```yaml
recipeFingerprint:
  launchMode: worker-start
  commands:
    - command: orchestration worker-start
      requiredFlags: [task, worktree, agent, model, effort, run, json]
      incompatibleFlagSets:
        - [agent, terminal]
        - [terminal, model]
        - [terminal, effort]
  readinessSignal: none
  startReceiptFields: [launch.requested, launch.effective]
  evidenceMode: receipt
```

For the selected entries, perform one bounded, directional compatibility check
against the current version-matched guide: every command and required flag still
exists; the rendered invocation violates none of the current incompatible flag
sets; and each readiness signal, start-receipt field, and evidence mode still
exists. New optional flags and relaxed incompatibilities are irrelevant. If
every capability the stored recipe needs remains valid, continue and report the
newly observed Orca version. A removed requirement or a new conflict among the
recipe's required flags is setup drift. Provider/model evidence rules are
unchanged.

A launch-purpose certification without `recipeFingerprint` is the exact-version
form. Do not silently reinterpret it; send new work to
`/setup-orca-development-loop`.
For resume or abort of an already-active pre-v5 wave, honor that manifest's
frozen certification, write authority, blocker evidence, and reviewer policy
without requiring P2 fields. Add no ticket or profile; a later new wave requires
setup.

## Cheap revalidation

Check only entries this phase may launch:

1. the configured agent remains launchable;
2. its exact model/reasoning selection remains accepted;
3. one bounded account/auth check succeeds, or its recorded user vouch remains
   valid until a real launch disproves it;
4. current headroom is read once when a usage source exists;
5. the selected launch-purpose `recipeFingerprint` remains capability-compatible;
6. tier coverage and `maxConcurrent` satisfy the proposed assignment; when both
   Worker and Reviewer families are known, apply the different-family
   preference without blocking same-family or unknown-family review.

For a pre-v5 resume, perform items 1-4 and the tier/concurrency portion of item
6 against the frozen legacy profile. Skip item 5 and apply the manifest's legacy
reviewer policy below.

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

For a pre-v5 resume, honor the frozen legacy reviewer policy exactly:
`different-family-from-worker` remains a hard family filter, while
`same-family-accepted-by-user` permits same-family choices only within the role
bindings already frozen in that manifest. Do not reinterpret either value as
the P2 preference.

For schema 5, filter by complexity tier and enforce each profile's
`maxConcurrent`. Prefer a Reviewer from a different family when both families
are known and a compatible confirmed entry has capacity. Same-family or
unknown-family review needs no user exception and does not block execution.
Family may be recorded as `unknown`; do not add a provider or vendor gate.
Independence comes from a separate read-only Reviewer Dispatch with fresh review
context and the existing fixed-point, evidence, and verdict contract; never
reuse the Worker's terminal or context as the Reviewer. Apply the configured
assignment strategy; for `most-headroom-then-round-robin`, prefer current
headroom and break ties by least recently assigned. Keep the selected pair
sticky through fix and re-review, and prefer a previously unused Reviewer for a
requested clean-room pass.

For schema 5, integration-created state uses only
`roleBindings.integrationWorker` and
`roleBindings.integrationReviewer`. Prefer an Integration Reviewer from a
different family than the profile that produced that state when both families
are known and a compatible confirmed entry has capacity; same-family or
unknown-family review needs no exception. Fail over only within the confirmed
binding to an entry that still satisfies tier and concurrency policy, preferring
a different family among entries with capacity, and record the provider error
and substitution. No out-of-pool profile is an automatic fallback.

## Per-phase confirmation

Setup certification removes rediscovery, not user confirmation.

For Alignment, show the one configured profile, effective headroom, launch
mode, and the certification-time versus current Orca versions. For Execution,
show role bindings/pools, ticket tier coverage, the actual Worker and Reviewer
families or `unknown`, each entry's `maxConcurrent`, `maxParallelTickets`, and
the resulting maximum live Dispatch count. Same-family and unknown-family review
need no exception. Whenever a selected entry uses `user-attested` evidence, also
state that its exact argv was user-confirmed but provider/model cannot be
independently observed.

Wait for explicit confirmation before creating a Task, handoff, or terminal.
Ticket, Adapter, validation, or profile changes invalidate confirmation.

## Freeze a self-contained profile catalog

Before generating the Coordinator handoff:

1. Collect every unique profile ID referenced by Coordinator, Worker,
   Reviewer, Integration Worker, Integration Reviewer, and ticket pins.
2. Copy each complete definition into the Wave Manifest's `profiles`
   dictionary: exact agent/model/reasoning, family, tier coverage,
   `maxConcurrent`, current headroom, effective-profile evidence, launch
   recipes including `recipeFingerprint`, and certification facts including
   the Orca version observed at certification as provenance.
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
acceptance, auth, family metadata or `unknown`, and launch expressiveness. Record
it in this Wave Manifest's profile dictionary, bind the affected role to its ID,
and set `profilesSource.type` to `one-wave-override` or `mixed`; do not edit the
repository profile files.

Do not create a setup Probe Run during delivery. The real role launch is the
override's launch test: apply the bounded evidence rule before allowing work.
`pending-runtime-launch` is valid only for an explicit override and the launch
purpose that role will use. If replacement is needed after Coordinator startup,
use the confirmed manifest-revision channel rather than an informal wait.

Never invent or recommend an override on the user's behalf. Same-family or
unknown-family review needs no extra exception field.

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
`worker-start`:

```text
ORCA terminal create --worktree <current-checkout> \
  --command <rendered argv> --json
ORCA terminal wait --terminal <handle> --for tui-idle \
  --timeout-ms <bounded> --json
ORCA terminal send --terminal <handle> --text <handoff> \
  --enter --wait-submit <bounded-seconds> --json
```

After the send receipt, stop monitoring inner work.

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
5. fail over only to another confirmed pool entry satisfying tier and
   concurrency policy. For schema 5, prefer a different family when both
   families are known and one remains. For a pre-v5 resume, reapply the
   manifest's frozen legacy reviewer policy before any Reviewer substitution;
   `different-family-from-worker` remains a hard filter.

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
