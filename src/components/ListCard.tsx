import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ListCardProps = {
  title: string;
  itemsCount: number;
  onPress: () => void;
  onDelete?: () => void;
};

export const ListCard: React.FC<ListCardProps> = ({ title, itemsCount, onPress, onDelete }) => (
  <Pressable style={styles.card} onPress={onPress}>
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.meta}>{itemsCount} item{itemsCount === 1 ? '' : 's'}</Text>
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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  meta: {
    marginTop: 4,
    color: '#6B7280',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
  },
  deleteLabel: {
    color: '#B91C1C',
    fontWeight: '600',
  },
});

export default ListCard;
