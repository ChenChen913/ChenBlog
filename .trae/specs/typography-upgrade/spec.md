# Typography Upgrade with Fallback Strategy Spec

## Why
The user wants to upgrade the blog's typography to use the "LXGW WenKai Screen" (霞鹜文楷) font for article content to enhance the reading experience with a traditional, warm vibe. The upgrade must use a CDN for performance but requires a robust fallback strategy to default system fonts if the CDN fails, and a configuration hook to easily switch to local font files if desired in the future. UI elements should retain modern sans-serif fonts for contrast.

## What Changes
- Add the LXGW WenKai Screen CDN link to `index.html`.
- Update Tailwind config (`tailwind.config.js` or `index.css`) to define new font families: a serif/kai font stack (CDN -> Local Hook -> System Fallback) and a sans-serif stack for UI.
- Apply the new serif/kai font specifically to the `.article-body` class (Markdown content) and headings, while keeping the rest of the site (navigation, sidebar, metadata) in sans-serif.
- Add a CSS variable hook (`--font-local-kai`) that can be easily overridden to point to a local TTF file if needed later.

## Impact
- Affected specs: Global typography, Article reading experience.
- Affected code: `index.html`, `src/index.css`.

## ADDED Requirements
### Requirement: Typography System
The system SHALL provide a mixed typography design:
- Article body and headings use "LXGW WenKai Screen" via CDN.
- UI elements use modern sans-serif fonts.
- A fallback font stack must be defined to gracefully degrade to system fonts (e.g., system-ui, sans-serif) if the CDN fails.
- A local font CSS hook must be established, allowing easy switching to local TTF files without rewriting the entire font stack.