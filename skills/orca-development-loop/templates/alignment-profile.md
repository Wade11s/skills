# Alignment Profile Template

```yaml
version: 1
purpose: requirements-alignment
initialRequestReference: <Main conversation message or bounded task artifact>
confirmedByUserAt: <ISO timestamp or source message reference>
profile:
  harness: <pi|claude|codex|other>
  model: <exact harness/provider model identifier>
  reasoning: <thinking or effort level>
launcher: <exact composed launcher or explicit CLI argv>
verification: <child-internal PI_* probe or harness-native equivalent>
```

Main discovers one recommended combination through the bounded query path, proposes it, and waits for explicit user confirmation before it creates the Alignment Task or terminal. Inline this record in the Task; do not create a duplicate profile artifact unless another process consumes it. After Task injection, requested and effective values must match before Main asks the user to switch terminals.
