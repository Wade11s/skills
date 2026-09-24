# Wade's Agents Skills

Personal Agents Skills for research and development.

Install with:

```bash
bunx skills add Wade11s/skills
```

## Skills

- `beautiful-mermaid` - Render Mermaid diagrams as beautiful SVG or terminal-friendly ASCII art using the beautiful-mermaid library.
- `architecture-diagram-generator` - Create polished dark-themed architecture diagrams as self-contained HTML+SVG files. (Adapted from [Cocoon AI](https://github.com/Cocoon-AI/architecture-diagram-generator) under MIT License)
- `setup-orca-development-loop` - Configure or refresh an Orca project through one bounded decision/write flow: adopt agent docs, validate one tracker read-only, resolve worktree policy, and normalize user-selected profiles into shared launch pipelines for verification on real use.
- `orca-development-loop` - Route a configured repository's provider-neutral Orca loop: shape requirements through its certified tracker Adapter, then hand approved tickets to a top-level Coordinator that runs Worker, Reviewer, fix, integration, and merge cycles.
- `skills/engineering/diagnosing-bugs` - Diagnose bugs with a reproducible feedback loop.
- `skills/engineering/tdd` - Build at agreed test seams through red-green cycles.
- `skills/engineering/code-review` - Review a fixed diff against standards and spec.
- `skills/engineering/resolving-merge-conflicts` - Resolve merge/rebase conflicts using their original intent.
- `skills/engineering/grill-with-docs` - User-invoked requirement discussion that records settled domain facts.
- `skills/engineering/domain-modeling` - Model-invoked domain vocabulary and ADR guidance.
- `skills/engineering/to-spec` - User-invoked spec drafting and publication through the configured tracker guidance.
- `skills/engineering/to-tickets` - User-invoked breakdown of an approved spec into executable tickets.
- `skills/engineering/codebase-design` - Model-invoked module/interface and test-seam design reference.
- `skills/engineering/research` - Model-invoked source-backed investigation with a written report.
- `skills/productivity/grilling` - Model-invoked interview primitive for requirement decisions.
- `skills/productivity/grill-me` - User-invoked lightweight interview when no domain record is needed.
- `skill-doctor` - Grade installed skills from local Pi (and Claude Code / Codex / Warp) conversation history, then draft skill edits and a local HTML report. (Forked from [Warp skill-doctor](https://github.com/warpdotdev/common-skills/tree/main/.agents/skills/skill-doctor), adapted for Pi agent)

The engineering and productivity skills are adapted from [Matt Pocock's skills](https://github.com/mattpocock/skills) under MIT; each installable skill includes its own license notice. `setup-orca-development-loop` installs the role skills and their dependencies in the target project. Alignment's user-only slash skills retain their original invocation mode; Worker and Reviewer load their assigned model-invocable skills autonomously.

## Deprecated

- `deprecated/setup-multica-issue-tracker` - Configure `docs/agents/issue-tracker.md` so Matt Pocock engineering skills use Multica while the upstream skills stay updateable.
