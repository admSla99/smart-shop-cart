import React from 'react';

import { renderWithTheme } from '../../test-utils/renderWithTheme';
import ListDetailScreen from '../ListDetailScreen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
}));

const listId = 'list-1';
const mockFetchItems = jest.fn();
const mockAddItem = jest.fn();
const mockToggleItem = jest.fn();
const mockDeleteItem = jest.fn();
const mockApplySortedOrder = jest.fn();

let mockStoreState = {
  items: { [listId]: [] as Array<{ id: string; name: string }> },
  fetchItems: mockFetchItems,
  addItem: mockAddItem,
  toggleItem: mockToggleItem,
  deleteItem: mockDeleteItem,
  applySortedOrder: mockApplySortedOrder,
  loadingItems: { [listId]: false },
};

jest.mock('../../store/useShoppingLists', () => ({
  useShoppingStore: () => mockStoreState,
}));

jest.mock('../../store/useShopLayouts', () => ({
  useShopLayouts: () => ({
    fetchLayout: jest.fn().mockResolvedValue([]),
    saveLayout: jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'demo@example.com' },
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../components/DecorativeBackground', () => ({
  DecorativeBackground: () => null,
}));

jest.mock('../../components/FadeInView', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    FadeInView: ({ children, style }: { children?: React.ReactNode; style?: unknown }) =>
      React.createElement(View, { style }, children),
  };
});

jest.mock('../../components/EmptyState', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    EmptyState: ({ title }: { title: string }) => React.createElement(Text, null, title),
  };
});

jest.mock('../../components/ItemRow', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    ItemRow: ({ label }: { label: string }) => React.createElement(Text, null, label),
  };
});

jest.mock('../../components/TextField', () => {
  const React = require('react');
  const { TextInput } = require('react-native');
  return {
    TextField: (props: Record<string, unknown>) => React.createElement(TextInput, props),
  };
});

jest.mock('../../components/Button', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Button: ({ label }: { label?: string }) => React.createElement(Text, null, label ?? ''),
  };
});

jest.mock('../../lib/layoutSorting', () => ({
  sortByLayout: jest.fn(),
}));

describe('ListDetailScreen', () => {
  beforeEach(() => {
    mockFetchItems.mockClear();
    mockAddItem.mockClear();
    mockToggleItem.mockClear();
    mockDeleteItem.mockClear();
    mockApplySortedOrder.mockClear();
    mockStoreState = {
      ...mockStoreState,
      items: { [listId]: [] },
      loadingItems: { [listId]: false },
    };
  });

  it('shows the empty state when the list has no items and is not loading', () => {
    const { getByText } = renderWithTheme(
      <ListDetailScreen
        navigation={{ goBack: jest.fn() } as never}
        route={{
          key: 'ListDetail',
          name: 'ListDetail',
          params: { listId, title: 'Test list', shopName: null, shopColor: null },
        } as never}
      />,
    );

    expect(getByText('Empty list')).toBeTruthy();
  });
});
