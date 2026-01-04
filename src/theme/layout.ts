import { ViewStyle } from 'react-native';
import type { Palette } from './colors';
import { lightPalette } from './colors';

export type Layout = {
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    s: number;
    m: number;
    l: number;
    xl: number;
    full: number;
  };
  shadows: {
    small: ViewStyle;
    medium: ViewStyle;
    large: ViewStyle;
    glow: (color: string) => ViewStyle;
  };
};

export const createLayout = (palette: Palette): Layout => ({
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 10,
    m: 14,
    l: 20,
    xl: 28,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    } as ViewStyle,
    medium: {
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    } as ViewStyle,
    large: {
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 10,
    } as ViewStyle,
    glow: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 18,
      elevation: 6,
    } as ViewStyle),
  },
});

export const layout = createLayout(lightPalette);
