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
- inherit integration roles only from entries trusted for high-stakes work and
  still satisfying cross-family review.

`profile count`, `maxConcurrent`, and current live agent count are different
facts. Do not multiply profiles merely because several instances may run.

## User-owned profile binding

Collect, per unique profile:

- stable profile ID;
- exact Orca agent/harness;
- exact model ID, or an explicit `inherit-agent-default` choice;
- reasoning flag and level;
- model family;
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
5. family is known;
6. role bindings contain at least one valid Worker/Reviewer family pair;
7. launch preferences fit either the composed or custom-argv path.

Prefer a documented non-refreshing auth check. Do not start an interactive
login flow or create credentials on the user's behalf.

Quote provider errors. A user may vouch for an inconclusive provider, but its
first Orca launch remains the decisive test. Do not silently substitute another
profile. A smoke call spends quota, so disclose it and obtain consent before
calling the model; otherwise defer the decision to the consented launch probe.

## Probe Run

Explain the quota and Orca-resource side effects, then wait for consent. Create
one dedicated Run and preferably one disposable top-level worktree. Deduplicate
profiles across roles and certify each unique profile once per launch purpose.

The no-edit probe Task must:

- attest harness/model/reasoning through a safe harness-native mechanism;
- confirm it received the injected lifecycle preamble;
- avoid product-file reads and writes;
- send exactly one successful `worker_done`;
- end the turn and idle.

Before either supervised launch path, create the complete probe Task with
`orca orchestration task-create --spec` using the version-matched guide.
Record its returned Task ID as `<probe-task>`; pass that ID to `worker-start`.

For Orca-composed launches:

```text
orca orchestration worker-start --task <probe-task> --worktree <probe-worktree> \
  --agent <agent> --model <model> --effort <level> --run <probe-run> --json
```

Omit `--model` and `--effort` only when the user explicitly selected the
agent's configured default. Compare `launch.requested` with `launch.effective`.

For custom argv:

```text
orca terminal create --worktree <probe-worktree> --command <exact argv> --json
orca terminal wait --terminal <handle> --for tui-idle --timeout-ms <bounded> --json
orca orchestration worker-start --task <probe-task> \
  --worktree <probe-worktree> --terminal <handle> --run <probe-run> --json
```

Use argv fields in stored configuration; do not persist an interpolated shell
command. The Task's harness-native attestation is the effective-profile
evidence.

## Coordinator handoff probe

The top-level Coordinator is not a supervised Dispatch. Certify its profile
through its real launch shape:

1. create a fresh terminal in the disposable worktree with the exact argv;
2. wait for `tui-idle`;
3. send one no-work attestation-and-exit prompt;
4. verify the effective profile from one bounded response;
5. wait boundedly for exit and close the resulting unsupervised terminal tab.

The prompt forbids creating a Run, Task, worker, or product edit. A supervised
probe does not substitute for this full-handoff launch test.

## Evidence and cleanup

Each profile records certification separately for every launch purpose it
serves. A supervised result does not certify a Coordinator full handoff:

```yaml
certification:
  supervised:
    status: passed
    hostKey: <Orca host key>
    orcaVersion: <version>
    certifiedAt: <timestamp>
    requestedEffectiveMatch: true
    lifecycleCompleted: true
    repositoryUnchanged: true
  fullHandoff:
    status: <passed|not-required>
    hostKey: <Orca host key>
    orcaVersion: <version>
    certifiedAt: <timestamp or null>
    requestedEffectiveMatch: <true|null>
    repositoryUnchanged: <true|null>
```

After accepting each `worker_done`, release its supervised resource before
acknowledging the Delivery. Close only unsupervised terminals with terminal
commands. Inspect recovery receipts before retrying a failed launch. Remove the
disposable worktree only after every process and checkout state has a proven
disposition.

Never use missing output as proof of exit, never run broad process-environment
dumps, and never use `orchestration reset` as cleanup. If the handoff probe
ignores its exit request, `terminal close` is an explicit cancellation of that
test process, not evidence that it exited voluntarily. Report residual
resources and leave readiness blocked when cleanup cannot be proven.
