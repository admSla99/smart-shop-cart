import { create } from 'zustand';

import { supabase } from '../lib/supabase';
import type { ListItem, ShoppingList } from '../types';

type ItemsMap = Record<string, ListItem[]>;

type ShoppingStore = {
  lists: ShoppingList[];
  items: ItemsMap;
  loadingLists: boolean;
  loadingItems: Record<string, boolean>;
  error: string | null;
  fetchLists: (userId: string) => Promise<void>;
  createList: (userId: string, title: string) => Promise<ShoppingList | null>;
  deleteList: (listId: string) => Promise<void>;
  renameList: (listId: string, title: string) => Promise<void>;
  fetchItems: (listId: string) => Promise<void>;
  addItem: (listId: string, payload: { name: string; quantity?: string }) => Promise<void>;
  toggleItem: (listId: string, itemId: string, isChecked: boolean) => Promise<void>;
  deleteItem: (listId: string, itemId: string) => Promise<void>;
};

export const useShoppingStore = create<ShoppingStore>((set, get) => ({
  lists: [],
  items: {},
  loadingLists: false,
  loadingItems: {},
  error: null,

  fetchLists: async (userId: string) => {
    set({ loadingLists: true, error: null });
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    set({
      loadingLists: false,
      lists: data ?? [],
      error: error?.message ?? null,
    });
  },

  createList: async (userId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) {
      throw new Error('Please provide a list name.');
    }

    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({ title: trimmed, user_id: userId })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      set((state) => ({
        lists: [data, ...state.lists],
      }));
    }

    return data;
  },

  deleteList: async (listId: string) => {
    const { error } = await supabase.from('shopping_lists').delete().eq('id', listId);
    if (error) {
      throw error;
    }

    set((state) => {
      const newItems = { ...state.items };
      delete newItems[listId];

      return {
        lists: state.lists.filter((list) => list.id !== listId),
        items: newItems,
      };
    });
  },

  renameList: async (listId: string, title: string) => {
    const trimmed = title.trim();
    const { error } = await supabase
      .from('shopping_lists')
      .update({ title: trimmed })
      .eq('id', listId);

    if (error) {
      throw error;
    }

    set((state) => ({
      lists: state.lists.map((list) => (list.id === listId ? { ...list, title: trimmed } : list)),
    }));
  },

  fetchItems: async (listId: string) => {
    set((state) => ({
      loadingItems: { ...state.loadingItems, [listId]: true },
    }));

    const { data, error } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: false });

    set((state) => ({
      items: { ...state.items, [listId]: data ?? [] },
      loadingItems: { ...state.loadingItems, [listId]: false },
      error: error?.message ?? null,
    }));
  },

  addItem: async (listId, payload) => {
    const name = payload.name.trim();
    if (!name) {
      throw new Error('Item name is required');
    }

    const { data, error } = await supabase
      .from('list_items')
      .insert({ list_id: listId, name, quantity: payload.quantity, is_checked: false })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      set((state) => ({
        items: {
          ...state.items,
          [listId]: [data, ...(state.items[listId] ?? [])],
        },
      }));
    }
  },

  toggleItem: async (listId, itemId, isChecked) => {
    const { error } = await supabase
      .from('list_items')
      .update({ is_checked: isChecked })
      .eq('id', itemId);

    if (error) {
      throw error;
    }

    set((state) => ({
      items: {
        ...state.items,
        [listId]: (state.items[listId] ?? []).map((item) =>
          item.id === itemId ? { ...item, is_checked: isChecked } : item,
        ),
      },
    }));
  },

  deleteItem: async (listId, itemId) => {
    const { error } = await supabase.from('list_items').delete().eq('id', itemId);

    if (error) {
      throw error;
    }

    set((state) => ({
      items: {
        ...state.items,
        [listId]: (state.items[listId] ?? []).filter((item) => item.id !== itemId),
      },
    }));
  },
}));

export default useShoppingStore;
