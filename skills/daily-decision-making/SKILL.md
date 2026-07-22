---
name: daily-decision-making
description: Use when you need to make personal life or career decisions, or when you face choices involving uncertainty, trade-offs, or multiple options. Implements a structured Personal Decision Database system.
---

# Daily Decision Making

## Overview
This skill implements a **Personal Decision Database** system to help you process complex life choices systematically. By structured recording, analyzing, and reviewing, it transforms decision-making from a source of anxiety into a repeatable process for accumulating wisdom.

## When to Use
- When you ask "What should I do?", "Help me decide", or "I'm torn between X and Y".
- When facing decisions about career (job change), lifestyle (moving), major purchases (house/car), or relationships.
- When you need to weigh pros and cons systematically.
- When you want to document a decision for future reference.

## The Decision Process

### Phase 1: Setup (The System)
If this is the first time, establish the foundation:
1.  **Values Check**: What are your core values and long-term goals? (The "Compass")
2.  **Resource Audit**: What capabilities and resources do you have? (The "Ammo")
3.  **Advisors**: Who are your trusted advisors? (The "Brain Trust")

### Phase 2: Active Decision (The Workbench)
For every new decision, create a structured record:

1.  **Define**: Create a folder `YYYY-MM-DD-Topic`.
2.  **Initialize**: Copy the [Decision Template](templates/decision-template.md).
3.  **Fill**:
    - **Background & Goals**: Why now? What does success look like?
    - **Information Gathering**: Talk to people, research online, self-reflect.
    - **Option Comparison**: List pros/cons, use the **Decision Matrix**.
4.  **Decide**: Make a choice, state reasons, and plan execution (Plan B, Exit criteria).

### Phase 3: Review (The Wisdom)
After execution:
1.  **Review**: Use STAR method to review the outcome.
2.  **Distill**: Extract "Key Lessons" and "Pitfalls to Avoid".
3.  **Archive**: Move to `Completed Decisions`.

## Directory Structure
Maintain this structure in your notes/project:

```
decision-database/
├── 00-system/               # Values, Resources, Advisors
├── 01-active-decisions/     # Work in progress
├── 02-research/             # Raw info
├── 03-completed-decisions/  # Archived
├── 04-knowledge-base/       # Patterns & Lessons
└── 05-quick-reference/      # Checklists
```

## Tools & Techniques

### Decision Matrix (Weighted Scoring)
Use when options are close. Assign weights to criteria (e.g., Risk 30%, Cost 20%) and score each option.

### Pre-Mortem (Risk Assessment)
"Assume it's 6 months later and this decision failed miserably. Why did it happen?"

### 10-10-10 Rule
How will I feel about this in 10 minutes? 10 months? 10 years?

## Template Usage
The skill includes a comprehensive template at `templates/decision-template.md`.
**Action**: When starting a decision, offer to create this file for the user.
