import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { palette } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout } from '../theme/layout';

type EmptyStateProps = {
  title: string;
  description?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => (
  <View style={styles.container}>
    <LinearGradient
      colors={palette.gradientPrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.badge}
    >
      <Feather name="shopping-bag" size={18} color="#FFFFFF" />
    </LinearGradient>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderRadius: layout.borderRadius.l,
    borderWidth: 1,
    borderColor: palette.border,
    ...layout.shadows.small,
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    ...typography.h3,
    textAlign: 'center',
  },
  description: {
    ...typography.bodySmall,
    color: palette.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});

export default EmptyState;
