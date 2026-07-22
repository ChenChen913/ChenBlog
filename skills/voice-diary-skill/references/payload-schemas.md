# Payload Schemas

All payload schemas enforced by diary_manager.py at runtime.
Use --validate flag to check a payload without writing data.

---

## Schema: add (diary entry)

Required fields and types:

  cleaned_content  string    Lightly cleaned dictation full text (AI-generated)
  summary          string    One-line summary, max 40 chars
  tags             array     Tag list, e.g. ["work-conflict", "emotion-anger"]
  emotions         array     Emotion words, e.g. ["anger", "grievance"]
  intensity        integer   Emotion intensity 1-5
  events           array     Key events, recommended max 3 items

Concrete example (save as a .json file and pass via --payload-file):

  {
    "cleaned_content": "Today in the meeting, that colleague targeted me again...",
    "summary": "Targeted by colleague, held back anger",
    "tags": ["work-conflict", "emotion-anger"],
    "emotions": ["anger", "grievance"],
    "intensity": 4,
    "events": ["colleague attacked my proposal", "held back anger", "still upset after work"]
  }

---

## Schema: add-chat (AI conversation)

Required fields:

  topic       string    Conversation topic
  tags        array     Tag list, must include "help-request"
  linked_raw  string    Raw entry ID this chat relates to, or "" if standalone
  turns       array     Conversation turns, each with "role" and "content"

Example:

  {
    "topic": "How to handle workplace conflict",
    "tags": ["work-conflict", "help-request"],
    "linked_raw": "raw:2026-03-02:001",
    "turns": [
      {"role": "user", "content": "What should I do?"},
      {"role": "ai",   "content": "First, stay calm..."}
    ]
  }

linked_raw rules:
- If this chat relates to a diary entry recorded today, set to its raw ID
- If standalone, set to "" (empty string, not null or missing)

---

## Schema: add-summary (period summary)

Required fields:

  overall_summary       string    100-150 char comprehensive description
  emotion_distribution  object    Emotion name to count mapping
  emotion_trend         string    Emotion trend description
  core_feeling          string    One-sentence core feeling

Example:

  {
    "overall_summary": "Heavy work pressure this month, one notable conflict, but mood improved in second half.",
    "emotion_distribution": {"anger": 3, "anxiety": 5, "happy": 8, "calm": 12},
    "emotion_trend": "Strong anger and anxiety early in the month, gradually calmed mid-month, mostly calm and happy by end.",
    "core_feeling": "Despite the conflict, overall stable with clear improvement in the second half."
  }

---

## Validation behavior

Validation failure (exit code 1):

  {"status": "error", "message": "Payload validation failed:\n  - Missing required field: 'summary'\n  - intensity must be an integer between 1 and 5"}

Dry-run success (--validate flag, no data written):

  {"status": "valid", "schema": "add", "message": "Payload is valid. No data written (dry-run)."}

The --validate flag applies to: add, add-chat, add-summary.
Read-only commands (list, search, stats, export-digests) do not need validation.
