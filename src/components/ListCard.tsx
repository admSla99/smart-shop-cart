import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import type { Palette } from '../theme/colors';
import type { Typography } from '../theme/typography';
import type { Layout } from '../theme/layout';

type ListCardProps = {
  title: string;
  shopName?: string;
  shopColor?: string;
  itemsCount: number;
  onPress: () => void;
  onDelete: () => void;
};

export const ListCard: React.FC<ListCardProps> = ({
  title,
  shopName,
  shopColor,
  itemsCount,
  onPress,
  onDelete,
}) => {
  const { palette, typography, layout } = useTheme();
  const styles = useMemo(
    () => createStyles(palette, typography, layout),
    [palette, typography, layout],
  );
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
        <View
          style={[
            styles.topAccent,
            { backgroundColor: shopColor || palette.primary },
          ]}
        />
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {shopName && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: shopColor ? `${shopColor}20` : palette.elevated },
                ]}
              >
                <View
                  style={[
                    styles.badgeDot,
                    { backgroundColor: shopColor || palette.textSecondary },
                  ]}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: shopColor || palette.textSecondary },
                  ]}
                >
                  {shopName}
                </Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.deletePressed]}
            hitSlop={10}
          >
            <Feather name="trash-2" size={18} color={palette.textTertiary} />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <View style={styles.countBadge}>
            <Feather name="shopping-cart" size={14} color={palette.primary} />
            <Text style={styles.countText}>
              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={palette.textTertiary} />
        </View>
      </Animated.View>
    </Pressable>
  );
};

const createStyles = (palette: Palette, typography: Typography, layout: Layout) =>
  StyleSheet.create({
    container: {
      backgroundColor: palette.surface,
      borderRadius: layout.borderRadius.l,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: palette.border,
      overflow: 'hidden',
      ...layout.shadows.medium,
    },
    topAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 6,
      borderTopLeftRadius: layout.borderRadius.l,
      borderTopRightRadius: layout.borderRadius.l,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    titleRow: {
      flex: 1,
      marginRight: 12,
    },
    title: {
      ...typography.h3,
      marginBottom: 8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: layout.borderRadius.full,
      borderWidth: 1,
      borderColor: palette.border,
    },
    badgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
    },
    badgeText: {
      ...typography.caption,
      fontWeight: '700',
    },
    deleteButton: {
      padding: 8,
      margin: -8,
    },
    deletePressed: {
      opacity: 0.6,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    countBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: layout.borderRadius.full,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.border,
    },
    countText: {
      ...typography.bodySmall,
      color: palette.textSecondary,
      fontWeight: '600',
    },
  });

export default ListCard;
