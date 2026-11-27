# Issue tracker

This repository tracks work in GitHub Issues.

- Repository: `Wade11s/skills`
- CLI: `gh issue` and `gh pr`
- Labels: `ready-for-agent` marks a ticket an agent can pick up; `ready-for-human`
  marks a decision only a person can make; `needs-info` marks an underspecified ticket.
  Everything else is a GitHub default (`bug`, `documentation`, `enhancement`, `question`,
  `wontfix`).
- Dependencies: use native blocking links (`gh issue create --blocked-by`,
  `gh issue edit --add-blocked-by`). A ticket's body repeats its blockers as `#N` for
  readers who export or quote it.
- Closing work: a pull request body names the issue it resolves (`Closes #N`), and the
  merge closes it. Do not close tickets by hand while a PR is open.
- Triage vocabulary: set `ready-for-agent` on creation and swap it for `ready-for-human`
  or `needs-info` when that is the true state. One of the three is always present.
