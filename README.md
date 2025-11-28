## Smart Shopping List (Expo + Supabase)

Cross‑platform shopping list app with Supabase auth/storage, layout‑aware sorting, and a template manager for reusable store layouts.

### Features
- Supabase email/password auth with persisted sessions.
- Shopping lists per user: create, rename, delete; optional shop name + badge color.
- Items per list: add, check/uncheck, delete with live updates.
- Shop layout editor: reorder areas, add/remove, save per shop (per user).
- Template support: load/apply templates for a shop; manage templates globally (new Templates screen) with full CRUD.
- Layout-aware sorting: send items + layout to the edge function to get ordered aisles; results saved on items.
- Dark, touch-friendly UI; works on iOS/Android and web.

### Contributor guide
- See [`AGENTS.md`](AGENTS.md) for repository guidelines; keep it updated with key codebase details and processes as they evolve.

### Quick summary
- Expo + React Native with native/web navigation flow and Supabase-backed data layer (Zustand stores).
- Supabase schema & RLS in [`supabase-schema.sql`](supabase-schema.sql); includes template read + authenticated write policies.
- Edge function `supabase/functions/sort-by-layout` wraps OpenRouter for AI sorting (configurable via env).

### Getting Started
1. **Install tooling**
   - Node 20+ and npm
   - Expo CLI (`npm install -g expo`) optional
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment**
   - Copy `.env.example` to `.env` (or set expo config `extra` values).
   - Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
   - Optional: `EXPO_PUBLIC_AI_SERVICE_URL` and `EXPO_PUBLIC_AI_API_KEY` if pointing to a real AI service; otherwise the mock path is used.
4. **Run locally**
   ```bash
   npm start
   ```
   Launch on iOS/Android simulator or web via Expo.

### Run on a physical device
1. Install **Expo Go** (App Store / Google Play).
2. Run `npm start` on your machine (same Wi‑Fi).
3. Scan the QR code (press `t` in CLI for Tunnel if LAN is blocked).
4. Use Expo Go menu to reload; fast refresh is enabled.

### Supabase setup
1. Create a Supabase project.
2. Run the SQL in [`supabase-schema.sql`](supabase-schema.sql):
   - Tables: `profiles`, `shopping_lists`, `list_items`, `shop_layout_areas`, `shop_layout_templates`.
   - RLS: user-scoped policies for lists/items/layouts; public read on templates; **authenticated write** on templates (`Templates manageable by authenticated users`).
3. Enable Email auth under Authentication → Providers.
4. Copy the project URL and anon key (Project Settings → API) into your `.env`.

### Templates & layouts
- Apply templates inside a list: open “Edit layout”, choose a template, apply; the layout is saved per user/shop.
- Manage templates globally: Home → Templates screen. Create/edit/delete templates for any shop; areas are ordered one per line.
- Layouts are fully replaced on save to avoid duplication; shop names are normalized internally.

### AI layout-aware sorting
- Function: `supabase/functions/sort-by-layout` accepts `{ shopName, items, layout }` and returns ordered `area_name` + `order_index`.
- Configure `OPENROUTER_API_KEY` (and optional `OPENROUTER_MODEL`) in the function environment before deploying.
- Client helpers: `src/lib/layoutSorting.ts`, `src/store/useShopLayouts.ts`, `useShoppingStore.applySortedOrder`.

### Project structure
```
src/
  components/      # UI primitives
  contexts/        # Auth provider
  lib/             # Supabase + layout sort helpers
  navigation/      # Stack configuration
  screens/         # Auth, lists, layouts, templates
  store/           # Zustand stores for lists/layouts
  types/           # Shared TS types
supabase/
  functions/       # Edge functions (sort-by-layout)
```

### Development tips
- `useShoppingStore` handles list/item CRUD; `useShopLayouts` handles layouts/templates.
- `AppNavigator` switches between auth and app stacks based on Supabase session.
- Keep shop names consistent (matching in templates and lists) for best template matching.

### Testing checklist
- [ ] Sign up/sign in; confirm profile row creation.
- [ ] Create lists with/without shop names; add/delete items.
- [ ] Edit layouts; apply a template; navigate away/back to confirm it persists without duplication.
- [ ] Manage templates via Templates screen; apply them in a list.
- [ ] Run layout sorting with configured AI keys and verify items reorder. 
