import React, { useMemo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import type { Layout } from '../theme/layout';
import type { Palette } from '../theme/colors';

type ThemeToggleProps = {
  rightOffset?: number;
  topOffset?: number;
  style?: ViewStyle;
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  rightOffset = 20,
  topOffset = 12,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const { themeMode, toggleTheme, palette, layout } = useTheme();
  const styles = useMemo(() => createStyles(palette, layout), [palette, layout]);
  const isDark = themeMode === 'dark';

  return (
    <Pressable
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      accessibilityRole="button"
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.button,
        { top: insets.top + topOffset, right: rightOffset },
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={8}
    >
      <Feather name={isDark ? 'sun' : 'moon'} size={18} color={palette.text} />
    </Pressable>
  );
};

const createStyles = (palette: Palette, layout: Layout) =>
  StyleSheet.create({
    button: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      zIndex: 10,
      ...layout.shadows.small,
    },
    pressed: {
      opacity: 0.7,
    },
  });

export default ThemeToggle;
