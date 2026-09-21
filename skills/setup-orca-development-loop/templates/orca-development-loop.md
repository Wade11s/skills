# Orca Development Loop Setup

Seed for `docs/agents/orca-development-loop.md`. Keep detailed values in the
documents this manifest points at; this file is the runtime readiness interface.

```yaml
schemaVersion: 5
configuredAt: <ISO timestamp>
configuredBy: setup-orca-development-loop

readiness:
  alignment: <ready|blocked>
  execution: <ready|blocked>
  requiresWriteConfirmation: <true|false>
  dependencyEvidenceMode: <adapter-readback|verified-alternate|user-attestation-required>

orca:
  projectId: <exact Orca project id>
  hostProfileKey: <key in docs/agents/agent-hosts.local.yaml>
  orcaVersionObservedAtSetup: <Orca CLI version as provenance>

documents:
  tracker: docs/agents/issue-tracker.md
  triage: docs/agents/triage-labels.md
  domain: docs/agents/domain.md
  environment: docs/agents/environment.md
  profiles: docs/agents/agent-profiles.md
  hostProfiles: docs/agents/agent-hosts.local.yaml

setupEvidence:
  trackerReads: <passed|failed>
  trackerWrites: <passed|declared-not-exercised|failed>
  profileRecipes: <static-validated|failed>
  worktreeSetup: <passed|runtime-deferred|failed>
```

`alignment: blocked` plus `execution: ready` is the execution-only mode. A
runtime revalidation failure does not rewrite this document; it reports drift
and sends the user back to `/setup-orca-development-loop`.

Derive write-dependent readiness with the
[write eligibility gate](issue-tracker.md#write-eligibility-gate).
Set `requiresWriteConfirmation: true` when writes are `declared-not-exercised`
and the phase remains usable. Do not store `writeRiskAcceptance`.

Interpret `dependencyEvidenceMode` under the
[blocker evidence contract](issue-tracker.md#blocker-evidence-contract).

`profileRecipes: static-validated` means every role-bound schema 4 profile
resolves through host defaults, one launcher, and a compatible purpose-specific
pipeline. Runtime derives `pending-runtime-launch` only in the materialized
Alignment/Wave profile, and the real launch applies bounded evidence.
`worktreeSetup: runtime-deferred` is usable only when an exact setup policy and
command are present; the first Issue Worktree runs them before agent work.
Known failures remain blocked.

