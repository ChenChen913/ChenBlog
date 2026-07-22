# Output Templates

Standardized templates for skill evaluation reports. Select the appropriate template based on the evaluation scope requested by the user.

---

## Template 1: Comprehensive Evaluation Report

Use for full skill evaluation covering all nine dimensions.

```
# Skill Evaluation Report: [skill-name]

## Evaluation Summary

[skill-name] - Overall Quality: [Excellent/Good/Fair/Poor]
Score: [X/100]

[One paragraph: skill purpose, scope, key strengths, and critical issues]

## Quantitative Snapshot

| Metric                    | Value    | Standard  | Status   |
|---------------------------|----------|-----------|----------|
| SKILL.md body lines       | [N]      | < 500     | [OK/WARN]|
| Trigger count             | [N]      | >= 10     | [OK/WARN]|
| Bilingual triggers        | [Y/N]    | Required  | [OK/WARN]|
| Description word count    | [N]      | >= 50     | [OK/WARN]|
| "When to use" in desc     | [Y/N]    | Required  | [OK/WARN]|
| Name format               | [Y/N]    | lowercase | [OK/WARN]|
| Emoji count               | [N]      | 0         | [OK/WARN]|
| Extraneous files          | [N]      | 0         | [OK/WARN]|
| Reference files linked    | [Y/N]    | Required  | [OK/WARN]|

## Score Breakdown

| Dimension                       | Tier | Max  | Score | Notes          |
|---------------------------------|------|------|-------|----------------|
| Frontmatter & Triggers          | 1    | 25   | [N]   | [brief notes]  |
| Context Efficiency              | 1    | 20   | [N]   | [brief notes]  |
| Skill Architecture              | 1    | 15   | [N]   | [brief notes]  |
| Security & Risk                 | 2    | 10   | [N]   | [brief notes]  |
| Platform Compatibility          | 2    | 8    | [N]   | [brief notes]  |
| Dependencies                    | 2    | 7    | [N]   | [brief notes]  |
| Encoding & i18n                 | 3    | 5    | [N]   | [brief notes]  |
| Documentation Quality           | 3    | 5    | [N]   | [brief notes]  |
| Functional Analysis             | 3    | 5    | [N]   | [brief notes]  |
| **Total**                       |      | **100** | **[N]** |            |

## Detailed Findings

### Strengths
- [Strength 1 with specific evidence]
- [Strength 2 with specific evidence]
- [Strength 3 with specific evidence]

### Issues Found

**[Dimension Name]** - Tier: [1/2/3] - Severity: [Critical/High/Medium/Low]
- **Issue**: [Clear description with specific file/line reference]
- **Impact**: [What goes wrong if not fixed]
- **Suggestion**: [Specific fix with example code/text]

[Repeat for each issue, ordered by Tier then Severity]

### Improvement Suggestions
- [Priority 1: Most impactful improvement]
- [Priority 2: Second most impactful]
- [Priority 3: Third most impactful]

## Final Recommendations

- [ ] **Approve** - Ready for direct use
- [ ] **Conditional Approval** - Usable but improvements recommended
- [ ] **Needs Revision** - Must address major issues before use
- [ ] **Reject** - Serious quality or security issues present

## Action Items

**Immediate (before use)**:
- [ ] [Critical/High fix 1]
- [ ] [Critical/High fix 2]

**Short-term (next iteration)**:
- [ ] [Medium fix 1]
- [ ] [Medium fix 2]

**Long-term (future enhancement)**:
- [ ] [Low/enhancement 1]
- [ ] [Low/enhancement 2]
```

---

## Template 2: Frontmatter & Activation Review

Use when the user specifically asks about trigger coverage, activation reliability, or frontmatter quality.

```
# Frontmatter & Activation Review: [skill-name]

## Activation Reliability: [Excellent/Good/Fair/Poor]

## `name` Field
- Value: `[current name]`
- Format check: [PASS/FAIL - reason]

## `description` Field
- Word count: [N] (target: >= 50)
- "What it does" present: [Y/N]
- "When to use" present: [Y/N]
- Use case coverage: [Comprehensive/Partial/Minimal]
- Issues: [list any problems]
- Suggested improvement:
  ```yaml
  description: >
    [Improved description text]
  ```

## `triggers` Field
- Total count: [N] (target: >= 10)
- English triggers: [N]
- Chinese triggers: [N]
- Verb variations covered: [Y/N]
- Natural expressions covered: [Y/N]
- Domain-specific terms: [Y/N]

### Trigger Coverage Analysis

| Category           | Current | Suggested Additions              |
|--------------------|---------|----------------------------------|
| Primary actions    | [N]     | [list missing]                   |
| Verb variations    | [N]     | [list missing]                   |
| Natural phrases    | [N]     | [list missing]                   |
| Chinese keywords   | [N]     | [list missing]                   |
| Domain terms       | [N]     | [list missing]                   |

### Missing Triggers (Suggested)
```yaml
triggers:
  # Existing triggers preserved
  [existing triggers]
  # New additions
  - [new trigger 1]
  - [new trigger 2]
  - [new trigger 3]
```

## Body "When to Use" Check
- [ ] No "When to Use" section found in body (correct)
- [ ] "When to Use" section found in body at line [N] (should move to description)
```

---

## Template 3: Context Efficiency Review

Use when the user asks about context window usage, token cost, or SKILL.md size.

```
# Context Efficiency Review: [skill-name]

## Efficiency Rating: [Excellent/Good/Fair/Poor]

## SKILL.md Size Analysis
- Body line count: [N] / 500 limit
- Estimated token count: [N]
- Information density: [High/Medium/Low]

## Content Audit

### Essential Content (should keep)
- [Section/lines]: [reason it's essential]

### Potentially Redundant Content (consider removing)
- [Section/lines]: [why Claude likely already knows this]

### Content to Move to References
- [Section/lines]: [why it belongs in references/]

## Progressive Disclosure Check
- [ ] Level 1 (metadata): [N] words - [OK/Too long]
- [ ] Level 2 (body): [N] words - [OK/Too long]
- [ ] Level 3 (resources): [N] files, properly linked

## Duplication Analysis
| Content | Location 1 | Location 2 | Action |
|---------|-----------|-----------|--------|
| [topic] | SKILL.md L[N] | references/[file] L[N] | Remove from [location] |

## Optimization Recommendations
1. [Most impactful size reduction with estimated token savings]
2. [Second most impactful]
3. [Third most impactful]
```

---

## Template 4: Quick Security Check

Use for security-focused evaluation.

```
# Security Assessment: [skill-name]

## Security Status: [Secure/Needs Attention/Critical Issues]

[One sentence summary of security posture]

## Critical Issues (if any)

**[Issue Name]** - Severity: Critical
- **Description**: [Detailed description]
- **Risk**: [What could happen]
- **Fix**: [Immediate remediation]

## High Priority Issues (if any)

**[Issue Name]** - Severity: High
- **Description**: [Detailed description]
- **Risk**: [What could happen]
- **Fix**: [Recommended remediation]

## Other Security Notes
- [Medium/Low observations]

## Security Recommendations
- [ ] Review all user input handling
- [ ] Audit external dependencies for vulnerabilities
- [ ] Verify no sensitive data is logged or exposed
- [ ] Test with malicious input patterns
- [ ] Verify destructive operations require confirmation
```

---

## Template 5: Improvement Suggestions

Use when the user asks "how can this skill be improved?"

```
# Improvement Analysis: [skill-name]

## Current State

**Strengths:**
- [List current strengths]

**Areas for Improvement:**
- [List specific areas]

## Priority Improvements

### Immediate (Tier 1 Issues)

1. **[Improvement name]**
   - **Dimension**: [Which evaluation dimension]
   - **Why**: [Reason for importance]
   - **How**: [Implementation approach with example]
   - **Impact**: [Expected outcome]

### Short-term (Tier 2 Issues)

1. **[Improvement name]**
   - **Dimension**: [Which evaluation dimension]
   - **Why**: [Reason for importance]
   - **How**: [Implementation approach]
   - **Impact**: [Expected outcome]

### Long-term (Tier 3 / Enhancements)

1. **[Improvement name]**
   - **Dimension**: [Which evaluation dimension]
   - **Why**: [Reason for importance]
   - **How**: [Implementation approach]
   - **Impact**: [Expected outcome]

## Implementation Roadmap

**Phase 1 (Immediate - fix before use):**
- [ ] [Action item 1]
- [ ] [Action item 2]

**Phase 2 (Short-term - next iteration):**
- [ ] [Action item 3]
- [ ] [Action item 4]

**Phase 3 (Long-term - future enhancement):**
- [ ] [Action item 5]
- [ ] [Action item 6]
```

---

## Template 6: Comparative Evaluation

Use when comparing multiple skills or evaluating a skill against a known good example.

```
# Comparative Evaluation: [skill-name-1] vs [skill-name-2]

## Summary

| Aspect                   | [skill-1] | [skill-2] | Winner |
|--------------------------|-----------|-----------|--------|
| Overall Score            | [N/100]   | [N/100]   | [name] |
| Frontmatter Quality      | [rating]  | [rating]  | [name] |
| Context Efficiency        | [rating]  | [rating]  | [name] |
| Architecture              | [rating]  | [rating]  | [name] |
| Security                  | [rating]  | [rating]  | [name] |

## Detailed Comparison

### What [skill-1] Does Better
- [point 1]
- [point 2]

### What [skill-2] Does Better
- [point 1]
- [point 2]

### Recommendations for Each
**[skill-1]**: [key improvement]
**[skill-2]**: [key improvement]
```

---

## Issue Classification Quick Reference

| Severity | Tier 1 Example | Tier 2 Example | Tier 3 Example |
|----------|---------------|----------------|----------------|
| Critical | No triggers at all | Remote code execution | N/A (Tier 3 rarely Critical) |
| High | < 5 triggers, no bilingual | Missing input validation | N/A |
| Medium | Triggers present but incomplete | Missing platform handling | Emojis in documentation |
| Low | Minor trigger improvements | Optional security enhancement | Minor formatting issues |
