# Agent Environment

Seed for `docs/agents/environment.md`.

```yaml
schemaVersion: 3
configuredAt: <ISO timestamp>

workspace:
  kind: <git|folder>
  baseRef: <exact ref or none>
  setupPolicy: <run|skip|inherit>
  setupCommand: <exact command or none>
  setupEvidence: <passed|runtime-deferred|failed>

publication:
  mode: <local-only|push-base|pull-request>
  remote: <exact remote name or none>

validation:
  source:
    - <docs, repository script, CI, or user confirmation>
  workingDirectory: <repository-relative path>
  fastTier: <exact command or accepted none>
  fullSuite: <exact command or accepted none>
  repoSpecific:
    - <exact command, or use an empty list>
  sharedCoreModules:
    - <repository-relative path, or use an empty list>

exceptions:
  noAutomatedTestsAcceptedByUserAt: <timestamp/reference or null>
```

Commands are exact and copy-pasteable. `none` is valid only for setup hooks or
an explicitly accepted lack of automated tests; never turn it into a shell
command. The Wave Manifest copies this validation block and records a fresh
source fingerprint. Name required environment variables without embedding
their secret values.

`runtime-deferred` is valid only for an exact sourced `run` or `inherit` setup
path. The first real Issue Worktree executes it before agent work and stops the
wave on failure. A `skip` policy whose Orca metadata matches is `passed`; it
needs no disposable setup worktree.

`local-only` uses `none` for the remote. `push-base` and `pull-request` record
the exact remote name. The pull-request commands themselves live once, with the
code-review surface in `docs/agents/issue-tracker.md`, so `pull-request`
requires exact `codeReview.createPullRequest` and `codeReview.readPullRequest`
entries there; the Wave Manifest freezes the resolved pair.

