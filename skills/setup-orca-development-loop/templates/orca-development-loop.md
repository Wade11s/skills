# Orca Development Loop Setup

Seed for `docs/agents/orca-development-loop.md`. Keep detailed values in the
documents this manifest points at; this file is the runtime readiness interface.

```yaml
schemaVersion: 4
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

certifications:
  trackerReads: <passed|failed>
  trackerWrites: <passed|declared-not-exercised|failed>
  profiles: <passed|partial|failed>
  worktreeSetup: <passed|failed>
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

