# Orca Development Loop Setup

Seed for `docs/agents/orca-development-loop.md`. Keep detailed values in the
documents this manifest points at; this file is the runtime readiness interface.

```yaml
schemaVersion: 2
configuredAt: <ISO timestamp>
configuredBy: setup-orca-development-loop

readiness:
  alignment: <ready|blocked>
  execution: <ready|blocked>
  dependencyEvidenceMode: <adapter-readback|verified-alternate|user-attestation-required>

orca:
  projectId: <exact Orca project id>
  hostProfileKey: <key in docs/agents/agent-profiles.md>
  certifiedVersion: <Orca CLI version>

documents:
  tracker: docs/agents/issue-tracker.md
  triage: docs/agents/triage-labels.md
  domain: docs/agents/domain.md
  environment: docs/agents/environment.md
  profiles: docs/agents/agent-profiles.md

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
[write eligibility gate](../../orca-development-loop/references/tracker-adapter.md#write-eligibility-gate).
The Adapter stores the sole durable write-risk acceptance record; this summary
does not duplicate it. When rendering this document, replace the skill-relative
link with a resolvable installed-skill reference.

Interpret `dependencyEvidenceMode` under the
[blocker evidence contract](../../orca-development-loop/references/tracker-adapter.md#blocker-evidence-contract).

