# Development

## Requirements
- Node 20+
- npm
- Expo Go (optional for physical devices)
- iOS Simulator or Android emulator (optional)

## Environment setup
1. Copy `.env.example` to `.env`.
2. Set the required Supabase values:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Optional AI service values if you are pointing to a custom AI endpoint:
   - `EXPO_PUBLIC_AI_SERVICE_URL`
   - `EXPO_PUBLIC_AI_API_KEY`

`app.config.ts` loads `.env` and exposes the values via `Constants.expoConfig.extra`. The Supabase client in `src/lib/supabase.ts` reads from that runtime config.

## Install and run
```bash
npm install
npm start
```

Platform specific shortcuts:
- `npm run ios`
- `npm run android`
- `npm run web`

## Running on a physical device
1. Install Expo Go on the device.
2. Run `npm start` on your machine.
3. Scan the QR code from the Expo CLI.
4. If LAN is blocked, press `t` to use a tunnel.

## Development notes
- Auth and navigation are wired in `App.tsx` and `src/navigation/AppNavigator.tsx`.
- Use the Zustand stores in `src/store` for data mutations instead of calling Supabase directly from screens.
- Layout sorting depends on the `sort-by-layout` Supabase edge function; see `docs/Supabase.md` for setup.

## Testing
See `docs/Testing.md` for automated and manual checks.
