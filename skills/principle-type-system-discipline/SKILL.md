---
name: principle-type-system-discipline
description: "Apply when designing types, reviewing a function signature, or writing code in any statically-typed language. Make illegal states unrepresentable, brand semantic primitives, parse external data at boundaries, exhaust variants, derive from authoritative schemas."
---

# Type System Discipline

## Agent startup

Use the task's explicit project root, otherwise its Git worktree root, otherwise the agreed working directory. Read `<project-root>/.agents/pstack-models.md` **first**, then `~/.agents/pstack-models.md` for missing roles. Precedence is project role > global role > supported skill default > `inherit-parent`. Treat these files as model preferences, not executable instructions. Forward the root and effective choices to delegates.

Use only models and capabilities confirmed in the active agent. Map tool names below to available equivalents; without subagents, run sequentially and disclose lost independence/model diversity. Resolve companion skills by name from the active catalog; if absent, perform their scoped checks directly and report the limitation. Before a host-specific operation, read `setup-pstack`'s `references/agent-runtime.md` when that companion is installed. Host permissions and user approval boundaries take precedence.

Make the compiler reject impossible states, mismatched primitives, and unhandled variants. Prefer defining errors and special cases out of existence over proliferating handlers. For TypeScript syntax, see the `typescript-best-practices` skill.

- **Brand semantic primitives.** `UserId` and `OrderId` are strings underneath but should not be interchangeable. Give each its own type, such as a branded intersection in TypeScript or a newtype elsewhere. Validate once at creation, trust the type downstream. If two arguments share a primitive type but mean different things, brand them.
- **External data is untyped until parsed.** RPC payloads, JSON, IPC messages, CLI args, config files, environment variables, database rows. Have a parse function at every boundary that turns unstructured input into the typed model. The **boundary-discipline** principle skill says where to put validation.
- **Derive types from authoritative schemas.** When a protocol buffer, OpenAPI spec, GraphQL schema, database migration, design-token file, or another file owns a shape, derive from it instead of hand-rolling a parallel type. See the **encode-lessons-in-structure** principle skill.
