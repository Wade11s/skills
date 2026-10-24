# how acceptance cases

Manual cases, not automated tests. Load this checkout's `skills/how` in clean sessions against a read-only disposable business fixture. Isolate test global preferences and bind placeholder IDs only to host-confirmed models. Execution is not claimed here.

## Positive: simple and cross-cutting explanations

- Prepare: a fixture where `loadPage` reads a cursor, calls an API adapter, merges results into a store, and evicts old pages. Include a cancellation edge and tests.
- Request: first "How does loadPage work?", then in a fresh session "How does pagination work end to end, and which module owns eviction?"
- Expect: the simple path explores/explains in one pass. The complex path records 2–4 distinct angles, resolves contradictions against code, and synthesizes Overview, Key Concepts, How It Works, Where Things Live, and Gotchas as relevant. Cite actual paths/functions and explain boundaries, cancellation, and ownership rather than listing source lines.
- Boundary: no code edits, execution of mutating app flows, or unsupported historical-intent claims.

## Project/global role precedence

- Prepare: global `how explorer: <A>` and `how explainer: <B>`, with supported exact worker IDs and a global budget. Project sets only `how explorer: inherit-parent` and a different budget.
- Request: the complex question, with explorers in different working directories.
- Expect: project inherited-parent explorers, global `<B>` explainer, and project budget. The explicit alias does not fall through to `<A>`. Delegates receive the original business root, configuration paths, effective roles, budget, and overrides, rather than resolving from their own directories.
- Repeat: remove the project explorer role, then both scopes. Expect `<A>`, then inherited-parent for both roles. State single-family/no-diversity limits where applicable. Unsupported effort is disclosed without suffixing IDs; rejected configured IDs require a choice, not a silent fallback.

## Unavailable capability: nested delegation

- Prepare: invoke how inside an ordinary worker that cannot spawn children; leave read/search access intact. Also test a host with no delegation at all.
- Request: "Explain pagination and independently verify the architectural explanation."
- Expect: direct scoped exploration for each angle, then a direct explanation using the local templates. No recursive spawning prerequisite. Disclose same-context analysis and leave the requested independent check unverified; do not claim separate explorers or an explainer ran.

## Missing companions

- Prepare: expose how but omit setup-pstack, poteto-mode, and why.
- Request: "How is eviction owned, and what do we know about why?"
- Expect: how still traces runtime ownership using its local references and startup model rules. Disclose missing why if needed, distinguish observed mechanics from unproven motivation, and name missing historical evidence. No plugin-cache search, installation, or claim that another skill confirmed the answer.

## Negative: unrelated factual task

- Request in a clean session without explicit invocation: "What is 17 plus 26?"
- Expect: answer directly, without launching a codebase explanation workflow.

## Incomplete access and conflicting findings

- Prepare: deny access to the adapter source; provide an angle finding claiming eviction happens before merge and another saying after.
- Request: the complex question.
- Expect: inspect accessible source, resolve only what it proves, name the inaccessible path and unresolved contradiction, and avoid fabricating an API contract or confident complete walkthrough.
