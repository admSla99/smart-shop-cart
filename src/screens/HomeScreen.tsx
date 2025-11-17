import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ListCard } from '../components/ListCard';
import { useAuth } from '../contexts/AuthContext';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { useShoppingStore } from '../store/useShoppingLists';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [newListTitle, setNewListTitle] = useState('');
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
      await createList(user.id, newListTitle);
      setNewListTitle('');
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
      itemsCount={items[item.id]?.length ?? 0}
      onPress={() => navigation.navigate('ListDetail', { listId: item.id, title: item.title })}
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
        <Text style={styles.sectionTitle}>Create a new list</Text>
        <TextInput
          value={newListTitle}
          onChangeText={setNewListTitle}
          placeholder="e.g. Weekly groceries"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Save list" onPress={handleCreateList} loading={creating} />
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Your lists</Text>
      {loadingLists ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(list) => list.id}
          renderItem={renderList}
          refreshControl={<RefreshControl refreshing={loadingLists} onRefresh={loadLists} />}
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  greetingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  signOut: {
    color: '#DC2626',
    fontWeight: '600',
  },
  newListCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
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
    marginBottom: 8,
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
    marginBottom: 10,
  },
});

export default HomeScreen;
