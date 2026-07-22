---
name: local-skill-manager
description: >
  Comprehensive manager for local user skills. USE THIS SKILL when the user wants to:
  (1) List or query existing skills (System or User),
  (2) Check versions of installed skills,
  (3) Create new local skills using standard templates,
  (4) Delete/Remove unwanted skills.
  This is the "Housekeeper" for the `skills/` directory.
triggers:
  - manage skills
  - list skills
  - query skills
  - check skill versions
  - skill version
  - create skill
  - new skill
  - delete skill
  - remove skill
  - skill manager
  - 管理skill
  - 管理技能
  - 查询skill
  - 列出skill
  - 检查skill版本
  - skill版本
  - 新建skill
  - 创建skill
  - 删除skill
  - 移除skill
  - skill管家
version: 1.0.0
---

# Local Skill Manager (本地 Skill 管家)

## Overview

This skill acts as the centralized manager for your local skills environment (`skills/` directory). It provides tools to list, monitor, create, and delete skills, ensuring your development environment remains organized.

## Core Capabilities

### 1. Query & List Skills
View all installed skills (both System and User) with their descriptions.

**Usage:**
- "List my skills"
- "Show available skills"
- "查询所有skill"

### 2. Version Monitoring
Check the version of each skill to ensure they are up-to-date.

**Usage:**
- "Check skill versions"
- "What version is my skill?"
- "检查skill版本"

### 3. Create New Skill
Quickly scaffold a new skill with the standard directory structure (`scripts/`, `references/`, `assets/`) and `SKILL.md` template.

**Usage:**
- "Create a new skill named 'data-analyzer'"
- "新建一个skill"

### 4. Delete Skill
Safely remove a skill directory.

**Usage:**
- "Delete skill 'old-test-skill'"
- "删除某个skill"

## Scripts

The skill includes the following scripts in `scripts/`:

- `list_skills.py`: Scans and lists skills.
- `check_versions.py`: Checks version metadata.
- `create_skill.py`: Wrapper to initialize new skills.
- `delete_skill.py`: Helper to remove skills.

## Critical Instructions

- **ALWAYS** use the python scripts with their full relative paths from the project root.
- **List Skills**: `python .trae/skills/local-skill-manager/scripts/list_skills.py`
- **Check Versions**: `python .trae/skills/local-skill-manager/scripts/check_versions.py`
- **Create Skill**: `python .trae/skills/local-skill-manager/scripts/create_skill.py "skill-name"`
- **Delete Skill**: `python .trae/skills/local-skill-manager/scripts/delete_skill.py "skill-name"`

- **DO NOT** rely on `ls` or `glob` commands in the `skills/` directory.
