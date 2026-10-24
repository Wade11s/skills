#!/usr/bin/env python3
"""Read pstack preferences without provider calls or filesystem writes."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

PANEL_ROLES = frozenset({
    "arena runners", "arena cross-judge pool",
    "architect runners", "interrogate reviewers",
})
ROLES = (
    "feature, refactoring", "bug-fix", "perf-issue", "hillclimb",
    "judgment and prose", "hardest tasks", "how explorer", "how explainer",
    "why investigators", "why synthesizer", "reflect tooling",
    "reflect judgment, divergent, synthesizer", "arena runners",
    "arena cross-judge pool", "swarm workers", "architect runners",
    "interrogate reviewers",
)
BUDGETS = {"unlimited": "max", "large": "xhigh", "medium": "high", "small": "medium"}
BUDGET_PATTERN = re.compile(r"^# budget:\s*(\w+)\s*\((\w+)\)\s*$")


def model_values(value: str, location: str) -> list[str]:
    value = value.strip()
    if value.startswith(("[", '"')):
        decoded = json.loads(value)
        if isinstance(decoded, str):
            return [decoded]
        if isinstance(decoded, list) and all(isinstance(item, str) for item in decoded):
            return decoded
        raise ValueError(f"{location}: expected a model string or JSON string array")

    values = []
    start = 0
    depth = 0
    for index, char in enumerate(value):
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth < 0:
                raise ValueError(f"{location}: ambiguous selector; use JSON quoting")
        elif char == "," and depth == 0:
            values.append(value[start:index].strip())
            start = index + 1
    if depth:
        raise ValueError(f"{location}: ambiguous selector; use JSON quoting")
    values.append(value[start:].strip())
    return values


def read_preferences(path: Path) -> dict:
    try:
        contents = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return {"exists": False, "roles": {}, "budget": None, "warnings": []}

    roles = {}
    budget = None
    warnings = []
    for number, raw in enumerate(contents.splitlines(), 1):
        line = raw.strip()
        location = f"{path}:{number}"
        if line.startswith("# budget:"):
            match = BUDGET_PATTERN.fullmatch(line)
            if not match or BUDGETS.get(match[1]) != match[2]:
                raise ValueError(f"{location}: invalid budget")
            if budget is not None:
                raise ValueError(f"{location}: duplicate budget")
            budget = {"label": match[1], "effort": match[2]}
        elif re.match(r"^#\s*budget\s*:", line, re.IGNORECASE):
            warnings.append(
                f"{location}: malformed budget directive; ignored; use '# budget: LABEL (EFFORT)'"
            )
        elif not line or line.startswith("#"):
            continue
        else:
            role, separator, value = line.partition(":")
            role = role.strip()
            if not separator or not role:
                raise ValueError(f"{location}: expected role: model-id")
            if role not in ROLES:
                warnings.append(f"{location}: unknown role {role!r}")
                continue
            if role in roles:
                raise ValueError(f"{location}: duplicate role {role!r}")
            values = model_values(value, location)
            if not values or any(not item or any(c.isspace() for c in item) for item in values):
                raise ValueError(f"{location}: empty or malformed model value")
            if role not in PANEL_ROLES and (len(values) != 1 or value.strip().startswith("[")):
                raise ValueError(f"{location}: scalar role requires one model")
            roles[role] = values if role in PANEL_ROLES else values[0]
    return {"exists": True, "roles": roles, "budget": budget, "warnings": warnings}


def resolve(project_root: Path, home: Path) -> dict:
    root = project_root.expanduser().resolve()
    if not root.is_dir():
        raise ValueError(f"project root is not a directory: {root}")
    project_path = root / ".agents" / "pstack-models.md"
    global_path = home.expanduser().resolve() / ".agents" / "pstack-models.md"
    project = read_preferences(project_path)
    global_preferences = read_preferences(global_path)
    roles = {}
    sources = {}
    for role in ROLES:
        for preferences, path in ((project, project_path), (global_preferences, global_path)):
            if role in preferences["roles"]:
                roles[role] = preferences["roles"][role]
                sources[role] = str(path)
                break
    budget = project["budget"] or global_preferences["budget"]
    budget_source = (
        str(project_path) if project["budget"] else
        str(global_path) if global_preferences["budget"] else None
    )
    return {
        "project_root": str(root),
        "project_file": str(project_path),
        "global_file": str(global_path),
        "roles": roles,
        "sources": sources,
        "budget": budget,
        "budget_source": budget_source,
        "warnings": project["warnings"] + global_preferences["warnings"],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", required=True, type=Path)
    parser.add_argument("--home", type=Path, default=Path.home(),
                        help="home directory override for isolated tests")
    args = parser.parse_args()
    try:
        result = resolve(args.project_root, args.home)
    except (OSError, UnicodeError, ValueError) as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
