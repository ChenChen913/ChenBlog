---
name: aesthetic-copilot
description: Use when the user wants to generate high-fidelity PROMPTS for Text-to-Image models (Flux, Ideogram, Midjourney) based on vague layout/content descriptions.
---

# Aesthetic Copilot (v3.3 - The Polished Jewel)

## Overview
This skill acts as a **Meta-Prompt Generator**. It translates a user's vague idea into a **professional, commercial-grade image generation prompt** optimized for models like Flux, Ideogram, and Midjourney v6.

## 📂 File Map (Reference Guide)
*   **SKILL.md** (This file)
*   `styles/premium/master-collection.md` (The Vault: Premium Styles)
*   `engine/style-mixer.md` (The Logic: Randomization & Conflict Resolution)
*   `engine/micro-innovation.md` (The Creativity: Artistic Twists)
*   `prompt-templates/` (The Output Skeletons: Poster, Magazine, Product, Surreal)

## Architecture & Data Sources (MANDATORY READ)
You **MUST** read these files to execute the skill logic. Do not guess.

1.  **The Vault**: `styles/premium/master-collection.md`
2.  **The Engine**: `engine/style-mixer.md` & `engine/micro-innovation.md`
3.  **The Templates**: Select dynamically from `prompt-templates/*.md`

## The Workflow (Strict Execution Path)

1.  **Analyze Intent & Route**:
    *   Magazine/Fashion? -> `prompt-templates/editorial-spread.md`
    *   Product/Object? -> `prompt-templates/product-showcase.md`
    *   Dream/Concept? -> `prompt-templates/surreal-concept.md`
    *   Default/Info? -> `prompt-templates/structural-poster.md`

2.  **Select Base Style**:
    *   **Action**: Read `styles/premium/master-collection.md`.
    *   **Fallback**: If user style unknown, infer closest match or default to `apple-pro`.

3.  **Roll the Dice (Mixer)**:
    *   **Action**: Read `engine/style-mixer.md`.
    *   **Logic**: Randomly select ONE `Material Twist` and ONE `Lighting Modifier`.
    *   **Conflict Check**: Apply "Harmony & Conflict Resolution" rules from the file.

4.  **Inject Innovation**:
    *   **Action**: Read `engine/micro-innovation.md`.
    *   **Logic**: Find a metaphor for the subject.

5.  **Generate Output**:
    *   **Action**: Fill the selected template.

## Output Format

Return the result in a code block.

```markdown
**🎨 Aesthetic Copilot: Generated Prompt**

> **Template**: [Selected Template Name]
> **Style DNA**: [Base Style] + [Material Twist] + [Lighting Modifier]
> **Concept**: [Brief explanation of the Micro-Innovation]

```plaintext
[Insert Content from Selected Template, filled with generated values]
```
```

## Anti-Patterns
- **Do not** use `structural-poster` for everything. Route correctly.
- **Do not** pick the first item in the mixer list. Be random.
