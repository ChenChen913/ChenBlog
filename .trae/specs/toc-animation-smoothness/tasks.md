# Tasks
- [x] Task 1: Update `src/components/TableOfContents.tsx` to add `transition={{ type: "spring", stiffness: 250, damping: 25, mass: 1 }}` (or similar smooth parameters) to all `<motion.span layoutId="toc-pill" ...>` elements.
- [x] Task 2: Update `src/hooks/useIntersectionObserver.ts` to use `requestAnimationFrame` to throttle the `handleScroll` function, reducing calculation frequency to max once per frame.
- [x] Task 3: Perform 3 rounds of rigorous manual code review on the implementation to ensure no logical loopholes exist (especially regarding state updates and animation performance).
- [x] Task 4: Verify the smoothness in the running project.