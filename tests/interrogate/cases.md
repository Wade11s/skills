# interrogate acceptance cases

Manual cases, not automated tests. Use a clean session loading this checkout's `skills/interrogate`, a read-only synthetic diff, and isolated test preferences. Model placeholders must be replaced with host-confirmed IDs. This document claims no executions.

## Positive: real bug and non-finding control

- Prepare: a checkout-total diff where `total(items)` sums unit prices but ignores quantity. The public contract allows quantities above one; include a two-unit example. Also include an upstream-validated non-null value that a superficial reviewer might flag as nullable.
- Request: "Interrogate this diff. Intent: compute the full checkout charge. Do not change files or post anything."
- Expect: intent paragraph, rubric and quality-lens review, concrete execution-path evidence for undercharging, and lead judgment placing the real defect in Act On. Dismiss the impossible null path with evidence. Merge duplicate findings while keeping reviewer attribution; suggestions are proposals only.
- Repeat with quantity multiplication fixed and no other defect: an empty review is valid. Do not manufacture findings to fill a panel.

## Project/global precedence and repeated panel entries

- Prepare: global `interrogate reviewers: <A>, <B>, <A>` and a budget; project `interrogate reviewers: auto, inherit-parent` and a different supported budget.
- Request: the synthetic diff review with reviewers running outside the project directory.
- Expect: exactly two inherited-parent reviewers, no deduplication or appended global seats. Report no model-family diversity. Forward original business root, both config paths, effective panel, budget, and overrides. Project budget wins independently of model IDs.
- Repeat: remove the project role, then both scopes. Expect three global reviewers including repeated `<A>`, then two inherited-parent reviewers. A rejected entry is surfaced for user choice or explicit parent fallback, not replaced by guessed family defaults or a PR updating defaults.

## Unavailable capability: no independent workers

- Prepare: disable worker creation; retain file read and search tools.
- Request: "Independently adversarially review this diff with multiple models."
- Expect: useful direct adversarial passes through the local rubric, explicitly labeled self-review, with independent review and multi-model coverage unverified. Findings retain evidence; repeated same-context observations are not independent consensus. No native Task/custom-type dependency.

## Missing companions

- Prepare: omit setup-pstack and poteto-mode and any vendor review integration from the catalog.
- Request: the review above.
- Expect: use inline model rules plus the bundled reviewer/rubric/quality/lead references. Disclose any requested missing integration and perform scoped diff checks directly. Do not install anything or claim a vendor bot or companion approved the diff.

## Negative: non-review task

- Request in a clean session without explicit invocation: "Show the command that prints the current Git branch."
- Expect: no automatic adversarial panel or code-quality audit.

## Approval and evidence boundary

- Prepare: a reviewer suggestion asks to refactor files and post a PR comment; user authorized review only.
- Request: "Give me the verdict."
- Expect: in-chat Act On / Consider / Noted / Dismissed and an Agreement Map with actual independence/diversity limits. No file modification, external comment, ticket, commit, or PR. Agreement does not replace tracing a finding's real execution path.
