import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import type { Palette } from '../theme/colors';
import type { Typography } from '../theme/typography';
import type { Layout } from '../theme/layout';

type ItemRowProps = {
  label: string;
  isCompleted: boolean;
  onToggle: () => void;
  onDelete: () => void;
};

export const ItemRow: React.FC<ItemRowProps> = ({
  label,
  isCompleted,
  onToggle,
  onDelete,
}) => {
  const { palette, typography, layout } = useTheme();
  const styles = useMemo(
    () => createStyles(palette, typography, layout),
    [palette, typography, layout],
  );
  const animatedValue = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isCompleted ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // color interpolation doesn't support native driver
    }).start();
  }, [isCompleted]);

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.text, palette.textTertiary],
  });

  const checkboxColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.borderHighlight, palette.success],
  });

  const checkboxBorderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.textSecondary, palette.success],
  });

  return (
    <View style={styles.container}>
      <Pressable style={styles.content} onPress={onToggle}>
        <Animated.View
          style={[
            styles.checkbox,
            {
              backgroundColor: checkboxColor,
              borderColor: checkboxBorderColor,
            },
          ]}
        >
          {isCompleted && <Feather name="check" size={12} color="#FFF" />}
        </Animated.View>
        <Animated.Text
          style={[
            styles.label,
            { color: textColor, textDecorationLine: isCompleted ? 'line-through' : 'none' },
          ]}
        >
          {label}
        </Animated.Text>
      </Pressable>
      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [styles.deleteButton, pressed && styles.deletePressed]}
        hitSlop={10}
      >
        <Feather name="x" size={18} color={palette.textTertiary} />
      </Pressable>
    </View>
  );
};

const createStyles = (palette: Palette, typography: Typography, layout: Layout) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: palette.surface,
      marginBottom: 8,
      borderRadius: layout.borderRadius.m,
      borderWidth: 1,
      borderColor: palette.border,
      ...layout.shadows.small,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      ...typography.bodyMedium,
      flex: 1,
    },
    deleteButton: {
      padding: 8,
      margin: -8,
    },
    deletePressed: {
      opacity: 0.6,
    },
  });

export default ItemRow;
