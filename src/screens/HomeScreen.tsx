import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ColorPicker } from '../components/ColorPicker';
import { ListCard } from '../components/ListCard';
import { useAuth } from '../contexts/AuthContext';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { useShoppingStore } from '../store/useShoppingLists';
import { palette, shopBrandColors, shopColors } from '../theme/colors';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

const CUSTOM_SHOP_OPTION = 'Custom shop';
const SHOP_PRESETS = [
  { label: 'Kaufland', color: shopBrandColors.kaufland },
  { label: 'Lidl', color: shopBrandColors.lidl },
  { label: 'Coop-jednota', color: shopBrandColors.coop },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedShop, setSelectedShop] = useState<string>(SHOP_PRESETS[0]?.label ?? 'Kaufland');
  const [customShopName, setCustomShopName] = useState('');
  const [shopColor, setShopColor] = useState(SHOP_PRESETS[0]?.color ?? shopColors[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { lists, loadingLists, fetchLists, createList, deleteList, items } = useShoppingStore();

  const greetingName = useMemo(() => {
    return user?.user_metadata?.display_name ?? user?.email ?? 'Friend';
  }, [user]);

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
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to create list');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    try {
      await deleteList(listId);
    } catch (err) {
      setError((err as Error)?.message ?? 'Unable to delete list');
    }
  };

  const renderList = ({ item }: { item: typeof lists[number] }) => (
    <ListCard
      title={item.title}
      shopName={item.shop_name}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingLabel}>Welcome back</Text>
          <Text style={styles.greetingValue}>{greetingName}</Text>
        </View>
        <Text style={styles.signOut} onPress={signOut}>
          Sign out
        </Text>
      </View>

      <View style={styles.newListCard}>
        <Text style={styles.sectionTitle}>Plan your next run</Text>
        <Text style={styles.sectionSubtitle}>Name the list, assign the store, and choose a color.</Text>
        <Text style={styles.inputLabel}>List name</Text>
        <TextInput
          value={newListTitle}
          onChangeText={setNewListTitle}
          placeholder="e.g. Friday dinner party"
          placeholderTextColor={palette.muted}
          style={styles.input}
        />
        <Text style={styles.inputLabel}>Shop (optional)</Text>
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
                <Text style={styles.shopOptionLabel}>{option.label}</Text>
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
            <Text style={styles.shopOptionLabel}>Custom</Text>
          </Pressable>
        </View>
        {selectedShop === CUSTOM_SHOP_OPTION ? (
          <TextInput
            value={customShopName}
            onChangeText={setCustomShopName}
            placeholder="Type your shop name"
            placeholderTextColor={palette.muted}
            style={styles.input}
          />
        ) : null}
        <Text style={styles.inputLabel}>Badge color</Text>
        <ColorPicker colors={shopColors} selected={shopColor} onSelect={setShopColor} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Save list" onPress={handleCreateList} loading={creating} />
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Your lists</Text>
        {loadingLists ? <ActivityIndicator color={palette.accent} /> : null}
      </View>
      {loadingLists && lists.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={palette.accent} />
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(list) => list.id}
          renderItem={renderList}
          refreshControl={
            <RefreshControl
              refreshing={loadingLists}
              onRefresh={loadLists}
              tintColor={palette.text}
              colors={[palette.primary]}
            />
          }
          contentContainerStyle={lists.length === 0 ? { flexGrow: 1 } : undefined}
          ListEmptyComponent={
            <EmptyState
              title="No lists yet"
              description="Start by creating a list for your recurring grocery run or event."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: palette.background,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingLabel: {
    color: palette.muted,
    fontSize: 14,
  },
  greetingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.text,
  },
  signOut: {
    color: palette.danger,
    fontWeight: '600',
  },
  newListCard: {
    backgroundColor: palette.surface,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: palette.muted,
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
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.muted,
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shopOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  shopOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    marginRight: 10,
    marginBottom: 10,
  },
  shopOptionSelected: {
    borderColor: palette.primary,
    backgroundColor: 'rgba(99,102,241,0.15)',
  },
  shopOptionSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  customSwatch: {
    borderWidth: 1,
    borderColor: palette.muted,
    backgroundColor: 'transparent',
  },
  shopOptionLabel: {
    color: palette.text,
    fontWeight: '600',
  },
});

export default HomeScreen;
