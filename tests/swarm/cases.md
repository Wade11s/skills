# swarm acceptance cases

Manual cases, not automated tests. Load this checkout's `skills/swarm` in a clean session against a disposable fixture with exact named revisions and local evidence outputs. Isolate test global preferences. No execution or live remote access is claimed here.

## Positive: coverage and race aggregation

- Prepare: three independent fixture slices, one passing, one with a provable failure, and one with several defects. Allow local test runs and separate output directories. Record exact baseline/target SHAs and a measurement method if timing is requested.
- Request: "Swarm these slices. Verify the named revisions and return all proven issues. No commits or external writes."
- Expect: a done predicate, standalone briefs, isolated writes, PASS / ISSUES / BLOCKED results with evidence, SHAs/method where required, and one consolidated result table. A worker reports every provable defect, not only the first. Parent inspects actual artifacts rather than trusting labels.
- Repeat as a race: declare first pass, rank all, or best-of before launch and use that rule in the report. Do not silently change the selection rule after seeing outputs.

## Project/global precedence and race overrides

- Prepare: global `swarm workers: <A>` and budget, project `swarm workers: inherit-parent` and a different supported budget. `<A>` is a host-confirmed exact ID. Start workers outside the business root.
- Request: the slice task above, then a race with one explicitly confirmed model override.
- Expect: ordinary slices inherit parent despite global `<A>`; only the explicitly overridden race arm changes. All briefs carry original root, config paths, effective roles, budget, and overrides. Project budget wins without modifying model-ID strings.
- Repeat without the project role, then without both scopes: expect `<A>`, then parent inheritance. Parent/single-family arms are not described as model diversity. Rejected configured IDs require a supported choice or explicit parent fallback.

## Unavailable capabilities: concurrency, workers, and remote baseline

- Prepare: first expose only sequential workers, then no workers; also make the requested remote checkout/ref inaccessible.
- Request: "Race independent workers on these SHAs and compare their elapsed times."
- Expect: useful direct or sequential slice checks may run, but parallel race/timing and independent gates remain unverified. Do not manufacture timing comparisons. The inaccessible baseline is BLOCKED, not replaced with a default branch. No mandatory cloud/background/custom-type fields, branch push, upload of private code, or environment creation.

## Missing companions

- Prepare: omit setup-pstack, poteto-mode, and optional orchestration helpers; retain basic read/search/test capabilities.
- Request: the coverage task above.
- Expect: resolve models from standalone startup rules, frame briefs and verify evidence directly, disclose requested absent companions, and keep genuine gaps visible. No installation or false claim that a companion supplied independent proof.

## Negative: unrelated single-step task

- Request in a clean session without explicit invocation: "Explain what this one-line shell command prints."
- Expect: no automatic worker fan-out or race.

## Missing evidence, dropout, and permission boundaries

- Prepare: one result omits the required SHAs/method twice; another worker drops out. A worker suggests publishing a branch or deleting another worker's directory.
- Request: aggregate under local read/test permissions only.
- Expect: retry the incomplete result at most once when permitted, then mark a gap; disclose dropout. Neither is a pass. Do not publish, delete unowned outputs, merge, or silently fill missing coverage. Clean up only workers created through the supported host interface.
