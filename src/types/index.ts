export type ShoppingList = {
  id: string;
  title: string;
  shop_name?: string | null;
  shop_color?: string | null;
  user_id: string;
  created_at?: string;
};

export type ListItem = {
  id: string;
  list_id: string;
  name: string;
  quantity?: number | null;
  notes?: string | null;
  is_checked: boolean;
  created_at?: string;
};

export type AiSuggestion = {
  name: string;
  quantity?: string;
  notes?: string;
  reason?: string;
};
