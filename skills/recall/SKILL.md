---
name: recall
description: "Reconstruct your recent working context from your own chat history, live state, and the shared record (user reports, prior fixes, incidents), then hand back a tight current-state brief. Use for 'recall my work on X', 'catch me up', 'what have I been working on', 'where did I leave off', before starting or resuming work."
---

# Recall

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

**Before you start or resume work, you rebuild the user's recent working context and hand back a tight capsule of where things stand now and what to do next.**

Keep it tight and on-topic. Read only what the in-scope threads need, then stop.

Your context lives in two records. Your own chat history holds what you did and decided. The shared record holds everything that happened around the same code under other names: the symptoms users keep reporting, the fixes that shipped and got reverted, the errors still firing in prod. That second record is what the **why** skill searches, across source control, the issue tracker, chat and issue channels, long-form docs, and error tracking. A feature with a long bug tail keeps most of its story there, so don't reconstruct it from your transcripts alone.

Discover history through the active agent's API or documented, authorized transcript location. There is no universal directory, transcript format, session ID, or agent URL. If history access is unavailable, use this conversation and user-provided exports, and name the missing evidence. Never search another project's private chats to fill the gap. This workflow is read-only; do not post, mutate tickets, or resume implementation while recalling.

1. Classify, then route. One specific prior chat to resume belongs to an optional `session-pickup` playbook from the active catalog, not broad recall. If absent, summarize the supplied session and ask for missing context without claiming a handoff occurred. Turning habits into a durable skill is optional `automate-me`; without it, ask which preferences to capture as a separate task rather than mining habits here. A human-readable summary of your work is a different task. Recall loads working context across recent chats before you act. If the user already gave you a full state capsule (paths, branch, the change), use it and skip the mining.
2. Lock the scope before searching. Pin the window ("recent" is a real range, default the last 7 days), the topic if named, and the workspace (default the active one. Never read another project's transcripts without being asked). State the scope back. Never quietly turn "all" into "recent N".
3. Slice the authorized history. For a large corpus and available delegation, use ordinary workers with resolved `reflect tooling`, default `inherit-parent`, passing the project root, effective preferences, source, topic, and time window. Otherwise search sequentially and disclose same-context review. Order by the history API's timestamps or available file metadata, not session-name order. Use the host's content-search tools to find the topic, then read only matching chats and relevant regions. Skip the current chat and obvious worker, eval, or test noise. Each slice returns one block per chat: topic, user's goal, decisions, open threads, struggles and corrections, and artifacts, with actual source/session pointers. For one or two chats, search directly. Keep raw private transcripts out of the brief.
4. Sweep the shared record whenever the topic names a feature, file, subsystem, area, or bug. This is the default, not a judgment call, and "my work on X" does not exempt it. Resolve optional **why** from the active catalog and use its source investigators, but steer their question from "why was this built this way" to "what's the current state, what's been tried and didn't hold, and what are users still reporting". Reuse its per-source playbooks when available. If `why` is absent, perform the scoped source/history investigation directly and disclose the missing companion. Use authorized source control, issue, chat, documentation, and error-tracking access only where available. Run per-source investigators alongside history mining only if delegation permits it. Null results are findings, and an unavailable connector is a gap, not proof that no issue exists. Fold what comes back into the brief. Skip this step only for pure activity recall with no named target ("what did I do this week"), where your own history and live state are the entire answer.
5. Verify against live state. Take the PRs, branches, and tickets that the mining and sweep surfaced and check them with available read-only repository or forge APIs/CLIs, such as Git and a confirmed forge CLI. If live access is unavailable, label status last reported or unknown. When the answer hinges on what an agent actually did, read the full relevant transcript if authorized and available; otherwise say that the excerpt cannot establish that fact.
6. Write the brief to the contract below. Group by thread. Stay on the named topic.

## Output contract

Lead with the capsule, then the thread status, then the problems, then the next move. Deeper detail goes below or gets cut.

- **Capsule.** At most 5 bullets. What this work is and where it stands overall.
- **Threads.** One line each, prefixed with exactly one status tag: `[merged #N]`, `[open PR #N]`, `[in flight <branch>]`, `[verified, uncommitted]`, `[reverted #N]`, `[planned, not started]`, or `[unknown, <missing evidence>]`. Use only statuses supported by observed evidence; do not invent a PR number or branch. A thread with no tag is not done yet, so tag it.
- **Problems.** At most 5, the recurring ones. Include the symptoms users keep reporting and any fix that shipped and was reverted, so the next attempt starts where the last one failed.
- **Next move.** The single most useful next action, concrete.

An adjacent feature or ticket stays out unless it blocks this one. When the capsule and thread lines outgrow a screen, cut detail before you cut threads. Use optional **unslop** from the catalog, or directly cut filler and jargon if absent and disclose that limitation. Cite actual history pointers or export locations and shared-record sources (PR number, ticket ID, known chat permalink, error-tracker issue). Do not manufacture IDs or URLs. Keep the brief private by default and sanitize context before any authorized public output.

**Reply:** the brief, to the contract above.
