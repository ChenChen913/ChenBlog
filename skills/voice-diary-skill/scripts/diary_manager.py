"""
Voice Diary - diary_manager.py
IO tool for voice diary. Receives AI-generated analysis as JSON payload,
handles all file writes and index updates atomically.
No third-party dependencies. Works on Windows, macOS, Linux.
No emoji in any output.

Payload input priority (for all commands that accept a payload):
  1. --payload-file <path>   Read from a JSON file (recommended for agents)
  2. --payload -             Read from stdin (pipe-friendly)
  3. --payload '<json>'      Inline string (simple cases only)
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

BEIJING_TZ = timezone(timedelta(hours=8))

# ---------------------------------------------------------------------------
# Payload schemas (used by validate_payload)
# ---------------------------------------------------------------------------

SCHEMAS = {
    "add": {
        "required": {
            "cleaned_content": str,
            "summary":         str,
            "tags":            list,
            "emotions":        list,
            "intensity":       (int, float),
            "events":          list,
        },
        "optional": {},
        "constraints": {
            "intensity": lambda v: 1 <= int(v) <= 5,
            "summary":   lambda v: len(v) <= 40,
        },
        "constraint_messages": {
            "intensity": "intensity must be an integer between 1 and 5",
            "summary":   "summary must be 40 characters or fewer",
        },
    },
    "add-chat": {
        "required": {
            "topic":      str,
            "tags":       list,
            "linked_raw": str,
            "turns":      list,
        },
        "optional": {},
        "constraints": {},
        "constraint_messages": {},
    },
    "add-summary": {
        "required": {
            "overall_summary":      str,
            "emotion_distribution": dict,
            "emotion_trend":        str,
            "core_feeling":         str,
        },
        "optional": {},
        "constraints": {},
        "constraint_messages": {},
    },
}

# ---------------------------------------------------------------------------
# Time helpers
# ---------------------------------------------------------------------------

def beijing_now():
    return datetime.now(BEIJING_TZ)

def beijing_now_str():
    return beijing_now().strftime("%Y-%m-%dT%H:%M:%S+08:00")

# ---------------------------------------------------------------------------
# Root directory resolution (three-tier priority)
# ---------------------------------------------------------------------------

def find_anchor_upward(start, markers):
    """Walk up from start, return first directory containing any marker file/dir."""
    current = Path(start).resolve()
    for _ in range(20):
        for marker in markers:
            if (current / marker).exists():
                return current
        parent = current.parent
        if parent == current:
            break
        current = parent
    return None

def get_root():
    # Priority 1: environment variable
    env = os.environ.get("DIARY_DIR")
    if env:
        return Path(env).resolve()

    # Priority 2: config.json found by walking up from the script location
    anchor = find_anchor_upward(Path(__file__).parent, ["config.json"])
    if anchor:
        cfg_path = anchor / "config.json"
        try:
            with open(cfg_path, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            diary_dir = cfg.get("diary_dir", "")
            if diary_dir:
                p = Path(diary_dir)
                if not p.is_absolute():
                    p = (anchor / p).resolve()
                return p.resolve()
        except (json.JSONDecodeError, OSError):
            pass

    # Priority 3: walk up to find project root anchor (.git or .trae)
    anchor = find_anchor_upward(Path(__file__).parent, [".git", ".trae"])
    if anchor:
        return anchor

    # Fallback: parent of the scripts/ directory
    return Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Payload loading (file > stdin > inline string)
# ---------------------------------------------------------------------------

def load_payload(args):
    """
    Unified payload loader. Priority:
      1. --payload-file <path>
      2. --payload - (read stdin)
      3. --payload '<json string>'
    Returns parsed dict or calls err() on failure.
    """
    raw = getattr(args, "payload", "") or ""
    pf  = getattr(args, "payload_file", "") or ""

    if pf:
        pf_path = Path(pf)
        if not pf_path.exists():
            err("payload file not found: {}".format(pf))
        try:
            with open(pf_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            err("payload file JSON parse error: {}".format(e))

    if raw == "-":
        try:
            return json.load(sys.stdin)
        except json.JSONDecodeError as e:
            err("stdin JSON parse error: {}".format(e))

    if raw:
        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            err("inline payload JSON parse error: {}".format(e))

    err("No payload provided. Use --payload-file, --payload -, or --payload '<json>'.")

# ---------------------------------------------------------------------------
# Payload validation
# ---------------------------------------------------------------------------

def validate_payload(payload, schema_name):
    """
    Validate payload against the named schema.
    Returns list of error strings (empty = valid).
    """
    if schema_name not in SCHEMAS:
        return ["Unknown schema: {}".format(schema_name)]

    schema = SCHEMAS[schema_name]
    errors = []

    for field, expected_type in schema["required"].items():
        if field not in payload:
            errors.append("Missing required field: '{}'".format(field))
            continue
        if not isinstance(payload[field], expected_type):
            errors.append(
                "Field '{}' must be {} (got {})".format(
                    field,
                    expected_type.__name__ if not isinstance(expected_type, tuple)
                    else "/".join(t.__name__ for t in expected_type),
                    type(payload[field]).__name__,
                )
            )

    for field, constraint in schema.get("constraints", {}).items():
        if field in payload:
            try:
                if not constraint(payload[field]):
                    msg = schema["constraint_messages"].get(field, "Constraint failed for '{}'".format(field))
                    errors.append(msg)
            except Exception as e:
                errors.append("Constraint error for '{}': {}".format(field, e))

    return errors

# ---------------------------------------------------------------------------
# Path helpers
# ---------------------------------------------------------------------------

def index_path(root):
    return root / "data" / "index.json"

def entry_dir(root, date_str):
    y, m, _ = date_str.split("-")
    return root / "data" / "entries" / y / m

def readable_dir(root, date_str):
    y, m, _ = date_str.split("-")
    return root / "readable" / y / m

# ---------------------------------------------------------------------------
# IO helpers
# ---------------------------------------------------------------------------

def atomic_write(path, data):
    path = Path(path)
    tmp  = Path(str(path) + ".tmp")
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(str(tmp), str(path))

def write_text(path, text):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

def out(data):
    print(json.dumps(data, ensure_ascii=False, indent=2))

def err(msg):
    print(json.dumps({"status": "error", "message": msg}, ensure_ascii=False))
    sys.exit(1)

# ---------------------------------------------------------------------------
# Index operations
# ---------------------------------------------------------------------------

def load_index(root):
    p = index_path(root)
    if not p.exists():
        err("index.json not found at {}. Run init_diary.py first.".format(p))
    with open(p, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError as e:
            err("index.json parse error: {}. Check if index.tmp.json exists for recovery.".format(e))

def save_index(root, idx):
    atomic_write(index_path(root), idx)

def index_append(idx, entry_id, date_str, tags, emotions=None):
    ym = date_str[:7]
    idx.setdefault("date_index", {}).setdefault(ym, [])
    if entry_id not in idx["date_index"][ym]:
        idx["date_index"][ym].append(entry_id)
    for tag in (tags or []):
        idx.setdefault("tag_index", {}).setdefault(tag, [])
        if entry_id not in idx["tag_index"][tag]:
            idx["tag_index"][tag].append(entry_id)
    if emotions:
        for emo in emotions:
            idx.setdefault("emotion_index", {}).setdefault(emo, [])
            if entry_id not in idx["emotion_index"][emo]:
                idx["emotion_index"][emo].append(entry_id)
    idx["total_entries"] = idx.get("total_entries", 0) + 1
    idx["last_updated"]  = beijing_now_str()
    return idx

def next_seq(idx, entry_type, date_str):
    ym     = date_str[:7]
    prefix = "{}:{}:".format(entry_type, date_str)
    existing = [e for e in idx.get("date_index", {}).get(ym, []) if e.startswith(prefix)]
    return str(len(existing) + 1).zfill(3)

# ---------------------------------------------------------------------------
# Markdown builders
# ---------------------------------------------------------------------------

def build_entry_md(date_str, timestamp, summary, tags, cleaned_content):
    time_display = timestamp[:16].replace("T", " ") + " (Beijing Time)"
    tag_line     = " / ".join(tags) if tags else "(none)"
    return "\n".join([
        "# {} -- {}".format(date_str, summary),
        "",
        "Time: {}".format(time_display),
        "Tags: {}".format(tag_line),
        "Summary: {}".format(summary),
        "",
        "---",
        "",
        "## Original Dictation",
        "",
        cleaned_content,
        "",
        "---",
        "",
        "Voice Diary - Original Archive - Unedited",
    ])

def build_summary_md(scope, generated_at, entry_count, emotion_dist, overall, trend, core):
    time_display = generated_at[:16].replace("T", " ") + " (Beijing Time)"
    lines = [
        "# {} Summary".format(scope),
        "",
        "Generated: {}".format(time_display),
        "Entries: {}".format(entry_count),
        "",
        "---",
        "",
        "## Emotion Distribution",
        "",
    ]
    for emo, count in emotion_dist.items():
        lines.append("  {}: {}".format(emo, count))
    lines += [
        "",
        "## Emotion Trend",
        "",
        trend,
        "",
        "## Overall",
        "",
        overall,
        "",
        "## Core Feeling",
        "",
        core,
        "",
        "---",
        "",
        "Voice Diary - Period Summary",
    ]
    return "\n".join(lines)

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_add(args):
    root    = get_root()
    payload = load_payload(args)

    errors = validate_payload(payload, "add")
    if errors:
        err("Payload validation failed:\n" + "\n".join("  - " + e for e in errors))

    if getattr(args, "validate", False):
        out({"status": "valid", "schema": "add", "message": "Payload is valid. No data written (dry-run)."})
        return

    cleaned   = payload["cleaned_content"]
    summary   = payload["summary"]
    tags      = payload["tags"]
    emotions  = payload["emotions"]
    intensity = int(payload["intensity"])
    events    = payload["events"]

    now_str  = beijing_now_str()
    date_str = now_str[:10]

    idx     = load_index(root)
    raw_seq = next_seq(idx, "raw", date_str)
    raw_id     = "raw:{}:{}".format(date_str, raw_seq)
    digest_id  = "digest:{}:{}".format(date_str, raw_seq)

    md_filename  = "{}_{}.md".format(date_str, raw_seq)
    readable_rel = "readable/{}/{}/{}".format(date_str[:4], date_str[5:7], md_filename)

    write_text(
        readable_dir(root, date_str) / md_filename,
        build_entry_md(date_str, now_str, summary, tags, cleaned),
    )

    ed = entry_dir(root, date_str)
    atomic_write(ed / "raw_{}_{}.json".format(date_str, raw_seq), {
        "id":            raw_id,
        "date":          date_str,
        "seq":           raw_seq,
        "timestamp":     now_str,
        "tags":          tags,
        "summary":       summary,
        "readable_path": readable_rel,
    })
    atomic_write(ed / "digest_{}_{}.json".format(date_str, raw_seq), {
        "id":          digest_id,
        "linked_raw":  raw_id,
        "date":        date_str,
        "timestamp":   now_str,
        "emotions":    emotions,
        "intensity":   intensity,
        "events":      events,
        "tags":        tags,
        "keywords":    [],
    })

    idx = index_append(idx, raw_id,    date_str, tags)
    idx = index_append(idx, digest_id, date_str, tags, emotions)
    save_index(root, idx)

    out({
        "status":        "ok",
        "raw_id":        raw_id,
        "digest_id":     digest_id,
        "timestamp":     now_str,
        "readable_path": readable_rel,
        "summary":       summary,
        "tags":          tags,
        "emotions":      emotions,
        "intensity":     intensity,
        "events":        events,
    })


def cmd_add_chat(args):
    root    = get_root()
    payload = load_payload(args)

    errors = validate_payload(payload, "add-chat")
    if errors:
        err("Payload validation failed:\n" + "\n".join("  - " + e for e in errors))

    if getattr(args, "validate", False):
        out({"status": "valid", "schema": "add-chat", "message": "Payload is valid. No data written (dry-run)."})
        return

    topic      = payload.get("topic", "")
    tags       = payload.get("tags", ["help-request"])
    linked_raw = payload.get("linked_raw", "")
    turns      = payload.get("turns", [])

    now_str  = beijing_now_str()
    date_str = now_str[:10]

    idx     = load_index(root)
    seq     = next_seq(idx, "chat", date_str)
    chat_id = "chat:{}:{}".format(date_str, seq)

    ed = entry_dir(root, date_str)
    atomic_write(ed / "chat_{}_{}.json".format(date_str, seq), {
        "id":          chat_id,
        "linked_raw":  linked_raw,
        "date":        date_str,
        "timestamp":   now_str,
        "topic":       topic,
        "tags":        tags,
        "turns":       turns,
    })

    idx = index_append(idx, chat_id, date_str, tags)
    save_index(root, idx)

    out({"status": "ok", "chat_id": chat_id, "timestamp": now_str})


def cmd_export_digests(args):
    root = get_root()
    idx  = load_index(root)

    if args.month:
        months = [args.month]
    elif args.year:
        months = ["{}-{:02d}".format(args.year, m) for m in range(1, 13)]
    else:
        err("Specify --month YYYY-MM or --year YYYY")

    results = []
    for ym in months:
        ids = [e for e in idx.get("date_index", {}).get(ym, []) if e.startswith("digest:")]
        for d_id in ids:
            parts  = d_id.split(":")
            date_s = parts[1]
            seq    = parts[2]
            y, m, _ = date_s.split("-")
            p = root / "data" / "entries" / y / m / "digest_{}_{}.json".format(date_s, seq)
            if p.exists():
                with open(p, "r", encoding="utf-8") as f:
                    results.append(json.load(f))

    out({"status": "ok", "count": len(results), "digests": results})


def cmd_add_summary(args):
    root    = get_root()
    payload = load_payload(args)

    errors = validate_payload(payload, "add-summary")
    if errors:
        err("Payload validation failed:\n" + "\n".join("  - " + e for e in errors))

    if getattr(args, "validate", False):
        out({"status": "valid", "schema": "add-summary", "message": "Payload is valid. No data written (dry-run)."})
        return

    scope         = args.scope
    now_str       = beijing_now_str()
    overall       = payload["overall_summary"]
    emotion_dist  = payload["emotion_distribution"]
    emotion_trend = payload["emotion_trend"]
    core_feeling  = payload["core_feeling"]

    idx    = load_index(root)
    months = [scope] if len(scope) == 7 else ["{}-{:02d}".format(scope, m) for m in range(1, 13)]
    count  = sum(
        len([e for e in idx.get("date_index", {}).get(ym, []) if e.startswith("raw:")])
        for ym in months
    )

    summary_data = {
        "id":                   "summary:{}".format(scope),
        "scope":                "month" if len(scope) == 7 else "year",
        "period":               scope,
        "generated_at":         now_str,
        "entry_count":          count,
        "emotion_distribution": emotion_dist,
        "overall_summary":      overall,
        "emotion_trend":        emotion_trend,
        "core_feeling":         core_feeling,
        "readable_path":        "readable/summaries/{}_summary.md".format(scope),
    }

    atomic_write(root / "data" / "summaries" / "summary_{}.json".format(scope), summary_data)
    write_text(
        root / "readable" / "summaries" / "{}_summary.md".format(scope),
        build_summary_md(scope, now_str, count, emotion_dist, overall, emotion_trend, core_feeling),
    )

    idx.setdefault("summary_index", {})[scope] = "summary:{}".format(scope)
    idx["last_updated"] = now_str
    save_index(root, idx)

    out({"status": "ok", "summary_id": "summary:{}".format(scope), "readable_path": summary_data["readable_path"]})


def cmd_list(args):
    root = get_root()
    idx  = load_index(root)

    if args.date:
        ym  = args.date[:7]
        ids = [e for e in idx.get("date_index", {}).get(ym, []) if e.startswith("raw:{}:".format(args.date))]
        label = args.date
    elif args.month:
        ids   = [e for e in idx.get("date_index", {}).get(args.month, []) if e.startswith("raw:")]
        label = args.month
    else:
        err("Specify --date YYYY-MM-DD or --month YYYY-MM")

    entries = []
    for e_id in sorted(ids):
        parts  = e_id.split(":")
        date_s = parts[1]
        seq    = parts[2]
        y, m, _ = date_s.split("-")
        p = root / "data" / "entries" / y / m / "raw_{}_{}.json".format(date_s, seq)
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                entries.append(json.load(f))

    out({"status": "ok", "label": label, "count": len(entries), "entries": entries})


def cmd_search(args):
    root = get_root()
    idx  = load_index(root)

    results = []

    if args.tag:
        ids = [e for e in idx.get("tag_index", {}).get(args.tag, []) if e.startswith("raw:")]
        for e_id in ids:
            parts  = e_id.split(":")
            date_s = parts[1]
            seq    = parts[2]
            y, m, _ = date_s.split("-")
            p = root / "data" / "entries" / y / m / "raw_{}_{}.json".format(date_s, seq)
            if p.exists():
                with open(p, "r", encoding="utf-8") as f:
                    results.append(json.load(f))

    elif args.keyword:
        kw = args.keyword.lower()
        for ym, month_ids in idx.get("date_index", {}).items():
            for e_id in [e for e in month_ids if e.startswith("raw:")]:
                parts  = e_id.split(":")
                date_s = parts[1]
                seq    = parts[2]
                y, m, _ = date_s.split("-")
                raw_p = root / "data" / "entries" / y / m / "raw_{}_{}.json".format(date_s, seq)
                if not raw_p.exists():
                    continue
                with open(raw_p, "r", encoding="utf-8") as f:
                    raw_data = json.load(f)
                search_text = raw_data.get("summary", "")
                rp = raw_data.get("readable_path", "")
                if rp:
                    md_p = root / rp
                    if md_p.exists():
                        with open(md_p, "r", encoding="utf-8") as f:
                            search_text += " " + f.read()
                if kw in search_text.lower():
                    results.append(raw_data)
    else:
        err("Specify --tag TAG or --keyword KEYWORD")

    out({"status": "ok", "count": len(results),
         "entries": sorted(results, key=lambda x: x.get("id", ""), reverse=True)})


def cmd_stats(args):
    root = get_root()
    idx  = load_index(root)

    tag_counts_raw = {}
    for tag, ids in idx.get("tag_index", {}).items():
        c = sum(1 for i in ids if i.startswith("raw:"))
        if c > 0:
            tag_counts_raw[tag] = c
    top_tags = sorted(tag_counts_raw.items(), key=lambda x: x[1], reverse=True)[:5]

    out({
        "status":        "ok",
        "total_entries": idx.get("total_entries", 0),
        "last_updated":  idx.get("last_updated", ""),
        "diary_root":    str(get_root()),
        "summaries":     list(idx.get("summary_index", {}).keys()),
        "top_tags":      [{"tag": t, "count": c} for t, c in top_tags],
    })


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def add_payload_args(p):
    """Add the three payload input methods to a subparser."""
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--payload-file", metavar="PATH",
                   help="Read payload from a JSON file (recommended for agents).")
    g.add_argument("--payload",      metavar="JSON_OR_DASH",
                   help="Inline JSON string, or '-' to read from stdin.")
    p.add_argument("--validate", action="store_true",
                   help="Validate payload without writing any data (dry-run).")


def main():
    parser = argparse.ArgumentParser(description="Voice Diary - IO manager.")
    sub    = parser.add_subparsers(dest="command")

    p_add = sub.add_parser("add", help="Save a diary entry.")
    add_payload_args(p_add)

    p_chat = sub.add_parser("add-chat", help="Save an AI conversation.")
    add_payload_args(p_chat)

    p_exp = sub.add_parser("export-digests", help="Export digests for summary generation.")
    p_exp.add_argument("--month", default="")
    p_exp.add_argument("--year",  default="")

    p_sum = sub.add_parser("add-summary", help="Save a period summary.")
    p_sum.add_argument("--scope", required=True, help="YYYY-MM or YYYY")
    add_payload_args(p_sum)

    p_list = sub.add_parser("list", help="List entries.")
    p_list.add_argument("--date",  default="")
    p_list.add_argument("--month", default="")

    p_search = sub.add_parser("search", help="Search entries.")
    p_search.add_argument("--tag",     default="")
    p_search.add_argument("--keyword", default="")

    sub.add_parser("stats", help="Show statistics.")

    args = parser.parse_args()

    dispatch = {
        "add":             cmd_add,
        "add-chat":        cmd_add_chat,
        "export-digests":  cmd_export_digests,
        "add-summary":     cmd_add_summary,
        "list":            cmd_list,
        "search":          cmd_search,
        "stats":           cmd_stats,
    }

    if args.command in dispatch:
        dispatch[args.command](args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
