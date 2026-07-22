# 标签系统

## 设计原则

标签格式为 "大类-细分"，全小写英文，如 work-conflict。
AI 可同时打多个标签，也可自创不在预设表中的新标签。
标签系统是开放的，遇到无法归类的内容直接创建新标签。

---

## 预设标签表

### 工作（work-）
- work-daily          日常工作流水账
- work-conflict       与同事或上司矛盾、被针对、争吵
- work-stress         加班、deadline、任务过重
- work-achievement    被表扬、完成目标、升职加薪
- work-confusion      方向迷茫、不知如何推进
- work-jobchange      跳槽、面试、辞职念头
- work-politics       站队、背刺、办公室八卦
- work-meeting        会议相关

### 情绪（emotion-）
- emotion-anger       愤怒
- emotion-grievance   委屈
- emotion-anxiety     焦虑
- emotion-depression  抑郁、低落
- emotion-happy       开心、愉快
- emotion-calm        平静
- emotion-excited     兴奋
- emotion-sad         悲伤
- emotion-tired       疲惫
- emotion-lost        迷茫
- emotion-lonely      孤独
- emotion-jealous     嫉妒
- emotion-guilty      愧疚
- emotion-fear        恐惧、担忧
- emotion-relief      释然

### 人际（social-）
- social-friend       与朋友相关
- social-partner      恋爱、婚姻、感情
- social-family       父母、兄弟姐妹、亲戚
- social-child        育儿
- social-stranger     被陌生人影响
- social-fatigue      社交疲惫、不想出门
- social-cutoff       结束某段关系

### 健康（health-）
- health-sick         生病、就医
- health-chronic      长期健康问题
- health-exercise     运动锻炼
- health-sleep        睡眠问题
- health-diet         饮食相关
- health-appearance   外貌感受

### 生活（life-）
- life-money          消费、存钱、债务
- life-housing        租房、装修、搬家
- life-commute        通勤、交通
- life-shopping       购物、种草
- life-food           吃什么、好不好吃
- life-weather        天气影响心情
- life-accident       突发倒霉事

### 思想（thought-）
- thought-life        对人生的思考
- thought-values      立场与判断
- thought-goals       设定目标、复盘
- thought-media       读书/影视引发的感想
- thought-memory      回忆往事
- thought-death       对死亡、离别的思考

### 娱乐（fun-）
- fun-game            游戏
- fun-video           影视
- fun-music           音乐
- fun-reading         阅读
- fun-sports          运动赛事
- fun-hobby           其他爱好

### 社会（society-）
- society-news        对新闻的反应
- society-rant        对社会现象的不满
- society-politics    涉及政治立场

### 系统标签
- help-request        用户主动向 AI 求助
- memo                中性事件记录，无明显情绪
- todo                口述中提到想做但未做的事

---

## 情绪强度（1-5）

| 分值 | 描述     | 典型表现                      |
|-----|--------|------------------------------|
| 1   | 平静     | 陈述事实，无情绪词               |
| 2   | 轻微波动  | 有情绪词但语气平和               |
| 3   | 明显情绪  | 多个情绪词，语气较激动            |
| 4   | 强烈情绪  | 大量情绪表达，可能有粗口           |
| 5   | 极度情绪  | 情绪主导全文，事件反而模糊         |
