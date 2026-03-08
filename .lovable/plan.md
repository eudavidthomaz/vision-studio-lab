

# Add Sun/Moon Theme Toggle to `/bio` Page

## Overview

Convert the styled-components toggle to a plain CSS + React component (project doesn't use styled-components), add light mode CSS variables, integrate `next-themes` (already installed), and place the toggle in the top-right corner of the Bio page.

## Changes

### 1. New Component: `src/components/ui/theme-switch.tsx`
- Convert all styled-components CSS to a standard CSS class approach using a dedicated stylesheet
- React component with `useTheme()` from `next-themes` to toggle between light/dark
- Checkbox checked state bound to current theme

### 2. New Stylesheet: `src/components/ui/theme-switch.css`
- All the toggle CSS (sun, moon, clouds, stars, spots, transitions) converted from styled-components to plain CSS
- ~150 lines of animation/transition CSS

### 3. Update `src/index.css`
- Add proper **light mode** CSS variables under `:root` (currently `:root` and `.dark` are identical — both dark)
- Light mode: white/light backgrounds, dark text, same primary/accent hues but adjusted for light context

### 4. Update `src/App.tsx`
- Wrap app with `<ThemeProvider>` from `next-themes` (already installed as dependency)
- Set `attribute="class"`, `defaultTheme="dark"`

### 5. Update `src/pages/Bio.tsx`
- Add `<ThemeSwitch />` positioned `fixed top-4 right-4 z-[60]` so it floats above the sticky tab bar

## File Summary

| File | Action |
|------|--------|
| `src/components/ui/theme-switch.tsx` | Create |
| `src/components/ui/theme-switch.css` | Create |
| `src/index.css` | Edit — add light mode vars |
| `src/App.tsx` | Edit — add ThemeProvider |
| `src/pages/Bio.tsx` | Edit — add toggle |

