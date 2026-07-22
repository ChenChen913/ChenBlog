
# Text Animations

## Typewriter Effect
Based on `useCurrentFrame()`, reduce the string character by character.

```tsx
import { useCurrentFrame } from "remotion";

export const Typewriter = ({text}: {text: string}) => {
  const frame = useCurrentFrame();
  // Show 1 character every 5 frames
  const charsShown = Math.floor(frame / 5);
  const textToShow = text.slice(0, charsShown);
  
  return <div>{textToShow}</div>;
};
```

## Best Practices
- Always use string slicing for typewriter effects. 
- Never use per-character opacity if possible (performance).
- Ensure you measure text if you need to fit it in a container.
