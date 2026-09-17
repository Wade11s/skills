# Agent Profile Probe Templates

## Supervised probe Task

```markdown
# Profile launch certification

This is a setup probe, not product work.

Expected profile:

- Agent: `<agent>`
- Model: `<model or configured default>`
- Reasoning: `<flag and level>`
- Host: `<Orca host key>`
- Orca version: `<version>`
- Effective-profile evidence: `<receipt|attestation|user-attested>`

Do not read or modify product files, run repository commands, create workers,
or contact the tracker.

Render exactly one evidence branch:

- `receipt`: Setup already verified the start receipt's `launch.effective`.
  Run no profile command.
- `attestation`: run only `<exact read-only attestation command>` and compare
  its observed values with the expected profile.
- `user-attested`: run no profile command. State that the launch used the exact
  user-confirmed argv `<exact argv>` and that provider/model cannot be
  independently observed.

For an observable mismatch, send the injected `worker_done` once with
`outcome=failed`, expected and actual values, then end the turn.

On accepted evidence, send the injected `worker_done` once with
`outcome=succeeded` and a body containing `PROFILE_PROBE_OK`, the selected
evidence and values, and confirmation that no product file was touched. Then
end the turn and remain idle for release.
```

## Coordinator full-handoff probe

```text
This is a setup launch probe, not a delivery handoff. Do not read or modify
product files. Do not create an Orca Run, Task, Dispatch, worker, worktree, or
tracker operation.

Effective-profile evidence: <attestation|user-attested>

For `attestation`, run only:
<exact read-only attestation command>

For `user-attested`, run no profile command. State that the exact
user-confirmed argv was <exact argv> and provider/model cannot be independently
observed.

Reply once with:
COORDINATOR_PROFILE_PROBE=<evidence mode>/<observed or user-attested profile>

Then exit the agent process cleanly.
```

Render one branch from the user-supplied profile and version-matched harness
guide, then remove the other branches. Never ask the probe agent to dump its
complete environment.

