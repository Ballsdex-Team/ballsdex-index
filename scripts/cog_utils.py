"""Shared helpers for cloning cog repos and checking for tagged releases."""

import os
import subprocess
import sys
from pathlib import Path

try:
    import tomllib
except ModuleNotFoundError:
    # Python < 3.11
    try:
        import tomli as tomllib  # type: ignore
    except ModuleNotFoundError:
        print("ERROR: tomli is required on Python < 3.11. Install it with: pip install tomli", file=sys.stderr)
        sys.exit(1)


def get_release_ref(repo_url: str, version: str) -> str | None:
    """Return the tag name if a release tag exists for the given version, else None."""
    if not version:
        return None
    for tag in (f"v{version}", version):
        result = subprocess.run(
            ["git", "ls-remote", "--tags", repo_url, tag],
            capture_output=True,
            text=True,
        )
        if result.returncode == 0 and result.stdout.strip():
            return tag
    return None


def clone_and_read(repo_url: str, branch: str, tmpdir: str) -> dict | None:
    """Clone repo_url@branch into tmpdir and return its pyproject.toml [project] table."""
    dest = os.path.join(tmpdir, "repo")
    result = subprocess.run(
        ["git", "clone", "--depth", "1", "--branch", branch, repo_url, dest],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"  WARNING: Failed to clone {repo_url}@{branch}: {result.stderr.strip()}", file=sys.stderr)
        return None

    pyproject_path = Path(dest) / "pyproject.toml"
    if not pyproject_path.exists():
        print(f"  WARNING: No pyproject.toml found in {repo_url}", file=sys.stderr)
        return None

    with open(pyproject_path, "rb") as f:
        data = tomllib.load(f)

    project = data.get("project", {})
    return {
        "name": project.get("name", ""),
        "version": project.get("version", ""),
        "description": project.get("description", ""),
        "license": project.get("license", ""),
        "authors": project.get("authors", []),
        "urls": project.get("urls", {}),
        "dependencies": project.get("dependencies", []),
    }
