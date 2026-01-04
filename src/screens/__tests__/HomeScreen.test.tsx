import React from 'react';
import { FlatList } from 'react-native';
import { render } from '@testing-library/react-native';

import HomeScreen from '../HomeScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));

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
    lists: [],
    loadingLists: false,
    fetchLists: jest.fn(),
    createList: jest.fn(),
    deleteList: jest.fn(),
    items: {},
  }),
}));

describe('HomeScreen', () => {
  it('renders the list header as a React element to preserve input focus', () => {
    const { UNSAFE_getByType } = render(
      <HomeScreen
        navigation={{ navigate: jest.fn() } as never}
        route={{ key: 'Home', name: 'Home' } as never}
      />,
    );
    const list = UNSAFE_getByType(FlatList);

    expect(React.isValidElement(list.props.ListHeaderComponent)).toBe(true);
  });
});
