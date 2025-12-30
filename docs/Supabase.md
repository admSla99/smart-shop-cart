# Supabase

## Project setup
1. Create a Supabase project.
2. Run the SQL in `supabase-schema.sql` to create tables, indexes, and RLS policies.
3. Enable Email auth in Authentication -> Providers.
4. Copy the project URL and anon key into `.env`.

## Schema overview
Tables:
- `profiles`: user profile metadata (linked to `auth.users`).
- `shopping_lists`: per user lists with optional shop metadata.
- `list_items`: items per list, including checked state and optional sort metadata.
- `shop_layout_areas`: per user, per shop layout ordering.
- `shop_layout_templates`: public templates for shop layouts.

RLS summary:
- `profiles`, `shopping_lists`, `list_items`, and `shop_layout_areas` are scoped to the authenticated user.
- `shop_layout_templates` is readable by everyone and writable by authenticated users.

## App configuration
`app.config.ts` loads these environment variables and exposes them via `Constants.expoConfig.extra`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

`src/lib/supabase.ts` creates the client and configures session persistence with AsyncStorage.

## Edge function: sort-by-layout
Location: `supabase/functions/sort-by-layout`

Purpose: Sort list items by store layout using OpenRouter.

Request body shape:
```json
{
  "shopName": "Kaufland",
  "items": [{ "id": "uuid", "name": "Milk", "quantity": 1 }],
  "layout": [{ "area_name": "Produce", "sequence": 1 }]
}
```

Response body shape:
```json
{
  "sorted": [{ "id": "uuid", "area_name": "Produce", "order_index": 1 }],
  "areas": ["Produce", "Bakery", "Checkout"]
}
```

Environment variables for the function:
- `OPENROUTER_API_KEY` (required)
- `OPENROUTER_MODEL` (optional, defaults to `gpt-4o-mini`)

Notes:
- The function sanitizes results and falls back to `Other` when an item does not match a known area.
- The client calls this via `supabase.functions.invoke` in `src/lib/layoutSorting.ts`.

## Local testing
- Use the Supabase dashboard or a local function runner once `OPENROUTER_API_KEY` is set.
- If you use the Supabase CLI, serve the function locally and invoke it with sample payloads.
