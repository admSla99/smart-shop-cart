import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { DecorativeBackground } from '../components/DecorativeBackground';
import { FadeInView } from '../components/FadeInView';
import { EmptyState } from '../components/EmptyState';
import { ColorPicker } from '../components/ColorPicker';
import { ListCard } from '../components/ListCard';
import { TextField } from '../components/TextField';
import { useAuth } from '../contexts/AuthContext';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { useShoppingStore } from '../store/useShoppingLists';
import { palette, shopBrandColors, shopColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout } from '../theme/layout';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

const CUSTOM_SHOP_OPTION = 'Custom shop';
const SHOP_PRESETS = [
  { label: 'Kaufland', color: shopBrandColors.kaufland },
  { label: 'Lidl', color: shopBrandColors.lidl },
  { label: 'Coop-jednota', color: shopBrandColors.coop },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedShop, setSelectedShop] = useState<string>(SHOP_PRESETS[0]?.label ?? 'Kaufland');
  const [customShopName, setCustomShopName] = useState('');
  const [shopColor, setShopColor] = useState(SHOP_PRESETS[0]?.color ?? shopColors[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewListForm, setShowNewListForm] = useState(false);
  const { lists, loadingLists, fetchLists, createList, deleteList, items } = useShoppingStore();

  const greetingName = useMemo(() => {
    return user?.user_metadata?.display_name ?? user?.email ?? 'Friend';
  }, [user]);
  const totalItems = useMemo(() => {
    return Object.values(items).reduce((sum, listItems) => sum + listItems.length, 0);
  }, [items]);

  const loadLists = useCallback(() => {
    if (user?.id) {
      fetchLists(user.id);
    }
  }, [fetchLists, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [loadLists]),
  );

  const toggleForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowNewListForm((prev) => !prev);
  };

  const handleCreateList = async () => {
    if (!user?.id) {
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const resolvedShopName =
        selectedShop === CUSTOM_SHOP_OPTION ? customShopName.trim() : selectedShop;
      const normalizedShopName = resolvedShopName?.trim() || undefined;
      const normalizedShopColor = normalizedShopName ? shopColor : undefined;

      await createList(user.id, newListTitle, {
        shopName: normalizedShopName,
        shopColor: normalizedShopColor,
      });
      setNewListTitle('');
      setCustomShopName('');
      setSelectedShop(SHOP_PRESETS[0]?.label ?? 'Kaufland');
      setShopColor(SHOP_PRESETS[0]?.color ?? shopColors[0]);
      toggleForm();
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to create list');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      await deleteList(listId);
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to delete list');
    }
  };

  const renderList = ({ item }: { item: typeof lists[number] }) => (
    <ListCard
      title={item.title}
      shopName={item.shop_name ?? undefined}
      shopColor={item.shop_color ?? undefined}
      itemsCount={items[item.id]?.length ?? 0}
      onPress={() =>
        navigation.navigate('ListDetail', {
          listId: item.id,
          title: item.title,
          shopName: item.shop_name,
          shopColor: item.shop_color,
        })
      }
      onDelete={() => handleDeleteList(item.id)}
    />
  );

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <FadeInView style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greetingLabel}>Welcome back,</Text>
            <Text style={styles.greetingValue}>{greetingName}</Text>
          </View>
          <Pressable style={styles.signOutButton} onPress={signOut}>
            <Feather name="log-out" size={18} color={palette.textSecondary} />
          </Pressable>
        </View>
        <View style={styles.headerMeta}>
          <View style={styles.metaPill}>
            <Feather name="list" size={14} color={palette.primary} />
            <Text style={styles.metaText}>{lists.length} lists</Text>
          </View>
          <View style={styles.metaPill}>
            <Feather name="shopping-cart" size={14} color={palette.primary} />
            <Text style={styles.metaText}>{totalItems} items</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={80} style={styles.actionRow}>
        <Button
          label={showNewListForm ? 'Cancel' : 'New List'}
          variant={showNewListForm ? 'ghost' : 'primary'}
          icon={showNewListForm ? 'x' : 'plus'}
          onPress={toggleForm}
          style={{ flex: 1 }}
        />
        <Button
          label="Templates"
          variant="secondary"
          icon="grid"
          onPress={() => navigation.navigate('Templates')}
          style={{ flex: 1 }}
        />
      </FadeInView>

      {showNewListForm && (
        <FadeInView delay={120} style={styles.formCard}>
          <Text style={styles.formTitle}>Create New List</Text>

          <TextField
            label="List Name"
            value={newListTitle}
            onChangeText={setNewListTitle}
            placeholder="e.g. Weekly Groceries"
          />

          <Text style={styles.sectionLabel}>Shop</Text>
          <View style={styles.shopOptionsRow}>
            {SHOP_PRESETS.map((option) => {
              const isSelected = selectedShop === option.label;
              return (
                <Pressable
                  key={option.label}
                  style={[styles.shopOption, isSelected && styles.shopOptionSelected]}
                  onPress={() => {
                    setSelectedShop(option.label);
                    setShopColor(option.color);
                    setCustomShopName('');
                  }}
                >
                  <View style={[styles.shopOptionSwatch, { backgroundColor: option.color }]} />
                  <Text style={[styles.shopOptionLabel, isSelected && styles.shopOptionLabelSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              key={CUSTOM_SHOP_OPTION}
              style={[
                styles.shopOption,
                selectedShop === CUSTOM_SHOP_OPTION && styles.shopOptionSelected,
              ]}
              onPress={() => setSelectedShop(CUSTOM_SHOP_OPTION)}
            >
              <View style={[styles.shopOptionSwatch, styles.customSwatch]} />
              <Text style={[styles.shopOptionLabel, selectedShop === CUSTOM_SHOP_OPTION && styles.shopOptionLabelSelected]}>
                Custom
              </Text>
            </Pressable>
          </View>

          {selectedShop === CUSTOM_SHOP_OPTION && (
            <TextField
              label="Shop Name"
              value={customShopName}
              onChangeText={setCustomShopName}
              placeholder="Enter shop name"
              containerStyle={{ marginTop: 12 }}
            />
          )}

          <Text style={styles.sectionLabel}>Badge Color</Text>
          <ColorPicker colors={shopColors} selected={shopColor} onSelect={setShopColor} />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            label="Create List"
            onPress={handleCreateList}
            loading={creating}
            style={{ marginTop: 24 }}
          />
        </FadeInView>
      )}

      <Text style={styles.sectionTitle}>Your Lists</Text>
    </View>
  );

  const renderEmpty = () => {
    if (loadingLists) {
      return (
        <ActivityIndicator style={styles.loadingIndicator} color={palette.primary} size="large" />
      );
    }
    return (
      <EmptyState
        title="No lists yet"
        description="Create your first shopping list to get started."
      />
    );
  };

  return (
    <View style={styles.container}>
      <DecorativeBackground variant="warm" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 20 : 0}
      >
        <FlatList
          data={lists}
          keyExtractor={(list) => list.id}
          renderItem={renderList}
          refreshControl={
            <RefreshControl
              refreshing={loadingLists}
              onRefresh={loadLists}
              tintColor={palette.primary}
              colors={[palette.primary]}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          ListHeaderComponent={renderListHeader()}
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 20,
    paddingTop: 32,
    position: 'relative',
  },
  keyboardContainer: {
    flex: 1,
    zIndex: 1,
  },
  listHeader: {
    zIndex: 1,
  },
  headerCard: {
    backgroundColor: palette.surface,
    borderRadius: layout.borderRadius.xl,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: palette.border,
    ...layout.shadows.medium,
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingLabel: {
    ...typography.body,
    color: palette.textSecondary,
  },
  greetingValue: {
    ...typography.h1,
    color: palette.text,
  },
  signOutButton: {
    padding: 10,
    backgroundColor: palette.card,
    borderRadius: layout.borderRadius.full,
    borderWidth: 1,
    borderColor: palette.border,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: layout.borderRadius.full,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  metaText: {
    ...typography.caption,
    color: palette.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
    zIndex: 1,
  },
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: layout.borderRadius.xl,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: palette.border,
    ...layout.shadows.medium,
    zIndex: 1,
  },
  formTitle: {
    ...typography.h3,
    marginBottom: 20,
  },
  sectionLabel: {
    ...typography.label,
    color: palette.textSecondary,
    marginTop: 16,
    marginBottom: 12,
  },
  shopOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shopOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: layout.borderRadius.full,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    gap: 8,
  },
  shopOptionSelected: {
    borderColor: palette.primary,
    backgroundColor: 'rgba(255, 107, 74, 0.12)',
  },
  shopOptionSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  customSwatch: {
    borderWidth: 1,
    borderColor: palette.textSecondary,
    backgroundColor: 'transparent',
  },
  shopOptionLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  shopOptionLabelSelected: {
    color: palette.primary,
  },
  error: {
    ...typography.caption,
    color: palette.danger,
    marginTop: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: 16,
    zIndex: 1,
  },
  listContent: {
    paddingBottom: 0,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default HomeScreen;
