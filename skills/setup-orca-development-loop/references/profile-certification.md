# Profile and Launch Certification

Use this reference after tracker and repository policy are settled. Recommend
role capabilities and capacity first; the user supplies exact profiles.

## Capacity before profiles

Ask for `maxParallelTickets`, whether provider failover matters, and whether
clean-room review should have a second Reviewer option. Recommend counts without
naming models:

- one Alignment and one Coordinator profile;
- one Worker and one Reviewer profile for a minimal serial loop;
- a second entry in either pool for provider failover, parallel-provider
  capacity, or clean-room variety;
- inherit integration roles only from entries trusted for high-stakes work;
  prefer a different family for Integration Reviewer when a compatible entry
  exists.

`profile count`, `maxConcurrent`, and current live agent count are different
facts. Do not multiply profiles merely because several instances may run.

## User-owned profile binding

Collect, per unique profile:

- stable profile ID;
- exact Orca agent/harness;
- exact model ID, or an explicit `inherit-agent-default` choice;
- reasoning flag and level;
- model family, or `unknown` when lineage cannot be established;
- trusted complexity tiers;
- maximum concurrent instances;
- roles that bind to it.

An inherited agent default is less reproducible: certify what the launch
actually reports and make that limitation visible. Never infer a model ID that
the user did not choose.

## Static validation

Resolve one Orca executable and load version-matched guides. Check only supplied
candidates:

1. the agent ID is launchable;
2. the exact model is accepted by that agent;
3. the reasoning option is valid for that model;
4. authentication is ready, or a bounded smoke call proves a provider whose
   probe is inconclusive;
5. family metadata is recorded as a lineage or `unknown`; unknown family is not
   a certification failure;
6. role bindings contain at least one Worker and one Reviewer; prefer a
   different-family pair when both families are known and a compatible entry
   exists, but do not block same-family or unknown-family review and do not add
   a provider or vendor gate;
7. launch preferences fit either the composed or custom-argv path;
8. each launch purpose has one effective-profile evidence mode and one
   `recipeFingerprint` in the runtime
   [Capability compatibility](../../orca-development-loop/references/profile-gate-and-launch.md#capability-compatibility)
   shape, covering every command in that recipe's pipeline and only the
   receipt/evidence fields it reads:
   - `receipt` for a composed launch;
   - `attestation` with one harness-documented read-only command for a
     pre-created-terminal or custom-argv launch;
   - `user-attested` with the exact user-confirmed argv when no such command
     exists.

A composed supervised fingerprint covers `orchestration worker-start`, the
stored `task`, `worktree`, `agent`, `run`, and `json` flags, the stored
`model`/`effort` flags when not inherited, their documented incompatibilities,
and the `launch.requested`/`launch.effective` receipt fields. A pre-created
supervised fingerprint additionally covers `terminal create`, `terminal wait`,
and the `worker-start --terminal` attach, including the documented
`terminal`/`agent`, `terminal`/`model`, and `terminal`/`effort`
incompatibilities. A full-handoff fingerprint covers `terminal create`,
`terminal wait`, and `terminal send`.

Do not hash help prose. Certification is keyed by host, agent, model, reasoning,
launch purpose, launch mode, and the canonical fingerprint. Store the observed
Orca version as provenance, not as an equality gate.

Prefer a documented non-refreshing auth check. Do not start an interactive
login flow or create credentials on the user's behalf.

Quote provider errors. A user may vouch for an inconclusive provider, but its
first Orca launch remains the decisive test. Do not silently substitute another
profile. A smoke call spends quota, so disclose it and obtain consent before
calling the model; otherwise defer the decision to the consented launch probe.

For Pi custom-argv launches, this is the worked example of a documented
read-only `attestation` command:

```bash
printf 'PROFILE=%s/%s:%s\n' "$PI_PROVIDER" "$PI_MODEL" "$PI_REASONING_LEVEL"
```

Do not generalize that command to another harness. When its harness documents
no equivalent, record `user-attested` evidence with `command: null`, retain the
exact confirmed argv, and state that provider/model cannot be independently
observed. That limitation does not make certification impossible.

## Probe Run

Explain the quota and Orca-resource side effects, then wait for consent. Create
one dedicated Run and preferably one disposable top-level worktree. Deduplicate
profiles across roles and certify each unique profile once per launch purpose.

Every no-edit probe Task must:

- confirm it received the injected lifecycle preamble;
- avoid product-file reads and writes;
- send exactly one successful `worker_done`;
- end the turn and idle.

An `attestation` Task also runs its one recorded command and compares the
observed harness/model/reasoning. A `receipt` or `user-attested` Task performs no
in-Task profile probe.

Before either supervised launch path, create the complete probe Task with
`ORCA orchestration task-create --spec` using the version-matched guide.
Record its returned Task ID as `<probe-task>`; pass that ID to `worker-start`.

For Orca-composed launches:

```text
ORCA orchestration worker-start --task <probe-task> --worktree <probe-worktree> \
  --agent <agent> --model <model> --effort <level> --run <probe-run> --json
```

Omit `--model` and `--effort` only when the user explicitly selected the
agent's configured default. The start receipt's `launch.effective` is normative
and sufficient: compare it with `launch.requested`, and do not ask the probe
Task to attest the profile again.

For custom argv:

```text
ORCA terminal create --worktree <probe-worktree> --command <exact argv> --json
ORCA terminal wait --terminal <handle> --for tui-idle --timeout-ms <bounded> --json
ORCA orchestration worker-start --task <probe-task> \
  --worktree <probe-worktree> --terminal <handle> --run <probe-run> --json
```

Use argv fields in stored configuration; do not persist an interpolated shell
command. A pre-created-terminal receipt cannot prove provider/model. Run the one
recorded read-only command in `attestation` mode. In `user-attested` mode, run
no substitute probe; compare the launched argv with the exact user-confirmed
argv and carry the independent-verification limitation.

## Coordinator handoff probe

The top-level Coordinator is not a supervised Dispatch. Certify its profile
through its real launch shape:

1. create a fresh terminal in the disposable worktree with the exact argv;
2. wait for `tui-idle`;
3. send one no-work prompt that runs the recorded attestation command, or states
   the `user-attested` limitation when no command exists;
4. verify one bounded response against the command output or confirmed argv;
5. wait boundedly for exit and close the resulting unsupervised terminal tab.

The prompt forbids creating a Run, Task, worker, or product edit. A supervised
probe does not substitute for this full-handoff launch test.

## Evidence and cleanup

Each profile records certification separately for every launch purpose it
serves. A supervised result does not certify a Coordinator full handoff:

```yaml
effectiveProfileEvidence:
  supervised:
    mode: <receipt|attestation|user-attested>
    command: <exact read-only command or null>
certification:
  supervised:
    status: passed
    hostKey: <Orca host key>
    orcaVersionObservedAtCertification: <provenance>
    certifiedAt: <timestamp>
    requestedEffectiveMatch: true
    lifecycleCompleted: true
    repositoryUnchanged: true
  fullHandoff:
    status: <passed|not-required>
    hostKey: <Orca host key>
    orcaVersionObservedAtCertification: <provenance>
    certifiedAt: <timestamp or null>
    requestedEffectiveMatch: <true|null>
    repositoryUnchanged: <true|null>
```

Store one `effectiveProfileEvidence` entry for each launch purpose. `receipt`
requires `command: null`; `attestation` requires its exact command;
`user-attested` requires `command: null` and exact confirmed argv. Set
`requestedEffectiveMatch: null` when evidence is `user-attested`, because the
launch path was exercised but provider/model was not independently observable.
Repeat that limitation at every later confirmation that uses the profile.

After accepting each `worker_done`, release its supervised resource before
acknowledging the mail batch. Close only unsupervised terminals with terminal
commands. Inspect recovery receipts before retrying a failed launch. Remove the
disposable worktree only after every process and checkout state has a proven
disposition.

Never use missing output as proof of exit, never run broad process-environment
dumps, and never use `orchestration reset` as cleanup. If the handoff probe
ignores its exit request, `terminal close` is an explicit cancellation of that
test process, not evidence that it exited voluntarily. Report residual
resources and leave readiness blocked when cleanup cannot be proven.
