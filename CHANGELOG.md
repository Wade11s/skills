# Changelog

## 2026-06-05

- [Update]: `AGENTS.md` + rewrite contributor guide following `codex-init` skill template (tighter structure, conciser wording, consistent examples).
- [Fix]: remove nested `.git` directory from `skills/architecture-diagram-generator/` so files are tracked by the parent repo.
- [Add]: `.gitignore` + ignore nested git repos, OS/editor temp files, and Node artifacts.

## 2026-06-04

- [Add]: `skills/beautiful-mermaid/` + Render Mermaid diagrams as beautiful SVG or terminal-friendly ASCII art.
- [Add]: `skills/architecture-diagram-generator/` + Create polished dark-themed architecture diagrams as self-contained HTML+SVG files.
- [Update]: `README.md` + add `beautiful-mermaid` and `architecture-diagram-generator` to skills list.

## 2026-06-01

- [Update]: documentation + standardize project naming to Agents Skills.
- [Add]: `AGENTS.md` + contributor guide for repository structure, validation, and contribution conventions.
- [Add]: `skills/setup-multica-issue-tracker/` + Agents Skill for configuring Multica as the issue tracker.
- [Add]: `skills/setup-multica-issue-tracker/issue-tracker-multica.md` + Multica CLI workflow for issue creation, reading, comments, status, and `triage_role` metadata.
- [Update]: `skills/setup-multica-issue-tracker/SKILL.md` + aligned style and scope for the Multica issue tracker skill.
- [Add]: `README.md` + repository overview and `bunx skills add Wade11s/skills` installation command.
- [Add]: `LICENSE` + MIT license.
