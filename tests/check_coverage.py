#!/usr/bin/env python3
"""check_coverage.py — showcase i18n/detail coverage gate.

Fetches every API list from a running server and asserts that each item's
English `name`:
  1. has a zh translation in web/src/i18n.ts (zhDict), and
  2. has a detail entry in web/src/content.ts (features/algorithms/apps/agent/
     bench all carry an expandable detail panel).

Usage: PORT=18793 python3 tests/check_coverage.py
Exit code 0 = covered, 1 = missing entries (drift: add the name to i18n.ts
and/or content.ts).

Run from the showcase root (web/src is read relative to this file).
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1] if len(sys.argv) > 1 else 18793)
BASE = f"http://127.0.0.1:{PORT}"

def get_list(ep: str) -> list:
    raw = urllib.request.urlopen(f"{BASE}/api/{ep}", timeout=5).read()
    return json.loads(json.loads(raw)["body"])

def keys_of(path: Path, pattern: re.Pattern) -> set:
    return set(pattern.findall(path.read_text(encoding="utf-8")))

def main() -> int:
    i18n = keys_of(ROOT / "web/src/i18n.ts",
                   re.compile(r"^  '([^']+)':\s*\{", re.M))
    i18n |= keys_of(ROOT / "web/src/i18n.ts",
                    re.compile(r"^  ([a-zA-Z][a-zA-Z0-9 ]*):\s*\{", re.M))
    content = keys_of(ROOT / "web/src/content.ts",
                      re.compile(r"^  '([^']+)': d\(", re.M))
    content |= keys_of(ROOT / "web/src/content.ts",
                       re.compile(r"^  ([a-zA-Z][a-zA-Z0-9 ]+): d\(", re.M))

    bad = []
    total = 0
    for ep in ("features", "algorithms", "apps", "agent", "bench"):
        for item in get_list(ep):
            total += 1
            n = item["name"]
            if n not in i18n:
                bad.append((ep, n, "zhDict"))
            if n not in content:
                bad.append((ep, n, "content.ts"))

    if bad:
        print(f"FAIL coverage: {len(bad)} missing across {total} items")
        for ep, n, where in bad:
            print(f"  {ep}: {n!r} missing in {where}")
        return 1

    print(f"ok   coverage: {total} items all have zhDict + content.ts detail")
    return 0

if __name__ == "__main__":
    sys.exit(main())
