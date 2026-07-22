---
name: wechat-cover-architect
description: >
  Generates high-fidelity image prompts and HTML/CSS layouts for WeChat Official Account covers.
  Use when the user wants to design, describe, or code a cover image for WeChat articles.
triggers:
  - create wechat cover
  - generate cover prompt
  - wechat official account cover
  - cover design skill
  - image prompt generator
  - 公众号封面
  - 生成封面提示词
  - 微信封面设计
  - 提示词生成器
  - 描述图片
  - describe image for cover
  - cover art prompt
  - 封面图文
  - prompt skill
  - design cover
  - 封面设计
  - make a cover
---

# WeChat Cover Architect (v2.0 - Multi-Layer Architecture)

## Overview
This skill is a **Three-Layer Design System** that transforms vague user concepts into professional, commercial-grade visual descriptions or code. It is designed to drive high-end AI models (like Nano Banana Pro, Midjourney, Flux) to act as an "AI Art Director".

## 🏗️ The 3-Layer Architecture
1.  **Layer 1: The Design DNA Vault** (`references/design-matrix.md`)
    *   A combinatorial matrix of 60+ Styles, 15+ Layouts, 30+ Materials, 20+ Lighting setups, and 20+ Color Palettes.
    *   Capable of generating **10+ million unique combinations**.
2.  **Layer 2: The Template Matrix** (`assets/templates/`)
    *   Structured prompt skeletons that enforce professional formatting for AI generation.
    *   Code templates for HTML/CSS implementations.
3.  **Layer 3: The Innovation Engine** (`engine/innovation-engine.md`)
    *   The "Brain" that performs Semantic Analysis, Micro-Innovation (Contrast/Metaphor), and Fusion logic.
    *   Ensures outputs are not random, but **curated** and **aesthetically valid**.

## File Map
*   **SKILL.md** (This file)
*   `references/design-matrix.md` (The Atomic Elements)
*   `references/tailwind-styles.md` (CSS Class Mapping for Layouts)
*   `references/styles.md` (The Legacy Style List - kept for reference)
*   `engine/innovation-engine.md` (The Logic & Pseudocode)
*   `assets/templates/image_prompt_template.md` (The Prompt Skeleton)
*   `assets/templates/layout_template.md` (The Code Skeleton - Standard)
*   `assets/templates/isometric_layout_template.md` (The Code Skeleton - Isometric 3D)

## Architecture & Data Sources (MANDATORY READ)
You **MUST** read these files to execute the skill logic.
1.  **The Vault**: `references/design-matrix.md`
2.  **The Engine**: `engine/innovation-engine.md`
3.  **The Templates**: `assets/templates/`

## The Workflow (Strict Execution Path)

### 1. Analyze Intent & Semantics
*   **Action**: Analyze user input using `engine/innovation-engine.md` (Stage 1).
*   **Extract**: Topic, Mood, Abstract Concepts.
*   **Strategy**: Always target the **Full Canvas** (3.35:1 aspect ratio) which contains:
    *   **Left (70%)**: Main Cover Area (2.35:1).
    *   **Right (30%)**: Share Icon Area (1:1).

### 2. Run Innovation Engine (Layer 3)
*   **Action**: Execute the logic in `engine/innovation-engine.md`.
*   **Strategy**:
    *   **Select Base**: Pick a Core Style from `design-matrix.md`.
    *   **Apply Micro-Innovation**: Use "Contrast", "Metaphor", or "Fusion".
    *   **Constraint Check**: Enforce "WeChat Dual-Panel" composition to split the visual interest into Left (Complex) and Right (Iconic).

### 3. Generate Output (Layer 2)

#### Option A: Image Prompt Generation
1.  **Read**: `assets/templates/image_prompt_template.md`.
2.  **Fill**: Populate the template. **CRITICAL**: Ensure `--ar 3.35:1` is included.
3.  **Result**: A prompt that generates a SINGLE panoramic image containing both the cover and the icon.

#### Option B: Layout Code Generation
1.  **Select Template**:
    *   For Standard Layouts: `assets/templates/layout_template.md`.
    *   For Isometric/3D Code Layouts: `assets/templates/isometric_layout_template.md`.
2.  **Fill**: Insert content. The HTML structure renders the composite view.

## Output Format

### For Image Prompts
Return the result in a code block:

```markdown
**WeChat Cover Architect: Generated Prompt**

> **Design DNA**: [Core Style] + [Layout Pattern]
> **Innovation Strategy**: [e.g., "Contrast: Soft Topic + Hard Material"]
> **Palette**: [Color Palette Name]

```text
[Insert Content from image_prompt_template.md]
```
```

### For Layout Code
Return the result in an HTML code block:

```html
<!-- WeChat Cover Layout -->
<!DOCTYPE html>
...
```

## Diversity Guarantee
By strictly following the `design-matrix` combinations, this skill avoids repetition. **Do not** default to "Tech" or "Minimalist" every time. Explore "Washi Paper", "Acid House", "Isometric", etc.
