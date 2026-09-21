# Profile Pool Configuration

Use this reference after tracker and repository policy are settled. The local
host file is a compact source for resolving launchable profiles, not a log of
setup probes.

Normal setup configures shared launch mechanics without starting agents. Every
real Alignment, Coordinator, Worker, or Reviewer launch still applies bounded
effective-profile evidence.

## Profile-pool interface

Schema 4 separates facts by the level at which they vary:

| Level | Owns |
|---|---|
| Host | identity and one recipe-surface provenance record |
| Defaults | common tiers and `maxConcurrent` |
| Pipeline | one Orca command sequence and capability fingerprint |
| Launcher | one agent, argv template, evidence rule, and purpose-to-pipeline mapping |
| Profile | launcher, model, reasoning, family, and uncommon routing overrides |
| Role bindings | which profile IDs may serve each role |

This is the only durable interface setup writes. Do not copy a pipeline,
launcher, default, or host fact into each profile.

## Minimal role pool

Ask for `maxParallelTickets` in the single setup decision packet. Recommend:

- one Alignment and one Coordinator profile;
- one Worker and one Reviewer profile for a serial loop;
- another Worker or Reviewer only for requested parallelism, provider failover,
  or clean-room variety;
- inherited Integration roles from selected Worker/Reviewer entries unless the
  user names dedicated profiles.

One profile may serve several roles and instances up to `maxConcurrent`.
Profile count, role count, and current instance count are different facts.

Use scalar bindings for Alignment and Coordinator. Keep pools as lists,
including Integration pools, because ordered in-pool failover is meaningful.

## Normalize before writing

Build the host entry in this order:

1. Find values shared by every profile. Store common tier coverage and
   concurrency once under `defaults`; put only real exceptions on a profile.
2. Group identical Orca launch mechanics into `pipelines`. Ignore model,
   reasoning, and evidence while grouping: those belong elsewhere.
3. Group identical agent command construction and evidence into `launchers`.
   Fixed permission/onboarding flags belong in the launcher's structured
   `argvTemplate`.
4. Write each profile as only `launcher`, `model`, `reasoning`, `family`, and
   optional default overrides.
5. Bind profile IDs to roles.

Create another pipeline only when the Orca command sequence, required flags,
incompatibilities, readiness signal, receipt fields, mode, or purpose differs.
Create another launcher only when agent ID, argv construction, evidence, or its
purpose-to-pipeline mapping differs.

Do not use YAML anchors or merge keys. Named catalogs are explicit, portable,
and easy for agents to validate.

## Pipelines

A pipeline is the canonical command-surface fingerprint. Store it once under
the host:

```yaml
pipelines:
  precreated-supervised:
    purpose: supervised
    mode: precreated-terminal
    commands:
      - command: terminal create
        requiredFlags: [worktree, command, json]
        incompatibleFlagSets: []
      - command: terminal wait
        requiredFlags: [terminal, for, timeout-ms, json]
        incompatibleFlagSets: []
      - command: orchestration worker-start
        requiredFlags: [task, worktree, terminal, run, json]
        incompatibleFlagSets:
          - [agent, terminal]
          - [terminal, model]
          - [terminal, effort]
    readinessSignal: tui-idle
    startReceiptFields: []
```

Store only used pipelines. Typical distinct shapes are composed supervised,
pre-created supervised, and pre-created full handoff. Do not duplicate a
pipeline merely because launchers use different evidence modes.

Record the Orca version and check time once under `recipeSurface`. A version
change alone does not invalidate a pipeline.

## Launchers

A launcher owns the facts shared by profiles using one agent command:

```yaml
launchers:
  pi:
    agent: pi
    argvTemplate: [pi, --model, "{model}", --thinking, "{reasoning}"]
    evidence:
      mode: attestation
      command: >-
        printf 'PROFILE=%s/%s:%s\n'
        "$PI_PROVIDER" "$PI_MODEL" "$PI_REASONING_LEVEL"
    pipelines:
      supervised: precreated-supervised
      fullHandoff: precreated-full-handoff
```

`argvTemplate` is a structured token list. Only complete array elements may be
`{model}` or `{reasoning}`. Replace those tokens one-for-one; never interpolate
inside a shell string. Use each placeholder at most once. A concrete profile
value requires its placeholder; `inherit-agent-default` or `none` requires a
dedicated launcher that omits it. `{reasoning}` must immediately follow its
exact flag token; runtime freezes that flag with the reasoning level. If a
profile needs different fixed flags, optional arguments, or evidence, define
another launcher.

For a composed `worker-start` pipeline, omit `argvTemplate`; runtime uses the
launcher `agent` plus profile model/reasoning. Evidence must be:

- `receipt` for a composed launch, with `command: null`;
- `attestation` for one harness-documented read-only command; or
- `user-attested`, with `command: null` and the independent-observation
  limitation shown at phase confirmation.

## Profiles

A profile stores only values that select behavior:

```yaml
profiles:
  worker-primary:
    launcher: pi
    model: openai-codex/example-model
    reasoning: high
    family: openai
    # Omit these when host defaults apply.
    tiers: [simple, standard]
    maxConcurrent: 1
```

Preserve exact user-supplied values. Do not infer family when lineage is
unknown. Do not derive operational values from the profile ID.

Default Worker and Reviewer tier coverage to all three complexity tiers and
default `maxConcurrent` to `1` unless the decision packet sets another host
default. Complexity belongs to tickets; profile overrides are optional routing
constraints.

## Resolve and materialize

Setup and runtime use one resolver:

1. Map role to purpose: Coordinator uses `fullHandoff`; all other long-lived
   roles use `supervised`.
2. Resolve the role-bound profile, then its launcher.
3. Resolve `launcher.pipelines[purpose]`, then require the pipeline's declared
   purpose to match.
4. Merge profile `tiers` and `maxConcurrent` over host defaults.
5. For `precreated-terminal`, render the structured argv template and require
   every placeholder to resolve. For `worker-start`, use launcher `agent` plus
   profile model/reasoning.
6. Attach launcher evidence.

For Alignment and a Wave Manifest, materialize the resolved profile into the
self-contained runtime shape: exact agent/model/reasoning/family/defaults,
rendered launch command, expanded pipeline as `recipeFingerprint`, evidence,
and `pending-runtime-launch`. Freeze only referenced profiles; never copy the
whole host catalog.

The pending status is derived at materialization time. It does not belong in
the profile pool: it means no synthetic setup launch is required, while every
real launch still verifies its own evidence.

## Static validation budget

Validate each referenced pipeline once and each referenced launcher once, not
once per profile:

1. every role-bound profile exists;
2. every profile resolves to one launcher;
3. every required purpose resolves to one compatible pipeline;
4. every required Orca command/flag/readiness/receipt field exists;
5. every pre-created launcher has a fully resolvable structured argv template;
6. every launcher has one valid evidence rule;
7. profile overrides satisfy tier and concurrency policy; and
8. every stored profile, launcher, and pipeline is reachable from a role
   binding.

Do not enumerate model catalogs, probe authentication, make smoke calls, start
interactive login, enter workspace-trust flows, or inspect process
environments. Model acceptance and authentication are proven by the real
launch.

## Keep history out of the pool

The pool represents current launch policy. Do not store:

- `verification`, `certification`, or per-purpose `not-required` blocks;
- repeated host key or Orca version;
- `fullHandoff: null` or other unused-purpose nulls;
- smoke/probe transcripts or lifecycle booleans;
- amendment, rename, debugging, or certification-scope prose;
- terminal, Run, Task, or Dispatch IDs;
- credentials or current provider headroom.

Current flags belong in a launcher. Current role intent belongs in
`roleBindings`. Current routing limits belong in defaults or profile overrides.
Historical explanation belongs in the conversation, changelog, ADR, or an
explicitly requested diagnostic artifact, not the runtime profile pool.

## Legacy migration

When migrating host schema 2 or 3 to schema 4:

1. flatten `suppliedByUser` into profile model/reasoning plus a launcher
   reference;
2. lift common `tiers` and `maxConcurrent` into host defaults;
3. deduplicate `launch.*.recipeFingerprint` into named pipelines;
4. deduplicate argv and `effectiveProfileEvidence` into launchers;
5. turn Alignment and Coordinator one-item arrays into scalar bindings;
6. remove unused-purpose nulls and `not-required` records;
7. inspect notes/amendments for any current flag, evidence rule, role, tier, or
   concurrency constraint not represented structurally; encode it or put the
   conflict in the decision packet;
8. remove verification/certification and purely historical prose; and
9. preserve the active wave's already-frozen profile definitions unchanged.

A known invalid launcher or pipeline is repaired before migration or omitted
from role bindings; it is not retained as a verbose failed record.

## Explicit deep diagnostic

Enter this branch only when the user explicitly asks to launch-test a named
profile and purpose, or requests isolation after a real launch failure. Do not
offer it during normal setup and do not expand one diagnostic to the whole
pool.

Before running it, disclose quota and temporary Orca resources and obtain
consent. Read
[Profile launch diagnostic](../templates/profile-launch-diagnostic.md), resolve
the named profile through the same catalogs, and test the materialized recipe.
Prove every temporary resource's disposition. The result is a diagnostic
artifact, not another block copied into the profile pool.
