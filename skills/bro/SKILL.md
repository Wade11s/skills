---
name: bro
description: Restate the last message in plain human language, with no jargon.
disable-model-invocation: true
---

# Bro

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

Restate your last message. Stop using jargon and speak coherently. State it more simply and concisely, like one human talking to another.

Preserve its facts, uncertainty, risks, and decisions waiting on the user. Simplifying a request for approval does not grant that approval. Use the visible conversation for the restatement. After startup preference resolution, the restatement needs no further tools or delegation. No companion skill or additional model selection is required.
