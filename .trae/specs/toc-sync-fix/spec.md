# Table of Contents Sync and Animation Fix Spec

## Why
The article table of contents (TOC) currently fails to highlight the correct heading when clicking or scrolling, often syncing with the wrong section. Additionally, the liquid glass background of the active item lacks a smooth sliding animation when transitioning between headings.

## What Changes
- Replace `IntersectionObserver` in `useIntersectionObserver.ts` with a robust `scroll` event listener approach to accurately determine the active heading based on viewport position.
- Update `TableOfContents.tsx` to use `motion.span` with a `layoutId` for the `.toc-pill` active indicator, enabling a smooth liquid glass sliding effect when the active heading changes.

## Impact
- Affected specs: Article reading experience.
- Affected code: `src/hooks/useIntersectionObserver.ts`, `src/components/TableOfContents.tsx`.

## MODIFIED Requirements
### Requirement: TOC Active State Sync
- **WHEN** user scrolls the article or clicks a TOC item
- **THEN** the TOC must accurately highlight the heading currently at the top of the viewport.
- **AND** the active item's liquid glass background must animate smoothly from the previously active item.
