import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { palette } from '../theme/colors';

type ItemRowProps = {
  name: string;
  quantity?: number | null;
  isChecked: boolean;
  onToggle: () => void;
  onDelete?: () => void;
};

const checkboxStyle = (checked: boolean): ViewStyle => ({
  width: 28,
  height: 28,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: checked ? palette.success : palette.border,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
});

export const ItemRow: React.FC<ItemRowProps> = ({ name, quantity, isChecked, onToggle, onDelete }) => (
  <View style={styles.row}>
    <Pressable style={checkboxStyle(isChecked)} onPress={onToggle}>
      {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
    </Pressable>
    <View style={styles.textContainer}>
      <Text style={[styles.name, isChecked && styles.nameDone]}>{name}</Text>
      {quantity !== null && quantity !== undefined ? (
        <Text style={styles.quantity}>{quantity}</Text>
      ) : null}
    </View>
    {onDelete ? (
      <Pressable onPress={onDelete} style={styles.delete}>
        <Text style={styles.deleteText}>Remove</Text>
      </Pressable>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  checkmark: {
    color: palette.success,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: palette.text,
  },
  nameDone: {
    textDecorationLine: 'line-through',
    color: palette.muted,
  },
  quantity: {
    color: palette.muted,
    marginTop: 2,
  },
  delete: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    color: palette.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ItemRow;
