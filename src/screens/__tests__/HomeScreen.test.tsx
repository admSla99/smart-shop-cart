import React from 'react';
import { FlatList } from 'react-native';
import { fireEvent } from '@testing-library/react-native';

import { renderWithTheme } from '../../test-utils/renderWithTheme';
import HomeScreen from '../HomeScreen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
}));

let mockLists: Array<{
  id: string;
  title: string;
  created_at?: string;
  user_id: string;
}> = [];

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));

jest.mock('../../components/ListCard', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    ListCard: ({ title, onPress }: { title: string; onPress: () => void }) =>
      React.createElement(Text, { onPress }, title),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'demo@example.com', user_metadata: { display_name: 'Demo' } },
    signOut: jest.fn(),
  }),
}));

jest.mock('../../store/useShoppingLists', () => ({
  useShoppingStore: () => ({
    lists: mockLists,
    loadingLists: false,
    fetchLists: jest.fn(),
    createList: jest.fn(),
    deleteList: jest.fn(),
    items: {},
  }),
}));

describe('HomeScreen', () => {
  const originalDateTimeFormat = Intl.DateTimeFormat;

  beforeEach(() => {
    mockLists = [];
    mockNavigate.mockClear();
    (Intl as { DateTimeFormat: unknown }).DateTimeFormat = jest.fn(() => ({
      format: (date: Date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
      },
    })) as unknown as typeof Intl.DateTimeFormat;
  });

  afterEach(() => {
    Intl.DateTimeFormat = originalDateTimeFormat;
  });

  it('renders the list header as a React element to preserve input focus', () => {
    const { UNSAFE_getByType } = renderWithTheme(
      <HomeScreen
        navigation={{ navigate: mockNavigate } as never}
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
    const list = UNSAFE_getByType(FlatList);

    expect(React.isValidElement(list.props.ListHeaderComponent)).toBe(true);
  });

  it('renders list titles with creation date and uses them for navigation', () => {
    mockLists = [
      {
        id: 'list-1',
        title: 'Weekly Groceries',
        created_at: '2026-01-04T10:00:00Z',
        user_id: 'user-1',
      },
    ];

    const { getByText } = renderWithTheme(
      <HomeScreen
        navigation={{ navigate: mockNavigate } as never}
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );

    fireEvent.press(getByText('Weekly Groceries - Jan 4'));
    expect(mockNavigate).toHaveBeenCalledWith(
      'ListDetail',
      expect.objectContaining({ title: 'Weekly Groceries - Jan 4' }),
    );
  });

  it('renders the theme toggle', () => {
    const { getByLabelText } = renderWithTheme(
      <HomeScreen
        navigation={{ navigate: mockNavigate } as never}
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );

    expect(getByLabelText('Switch to dark mode')).toBeTruthy();
  });
});
