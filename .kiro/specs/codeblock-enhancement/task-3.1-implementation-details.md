# Task 3.1 Implementation Details

## Header Component Structure

### HTML Structure
```tsx
<div className="not-prose my-6 rounded-lg shadow-md dark:shadow-zinc-900/50">
  {/* Header Section */}
  <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-b from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-800 rounded-t-lg border border-b-0 border-zinc-200 dark:border-zinc-700">
    
    {/* Left Side: Window Controls + Language Label */}
    <div className="flex items-center gap-2.5">
      
      {/* macOS Window Controls */}
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
      </div>
      
      {/* Language Label */}
      <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
        {language}
      </span>
    </div>
    
    {/* Right Side: Copy Button */}
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md
                 text-zinc-600 dark:text-zinc-300
                 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60
                 active:scale-95
                 transition-all duration-150"
      aria-label={copied ? 'Copied!' : 'Copy code'}
    >
      {/* Copy button content */}
    </button>
  </div>
  
  {/* Code Content Section */}
  <div className="rounded-b-lg overflow-hidden border border-t-0 border-zinc-200 dark:border-zinc-700">
    {/* Code content */}
  </div>
</div>
```

## Styling Breakdown

### Container Styling
- `not-prose`: Disables prose styling from parent
- `my-6`: Vertical margin (1.5rem top and bottom)
- `rounded-lg`: Border radius (0.5rem)
- `shadow-md`: Medium box shadow for depth
- `dark:shadow-zinc-900/50`: Dark mode shadow with 50% opacity

### Header Styling
- `flex items-center justify-between`: Flexbox with space-between alignment
- `px-4 py-2`: Padding (1rem horizontal, 0.5rem vertical)
- `bg-gradient-to-b from-zinc-100 to-zinc-50`: Light mode gradient
- `dark:from-zinc-900 dark:to-zinc-800`: Dark mode gradient
- `rounded-t-lg`: Top border radius only
- `border border-b-0`: Border on all sides except bottom
- `border-zinc-200 dark:border-zinc-700`: Theme-aware border color

### Window Controls Styling
- Container: `flex gap-1.5` (0.375rem gap between dots)
- Each dot:
  - `w-2.5 h-2.5`: Size (0.625rem = 10px)
  - `rounded-full`: Perfect circle
  - `bg-red-500/80`: Red with 80% opacity
  - `bg-yellow-500/80`: Yellow with 80% opacity
  - `bg-green-500/80`: Green with 80% opacity

### Language Label Styling
- `text-xs`: Font size (0.75rem)
- `font-bold`: Bold font weight (700)
- `uppercase`: Text transform to uppercase
- `tracking-wider`: Letter spacing (0.05em)
- `text-zinc-600`: Light mode text color
- `dark:text-zinc-300`: Dark mode text color

### Copy Button Styling
- `flex items-center gap-1.5`: Flexbox with gap
- `px-2.5 py-1`: Padding
- `text-xs font-medium`: Font styling
- `rounded-md`: Border radius (0.375rem)
- `text-zinc-600 dark:text-zinc-300`: Theme-aware text color
- `hover:bg-zinc-200/60`: Light mode hover background
- `dark:hover:bg-zinc-700/60`: Dark mode hover background
- `active:scale-95`: Scale down on click
- `transition-all duration-150`: Smooth transitions

### Responsive Behavior
- Copy button text: `hidden sm:inline`
  - Hidden on mobile (< 640px)
  - Visible on small screens and up (≥ 640px)

## Color Palette

### Light Mode
- Background gradient: `#f4f4f5` → `#fafafa` (zinc-100 → zinc-50)
- Text color: `#52525b` (zinc-600)
- Border color: `#e4e4e7` (zinc-200)
- Dot colors: Red, Yellow, Green with 80% opacity

### Dark Mode
- Background gradient: `#18181b` → `#27272a` (zinc-900 → zinc-800)
- Text color: `#d4d4d8` (zinc-300)
- Border color: `#3f3f46` (zinc-700)
- Shadow: `#18181b` with 50% opacity (zinc-900/50)

## Accessibility Features

### ARIA Labels
- Copy button has descriptive `aria-label`
- Label changes based on state: "Copy code" → "Copied!"

### Keyboard Navigation
- Copy button is focusable via Tab key
- Button can be activated with Enter or Space

### Visual Feedback
- Hover state on copy button
- Active state with scale animation
- Color change on successful copy

### Screen Reader Support
- Semantic HTML structure
- Descriptive labels for all interactive elements

## Browser Compatibility

### CSS Features Used
- Flexbox: Supported in all modern browsers
- CSS Grid: Not used in header
- Gradient backgrounds: Supported in all modern browsers
- Border radius: Supported in all modern browsers
- Box shadow: Supported in all modern browsers
- Opacity: Supported in all modern browsers
- Transitions: Supported in all modern browsers

### Tailwind CSS Classes
All classes are standard Tailwind v4 utilities with excellent browser support.

## Performance Considerations

### Rendering Performance
- No complex calculations in render
- Memoized language extraction
- Efficient event handlers

### CSS Performance
- Uses Tailwind's optimized CSS
- No custom CSS animations
- Hardware-accelerated transforms (scale)

### Bundle Size Impact
- Minimal additional code
- Reuses existing Tailwind classes
- No additional dependencies

## Testing Coverage

### Unit Tests (21 tests)
1. **macOS window controls** (3 tests)
   - Renders exactly three dots
   - Dots have correct colors
   - Dots have correct size

2. **Language label** (5 tests)
   - Displays language label
   - Label is uppercase
   - Label is bold
   - Label has proper text size
   - Label has tracking

3. **Responsive layout** (3 tests)
   - Header uses flexbox
   - Header has proper spacing
   - Copy button text hidden on mobile

4. **Visual styling** (6 tests)
   - Container has rounded corners
   - Container has shadow
   - Header has rounded top corners
   - Header has gradient background
   - Header has border
   - Background differentiates from page

5. **Header structure** (2 tests)
   - Contains all required elements
   - Elements are properly grouped

6. **Theme support** (2 tests)
   - Header has dark mode classes
   - Label has dark mode text color

### Integration Tests (15 tests)
- Code extraction integration
- Language detection integration
- Error handling integration
- Component structure validation

## Future Enhancements

### Potential Improvements
1. Add animation on theme switch
2. Add tooltip on hover for window controls
3. Add keyboard shortcuts for copy (Ctrl+C)
4. Add visual indicator for code language
5. Add support for custom themes

### Accessibility Improvements
1. Add focus trap for keyboard navigation
2. Add screen reader announcements for theme changes
3. Add high contrast mode support
4. Add reduced motion support

## Maintenance Notes

### Code Location
- Main component: `src/components/CodeBlock.tsx`
- Type definitions: `src/components/CodeBlock.types.ts`
- Tests: `src/components/CodeBlockHeader.test.tsx`
- Integration tests: `src/components/CodeBlock.test.tsx`

### Dependencies
- React 19
- Tailwind CSS 4.1
- Lucide React (for icons)
- TypeScript 5.8

### Related Files
- Theme detection: `src/utils/theme-detection.ts`
- Code extraction: `src/utils/code-extraction.ts`

### Breaking Changes
None. This is an enhancement to existing functionality.

### Migration Notes
No migration needed. The component is backward compatible.
