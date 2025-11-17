export type ShoppingList = {
  id: string;
  title: string;
  user_id: string;
  created_at?: string;
};

export type ListItem = {
  id: string;
  list_id: string;
  name: string;
  quantity?: string | null;
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
