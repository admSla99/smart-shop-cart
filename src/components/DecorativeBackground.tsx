import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../contexts/ThemeContext';
import type { Palette } from '../theme/colors';
import type { ThemeMode } from '../contexts/ThemeContext';

type Variant = 'warm' | 'cool' | 'sunny';

type DecorativeBackgroundProps = {
  variant?: Variant;
};

export const DecorativeBackground: React.FC<DecorativeBackgroundProps> = ({
  variant = 'warm',
}) => {
  const { palette, themeMode } = useTheme();
  const { styles, variantGradients } = useMemo(
    () => createStyles(palette, themeMode),
    [palette, themeMode],
  );
  const gradient = variantGradients[variant] ?? palette.gradientPrimary;

  return (
    <View pointerEvents="none" style={styles.container}>
      <LinearGradient
        colors={[palette.background, palette.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={gradient}
        start={{ x: 0.1, y: 0.2 }}
        end={{ x: 0.9, y: 0.8 }}
        style={styles.blobPrimary}
      />
      <LinearGradient
        colors={palette.gradientSecondary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.blobSecondary}
      />
      <View style={styles.orbAccent} />
      <View style={styles.orbWarm} />
    </View>
  );
};

const createStyles = (palette: Palette, themeMode: ThemeMode) => {
  const isDark = themeMode === 'dark';

  return {
    variantGradients: {
      warm: palette.gradientPrimary,
      cool: palette.gradientSecondary,
      sunny: palette.gradientAccent ?? palette.gradientPrimary,
    } as Record<Variant, string[]>,
    styles: StyleSheet.create({
      container: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: 0,
      },
      blobPrimary: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        top: -140,
        right: -80,
        opacity: isDark ? 0.22 : 0.35,
        transform: [{ rotate: '18deg' }],
      },
      blobSecondary: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        bottom: -120,
        left: -70,
        opacity: isDark ? 0.18 : 0.28,
        transform: [{ rotate: '-12deg' }],
      },
      orbAccent: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: palette.accent,
        opacity: isDark ? 0.08 : 0.12,
        top: 120,
        left: -40,
      },
      orbWarm: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: palette.primary,
        opacity: isDark ? 0.06 : 0.08,
        bottom: 140,
        right: -70,
      },
    }),
  };
};

export default DecorativeBackground;
