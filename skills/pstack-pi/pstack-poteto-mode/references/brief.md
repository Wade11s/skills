# Kickoff template

Every delegate brief stands alone. A delegate that has to ask what the goal is was given a
bad brief, not a hard task.

## Shape

```text
Read <absolute path>/worker.md before anything else.

Goal: <the user's goal, in the user's words, and the smallest change that meets it>
Role: <what this delegate owns, and what it must not touch>
Scope: <paths, named symbols, and the boundary of the work>
Verify: <the exact command, or the observable state, that proves the work>
Report: <the shape below>
Persona: <absolute path>/references/poteto-agent.md
```

- Point at files. Do not paste file contents into the brief.
- One brief, one objective, one output location.
- When two delegates write, give each its own directory or worktree.
- Name the base commit or branch when the delegate's work must be reproducible.

## Report

```text
PASS | ISSUES | BLOCKED
Changed: <paths and what changed>
Verified: <command, and its output>
Unverified: <what the delegate could not check, and why>
```

A delegate that can prove a defect reports `ISSUES` and lists every one it can prove, not
just the first. `BLOCKED` names what is missing.

## Accepting the result

Read the result against the brief. Rerun the verification the brief named, or the check the
result claims. A missing command, output, or commit is an unverified result: respawn once
with the gap named, then record the gap. A gap is never a pass.
