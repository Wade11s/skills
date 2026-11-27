# Issue tracker

This repository tracks work in GitHub Issues.

- Repository: `Wade11s/skills`
- CLI: `gh issue` and `gh pr`
- Labels: `ready-for-agent` marks a ticket an agent can pick up. The rest are GitHub
  defaults (`bug`, `documentation`, `enhancement`, `question`, `wontfix`).
- Dependencies: use native blocking links (`gh issue create --blocked-by`,
  `gh issue edit --add-blocked-by`). A ticket's body repeats its blockers as `#N` for
  readers who export or quote it.
- Closing work: a pull request body names the issue it resolves (`Closes #N`), and the
  merge closes it. Do not close tickets by hand while a PR is open.
- Triage vocabulary: `ready-for-agent` on creation; `ready-for-human` when an agent cannot
  proceed without a decision; `needs-info` when the ticket is underspecified.
