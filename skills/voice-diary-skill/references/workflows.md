# 操作流程

## 流程 1：记录口述（主线 A + B）

### 触发条件
用户粘贴口语化文字，或说"帮我记日记"。

### 执行步骤（AI 全程静默，不打断用户）

**第一步：AI 分析内容**

AI 在内部完成以下分析，不向用户展示中间过程：

- cleaned_content：去掉重复填充词（如"然后然后然后"→"然后"），其余原样保留，包括粗口和口语语气
- summary：一句话概括，不超过 20 字
- tags：从 tag-system.md 选择，可多选，可自创，格式如 work-conflict
- emotions：情绪词列表，中文，如：愤怒、委屈、焦虑
- intensity：1 到 5 的整数
- events：核心事件列表，最多 3 条，每条不超过 15 字

**第二步：调用脚本（一次调用，完成所有 IO）**

将分析结果构造为 JSON payload，调用：

```bash
python scripts/diary_manager.py add --payload '{"cleaned_content":"...","summary":"...","tags":[...],"emotions":[...],"intensity":3,"events":[...]}'
```

脚本内部自动完成：
- 获取当前北京时间
- 生成文件路径和序号
- 写入 Markdown 可读文件
- 写入 raw JSON（不含口述全文，只存路径）
- 写入 digest JSON
- 原子更新 index.json
- 返回存档确认信息

**第三步：展示结果**

将脚本的输出原样展示给用户（见 SKILL.md 展示格式），然后执行收尾协议。

### 注意事项
- AI 不得在调用脚本前向用户确认分析结果
- AI 不得自己拼文件路径或操作文件
- 脚本调用失败时，AI 展示错误信息，并保留用户原始口述内容供重试

---

## 流程 2：AI 求助对话（主线 C）

### 触发条件
用户问"怎么办"、"有什么建议"、"帮我想想"。

### 执行步骤

1. AI 正常与用户对话，解决问题，同时在内部积累对话记录（turns 数组）
2. 当用户说"好了"、"谢谢"、"明白了"，AI 询问一次：
   "要把这段对话存入日记吗？"
3. 用户确认后，调用脚本：

```bash
python scripts/diary_manager.py add-chat --payload '{"topic":"...","tags":[...],"linked_raw":"raw:YYYY-MM-DD:NNN","turns":[{"role":"user","content":"..."},{"role":"ai","content":"..."}]}'
```

linked_raw 填当日已有的 raw 条目 ID（如有），否则传空字符串 ""。

4. 脚本返回存档路径，AI 告知用户，进入收尾协议。

---

## 流程 3：检索与回看

### 触发条件
用户说"查看"、"回顾"、"搜索"、"我上次说过"。

### 执行步骤

根据用户意图选择命令：

按日期：
```bash
python scripts/diary_manager.py list --date 2026-03-02
python scripts/diary_manager.py list --month 2026-03
```

按标签：
```bash
python scripts/diary_manager.py search --tag work-conflict
```

按关键词（全文检索 Markdown）：
```bash
python scripts/diary_manager.py search --keyword "会议"
```

脚本返回结果列表，AI 格式化后展示：

  [YYYY-MM-DD] 情绪强度 N/5   摘要内容
  标签：tag1 / tag2
  文件：readable/YYYY/MM/YYYY-MM-DD_NNN.md

---

## 流程 4：生成阶段总结（主线 D）

### 触发条件
用户说"总结近X周/月/年"、"帮我回顾一下"。

### 执行步骤

**第一步：读取 digest 数据**

```bash
python scripts/diary_manager.py export-digests --month 2026-03
```

脚本返回该时间段所有 digest 条目的 JSON 列表。

**第二步：AI 生成总结**

使用以下 prompt（内部执行，不向用户展示）：

  以下是用户 {start} 到 {end} 的日记摘要，共 {N} 条：

  {每条格式：[日期] 情绪:{emotions}({intensity}/5) 事件:{events}}

  请生成阶段性总结，包含：
  1. 情绪分布统计（各情绪出现次数）
  2. 主要事件梳理（按工作/人际/生活/其他分类，每类 2-3 句）
  3. 情绪趋势描述（100-150 字，描述情绪起伏走向）
  4. 一句话核心感受

  要求：中文，语气温和，客观陈述，不做评价，不提建议，不含 emoji。

**第三步：存储总结**

```bash
python scripts/diary_manager.py add-summary --scope 2026-03 --payload '{"overall_summary":"...","emotion_distribution":{...},"emotion_trend":"...","core_feeling":"..."}'
```

脚本写入 JSON 和 Markdown 两份文件，原子更新索引。

**第四步：展示总结内容**

将生成的总结直接展示给用户，并告知文件路径。

---

## 错误处理

脚本不存在或未初始化：
  告知用户："请先运行 python scripts/init_diary.py 完成初始化。"

脚本调用失败（返回非零退出码）：
  展示脚本的错误输出，保留用户原始口述内容，告知可重试。

index.json 损坏（脚本报告解析失败）：
  告知用户："index.json 可能已损坏，请检查 data/index.tmp.json 是否存在。
  如存在，将其重命名为 index.json 即可恢复。"
