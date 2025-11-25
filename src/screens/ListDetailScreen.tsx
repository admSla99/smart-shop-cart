import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ItemRow } from '../components/ItemRow';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { fetchAiSuggestions } from '../lib/ai';
import type { AiSuggestion } from '../types';
import { useShoppingStore } from '../store/useShoppingLists';
import { getReadableTextColor, palette } from '../theme/colors';

type Props = NativeStackScreenProps<AppStackParamList, 'ListDetail'>;

const ListDetailScreen: React.FC<Props> = ({ route }) => {
  const { listId, title, shopName, shopColor } = route.params;
  const {
    items,
    loadingItems,
    fetchItems,
    addItem,
    toggleItem,
    deleteItem,
  } = useShoppingStore();
  const listItems = items[listId] ?? [];
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loading = loadingItems[listId];

  const load = useCallback(() => {
    fetchItems(listId);
  }, [fetchItems, listId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const parsedQuantity = quantity.trim() ? parseInt(quantity.trim(), 10) : undefined;
      if (quantity.trim() && (Number.isNaN(parsedQuantity) || parsedQuantity === undefined)) {
        throw new Error('Quantity must be a whole number');
      }

      await addItem(listId, { name, quantity: parsedQuantity });
      setName('');
      setQuantity('');
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = (itemId: string, current: boolean) => {
    toggleItem(listId, itemId, !current).catch((err) => setError(err.message));
  };

  const handleDelete = (itemId: string) => {
    deleteItem(listId, itemId).catch((err) => setError(err.message));
  };

  const handleAiSuggestions = async () => {
    setAiLoading(true);
    setError(null);
    try {
      const suggestions = await fetchAiSuggestions(
        title,
        listItems.map((item) => item.name),
      );
      setAiSuggestions(suggestions);
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to request AI suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestion = async (suggestion: AiSuggestion) => {
    try {
      const parsedQuantity = suggestion.quantity ? parseInt(suggestion.quantity, 10) : undefined;
      await addItem(listId, {
        name: suggestion.name,
        quantity: Number.isNaN(parsedQuantity) ? undefined : parsedQuantity,
      });
      setAiSuggestions((prev) => prev.filter((item) => item.name !== suggestion.name));
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to add suggestion');
    }
  };

  const aiDescription = useMemo(() => {
    if (!aiSuggestions.length) {
      return 'Let AI analyze your current items and suggest what you might be missing.';
    }
    return 'Tap to add any of these smart recommendations to your list.';
  }, [aiSuggestions]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {shopName ? (
        <View
          style={[
            styles.infoBanner,
            shopColor ? { backgroundColor: shopColor } : styles.defaultBanner,
          ]}
        >
          <Text
            style={[
              styles.infoLabel,
              shopColor ? { color: getReadableTextColor(shopColor) } : undefined,
            ]}
          >
            Shop
          </Text>
          <Text
            style={[
              styles.infoValue,
              shopColor ? { color: getReadableTextColor(shopColor) } : undefined,
            ]}
          >
            {shopName}
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add new item</Text>
        <TextInput
          placeholder="Item name"
          placeholderTextColor={palette.muted}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Quantity (number)"
          placeholderTextColor={palette.muted}
          value={quantity}
          onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ''))}
          style={styles.input}
          keyboardType="numeric"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Add item" onPress={handleAdd} loading={submitting} />
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      {loading ? (
        <ActivityIndicator style={{ marginVertical: 20 }} color={palette.accent} />
      ) : (
        <FlatList
          data={listItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemRow
              name={item.name}
              quantity={item.quantity}
              isChecked={item.is_checked}
              onToggle={() => handleToggle(item.id, item.is_checked)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          scrollEnabled={false}
          ListEmptyComponent={
            <EmptyState
              title="No items yet"
              description="Add your first item or ask AI to help with suggestions."
            />
          }
        />
      )}

      <View style={styles.aiCard}>
        <Text style={styles.sectionTitle}>AI shopping assistant</Text>
        <Text style={styles.aiDescription}>{aiDescription}</Text>
        <Button
          label={aiSuggestions.length ? 'Refresh suggestions' : 'Generate suggestions'}
          variant="secondary"
          onPress={handleAiSuggestions}
          loading={aiLoading}
        />
        {aiSuggestions.map((suggestion) => (
          <View key={suggestion.name} style={styles.suggestionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.suggestionTitle}>{suggestion.name}</Text>
              {suggestion.quantity ? (
                <Text style={styles.suggestionMeta}>{suggestion.quantity}</Text>
              ) : null}
              {suggestion.reason ? (
                <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
              ) : null}
            </View>
            <Button label="Add" onPress={() => applySuggestion(suggestion)} variant="ghost" />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: palette.background,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: palette.text,
    marginBottom: 12,
    backgroundColor: palette.card,
  },
  error: {
    color: palette.danger,
    marginBottom: 8,
  },
  aiCard: {
    marginTop: 20,
    backgroundColor: palette.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  aiDescription: {
    color: palette.muted,
    marginBottom: 12,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.text,
  },
  suggestionMeta: {
    color: palette.muted,
    marginTop: 2,
  },
  suggestionReason: {
    color: palette.muted,
    marginTop: 2,
  },
  infoBanner: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  defaultBanner: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  infoLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
    color: palette.text,
  },
  infoValue: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ListDetailScreen;
