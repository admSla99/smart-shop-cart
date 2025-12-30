# Architecture

## High level flow
- Entry point: `index.ts` registers `App` from `App.tsx`.
- `App.tsx` loads fonts, mounts `AuthProvider`, and renders `AppNavigator`.
- `AppNavigator` switches between auth and app stacks based on Supabase session state.

## Navigation
Auth stack:
- `AuthLandingScreen`
- `SignInScreen`
- `SignUpScreen`

App stack:
- `HomeScreen`
- `ListDetailScreen`
- `TemplatesScreen`

## State and data flow
- `src/contexts/AuthContext.tsx` holds Supabase session state and auth actions.
- `src/store/useShoppingLists.ts` owns list and item CRUD, and applies sorted order updates.
- `src/store/useShopLayouts.ts` owns per user shop layouts and template lookup, plus default layout seeding.
- `src/lib/layoutSorting.ts` calls the `sort-by-layout` edge function.

Layout sorting path:
```
ListDetailScreen -> sortByLayout() -> supabase/functions/sort-by-layout -> applySortedOrder()
```

## Data models
Shared models live in `src/types/index.ts` and mirror Supabase tables:
- `ShoppingList`
- `ListItem`
- `ShopLayoutArea`
- `ShopLayoutTemplate`

## UI structure
- `src/screens` contains navigation targets (auth, home, list detail, templates).
- `src/components` holds shared UI building blocks.
- `src/theme` defines palette, typography, and layout constants used across screens.

## Defaults and presets
- `DEFAULT_LAYOUTS` in `src/lib/layoutSorting.ts` provides starter layouts when a user has not configured a shop.
- Home screen presets (Kaufland, Lidl, Coop-jednota) seed shop metadata and colors.
