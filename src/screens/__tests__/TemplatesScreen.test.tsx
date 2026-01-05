import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { renderWithTheme } from '../../test-utils/renderWithTheme';

import TemplatesScreen from '../TemplatesScreen';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
}));

const mockTemplates = [
  {
    id: 'template-1',
    shop_name: 'Super Long Grocery Shop Name That Might Wrap',
    template_name: 'Weekly Essentials Template With Extra Long Title',
    area_name: 'Produce',
    sequence: 1,
  },
];

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useFocusEffect: (callback: () => void) => React.useEffect(() => callback(), [callback]),
  };
});

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
    FadeInView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
  };
});

jest.mock('../../components/Button', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Button: ({ label }: { label?: string }) =>
      React.createElement(Text, null, label ?? ''),
  };
});

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'demo@example.com', user_metadata: { display_name: 'Demo' } },
  }),
}));

jest.mock('../../lib/supabase', () => {
  const builder = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    then: (resolve: (value: { data: typeof mockTemplates; error: null }) => void) =>
      resolve({ data: mockTemplates, error: null }),
  };
  return {
    supabase: {
      from: jest.fn(() => builder),
    },
  };
});

describe('TemplatesScreen', () => {
  it('truncates long titles and keeps actions pinned to the right', async () => {
    const { findByText, getByTestId, queryByText } = renderWithTheme(<TemplatesScreen />);
    const title = await findByText(mockTemplates[0].template_name);
    const key = `${mockTemplates[0].shop_name}::${mockTemplates[0].template_name}`;

    expect(title.props.numberOfLines).toBe(1);
    expect(title.props.ellipsizeMode).toBe('tail');

    const info = getByTestId(`template-info-${key}`);
    const infoStyle = StyleSheet.flatten(info.props.style);
    expect(infoStyle?.flex).toBe(1);
    expect(infoStyle?.minWidth).toBe(0);

    const actions = getByTestId(`template-actions-${key}`);
    const actionsStyle = StyleSheet.flatten(actions.props.style);
    expect(actionsStyle?.flexShrink).toBe(0);
    expect(queryByText('Edit')).toBeNull();
    expect(queryByText('Delete')).toBeNull();
  });
});
