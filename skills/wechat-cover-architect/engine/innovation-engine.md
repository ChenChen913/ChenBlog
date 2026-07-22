# Innovation Engine: The Intelligent Recommender

This engine implements the logic to transform vague user input into specific, high-fidelity design prompts using the `design-matrix`.

## Architecture Layer 3: The Brain

The engine operates in 4 stages:
1.  **Semantic Parsing**: Understand the core message and mood.
2.  **Base Selection**: Pick the primary Style and Layout.
3.  **Micro-Innovation Injection**: Apply non-random artistic twists.
4.  **Prompt Assembly**: Synthesize the final description.

## 1. Semantic Parsing Logic
*Input: "Daily Kanji Learning"*
- **Keywords**: "Learning", "Daily", "Culture", "Kanji".
- **Abstract Concepts**: Accumulation, Growth, Tradition, Persistence.
- **Mood**: Calm, Focused, Intellectual.

## 2. Micro-Innovation Strategies (The "Secret Sauce")

Instead of random selection, use these strategies to mix dimensions from the `design-matrix`.

### Strategy A: The Contrast (Conflict Aesthetics)
*Combine opposing concepts to create tension.*
- **Logic**: If Topic is "Soft/Traditional" -> Select "Hard/Modern" Material.
- **Example**: "Calligraphy" (Traditional) + "Neon Gas" (Modern Material) + "Industrial Hazard" (Color).
- **Result**: Cyber-Calligraphy.

### Strategy B: The Metaphor (Visualizing the Abstract)
*Translate abstract concepts into physical phenomena.*
- **Logic**:
    - "Growth" -> "Root System" or "Fractal".
    - "Speed/Efficiency" -> "Kinetic Type" or "Light Cut".
    - "Confusion/Puzzle" -> "Chaotic Collage" or "Glitch".
- **Example**: "Deep Learning" -> "Deep Ocean" (Palette) + "Mycelium/Roots" (Material).

### Strategy C: The Fusion (10% Twist)
*Keep 90% safe, add 10% unexpected.*
- **Logic**: Select Main Style + 1 random element from a *distant* category.
- **Example**: "Minimalist" (Style) + "Velvet" (Texture) -> "Warm Minimalism".

## 3. Pseudocode Implementation

```python
class DesignEngine:
    def generate_cover_design(self, user_input):
        # 1. Analyze Semantics
        context = self.analyze(user_input)
        # context = {topic: "AI", mood: "Future", abstract: "Intelligence"}
        
        # 2. Select Base DNA (Layer 1)
        base_style = self.select_style(context.mood) 
        # e.g., "Tech & Future" -> "Data"
        
        # 3. Select Layout (Layer 2)
        # Map complexity to layout
        if context.complexity == "High":
            layout = "Grid System"
        else:
            layout = "Central Focus" or "Negative Space Dominance"
            
        # 4. Inject Innovation (Layer 3)
        # Apply "Contrast" Strategy
        if base_style.is_digital():
            material = "Washi Paper" # Analog contrast
            lighting = "Natural Window Light" # Natural contrast
        else:
            material = "Hologram" # Digital contrast
            lighting = "Cyber Neon" # Artificial contrast
            
        # 5. Select Palette
        palette = self.match_palette(context.mood, strategy="Harmonious")
        
        # 6. Construct Prompt
        prompt = f"""
        Subject: {user_input.text}
        Style: {base_style} fused with {material} texture
        Layout: {layout}
        Lighting: {lighting}
        Palette: {palette}
        Vibe: High-level Commercial Design
        """
        return prompt
```

## 4. Diversity Calculation (The Promise)

To ensure "365 days of unique designs":

$$ Total Variations = Styles \times Layouts \times Materials \times Lighting \times Palettes $$

$$ 60 \times 15 \times 30 \times 20 \times 20 = 10,800,000 $$

Even with filtering for "sensible" combinations (keeping top 1%), we have **108,000** unique high-quality design directions. Enough for 295 years of daily covers.
