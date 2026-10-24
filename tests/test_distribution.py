"""Static packaging contracts, not agent-behavior evaluations."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "skills"


class DistributionTests(unittest.TestCase):
    def test_catalog_names_manifests_cases_and_licenses_agree(self):
        entries = sorted(SKILLS.glob("*/SKILL.md"))
        self.assertEqual(len(entries), 58)
        names = {path.parent.name for path in entries}
        manifest = json.loads((ROOT / ".claude-plugin/marketplace.json").read_text())
        listed = [entry for group in manifest["plugins"] for entry in group["skills"]]
        self.assertEqual(len(listed), len(set(listed)))
        self.assertEqual(set(listed), {"./skills/" + name for name in names})
        readme = (ROOT / "README.md").read_text()
        for path in entries:
            with self.subTest(skill=path.parent.name):
                contents = path.read_text()
                metadata = contents.split("---", 2)[1]
                self.assertRegex(metadata, r"(?m)^name: " + re.escape(path.parent.name) + r"$")
                self.assertRegex(metadata, r"(?m)^description: .+")
                self.assertNotRegex(metadata, r"(?m)^(icon|color|paths):")
                self.assertIn("(skills/" + path.parent.name + "/SKILL.md)", readme)
                self.assertTrue((ROOT / "tests" / path.parent.name / "cases.md").is_file())
                license_text = (path.parent / "LICENSE").read_text()
                self.assertIn("MIT License", license_text)
                self.assertIn("Copyright (c) 2026 Lauren Tan", license_text)

    def test_all_migrated_skills_belong_to_one_pstack_group(self):
        manifest = json.loads((ROOT / ".claude-plugin/marketplace.json").read_text())
        self.assertEqual([group["name"] for group in manifest["plugins"]], ["pstack"])
        self.assertEqual(len(manifest["plugins"][0]["skills"]), 58)

    def test_every_entry_starts_with_project_first_model_discovery(self):
        for path in SKILLS.glob("*/SKILL.md"):
            with self.subTest(skill=path.parent.name):
                contents = path.read_text()
                startup = contents.split("## Agent startup\n\n", 1)[1].split("\n## ", 1)[0]
                project = startup.index("<project-root>/.agents/pstack-models.md")
                global_ = startup.index("~/.agents/pstack-models.md")
                self.assertLess(project, global_)
                self.assertIn("for missing roles", startup)
                self.assertIn("project role > global role > supported skill default > `inherit-parent`", startup)
                self.assertIn("Forward the root and effective choices to delegates", startup)
                self.assertIn("without subagents", startup)
                self.assertIn("if absent", startup)

    def test_runtime_docs_do_not_require_vendor_paths_or_slugs(self):
        forbidden = re.compile(
            r"~/\.cursor|\.cursor/|\.cursor-plugin|cursor-team-kit|"
            r"cursor\.com/(?:agents|docs/skills)|grok-4\.7|claude-opus-5-5"
        )
        for path in SKILLS.rglob("*.md"):
            with self.subTest(path=str(path.relative_to(ROOT))):
                self.assertIsNone(forbidden.search(path.read_text()))

    def test_relative_markdown_resource_pointers_exist(self):
        for path in SKILLS.rglob("*.md"):
            for target in re.findall(r"\[[^\]\n]*\]\(([^)\n]+)\)", path.read_text()):
                target = target.split("#", 1)[0]
                if not target or target == "url" or "://" in target or target.startswith("mailto:"):
                    continue
                if any(char in target for char in ("<", ">", "*", " ", "$", "{")):
                    continue
                with self.subTest(path=str(path.relative_to(ROOT)), target=target):
                    self.assertTrue((path.parent / target).exists(), "missing runtime pointer")

    def test_skill_packages_use_english_not_chinese_text(self):
        han = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")
        for path in SKILLS.rglob("*"):
            if path.is_file() and (path.suffix in {".md", ".py", ".ts", ".mjs", ".js", ".json", ".sh", ".tsv", ".mmd", ".lock"} or path.name in {"LICENSE", "watch-pr"}):
                with self.subTest(path=str(path.relative_to(ROOT))):
                    self.assertIsNone(han.search(path.read_text()), "skill packages must be English")

    def test_resolver_roles_match_setup_example(self):
        setup = (SKILLS / "setup-pstack/SKILL.md").read_text()
        example = setup.split("```text\n", 1)[1].split("```", 1)[0]
        roles = {line.partition(":")[0] for line in example.splitlines() if line and not line.startswith("#")}
        resolver = SKILLS / "setup-pstack/scripts/resolve_models.py"
        namespace = {"__name__": "distribution_test"}
        exec(compile(resolver.read_text(), str(resolver), "exec"), namespace)
        self.assertEqual(roles, set(namespace["ROLES"]))


if __name__ == "__main__":
    unittest.main()
