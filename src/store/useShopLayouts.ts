import { create } from 'zustand';

import { supabase } from '../lib/supabase';
import { DEFAULT_LAYOUTS, resolveDefaultLayout } from '../lib/layoutSorting';
import type { ShopLayoutArea, ShopLayoutTemplate } from '../types';

type LayoutStore = {
  layouts: Record<string, ShopLayoutArea[]>;
  templates: Record<string, ShopLayoutTemplate[]>;
  loading: boolean;
  error: string | null;
  fetchLayout: (userId: string, shopName: string) => Promise<ShopLayoutArea[]>;
  fetchTemplates: (shopName: string) => Promise<ShopLayoutTemplate[]>;
  saveLayout: (userId: string, shopName: string, areas: string[]) => Promise<ShopLayoutArea[]>;
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
  templates: {},
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

    const { error: deleteError } = await supabase
      .from('shop_layout_areas')
      .delete()
      .eq('user_id', userId)
      .ilike('shop_name', shopName);
    if (deleteError) {
      set({ loading: false, error: deleteError.message });
      throw deleteError;
    }

    const { data, error: insertError } = await supabase
      .from('shop_layout_areas')
      .insert(records)
      .select('*')
      .order('sequence', { ascending: true });

    if (insertError) {
      set({ loading: false, error: insertError.message });
      throw insertError;
    }

    set((state) => ({
      loading: false,
      layouts: { ...state.layouts, [cacheKey]: data ?? records },
    }));

    return data ?? records;
  },

  fetchTemplates: async (shopName) => {
    const cacheKey = `template:${shopName.toLowerCase()}`;
    const cached = get().templates[cacheKey];
    if (cached?.length) return cached;

    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from('shop_layout_templates')
      .select('*')
      .ilike('shop_name', shopName)
      .order('sequence', { ascending: true });

    if (error) {
      set({ loading: false, error: error.message });
      throw error;
    }

    const normalized = (data ?? []).map((template) => ({
      ...template,
      template_name: template.template_name || 'Default',
    }));

    set((state) => ({
      loading: false,
      templates: { ...state.templates, [cacheKey]: normalized },
    }));

    return normalized;
  },
}));

export const DEFAULT_LAYOUT_PRESETS = DEFAULT_LAYOUTS;
