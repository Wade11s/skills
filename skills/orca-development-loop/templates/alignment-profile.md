# Alignment Profile Template

```yaml
version: 1
purpose: requirements-alignment
initialRequestReference: <Main conversation message or bounded task artifact>
confirmedByUserAt: <ISO timestamp or source message reference>
profilesSource: <docs/agents/agent-profiles.md host/profile id|one-wave-override>
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

Main reads the configured Alignment binding, cheaply revalidates only that profile, reports current headroom when available, and waits for explicit confirmation before it creates the Alignment Task or terminal. A user-supplied out-of-pool profile is a one-wave override and is not persisted here. Inline this record in the Task; do not create a duplicate artifact. Requested and effective values must match before Main asks the user to switch terminals.
