#!/usr/bin/env python3
"""
Resolve cog metadata by cloning each listed repository and reading its pyproject.toml.
Writes resolved metadata to data/resolved.json.

Cogs whose pyproject.toml version has no matching git tag (i.e. no release has
been cut yet) are omitted from resolved.json until a release exists.
"""

import json
import sys
import tempfile
from pathlib import Path

from cog_utils import clone_and_read, get_release_ref

REPO_ROOT = Path(__file__).parent.parent
COGS_FILE = REPO_ROOT / "data" / "cogs.json"
RESOLVED_FILE = REPO_ROOT / "public" / "data" / "resolved.json"


def main() -> None:
    with open(COGS_FILE) as f:
        cogs_data = json.load(f)

    resolved = []

    for status in ("approved", "unapproved"):
        for entry in cogs_data.get(status, []):
            repo_url = entry["repo"]
            branch = entry.get("branch", "main")
            cog_id = entry["id"]
            print(f"Processing [{status}] {cog_id} ({repo_url}@{branch}) ...")

            with tempfile.TemporaryDirectory() as tmpdir:
                metadata = clone_and_read(repo_url, branch, tmpdir)

            if metadata is None:
                metadata = {}

            version = metadata.get("version", "")
            release_ref = get_release_ref(repo_url, version) if version else None
            if not release_ref:
                print(f"  SKIPPING {cog_id}: no release found for version {version!r}", file=sys.stderr)
                continue

            resolved.append({
                "id": cog_id,
                "status": status,
                "repo": repo_url,
                "branch": branch,
                "install_url": f"git+{repo_url}@{release_ref}",
                **metadata,
            })

    with open(RESOLVED_FILE, "w") as f:
        json.dump(resolved, f, indent=2)

    print(f"\nResolved {len(resolved)} cog(s) -> {RESOLVED_FILE}")


if __name__ == "__main__":
    main()
