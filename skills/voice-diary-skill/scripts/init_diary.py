"""
Voice Diary - init_diary.py
One-time initialization: creates directory structure and empty index.json.
No third-party dependencies. Works on Windows, macOS, Linux.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

BEIJING_TZ = timezone(timedelta(hours=8))

DIRS = [
    "data/entries",
    "data/summaries",
    "readable",
    "readable/summaries",
]

EMPTY_INDEX = {
    "version": "1.0",
    "total_entries": 0,
    "last_updated": "",
    "date_index": {},
    "tag_index": {},
    "emotion_index": {},
    "summary_index": {}
}


def beijing_now_str():
    return datetime.now(BEIJING_TZ).strftime("%Y-%m-%dT%H:%M:%S+08:00")


def atomic_write(path, data):
    path = Path(path)
    tmp = Path(str(path) + ".tmp")
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(str(tmp), str(path))


def main():
    parser = argparse.ArgumentParser(description="Voice Diary - initialization.")
    parser.add_argument("--dir", default=None, help="Diary root directory.")
    args = parser.parse_args()

    root = Path(args.dir).resolve() if args.dir else Path(__file__).resolve().parent.parent

    if not root.exists():
        print("Error: directory does not exist: {}".format(root))
        sys.exit(1)

    print("Initializing Voice Diary at: {}".format(root))

    for d in DIRS:
        target = root / d
        target.mkdir(parents=True, exist_ok=True)
        print("  [ok] {}".format(d))

    index_path = root / "data" / "index.json"
    if index_path.exists():
        print("  [skip] index.json already exists")
    else:
        idx = dict(EMPTY_INDEX)
        idx["last_updated"] = beijing_now_str()
        atomic_write(index_path, idx)
        print("  [ok] data/index.json created")

    print("")
    print("Done. Next step:")
    print("  python scripts/diary_manager.py add --payload '{...}'")


if __name__ == "__main__":
    main()
