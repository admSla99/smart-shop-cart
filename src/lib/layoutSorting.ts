import { supabase } from './supabase';
import type { ListItem, ShopLayoutArea } from '../types';

export type LayoutSortResult = {
  id: string;
  area_name?: string | null;
  order_index: number;
};

export const DEFAULT_LAYOUTS: Record<string, string[]> = {
  Kaufland: ['Produce', 'Bakery', 'Refrigerated', 'Dry goods', 'Frozen', 'Household', 'Checkout'],
  Lidl: ['Produce', 'Bakery', 'Meat & dairy', 'Pantry', 'Frozen', 'Household', 'Checkout'],
  'Coop-jednota': ['Produce', 'Bakery', 'Refrigerated', 'Pantry', 'Household', 'Checkout'],
  Generic: ['Produce', 'Deli', 'Bakery', 'Refrigerated', 'Dry goods', 'Frozen', 'Household', 'Checkout'],
};

export const resolveDefaultLayout = (shopName?: string) => {
  if (!shopName) return DEFAULT_LAYOUTS.Generic;
  const entry = Object.entries(DEFAULT_LAYOUTS).find(([key]) => {
    return shopName.toLowerCase().includes(key.toLowerCase());
  });
  return entry ? entry[1] : DEFAULT_LAYOUTS.Generic;
};

export const sortByLayout = async (params: {
  shopName?: string | null;
  items: Pick<ListItem, 'id' | 'name' | 'quantity'>[];
  layout: ShopLayoutArea[];
}): Promise<LayoutSortResult[]> => {
  const { shopName, items, layout } = params;
  const { data, error } = await supabase.functions.invoke<{ sorted?: LayoutSortResult[]; areas?: string[] }>(
    'sort-by-layout',
    {
      body: {
        shopName: shopName ?? 'Unknown',
        items,
        layout: layout.map((area) => ({ area_name: area.area_name, sequence: area.sequence })),
      },
      // Allow the built-in session (ANON) to be used without JWT if function is public
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''}`,
      },
    },
  );

  if (error) {
    throw error;
  }

  return data?.sorted ?? [];
};
