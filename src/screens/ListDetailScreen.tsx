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

type Props = NativeStackScreenProps<AppStackParamList, 'ListDetail'>;

const ListDetailScreen: React.FC<Props> = ({ route }) => {
  const { listId, title } = route.params;
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
      await addItem(listId, { name, quantity });
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
      await addItem(listId, {
        name: suggestion.name,
        quantity: suggestion.quantity,
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
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add new item</Text>
        <TextInput
          placeholder="Item name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Quantity or size"
          placeholderTextColor="#9CA3AF"
          value={quantity}
          onChangeText={setQuantity}
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Add item" onPress={handleAdd} loading={submitting} />
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      {loading ? (
        <ActivityIndicator style={{ marginVertical: 20 }} />
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
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  error: {
    color: '#DC2626',
    marginBottom: 8,
  },
  aiCard: {
    marginTop: 20,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
  },
  aiDescription: {
    color: '#4C1D95',
    marginBottom: 12,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#C4B5FD',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#312E81',
  },
  suggestionMeta: {
    color: '#4C1D95',
    marginTop: 2,
  },
  suggestionReason: {
    color: '#6D28D9',
    marginTop: 2,
  },
});

export default ListDetailScreen;
