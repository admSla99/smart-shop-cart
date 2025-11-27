import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Pressable,
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
import { sortByLayout } from '../lib/layoutSorting';
import { useShopLayouts } from '../store/useShopLayouts';
import { useAuth } from '../contexts/AuthContext';
import type { ShopLayoutArea, ShopLayoutTemplate } from '../types';
import { useShoppingStore } from '../store/useShoppingLists';
import { getReadableTextColor, palette } from '../theme/colors';

type Props = NativeStackScreenProps<AppStackParamList, 'ListDetail'>;

const ListDetailScreen: React.FC<Props> = ({ route }) => {
  const { listId, title, shopName, shopColor } = route.params;
  const { user } = useAuth();
  const { fetchLayout, saveLayout } = useShopLayouts();
  const {
    items,
    loadingItems,
    fetchItems,
    addItem,
    toggleItem,
    deleteItem,
    applySortedOrder,
  } = useShoppingStore();
  const listItems = items[listId] ?? [];
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layoutAreas, setLayoutAreas] = useState<ShopLayoutArea[]>([]);
  const [templates, setTemplates] = useState<ShopLayoutTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [layoutError, setLayoutError] = useState<string | null>(null);
  const [layoutEditorOpen, setLayoutEditorOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  const loading = loadingItems[listId];

  const load = useCallback(() => {
    fetchItems(listId);
  }, [fetchItems, listId]);

  useEffect(() => {
    load();
  }, [load]);

  const loadLayout = useCallback(async () => {
    if (!user?.id) return;
    setLayoutLoading(true);
    setLayoutError(null);
    try {
      const layout = await fetchLayout(user.id, shopName ?? 'Generic');
      setLayoutAreas(layout);
    } catch (err) {
      setLayoutError((err as Error)?.message ?? 'Unable to load layout');
    } finally {
      setLayoutLoading(false);
    }
  }, [fetchLayout, shopName, user?.id]);

  const loadTemplates = useCallback(async () => {
    if (!shopName) return;
    try {
      const data = await useShopLayouts.getState().fetchTemplates(shopName);
      setTemplates(data);
      if (data.length && !selectedTemplate) {
        setSelectedTemplate(data[0].template_name);
      }
    } catch (err) {
      setLayoutError((err as Error)?.message ?? 'Unable to load templates');
    }
  }, [shopName, selectedTemplate]);

  useEffect(() => {
    if (layoutEditorOpen) {
      loadLayout();
      loadTemplates();
    }
  }, [layoutEditorOpen, loadLayout, loadTemplates]);

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

  const ensureLayout = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const layout = await fetchLayout(user.id, shopName ?? 'Generic');
      return layout;
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to load layout');
      return [];
    }
  }, [fetchLayout, shopName, user?.id]);

  const handleSortByLayout = async () => {
    if (!user?.id) {
      setError('You must be signed in to sort.');
      return;
    }
    setSorting(true);
    setError(null);
    try {
      const layout = await ensureLayout();
      const sorted = await sortByLayout({
        shopName: shopName ?? 'Generic',
        items: listItems.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity })),
        layout,
      });
      await applySortedOrder(listId, sorted);
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to sort items');
    } finally {
      setSorting(false);
    }
  };

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
      {listItems.length > 0 ? (
        <View style={{ marginBottom: 12 }}>
          <Button
            label="Sort by shop layout"
            onPress={handleSortByLayout}
            loading={sorting}
            variant="secondary"
          />
        </View>
      ) : null}
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
              areaName={item.area_name}
              isChecked={item.is_checked}
              onToggle={() => handleToggle(item.id, item.is_checked)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          scrollEnabled={false}
          ListEmptyComponent={
            <EmptyState
              title="No items yet"
              description="Add your first item to get started."
            />
          }
        />
      )}

      {shopName ? (
        <View style={styles.layoutCard}>
          <View style={styles.layoutHeader}>
            <Text style={styles.sectionTitle}>Shop layout</Text>
            <Button
              label={layoutEditorOpen ? 'Close' : 'Edit layout'}
              variant="ghost"
              onPress={() => setLayoutEditorOpen((prev) => !prev)}
            />
          </View>
          {layoutEditorOpen ? (
            <>
              {layoutLoading ? (
                <ActivityIndicator style={{ marginVertical: 12 }} color={palette.accent} />
              ) : null}
              {layoutError ? <Text style={styles.error}>{layoutError}</Text> : null}
              {templates.length > 0 ? (
                <View style={styles.templateRow}>
                  <Text style={styles.sectionSubtitle}>Templates available for this shop</Text>
                  <View style={styles.templateList}>
                    {[...new Set(templates.map((t) => t.template_name))].map((name) => {
                      const isSelected = selectedTemplate === name;
                      return (
                        <Pressable
                          key={name}
                          style={[styles.templateChip, isSelected && styles.templateChipSelected]}
                          onPress={() => setSelectedTemplate(name)}
                        >
                          <Text style={styles.templateChipLabel}>{name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={styles.templateHint}>
                    {selectedTemplate
                      ? `Selected: ${selectedTemplate}`
                      : 'Choose a template to preview.'}
                  </Text>
                  <Button
                    label="Apply template"
                    variant="secondary"
                    disabled={!selectedTemplate || templates.length === 0}
                    onPress={() => {
                      if (!user?.id || !selectedTemplate) return;
                      const areas = templates
                        .filter((t) => t.template_name === selectedTemplate)
                        .sort((a, b) => a.sequence - b.sequence);
                      if (!areas.length) return;
                      Alert.alert(
                        'Apply template',
                        `Replace your layout with "${selectedTemplate}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Apply',
                            style: 'destructive',
                            onPress: () => {
                              setLayoutAreas(
                                areas.map((t, idx) => ({
                                  id: `${t.id}-${idx}`,
                                  user_id: user.id,
                                  shop_name: shopName ?? 'Generic',
                                  area_name: t.area_name,
                                  sequence: idx + 1,
                                })),
                              );
                            },
                          },
                        ],
                      );
                    }}
                  />
                </View>
              ) : null}
              {layoutAreas.map((area, index) => (
                <View key={`${area.id}-${index}`} style={styles.areaRow}>
                  <Text style={styles.areaName}>
                    {index + 1}. {area.area_name}
                  </Text>
                  <View style={styles.areaActions}>
                    <Button
                      label="↑"
                      variant="ghost"
                      onPress={() => {
                        if (index === 0) return;
                        setLayoutAreas((prev) => {
                          const copy = [...prev];
                          [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
                          return copy.map((a, idx) => ({ ...a, sequence: idx + 1 }));
                        });
                      }}
                    />
                    <Button
                      label="↓"
                      variant="ghost"
                      onPress={() => {
                        setLayoutAreas((prev) => {
                          if (index === prev.length - 1) return prev;
                          const copy = [...prev];
                          [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
                          return copy.map((a, idx) => ({ ...a, sequence: idx + 1 }));
                        });
                      }}
                    />
                    <Button
                      label="Remove"
                      variant="ghost"
                      onPress={() =>
                        setLayoutAreas((prev) =>
                          prev.filter((_, idx) => idx !== index).map((a, idx) => ({
                            ...a,
                            sequence: idx + 1,
                          })),
                        )
                      }
                    />
                  </View>
                </View>
              ))}
              <View style={styles.newAreaRow}>
                <TextInput
                  placeholder="Add area name"
                  placeholderTextColor={palette.muted}
                  value={newAreaName}
                  onChangeText={setNewAreaName}
                  style={styles.input}
                />
                <Button
                  label="Add"
                  variant="secondary"
                  onPress={() => {
                    const trimmed = newAreaName.trim();
                    if (!trimmed) return;
                    setLayoutAreas((prev) => [
                      ...prev,
                      {
                        id: `${trimmed}-${Date.now()}`,
                        user_id: user!.id,
                        shop_name: shopName,
                        area_name: trimmed,
                        sequence: prev.length + 1,
                      },
                    ]);
                    setNewAreaName('');
                  }}
                />
              </View>
              <Button
                label="Save layout"
                onPress={async () => {
                  if (!user?.id) return;
                  setLayoutLoading(true);
                  setLayoutError(null);
                  try {
                    const updated = await saveLayout(user.id, shopName, layoutAreas.map((a) => a.area_name));
                    setLayoutAreas(updated.map((area, idx) => ({ ...area, sequence: idx + 1 })));
                  } catch (err) {
                    setLayoutError((err as Error)?.message ?? 'Unable to save layout');
                  } finally {
                    setLayoutLoading(false);
                  }
                }}
                loading={layoutLoading}
              />
            </>
          ) : (
            <Text style={styles.sectionSubtitle}>
              Configure the ordered areas for this shop to get the best sorting.
            </Text>
          )}
        </View>
      ) : null}
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
  sectionSubtitle: {
    color: palette.muted,
    marginTop: 4,
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
  layoutCard: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  layoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  areaName: {
    color: palette.text,
    fontWeight: '600',
    flex: 1,
  },
  areaActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newAreaRow: {
    marginTop: 12,
  },
  templateRow: {
    marginTop: 10,
    marginBottom: 10,
  },
  templateList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  templateChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    marginRight: 8,
    marginBottom: 8,
  },
  templateChipSelected: {
    borderColor: palette.primary,
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  templateChipLabel: {
    color: palette.text,
    fontWeight: '600',
  },
  templateHint: {
    color: palette.muted,
    marginBottom: 8,
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
