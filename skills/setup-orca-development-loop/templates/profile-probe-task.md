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

Do not read or modify product files, run repository commands, create workers,
or contact the tracker. Use only the safe harness-native profile attestation
named below:

`<exact attestation operation>`

Compare the observed values with the expected profile. On mismatch, send the
injected `worker_done` once with `outcome=failed`, expected and actual values,
then end the turn.

On a match, send the injected `worker_done` once with `outcome=succeeded` and a
body containing `PROFILE_PROBE_OK`, the observed profile, and confirmation that
no product file was touched. Then end the turn and remain idle for release.
```

## Coordinator full-handoff probe

```text
This is a setup launch probe, not a delivery handoff. Do not read or modify
product files. Do not create an Orca Run, Task, Dispatch, worker, worktree, or
tracker operation.

Use only this safe profile attestation:
<exact attestation operation>

Reply once with:
COORDINATOR_PROFILE_PROBE=<observed agent>/<model>/<reasoning>

Then exit the agent process cleanly.
```

Render the expected values and attestation from the user-supplied profile and
version-matched harness guide. Never ask the probe agent to dump its complete
environment.

