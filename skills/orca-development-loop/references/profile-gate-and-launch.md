# Profile Gate and Launch

Load this reference only at an Alignment or Execution profile gate. Long-lived
profile discovery and recipe configuration belong to
`/setup-orca-development-loop`; runtime revalidates configured entries and
verifies every actual launch before trusting it.

## Stored configuration

For an explicit resume or abort of a pre-v5 wave, use the profiles, role
bindings, launch purposes, and recipes frozen in that manifest. Do not read
mutable profile configuration or require the current schema or
`recipeFingerprint`; add no ticket or profile.

For new work or a current-schema wave, read project policy from
`docs/agents/agent-profiles.md`, then select the exact host key named by the
setup manifest from `docs/agents/agent-hosts.local.yaml`. Accept legacy host
schemas 2 and 3 plus normalized schema 4.

For schema 2 or 3, require complete role bindings, a launch recipe and
capability-compatible `recipeFingerprint` for every selected purpose, and
legacy status `passed` or `pending-runtime-launch`.

For schema 4, require:

- host defaults, role bindings, pipelines, launchers, and profiles;
- scalar Alignment/Coordinator bindings and list-valued pools;
- every role-bound profile and referenced launcher/pipeline to exist; and
- project complexity and assignment policy.

Schema 4 deliberately stores no per-profile launch status, certification,
verification, copied pipeline, or copied evidence. Runtime derives
`pending-runtime-launch` while materializing the selected purpose.

A missing host entry/reference, unsupported schema, legacy `failed` status, or
incompatible pipeline is setup drift. An Orca version change alone is not. Stop
and ask for `/setup-orca-development-loop` instead of scanning the machine for
replacement models.

## Resolve host schema 4

Resolve only profiles this phase may launch:

1. Map role to purpose: Coordinator uses `fullHandoff`; Alignment, Worker,
   Reviewer, Integration Worker, and Integration Reviewer use `supervised`.
2. Resolve the role-bound profile and merge its `tiers` and `maxConcurrent`
   overrides over host defaults.
3. Resolve `profile.launcher`, then `launcher.pipelines[purpose]`.
4. Require the referenced pipeline's `purpose` to match and its mode to be
   `worker-start` or `precreated-terminal`.
5. For `precreated-terminal`, require a structured `argvTemplate`; replace only
   whole-token `{model}` and `{reasoning}` entries and reject duplicates,
   embedded/unknown tokens, or unresolved placeholders. A concrete profile value
   requires its corresponding placeholder; `inherit-agent-default` or `none`
   requires that placeholder to be absent. Require `{reasoning}` to be
   immediately preceded by its exact flag token so the runtime can materialize
   the Wave Manifest's reasoning object. For `worker-start`, require no argv
   template and use launcher `agent`, profile model, and `--effort` reasoning.
6. Attach the launcher's one `receipt`, `attestation`, or `user-attested`
   evidence rule.

Materialize the result into the self-contained runtime shape used by Alignment
and the Wave Manifest:

- exact agent, model, reasoning flag/level, family, tiers, and `maxConcurrent`;
- rendered structured argv or composed-launch fields;
- the expanded pipeline as `recipeFingerprint`, mapping `mode` to `launchMode`,
  omitting catalog-only `purpose`, and adding the launcher's evidence mode;
- the launcher's `effectiveProfileEvidence`; and
- certification source `host-schema-4` and derived status
  `pending-runtime-launch` with null synthetic probe fields.

Only this materialized shape crosses the runtime seam. Do not copy unused
profiles or entire host catalogs into a Task or Wave Manifest.

## Capability compatibility

Store the Orca version observed while validating the recipe surface as
provenance, not as an equality gate.

In legacy schemas, each purpose carries its own `recipeFingerprint`. In schema
4, the named pipeline definition is that canonical fingerprint and is shared by
every launcher/profile that references it:

```yaml
pipelines:
  <pipeline id>:
    purpose: <supervised|fullHandoff>
    mode: <worker-start|precreated-terminal>
    commands:
      - command: <exact Orca subcommand>
        requiredFlags: [<flag names the pipeline uses>]
        incompatibleFlagSets: [[<mutually exclusive flags>]]
    readinessSignal: <tui-idle|none>
    startReceiptFields: [<receipt fields the pipeline reads>]
```

Record one `commands` entry for every command the launch pipeline runs. A
composed supervised launch covers `orchestration worker-start`. A pre-created
supervised launch covers `terminal create`, `terminal wait`, and the
`orchestration worker-start --terminal` attach. A full handoff covers `terminal
create`, `terminal wait`, and `terminal send`. Do not hash help prose or include
unrelated CLI additions.

For schema 4, check each unique referenced pipeline once and each referenced
launcher once. For legacy schemas, check each selected purpose. In both cases,
perform one bounded, directional comparison against the current
version-matched guide: every command and required flag still exists; the
rendered invocation violates no current incompatible flag set; and each
readiness signal, receipt field, and evidence mode still exists. New optional
flags and relaxed incompatibilities are irrelevant.

A removed requirement, purpose mismatch, unresolved argv token, or new conflict
among required flags is setup drift. Provider/model evidence rules are
unchanged.

A schema 2/3 launch-purpose record without `recipeFingerprint` is the
exact-version legacy form. Do not silently reinterpret it; send new work to
`/setup-orca-development-loop`.
For resume or abort of an already-active pre-v5 wave, honor that manifest's
frozen certification, write authority, blocker evidence, and reviewer policy
without requiring P2 fields. Add no ticket or profile; a later new wave requires
setup.

## Cheap revalidation

Check only profiles this phase may launch. For schema 4, first resolve them and
deduplicate their referenced catalogs:

1. every selected profile, launcher, and purpose-specific pipeline reference
   resolves;
2. each unique pipeline remains capability-compatible;
3. each unique launcher has a valid agent, fully rendered argv when required,
   and one compatible evidence rule;
4. current headroom is read once when a usage source already exists; and
5. resolved tier coverage and `maxConcurrent` satisfy the proposed assignment.
   When Worker and Reviewer families are known, apply the different-family
   preference without blocking same-family or unknown-family review.

For host schema 2 or 3, perform the equivalent checks against each selected
purpose's stored recipe and fingerprint.

For a pre-v5 resume, perform the legacy agent/model/auth check and the
tier/concurrency portion against the frozen profile. Skip fingerprint
compatibility and apply the manifest's legacy reviewer policy below.

Current headroom is never loaded from either profile file. With no usage source,
record it as `unknown` and say so at confirmation; unknown is not unlimited.

Do not enumerate accounts, model catalogs, agents, executables, auth state, or
quota. Model acceptance and authentication are verified by the actual launch,
not a second setup-style probe. If a configured profile fails, try another
configured entry in that role's pool. When none remains, stop with the exact
failure; a persistent replacement requires `/setup-orca-development-loop`,
while a user-supplied temporary candidate follows the one-wave override below.

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
are known and a compatible configured entry has capacity. Same-family or
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
are known and a compatible configured entry has capacity; same-family or
unknown-family review needs no exception. Fail over only within the configured
binding to an entry that still satisfies tier and concurrency policy, preferring
a different family among entries with capacity, and record the provider error
and substitution. No out-of-pool profile is an automatic fallback.

## Per-phase confirmation

Setup configuration removes rediscovery, not user confirmation or runtime
launch evidence.

For Alignment, show the one materialized profile, effective headroom, launch
mode, and recipe-surface versus current Orca versions; for schema 4 also show
launcher/pipeline IDs. Legacy status may be `passed` or
`pending-runtime-launch`; normalized schema 4 derives
`pending-runtime-launch`. Explain that a pending purpose uses the real launch as
its lifecycle test. For Execution, show role bindings/pools, ticket tier
coverage, the materialized Worker and Reviewer families or `unknown`, resolved
`maxConcurrent`, `maxParallelTickets`, and the resulting maximum live Dispatch
count; for schema 4 also show launcher/pipeline IDs.
Same-family and unknown-family review need no exception. Whenever a selected
entry uses `user-attested` evidence, also state that its exact argv was
user-confirmed but provider/model cannot be independently observed.

Wait for explicit confirmation before creating a Task, handoff, or terminal.
Ticket, Adapter, validation, or profile changes invalidate confirmation.

## Freeze a self-contained profile catalog

Before generating the Coordinator handoff:

1. Collect every unique profile ID referenced by Coordinator, Worker,
   Reviewer, Integration Worker, Integration Reviewer, and ticket pins.
2. For schema 4, materialize each profile through defaults, launcher, and
   purpose-specific pipeline. For legacy schemas, use its stored purpose.
3. Copy each complete materialized definition into the Wave Manifest's
   `profiles` dictionary: exact agent/model/reasoning, family, resolved tiers and
   `maxConcurrent`, current headroom, rendered launch recipe, expanded
   `recipeFingerprint`, effective-profile evidence, derived/legacy launch
   status, and recipe-surface provenance.
4. Store role pools and integration assignments under `roleBindings` as IDs
   into that dictionary.
5. Require the dictionary keys to equal the unique referenced IDs and validate
   each role's launch purpose. Require ticket pins to belong to their
   corresponding Worker/Reviewer binding.

Freeze no host defaults, launcher catalog, pipeline catalog, or unreferenced
profile. Their behavior is already expanded into the selected definitions.

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
candidate using the bounded static checks above: agent/executable command
surface, exact model/reasoning expression, family metadata or `unknown`, and
launch expressiveness. Record it in this Wave Manifest's profile dictionary,
bind the affected role to its ID, and set `profilesSource.type` to
`one-wave-override` or `mixed`; do not edit the repository profile files.

Do not create a setup Probe Run during delivery. The real role launch is the
override's launch test: apply the bounded evidence rule before allowing work.
`pending-runtime-launch` is valid for setup-configured profiles and explicit
overrides, only for the purpose the role will use. If replacement is needed
after Coordinator startup, use the confirmed manifest-revision channel rather
than an informal wait.

Never invent or recommend an override on the user's behalf. Same-family or
unknown-family review needs no extra exception field.

For a running wave, Main delivers an override only as the next user-confirmed
manifest version through `--type handoff --subject manifest_revision
--report-path "$manifest_path"`. The Coordinator revalidates it at the safe
point defined in its manifest revision gate.

## Launch recipes

Render the structured recipe frozen in the Wave Manifest; do not reconstruct
one from model-name conventions or mutable repository configuration.

Supervised roles use `launch.supervised` and its matching launch status. The
top-level Coordinator uses `launch.fullHandoff`; success on one purpose never
proves the other. Apply the matching frozen `effectiveProfileEvidence`.

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

The top-level Coordinator uses its configured full-handoff recipe, not
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
2. Launch through its configured supervised recipe.
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
5. fail over only to another configured pool entry satisfying tier and
   concurrency policy. For schema 5, prefer a different family when both
   families are known and one remains. For a pre-v5 resume, reapply the
   manifest's frozen legacy reviewer policy before any Reviewer substitution;
   `different-family-from-worker` remains a hard filter.

An out-of-pool substitute requires the confirmed manifest-revision channel for
not-yet-launched work. Continue under the accepted version until the Coordinator
returns `manifest_accepted`.
If a `pending-runtime-launch` entry fails its real launch, remove that candidate
from the current phase, preserve the exact failure, and report setup drift after
configured in-pool failover is exhausted.

## Bounded evidence

Use exactly one evidence rule:

- a composed `worker-start --agent --model --effort` launch uses its start
  receipt's `launch.effective`; this is normative and needs no in-Task probe;
- a pre-created-terminal or custom-argv launch uses one harness-documented,
  read-only attestation command frozen at setup;
- when the harness documents no such command, use `user-attested` evidence with
  `command: null` and the exact confirmed argv, state its limitation at every
  profile confirmation, and proceed.

For `pending-runtime-launch`, the successful real start plus this evidence
authorizes that Dispatch or Coordinator startup; do not create a follow-up probe.
The immutable Alignment record or Wave Manifest keeps the pending status; the
start receipt, attestation result, or Coordinator startup report carries the
actual evidence for this work. Durable host configuration need not be rewritten
after every successful launch. Pending denotes absence of a synthetic setup
launch, not permission to skip evidence or a claim that the profile is
unhealthy.

Never use broad process scans, environment dumps, shell history, or repeated
full-terminal reads. Those paths are unreliable and can leak credentials.
