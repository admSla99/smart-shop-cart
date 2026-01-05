import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider, useTheme } from '../ThemeContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const ThemeProbe = ({ onReady }: { onReady?: (mode: string) => void }) => {
  const { themeMode, toggleTheme } = useTheme();

  useEffect(() => {
    onReady?.(themeMode);
  }, [onReady, themeMode]);

  return (
    <View>
      <Text testID="theme-mode">{themeMode}</Text>
      <Pressable testID="theme-toggle" onPress={toggleTheme} />
    </View>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('loads stored theme and persists toggles', async () => {
    const { findByTestId, getByTestId } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    const mode = await findByTestId('theme-mode');
    expect(mode.props.children).toBe('dark');

    fireEvent.press(getByTestId('theme-toggle'));
    expect(getByTestId('theme-mode').props.children).toBe('light');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('theme-preference', 'light');
  });
});
