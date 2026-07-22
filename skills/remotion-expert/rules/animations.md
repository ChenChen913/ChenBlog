
# Fundamental Animation Skills

## Core Principle
All animations MUST be driven by the `useCurrentFrame()` hook.
Write animations in seconds and multiply them by the fps value from `useVideoConfig()`.

## Example: Fade In
```tsx
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const FadeIn = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 1 * fps], [0, 1], {
    extrapolateRight: 'clamp',
  });
 
  return (
    <div style={{ opacity }}>Hello World!</div>
  );
};
```

## Forbidden Practices
- **CSS transitions** are FORBIDDEN - they will not render correctly.
- **CSS animations** (@keyframes) are FORBIDDEN - they will not render correctly.
- **Tailwind animation class names** (like `animate-spin`) are FORBIDDEN.

## Spring Animations
For more natural movement, use the `spring` function.

```tsx
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

const scale = spring({
  frame,
  fps,
  config: {
    damping: 200,
  },
});

<div style={{ transform: `scale(${scale})` }} />
```
