export type Palette = {
  background: string;
  surface: string;
  card: string;
  elevated: string;
  primary: string;
  primaryGlow: string;
  secondary: string;
  secondaryGlow: string;
  accent: string;
  accentGlow: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  muted: string;
  border: string;
  borderHighlight: string;
  danger: string;
  success: string;
  warning: string;
  gradientPrimary: string[];
  gradientSecondary: string[];
  gradientAccent: string[];
  shadow: string;
};

export const lightPalette: Palette = {
  background: '#F6F3EF',
  surface: '#FFFFFF',
  card: '#FDF8F3',
  elevated: '#F1E8E0',

  primary: '#FF6B4A',
  primaryGlow: 'rgba(255, 107, 74, 0.32)',
  secondary: '#2EC4B6',
  secondaryGlow: 'rgba(46, 196, 182, 0.28)',
  accent: '#FFC857',
  accentGlow: 'rgba(255, 200, 87, 0.35)',

  text: '#1E1B16',
  textSecondary: '#5F564C',
  textTertiary: '#8B8075',
  muted: '#7A6F64',

  border: '#E8DED4',
  borderHighlight: '#D6C8BC',

  danger: '#E5484D',
  success: '#2BB673',
  warning: '#F59E0B',

  gradientPrimary: ['#FF6B4A', '#FFA585'],
  gradientSecondary: ['#2EC4B6', '#7FE8DB'],
  gradientAccent: ['#FFC857', '#FFE3A2'],

  shadow: '#0F0A06',
};

export const darkPalette: Palette = {
  background: '#14110D',
  surface: '#1D1914',
  card: '#241E18',
  elevated: '#2B231C',

  primary: '#FF6B4A',
  primaryGlow: 'rgba(255, 107, 74, 0.24)',
  secondary: '#2EC4B6',
  secondaryGlow: 'rgba(46, 196, 182, 0.22)',
  accent: '#FFC857',
  accentGlow: 'rgba(255, 200, 87, 0.22)',

  text: '#F6EFE7',
  textSecondary: '#D7CABC',
  textTertiary: '#B6A79A',
  muted: '#9E9186',

  border: '#3A2E25',
  borderHighlight: '#4A3B30',

  danger: '#E5484D',
  success: '#2BB673',
  warning: '#F59E0B',

  gradientPrimary: ['#FF6B4A', '#FFA585'],
  gradientSecondary: ['#2EC4B6', '#7FE8DB'],
  gradientAccent: ['#FFC857', '#FFE3A2'],

  shadow: '#000000',
};

export const palette = lightPalette;

export const shopBrandColors = {
  lidl: '#0050A4',
  kaufland: '#E3000F',
  coop: '#F97316',
};

export const shopColors = [
  shopBrandColors.lidl,
  shopBrandColors.kaufland,
  shopBrandColors.coop,
  '#22C55E',
  '#06B6D4',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
];

export const getReadableTextColor = (hex: string) => {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? '#1E1B16' : '#FFFFFF';
};
