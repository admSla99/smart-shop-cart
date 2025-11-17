import { getRuntimeConfig } from './supabase';
import type { AiSuggestion } from '../types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateMockSuggestions = (listTitle: string, currentItems: string[]): AiSuggestion[] => {
  const base: Record<string, AiSuggestion[]> = {
    breakfast: [
      { name: 'Whole grain bread', quantity: '1 loaf', reason: 'Pairs well with breakfast spreads.' },
      { name: 'Greek yogurt', quantity: '4 cups', reason: 'High protein option for mornings.' },
    ],
    dinner: [
      { name: 'Boneless chicken thighs', quantity: '1.5 kg', reason: 'Versatile protein for dinners.' },
      { name: 'Mixed veggies', quantity: '1 bag', reason: 'Easy side for any meal.' },
    ],
  };

  const key = listTitle.toLowerCase();
  const chosen =
    (key.includes('breakfast') && base.breakfast) ||
    (key.includes('dinner') && base.dinner) ||
    [
      { name: 'Milk', quantity: '2 L', reason: 'Common staple that might run out weekly.' },
      { name: 'Bananas', quantity: '6 pcs', reason: 'Quick snacks rich in potassium.' },
    ];

  return chosen.filter((suggestion) => !currentItems.includes(suggestion.name.toLowerCase()));
};

export const fetchAiSuggestions = async (
  listTitle: string,
  currentItems: string[],
): Promise<AiSuggestion[]> => {
  const config = getRuntimeConfig();

  if (!config.aiServiceUrl || !config.aiApiKey) {
    await wait(800);
    return generateMockSuggestions(listTitle, currentItems.map((item) => item.toLowerCase()));
  }

  const response = await fetch(config.aiServiceUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.aiApiKey}`,
    },
    body: JSON.stringify({
      listTitle,
      items: currentItems,
    }),
  });

  if (!response.ok) {
    throw new Error('AI service returned an error');
  }

  const payload = (await response.json()) as { suggestions?: AiSuggestion[] };

  return payload.suggestions ?? [];
};
