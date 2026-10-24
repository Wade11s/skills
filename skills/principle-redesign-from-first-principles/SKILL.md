---
name: principle-redesign-from-first-principles
description: "Apply when integrating a new requirement into an existing design."
---

# Redesign From First Principles

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

When integrating a change, don't bolt it onto the existing design. Redesign as if the requirement had been a foundational assumption from the start.

- Read all affected files and understand the current design
- Ask: "if we were writing this from scratch with this new requirement, what would we build?"
- Propagate the change through every reference: types, docs, examples, rationale sections
- Think about the whole redesign, then deliver it incrementally

This is the method for preserving option value when integrating changes into an existing design.
