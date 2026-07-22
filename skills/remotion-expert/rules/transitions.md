
# Transitions

## Prerequisites
Install `@remotion/transitions`:
```bash
npm install @remotion/transitions
```

## Using TransitionSeries
Use `<TransitionSeries>` to animate between multiple scenes or clips.

```tsx
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';

export const MyVideo = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}>
        <SceneA />
      </TransitionSeries.Sequence>
      
      <TransitionSeries.Transition 
        presentation={fade()} 
        timing={linearTiming({durationInFrames: 15})} 
      />
      
      <TransitionSeries.Sequence durationInFrames={60}>
        <SceneB />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
```

## Available Transitions
- `fade`: Opacity fade
- `slide`: Sliding (supports `direction: 'from-left'`, etc.)
- `wipe`: Wiping effect
- `flip`: 3D flip
- `clockWipe`: Clock wipe effect

## Timing
- `linearTiming({durationInFrames: 20})`
- `springTiming({config: {damping: 200}})`
