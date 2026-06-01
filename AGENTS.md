# Repository Guidelines

## Project Structure & Module Organization

This repository stores personal Agents Skills. Keep each skill in its own directory under `skills/`, using the skill name as the directory name, for example `skills/setup-multica-issue-tracker/`.

Each skill should include a `SKILL.md` file with YAML front matter and concise operational instructions. Supporting templates or references should live beside the skill that uses them, as with `skills/setup-multica-issue-tracker/issue-tracker-multica.md`. The root `README.md` lists install instructions and a short index of available skills.

## Build, Test, and Development Commands

There is no build step for this repository. Validate changes by reading the Markdown and checking that paths and examples match the repository layout.

- `rg --files`: list tracked project files quickly.
- `sed -n '1,220p' skills/<skill>/SKILL.md`: review a skill file without opening an editor.
- `bunx skills add Wade11s/skills`: install these skills from the published repository, as documented in `README.md`.

## Coding Style & Naming Conventions

Write Markdown in short, direct sections with actionable bullets. Use fenced code blocks for commands and backticks for file paths, command names, and metadata keys. Prefer ASCII punctuation unless a source file already uses non-ASCII text.

Skill directories use kebab-case, such as `setup-multica-issue-tracker`. Skill front matter must include `name` and `description`, and the `name` should match the directory name.

## Testing Guidelines

No automated test framework is currently configured. Before committing, manually verify that:

- `SKILL.md` front matter is valid YAML.
- Referenced files exist relative to the skill directory.
- Command examples are copy-pasteable and do not rely on unstated context.
- The root `README.md` skill list stays in sync when adding or removing skills.

## Commit & Pull Request Guidelines

Recent commits use short imperative or descriptive subjects, for example `Add Multica issue tracker skill` and `Align Multica issue tracker skill style`. Keep commit messages concise and focused on one change.

Pull requests should describe the affected skill, summarize behavior changes, and call out any new files, command examples, or assumptions. Include screenshots only if a change introduces visual documentation.

## Agent-Specific Instructions

When editing skills, keep instructions narrowly scoped to the skill purpose. Do not update unrelated skill files or repository metadata unless the requested change requires it.
