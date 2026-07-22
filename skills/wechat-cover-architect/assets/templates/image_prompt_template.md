# WeChat Cover Image Prompt Template

This template is designed to generate high-fidelity image prompts for WeChat Official Account covers.

## Structure

```text
"{{Input Text}}"[/"{{English Translation}}"], {{Main Style}} fused with {{Material & Texture}}, {{Composition Pattern}}, Left side 70% features {{Main Visual Content}}, Right side 30% features {{Iconic/Symbolic Content}}, {{Lighting & Atmosphere}}, {{Color Palette}}, {{Typography DNA}}, {{Details & Decoration}}, {{Overall Visual Effect}}, {{Emotion & Atmosphere}}, High-level {{Style}} Visual --ar 3.35:1
```

## Field Definitions (Mapped to `references/design-matrix.md`)

- **Input Text**: The main text to be displayed.
- **Main Style**: From `Design Matrix > Core Styles`.
- **Material & Texture**: From `Design Matrix > Material & Textures`.
- **Composition Pattern**: **MUST** be "WeChat Dual-Panel". Forces a split layout where the Left (2.35:1) is the main cover and the Right (1:1) is the share icon.
- **Main Visual Content**: Description of the main scene for the article cover (Left side).
- **Iconic/Symbolic Content**: Description of a simplified, bold element for the share icon (Right side).
- **Lighting & Atmosphere**: From `Design Matrix > Lighting & Atmosphere`.
- **Color Palette**: From `Design Matrix > Color Palettes`.
- **Typography DNA**: From `Design Matrix > Typography DNA`.
- **Details & Decoration**: Specific elements derived from the Innovation Engine's metaphor logic.
- **Overall Visual Effect**: The total impact (e.g., "strong contrast", "dreamy").
- **Emotion & Atmosphere**: The feeling conveyed.
- **--ar 3.35:1**: **MANDATORY** aspect ratio. Generates the full canvas containing both the Main Cover (Left) and Share Icon (Right).
