import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../contexts/ThemeContext';
import type { Palette } from '../theme/colors';
import type { Typography } from '../theme/typography';

type LoadingOverlayProps = {
  message?: string;
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  const { palette, typography } = useTheme();
  const styles = useMemo(() => createStyles(palette, typography), [palette, typography]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[palette.background, palette.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <ActivityIndicator size="large" color={palette.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const createStyles = (palette: Palette, typography: Typography) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      gap: 12,
      position: 'relative',
    },
    text: {
      marginTop: 12,
      ...typography.bodySmall,
      color: palette.muted,
      textAlign: 'center',
    },
  });

export default LoadingOverlay;
