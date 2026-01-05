# Testing

## Automated tests
- `npm test` runs Jest with the `jest-expo` preset.
- Example test: `src/components/__tests__/TextField.test.tsx`.

## Manual smoke tests
- Sign up and sign in; confirm a profile row is created.
- Create, rename, and delete lists.
- Add, check, and delete items.
- Manage layouts and templates; confirm changes persist when navigating away and back.
- Trigger AI sorting and verify items re-order.
- Toggle dark mode from the Home header and confirm it persists after reload.

## Pre-merge verification
- Run the app on web plus at least one native target via Expo.
- Confirm sessions persist across reloads.
