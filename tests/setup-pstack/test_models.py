"""Read-only resolver behavior. Run: python3 -B -m unittest discover -s tests/setup-pstack."""
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCRIPT = ROOT / "skills/setup-pstack/scripts/resolve_models.py"
SPEC = importlib.util.spec_from_file_location("pstack_models", SCRIPT)
MODELS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODELS)


class ModelPreferencesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        (ROOT / ".scratch").mkdir(exist_ok=True)

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=ROOT / ".scratch")
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.project = self.base / "project"
        self.home = self.base / "home"
        self.project.mkdir()
        self.home.mkdir()

    def write(self, root, contents):
        path = root / ".agents/pstack-models.md"
        path.parent.mkdir(exist_ok=True)
        path.write_text(contents, encoding="utf-8")
        return path

    def resolve(self):
        return MODELS.resolve(self.project, self.home)

    def test_absent_preferences_create_nothing(self):
        self.assertEqual(self.resolve()["roles"], {})
        self.assertIsNone(self.resolve()["budget"])
        self.assertFalse((self.project / ".agents").exists())
        self.assertFalse((self.home / ".agents").exists())

    def test_global_role_is_used(self):
        path = self.write(self.home, "how explorer: provider/global\n")
        result = self.resolve()
        self.assertEqual(result["roles"], {"how explorer": "provider/global"})
        self.assertEqual(result["sources"]["how explorer"], str(path))

    def test_project_overrides_only_same_role(self):
        self.write(self.home, "how explorer: provider/global\nwhy synthesizer: provider/prose\n")
        path = self.write(self.project, "how explorer: provider/project\n")
        result = self.resolve()
        self.assertEqual(result["roles"]["how explorer"], "provider/project")
        self.assertEqual(result["roles"]["why synthesizer"], "provider/prose")
        self.assertEqual(result["sources"]["how explorer"], str(path))

    def test_project_alias_is_an_override(self):
        for alias in ("auto", "inherit-parent"):
            with self.subTest(alias=alias):
                self.write(self.home, "swarm workers: provider/global\n")
                self.write(self.project, f"swarm workers: {alias}\n")
                self.assertEqual(self.resolve()["roles"]["swarm workers"], alias)

    def test_panel_replaces_instead_of_appending(self):
        self.write(self.home, "arena runners: provider/a, provider/b\n")
        self.write(self.project, "arena runners: auto, auto, provider/c\n")
        self.assertEqual(self.resolve()["roles"]["arena runners"], ["auto", "auto", "provider/c"])

    def test_pool_is_preserved_as_a_list(self):
        self.write(self.project, "arena cross-judge pool: inherit-parent\n")
        self.assertEqual(self.resolve()["roles"]["arena cross-judge pool"], ["inherit-parent"])

    def test_removing_project_role_restores_global(self):
        self.write(self.home, "hardest tasks: provider/global\n")
        self.write(self.project, "hardest tasks: provider/project\n")
        self.write(self.project, "# keep no overrides\n")
        self.assertEqual(self.resolve()["roles"]["hardest tasks"], "provider/global")

    def test_budget_precedence_is_separate_from_roles(self):
        self.write(self.home, "# budget: large (xhigh)\nwhy investigators: provider/family:id\n")
        path = self.write(self.project, "# budget: small (medium)\n")
        result = self.resolve()
        self.assertEqual(result["budget"], {"label": "small", "effort": "medium"})
        self.assertEqual(result["budget_source"], str(path))
        self.assertEqual(result["roles"]["why investigators"], "provider/family:id")

    def test_missing_project_budget_inherits_global(self):
        self.write(self.home, "# budget: medium (high)\n")
        self.write(self.project, "hillclimb: auto\n")
        self.assertEqual(self.resolve()["budget"]["effort"], "high")

    def test_cli_warns_before_inheriting_from_malformed_project_budget(self):
        global_path = self.write(self.home, "# budget: large (xhigh)\n")
        project_path = self.write(self.project, "#budget: small (medium)\n")
        originals = {path: path.read_bytes() for path in (global_path, project_path)}
        result = subprocess.run(
            [sys.executable, "-B", str(SCRIPT), "--project-root", str(self.project),
             "--home", str(self.home)], text=True, capture_output=True, check=True,
        )
        resolved = json.loads(result.stdout)
        self.assertEqual(resolved["budget"], {"label": "large", "effort": "xhigh"})
        self.assertEqual(resolved["budget_source"], str(global_path))
        self.assertTrue(resolved["warnings"], "malformed project budget must not be silently ignored")
        self.assertIn(f"{project_path}:1", resolved["warnings"][0])
        self.assertIn("malformed budget directive", resolved["warnings"][0])
        self.assertIn("# budget: LABEL (EFFORT)", resolved["warnings"][0])
        for path, contents in originals.items():
            self.assertEqual(path.read_bytes(), contents)

    def test_malformed_budget_prefixes_warn_in_each_scope(self):
        for root in (self.project, self.home):
            for directive in ("#budget:", "# budget :", "#  budget:", "#\tbudget:", "#Budget:"):
                with self.subTest(scope=root.name, directive=directive):
                    self.write(self.project, "")
                    self.write(self.home, "")
                    path = self.write(root, f"# plain comment\n{directive} small (medium)\n")
                    result = self.resolve()
                    self.assertIsNone(result["budget"])
                    self.assertIsNone(result["budget_source"])
                    self.assertEqual(len(result["warnings"]), 1)
                    self.assertIn(f"{path}:2", result["warnings"][0])
                    self.assertIn("malformed budget directive", result["warnings"][0])

    def test_ordinary_budget_comments_do_not_warn(self):
        self.write(self.project, "# budget planning notes\n# budgets: documentation\n"
                   "# budgeted: estimate\n# Example: #budget: small (medium)\n")
        result = self.resolve()
        self.assertIsNone(result["budget"])
        self.assertEqual(result["warnings"], [])

    def test_host_specific_model_selector_is_preserved_as_opaque_data(self):
        selector = "custom:provider/model[effort=high,speed=fast]"
        self.write(self.project, f"how explorer: {selector}\n")
        self.assertEqual(self.resolve()["roles"]["how explorer"], selector)

    def test_selector_commas_do_not_create_extra_panel_workers(self):
        selector = "provider/model[effort=high,speed=fast]"
        self.write(self.project, f"arena runners: {selector}, inherit-parent\n")
        self.assertEqual(self.resolve()["roles"]["arena runners"], [selector, "inherit-parent"])

    def test_json_preserves_arbitrary_opaque_ids(self):
        self.write(self.project, 'how explorer: "provider/model,variant"\n'
                   'arena runners: ["provider/model,variant", "auto", "auto"]\n')
        result = self.resolve()["roles"]
        self.assertEqual(result["how explorer"], "provider/model,variant")
        self.assertEqual(result["arena runners"], ["provider/model,variant", "auto", "auto"])

    def test_unknown_roles_are_visible_but_not_executed(self):
        self.write(self.project, "retired critics: run-something\n# plain comment\n")
        result = self.resolve()
        self.assertEqual(result["roles"], {})
        self.assertIn("retired critics", result["warnings"][0])

    def test_invalid_file_does_not_silently_fall_back(self):
        self.write(self.home, "bug-fix: provider/valid\n")
        for text in ("bug-fix: \n", "bug-fix: a, b\n", "bug-fix: a\nbug-fix: b\n",
                     "not a role line\n", "arena runners: a,,b\n", "swarm workers: bad value\n",
                     "# budget: small (max)\n", "# budget: large (xhigh)\n# budget: small (medium)\n",
                     'arena runners: []\n', 'arena runners: ["a",]\n', 'arena runners: [1]\n',
                     'bug-fix: ["a"]\n', 'bug-fix: provider/model[effort=max\n'):
            with self.subTest(contents=text):
                self.write(self.project, text)
                with self.assertRaises(ValueError):
                    self.resolve()

    def test_directory_instead_of_file_is_an_error(self):
        (self.project / ".agents/pstack-models.md").mkdir(parents=True)
        with self.assertRaises(OSError):
            self.resolve()

    def test_invalid_utf8_is_an_error(self):
        path = self.write(self.project, "")
        path.write_bytes(b"\xff")
        with self.assertRaises(UnicodeError):
            self.resolve()

    def test_explicit_root_wins_over_process_working_directory(self):
        nested = self.project / "packages/pkg"
        nested.mkdir(parents=True)
        self.write(self.project, "feature, refactoring: provider/root\n")
        self.write(nested, "feature, refactoring: provider/wrong-root\n")
        result = subprocess.run(
            [sys.executable, "-B", str(SCRIPT), "--project-root", str(self.project),
             "--home", str(self.home)], cwd=nested, text=True, capture_output=True, check=True,
        )
        self.assertEqual(json.loads(result.stdout)["roles"]["feature, refactoring"], "provider/root")

    def test_cli_is_read_only_and_reports_invalid_configuration(self):
        path = self.write(self.project, "how explorer: \n")
        original = path.read_bytes()
        result = subprocess.run(
            [sys.executable, "-B", str(SCRIPT), "--project-root", str(self.project),
             "--home", str(self.home)], text=True, capture_output=True,
        )
        self.assertEqual(result.returncode, 2)
        self.assertIn("empty or malformed", json.loads(result.stderr)["error"])
        self.assertEqual(path.read_bytes(), original)

    def test_global_resolution_does_not_import_project_preferences(self):
        self.write(self.project, "how explorer: private/project\n")
        global_path = self.write(self.home, "how explorer: public/global\n")
        selected = MODELS.read_preferences(global_path)
        self.assertEqual(selected["roles"]["how explorer"], "public/global")

    def test_nonexistent_project_root_is_an_error(self):
        with self.assertRaises(ValueError):
            MODELS.resolve(self.project / "missing", self.home)

    def test_paths_with_spaces(self):
        root = self.project / "with spaces"
        root.mkdir()
        self.write(root, "judgment and prose: auto\n")
        self.assertEqual(MODELS.resolve(root, self.home)["roles"]["judgment and prose"], "auto")


if __name__ == "__main__":
    unittest.main()
