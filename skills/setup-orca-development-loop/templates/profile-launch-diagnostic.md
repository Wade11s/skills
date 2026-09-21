# Targeted Profile Launch Diagnostic

Load this template only after the user explicitly requests deep verification of
one named profile and launch purpose. Normal setup never loads or renders it.

## Supervised purpose

Create one temporary Task only for the requested profile:

```markdown
# Targeted profile launch diagnostic

This is an explicitly requested setup diagnostic, not product work.

- Profile: `<profile id>`
- Purpose: `supervised`
- Expected agent/model/reasoning: `<exact values>`
- Effective-profile evidence: `<receipt|attestation|user-attested>`

Do not read or modify product files, contact the tracker, create another worker,
or inspect the process environment.

Apply exactly one evidence branch:

- `receipt`: setup already compared the start receipt's `launch.requested` and
  `launch.effective`; run no profile command.
- `attestation`: run only `<exact read-only command>` and compare its result.
- `user-attested`: run no profile command; report the exact confirmed argv and
  the independent-observation limitation.

Send exactly one `worker_done`. Use `outcome=succeeded` with
`PROFILE_DIAGNOSTIC_OK`, or `outcome=failed` with the exact mismatch. Then idle
for release.
```

Create the Task before starting the worker. Resolve the named profile through
host defaults, launcher, and supervised pipeline, then use that materialized
recipe unchanged. The diagnostic tests the configured catalogs rather than
improvising a new recipe.

## Coordinator full-handoff purpose

Use the configured `terminal create` / readiness wait / `terminal send`
pipeline. Send one bounded prompt:

```text
This is an explicitly requested profile launch diagnostic, not delivery work.
Do not read or modify product files or create an Orca Run, Task, worker,
worktree, or tracker operation.

Apply the configured <attestation|user-attested> evidence rule and reply once:
COORDINATOR_PROFILE_DIAGNOSTIC=<evidence>/<profile>

Then exit cleanly.
```

## Completion

Compare the actual evidence with the configured profile, verify Git stayed
unchanged, and settle every temporary Task, terminal, Dispatch, and worktree.
Report only the tested materialized profile and purpose. Do not add
verification/certification history or status to the profile pool, infer another
purpose passed, or use `orchestration reset` for cleanup.
