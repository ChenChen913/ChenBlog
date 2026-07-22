# Severity Guidelines

Guidelines for classifying the severity of issues found during skill evaluation. This document covers both general software issues and Skill-specific issues.

---

## Severity Classification Framework

### Critical Issues (Immediate Action Required)

**Definition**: Issues that prevent the skill from functioning, could cause severe harm, data loss, security breaches, or system compromise.

**General Examples:**
- Remote code execution vulnerabilities
- SQL injection or command injection
- Authentication bypass
- Sensitive data exposure (passwords, keys, tokens)
- Unintended file deletion without confirmation
- Data corruption without backup
- Collecting personal data without consent
- License violations

**Skill-Specific Examples:**
- **No `triggers` field at all**: Skill cannot be activated by any user query
- **No `description` field**: System has no way to determine when to use the skill
- **SKILL.md missing or empty**: Skill has no instructions
- **Malicious script bundled**: Script that deletes files, exfiltrates data, or modifies system settings without consent
- **Prompt injection vulnerability**: Skill instructions could be manipulated to bypass safety guidelines

**Response Required:**
- Immediate fix before any use
- Cannot be approved in current state
- May require complete redesign

### High Priority Issues (Fix Before Use)

**Definition**: Issues that significantly impair the skill's activation reliability, functionality, or safety.

**General Examples:**
- Core feature doesn't work as documented
- Crash on common use cases
- Missing input validation
- Dependencies with known vulnerabilities
- Memory leaks
- Frequent crashes

**Skill-Specific Examples:**
- **Fewer than 5 triggers**: Skill will rarely be activated, especially with weaker models
- **English-only or Chinese-only triggers**: Excludes approximately half of potential users
- **Description under 30 words**: Insufficient information for activation decision
- **"When to use" in body instead of description**: Information is in wrong location (body only loads AFTER activation)
- **SKILL.md body exceeds 500 lines**: Violates hard limit, wastes shared context window
- **Major content duplication**: Same information in SKILL.md and references wastes tokens
- **Extraneous files present** (README.md, CHANGELOG.md): Pollutes skill package with non-functional files
- **Reference files not linked from SKILL.md**: Orphaned files that Claude may never discover
- **Scripts with hardcoded paths**: Will fail on different systems

**Response Required:**
- Fix before approval for production use
- May be acceptable for testing with caution
- Should be addressed in next version

### Medium Priority Issues (Should Fix Soon)

**Definition**: Issues that affect usability, efficiency, or quality but don't prevent basic functionality.

**General Examples:**
- Missing installation instructions
- Incomplete usage examples
- Poor error messages
- No unit tests
- Inconsistent naming

**Skill-Specific Examples:**
- **Triggers present but incomplete** (10-15 range): Activation works but could miss some user phrasings
- **SKILL.md body 350-500 lines**: Approaching limit, should optimize
- **Some redundant content**: Explanations of common knowledge that waste tokens
- **Progressive disclosure partially implemented**: Some detail in SKILL.md that belongs in references
- **Reference files > 100 lines without TOC**: Harder for Claude to navigate
- **Emojis in skill files**: Violates encoding restrictions, may break in some environments
- **Non-imperative writing style**: Uses descriptive prose instead of imperative form
- **Missing cross-platform handling**: Only works on one OS without graceful fallback
- **Freedom level mismatch**: Uses text instructions where scripts would be more reliable, or vice versa

**Response Required:**
- Should be fixed before widespread adoption
- Can be approved with plan to address
- Consider conditional approval

### Low Priority Issues (Nice to Have)

**Definition**: Minor issues that don't affect core functionality.

**General Examples:**
- Minor formatting inconsistencies
- Typographical errors
- Additional examples would be helpful
- Optional performance improvements

**Skill-Specific Examples:**
- **Minor trigger improvements**: A few additional phrasings could be added
- **Description could be more detailed**: Functional but not optimal
- **Slight formatting inconsistencies** in SKILL.md
- **Reference file organization could be improved**: Functional but not ideal structure
- **Additional error handling** in scripts would improve robustness
- **Minor token optimizations**: Could save a few tokens with more concise wording
- **Missing optional features** that would enhance but not critically affect the skill

**Response Required:**
- Can be addressed in future updates
- Does not block approval
- Consider as enhancement requests

---

## Skill-Specific Severity Matrix

### Frontmatter Issues

| Issue | Severity | Reasoning |
|-------|----------|-----------|
| No `triggers` field | Critical | Skill cannot be activated |
| No `description` field | Critical | System cannot determine when to use skill |
| `triggers` < 5 | High | Severely limited activation |
| `triggers` 5-9, single language | High | Many users excluded |
| `triggers` 10-15, bilingual | Medium | Functional but improvable |
| `triggers` 16-19, bilingual | Low | Good, minor additions possible |
| `triggers` >= 20, bilingual | N/A | Excellent, no action needed |
| `description` < 30 words | High | Insufficient for activation decision |
| `description` 30-49 words | Medium | Functional but should expand |
| `description` >= 50 words with "when to use" | N/A | Good, no action needed |
| No "when to use" in description | High | Critical activation info missing |
| `name` not lowercase-hyphenated | Medium | Convention violation |

### Context Efficiency Issues

| Issue | Severity | Reasoning |
|-------|----------|-----------|
| SKILL.md body > 500 lines | High | Violates hard limit |
| SKILL.md body 350-500 lines | Medium | Approaching limit, optimize |
| SKILL.md body 200-350 lines | Low | Acceptable but room for improvement |
| SKILL.md body < 200 lines | N/A | Excellent efficiency |
| Major content duplication | High | Significant token waste |
| Minor content duplication | Medium | Some token waste |
| Common knowledge explanations | Medium | Unnecessary token cost |
| Progressive disclosure not used | High | All detail in SKILL.md, no references |
| Progressive disclosure partial | Medium | Some detail could move to references |

### Architecture Issues

| Issue | Severity | Reasoning |
|-------|----------|-----------|
| SKILL.md missing | Critical | Skill has no instructions |
| README.md or CHANGELOG.md present | High | Extraneous files pollute package |
| Reference files not linked from SKILL.md | High | Orphaned, undiscoverable files |
| No read-timing guidance for references | Medium | Claude may not know when to read files |
| Reference files > 100 lines without TOC | Medium | Harder to navigate |
| Nested references (reference-to-reference) | Medium | Violates one-level-deep rule |
| Scripts not tested | Medium | May contain bugs |
| Scripts with hardcoded paths | High | Will fail on different systems |

### Encoding Issues

| Issue | Severity | Reasoning |
|-------|----------|-----------|
| Emojis in any file | Medium | Violates encoding restrictions |
| Non-standard special characters | Medium | May break in some environments |
| No UTF-8 handling for CJK paths | Medium | Will fail with CJK file paths |
| Encoding issues in scripts | High | Scripts will produce errors |

### Documentation Issues (Skill-Specific)

| Issue | Severity | Reasoning |
|-------|----------|-----------|
| Not using imperative form | Medium | Violates Skill Creator writing standard |
| "When to Use" section in body | High | Wrong location, wastes body space |
| Reference files > 10k words without grep patterns | Medium | Hard to search efficiently |
| No examples for core operations | High | Users cannot understand usage |

---

## Decision Matrix

### Approval Decisions

**Approve (Score >= 80, ready for use):**
- No Critical or High issues
- All Tier 1 quantitative checks pass
- Comprehensive triggers, lean SKILL.md, proper architecture
- May have a few Low issues

**Conditional Approval (Score 60-79, usable with caveats):**
- No Critical issues
- At most 1-2 High issues with documented fixes
- Tier 1 mostly passes
- Good triggers and reasonable context efficiency

**Needs Revision (Score 40-59, must fix before use):**
- Critical issues present OR multiple High issues
- Some Tier 1 failures
- Triggers incomplete or SKILL.md significantly bloated

**Reject (Score < 40, not suitable for use):**
- Multiple Critical issues
- Fundamental Tier 1 failures
- Security vulnerabilities or design flaws requiring complete rework

### Risk Assessment Quick Reference

| Risk Level | Tier 1 Status | Tier 2 Status | Tier 3 Status |
|------------|--------------|--------------|--------------|
| Low | All pass | All pass | Minor issues |
| Medium | Minor gaps | Some issues | Some issues |
| High | Significant gaps | Multiple issues | Multiple issues |
| Critical | Major failures | Critical security | N/A |

---

## Common Pitfalls in Severity Classification

### Avoiding Severity Inflation
- Reserve "Critical" for issues that prevent the skill from functioning or cause harm
- A missing feature is usually Medium, not High (unless it's a core feature)
- Cosmetic issues are always Low
- Use the Skill-Specific Severity Matrix as the primary reference

### Skill-Specific Pitfalls
- **Do not under-rate trigger issues**: Missing triggers = skill never activates = effectively broken
- **Do not under-rate context efficiency**: A bloated SKILL.md hurts ALL conversations using the skill
- **Do not over-rate documentation polish**: Good formatting matters less than functional triggers
- **Consider the cascade effect**: A Tier 1 failure makes Tier 2/3 quality irrelevant (skill won't activate or wastes too much context)

### Context Considerations
- How critical is the skill to the user's workflow?
- How often will the skill be activated?
- What's the user's technical level?
- Is this a first draft or a mature skill?
