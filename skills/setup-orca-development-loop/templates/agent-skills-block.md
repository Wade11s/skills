# Root Agent Skills Block

Update an existing `## Agent skills` section in place. Include only the domain
layout actually selected and the exact tracker/review summaries.

```markdown
## Agent skills

### Orca development loop

The repository is configured for `orca-development-loop`. Read
`docs/agents/orca-development-loop.md` first.

### Issue tracker

Work items live in <primary tracker and scope>; code review lives in <surface>.
See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles map to <representation> values. See
`docs/agents/triage-labels.md`.

### Domain docs

This repository uses a <single-context|multi-context> domain-doc layout. See
`docs/agents/domain.md`.

### Agent environment

Worktree setup and validation tiers are recorded in
`docs/agents/environment.md`; shared routing policy is in
`docs/agents/agent-profiles.md`, and this host's gitignored normalized profile
pool is in `docs/agents/agent-hosts.local.yaml`.
```

