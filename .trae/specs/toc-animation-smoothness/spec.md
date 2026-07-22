# TOC Animation Smoothness Fix Spec

## Why
When scrolling rapidly or clicking on TOC items that are far apart, the liquid glass active indicator animation appears unsmooth or jerky. This is likely due to the lack of explicit transition physics for Framer Motion's `layoutId` and potential rapid sequential state updates causing intermediate layout calculations.

## What Changes
- Add a custom `transition` configuration (e.g., spring physics with defined stiffness/damping) to the `motion.span` elements in `TableOfContents.tsx` to ensure smooth trajectory and speed when moving over long distances.
- Optimize the scroll event handler in `useIntersectionObserver.ts` using `requestAnimationFrame` to prevent excessive state calculations and potential React render jitter during very fast scrolling.

## Impact
- Affected specs: Article reading experience, TOC interaction.
- Affected code: `src/components/TableOfContents.tsx`, `src/hooks/useIntersectionObserver.ts`.

## MODIFIED Requirements
### Requirement: Smooth TOC Animation
- **WHEN** user scrolls rapidly or clicks distant TOC items
- **THEN** the liquid glass indicator must animate smoothly without jitter or visual tearing.
