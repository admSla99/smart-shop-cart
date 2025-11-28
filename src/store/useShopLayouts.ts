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

type ShopLayoutInsert = Omit<ShopLayoutArea, 'id' | 'created_at'>;

const toAreaRecords = (userId: string, shopName: string, names: string[]): ShopLayoutInsert[] =>
  names.map((area, index) => ({
    user_id: userId,
    shop_name: shopName,
    area_name: area,
    sequence: index + 1,
  }));

const normalizeShopName = (shopName: string) => shopName.trim() || 'Generic';

export const useShopLayouts = create<LayoutStore>((set, get) => ({
  layouts: {},
  templates: {},
  loading: false,
  error: null,

  fetchLayout: async (userId, shopName) => {
    const normalizedShop = normalizeShopName(shopName);
    const cacheKey = `${userId}:${normalizedShop}`;
    const cached = get().layouts[cacheKey];
    if (cached?.length) return cached;

    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from('shop_layout_areas')
      .select('*')
      .eq('user_id', userId)
      .ilike('shop_name', normalizedShop)
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

    const template = resolveDefaultLayout(normalizedShop);
    const seeded = toAreaRecords(userId, normalizedShop, template);

    const { data: inserted, error: upsertError } = await supabase
      .from('shop_layout_areas')
      .upsert(seeded)
      .select('*')
      .order('sequence', { ascending: true });
    if (upsertError) {
      set({ loading: false, error: upsertError.message });
      throw upsertError;
    }

    set((state) => ({
      loading: false,
      layouts: { ...state.layouts, [cacheKey]: inserted ?? [] },
    }));

    return inserted ?? [];
  },

  saveLayout: async (userId, shopName, areas) => {
    const normalizedShop = normalizeShopName(shopName);
    const cacheKey = `${userId}:${normalizedShop}`;
    // Deduplicate areas by name (case-insensitive) to avoid unique constraint violations,
    // but preserve the first casing encountered.
    const seen: string[] = [];
    const deduped: string[] = [];
    areas.forEach((name) => {
      const trimmed = name.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && !seen.includes(lower)) {
        seen.push(lower);
        deduped.push(trimmed);
      }
    });
    const records = toAreaRecords(userId, normalizedShop, deduped);

    set({ loading: true, error: null });

    // Replace the existing layout for this user + shop to avoid stale rows lingering.
    const { error: deleteError } = await supabase
      .from('shop_layout_areas')
      .delete()
      .eq('user_id', userId)
      .ilike('shop_name', normalizedShop);

    if (deleteError) {
      set({ loading: false, error: deleteError.message });
      throw deleteError;
    }

    if (records.length === 0) {
      set((state) => ({
        loading: false,
        layouts: { ...state.layouts, [cacheKey]: [] },
      }));
      return [];
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

    const result = data ?? [];

    set((state) => ({
      loading: false,
      layouts: { ...state.layouts, [cacheKey]: result },
    }));

    return result;
  },

  fetchTemplates: async (shopName) => {
    const normalizedName = shopName.toLowerCase();
    const candidates = Array.from(
      new Set([
        shopName,
        normalizedName.includes('kaufland') ? 'Kaufland' : null,
        normalizedName.includes('lidl') ? 'Lidl' : null,
        normalizedName.includes('coop') ? 'Coop-jednota' : null,
      ].filter(Boolean) as string[]),
    );

    const cacheKey = `template:${candidates.join('|').toLowerCase()}`;
    const cached = get().templates[cacheKey];
    if (cached?.length) return cached;

    set({ loading: true, error: null });

    const query = supabase.from('shop_layout_templates').select('*').order('sequence', { ascending: true });

    const { data, error } =
      candidates.length > 0
        ? await query.in('shop_name', candidates)
        : await query.ilike('shop_name', shopName);

    if (error) {
      set({ loading: false, error: error.message });
      throw error;
    }

    const normalized = (data ?? []).map((template) => ({
      ...template,
      template_name: template.template_name && template.template_name.trim().length > 0 ? template.template_name : 'Default',
    }));

    set((state) => ({
      loading: false,
      templates: { ...state.templates, [cacheKey]: normalized },
    }));

    return normalized;
  },
}));

export const DEFAULT_LAYOUT_PRESETS = DEFAULT_LAYOUTS;
