# 数据架构

## 目录结构

```
<diary-root>/
  data/
    index.json                          全局索引，唯一，原子写入
    index.tmp.json                      写入时的临时文件（正常情况下不应存在）
    entries/
      YYYY/
        MM/
          raw_YYYY-MM-DD_NNN.json
          digest_YYYY-MM-DD_NNN.json
          chat_YYYY-MM-DD_NNN.json
    summaries/
      summary_YYYY-MM.json
      summary_YYYY.json
  readable/
    YYYY/
      MM/
        YYYY-MM-DD_NNN.md               口述全文，供文件管理器直接打开
    summaries/
      YYYY-MM_summary.md
  scripts/
    init_diary.py
    diary_manager.py
```

根目录默认为 `scripts/` 的上一级目录，可通过环境变量 `DIARY_DIR` 自定义。

---

## 主线 A：原始口述

### raw_YYYY-MM-DD_NNN.json

口述全文不存在此文件中，只存元数据和可读文件路径。

```json
{
  "id": "raw:2026-03-02:001",
  "date": "2026-03-02",
  "seq": "001",
  "timestamp": "2026-03-02T21:30:00+08:00",
  "tags": ["work-conflict", "emotion-anger"],
  "summary": "被同事针对，忍住了没发火",
  "readable_path": "readable/2026/03/2026-03-02_001.md"
}
```

### readable/YYYY/MM/YYYY-MM-DD_NNN.md

口述全文存在此 Markdown 文件中，可直接用任意文本编辑器或文件管理器打开阅读。

```
# 2026-03-02 -- 被同事针对，忍住了没发火

Time: 2026-03-02 21:30 (Beijing Time)
Tags: work-conflict / emotion-anger
Summary: 被同事针对，忍住了没发火

---

## Original Dictation

今天在公司开会，那个同事又针对我，说我做的方案有问题，
我当时就很气愤，然后忍住了没发火，但回家之后越想越生气。

---

Voice Diary - Original Archive - Unedited
```

---

## 主线 B：结构摘要

### digest_YYYY-MM-DD_NNN.json

```json
{
  "id": "digest:2026-03-02:001",
  "linked_raw": "raw:2026-03-02:001",
  "date": "2026-03-02",
  "timestamp": "2026-03-02T21:30:00+08:00",
  "emotions": ["anger", "grievance"],
  "intensity": 4,
  "events": ["同事在会上针对我", "忍住没发火"],
  "tags": ["work-conflict", "emotion-anger"],
  "keywords": ["职场冲突", "被针对"]
}
```

---

## 主线 C：AI 对话

### chat_YYYY-MM-DD_NNN.json

```json
{
  "id": "chat:2026-03-02:001",
  "linked_raw": "raw:2026-03-02:001",
  "date": "2026-03-02",
  "timestamp": "2026-03-02T22:05:00+08:00",
  "topic": "如何处理与同事的冲突",
  "tags": ["work-conflict", "help-request"],
  "turns": [
    { "role": "user", "content": "我该怎么办..." },
    { "role": "ai",   "content": "..." }
  ]
}
```

---

## 主线 D：阶段总结

### summary_YYYY-MM.json

```json
{
  "id": "summary:2026-03",
  "scope": "month",
  "period": "2026-03",
  "generated_at": "2026-03-31T23:00:00+08:00",
  "entry_count": 28,
  "emotion_distribution": { "anger": 6, "anxiety": 4, "happy": 8, "calm": 10 },
  "top_tags": ["work-stress", "emotion-anxiety"],
  "overall_summary": "...",
  "emotion_trend": "月初低落，中旬平稳，月末改善",
  "core_feeling": "...",
  "readable_path": "readable/summaries/2026-03_summary.md"
}
```

---

## 全局索引：data/index.json

```json
{
  "version": "1.0",
  "total_entries": 128,
  "last_updated": "2026-03-02T21:30:00+08:00",
  "date_index": {
    "2026-03": ["raw:2026-03-01:001", "digest:2026-03-01:001"]
  },
  "tag_index": {
    "work-conflict": ["raw:2026-03-02:001"]
  },
  "emotion_index": {
    "anger": ["digest:2026-03-02:001"]
  },
  "summary_index": {
    "2026-03": "summary:2026-03"
  }
}
```

## 原子写入规则

禁止直接覆盖 index.json。脚本内部统一使用 `atomic_write_json()`：
1. 序列化新内容写入 index.tmp.json
2. `os.replace(tmp, index_path)` 原子替换
3. 脚本完成后 tmp 文件不再存在

## 存储规模估算（两年使用）

| 类型           | 单条   | 两年总量  |
|--------------|--------|---------|
| raw JSON     | ~300B  | ~220KB  |
| Markdown     | ~1KB   | ~730KB  |
| digest JSON  | ~300B  | ~220KB  |
| chat JSON    | ~2KB   | 按需     |
| summary      | ~2KB   | ~50KB   |
| index.json   | 动态    | ~200KB  |
| 合计          |        | < 2MB   |
