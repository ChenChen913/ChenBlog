# 🤖 The Engine: Style Recommender

## Logic
This engine maps User Intent keywords to specific Style Presets.

## Keyword Mapping

### IF User Input contains:
*   `"Clean"`, `"Tech"`, `"Apple"`, `"Modern"`
    *   **Recommendation**: **"Neo-Minimalism"**
    *   **Material**: Frosted Acrylic + Aluminum
    *   **Lighting**: Softbox Studio
    *   **Palette**: Cool Greys + White

### IF User Input contains:
*   `"Nature"`, `"Organic"`, `"Eco"`, `"Food"`, `"Dish"`, `"Cuisine"`
    *   **Recommendation**: **"Organic Modernism"**
    *   **Material**: Washi Paper + Raw Wood/Stone (or Frosted Glass for Infographics)
    *   **Lighting**: Golden Hour or Dappled Sunlight
    *   **Palette**: Earth Tones (Sage, Terracotta, Cream)

### IF User Input contains:
*   `"Future"`, `"Cyber"`, `"Gaming"`, `"Dark"`
    *   **Recommendation**: **"Cyber-Industrial"**
    *   **Material**: Vantablack + Neon + Carbon Fiber
    *   **Lighting**: Neon Noir
    *   **Palette**: The "Void" Palette

### IF User Input contains:
*   `"Luxury"`, `"Premium"`, `"Expensive"`
    *   **Recommendation**: **"Gilded Age"**
    *   **Material**: Marble + Gold Leaf + Velvet
    *   **Lighting**: Rembrandt (Dramatic)
    *   **Palette**: Black + Gold + Deep Emerald

### IF User Input contains:
*   `"Dream"`, `"Soft"`, `"Art"`
    *   **Recommendation**: **"Ethereal Dream"**
    *   **Material**: Aerogel + Holographic Foil
    *   **Lighting**: Bioluminescence or Pastel Haze
    *   **Palette**: Pastels (Pink, Lilac, Baby Blue)

## Default Fallback
If no keywords match, engage **Combinatorial Logic** (Random Roll) to ensure variety.
