# List Title With Date (Display Only)

## Overview
Show the list creation date alongside the list name everywhere the list title appears. The base list title stored in `shopping_lists.title` remains unchanged. The date is derived from `created_at` and formatted in the device locale as a short month + day (no year), e.g. "Weekly Groceries - Sep 14".

## Goals
- Show a consistent display title everywhere a list title is rendered.
- Use device locale formatting for the date without a year.
- Avoid schema changes; use existing `created_at`.
- Keep rename/edit flows working with the base title only.

## Non-goals
- Persisting the date in the database or title field.
- Changing the list creation workflow.
- Changing list sorting behavior (still uses `created_at`).

## UX / Display Behavior
- Display title format: `<base title> - <localized month day>`.
- Example: "Weekly Groceries - Sep 14".
- If `created_at` is missing or invalid, fall back to the base title only.
- Applies everywhere list titles appear:
  - Home list cards
  - List detail header title
  - Navigation header title

## Architecture & Components
Introduce a single helper to format display titles and keep UI consistent.

- New helper (recommended): `src/lib/listTitle.ts`
  - `formatListDisplayTitle(title: string, createdAt?: string): string`
  - Uses `Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })`.
  - Returns `<title> - <date>` when `createdAt` is valid; otherwise returns `title`.

Affected UI surfaces:
- `src/screens/HomeScreen.tsx`:
  - Compute display title for each list and pass it to `ListCard`.
  - When navigating to `ListDetail`, pass display title so the nav header uses it.
- `src/components/ListCard.tsx`:
  - Render the display title passed from Home (no change to component API if the prop name stays `title`).
- `src/screens/ListDetailScreen.tsx`:
  - Use the display title for the header text.
- `src/navigation/AppNavigator.tsx`:
  - Already uses `route.params.title`; ensure it receives the display title.

## Data Flow
1. `useShoppingStore.fetchLists` loads lists with `created_at`.
2. Home screen maps each list to a display title using the helper.
3. Display title is rendered on cards and passed into navigation params.
4. List detail header and nav title use the display title consistently.

## Error Handling
- If `created_at` is missing or unparsable:
  - `formatListDisplayTitle` returns the base title only.
  - No UI errors or "Invalid Date" output.

## Testing
Automated tests:
- Add a unit test for `formatListDisplayTitle` with a mocked `Intl.DateTimeFormat` to ensure deterministic output:
  - With valid `createdAt`, returns `"Title - Sep 14"`.
  - With missing/invalid `createdAt`, returns `"Title"`.

Manual tests:
- Create a new list and confirm the display title appears as expected:
  - Home list card
  - List detail header
  - Navigation header title

