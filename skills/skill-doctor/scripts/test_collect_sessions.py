#!/usr/bin/env python3
"""Tests for skill-doctor session collection."""

import json
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from collect_sessions import (
    detect_skills_from_entries,
    discover_skills,
    find_claude_session_files,
    find_pi_session_files,
    parse_claude_session,
    parse_pi_session,
    pi_session_kind,
    read_pi_header,
    session_matches_repos,
)


def write_jsonl(path, records):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(json.dumps(record) for record in records) + "\n")


class ClaudeSessionTests(unittest.TestCase):
    def test_discovers_skills_and_matches_sessions_across_projects(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            first = root / "first"
            second = root / "second"
            first_skill = first / ".agents" / "skills" / "alpha" / "SKILL.md"
            second_skill = second / ".claude" / "skills" / "beta" / "SKILL.md"
            first_skill.parent.mkdir(parents=True)
            second_skill.parent.mkdir(parents=True)
            first_skill.write_text("---\ndescription: Alpha\n---\n")
            second_skill.write_text("---\ndescription: Beta\n---\n")

            skills = discover_skills(
                [first, second],
                root / "codex-home",
                [],
                False,
            )

            self.assertEqual(set(skills), {"alpha", "beta"})
            self.assertTrue(
                session_matches_repos(second / "src", [first, second])
            )
            self.assertFalse(
                session_matches_repos(root / "elsewhere", [first, second])
            )

    def test_detects_skills_from_deferred_tool_entries(self):
        entries = [
            ("tool:Skill", '{"skill": "alpha"}'),
            ("tool:read", '{"path": "/repo/.agents/skills/beta/SKILL.md"}'),
            ("assistant", "Mentioning gamma here does not count."),
        ]

        self.assertEqual(
            detect_skills_from_entries(entries, {"alpha", "beta", "gamma"}),
            {"alpha", "beta"},
        )

    def test_discovers_parent_sessions_and_optional_subagents(self):
        with tempfile.TemporaryDirectory() as tmp:
            claude_home = Path(tmp)
            parent = claude_home / "projects" / "-repo" / "parent.jsonl"
            subagent = (
                claude_home
                / "projects"
                / "-repo"
                / "parent"
                / "subagents"
                / "agent-child.jsonl"
            )
            old = claude_home / "projects" / "-repo" / "old.jsonl"
            for path in (parent, subagent, old):
                write_jsonl(path, [{"type": "user"}])
            old_time = (datetime.now(timezone.utc) - timedelta(days=10)).timestamp()
            os.utime(old, (old_time, old_time))
            cutoff = datetime.now(timezone.utc) - timedelta(days=1)

            parents = find_claude_session_files(claude_home, cutoff, False)
            with_subagents = find_claude_session_files(claude_home, cutoff, True)

            self.assertEqual([path for _, path in parents], [parent])
            self.assertEqual(
                {path for _, path in with_subagents},
                {parent, subagent},
            )

    def test_parses_messages_tools_skills_and_stats(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "session.jsonl"
            common = {
                "sessionId": "session-1",
                "cwd": "/tmp/repo",
                "timestamp": "2026-08-20T10:00:00Z",
                "version": "1.0.0",
            }
            write_jsonl(path, [
                {
                    **common,
                    "type": "user",
                    "uuid": "user-1",
                    "message": {"role": "user", "content": "Improve my skill"},
                },
                {
                    **common,
                    "type": "assistant",
                    "uuid": "assistant-1",
                    "message": {
                        "id": "message-1",
                        "role": "assistant",
                        "content": [
                            {"type": "text", "text": "I will inspect it."},
                            {
                                "type": "tool_use",
                                "name": "Skill",
                                "input": {"skill": "update-skill"},
                            },
                        ],
                    },
                },
                {
                    **common,
                    "type": "assistant",
                    "uuid": "assistant-2",
                    "message": {
                        "id": "message-1",
                        "role": "assistant",
                        "content": [
                            {
                                "type": "tool_use",
                                "name": "Edit",
                                "input": {"file_path": "/tmp/repo/SKILL.md"},
                            }
                        ],
                    },
                },
                {
                    **common,
                    "type": "user",
                    "uuid": "result-1",
                    "message": {
                        "role": "user",
                        "content": [
                            {
                                "type": "tool_result",
                                "is_error": True,
                                "content": "permission denied",
                            }
                        ],
                    },
                },
            ])

            meta, stats, entries, skills = parse_claude_session(
                path,
                {"update-skill"},
                False,
            )

            self.assertEqual(meta["id"], "session-1")
            self.assertEqual(meta["cwd"], "/tmp/repo")
            self.assertEqual(stats["user_turns"], 1)
            self.assertEqual(stats["assistant_turns"], 1)
            self.assertEqual(stats["tool_calls"], 2)
            self.assertEqual(stats["error_outputs"], 1)
            self.assertTrue(stats["has_code_edits"])
            self.assertEqual(skills, ["update-skill"])
            self.assertIn(("user", "Improve my skill"), entries)
            self.assertIn(("assistant", "I will inspect it."), entries)

    def test_excludes_sidechains_by_default(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "agent-child.jsonl"
            write_jsonl(path, [{
                "type": "user",
                "sessionId": "session-1",
                "agentId": "child-1",
                "isSidechain": True,
                "cwd": "/tmp/repo",
                "timestamp": "2026-08-20T10:00:00Z",
                "message": {"role": "user", "content": "Investigate"},
            }])

            self.assertIsNone(parse_claude_session(path, set(), False))
            parsed = parse_claude_session(path, set(), True)
            self.assertEqual(parsed[0]["id"], "session-1-child-1")
            self.assertEqual(parsed[0]["thread_source"], "subagent")


class PiSessionTests(unittest.TestCase):
    def test_discovers_project_and_global_pi_skills(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            repo = root / "repo"
            pi_home = root / "pi-home"
            project_skill = repo / ".pi" / "skills" / "alpha" / "SKILL.md"
            nested_skill = (
                repo / ".pi" / "skills" / "group" / "beta" / "SKILL.md"
            )
            global_skill = pi_home / "skills" / "gamma" / "SKILL.md"
            for path in (project_skill, nested_skill, global_skill):
                path.parent.mkdir(parents=True)
                path.write_text("---\ndescription: Demo\n---\n")

            project_only = discover_skills(
                [repo],
                root / "codex-home",
                [],
                False,
                pi_home,
            )
            with_global = discover_skills(
                [repo],
                root / "codex-home",
                [],
                True,
                pi_home,
            )

            self.assertEqual(set(project_only), {"alpha", "beta"})
            self.assertTrue({"alpha", "beta", "gamma"}.issubset(with_global))
            self.assertNotIn("gamma", project_only)

    def test_finds_parent_sessions_and_optional_subagents(self):
        with tempfile.TemporaryDirectory() as tmp:
            sessions_dir = Path(tmp) / "sessions"
            cwd_dir = sessions_dir / "--tmp-repo--"
            parent = cwd_dir / "2026-08-31T15-00-00Z_parent.jsonl"
            child = (
                cwd_dir
                / "2026-08-31T15-00-00Z_parent"
                / "run-id"
                / "run-0"
                / "session.jsonl"
            )
            artifact = cwd_dir / "subagent-artifacts" / "run-id_transcript.jsonl"
            old = cwd_dir / "old.jsonl"
            for path in (parent, child, artifact, old):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(
                    json.dumps({
                        "type": "session",
                        "id": path.stem,
                        "cwd": "/tmp/repo",
                    })
                    + "\n"
                )
            old_time = (datetime.now(timezone.utc) - timedelta(days=10)).timestamp()
            os.utime(old, (old_time, old_time))
            cutoff = datetime.now(timezone.utc) - timedelta(days=1)

            parents = find_pi_session_files(sessions_dir, cutoff, False)
            with_subagents = find_pi_session_files(sessions_dir, cutoff, True)

            self.assertEqual([path for _, path, _ in parents], [parent])
            self.assertEqual(
                {path for _, path, _ in with_subagents},
                {parent, child},
            )
            self.assertEqual(pi_session_kind(parent, sessions_dir), "parent")
            self.assertEqual(pi_session_kind(child, sessions_dir), "subagent")
            self.assertEqual(pi_session_kind(artifact, sessions_dir), "artifact")

    def test_parses_messages_tools_skills_and_edits(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "session.jsonl"
            write_jsonl(path, [
                {
                    "type": "session",
                    "version": 3,
                    "id": "session-pi",
                    "timestamp": "2026-08-31T15:00:00.000Z",
                    "cwd": "/tmp/repo",
                },
                {
                    "type": "message",
                    "id": "u1",
                    "parentId": None,
                    "timestamp": "2026-08-31T15:00:01.000Z",
                    "message": {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "/skill:update-skill fix this"}
                        ],
                    },
                },
                {
                    "type": "message",
                    "id": "a1",
                    "parentId": "u1",
                    "timestamp": "2026-08-31T15:00:02.000Z",
                    "message": {
                        "role": "assistant",
                        "content": [
                            {"type": "thinking", "thinking": "plan"},
                            {"type": "text", "text": "I will inspect it."},
                            {
                                "type": "toolCall",
                                "id": "c1",
                                "name": "read",
                                "arguments": {
                                    "path": "/tmp/.pi/agent/skills/update-skill/SKILL.md"
                                },
                            },
                            {
                                "type": "toolCall",
                                "id": "c2",
                                "name": "edit",
                                "arguments": {"path": "/tmp/repo/app.py", "edits": []},
                            },
                        ],
                    },
                },
                {
                    "type": "message",
                    "id": "r1",
                    "parentId": "a1",
                    "timestamp": "2026-08-31T15:00:03.000Z",
                    "message": {
                        "role": "toolResult",
                        "toolCallId": "c1",
                        "toolName": "read",
                        "content": [{"type": "text", "text": "permission denied"}],
                        "isError": True,
                    },
                },
            ])

            header = read_pi_header(path)
            meta, stats, entries, skills = parse_pi_session(
                path,
                {"update-skill"},
                False,
            )

            self.assertEqual(header["id"], "session-pi")
            self.assertEqual(meta["cwd"], "/tmp/repo")
            self.assertEqual(meta["originator"], "pi")
            self.assertEqual(stats["user_turns"], 1)
            self.assertEqual(stats["assistant_turns"], 1)
            self.assertEqual(stats["tool_calls"], 2)
            self.assertEqual(stats["error_outputs"], 1)
            self.assertTrue(stats["has_code_edits"])
            self.assertEqual(skills, ["update-skill"])
            self.assertIn(("user", "/skill:update-skill fix this"), entries)
            self.assertIn(("assistant", "I will inspect it."), entries)
            self.assertTrue(any(role == "tool:read" for role, _ in entries))

    def test_excludes_subagent_sessions_by_default(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "session.jsonl"
            write_jsonl(path, [{
                "type": "session",
                "id": "child-1",
                "cwd": "/tmp/repo",
                "timestamp": "2026-08-31T15:00:00.000Z",
            }])

            self.assertIsNone(parse_pi_session(path, set(), False, True))
            parsed = parse_pi_session(path, set(), True, True)
            self.assertEqual(parsed[0]["id"], "child-1")
            self.assertEqual(parsed[0]["thread_source"], "subagent")

    def test_detects_slash_skill_invocations_from_user_text(self):
        entries = [
            ("user", "please run /skill:alpha on this"),
            ("tool:read", '{"path": "/repo/.pi/skills/beta/SKILL.md"}'),
            ("assistant", "Mentioning gamma here does not count."),
        ]

        self.assertEqual(
            detect_skills_from_entries(entries, {"alpha", "beta", "gamma"}),
            {"alpha", "beta"},
        )


if __name__ == "__main__":
    unittest.main()
