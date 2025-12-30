# Repository Guidelines

## Project Structure & Module Organization
- `src/screens` holds navigation targets for auth, home, list detail, and templates; entry wiring lives in `App.tsx` + `navigation/AppNavigator`.
- Shared UI sits in `src/components`, auth context in `src/contexts`, and state in `src/store` (Zustand stores for lists/layouts).
- `src/lib` contains Supabase client + layout-sorting helpers; `theme` defines palette/spacing; `types` stores shared models.
- `docs/` contains deeper documentation (development, architecture, Supabase, testing). Keep these docs in sync with product and workflow changes.
- Supabase artifacts: `supabase-schema.sql` (tables + RLS) and edge function `supabase/functions/sort-by-layout` (OpenRouter-backed sorter). Static assets live in `assets/`; Expo config in `app.config.ts`.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm start` launches Expo (press `w` for web, `a`/`i` for emulators).
- `npm run android` / `npm run ios` / `npm run web` target specific platforms.
- `npm test` runs Jest via `jest-expo`.
- For edge-function smoke tests, run the `supabase/functions/sort-by-layout` code via the Supabase dashboard or local function runner once `OPENROUTER_API_KEY` is set.

## Coding Style & Naming Conventions
- TypeScript with `strict` mode; prefer typed params/returns over `any`.
- Components/hooks use PascalCase filenames and camelCase identifiers (e.g., `HomeScreen`, `useShoppingStore`).
- Keep 2-space indentation, single quotes, and semicolons (match existing files). Co-locate `StyleSheet.create` blocks at the bottom of screens.
- Use Zustand stores for all data mutations; avoid duplicating Supabase calls outside store helpers.

## Testing Guidelines
- A small Jest suite exists; run `npm test` for component checks and still execute manual smoke tests: auth signup/signin, create/rename/delete lists, add/check/delete items, manage layouts/templates, and verify AI sorting returns ordered items.
- Before merging, verify web plus at least one native target via Expo and confirm sessions persist across reloads.

## Commit & Pull Request Guidelines
- Follow existing history: short, imperative subjects (`Add templates management screen`).
- PRs should include what changed and why, affected screens, env/config notes (e.g., new `EXPO_PUBLIC_*` vars), and screenshots or recordings for UI tweaks.
- List manual test steps/outcomes; reference related issues/tickets.

## Security & Configuration Tips
- Copy `.env.example` to `.env`; never commit real Supabase or OpenRouter keys.
- `app.config.ts` reads `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY` and optional AI service vars; keep values in Expo extra or CI secrets.
- When editing `supabase/functions`, avoid logging secrets and preserve the CORS headers already defined.
