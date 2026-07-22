# Implementation Plan: CodeBlock Enhancement

## Overview

This plan implements a modern code block component for blog articles, migrating from react-syntax-highlighter to Shiki for better performance and theme integration. The implementation includes line numbers with word wrap support, copy functionality, macOS-style visual design, and full accessibility compliance.

## Tasks

- [x] 1. Set up Shiki integration and theme configuration
  - Install and configure Shiki with rehype-pretty-code plugin
  - Create theme configuration for light/dark modes (github-light/github-dark)
  - Set up dual-theme support for inline theme switching
  - Create utility function for theme detection with fallbacks
  - _Requirements: 4.1, 4.4, 6.1, 6.2, 7.2_

- [ ]* 1.1 Write property test for theme synchronization
  - **Property 16: Theme-Synchronized Syntax Colors**
  - **Validates: Requirements 4.4, 6.1, 6.2**

- [ ] 2. Implement core CodeBlock component structure
  - [x] 2.1 Create TypeScript interfaces for component props and state
    - Define CodeBlockProps, CodeBlockState, CodeBlockHeaderProps, CodeBlockContentProps
    - Define ThemeConfig and A11yMetadata interfaces
    - _Requirements: 5.2, 8.1, 8.2_

  - [x] 2.2 Implement CodeBlock container component
    - Set up component with props interface
    - Implement theme detection using MutationObserver
    - Add fallback to prefers-color-scheme media query
    - Implement error boundaries for graceful degradation
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 2.3 Create utility functions for code extraction and language detection
    - Implement extractCodeText() to handle ReactMarkdown children
    - Implement getLanguageFromClassName() with language alias mapping
    - Add defensive type checking for edge cases
    - _Requirements: 4.1, 4.3_

- [ ] 3. Implement CodeBlockHeader component
  - [x] 3.1 Create header with macOS window controls and language label
    - Render three colored circular dots (red, yellow, green)
    - Display language label with proper styling
    - Apply responsive layout with Tailwind CSS
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ]* 3.2 Write property test for header structure
    - **Property 18: Header Structure Completeness**
    - **Validates: Requirements 5.2**

  - [x] 3.3 Implement copy button with state management
    - Add copy button with Lucide React icons (Copy, Check)
    - Implement copied state with 2-second timeout
    - Add hover effects and transitions
    - _Requirements: 3.1, 3.5_

  - [ ]* 3.4 Write property tests for copy button
    - **Property 9: Copy Button Presence**
    - **Validates: Requirements 3.1**
    - **Property 13: Copy Button Hover Feedback**
    - **Validates: Requirements 3.5**

- [ ] 4. Implement copy functionality with clipboard API
  - [-] 4.1 Create copyToClipboard utility with fallback
    - Implement primary method using navigator.clipboard.writeText()
    - Add fallback using document.execCommand('copy')
    - Implement error handling and logging
    - _Requirements: 3.2, 3.4_

  - [ ] 4.2 Add visual feedback for copy operations
    - Show success feedback with icon change
    - Display error messages on failure
    - Implement 2-second feedback timeout
    - _Requirements: 3.3, 3.4_

  - [ ]* 4.3 Write property tests for copy functionality
    - **Property 10: Copy Functionality Correctness**
    - **Validates: Requirements 3.2**
    - **Property 11: Copy Feedback Timing**
    - **Validates: Requirements 3.3**
    - **Property 12: Copy Error Handling**
    - **Validates: Requirements 3.4**

- [ ] 5. Checkpoint - Ensure header and copy functionality work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement CodeBlockContent with line numbers
  - [ ] 6.1 Create line number rendering logic
    - Generate line numbers based on code line count
    - Implement right-aligned styling with appropriate spacing
    - Use theme-aware colors with lower contrast
    - _Requirements: 1.1, 1.4, 1.5_

  - [ ]* 6.2 Write property tests for line numbers
    - **Property 1: Line Number Display Completeness**
    - **Validates: Requirements 1.1**
    - **Property 4: Line Number Styling Consistency**
    - **Validates: Requirements 1.4, 1.5**

  - [ ] 6.3 Implement line number selection exclusion
    - Use CSS user-select: none for line numbers
    - Ensure only code content is selectable
    - Test copy behavior excludes line numbers
    - _Requirements: 1.3_

  - [ ]* 6.4 Write property test for selection exclusion
    - **Property 3: Line Number Selection Exclusion**
    - **Validates: Requirements 1.3**

- [ ] 7. Implement word wrap with line number alignment
  - [ ] 7.1 Create CSS Grid layout for word wrap
    - Use grid-template-columns: auto 1fr
    - Set line numbers to align-self: start
    - Apply white-space: pre-wrap to code content
    - _Requirements: 2.1, 2.4_

  - [ ] 7.2 Implement indentation preservation on wrap
    - Maintain visual indentation structure
    - Ensure continuation lines align properly
    - Test with various indentation levels
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ]* 7.3 Write property tests for word wrap
    - **Property 5: Word Wrap Activation**
    - **Validates: Requirements 2.1**
    - **Property 2: Line Number Alignment on Wrap**
    - **Validates: Requirements 1.2, 2.3**
    - **Property 6: Indentation Preservation on Wrap**
    - **Validates: Requirements 2.2**
    - **Property 7: Continuation Line Alignment**
    - **Validates: Requirements 2.4**

  - [ ] 7.4 Ensure copy preserves original format
    - Verify copied text matches original source
    - Test that word wrap doesn't affect clipboard content
    - _Requirements: 2.5_

  - [ ]* 7.5 Write property test for copy format preservation
    - **Property 8: Copy Preserves Original Format**
    - **Validates: Requirements 2.5**

- [ ] 8. Implement syntax highlighting with Shiki
  - [ ] 8.1 Create highlightCode utility function
    - Implement async highlighting with Shiki
    - Add caching mechanism for performance
    - Handle unsupported languages with plain text fallback
    - _Requirements: 4.1, 4.3, 7.4_

  - [ ] 8.2 Integrate highlighted HTML into component
    - Render Shiki HTML output safely
    - Apply theme-specific syntax colors
    - Ensure monospace font application
    - _Requirements: 4.1, 4.4, 5.3_

  - [ ]* 8.3 Write property tests for syntax highlighting
    - **Property 14: Language-Specific Syntax Highlighting**
    - **Validates: Requirements 4.1**
    - **Property 15: Plain Text Fallback**
    - **Validates: Requirements 4.3**
    - **Property 19: Monospace Font Application**
    - **Validates: Requirements 5.3**

- [ ] 9. Checkpoint - Ensure core rendering works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement visual styling and theming
  - [ ] 10.1 Apply macOS-style visual design
    - Add border-radius and box-shadow
    - Implement background color differentiation
    - Style window controls with proper colors
    - _Requirements: 5.1, 5.5_

  - [ ]* 10.2 Write property tests for visual styling
    - **Property 17: Visual Styling Presence**
    - **Validates: Requirements 5.1**
    - **Property 20: Background Color Differentiation**
    - **Validates: Requirements 5.5**

  - [ ] 10.3 Implement smooth theme transitions
    - Add CSS transitions for color changes
    - Prevent visual flashing during theme switch
    - Test transition smoothness
    - _Requirements: 6.4_

  - [ ]* 10.4 Write property test for theme transitions
    - **Property 22: Theme Transition Smoothness**
    - **Validates: Requirements 6.4**

  - [ ] 10.5 Implement responsive layout
    - Test layouts from 320px to 2560px viewport width
    - Ensure no horizontal overflow
    - Verify word wrap works on mobile
    - _Requirements: 5.6, 7.5_

  - [ ]* 10.6 Write property test for responsive layout
    - **Property 21: Responsive Layout Integrity**
    - **Validates: Requirements 5.6**

- [ ] 11. Implement performance optimizations
  - [ ] 11.1 Add lazy loading with Intersection Observer
    - Defer highlighting for off-screen code blocks
    - Use 100px rootMargin for preloading
    - Implement loading skeleton for delayed blocks
    - _Requirements: 7.3_

  - [ ]* 11.2 Write property test for lazy rendering
    - **Property 24: Lazy Rendering for Off-Screen Blocks**
    - **Validates: Requirements 7.3**

  - [ ] 11.3 Implement highlight caching with LRU eviction
    - Create HighlightCache data structure
    - Implement cache key generation with hash
    - Add LRU eviction for memory management
    - _Requirements: 7.4_

  - [ ]* 11.4 Write property test for caching efficiency
    - **Property 25: Highlight Caching Efficiency**
    - **Validates: Requirements 7.4**

  - [ ] 11.5 Optimize for pages with multiple code blocks
    - Use requestIdleCallback for non-critical highlighting
    - Test performance with 20+ code blocks
    - Ensure smooth scrolling performance
    - _Requirements: 7.1, 7.5_

- [ ] 12. Implement accessibility features
  - [ ] 12.1 Add ARIA labels and semantic HTML
    - Add aria-label to copy button
    - Use semantic <pre> and <code> tags
    - Implement proper heading hierarchy
    - _Requirements: 8.1, 8.2_

  - [ ]* 12.2 Write property tests for ARIA and semantics
    - **Property 26: ARIA Label Presence**
    - **Validates: Requirements 8.1**
    - **Property 27: Semantic HTML Structure**
    - **Validates: Requirements 8.2**

  - [ ] 12.3 Implement keyboard accessibility
    - Ensure copy button is focusable via Tab
    - Enable activation via Enter and Space keys
    - Add visible focus indicators
    - _Requirements: 8.3_

  - [ ]* 12.4 Write property test for keyboard accessibility
    - **Property 28: Keyboard Accessibility**
    - **Validates: Requirements 8.3**

  - [ ] 12.5 Add screen reader announcements
    - Implement ARIA live region for copy feedback
    - Test with NVDA and VoiceOver
    - _Requirements: 8.4_

  - [ ]* 12.6 Write property test for screen reader announcements
    - **Property 29: Screen Reader Announcement**
    - **Validates: Requirements 8.4**

  - [ ] 12.7 Ensure WCAG AA contrast compliance
    - Verify code text contrast ≥4.5:1
    - Verify line number contrast ≥4.5:1
    - Verify button text contrast ≥4.5:1
    - Test in both light and dark themes
    - _Requirements: 1.5, 4.5, 6.3, 6.5, 8.5_

  - [ ]* 12.8 Write property test for WCAG contrast
    - **Property 23: WCAG Contrast Compliance**
    - **Validates: Requirements 1.5, 4.5, 6.3, 6.5, 8.5**

- [ ] 13. Checkpoint - Ensure all features work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Integration and final wiring
  - [ ] 14.1 Integrate CodeBlock into ReactMarkdown pipeline
    - Configure ReactMarkdown to use CodeBlock component
    - Set up rehype-pretty-code plugin
    - Test with various markdown code blocks
    - _Requirements: 4.1, 4.2_

  - [ ] 14.2 Remove old react-syntax-highlighter implementation
    - Uninstall react-syntax-highlighter package
    - Remove old CodeBlock component files
    - Update imports throughout codebase
    - _Requirements: 7.2_

  - [ ] 14.3 Test with real blog articles
    - Test with articles containing multiple code blocks
    - Verify performance on mobile devices
    - Test theme switching across entire page
    - _Requirements: 7.1, 7.5_

  - [ ]* 14.4 Write integration tests
    - Test multi-block performance
    - Test theme switching across all blocks
    - Test mobile responsiveness
    - Test cross-browser compatibility

- [ ] 15. Final checkpoint - Ensure all tests pass and feature is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- The design uses TypeScript with React, so all implementation will use TypeScript
- Shiki is already in project dependencies (v4.0.2) along with rehype-pretty-code (v0.14.3)
- Focus on incremental validation - each checkpoint ensures working functionality before proceeding
