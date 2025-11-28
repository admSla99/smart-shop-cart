import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type SortRequest = {
  shopName?: string;
  items?: { id: string; name: string; quantity?: number | string | null }[];
  layout?: { area_name: string; sequence: number }[];
};

type SortedItem = {
  id: string;
  area_name: string;
  order_index: number;
};

const DEFAULT_LAYOUT = [
  'Produce',
  'Deli',
  'Bakery',
  'Refrigerated',
  'Dry goods & pantry',
  'Frozen',
  'Household & cleaning',
  'Checkout',
];

const buildPrompt = (shopName: string, areas: string[], items: SortRequest['items']) => {
  const areaList = areas.join(' -> ');
  const itemList =
    items
      ?.map((item) => `- ${item.name} (id:${item.id}${item.quantity ? `, qty:${item.quantity}` : ''})`)
      .join('\n') ?? '';

  return `You are a shopping assistant. Sort the provided items in the order a shopper walks through the store.
- Shop name: ${shopName || 'Unknown'}
- Store areas in order from entrance to exit: ${areaList}
- Only use the given area names. If an item does not fit, assign it to "Other".
- Do not invent, split, or merge items.
- Return JSON only in this shape:
{"sorted":[{"id":"<id>","area_name":"<area from list or Other>","order_index":<integer order starting at 1>}]}

Items:
${itemList}`;
};

const sanitize = (items: SortRequest['items'], areas: string[], sorted: SortedItem[]): SortedItem[] => {
  if (!items?.length) return [];
  const areaSet = new Set([...areas, 'Other']);
  const validIds = new Set(items.map((item) => item.id));

  const cleaned = (sorted ?? [])
    .filter((row) => row && validIds.has(row.id))
    .map((row, idx) => ({
      id: row.id,
      area_name: areaSet.has(row.area_name) ? row.area_name : 'Other',
      order_index: Number.isInteger(row.order_index) ? row.order_index : idx + 1,
    }));

  // Ensure every item is present
  const seen = new Set(cleaned.map((row) => row.id));
  items.forEach((item) => {
    if (!seen.has(item.id)) {
      cleaned.push({
        id: item.id,
        area_name: 'Other',
        order_index: cleaned.length + 1,
      });
    }
  });

  // Normalize ordering
  return cleaned
    .sort((a, b) => a.order_index - b.order_index)
    .map((row, idx) => ({ ...row, order_index: idx + 1 }));
};

const callOpenRouter = async (prompt: string) => {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set');
  }

  const model = Deno.env.get('OPENROUTER_MODEL') ?? 'gpt-4o-mini';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/admSla99/smart-shop-cart',
      'X-Title': 'Smart Shopping Layout Sorter',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You sort shopping list items based on store layout. Respond only with valid JSON in the requested shape.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content ?? '';

  try {
    return JSON.parse(content) as { sorted?: SortedItem[] };
  } catch (_err) {
    throw new Error('Unable to parse OpenRouter response as JSON');
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  let body: SortRequest;
  try {
    body = await req.json();
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const items = body.items?.filter((item) => item?.id && item?.name) ?? [];
  if (!items.length) {
    return new Response(JSON.stringify({ sorted: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  const layoutAreas = (body.layout ?? []).sort((a, b) => a.sequence - b.sequence);
  const areaNames = layoutAreas.length ? layoutAreas.map((area) => area.area_name) : DEFAULT_LAYOUT;

  try {
    const prompt = buildPrompt(body.shopName ?? 'Unknown shop', areaNames, items);
    const result = await callOpenRouter(prompt);
    const cleaned = sanitize(items, areaNames, result?.sorted ?? []);

    return new Response(JSON.stringify({ sorted: cleaned, areas: areaNames }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error('sort-by-layout error', err);
    return new Response(
      JSON.stringify({
        error: 'Sorting failed',
        message: err instanceof Error ? err.message : 'Unknown error',
        areas: areaNames,
        sorted: sanitize(items, areaNames, []),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }
});
