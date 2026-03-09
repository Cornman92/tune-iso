

## Analysis

The request is broad: "fix all performance, SEO, best practices, and accessibility issues." Based on thorough codebase inspection, here are the actionable improvements I can make (excluding items already fixed or server-side only):

### Issues Identified

**Performance:**
1. Google Fonts loaded via `@import` in CSS (`src/index.css` line 5) — this is render-blocking and creates an extra network chain. Should use `<link>` tags in `index.html` with `display=swap` (already in the URL but the `@import` itself blocks rendering).

**Accessibility:**
2. ThemeToggle button has no accessible label — screen readers see an unlabeled button with just an icon.
3. Keyboard shortcuts tooltip trigger (`div` with `cursor-help`) has no accessible name or role.
4. SectionSidebar nav buttons lack `aria-label` attributes.
5. Several `<section>` elements could benefit from `aria-labelledby` linking to their headings.
6. Missing `<main>` landmark `role` is fine (semantic HTML), but the `<nav>` in SectionSidebar should have an `aria-label`.

**SEO / Best Practices:**
7. `src/App.css` is unused boilerplate — should be removed.
8. The `<html>` tag should have a `dir="ltr"` attribute for completeness.

**Meta / Structured Data:**
9. Already well-covered from prior fixes.

### Plan

1. **Move Google Fonts from CSS `@import` to `index.html` `<link>` tags** — eliminates render-blocking CSS import chain. Add `<link rel="preload">` for the font CSS.

2. **Add `aria-label` to ThemeToggle button** — "Toggle dark mode" / "Toggle light mode".

3. **Add `aria-label` to keyboard shortcuts tooltip trigger** — make it a `<button>` with `aria-label="Keyboard shortcuts"`.

4. **Add `aria-label` to SectionSidebar `<nav>`** — "Section navigation".

5. **Remove unused `src/App.css`** and any import of it.

6. **Add `aria-label` attributes to icon-only buttons** in the header (where missing).

### Files to modify:
- `index.html` — add font `<link>` tags
- `src/index.css` — remove `@import` line
- `src/pages/Index.tsx` — add `aria-label` to keyboard shortcuts div, convert to button
- `src/components/ThemeToggle.tsx` — add `aria-label`
- `src/components/SectionSidebar.tsx` — add `aria-label` to nav
- `src/App.css` — delete (unused)

