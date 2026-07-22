# Template: Comic Strip (2x2 Grid)

**Type**: Pre-configured Layout
**Style**: Narrative / Anime / Comic
**Layout**: 2x2 Grid (4 Panels)

## Execution Logic

1.  **Analyze Story**: Break the user's input into 4 distinct steps (Setup, Conflict, Action, Resolution).
2.  **Translate**: Convert the story description into **ENGLISH**.
3.  **Generate Prompt**:

```markdown
**🎨 Comic Architect: Generated Prompt (Comic Strip)**

> **Concept**: [Brief 1-sentence summary]
> **Layout**: 2x2 Comic Grid
> **Style**: Clean Anime/Manga Lineart

```plaintext
/imagine prompt: A 4-panel comic strip (2x2 grid) showing [Story Summary].
-- Panel 1 (Top-Left): [Step 1 Description]
-- Panel 2 (Top-Right): [Step 2 Description]
-- Panel 3 (Bottom-Left): [Step 3 Description]
-- Panel 4 (Bottom-Right): [Step 4 Description]
Style: Clean digital anime lineart, flat colors, cell shading.
Text: [Optional: Speech bubbles with English text if relevant, otherwise "no text"].
--ar 3:4 --niji 6 --style raw
```
```
