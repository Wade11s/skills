---
name: show-me-your-work
description: "Keep a reviewable decision trail for long-running or unattended work: a TSV log with one row per decision (what, why, evidence, result). Local by default; propose committing it when a reviewer needs the trail and publication is authorized. Use for /show-me-your-work, autonomous or multi-phase runs, or work a human reviews after stepping away."
---

# Show me your work

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

Keep one canonical log.

## The format

A single TSV file, one row per decision. Cells stay single-line. Evidence is a pointer, not prose.

Copy `references/decision-log-template.tsv` (the header row) to start a clean log. Columns:

- **ts.** ISO8601 timestamp.
- **phase.** The phase or workstream.
- **decision.** What was chosen or done, one line.
- **why.** The reason in plain words. If a principle drove it, say it plainly, not as a jargon tag.
- **evidence.** A link or path that proves it: commit SHA, PR number, `file:line`, or an artifact, trace, or screenshot path. Never a paragraph.
- **result.** The outcome or predicate state: `tests green`, `reverted`, `pixel-diff 0`, `INCONCLUSIVE`, `open`.

An example, plain-spoken so a reviewer reads it at a glance.

```
ts	phase	decision	why	evidence	result
2026-05-24T09:02:00Z	frame	counted the work first, about 100 components and roughly 75 hours	wanted to know the size before starting a long run	commit 3a9f1c2	found 5 things to sort out before starting
2026-05-24T09:40:00Z	harness	took screenshots of the old version before changing anything	so we can compare old against new and catch any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T11:15:00Z	widget	moved the widget styles over without changing how it looks	keep the change small and the result identical	commit 7c21e0a, pixel-diff 0	looks identical, tests pass
2026-05-24T12:30:00Z	widget	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the instructions for next time
```

## Logging a row

Write each entry the way you'd tell a teammate what you did. Use optional **unslop** from the active catalog for log prose. If absent, directly remove filler, abstract jargon, and unsupported claims, and disclose the missing companion.

Use the helper `bash <skill-dir>/scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>`, resolving `<skill-dir>` to this skill's directory. Explicit Bash invocation works even when an installer does not preserve executable bits. It stamps `ts`, writes the header on first use, strips stray tabs/newlines, and prefixes any cell starting with `=`, `+`, `-`, or `@` with a single quote. A bare `printf` appending a row works too, but mind those same bytes if cells come from generated or user-supplied text.

Log decision points and checkpoints, not every action: a fork chosen, a unit completed with its verification result, a pivot or revert with its trigger, a blocker surfaced, a gate fixed. For loop runs, one row per iteration. Skip the trivial and self-evident.

A run is one agent conversation, including its later turns and any summary of it. A pickup, a replacement agent, or a new chat starts a new run. When a run adds to a log that already has rows, its first row has phase `start`, and so does its first row after another run's `start` row. So a run that comes back to a log in a later turn first reads the log's last rows to see whether another run wrote since. A `start` row names the `ts` range of the rows before it that this run did not write, and its evidence names this run, such as its agent id. Use phase `start` for nothing else.

## Where it lives

By default the log is a working artifact, not committed. Keep it at `decisions.tsv` in the work dir, or `.audit/<task-slug>.tsv` when several efforts run at once, and leave it out of git.

Propose committing it only when a reviewer needs the trail to trust the result and it contains no private transcripts or secrets. Commit or publish only with applicable authorization. Preserve repository artifact-location rules over these defaults.

## Rules

- Append-only. A wrong call gets a new row that supersedes it. Never edit or delete history.
- Prefer evidence produced by reproducible repository scripts over hand-made one-offs. Optional **principle-encode-lessons-in-structure** can guide this choice; without it, record the exact command and resolvable artifact directly and disclose the missing guidance.

## Audit the log against the transcript

At the end of the run, before handing back, check the log told the truth. Discover this run's history through the active agent's API or documented, authorized transcript location, scoped to the original user and project. If unavailable, use the visible conversation, actual tool results, and any user-provided export. State which stretches are unavailable and leave transcript coverage unverified; do not claim a complete audit or search unrelated private chats. Walk this run's rows against what actually happened. Each stretch of them begins at one of this run's `start` rows, or at the first row if this run created the log, and ends at the next `start` row of another run:

- Check that every row maps to a real decision or action.
- Check that each row's evidence resolves and shows what the row claims.
- A fork, pivot, or abandoned approach that shaped the work but isn't logged is a gap. Add it.

Correct the log, not the story. The audit never edits or removes a row, even an invented one. When a row records neither a real decision nor a real action, or its claim or evidence is wrong, add a row that supersedes it with what actually happened and a pointer that resolves. This audit does not check rows outside this run's stretches. If this run's own work shows one of them is wrong, supersede it like any wrong call.

## Cross-model review of the trail

Before handing back, request an ordinary read-only worker to review the trail and authorized transcript evidence. Use resolved `judgment and prose`, default `inherit-parent`, forwarding the original root, effective preferences, budget, and evidence gaps. Use only confirmed host-supported worker models. For a cross-family review, offer a supported different-family model and get authorization if it changes the configured choice; never silently replace a project or global role.

The portable parent-model review provides no model diversity. If a different family is unavailable, say that the cross-model gate is unverified. If delegation is unavailable, perform a sequential self-review for useful flags, but leave both independent and cross-model review unverified. Partial transcript access also limits the review. Self-review is not independent proof.

The reviewer flags what the user should pay attention to, not a redo of the work but a scan for what's suboptimal or risky:

- Decisions logged with weak or absent evidence.
- Verification steps skipped or claimed without proof in the transcript.
- Choices that look risky in hindsight (premature, scope-creeping, papering over a symptom).
- Gaps the user would otherwise miss on a casual skim.

Every reply for a run that produced a trail ends with an "Attention" section. For a completed worker review, lead with `reviewed by <confirmed model or inherit-parent>` and identify whether it was same-family or cross-family; do not invent an exact model ID. Without a worker, lead with `self-review only; independent and cross-model review unverified`. Name missing transcript coverage or other unmet gates, then list flags pointing to specific rows or moments. "No flags in the reviewed evidence" is valid, but never implies an unavailable gate passed.

## Reviewing the trail

Read top to bottom, follow the evidence pointers, spot-check. GitHub renders a committed TSV as a table. `column -s$'\t' -t decisions.tsv` renders it in a terminal.

## Composing this skill

Other skills route their audit trail here instead of inventing one. Reference it by name and let it own the format. Don't restate the columns.
