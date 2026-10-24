---
name: why
description: "Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, postmortems, or data-backed thresholds. Investigates available history, tickets, docs, chat, observability, errors, and analytics, then returns cited decisions, tradeoffs, and explicit evidence gaps. Use how for runtime behavior."
---

# Why

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

Investigate the motivation and intent behind code. The optional companion **how** answers runtime behavior; if it is absent and mechanics are needed, trace that scoped flow directly and disclose the missing companion. `why` answers what forces led to the shape.

Use ordinary investigator and synthesizer workers with read-only scope. Resolve `why investigators` and `why synthesizer` by the startup precedence; both default to `inherit-parent`. Omit model selection for `inherit-parent` / `auto`. Use only confirmed worker-model IDs. Report rejected preferences and ask for an alternative or an explicitly authorized parent-model fallback. A missing preference file is normal; surface invalid or unreadable affected preferences before use rather than treating them as missing. Use the project budget, then global budget, through supported host settings; disclose unapplied effort instead of changing model-ID suffixes. Same-family workers are not model diversity. Forward the original project root, preference paths, effective roles, budget, and overrides.

Check whether delegates can access the needed read tools; no host mode universally guarantees or removes MCP access. If a worker lacks a tool, the parent may fetch authorized scoped evidence and pass it along, or report the gap. Do not enable writes to obtain read access. If worker creation is unavailable at this level, including a host restriction on nested workers, perform each available source investigation and the synthesis directly in separate scoped steps. Label this same-context investigation, not independent corroboration; any caller-required independent gate remains unverified. Distinct historical records can still support a claim even when one investigator reads them.

## Operating Posture

Operate as a **careful, cautious, and precise investigator**. Be honest about what you know vs what you're inferring. Read `references/epistemics.md` for the full confidence framework and phrasing guide. The synthesizer must follow it.

## Step 1. Understand the Target and the Question

The **target** is usually a chunk of code, a pattern, a feature, or a named design decision. The **question** is usually a design rationale, a tradeoff, a motivating edge case, an external constraint, dead code, or a broad history sweep.

If the target is vague ("why do we do it this way?" with no clear referent), make your best guess from available conversation context (referenced files, recent edits, editor selection if exposed, what was just discussed). State your interpretation briefly so the user can redirect if you're off, then proceed.

## Step 2. Establish the Code Anchor

Before investigating, build the seed context inline: file paths and line ranges, key symbols (functions, classes, constants), recent commits touching the target when available, PR numbers from merge commits (e.g. `(#1234)`), and linked ticket IDs. In a Git checkout with history access, use `git blame -L <start>,<end> <file>`, `git log --follow -p -- <file>`, `git log --oneline -20 -- <file>`, and `git log -1 --format=%B <commit>` as needed. For substantive commits, read PR bodies and discussion through an available source-control integration. On GitHub with authenticated `gh`, one option is `gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews`.

Neither Git history nor GitHub access is guaranteed. Without them, anchor on the files and supplied records, and record missing history or PR access as gaps. Do not fabricate commit IDs, links, or rationale. This anchor goes to every investigator and the synthesizer.

## Step 3. Investigate Available Sources

**Default to full available-source coverage, parallel when supported.** The goal is a complete coverage map, not a minimal one. Document the null, don't skip an authorized available search. An explicit narrower user/caller scope limits the searches but still requires a seven-category map with scope exclusions.

### Discovery

Before investigating, discover authorized read integrations from the active host's tool catalog, MCP resources, documented CLI capabilities, and user-supplied exports. Use their actual schemas and authentication state; no vendor directory is assumed. Do not install integrations or change credentials automatically.

Map each available source to one evidence category:

1. Source control history
2. Issue / ticket tracker
3. Long-form documents
4. Real-time team chat
5. Infrastructure observability
6. Error / exception tracking
7. Product analytics warehouse

Classify using source names, server instructions, tool schemas, and resource descriptors. If an integration could fit multiple categories, choose its primary evidence and record ambiguity. Source control may be local history, a service integration, or an export; confirm availability rather than assuming Git or `gh`.

Use one ordinary investigator per available category on the resolved `why investigators` role, each owning a single source integration or export. Run concurrently when supported, otherwise sequentially or as direct scoped passes. Record which source was selected and any unsearched alternatives. If source access is unavailable to the worker but available to the parent, pass the parent's scoped evidence.

Each investigator's prompt is `references/investigator-prompt.md` filled in, plus:
- the category playbook `references/sources/<source>.md` for the selected source, adapted from the examples in `references/source-playbook.md`
- `references/sources/incident-postmortem.md` **if the target code looks defensive** (null checks, retry logic, timeout handling, rate limiting, feature flags, egress guards, OOM handlers)
- the code anchor and the user's original question

### Investigator roster, one per available evidence category

Each category below is uniquely positioned to surface one shape of "why", shown after "Best at". Use it to know what to expect back, to name a gap when a category returns empty, and, only in the rare provably-irrelevant case, to justify a skip.

1. **Source control** (available repository history, PR integration, code comments, tests). Always assess availability; use the accessible subset and name missing history or PR access. Best at *implementation-time rationale captured during review*.
2. **Issue / ticket tracker** (e.g. Linear, Jira, GitHub Issues, Plane, Shortcut MCP). Best at *the product or business forcing function*. Strongest when the why is external to engineering.
3. **Long-form documents** (e.g. Notion, Confluence, Google Docs, Coda MCP). Best at *long-form design rationale*, written out before it becomes code.
4. **Real-time team chat** (e.g. Slack, Discord, Microsoft Teams, Mattermost MCP). Best at *real-time deliberation that never reached a doc*. Especially important when the source control, ticket, and doc paper trail is thin.
5. **Infrastructure observability** (e.g. Datadog, New Relic, Honeycomb, Grafana, Splunk MCP). Best at *infrastructure and runtime reality that motivated the code*. Strongest when the target reacts to an infra signal (timeouts, retries, rate limits, circuit breakers).
6. **Error / exception tracking** (e.g. Sentry, Rollbar, Bugsnag, Airbrake MCP). Best at *the specific exceptions and error trajectories that motivated defensive or corrective code*. Strongest for catch blocks, null guards, type checks, retries, and other defenses.
7. **Product analytics warehouse** (e.g. Databricks, Snowflake, BigQuery, ClickHouse, dbt, Redshift MCP). Best at *product and data reality that shaped the code*. Strongest for flag-gated code, experiment-driven ships, data migrations, and "where did this number come from" questions.

### When to skip an investigator

Only with an **explicit, written justification** that goes in the final Sources Consulted. Valid reasons:

- **No authorized readable source is available for that category**, or access failed. Flag a gap, not a null search: "Real-time team chat unavailable. No authorized integration or export, so the conversational record was not searchable."
- **The user/caller explicitly limited the scope.** Name the exclusion rather than suggesting it was searched or proved irrelevant.
- **The source is provably irrelevant**, not just "probably irrelevant." A high bar: "Error / exception tracking skipped. Target is a build-time script with no runtime code path."

For a trivial single-commit target with a complete PR rationale, you may use a scoped inline answer only after assessing all seven categories and recording why further searches would be redundant or out of scope. Do not describe those categories as searched.

## Step 4. Synthesize

Use one ordinary synthesizer on the resolved `why synthesizer` role, or synthesize directly without delegation. It gets:
1. The investigator findings, including any null results and any categories skipped with justification
2. The code anchor
3. The user's original question
4. The epistemics framework from `references/epistemics.md`
5. The synthesizer prompt template from `references/synthesizer-prompt.md`

## Step 5. Present

Present the synthesizer's output, or your direct scoped synthesis. You may lightly edit for clarity or add context from the conversation, but **do not rewrite the confidence language**. Disclose missing capabilities/companions and any unavailable independent checks. Investigation authorizes reads, not external messages, ticket changes, code edits, or publication.

## Output Format

The structure is the one in `references/synthesizer-prompt.md`: The Question, The Code in Question, What We Found, What We Can Reasonably Infer, Competing Hypotheses, What We Don't Know, Sources Consulted, Confidence Summary. Adapt as needed, but keep the confidence separation intact, and keep Sources Consulted as one line per investigator, including the ones that returned nothing or were skipped, with the reason.

After Sources Consulted, if the user's `why` question is a precursor to changing this code, convert the lineage findings into a Preserve / Change / Avoid / Risk constraint set for planning the change.

## Common Failure Modes to Avoid

- **Recency bias**. Assuming the most recent commit is authoritative. The current shape is often the accretion of many earlier decisions. Trace back.
