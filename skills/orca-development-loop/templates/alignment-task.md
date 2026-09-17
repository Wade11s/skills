# Alignment Task Template

## Objective

Shape the user's feature, feedback, or bug into a verified manifest in the configured primary work tracker. Do not implement product code.

## Confirmed profile

- Harness: `<harness>`
- Model: `<exact model identifier>`
- Reasoning: `<thinking or effort level>`
- User confirmation: `<timestamp or Main message reference>`
- Certified launch recipe: `<structured recipe including recipeFingerprint from the current host profile>`
- Effective-profile evidence: render `receipt`, `attestation`, or
  `user-attested`
- Runtime verification: render the receipt values, attestation command, or
  exact user-confirmed argv plus limitation
- Tracker write eligibility: `<Adapter revision, scope, certification.writes, and phase-local confirmation reference or null>`

Render exactly one evidence instruction:

- `receipt`: Main already compared the composed start receipt's
  `launch.requested` and `launch.effective`; the verified values are inlined
  above. Run no profile probe.
- `attestation`: first run only the recorded read-only command inlined above.
  Compare its values with the confirmed profile. On mismatch, send an
  escalation, perform no requirement work, and idle.
- `user-attested`: run no profile probe. State that the exact argv above was
  user-confirmed and provider/model cannot be independently observed.

## Initial request

<Inline the complete bounded feedback body here. Include every reported behaviour, proposed direction, uncertainty, and named constraint needed for the Alignment Agent's first-response summary. A fresh Alignment session cannot dereference Main's conversation history. A directly readable durable artifact may be referenced for detail, but this section still includes a self-contained summary sufficient to begin alignment without asking the user to repeat context.>

## User interaction

The user will switch to this terminal and converse directly. The Initial Request above is the handoff; never send the user back to Main or ask them to repeat it.

After applying the selected evidence instruction and before broad
repository/tracker exploration, make the first visible response include the
evidence mode and exact profile values, acknowledge and summarize the received
feedback, recommend exactly one narrow user-invoked skill, show the exact slash
command, and tell the user to run it here without returning to Main. Then wait
for the user to run it:

- `/grill-with-docs` for ambiguous product decisions, so settled decisions land in ADRs and the glossary that Workers and Reviewers later read; `/grill-me` when nothing is worth recording;
- `/diagnosing-bugs` for unclear bug behaviour;
- `/to-spec` when a durable spec is warranted;
- `/to-tickets` after approval, or directly for one bounded issue-ready bug.

Do not invoke user-only slash skills on the user's behalf.

## Project context

After alignment begins, read `docs/agents/orca-development-loop.md` and project domain/ADR context as needed; absent `CONTEXT.md` or ADR files are normal. Before the first tracker operation, require Alignment readiness, read `docs/agents/issue-tracker.md`, load the exact guide/transport it names, and use only its configured Adapter operations. Read `docs/agents/triage-labels.md` before classification and translate canonical roles only at that seam. Apply the [write eligibility gate](../references/tracker-adapter.md#write-eligibility-gate) to the snapshot above before any write.

## Completion

Classify every executable ticket with the representation and vocabulary in `docs/agents/agent-profiles.md`, so delivery can route each ticket to a suitable profile.

Read the resulting tracker state back and apply the
[blocker evidence contract](../references/tracker-adapter.md#blocker-evidence-contract).
Send one `worker_done` through the injected lifecycle command with the Alignment
Agent completion payload, then idle for Main to release this single-use session.
