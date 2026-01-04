# Dark Mode Theme System

## Overview
Add a full dark mode for the app with a theme toggle available in the Home navigation header. The theme preference is persisted and restored on launch. The design keeps the existing coral/teal/amber accents while adjusting surfaces, borders, text, shadows, and backgrounds for dark readability.

## Goals
- Provide light and dark themes with complete coverage across screens and shared components.
- Allow users to toggle the theme from the Home navigation header.
- Persist the selected theme across app restarts.
- Keep existing brand accents (coral/teal/amber) while ensuring contrast in dark mode.

## Non-goals
- System theme auto-following.
- Theme selection inside every screen.
- Reworking existing feature flows or data models.

## UX / Display Behavior
- Theme toggle button appears in the Home navigation header (right side).
- Button shows a moon icon when the current theme is light, and a sun icon when the current theme is dark.
- Toggle updates theme immediately and persists the preference.
- Status bar style updates to match theme (dark content for light theme, light content for dark theme).

## Architecture & Components
- Add `ThemeProvider` in `src/contexts/ThemeContext.tsx`:
  - `themeMode: 'light' | 'dark'`
  - `palette`, `typography`, `layout`
  - `toggleTheme()`
  - load and persist preference via AsyncStorage
- Update theme modules:
  - `src/theme/colors.ts` exports `lightPalette`, `darkPalette`, `getReadableTextColor`.
  - `src/theme/typography.ts` exports `createTypography(palette)`.
  - `src/theme/layout.ts` exports `createLayout(palette)` (shadows depend on theme).
- New `ThemeToggle` component in `src/components/ThemeToggle.tsx`:
  - Header variant for navigation bar placement.
  - Accessible label describes the target theme.
- Update all screens/components to use theme context rather than static palette imports.

## Data Flow
1. `ThemeProvider` loads stored theme preference on mount (defaults to light).
2. `useTheme()` provides `palette`, `typography`, `layout`, `themeMode`, `toggleTheme`.
3. UI components compute styles from theme tokens via `useMemo`.
4. `NavigationContainer` uses the theme colors from context for consistent headers/backgrounds.

## Error Handling
- If AsyncStorage read/write fails, the UI still updates in memory.
- Theme preference persists best-effort without blocking user actions.

## Testing
Automated tests:
- Theme context loads saved preference and toggles/persists correctly.
- Theme toggle renders the correct icon given the current theme.

Manual tests:
- Toggle from the Home navigation header; verify the icon flips.
- Relaunch app and confirm theme is restored.
- Verify contrast in cards, inputs, buttons, list items, and background decorations in dark mode.
- Check StatusBar style updates correctly.
