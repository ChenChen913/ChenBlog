---
name: object-describer
description: Use when the user wants to describe common objects (fruits, daily items) using a high-fidelity "Bento Grid" or "Instructional Poster" visual style.
---

# Object Visionary (formerly Object Describer)

## Overview
This skill acts as a **Creative Director for AI Art Generation**. It transforms simple object inputs into complex, commercial-grade visual prompts by applying a multi-layer architectural approach: **Style Vault -> Layout -> Micro-Innovation Engine**.

**Goal**: Generate professional, "un-average" images that look like high-end commercial design, ensuring 365 days of unique variety.

## 📂 File Map (The Architecture)

### 1. The Vault (Assets)
*   `styles/materials.md`: Library of textures (Frosted Glass, Vantablack, Washi...).
*   `styles/lighting.md`: Library of atmospheres (Studio, God Rays, Neon...).
*   `styles/palettes.md`: Color logic (90/10 Rule, Pastel, Void...).

### 2. The Skeleton (Layouts)
*   `layouts/bento-grid.md`: Info-dense product display.
*   `layouts/editorial-poster.md`: Step-by-step DIY guide.
*   `layouts/museum-display.md`: Minimalist artifact focus.
*   `layouts/floating-composition.md`: High-energy dynamic ad.

### 3. The Brain (Engines)
*   `engine/style-recommender.md`: Maps keywords ("Tech") to Styles ("Cyber-Industrial").
*   `engine/micro-innovator.md`: Adds the "Twist" (e.g., Apple -> Glass Apple).
*   `engine/combinatorial-logic.md`: **Randomization logic for infinite variety.**

## When to Use
*   User wants to visualize an object (fruit, tech, etc.).
*   User asks for "Bento Grid", "Poster", or "Product Shot".
*   User wants "Natural Language Painting" with high fidelity.

## The Workflow (Strict Execution)

1.  **Analyze & Recommend**:
    *   Identify Subject (e.g., "Headphones").
40.    *   **Action**: Check `engine/style-recommender.md`.
    41.    *   *Output*: Recommended Style Preset (or "Random" if ambiguous).
    42.    *   **Override Rule**: If user specifies a color/material (e.g., "Pink Tech"), the User's specific choice OVERRIDES the Style Preset's default.

43.  **Select Layout**:
    *   Info/Stats? -> `bento-grid.md`
    *   Process/How-to? -> `editorial-poster.md`
    *   Premium Food/Dish? -> `premium-food-infographic.md`
    *   Art/Beauty? -> `museum-display.md`
    *   Ad/Excitement? -> `floating-composition.md`

3.  **Inject Innovation (The Twist)**:
    *   **Action**: Read `engine/micro-innovator.md`.
    *   *Logic*: Apply a metaphor or material twist.
    *   **Safeguard**: Check **CORE PRINCIPLE** in `micro-innovator.md`. If subject is natural, REJECT twists that change its material (e.g., Glass Fruit) unless user explicitly requested "Sci-Fi" or "Abstract".
    *   **EXCEPTION**: If Layout is `premium-food-infographic.md`, **FORCE Twist to "Hyper-Fresh"**. Do NOT use abstract twists like "X-Ray" or "Anti-Gravity". The goal is Culinary Perfection.

4.  **Roll the Dice (Combinatorial Pass)**:
    *   **Action**: Read `engine/combinatorial-logic.md`.
    *   *Logic*: If specific style NOT enforced, roll for Material/Lighting/Palette.
    *   **EXCEPTION**: If Layout is `premium-food-infographic.md`, **SKIP Random Roll**. Use the template's defined "Editorial/Organic" palette (Frosted Glass + White Linework + Natural Light). Do not apply conflicting styles like "Neon" or "Vantablack".
    *   **Constraint**: Resolve conflicts using the logic in the file.

5.  **Generate Prompt**:
    *   **Data Injection**: If the object requires specific data (e.g., calories, release year) and you don't know it, **USE WebSearch** to find accurate info. Do not hallucinate numbers if possible.
    *   **Bilingual Enforcement**: For `premium-food-infographic.md`, ensure Main Title, Ingredients, and Provenance are **Bilingual (Chinese + English)**.
    *   Assemble all layers into the selected Layout Template.
    *   **Language**: Use professional design terminology (from the Vault).

## Output Format

```markdown
**🎨 Object Visionary: Generated Prompt**

> **Subject**: [Object Name]
> **Concept**: [Micro-Innovation Twist]
> **Layout**: [Selected Layout]
> **Style DNA**: [Material] + [Lighting] + [Palette]

```plaintext
[Insert the fully filled prompt here]
```
```

## Anti-Patterns
*   **Do not** default to "Frosted Acrylic" every time. Use the Combinatorial Logic.
*   **Do not** produce "average" images. Always apply a Micro-Innovation Twist.
*   **Do not** ignore the Layout structure.
*   **Do not** change the material of natural objects (e.g., turning fruit into glass) unless explicitly requested by the Twist or User. Default to "Hyper-Realism" for nature.
