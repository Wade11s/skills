# Changelog

## 2026-09-15

- [Add]: `skills/setup-orca-development-loop/` + one explicit onboarding flow that replaces `setup-matt-pocock-skills` for Orca-loop repositories, selects and certifies an Orca-recognized primary tracker, resolves Matt-compatible project docs and validation, collects user-selected role profiles, and proves their launch recipes in disposable Orca probes.
- [Add]: capability-based Tracker Adapter and setup manifest contracts, separating the primary work tracker from the PR/MR surface and recording Alignment, Execution, and dependency-evidence mode independently.
- [Update]: `skills/orca-development-loop/` + consume setup-certified configuration, support any qualifying Orca tracker integration, and remove normal-path Linear commands and full model discovery.
- [Update]: agent profile configuration + store project routing policy and per-host user profiles in schema v2, while keeping current headroom and wave-specific confirmation in the immutable Wave Manifest.
- [Fix]: Wave Manifest v3 + freeze every referenced role profile in one self-contained dictionary, including independent Integration Worker/Reviewer definitions, exact launch recipes, concurrency, certification, and current headroom.
- [Fix]: delivery blocker contract + require a complete blocker set including wave-external dependencies for every ticket; user-provided order controls scheduling but no longer substitutes for blocker evidence.
- [Fix]: tracker write readiness + require explicit revision-, scope-, phase- and operation-bound risk acceptance for unexercised writes; freeze acceptance at handoff and block stale or missing consent.
- [Update]: centralize dependency fallback and launchability in the Tracker Adapter contract instead of repeating policy in setup and runtime callers.
- [Update]: skill evals and trigger cases + cover setup migration, integration capability modes, native/custom launch certification, provider-neutral delivery, and configuration drift.

## 2026-09-09

- [Add]: `skills/orca-development-loop/` + Route a repository's two-phase Orca loop: Alignment Agent to Linear tickets, then a top-level Coordinator for Worker, Reviewer, fix, integration, and merge cycles.
- [Add]: `skills/orca-development-loop/references/failure-and-recovery.md` + stall ladder, per-ticket terminal states (`integrated` / `blocked` / `abandoned`), user abort, and wave resume.
- [Add]: `skills/orca-development-loop/templates/issue-tracker-linear.md` + seed for `docs/agents/issue-tracker.md` describing Linear through `orca linear`, filling the "other tracker" branch of `/setup-matt-pocock-skills`.
- [Fix]: map the skill's lifecycle signals (`coordinator_ready`, `profile_mismatch`, `wave_done`) onto Orca's real `--type` enum with subject-based routing, so the Main-to-Coordinator channel is sendable.
- [Fix]: replace the unowned `docs/agents/coordinator.md` and `docs/agents/environment.md` dependencies with `AGENTS.md` plus a Wave Manifest `validation` block resolved document-first, then from repository scripts, then from the user.
- [Fix]: speak canonical triage roles instead of hard-coded label strings, which `docs/agents/triage-labels.md` may rename per repo.
- [Add]: cross-family review - the Worker and Reviewer must come from different model families, enforced through `profiles.*.family` plus `policies.reviewerIndependence`, with a same-family pair only as a recorded user exception.
- [Add]: role-demand table and a headroom check at the profile gate, so an exhausted provider is skipped before launch instead of failing mid-wave.
- [Add]: tool-independent profile discovery - each fact the gate needs (launchable agents, auth, model capability, reasoning flag, headroom, family) has a source ladder from Orca-native commands through optional harness and usage CLIs to the user, so a host without `pi` or `codexbar` degrades the gate instead of blocking it.
- [Add]: `skills/orca-development-loop/templates/agent-profiles.md` + seed for `docs/agents/agent-profiles.md`, a committed per-project record of confirmed role pools, the ticket complexity vocabulary, and assignment defaults, with host keying and staleness rules so a gate revalidates instead of re-exploring.
- [Add]: three ticket complexity tiers (`simple`, `standard`, `complex`) on one axis - what this ticket's own decision costs - where `simple` against `standard` asks whether a structural choice is left open and `standard` against `complex` asks whether it propagates beyond the component; spec-level grilling explicitly does not lift a child ticket's tier, an all-top-tier slice set is reported as a signal about the alignment, a `complex` ticket forces full-suite reruns on its fix passes, and the tier keys map to whatever label strings the team created. The Alignment Agent labels each executable ticket, the Coordinator routes to pool entries whose `tiers` match, and an optional per-ticket `pin` overrides the balancer.
- [Fix]: an auth probe is evidence, not a verdict - a candidate whose probe reports not ready is smoke-tested with one real non-interactive call, and a provider error is quoted to the user for a decision instead of silently dropping a provider that works in practice; the user's vouch is recorded per entry so the question is asked once per provider.
- [Add]: `workerPool` / `reviewerPool` of confirmed tuples with per-ticket assignment - cross-family pair first, then headroom and round-robin balancing under `maxConcurrent`, pinned per ticket for retained-context reuse, in-pool failover without re-confirmation, and clean-room passes preferring an unused entry.
- [Fix]: state that Orca injects the lifecycle preamble and this skill authors only the `task-create --spec` body, with `dispatch --dry-run --return-preamble` as the way to see the real envelope.
- [Fix]: recommend `/grill-with-docs` as the alignment default rather than the `grilling` engine, so settled decisions become the ADRs and glossary entries that `docs/agents/domain.md` later sends Workers and Reviewers to read; `/grill-me` stays the no-docs entry point.
- [Update]: `README.md` + add `orca-development-loop` to the skills list.

## 2026-09-01

- [Add]: `skills/skill-doctor/` + Grade installed skills from local conversation history. Forked from Warp's skill-doctor in [common-skills](https://github.com/warpdotdev/common-skills) and adapted for Pi agent.
- [Move]: `skills/setup-multica-issue-tracker/` -> `deprecated/setup-multica-issue-tracker/` + retire the Multica issue tracker skill from the active skills list.

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
