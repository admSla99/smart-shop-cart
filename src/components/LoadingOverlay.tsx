import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { palette } from '../theme/colors';
import { typography } from '../theme/typography';

type LoadingOverlayProps = {
  message?: string;
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => (
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

const styles = StyleSheet.create({
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
