---
name: skill-evaluator
description: >
  Systematically evaluates skill files, providing detailed, actionable feedback to ensure quality, safety, and usability. USE THIS SKILL when the user wants to:
  (1) Review a skill for quality and security issues,
  (2) Get detailed feedback on skill improvements,
  (3) Validate skill structure and documentation,
  (4) Assess skill safety and risk factors,
  (5) Check skill compatibility and best practices,
  (6) Evaluate frontmatter triggers and description quality,
  (7) Assess context window efficiency and token cost.
  This skill provides comprehensive analysis based on a structured evaluation framework covering nine key dimensions, with special emphasis on Skill-specific quality standards defined by the Skill Creator specification.
triggers:
  - evaluate skill
  - review skill
  - audit skill
  - check skill
  - assess skill
  - skill evaluation
  - skill review
  - skill audit
  - skill quality check
  - skill security check
  - skill quality
  - skill assessment
  - analyze skill
  - skill analysis
  - skill feedback
  - skill improvement
  - check skill quality
  - validate skill
  - skill validation
  - skill diagnosis
  - skill health check
  - rate skill
  - grade skill
  - score skill
  - 评估skill
  - 审核skill
  - 检查skill
  - 评估技能
  - 审核技能
  - 检查技能
  - skill质量评估
  - skill安全检查
  - 技能评估
  - 技能审核
  - 技能检查
  - 评估skill文件
  - 审核skill文件
  - skill打分
  - skill评分
  - 分析skill
  - skill分析
  - skill诊断
  - 验证skill
  - skill验证
  - 技能质量
  - 评价skill
  - skill评价
---

# Skill Evaluator

## Overview

Evaluate skill files using a nine-dimensional framework. Systematically analyze skills across: frontmatter quality, context efficiency, skill architecture, dependencies, security, encoding, compatibility, documentation, and functionality. Deliver detailed, actionable feedback with clear improvement recommendations.

**Evaluation Baseline**: All evaluations MUST reference the Skill Creator specification as the authoritative standard. The Skill Creator defines what constitutes a well-designed skill, including frontmatter requirements, progressive disclosure patterns, encoding restrictions, and directory structure conventions.

## Evaluation Dimensions (Ordered by Priority)

The nine dimensions are organized into three priority tiers:

### Tier 1: Skill-Critical (Determine whether the skill works at all)

These dimensions directly affect whether the skill can be activated and function correctly. Issues here should be weighted most heavily in the final recommendation.

#### Dimension 1: Frontmatter & Trigger Mechanism

The frontmatter is the primary interface between the skill and the host system. Poor frontmatter = skill never activates.

- **`name` field**: Must be lowercase with hyphens (e.g., `my-skill-name`)
- **`description` field**:
  - Must clearly state what the skill does AND when to use it
  - Must include "when to use" information HERE, not in the body (body only loads after triggering)
  - Should use the pattern: "[What it does]. USE THIS SKILL when the user wants to: (1)... (2)... (3)..."
  - Minimum ~50 words for adequate coverage
- **`triggers` field** (CRITICAL):
  - Minimum 10-20 triggers required for reliable activation
  - Must include both English AND Chinese keywords
  - Must cover multiple phrasings: verb variations, natural expressions, domain-specific terms
  - Test: "Would a user expressing this intent in any reasonable way match at least one trigger?"
- **No extraneous frontmatter fields** unless specifically needed

**Quantitative Checks**:

| Metric | Excellent | Good | Fair | Poor |
|--------|-----------|------|------|------|
| Trigger count | >= 20 | 10-19 | 5-9 | < 5 |
| Bilingual triggers | Yes, comprehensive | Yes, partial | One language only | None |
| Description word count | >= 80 | 50-79 | 30-49 | < 30 |
| "When to use" in description | Yes, with examples | Yes, brief | Implicit only | Missing |

#### Dimension 2: Context Efficiency

The context window is a shared resource. Every token in a skill competes with conversation history, other skills, and the user's actual request.

- **SKILL.md body line count**: Must be under 500 lines. Flag if approaching or exceeding this limit.
- **Redundant content**: Does the skill explain things Claude already knows? Challenge each paragraph: "Does Claude really need this?"
- **Progressive disclosure**: Is the three-level loading system properly used?
  - Level 1: Metadata (name + description + triggers) - always in context (~100 words)
  - Level 2: SKILL.md body - loaded when skill triggers (< 5k words)
  - Level 3: Bundled resources - loaded as needed by Claude (unlimited)
- **Information placement**: Is detailed reference material in `references/` rather than bloating SKILL.md?
- **Duplication**: Does the same information appear in both SKILL.md and reference files?

**Quantitative Checks**:

| Metric | Excellent | Good | Fair | Poor |
|--------|-----------|------|------|------|
| SKILL.md body lines | < 200 | 200-350 | 350-500 | > 500 |
| Content unique to skill (not general knowledge) | > 90% | 70-90% | 50-70% | < 50% |
| Duplication between SKILL.md and references | None | Minimal | Some | Significant |

#### Dimension 3: Skill Architecture & Directory Structure

Proper architecture ensures maintainability and efficient context usage.

- **Required structure compliance**:
  ```
  skill-name/
  +-- SKILL.md (required)
  +-- scripts/          (optional - executable code)
  +-- references/       (optional - documentation for context)
  +-- assets/           (optional - files used in output)
  ```
- **No extraneous files**: Must NOT contain README.md, INSTALLATION_GUIDE.md, CHANGELOG.md, etc.
- **Reference file management**:
  - All reference files must be explicitly linked from SKILL.md with clear guidance on when to read them
  - References should be one level deep (no nested references)
  - Files > 100 lines should include a table of contents at the top
  - Files > 10k words should have grep search patterns in SKILL.md
- **Script quality**: Scripts should be tested and executable. Check for common issues.
- **Asset appropriateness**: Assets should be files used in output, not documentation

### Tier 2: Quality & Safety (Affect reliability and user trust)

#### Dimension 4: Security & Risk Assessment

See references/evaluation-framework.md Section 2 for detailed criteria.

- **Dangerous operations**: Commands causing unintended deletion, arbitrary code execution, credential access, untrusted network requests, permission modification
- **Prompt injection risk**: Could the skill be manipulated to bypass safety guidelines?
- **Data leakage**: Potential for accidental data exposure or sensitive information logging
- **User confirmation**: Destructive operations must require explicit user consent

#### Dimension 5: Environment & Platform Compatibility

See references/evaluation-framework.md Section 4 for detailed criteria.

- **OS awareness**: Does the skill detect and adapt to Windows/macOS/Linux?
- **Path handling**: Forward slashes vs backslashes, use of `pathlib` or `os.path`
- **Command variations**: Unix vs Windows command equivalents
- **Scripting strategy**: Prefer Python with `platform` module for cross-platform logic
- **Graceful degradation**: Handle missing dependencies gracefully

#### Dimension 6: Dependency & File Bundling Analysis

See references/evaluation-framework.md Section 1 for detailed criteria.

- **External dependencies**: List all required libraries/packages/tools
- **Version specifications**: Are versions pinned or flexible?
- **Dependency risks**: Security vulnerabilities, licensing issues
- **Installation clarity**: Are installation steps clear and minimal?

### Tier 3: Polish & Enhancement (Improve overall quality)

#### Dimension 7: Encoding & Internationalization

See references/evaluation-framework.md Section 3 for detailed criteria.

**Skill-specific encoding rules** (from Skill Creator specification):
- **NO EMOJIS** in any file (SKILL.md, scripts, references, tests, etc.)
- **NO SPECIAL SYMBOLS**: Avoid non-standard characters that might break in certain environments
- **Scope**: Applies to everything inside the skill package
- CJK character compatibility for file paths and content
- UTF-8 handling for all I/O operations

#### Dimension 8: Documentation Quality

See references/evaluation-framework.md Section 5 for detailed criteria.

**Skill-specific documentation requirements**:
- **Writing style**: Always use imperative/infinitive form (per Skill Creator spec)
- **"When to Use" placement**: Must be in `description` field, NOT in SKILL.md body
- **Conciseness over verbosity**: Prefer concise examples over verbose explanations
- **Freedom-level matching**: Match specificity to task fragility:
  - High freedom (text instructions) for flexible tasks
  - Medium freedom (pseudocode/parameterized scripts) for preferred patterns
  - Low freedom (specific scripts) for fragile/error-prone operations
- **Reference file structure**: Long files (>100 lines) must have TOC at top

#### Dimension 9: Functional Analysis & Improvement Opportunities

See references/evaluation-framework.md Section 6 for detailed criteria.

- **Edge cases**: Unhandled scenarios
- **Error handling**: Coverage and clarity of error messages
- **Performance**: Bottlenecks, scalability issues
- **Enhancement opportunities**: Missing features, integration possibilities
- **Best practice alignment**: Deviations from Skill Creator conventions

## Usage Workflow

### Step 1: Receive Skill for Evaluation

When a user provides a skill file, first understand its purpose and scope. Read all files in the skill directory (SKILL.md, references, scripts, assets).

### Step 2: Quick Quantitative Scan

Before deep analysis, perform rapid quantitative checks:

- [ ] Count SKILL.md body lines (target: < 500)
- [ ] Count triggers (target: >= 10)
- [ ] Check bilingual trigger coverage
- [ ] Verify description word count (target: >= 50)
- [ ] Check for "when to use" in description
- [ ] Scan for extraneous files (README.md, etc.)
- [ ] Scan for emoji usage (must be zero)
- [ ] Check `name` field format (lowercase-hyphenated)

### Step 3: Apply Full Evaluation Framework

Systematically analyze the skill using all nine dimensions, prioritized by tier. Focus most energy on Tier 1 (Skill-Critical) dimensions.

### Step 4: Cross-Reference with Skill Creator Specification

Explicitly verify alignment with Skill Creator standards:

- [ ] Frontmatter follows the YAML template from Skill Creator
- [ ] Progressive disclosure pattern properly implemented
- [ ] Encoding restrictions respected (no emojis, no special symbols)
- [ ] OS-specific compatibility addressed
- [ ] Appropriate freedom level chosen for each operation type
- [ ] No prohibited file types included

### Step 5: Generate Structured Report

Create a comprehensive evaluation report following the output format below.

### Step 6: Provide Actionable Recommendations

Offer specific, implementable suggestions for improvement, prioritized by impact.

## Output Format

### Evaluation Summary

```
[Skill Name] - Overall Quality: [Excellent/Good/Fair/Poor]
Score: [X/100]

[One paragraph: skill purpose, key strengths, and critical issues if any]
```

### Quantitative Snapshot

```
| Metric                    | Value    | Standard  | Status |
|---------------------------|----------|-----------|--------|
| SKILL.md body lines       | [N]      | < 500     | OK/WARN|
| Trigger count             | [N]      | >= 10     | OK/WARN|
| Bilingual triggers        | [Y/N]    | Required  | OK/WARN|
| Description word count    | [N]      | >= 50     | OK/WARN|
| "When to use" placement   | [Loc]    | In desc   | OK/WARN|
| Emoji usage               | [N]      | 0         | OK/WARN|
| Extraneous files          | [N]      | 0         | OK/WARN|
```

### Detailed Findings

#### Strengths
- [List key strengths with specific evidence]

#### Issues Found

**[Dimension Name]** - Tier: [1/2/3] - Severity: [Critical/High/Medium/Low]
- **Issue**: [Description with specific location/line reference]
- **Impact**: [Consequence if not fixed]
- **Suggestion**: [Specific, actionable fix with example code/text if applicable]

#### Improvement Suggestions
- [Prioritized, actionable improvement ideas]

### Final Recommendations

- [ ] **Approve** - Ready for direct use (no Critical/High issues, score >= 80)
- [ ] **Conditional Approval** - Usable but improvements recommended (no Critical, few High, score 60-79)
- [ ] **Needs Revision** - Must address major issues (Critical or multiple High issues, score 40-59)
- [ ] **Reject** - Serious quality/security issues (multiple Critical issues, score < 40)

## Evaluation Principles

1. **Skill Creator Spec as Baseline**: Always evaluate against the Skill Creator specification
2. **Tier Priority**: Tier 1 issues outweigh Tier 2 and 3 combined
3. **Objective & Impartial**: Base assessment on observable facts, not assumptions
4. **Safety First**: Immediately flag any security concerns
5. **Constructive Feedback**: Provide specific, actionable suggestions with examples
6. **Context-Aware**: Evaluate based on the skill's declared purpose and scope
7. **User Perspective**: Consider end-user experience and common activation scenarios
8. **Token-Conscious**: Always consider the context window cost of skill content

When uncertain about security issues, err on the side of caution and flag for review.

## Comprehensive Evaluation Checklist

### Tier 1: Skill-Critical
- [ ] `name` field is lowercase-hyphenated
- [ ] `description` is >= 50 words with "when to use" information
- [ ] `triggers` >= 10, bilingual, covering multiple phrasings
- [ ] No "When to Use" section in SKILL.md body (must be in description)
- [ ] SKILL.md body < 500 lines
- [ ] No content Claude already knows (minimize redundancy)
- [ ] Progressive disclosure properly implemented
- [ ] No duplication between SKILL.md and reference files
- [ ] Directory structure follows conventions
- [ ] No extraneous files (README.md, CHANGELOG.md, etc.)
- [ ] Reference files linked from SKILL.md with read-timing guidance
- [ ] Long reference files have TOC

### Tier 2: Quality & Safety
- [ ] No dangerous commands without user confirmation
- [ ] No prompt injection vulnerabilities
- [ ] No data leakage risks
- [ ] Cross-platform compatibility addressed
- [ ] Graceful degradation for missing dependencies
- [ ] Dependencies documented with versions

### Tier 3: Polish
- [ ] Zero emoji usage across all files
- [ ] No non-standard special characters
- [ ] CJK path/filename compatibility considered
- [ ] Imperative/infinitive writing style used
- [ ] Freedom level matches task fragility
- [ ] Edge cases identified and handled
- [ ] Error handling is comprehensive
- [ ] Enhancement opportunities documented

## Example Evaluation (Condensed)

Below is a condensed example of evaluating a hypothetical `csv-analyzer` skill:

**Input**: A skill that analyzes CSV files and generates summary reports.

**Quantitative Snapshot**:

| Metric                    | Value | Standard | Status |
|---------------------------|-------|----------|--------|
| SKILL.md body lines       | 620   | < 500    | WARN   |
| Trigger count             | 6     | >= 10    | WARN   |
| Bilingual triggers        | No    | Required | WARN   |
| Description word count    | 25    | >= 50    | WARN   |
| Emoji usage               | 3     | 0        | WARN   |

**Key Findings**:

- Tier 1 Critical: Only 6 triggers, no Chinese keywords - skill will fail to activate for ~50% of potential users
- Tier 1 High: SKILL.md at 620 lines - exceeds 500-line limit, wastes context tokens. Move CSV format reference to `references/csv-formats.md`
- Tier 1 High: Description too short (25 words) and missing "when to use" clause
- Tier 3 Medium: 3 emojis found in documentation - violates encoding restrictions
- Tier 2 Low: No Windows path handling for CSV file access

**Recommendation**: Needs Revision (Score: 42/100) - Tier 1 issues must be addressed before the skill can reliably function.

## Resources

Detailed evaluation criteria and templates in:

### references/
- **evaluation-framework.md**: Detailed criteria for all nine dimensions, including skill-specific checks
- **output-templates.md**: Standardized report templates for different evaluation scenarios
- **severity-guidelines.md**: Issue severity classification with skill-specific examples
