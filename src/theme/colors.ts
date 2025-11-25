export const palette = {
  background: '#030712',
  surface: '#0F172A',
  card: '#111827',
  elevated: '#1F2937',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  accent: '#22D3EE',
  text: '#F9FAFB',
  muted: '#94A3B8',
  border: '#1E293B',
  danger: '#F87171',
  success: '#34D399',
};

export const shopBrandColors = {
  lidl: '#0050A4',
  kaufland: '#E3000F',
  coop: '#F97316',
};

export const shopColors = [
  shopBrandColors.lidl, // Lidl blue
  shopBrandColors.kaufland, // Kaufland red
  shopBrandColors.coop, // Coop-Jednota orange
  '#4ADE80', // green
  '#38BDF8', // sky
  '#A78BFA', // violet
  '#F472B6', // pink
  '#FCD34D', // yellow
];

export const getReadableTextColor = (hex: string) => {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111827' : '#F9FAFB';
};
