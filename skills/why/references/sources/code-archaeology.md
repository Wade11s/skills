# Code Archaeology (git + in-repo)

## What this source contains

- Commit history (messages, dates, authors, diffs)
- PR descriptions, review comments, and discussion threads (through an available source-control read integration; authenticated `gh` is one GitHub option)
- Inline code comments, TODOs, FIXMEs, deprecation notes
- ADRs (architectural decision records) if the repo keeps them
- Tests, whose names and assertions often encode the edge cases that motivated a change
- Related files modified in the same commits (co-change signal)
- CHANGELOG entries and release notes in the repo
- Issue/ticket IDs in commit messages and PR bodies

This source is tied directly to the code, but checkout history, remote PR access, and review records may be incomplete or unavailable. Use the accessible subset or supplied exports and report the gaps.

## How to search it

In a Git checkout with readable history, expand the seed commit list. Otherwise use available history records or exports and mark missing coverage:

```bash
# History through renames
git log --follow --oneline -- <file>

# Pickaxe: commits that added or removed this exact text
git log -S '<exact_string_from_code>' -- <file>

# Or for patterns:
git log -G '<regex>' -- <file>

# Who wrote each line and when
git blame -L <start>,<end> <file>

# One commit's full diff
git show <hash>

# Commits between two points affecting this file
git log <old>..<new> -p -- <file>
```

Look for out-of-band docs using the host's path-search, content-search, and read tools under repository rules:

- Locate ADR directories or Markdown files, then search for architectural decisions.
- Read TODO, FIXME, HACK, XXX, and NOTE comments near the target.
- Locate test files, search for the target symbol, and read the assertions.

Do not assume shell search commands are permitted. Code and tests establish mechanics; only explicit rationale establishes author intent.
