---
name: land
description: >-
  Land the current Wade11s/skills repository changes on origin/main after the
  user explicitly requests landing, merging, or chooses Land Changes. Invoke
  only for an explicit landing request, never merely for review, preparation,
  verification, or skill installation.
metadata:
  delta-action: land
---

# Land Changes

Land the intended changes directly on `origin/main`, then verify the exact
remote commit. Loading this skill means the user already requested landing. Do
not ask for merge permission again.

The repository currently uses linear commits on `main`, has no build or CI
workflow, and permits direct pushes. Treat those as runtime-observed facts, not
permanent policy: recheck destination settings before every landing.

## 1. Establish the intended change

1. Confirm the repository root is the checkout containing this skill and
   `AGENTS.md`.
2. Read `git status --short`, the complete unstaged/staged diff, untracked file
   names, and `git log origin/main..HEAD`.
3. Match files and local commits to the change requested in the current thread.
   Include intended additions, deletions, and renames.
4. Preserve unrelated work. Stop with one focused scope question when intent is
   ambiguous; never discard, reset, stash, or include unrelated files merely to
   make the tree clean.
5. Stage intended paths explicitly. Do not use `git add -A` or `git add .`.

Inventory the target skill's files and read its complete `SKILL.md` as required
by [AGENTS.md](../../../AGENTS.md#1-establish-the-current-contract).

## 2. Verify the exact candidate

This repository has no repository-wide build. Apply the proportional validation
contract from
[AGENTS.md](../../../AGENTS.md#5-validate-proportionally) to the staged
candidate:

- run `git diff --check` before staging and `git diff --cached --check` after
  staging;
- read every changed Markdown file for concise, actionable instructions;
- for every added or changed `SKILL.md`, parse its YAML frontmatter, require
  `name` and `description`, and require `name` to match its directory;
- verify every changed relative reference exists from the file that names it;
- verify command examples are copy-pasteable and state all required context;
- parse changed JSON/YAML files with an available non-interactive parser;
- when a skill is added, removed, or renamed, keep the root `README.md` index in
  sync.

The repository-specific requirements above come from
[AGENTS.md](../../../AGENTS.md#repository-map) and
[AGENTS.md](../../../AGENTS.md#3-edit-the-skill). Do not run
`bunx skills add Wade11s/skills` as validation; `README.md` documents it as the
consumer installation command, not a test.

Review `git diff --cached --stat` and `git diff --cached` after validation.
Require the staged diff to contain the intended change and no credential,
terminal/Run/Task/Dispatch ID, generated cache, or unrelated edit.

## 3. Create the landing commit

If the intended change is already represented by focused unpublished commits,
reuse them rather than duplicating the commit. Otherwise:

1. choose one short imperative or descriptive subject;
2. create one focused commit with `git commit -m "<subject>"`; and
3. require the working tree to contain no remaining unstaged change belonging
   to this landing request.

The subject convention is authoritative in
[AGENTS.md](../../../AGENTS.md#definition-of-done). Do not amend or
rewrite a commit already present on `origin/main`.

## 4. Recheck destination policy

Resolve the publishing remote as `origin`; never publish through the `local`
backlink. Require `origin` to identify `Wade11s/skills`.

Run these read-only checks:

```bash
gh auth status
gh repo view Wade11s/skills \
  --json nameWithOwner,defaultBranchRef,viewerPermission,url
gh api repos/Wade11s/skills/rulesets
gh api repos/Wade11s/skills/branches/main/protection
```

Proceed with direct landing only when:

- the default branch is still `main`;
- the authenticated user has write/admin permission;
- no active ruleset or branch protection requires another landing mechanism;
  the protection endpoint's documented `404 Branch not protected` response is
  acceptable; and
- no repository workflow or documented policy requires remote checks that
  cannot be verified for the exact candidate before it reaches `main`.

If policy changed, authentication is unavailable, or required checks are
pending, failing, missing, or unverifiable, stop before pushing and report that
the change has not landed. Local validation never substitutes for a required
remote check.

## 5. Reconcile with current main

1. Run `git fetch origin main`.
2. Compare the landing commit with `origin/main`.
3. If `origin/main` advanced, run the non-interactive equivalent of:

```bash
GIT_EDITOR=true git rebase origin/main
```

Automatically resolve conflicts when the intended result is clear from the
thread, repository instructions, and both sides of the diff. Preserve unrelated
upstream work. Continue the rebase non-interactively and rerun the complete
candidate verification after the resolved commit is created.

For an ambiguous, unsafe, or policy-sensitive conflict, abort the attempted
rebase only when doing so preserves the pre-rebase commit and worktree, report
the blocker, and ask the user for the specific decision. Do not guess.

## 6. Land without force

Push the verified commit with:

```bash
git push origin HEAD:main
```

Never force-push. If the push is rejected because `main` advanced, fetch,
rebase, resolve clear conflicts, and rerun all checks before one bounded retry.
Any permission, policy, or ambiguous conflict failure is a landing blocker.

## 7. Verify the landing

After a successful push:

1. record the full and short local commit SHA;
2. read `refs/heads/main` from `origin` with
   `git ls-remote origin refs/heads/main`;
3. require the remote SHA to equal the local landing SHA;
4. obtain the canonical commit URL from
   `gh api repos/Wade11s/skills/commits/<sha>`;
5. inspect status contexts and check runs for that exact SHA; and
6. when any applicable check exists, wait boundedly for every required check to
   reach a successful terminal result.

Do not report success for a prepared commit, a push to another ref, a remote SHA
mismatch, or incomplete/failing required checks. Verify that all intended paths
are clean after landing without deleting unrelated pre-existing work.

## 8. Report the outcome

When `report_subthread_status` is available, report the result to the parent;
otherwise report it in the current conversation.

Use `status: success` only after `origin/main` and every required check are
verified. Use the title `Landed on main` and a one-line description containing
the linked short commit SHA plus a linked CI/check result when one exists. When
no remote checks exist, link only the verified commit and say that no required
CI checks are configured.

Use `status: failure` for a genuine blocker or failed attempt, with a short
title such as `Blocked by checks` or `Push blocked`, and state explicitly that
the change was not landed when the remote SHA did not advance. Do not report
skill installation or routine progress. If safe recovery later succeeds, report
the verified success as a new outcome.
