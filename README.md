## Smart Shopping List (Expo + Supabase)

Minimal shopping list mobile app powered by Expo / React Native with Supabase authentication & storage and an AI-ready extension point for smart recommendations.

### Features
- Email/password authentication backed by Supabase auth + profiles table.
- Create, rename, and delete shopping lists scoped per account.
- Add, check, uncheck, and remove items from each list with optimistic UI.
- Lists capture an optional shop name plus badge color so you know where each run is intended.
- Layout-aware sorting scaffold for sending list items + shop layout areas to an LLM and returning an ordered route.
- Typed Supabase client with AsyncStorage persistence so sessions survive restarts.
- Opinionated dark theme UI for a professional, minimal look.

### Quick summary
- Expo + React Native frontend with navigation, auth flow, and shopping list CRUD screens.
- Supabase schema & RLS defined in [`supabase-schema.sql`](supabase-schema.sql) so new projects can apply it quickly.
- AI hook (`src/lib/ai.ts`) already handles switching between mock data and a real endpoint based on `.env` keys.
- Dark UI with configurable per-store badge colors for quick visual scanning.

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
   - `shopping_lists` holds list names + optional `shop_name` + `shop_color` (owned by `user_id`).
   - `list_items` links each item to a list with cascade deletes and now stores optional `area_name` + `order_index` for layout-aware sorting.
   - `shop_layout_areas` stores per-user, per-shop ordered area names (e.g., Produce → Bakery → Checkout).
3. Under Authentication → Providers, ensure Email auth is enabled.
4. Grab the project URL and anon public key from Project Settings → API and place them in `.env`.

### AI layout-aware sorting (new branch)
- Data model: `shop_layout_areas` table stores ordered areas per user + shop; `list_items` has `area_name` and `order_index` columns to persist sorted results.
- Edge function: `supabase/functions/sort-by-layout` accepts `{ shopName, items, layout }`, calls OpenRouter (default model `gpt-4o-mini`) to map items to areas and returns a sorted list. Configure `OPENROUTER_API_KEY` (and optional `OPENROUTER_MODEL`) in the function environment before deploying.
- Client helpers: `src/lib/layoutSorting.ts` wraps the function call; `src/store/useShopLayouts.ts` seeds default layouts for Kaufland/Lidl/Coop and saves per-user overrides; `useShoppingStore.applySortedOrder` updates `list_items` with returned area/order.
- Usage sketch: fetch layout for the selected shop, call `sortByLayout` with current items, then pass results to `applySortedOrder` to persist and re-render.

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
