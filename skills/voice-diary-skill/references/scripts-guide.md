# 脚本接口说明

## 设计原则

diary_manager.py 是纯 IO 工具：接收 AI 生成的完整 JSON payload，完成所有
文件读写和索引更新，返回结构化结果。AI 只需一次脚本调用完成整个记录操作。
脚本内部自动获取北京时间，AI 无需提前执行任何时间命令。

---

## 初始化（首次使用，运行一次）

```bash
python scripts/init_diary.py
python scripts/init_diary.py --dir /path/to/diary
```

---

## Payload 输入方式（三种，推荐优先级从高到低）

### 方式一：文件传入（最稳定，Agent 首选）

Agent 先将 payload 写入临时文件，再让脚本读取，完全避开 Shell 转义问题：

```bash
# 1. 写临时文件（Agent 执行）
# 2. 调用脚本读取文件
python scripts/diary_manager.py add --payload-file /tmp/diary_payload.json
```

### 方式二：标准输入（管道友好）

```bash
echo '{"cleaned_content":"..."}' | python scripts/diary_manager.py add --payload -
cat payload.json | python scripts/diary_manager.py add --payload -
```

### 方式三：内联字符串（仅适用于简单内容）

```bash
python scripts/diary_manager.py add --payload '{"cleaned_content":"..."}'
```

注意：内联方式在 PowerShell 中容易因引号转义出错，不推荐在 Agent 中使用。

---

## --validate 预验证（dry-run，不写盘）

在正式写入前验证 payload 格式是否正确：

```bash
python scripts/diary_manager.py add --payload-file payload.json --validate
```

返回示例（验证通过）：
```json
{
  "status": "valid",
  "schema": "add",
  "message": "Payload is valid. No data written (dry-run)."
}
```

返回示例（验证失败）：
```json
{
  "status": "error",
  "message": "Payload validation failed:\n  - Missing required field: 'summary'\n  - intensity must be an integer between 1 and 5"
}
```

---

## add 命令：添加口述记录

payload 字段（详见 references/payload-schemas.md）：

| 字段              | 类型    | 说明                          |
|-----------------|-------|-------------------------------|
| cleaned_content | string | 轻度清洗后的口述全文（AI 生成）    |
| summary         | string | 一句话概括，不超过 40 字          |
| tags            | array  | 标签列表，如 ["work-conflict"]  |
| emotions        | array  | 情绪词，如 ["愤怒", "委屈"]       |
| intensity       | int    | 情绪强度 1-5                    |
| events          | array  | 核心事件，最多 3 条              |

返回：
```json
{
  "status": "ok",
  "raw_id": "raw:2026-03-02:001",
  "digest_id": "digest:2026-03-02:001",
  "readable_path": "readable/2026/03/2026-03-02_001.md",
  "timestamp": "2026-03-02T21:30:00+08:00"
}
```

---

## add-chat 命令：保存 AI 对话

payload 字段：

| 字段         | 类型   | 说明                            |
|------------|------|-------------------------------|
| topic      | string | 对话主题                        |
| tags       | array  | 标签列表                        |
| linked_raw | string | 关联的 raw 条目 ID，无则传 ""     |
| turns      | array  | 对话轮次，每条含 role 和 content  |

---

## export-digests 命令：导出摘要（用于生成总结）

```bash
python scripts/diary_manager.py export-digests --month 2026-03
python scripts/diary_manager.py export-digests --year 2026
```

---

## add-summary 命令：保存阶段总结

```bash
python scripts/diary_manager.py add-summary --scope 2026-03 --payload-file summary_payload.json
```

payload 字段：overall_summary, emotion_distribution, emotion_trend, core_feeling

---

## list / search / stats 命令

```bash
python scripts/diary_manager.py list --date 2026-03-02
python scripts/diary_manager.py list --month 2026-03
python scripts/diary_manager.py search --tag work-conflict
python scripts/diary_manager.py search --keyword "会议"
python scripts/diary_manager.py stats
```

stats 命令会在返回结果中包含 diary_root 字段，方便确认当前使用的数据目录。

---

## 根目录解析优先级

脚本按以下顺序确定日记根目录：

1. 环境变量 DIARY_DIR（最高优先级）
2. 从脚本所在目录向上查找 config.json，读取其中 diary_dir 字段
3. 从脚本所在目录向上查找 .git 或 .trae 目录，将其所在目录作为根目录
4. 脚本所在目录的上一级（兜底）

config.json 示例：
```json
{
  "diary_dir": "/Users/me/my-diary"
}
```

也可以用相对路径（相对于 config.json 所在目录）：
```json
{
  "diary_dir": "./diary-data"
}
```

---

## 环境变量

| 变量名      | 说明       |
|----------|----------|
| DIARY_DIR | 日记根目录路径 |

Windows PowerShell：
```powershell
$env:DIARY_DIR = "D:\MyDiary"
```

macOS / Linux：
```bash
export DIARY_DIR=/Users/me/diary
```
