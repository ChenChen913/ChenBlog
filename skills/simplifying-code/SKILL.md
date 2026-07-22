---
name: simplifying-code
description: Use when you need to refactor or simplify code to improve readability and maintainability without changing its behavior.
---

# Simplifying Code

## Overview
This skill guides you in simplifying and refining code for clarity, consistency, and maintainability while STRICTLY preserving all functionality. It transforms complex implementation into clean, readable code.

## When to Use
- When you have completed a feature and want to clean up the implementation (Refactoring phase).
- When you encounter complex, deeply nested, or hard-to-read code.
- When the user explicitly asks to "simplify", "clean up", or "refactor" code.
- When you notice code that violates project styling standards (e.g., nested ternaries).

## Core Principles

### 1. Preserve Functionality (The Golden Rule)
**Never change what the code does - only how it does it.**
- All original features, outputs, and behaviors must remain intact.
- If a change risks altering behavior, verify it with tests first.

### 2. Apply Project Standards
Follow the established coding standards (check `CLAUDE.md` if available). Default preferences include:
- **ES Modules**: Use proper import sorting and extensions.
- **Functions**: Prefer `function` keyword over arrow functions for top-level definitions.
- **Types**: Use explicit return type annotations for top-level functions.
- **React**: Use explicit Props types.
- **Error Handling**: Use proper error handling patterns (avoid empty try/catch).
- **Naming**: Maintain consistent and descriptive naming conventions.

### 3. Enhance Clarity
- **Structure**: Reduce unnecessary complexity and nesting.
- **Redundancy**: Eliminate duplicate code and unnecessary abstractions.
- **Readability**: Improve variable and function names.
- **Logic**: Consolidate related logic.
- **Comments**: Remove unnecessary comments that describe obvious code (the "what"), keep comments explaining the "why".
- **Control Flow**: **AVOID NESTED TERNARY OPERATORS**. Prefer `switch` statements or `if/else` chains for multiple conditions.
- **Philosophy**: Choose clarity over brevity - explicit code is often better than overly compact code.

### 4. Maintain Balance
Avoid over-simplification that could:
- Reduce code clarity or maintainability.
- Create overly "clever" solutions that are hard to understand.
- Combine too many concerns into single functions or components.
- Remove helpful abstractions that improve code organization.
- Prioritize "fewer lines" over readability.

## Refactoring Process

1. **Identify** the scope (usually recently modified code).
2. **Analyze** for opportunities to improve elegance and consistency.
3. **Refactor** applying the principles above.
4. **Verify** that functionality remains unchanged.
5. **Document** only significant changes that affect understanding.

## Examples

### Replacing Nested Ternaries
**Bad:**
```javascript
const getStatus = (loading, error, data) => 
  loading ? 'loading' : error ? 'error' : data ? 'success' : 'idle';
```

**Good:**
```javascript
function getStatus(loading, error, data) {
  if (loading) return 'loading';
  if (error) return 'error';
  if (data) return 'success';
  return 'idle';
}
```

### Improving Function Definitions
**Bad:**
```typescript
const processData = (d: any) => {
  // ... implementation
  return d.map(i => i.val * 2);
};
```

**Good:**
```typescript
function processData(data: InputData[]): OutputData[] {
  // ... implementation
  return data.map(item => item.value * 2);
}
```
