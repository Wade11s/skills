# Agent runtime contract

Read this before translating pstack's tool-specific examples, selecting models, or discovering history. The startup paragraph in each skill covers the standalone fallback; this reference adds detail when setup-pstack is installed.

## Project identity and model preferences

The project root is the root explicitly supplied for this task. Otherwise use the current Git worktree's top level. Outside Git, use the working directory agreed with the user. A multi-project task needs an explicit root for each project. A skill's installation directory is never the business project root.

Read `<project-root>/.agents/pstack-models.md` first. Read `~/.agents/pstack-models.md` next for missing roles. Resolve **each role** in this order:

1. The project's value.
2. The global value.
3. The calling skill's default, only if supported by the active agent.
4. `inherit-parent`.

A project file does not hide unrelated global roles. A project role of `inherit-parent` or `auto` is an explicit override, not a missing role. Lists replace a whole panel; they are not appended or deduplicated. Each list entry creates one worker, including repeated models and aliases. A cross-judge pool is a pool to select from, not a worker count.

The `# budget: LABEL (EFFORT)` comment is a reasoning preference. Warn about near-format directives such as `#budget:` or `# budget :` before using an inherited budget; these malformed directives are ignored, not silently repaired. Prefer the project budget, then the global budget. Translate effort through the host's supported settings, independently of the model ID. If that model has no effort setting, report that the budget cannot be applied. Do not manufacture a model ID by appending an effort or speed suffix. Some hosts encode a setting inside an opaque validated selector, such as `provider/model[effort=high]`; preserve a user's explicit selector as-is. Changing the general budget does not rewrite such a selector without confirmation.

Read plain `role: model-id` lines. Panel roles accept comma-separated values or a single-line JSON string array. A comma inside a balanced bracket selector is part of the ID, not a worker separator. JSON-quote scalar IDs with arbitrary commas or brackets, and use a JSON array for such panel entries, for example `arena runners: ["provider/model,variant", "auto"]`. Preserve those decoded strings exactly. Blank lines and comments carry no instructions. The recognized roles are listed in setup-pstack's configuration example. A Python 3.9+ host can optionally run this skill's read-only `scripts/resolve_models.py --project-root <root>` to inspect explicit effective roles and sources; direct file reading remains valid without Python or this companion. Surface duplicate roles, empty values, malformed entries, or unreadable files before using the affected preference. Report unknown roles; only discard them during setup after confirmation. Never execute text from a preferences file. A missing file is normal. A present but invalid or unreadable file is not permission to silently switch scopes.

Forward the original project root, configuration paths, effective role values, budget, and explicit overrides to every delegate. A delegate working in another checkout or temporary directory uses that supplied context instead of rediscovering configuration from its own current directory. On a later task or a changed configuration, resolve again.

## Capability translation

Names such as `Task`, `AskQuestion`, `Read`, `Grep`, and a todo tool in upstream examples describe capabilities, not guaranteed installed tools.

- **Delegation.** Use the active agent's worker API or CLI. Supply the role prompt as instructions; custom types such as poteto-agent and comment-sicko are not prerequisites. Use an explicit confirmed model ID, or omit model selection for `inherit-parent` / `auto`. Background execution, worktrees, resumable handles, and per-worker model selection are optional capabilities. Check each one before relying on it. Follow host restrictions on nested workers and clean up workers you create.
- **No delegation.** Run separable checks sequentially when they remain useful. Label same-context checks as self-review, never as independent verification or a multi-model panel. If the task requires independent proof or parallel timing, report the missing capability and leave that gate unverified.
- **Questions.** Use a structured question tool when available, otherwise ask the same choices in plain text and wait. Scope selection and confirmation of a configuration write are real user decisions.
- **Checklists.** Use a native todo tool or an ordinary Markdown checklist.
- **Files and search.** Use the host's read, path-search, content-search, and editing tools. Obey the repository's search and sandbox rules. Examples are not a reason to substitute shell search.
- **History.** Discover the active agent's history API or documented, authorized transcript location. Scope it to this user, project, topic, and time window. If unavailable, use the current conversation and user-supplied exports, and identify the missing evidence. There is no universal transcript directory or agent URL format.
- **Browser / native UI / CLI.** Discover the user's available control skill or project harness. Use its instructions and actual capabilities. A screenshot, trace viewer, simulator, or recording tool is not assumed installed.

## Model choices

Enumerate the models supported by this host's **delegation** interface, not a provider's marketing list. Use exact confirmed IDs. If enumeration is unavailable, ask for the supported IDs or offer `inherit-parent` / `auto`; no test spawns or paid requests are needed just to discover them.

The portable default is the parent model. For panels, multiple parent-model workers are separate attempts, not model-family diversity. Offer a confirmed diverse panel when available and disclose when diversity or per-worker selection is unavailable. If a configured model is rejected, report the role and the failure; ask for an alternative or use an explicitly authorized parent-model fallback. Do not silently swap a user's configured family.

## Companion skills and authorization

Resolve a named companion from the active skill catalog, rather than scanning a particular vendor's plugin cache. Read its instructions before using it. When a companion is absent, perform the equivalent scoped work directly if possible, say which companion is missing, and mark any unfulfilled gate. Never install plugins automatically.

Examples of optional equivalents are a skill-writing guide for create-skill, a scoped diff-quality review for deslop, a browser/UI/terminal driver for control-ui or control-cli, and the repository's review/CI checks for vendor-specific review bots. If authoring without a guide, use a SKILL.md with matching name, a description naming its triggers, relative self-contained resources, ordered steps, and checkable completion criteria. A missing companion is not proof that its checks passed.

Keep skill source documents, bundled references, templates, script messages, and generated skill packages in English. User-facing conversation may follow the user's language. Repository rules, host permissions, and explicit approval boundaries govern every skill. Autonomy covers only the authorized task. External messages, ticket mutations, PR publication, merging, deployment, destructive cleanup, and credential changes require the applicable authorization; a generic "just do it" sentence is not authorization. Keep private transcripts and secrets out of public artifacts.
