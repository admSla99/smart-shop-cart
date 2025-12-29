import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { EmptyState } from '../components/EmptyState';
import { FadeInView } from '../components/FadeInView';
import { ItemRow } from '../components/ItemRow';
import { TextField } from '../components/TextField';
import { useAuth } from '../contexts/AuthContext';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { useShoppingStore } from '../store/useShoppingLists';
import { useShopLayouts } from '../store/useShopLayouts';
import { sortByLayout } from '../lib/layoutSorting';
import type { ShopLayoutArea } from '../types';
import { palette } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout } from '../theme/layout';

type Props = NativeStackScreenProps<AppStackParamList, 'ListDetail'>;

const ListDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { listId, title, shopName, shopColor } = route.params;
  const { user } = useAuth();
  const {
    items,
    fetchItems,
    addItem,
    toggleItem,
    deleteItem,
    loadingItems,
    applySortedOrder,
  } = useShoppingStore();
  const { fetchLayout, saveLayout } = useShopLayouts();

  const [newItemName, setNewItemName] = useState('');
  const [adding, setAdding] = useState(false);
  const [showLayoutConfig, setShowLayoutConfig] = useState(false);
  const [layoutAreas, setLayoutAreas] = useState<ShopLayoutArea[]>([]);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [layoutError, setLayoutError] = useState<string | null>(null);
  const [newAreaName, setNewAreaName] = useState('');
  const [sorting, setSorting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);

  const keyboardInset = Platform.OS === 'android' ? keyboardHeight : 0;
  const listPaddingBottom = insets.bottom + 24 + inputHeight + keyboardInset;
  const listFooterHeight = Math.max(listPaddingBottom, inputHeight + 32);

  useEffect(() => {
    fetchItems(listId);
  }, [fetchItems, listId]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (user?.id && shopName) {
      fetchLayout(user.id, shopName).then(setLayoutAreas).catch(console.error);
    }
  }, [fetchLayout, user?.id, shopName]);

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      return;
    }
    setAdding(true);
    try {
      await addItem(listId, { name: newItemName.trim() });
      setNewItemName('');
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleAutoSort = async () => {
    if (items[listId]?.length === 0) return;
    setSorting(true);
    try {
      const sorted = await sortByLayout({
        shopName,
        items: items[listId] || [],
        layout: layoutAreas,
      });
      await applySortedOrder(listId, sorted);
    } catch (error) {
      console.error('Failed to auto-sort:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Auto-sort failed',
        `We couldn’t sort your items. ${errorMessage}`,
      );
    } finally {
      setSorting(false);
    }
  };

  const toggleLayoutConfig = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowLayoutConfig((prev) => !prev);
  };

  const handleSaveLayout = async () => {
    if (!user?.id) return;
    setLayoutLoading(true);
    setLayoutError(null);
    try {
      const updated = await saveLayout(
        user.id,
        shopName ?? 'Generic',
        layoutAreas.map((a) => a.area_name),
      );
      setLayoutAreas(updated);

      // Apply new sort order to existing items
      const sorted = items[listId]?.map(item => {
        const area = updated.find(a => a.area_name.toLowerCase() === (item.area_name || '').toLowerCase());
        return {
          id: item.id,
          area_name: area?.area_name ?? null,
          order_index: area?.sequence ?? null
        };
      }) ?? [];

      if (sorted.length > 0) {
        await applySortedOrder(listId, sorted);
      }

      toggleLayoutConfig();
    } catch (err) {
      setLayoutError((err as Error)?.message ?? 'Unable to save layout');
    } finally {
      setLayoutLoading(false);
    }
  };

  const addNewArea = () => {
    const trimmedName = newAreaName.trim();
    if (!trimmedName) return;
    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    setLayoutAreas((prev) => [
      ...prev,
      {
        id: tempId,
        user_id: user?.id ?? '',
        shop_name: shopName ?? '',
        area_name: trimmedName,
        sequence: prev.length + 1,
        created_at: new Date().toISOString(),
      },
    ]);
    setNewAreaName('');
  };

  const listItems = items[listId] || [];
  const sortedItems = [...listItems].sort((a, b) => {
    if (a.is_checked === b.is_checked) {
      // Sort by area sequence first if available
      const aOrder = a.order_index ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.order_index ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    }
    return a.is_checked ? 1 : -1;
  });

  return (
    <View style={styles.container}>
      <DecorativeBackground variant="cool" />
      <FadeInView style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Feather name="arrow-left" size={24} color={palette.text} />
        </Pressable>
        <View style={styles.headerContent}>
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
        <View style={styles.headerActions}>
          <Pressable
            onPress={handleAutoSort}
            style={[styles.headerAction, sorting && styles.headerActionActive]}
            disabled={sorting}
          >
            {sorting ? (
              <ActivityIndicator size="small" color={palette.accent} />
            ) : (
              <Feather name="zap" size={16} color={palette.accent} />
            )}
            <Text style={[styles.headerActionText, sorting && styles.headerActionTextActive]}>
              {sorting ? 'AI Sorting' : 'AI Sort'}
            </Text>
          </Pressable>
          <Pressable
            onPress={toggleLayoutConfig}
            style={[styles.headerAction, showLayoutConfig && styles.headerActionActive]}
          >
            <Feather
              name="layers"
              size={16}
              color={showLayoutConfig ? palette.primary : palette.textSecondary}
            />
            <Text
              style={[
                styles.headerActionText,
                showLayoutConfig && styles.headerActionTextActive,
              ]}
            >
              Layout
            </Text>
          </Pressable>
        </View>
      </FadeInView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 20 : 0}
      >
        {showLayoutConfig ? (
          <ScrollView
            style={styles.configContainer}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 + keyboardInset }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <FadeInView style={styles.configCard}>
              <Text style={styles.configTitle}>Shop Layout</Text>
              <Text style={styles.configSubtitle}>
                Order areas to match your path through the store.
              </Text>

              {layoutAreas.map((area, index) => (
                <View key={area.id} style={styles.areaRow}>
                  <Text style={styles.areaName}>
                    {index + 1}. {area.area_name}
                  </Text>
                  <View style={styles.areaActions}>
                    <Pressable
                      onPress={() => {
                        if (index === 0) return;
                        const newAreas = [...layoutAreas];
                        [newAreas[index - 1], newAreas[index]] = [newAreas[index], newAreas[index - 1]];
                        setLayoutAreas(newAreas.map((a, i) => ({ ...a, sequence: i + 1 })));
                      }}
                      disabled={index === 0}
                      style={[styles.actionButton, index === 0 && styles.actionButtonDisabled]}
                    >
                      <Feather name="arrow-up" size={16} color={palette.text} />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        if (index === layoutAreas.length - 1) return;
                        const newAreas = [...layoutAreas];
                        [newAreas[index + 1], newAreas[index]] = [newAreas[index], newAreas[index + 1]];
                        setLayoutAreas(newAreas.map((a, i) => ({ ...a, sequence: i + 1 })));
                      }}
                      disabled={index === layoutAreas.length - 1}
                      style={[styles.actionButton, index === layoutAreas.length - 1 && styles.actionButtonDisabled]}
                    >
                      <Feather name="arrow-down" size={16} color={palette.text} />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        const newAreas = layoutAreas.filter((_, i) => i !== index);
                        setLayoutAreas(newAreas.map((a, i) => ({ ...a, sequence: i + 1 })));
                      }}
                      style={[styles.actionButton, styles.deleteButton]}
                    >
                      <Feather name="trash-2" size={16} color={palette.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}

              <View style={styles.addAreaRow}>
                <TextInput
                  value={newAreaName}
                  onChangeText={setNewAreaName}
                  placeholder="Add new area..."
                  placeholderTextColor={palette.muted}
                  style={styles.addAreaInput}
                  onSubmitEditing={addNewArea}
                />
                <Pressable
                  onPress={addNewArea}
                  style={styles.addAreaButton}
                >
                  <Feather name="plus" size={20} color={palette.text} />
                </Pressable>
              </View>

              {layoutError && <Text style={styles.error}>{layoutError}</Text>}

              <Button
                label="Save Layout"
                onPress={handleSaveLayout}
                loading={layoutLoading}
                style={{ marginTop: 16 }}
              />
            </FadeInView>
          </ScrollView>
        ) : (
          <>
            <FadeInView style={styles.content}>
              {loadingItems && listItems.length === 0 ? (
                <ActivityIndicator color={palette.primary} style={{ marginTop: 40 }} />
              ) : (
                <FlatList
                  data={sortedItems}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <ItemRow
                      label={item.name}
                      isCompleted={item.is_checked}
                      onToggle={() => toggleItem(listId, item.id, !item.is_checked)}
                      onDelete={() => deleteItem(listId, item.id)}
                    />
                  )}
                  contentContainerStyle={styles.listContent}
                  ListEmptyComponent={
                    <EmptyState
                      title="Empty list"
                      description="Add items to start shopping."
                    />
                  }
                  ListFooterComponent={<View style={{ height: listFooterHeight }} />}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                />
              )}
            </FadeInView>

            <FadeInView
              delay={120}
              style={[styles.inputContainer, { bottom: insets.bottom + 16 + keyboardInset }]}
              onLayout={({ nativeEvent }) => {
                const nextHeight = Math.round(nativeEvent.layout.height);
                setInputHeight((prev) => (prev === nextHeight ? prev : nextHeight));
              }}
            >
              <TextField
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Add item..."
                onSubmitEditing={handleAddItem}
                returnKeyType="done"
                containerStyle={{ flex: 1, marginBottom: 0 }}
              />
              <Button
                icon="plus"
                iconOnly
                accessibilityLabel="Add item"
                onPress={handleAddItem}
                loading={adding}
                disabled={!newItemName.trim()}
                style={styles.addButton}
              />
            </FadeInView>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    paddingTop: 32,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: palette.surface,
    borderRadius: layout.borderRadius.xl,
    borderWidth: 1,
    borderColor: palette.border,
    ...layout.shadows.small,
    zIndex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  headerAction: {
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
  headerActionActive: {
    backgroundColor: 'rgba(255, 200, 87, 0.2)',
    borderColor: 'rgba(255, 200, 87, 0.6)',
  },
  headerActionText: {
    ...typography.caption,
    color: palette.textSecondary,
    fontWeight: '700',
  },
  headerActionTextActive: {
    color: palette.primary,
  },
  title: {
    ...typography.h2,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  listContent: {
    paddingBottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 10,
    elevation: 10,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: layout.borderRadius.xl,
    gap: 12,
    ...layout.shadows.medium,
  },
  addButton: {
    marginBottom: 0,
    width: 52,
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  configContainer: {
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  configCard: {
    backgroundColor: palette.surface,
    borderRadius: layout.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    ...layout.shadows.medium,
  },
  configTitle: {
    ...typography.h3,
    marginBottom: 8,
  },
  configSubtitle: {
    ...typography.body,
    color: palette.textSecondary,
    marginBottom: 24,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: palette.surface,
    borderRadius: layout.borderRadius.l,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: palette.border,
    ...layout.shadows.small,
  },
  areaName: {
    ...typography.body,
    fontWeight: '600',
  },
  areaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: layout.borderRadius.m,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  actionButtonDisabled: {
    opacity: 0.3,
  },
  deleteButton: {
    backgroundColor: 'rgba(229, 72, 77, 0.12)',
    borderColor: 'rgba(229, 72, 77, 0.3)',
  },
  addAreaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  addAreaInput: {
    flex: 1,
    height: 48,
    backgroundColor: palette.surface,
    borderRadius: layout.borderRadius.l,
    paddingHorizontal: 16,
    color: palette.text,
    borderWidth: 1,
    borderColor: palette.border,
    ...layout.shadows.small,
  },
  addAreaButton: {
    width: 48,
    height: 48,
    borderRadius: layout.borderRadius.l,
    backgroundColor: palette.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  error: {
    ...typography.caption,
    color: palette.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ListDetailScreen;
