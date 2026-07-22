# 🎛️ City Mixer Engine (v2.3)

This engine adds variety to city prompts by randomizing atmospheric and cinematic variables.

## 1. Weather & Atmosphere
*Select randomly based on Timestamp (Seconds % 6)*
1.  **Clear Sunny**: `High contrast, deep blue sky, sharp shadows`
2.  **Golden Hour**: `Warm amber light, long shadows, emotional vibe`
3.  **Blue Hour**: `Deep twilight blue, city lights turning on, cinematic`
4.  **Misty/Foggy**: `Soft diffusion, mystery, volumetric light rays`
5.  **Rainy/Neon**: `Wet ground reflections, cyberpunk neon glow, dramatic`
6.  **Snowy**: `Soft white overlay, cozy atmosphere, muted colors`

## 2. Camera Angles
*Select randomly based on Timestamp (Minutes % 5)*
1.  **Drone Eye**: `Top-down 90 degree view, map-like`
2.  **Isometric**: `45 degree angle, perfect geometry, miniature feel`
3.  **Worm's Eye**: `Looking up from street level, imposing scale`
4.  **Macro**: `Extreme close-up on details, shallow depth of field`
5.  **Wide Cinematic**: `Panoramic view, epic scale, establishing shot`

## 3. Harmony & Conflict Resolution (CRITICAL)
The engine MUST resolve physical contradictions between Style, Weather, and Twist.

*   **Conflict**: `Paper Craft` (Style) + `Rainy` (Weather).
    *   **Resolution**: Change Rain to "Glossy Varnish" or "Resin Coating" to protect the paper.
*   **Conflict**: `Solar Punk` (Twist) + `Cyber Noir` (Twist - implied).
    *   **Resolution**: Choose ONE. Solar Punk wins if "Daytime", Cyber Noir wins if "Night".
*   **Conflict**: `Isometric` (Camera) + `Worm's Eye` (Camera).
    *   **Resolution**: Isometric overrides Worm's Eye for "Miniature/Lego/Capsule" templates. Worm's Eye overrides for "Cinematic Realism".
*   **Conflict**: `Lego` (Style) + `Mist` (Weather).
    *   **Resolution**: Use "Translucent Cotton Wool" blocks to represent mist.
*   **Conflict**: `Anti-Gravity` (Innovation) + `Rain` (Weather).
    *   **Resolution**: Rain drops must fall *upwards* or swirl around the floating island in zero-G patterns.
*   **Conflict**: `Crystal Capsule` (Template) + `Drone Eye` (Camera).
    *   **Resolution**: Change Camera to `Macro` or `Product Shot` (Side View) to see the capsule's contents clearly.

## 4. Vibe Protection Protocol (Historical vs. Future)
Ensure the "Time Period" doesn't clash with the "Style", **UNLESS explicitly requested as a mashup**.

*   **If User says**: "Historical", "Ancient", "Traditional" (without "Sci-Fi/Future").
    *   **DEFAULT ACTION**: Disable `Cyber Noir`, `Neon`, `Holographic`.
    *   **EXCEPTION**: If user says "Steampunk" or "Time Travel", ALLOW the mix but ensure materials look "Antique" (e.g., Brass holograms).
*   **If User says**: "Future", "Sci-Fi" (without "Retro").
    *   **DEFAULT ACTION**: Disable `Sepia`, `Vintage Paper`.
    *   **EXCEPTION**: If user says "Retro-Futurism" or "Fallout Style", ALLOW the mix.
