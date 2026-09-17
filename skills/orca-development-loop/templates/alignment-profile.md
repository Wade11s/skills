# Alignment Profile Template

```yaml
version: 1
purpose: requirements-alignment
initialRequestReference: <Main conversation message or bounded task artifact>
confirmedByUserAt: <ISO timestamp or source message reference>
profilesSource: <docs/agents/agent-hosts.local.yaml host/profile id|one-wave-override>
profile:
  agent: <Orca agent id>
  model: <exact harness/provider model identifier>
  family: <model lineage>
  reasoning: <thinking or effort level>
launch: <certified structured supervised recipe>
certification:
  hostKey: <Orca host key>
  orcaVersion: <version>
  certifiedAt: <timestamp>
runtimeVerification: <launch receipt or harness-native attestation>
```

Render this record through the
[Alignment profile gate](../references/profile-gate-and-launch.md#per-phase-confirmation).
