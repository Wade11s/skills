"""Executable checks for the bundled TSV helper, not agent-behavior tests.

Run from the checkout: python3 -B tests/show-me-your-work/test_log.py
Only Python's standard library and the helper's Bash runtime are required.
"""

import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
HELPER = ROOT / "skills" / "show-me-your-work" / "scripts" / "log.sh"
HEADER = "ts\tphase\tdecision\twhy\tevidence\tresult"
ROW = ("frame", "choose local check", "avoid external writes", "proof.txt", "open")


class LogTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="pstack-log-test-")
        self.addCleanup(self.temp.cleanup)
        self.work = Path(self.temp.name)
        self.log = self.work / "nested" / "decisions.tsv"

    def run_helper(self, *args):
        return subprocess.run(
            ["bash", str(HELPER), *map(str, args)],
            cwd=self.work,
            text=True,
            capture_output=True,
            timeout=10,
            check=False,
        )

    def append(self, fields=ROW):
        result = self.run_helper(self.log, *fields)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, "")
        self.assertEqual(result.stderr, "")
        return self.log.read_text(encoding="utf-8").splitlines()

    def test_creates_parent_header_and_timestamped_row(self):
        lines = self.append()
        self.assertEqual(len(lines), 2)
        self.assertEqual(lines[0], HEADER)
        cells = lines[1].split("\t")
        self.assertEqual(len(cells), 6)
        self.assertRegex(cells[0], r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
        self.assertEqual(cells[1:], list(ROW))

    def test_appends_without_overwriting_or_repeating_header(self):
        self.append()
        before = self.log.read_bytes()
        second = ("drive", "checked the result", "confirm persistence", "screen.png", "pass")
        lines = self.append(second)
        self.assertTrue(self.log.read_bytes().startswith(before))
        self.assertEqual(lines.count(HEADER), 1)
        self.assertEqual(len(lines), 3)
        self.assertEqual(lines[-1].split("\t")[1:], list(second))

    def test_empty_existing_log_gets_one_header(self):
        self.log.parent.mkdir()
        self.log.touch()
        lines = self.append()
        self.assertEqual(lines.count(HEADER), 1)
        self.assertEqual(len(lines), 2)

    def test_formula_prefix_is_escaped_in_every_user_supplied_column(self):
        for marker in ("=", "+", "-", "@"):
            with self.subTest(marker=marker):
                values = tuple(marker + field for field in ROW)
                cells = self.append(values)[-1].split("\t")
                self.assertEqual(cells[1:], ["'" + value for value in values])
        self.assertEqual(self.log.read_text(encoding="utf-8").splitlines().count(HEADER), 1)

    def test_tabs_newlines_and_carriage_returns_stay_in_one_row(self):
        values = (
            "phase\tname",
            "decision\nnext line",
            "why\rnext line",
            "file\r\nnext\titem",
            "=unsafe\nvalue",
        )
        cells = self.append(values)[-1].split("\t")
        self.assertEqual(len(self.log.read_text(encoding="utf-8").splitlines()), 2)
        self.assertEqual(
            cells[1:],
            [
                "phase name",
                "decision next line",
                "why next line",
                "file  next item",
                "'=unsafe value",
            ],
        )

    def test_wrong_argument_count_fails_without_creating_or_changing_log(self):
        cases = ((), (self.log, *ROW[:-1]), (self.log, *ROW, "extra"))
        for args in cases:
            with self.subTest(args=args):
                result = self.run_helper(*args)
                self.assertEqual(result.returncode, 1)
                self.assertEqual(result.stdout, "")
                self.assertEqual(
                    result.stderr,
                    "usage: log.sh <logfile> <phase> <decision> <why> <evidence> <result>\n",
                )
                self.assertFalse(self.log.exists())
        self.append()
        before = self.log.read_bytes()
        result = self.run_helper(self.log, *ROW, "extra")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(self.log.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
