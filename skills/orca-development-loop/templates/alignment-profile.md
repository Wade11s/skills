# Alignment Profile Template

```yaml
version: 3
purpose: requirements-alignment
initialRequestReference: <Main conversation message or bounded task artifact>
confirmedByUserAt: <ISO timestamp or source message reference>
profilesSource: <docs/agents/agent-hosts.local.yaml host/profile id and schema|one-wave-override>
profile:
  agent: <Orca agent id>
  model: <exact harness/provider model identifier>
  family: <model lineage|unknown>
  reasoning: <thinking or effort level>
launch: <materialized structured supervised recipe including recipeFingerprint>
launchStatusAtConfirmation: <passed|pending-runtime-launch>
configuration:
  hostKey: <Orca host key>
  orcaVersionObservedAtRecipeValidation: <provenance>
  configuredAt: <timestamp>
runtimeVerification: <launch receipt or harness-native attestation>
orcaVersionObservedAtConfirmation: <current version>
```

Render this record through the
[Alignment profile gate](../references/profile-gate-and-launch.md#per-phase-confirmation).
