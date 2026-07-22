---
name: github-trending-reporter
description: >
  Scrapes daily trending repositories from GitHub, generates AI-powered summaries, and emails an HTML report.
  USE THIS SKILL when the user wants to:
  (1) Get a summary of what's trending on GitHub today,
  (2) Generate and send a GitHub trending digest email,
  (3) Check for popular new open source projects.
triggers:
  - github trending
  - trending report
  - fetch trending
  - trending digest
  - github digest
  - 趋势日报
  - github热榜
  - 生成日报
version: 1.0.0
---

# GitHub Trending Reporter

## Overview
This skill automates the process of discovering and reporting on GitHub's trending repositories. It fetches data, uses AI to summarize the projects (specifically focusing on "what it is" and "what problem it solves"), and delivers a polished HTML report via email.

## Usage Workflow

### 1. Fetch & Summarize
Fetch the latest trending data and generate AI summaries.
**Command:** `python .trae/skills/github-trending-reporter/fetch_trending.py`

### 2. Generate Report
Create the HTML report from the summarized data.
**Command:** `python .trae/skills/github-trending-reporter/generate_report.py`

### 3. Send Digest
Email the generated report to the configured recipient.
**Command:** `python .trae/skills/github-trending-reporter/send_digest.py`

## Configuration
**Crucial**: This skill requires a `.env` file in the skill directory (`.trae/skills/github-trending-reporter/`) with SMTP credentials:
```ini
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
TO_EMAIL=recipient@example.com
```

## Dependencies
Ensure dependencies are installed:
`pip install -r requirements.txt`
