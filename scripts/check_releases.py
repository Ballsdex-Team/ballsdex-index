#!/usr/bin/env python3
"""
Check that every cog in data/cogs.json has a tagged release matching its
pyproject.toml version. Used by the PR validation workflow to warn
contributors when a cog's declared version has no corresponding release.

Prints one line per cog missing a release and exits non-zero if any are found,
so the workflow can decide whether to post a PR comment.
"""

import json
import sys
import tempfile
from pathlib import Path

from cog_utils import clone_and_read, get_release_ref

REPO_ROOT = Path(__file__).parent.parent
COGS_FILE = REPO_ROOT / "data" / "cogs.json"


def main() -> None:
    with open(COGS_FILE) as f:
        cogs_data = json.load(f)

    missing = []

    for status in ("approved", "unapproved"):
        for entry in cogs_data.get(status, []):
            repo_url = entry["repo"]
            branch = entry.get("branch", "main")
            cog_id = entry["id"]
            print(f"Checking [{status}] {cog_id} ({repo_url}@{branch}) ...")

            with tempfile.TemporaryDirectory() as tmpdir:
                metadata = clone_and_read(repo_url, branch, tmpdir)

            version = (metadata or {}).get("version", "")
            release_ref = get_release_ref(repo_url, version) if version else None
            if not release_ref:
                missing.append((cog_id, repo_url, version))

    if missing:
        print("\nCogs with no matching release:")
        for cog_id, repo_url, version in missing:
            print(f"- {cog_id} ({repo_url}): version {version or '(unknown)'} has no release")

    output_path = sys.argv[1] if len(sys.argv) > 1 else None
    if output_path:
        with open(output_path, "w") as f:
            for cog_id, repo_url, version in missing:
                f.write(f"- **{cog_id}** (`{repo_url}`): version `{version or '(unknown)'}` has no matching release\n")

    sys.exit(1 if missing else 0)


if __name__ == "__main__":
    main()
