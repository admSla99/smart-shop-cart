import { TextStyle } from 'react-native';
import type { Palette } from './colors';
import { lightPalette } from './colors';

const fonts = {
  display: 'Sora-Bold',
  heading: 'Sora-SemiBold',
  body: 'DMSans-Regular',
  bodyMedium: 'DMSans-Medium',
  bodyBold: 'DMSans-Bold',
};

export type Typography = {
  display: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  body: TextStyle;
  bodyMedium: TextStyle;
  bodySmall: TextStyle;
  label: TextStyle;
  caption: TextStyle;
};

export const createTypography = (palette: Palette): Typography => ({
  display: {
    fontSize: 36,
    fontFamily: fonts.display,
    color: palette.text,
    lineHeight: 44,
    letterSpacing: -0.6,
  } as TextStyle,
  h1: {
    fontSize: 30,
    fontFamily: fonts.display,
    color: palette.text,
    lineHeight: 38,
    letterSpacing: -0.4,
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontFamily: fonts.heading,
    color: palette.text,
    lineHeight: 32,
    letterSpacing: -0.3,
  } as TextStyle,
  h3: {
    fontSize: 20,
    fontFamily: fonts.heading,
    color: palette.text,
    lineHeight: 28,
  } as TextStyle,
  body: {
    fontSize: 16,
    fontFamily: fonts.body,
    color: palette.text,
    lineHeight: 24,
  } as TextStyle,
  bodyMedium: {
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
    color: palette.text,
    lineHeight: 24,
  } as TextStyle,
  bodySmall: {
    fontSize: 14,
    fontFamily: fonts.body,
    color: palette.textSecondary,
    lineHeight: 20,
  } as TextStyle,
  label: {
    fontSize: 14,
    fontFamily: fonts.bodyMedium,
    color: palette.text,
    lineHeight: 20,
    letterSpacing: 0.3,
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontFamily: fonts.bodyMedium,
    color: palette.textTertiary,
    lineHeight: 16,
  } as TextStyle,
});

export const typography = createTypography(lightPalette);
