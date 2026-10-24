# Bundled script preflight

Read this before running any `scripts/` command. Resolve paths from the installed poteto-mode directory, not the business repo. A script is optional tooling, not permission to install software or write to a forge.

## Runtime and dependency approval

- `scripts/check-plan.mjs` needs Node.js and no package install. It checks plan structure, not whether gates ran.
- `scripts/worktree-audit.sh` needs Bash, Git, and the ordinary POSIX/coreutils commands it uses. Forge metadata additionally uses an available authorized `origin` or `gh` CLI and `jq`. Optional explicit transcript context uses `rg`. Missing metadata is a limitation, not proof that a worktree is unused. Do not install missing commands automatically.
- `scripts/orch/orch.ts` and `scripts/watch-pr/watch-pr` need Bun and the locked package dependencies. Their bootstrap checks for a matching dependency cache. A missing or stale cache now stops with an explanation; it does not install implicitly. `PSTACK_INSTALL_DEPENDENCIES=1` is the explicit install opt-in, not evidence of user approval by itself.

Before an install, explain the locked dependencies, network/package-manager execution, and destination, then obtain applicable approval. Copy the entire `scripts/` directory into an agreed writable scratch location and run the copy. Never generate `node_modules`, lock changes, or bootstrap cache markers in the installed/source skill. If approval or a runtime is unavailable, use direct scoped checks or plain-file bookkeeping and report which script did not run.

After approval, a one-invocation pattern is:

```sh
# First copy the installed scripts directory to an agreed scratch location.
# Replace placeholders with resolved paths, and keep the opt-in local to one call.
PSTACK_INSTALL_DEPENDENCIES=1 bun <scratch-script-copy>/orch/orch.ts --store <run-store> init
```

That opt-in can run `bun install --frozen-lockfile` in the copy and restart the command there. It creates `node_modules` and an install-key marker only in the copy. Later calls with a valid cache need no opt-in. Copying the whole directory preserves imports, package metadata, and the lockfile. Do not bypass the bootstrap by importing command modules to trigger an implicit install elsewhere.

## Audit history and safety

Without `PSTACK_TRANSCRIPTS_DIR`, worktree-audit reads no agent history and omits the history column. Supply this environment variable only for a host/user-provided authorized directory scoped to the current user and project; relative paths resolve from the invocation directory. An unreadable explicit path fails visibly. If `rg` is missing, the script warns and omits history context. It never discovers vendor caches or constructs chat links from filenames or UUIDs.

```sh
bash <scratch-script-copy>/worktree-audit.sh -b <actual-base-ref> <project-root>
# Optional, only after the exact history directory is authorized:
PSTACK_TRANSCRIPTS_DIR=<authorized-project-export-dir> bash <scratch-script-copy>/worktree-audit.sh -b <actual-base-ref> <project-root>
```

The audit does not remove files/worktrees, mutate PRs, or push. It uses existing local refs without fetching or changing them, and may query forge metadata. A missing or stale base requires a separately authorized refresh outside the audit. Review network metadata reads against host permissions. Buckets are suggestions; the cleanup playbook requires usage checks and deletion approval. A date is not a liveness verdict, and missing history is not proof of inactivity.

## Script checks for maintainers

Run from a scratch copy, without installing into skill source:

```sh
python3 <scratch-script-copy>/test_portability.py
# With Bun and an approved dependency cache in the copy:
cd <scratch-script-copy>
bun test orch watch-pr check-plan.test.ts
bun run typecheck
```

The Python suite uses temporary local Git fixtures and fake read-only forge/search tools. It covers absent/explicit history, scope, invalid directories, missing search capability, preservation of user files and Git indexes/refs, no automatic fetch, and no synthesized URLs. Bootstrap tests run only when Bun is available and exercise disabled installation and a valid cache without network access. Report skips; manual cases are separate from these executable checks.
