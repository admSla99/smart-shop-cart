import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../ThemeToggle';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Feather: ({ name }: { name: string }) => React.createElement(Text, null, name),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('ThemeToggle', () => {
  it('shows moon in light mode and sun after toggle', () => {
    const { getByText, getByLabelText } = render(
      <ThemeProvider>
        <ThemeToggle rightOffset={0} />
      </ThemeProvider>,
    );

    expect(getByText('moon')).toBeTruthy();
    fireEvent.press(getByLabelText('Switch to dark mode'));
    expect(getByText('sun')).toBeTruthy();
  });

  it('renders header variant without absolute positioning', () => {
    const { getByLabelText } = render(
      <ThemeProvider>
        <ThemeToggle variant="header" />
      </ThemeProvider>,
    );

    const button = getByLabelText('Switch to dark mode');
    const resolvedStyle =
      typeof button.props.style === 'function'
        ? button.props.style({ pressed: false })
        : button.props.style;
    const flattened = StyleSheet.flatten(resolvedStyle);

    expect(flattened?.position).not.toBe('absolute');
  });
});
