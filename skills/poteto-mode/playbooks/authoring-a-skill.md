### Authoring or modifying a skill

**You own the skill's voice.**

1. Resolve an optional skill-writing guide from the active catalog, such as **writing-for-agents** or **create-skill**, and read it. If absent, write a SKILL.md whose name matches its directory, whose description names its triggers, and whose workflow has ordered steps and checkable completion criteria. Disclose the missing guide. Write the generated or edited SKILL.md and every bundled resource in English, including examples, comments, templates, prompts, errors, and guides. User-facing session replies still follow the user's language.
2. Validate frontmatter and relative self-contained resources. Resolve companion skills by catalog; document scoped fallbacks when absent rather than treating sibling links as mandatory installations.
3. Add representative positive, negative, and missing-capability cases for behavior changes. Script changes need executable regression tests. Subjective style changes still need an example that shows the decision they change.
4. Run **Opening a PR** only when publication is authorized; otherwise return the local diff and checks.

When in doubt, delete. Keep only prose that changes a decision. Tell it to do the thing and skip the reason. Explain only when the rule is confusing without one. Match tone to scope. Point at structural sources (types, READMEs, config) per the **encode-lessons-in-structure** principle skill. Resolve companion skills from the active catalog before following their paths. Don't restate. A workflow you keep hitting but isn't captured → propose a new skill.

**Reply:** summary of the skill, key design decisions, validation notes.
