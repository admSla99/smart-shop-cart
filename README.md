## Smart Shopping List (Expo + Supabase)

Minimal shopping list mobile app powered by Expo / React Native with Supabase authentication & storage and an AI-ready extension point for smart recommendations.

### Features
- Email/password authentication backed by Supabase auth + profiles table.
- Create, rename, and delete shopping lists scoped per account.
- Add, check, uncheck, and remove items from each list with optimistic UI.
- Mock AI assistant that can be swapped for a real endpoint when credentials are provided.
- Typed Supabase client with AsyncStorage persistence so sessions survive restarts.

### Quick summary
- Expo + React Native frontend with navigation, auth flow, and shopping list CRUD screens.
- Supabase schema & RLS defined in [`supabase-schema.sql`](supabase-schema.sql) so new projects can apply it quickly.
- AI hook (`src/lib/ai.ts`) already handles switching between mock data and a real endpoint based on `.env` keys.

### Getting Started
1. **Install tooling**
   - Node 20+ and npm
   - Expo CLI (`npm install -g expo` optional)
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment**
   - Copy `.env.example` to `.env`.
   - Fill in your Supabase project values (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
   - (Optional) populate `EXPO_PUBLIC_AI_SERVICE_URL` and `EXPO_PUBLIC_AI_API_KEY` to hit a real AI service; otherwise the mock suggestions stay active.
4. **Run locally**
   ```bash
   npm start
   ```
   Choose iOS / Android simulator or Expo Go client.

### Run on a physical device
1. Install the **Expo Go** app from the App Store or Google Play.
2. Run `npm start` and keep the phone on the same Wi‑Fi network as your computer.
3. Scan the QR code displayed by Expo CLI (press `t` to switch to Tunnel mode if LAN is blocked).
4. Expo Go loads the bundle; shake the device (or open the Expo Go menu) to reload and enable fast refresh while developing.

### Supabase setup
1. Create a new project in the Supabase dashboard.
2. Run the SQL in [`supabase-schema.sql`](supabase-schema.sql) via the SQL editor to create tables and RLS policies:
   - `profiles` stores metadata synced after sign up.
   - `shopping_lists` holds list names (owned by `user_id`).
   - `list_items` links each item to a list with cascade deletes.
3. Under Authentication → Providers, ensure Email auth is enabled.
4. Grab the project URL and anon public key from Project Settings → API and place them in `.env`.

### AI integration plan
- `src/lib/ai.ts` centralizes the AI client. When `EXPO_PUBLIC_AI_SERVICE_URL` and `EXPO_PUBLIC_AI_API_KEY` are provided the app will `POST` `{ listTitle, items }` to that endpoint; otherwise it returns mock suggestions so UI flows remain testable.
- `ListDetailScreen` surfaces the AI CTA and renders responses, so swapping to a production model only requires changing the fetch logic.
- Future enhancements: log AI suggestions back to Supabase, allow multi-select suggestions, or schedule background reminders based on model output.

### Project structure
```
src/
  components/      # Reusable UI primitives
  contexts/        # Auth provider
  lib/             # Supabase + AI clients
  navigation/      # Stack configuration
  screens/         # Auth + list experiences
  store/           # Zustand-powered cache/hooks
  types/           # Shared TS types
```

### Development tips
- `useShoppingStore` handles all Supabase CRUD; extend it when new list/item behaviors are required.
- The `AppNavigator` automatically swaps between auth flow and the main app based on the Supabase session.
- `app.config.ts` loads `.env` variables and exposes them to the runtime via `extra`.

### Testing checklist
- [ ] Create a new user via the Sign Up screen and confirm profile insertion.
- [ ] Add multiple lists/items and relaunch Expo to ensure the session persists.
- [ ] Trigger AI suggestions with and without configured credentials.
- [ ] Verify RLS rules in Supabase by querying tables as another user.
