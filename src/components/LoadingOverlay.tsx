import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { palette } from '../theme/colors';

type LoadingOverlayProps = {
  message?: string;
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={palette.primary} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    paddingHorizontal: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: palette.text,
    textAlign: 'center',
  },
});

export default LoadingOverlay;
