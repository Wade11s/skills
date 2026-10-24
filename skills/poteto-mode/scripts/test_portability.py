#!/usr/bin/env python3
"""Offline portability regressions; run on a scratch copy of scripts/."""

import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parent
BASH = shutil.which("bash")
GIT = shutil.which("git")
BUN = shutil.which("bun")


@unittest.skipUnless(BASH and GIT, "Bash and Git are required")
class WorktreeAuditTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="poteto-audit-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name).resolve()
        self.repo = self.root / "business repo"
        self.worktree = self.root / "topic [one]"
        self.bin = self.root / "bin"
        self.bin.mkdir()
        self.home = self.root / "home"
        self.home.mkdir()
        self.log = self.root / "search.log"
        self.env = {
            **os.environ,
            "HOME": str(self.home),
            "GIT_CONFIG_GLOBAL": os.devnull,
            "GIT_CONFIG_NOSYSTEM": "1",
            "GIT_AUTHOR_NAME": "Fixture",
            "GIT_AUTHOR_EMAIL": "fixture@example.invalid",
            "GIT_COMMITTER_NAME": "Fixture",
            "GIT_COMMITTER_EMAIL": "fixture@example.invalid",
            "PATH": str(self.bin) + os.pathsep + os.environ["PATH"],
            "AUDIT_SEARCH_LOG": str(self.log),
        }
        self.env.pop("PSTACK_TRANSCRIPTS_DIR", None)
        self.tool("origin", "exit 1\n")
        self.tool("gh", "exit 1\n")
        self.tool(
            "rg",
            'printf "%s\\n" "$@" >> "$AUDIT_SEARCH_LOG"\n'
            'for arg do last="$arg"; done\n'
            '[ "$last" = "$AUDIT_EXPECTED_DIR" ] || exit 81\n'
            '[ "$2" = "-F" ] || exit 82\n'
            'printf "%s\\n" "$AUDIT_MATCH_FILE"\n',
        )
        self.git("init", "--quiet", str(self.repo), cwd=self.root)
        self.git("symbolic-ref", "HEAD", "refs/heads/main")
        (self.repo / "keep.txt").write_text("original\n")
        self.git("add", "keep.txt")
        self.git("commit", "--quiet", "-m", "baseline")
        self.git("worktree", "add", "--quiet", "-b", "topic", str(self.worktree))

    def tool(self, name, body):
        path = self.bin / name
        path.write_text("#!/bin/sh\n" + body)
        path.chmod(0o755)

    def git(self, *args, cwd=None):
        return subprocess.check_output(
            [GIT, *args], cwd=cwd or self.repo, env=self.env, text=True
        )

    def audit(self, base="main", **extra):
        return subprocess.run(
            [BASH, str(SCRIPTS / "worktree-audit.sh"), "-b", base, str(self.repo)],
            cwd=self.root,
            env={**self.env, **extra},
            text=True,
            capture_output=True,
            timeout=30,
        )

    def table(self, output):
        lines = output.splitlines()
        header = lines[1].split("\t")
        return header, dict(zip(header, lines[2].split("\t")))

    def test_default_reads_no_history_and_omits_history_columns(self):
        result = self.audit()
        self.assertEqual(result.returncode, 0, result.stderr)
        header, row = self.table(result.stdout)
        self.assertNotIn("LAST_ACTIVITY", header)
        self.assertNotIn("LAST_CHAT", header)
        self.assertFalse(self.log.exists(), "history search must be opt-in")
        self.assertEqual(row["WORKTREE"], str(self.worktree))
        self.assertEqual(row["BUCKET"], "verify-usage")
        self.assertNotIn("://", result.stdout)

    def test_explicit_directory_is_the_only_history_scope_and_emits_no_urls(self):
        exports = self.root / "authorized exports"
        exports.mkdir()
        transcript = exports / "12345678-1234-1234-1234-123456789abc chat.txt"
        transcript.write_text(str(self.worktree / "keep.txt"))
        result = self.audit(
            PSTACK_TRANSCRIPTS_DIR=str(exports.relative_to(self.root)),
            AUDIT_EXPECTED_DIR=str(exports),
            AUDIT_MATCH_FILE=str(transcript),
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        header, row = self.table(result.stdout)
        self.assertIn("LAST_ACTIVITY", header)
        self.assertRegex(row["LAST_ACTIVITY"], r"^\d{4}-\d{2}-\d{2}$")
        self.assertEqual(row["BUCKET"], "verify-recent-chat")
        args = self.log.read_text().splitlines()
        self.assertEqual(args[-1], str(exports))
        self.assertEqual(args[-2], "--")
        self.assertIn(str(self.worktree) + "/", args)
        self.assertNotIn(str(self.home), self.log.read_text())
        self.assertNotIn(transcript.name, result.stdout)
        self.assertNotIn("://", result.stdout)

    def test_invalid_explicit_history_fails_without_search(self):
        result = self.audit(PSTACK_TRANSCRIPTS_DIR=str(self.root / "missing"))
        self.assertEqual(result.returncode, 2)
        self.assertIn("unreadable PSTACK_TRANSCRIPTS_DIR", result.stderr)
        self.assertFalse(self.log.exists())
        self.assertEqual(result.stdout, "")

    def test_missing_optional_search_warns_and_omits_history(self):
        minimal = self.root / "minimal-bin"
        minimal.mkdir()
        for name in ("git", "awk", "du", "sort", "stat", "date", "mktemp", "head", "rm", "grep"):
            executable = shutil.which(name)
            if not executable:
                self.skipTest(name + " is required for this fixture")
            (minimal / name).symlink_to(executable)
        result = self.audit(PATH=str(minimal), PSTACK_TRANSCRIPTS_DIR=str(self.home))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("rg unavailable", result.stderr)
        self.assertNotIn("LAST_ACTIVITY", self.table(result.stdout)[0])
        self.assertFalse(self.log.exists())

    def test_clean_file_stat_refresh_does_not_write_the_index(self):
        tracked = self.worktree / "keep.txt"
        index = Path(self.git("rev-parse", "--git-path", "index", cwd=self.worktree).strip())
        before = index.read_bytes()
        times = tracked.stat()
        os.utime(tracked, (times.st_atime + 10, times.st_mtime + 10))
        result = self.audit()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(index.read_bytes(), before)
        self.assertEqual(tracked.read_text(), "original\n")

    def test_remote_base_does_not_fetch_or_change_refs(self):
        self.git("update-ref", "refs/remotes/origin/main", "HEAD")
        log = self.root / "git-calls.log"
        self.tool(
            "git",
            'printf "%s\\n" "$1" >> "$AUDIT_GIT_LOG"\n'
            'exec "$AUDIT_REAL_GIT" "$@"\n',
        )
        before = self.git("for-each-ref", "--format=%(refname) %(objectname)")
        result = self.audit(base="origin/main", AUDIT_GIT_LOG=str(log), AUDIT_REAL_GIT=GIT)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotIn("fetch", log.read_text().splitlines())
        self.assertEqual(self.git("for-each-ref", "--format=%(refname) %(objectname)"), before)

    def test_audit_preserves_tracked_untracked_files_and_worktrees(self):
        tracked = self.worktree / "keep.txt"
        tracked.write_text("valuable uncommitted edit\n")
        untracked = self.worktree / "private notes.txt"
        untracked.write_text("not disposable\n")
        before = self.git("worktree", "list", "--porcelain")
        result = self.audit()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(tracked.read_text(), "valuable uncommitted edit\n")
        self.assertEqual(untracked.read_text(), "not disposable\n")
        self.assertEqual(self.git("worktree", "list", "--porcelain"), before)
        self.assertEqual(self.table(result.stdout)[1]["BUCKET"], "hold-wip")
        tracked.write_text("original\n")
        result = self.audit()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.table(result.stdout)[1]["BUCKET"], "hold-untracked")
        self.assertTrue(untracked.exists())


@unittest.skipUnless(BUN, "Bun is required for bootstrap regressions")
class BootstrapTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="poteto-bootstrap-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name).resolve()
        for name in ("bootstrap.ts", "package.json", "bun.lock"):
            shutil.copy2(SCRIPTS / name, self.root / name)
        (self.root / "entry.ts").write_text(
            'import { ensureDependenciesInstalled } from "./bootstrap.ts";\n'
            'ensureDependenciesInstalled();\nconsole.log("cached dependencies ready");\n'
        )
        self.env = dict(os.environ)
        self.env.pop("PSTACK_INSTALL_DEPENDENCIES", None)

    def run_bootstrap(self, **extra):
        return subprocess.run(
            [BUN, "entry.ts"], cwd=self.root, env={**self.env, **extra},
            text=True, capture_output=True, timeout=30,
        )

    def test_missing_cache_never_installs_without_exact_opt_in(self):
        for value in (None, "0", "true"):
            with self.subTest(value=value):
                result = self.run_bootstrap(**({} if value is None else {"PSTACK_INSTALL_DEPENDENCIES": value}))
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("Installation is disabled by default", result.stderr)
                self.assertFalse((self.root / "node_modules").exists())

    def test_valid_cache_works_without_install_permission(self):
        modules = self.root / "node_modules"
        package = modules / "commander" / "package.json"
        package.parent.mkdir(parents=True)
        package.write_text('{"name":"commander"}')
        key = hashlib.sha256(
            (self.root / "package.json").read_bytes() + b"\0" + (self.root / "bun.lock").read_bytes()
        ).hexdigest()
        (modules / ".poteto-mode-tools-install-key").write_text(key + "\n")
        result = self.run_bootstrap()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("cached dependencies ready", result.stdout)

    def test_stale_cache_is_not_reinstalled_implicitly(self):
        modules = self.root / "node_modules"
        modules.mkdir()
        marker = modules / ".poteto-mode-tools-install-key"
        marker.write_text("stale\n")
        result = self.run_bootstrap()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Installation is disabled by default", result.stderr)
        self.assertEqual(marker.read_text(), "stale\n")
        self.assertFalse((modules / "commander").exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)
