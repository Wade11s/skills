# Alignment Task Template

## Objective

Shape the user's feature, feedback, or bug into a verified manifest in the configured primary work tracker. Do not implement product code.

## Confirmed profile

- Harness: `<harness>`
- Model: `<exact model identifier>`
- Reasoning: `<thinking or effort level>`
- User confirmation: `<timestamp or Main message reference>`
- Certified launch recipe: `<structured recipe from the current host profile>`
- Runtime verification: `<launch receipt or harness-native probe>`
- Tracker write eligibility: `<Adapter revision, certification, and complete writeRiskAcceptance snapshot or null>`

Your first action is the runtime probe named by the certified recipe. For a Pi recipe, run through the Pi `bash` tool:

```bash
printf 'ALIGNMENT_PROFILE=%s/%s:%s\n' "$PI_PROVIDER" "$PI_MODEL" "$PI_REASONING_LEVEL"
```

Compare the result with the confirmed profile. On mismatch, send an escalation, perform no requirement work, and idle.

## Initial request

<Inline the complete bounded feedback body here. Include every reported behaviour, proposed direction, uncertainty, and named constraint needed for the Alignment Agent's first-response summary. A fresh Alignment session cannot dereference Main's conversation history. A directly readable durable artifact may be referenced for detail, but this section still includes a self-contained summary sufficient to begin alignment without asking the user to repeat context.>

## User interaction

The user will switch to this terminal and converse directly. The Initial Request above is the handoff; never send the user back to Main or ask them to repeat it.

After a matching runtime probe and before broad repository/tracker exploration, make the first visible response include the exact `ALIGNMENT_PROFILE` attestation, acknowledge and summarize the received feedback, recommend exactly one narrow user-invoked skill, show the exact slash command, and tell the user to run it here without returning to Main. Then wait for the user to run it:

- `/grill-with-docs` for ambiguous product decisions, so settled decisions land in ADRs and the glossary that Workers and Reviewers later read; `/grill-me` when nothing is worth recording;
- `/diagnosing-bugs` for unclear bug behaviour;
- `/to-spec` when a durable spec is warranted;
- `/to-tickets` after approval, or directly for one bounded issue-ready bug.

Do not invoke user-only slash skills on the user's behalf.

## Project context

After alignment begins, read `docs/agents/orca-development-loop.md` and project domain/ADR context as needed; absent `CONTEXT.md` or ADR files are normal. Before the first tracker operation, require Alignment readiness, read `docs/agents/issue-tracker.md`, load the exact guide/transport it names, and use only its configured Adapter operations. Read `docs/agents/triage-labels.md` before classification and translate canonical roles only at that seam. Apply the [write eligibility gate](../references/tracker-adapter.md#write-eligibility-gate) to the snapshot above before any write.

## Completion

Classify every executable ticket with the representation and vocabulary in `docs/agents/agent-profiles.md`, so delivery can route each ticket to a suitable profile.

Read the resulting tracker state back. Apply the [blocker evidence contract](../references/tracker-adapter.md#blocker-evidence-contract) before computing the frontier. Send the completion shape from the Alignment Agent reference through exactly one injected `worker_done`, then idle for Main to release the terminal. This Alignment session is single-use.
