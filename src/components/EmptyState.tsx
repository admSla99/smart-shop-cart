import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from '../theme/colors';

type EmptyStateProps = {
  title: string;
  description?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});

export default EmptyState;
