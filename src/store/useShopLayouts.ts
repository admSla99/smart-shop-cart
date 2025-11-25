import { create } from 'zustand';

import { supabase } from '../lib/supabase';
import { DEFAULT_LAYOUTS, resolveDefaultLayout } from '../lib/layoutSorting';
import type { ShopLayoutArea } from '../types';

type LayoutStore = {
  layouts: Record<string, ShopLayoutArea[]>;
  loading: boolean;
  error: string | null;
  fetchLayout: (userId: string, shopName: string) => Promise<ShopLayoutArea[]>;
  saveLayout: (userId: string, shopName: string, areas: string[]) => Promise<void>;
};

const toAreaRecords = (userId: string, shopName: string, names: string[]): ShopLayoutArea[] =>
  names.map((area, index) => ({
    id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${shopName}-${area}-${index}`,
    user_id: userId,
    shop_name: shopName,
    area_name: area,
    sequence: index + 1,
  }));

export const useShopLayouts = create<LayoutStore>((set, get) => ({
  layouts: {},
  loading: false,
  error: null,

  fetchLayout: async (userId, shopName) => {
    const cacheKey = `${userId}:${shopName}`;
    const cached = get().layouts[cacheKey];
    if (cached?.length) return cached;

    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from('shop_layout_areas')
      .select('*')
      .eq('user_id', userId)
      .ilike('shop_name', shopName)
      .order('sequence', { ascending: true });

    if (error) {
      set({ loading: false, error: error.message });
      throw error;
    }

    if (data && data.length > 0) {
      set((state) => ({
        loading: false,
        layouts: { ...state.layouts, [cacheKey]: data },
      }));
      return data;
    }

    const template = resolveDefaultLayout(shopName);
    const seeded = toAreaRecords(userId, shopName, template);

    const { error: upsertError } = await supabase.from('shop_layout_areas').upsert(seeded);
    if (upsertError) {
      set({ loading: false, error: upsertError.message });
      throw upsertError;
    }

    set((state) => ({
      loading: false,
      layouts: { ...state.layouts, [cacheKey]: seeded },
    }));

    return seeded;
  },

  saveLayout: async (userId, shopName, areas) => {
    const cacheKey = `${userId}:${shopName}`;
    const records = toAreaRecords(userId, shopName, areas);

    set({ loading: true, error: null });

    const { error } = await supabase.from('shop_layout_areas').upsert(records);
    if (error) {
      set({ loading: false, error: error.message });
      throw error;
    }

    set((state) => ({
      loading: false,
      layouts: { ...state.layouts, [cacheKey]: records },
    }));
  },
}));

export const DEFAULT_LAYOUT_PRESETS = DEFAULT_LAYOUTS;
