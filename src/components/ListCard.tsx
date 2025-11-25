import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getReadableTextColor, palette } from '../theme/colors';

type ListCardProps = {
  title: string;
  itemsCount: number;
  shopName?: string | null;
  shopColor?: string | null;
  onPress: () => void;
  onDelete?: () => void;
};

export const ListCard: React.FC<ListCardProps> = ({
  title,
  itemsCount,
  shopName,
  shopColor,
  onPress,
  onDelete,
}) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{title}</Text>
      {shopName ? (
        <View style={[styles.shopPill, shopColor ? { backgroundColor: shopColor } : styles.defaultPill]}>
          <Text
            style={[
              styles.shopLabel,
              shopColor ? { color: getReadableTextColor(shopColor) } : undefined,
            ]}
          >
            {shopName}
          </Text>
        </View>
      ) : null}
      <Text style={styles.meta}>
        {itemsCount} item{itemsCount === 1 ? '' : 's'}
      </Text>
    </View>
    {onDelete ? (
      <Pressable
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Text style={styles.deleteLabel}>Delete</Text>
      </Pressable>
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: palette.card,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text,
  },
  meta: {
    marginTop: 4,
    color: palette.muted,
  },
  shop: {
    marginTop: 4,
    color: palette.muted,
    fontWeight: '500',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(248,113,113,0.15)',
  },
  deleteLabel: {
    color: palette.danger,
    fontWeight: '600',
  },
  shopPill: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  defaultPill: {
    backgroundColor: 'rgba(99,102,241,0.25)',
  },
  shopLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
});

export default ListCard;
