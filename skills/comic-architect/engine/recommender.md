# Style Recommender Logic

This module maps User Intent -> Style/Layout Combinations.

## Logic Flow

1.  **Analyze User Input**: Extract keywords, mood, and content type.
2.  **Match Category**:
    *   **Educational/Explained** -> "Scientific & Technical" OR "Minimalist & Clean"
    *   **Story/Narrative** -> "Comic & Narrative" OR "Artistic & Expressive"
    *   **Product/Promo** -> "Modern & Trendy" OR "Minimalist & Clean"
    *   **Nostalgia/Memory** -> "Retro & Nostalgic" OR "Narrative & Cinematic"
    *   **Abstract/Concept** -> "Artistic & Expressive" OR "Modern & Trendy"

3.  **Recommend 3 Distinct Options**:
    *   **Option A (Safe/Classic)**: The most expected style (e.g., Notion style for notes).
    *   **Option B (Bold/Creative)**: A strong stylistic choice (e.g., Cyberpunk for notes).
    *   **Option C (Twist/Avant-Garde)**: A mix that shouldn't work but does (e.g., Ukiyo-e + 3D Clay).

## Mapping Table (Examples)

| User Content | Safe Option | Bold Option | Twist Option |
| :--- | :--- | :--- | :--- |
| **"How Coffee is Made"** | **Style**: Hand-Drawn Infographic<br>**Layout**: Flowchart | **Style**: Industrial Blueprint<br>**Layout**: Isometric View | **Style**: Risograph Zine<br>**Layout**: Bento Grid |
| **"My Day at Work"** | **Style**: 4-Panel Comic (Clean)<br>**Layout**: 2x2 Grid | **Style**: Pixel Art RPG<br>**Layout**: Game HUD | **Style**: Claymorphism 3D<br>**Layout**: Diorama |
| **"Future of AI"** | **Style**: Apple Pro (Clean Tech)<br>**Layout**: Dashboard | **Style**: Cyberpunk Neon<br>**Layout**: Glitch Overlay | **Style**: Renaissance Oil Painting<br>**Layout**: Golden Spiral |
| **"Healthy Eating"** | **Style**: Notion Line Art<br>**Layout**: Knolling | **Style**: Pop Art<br>**Layout**: Magazine Cover | **Style**: 80s Vaporwave<br>**Layout**: Floating Geometry |

## Usage
When the user gives a vague prompt ("Draw something about AI"), query this logic to present options BEFORE generating the final prompt.
