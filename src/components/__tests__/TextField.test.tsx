import React from 'react';

import { darkPalette } from '../../theme/colors';
import { renderWithTheme } from '../../test-utils/renderWithTheme';
import { TextField } from '../TextField';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
}));

describe('TextField', () => {
  it('renders without crashing', () => {
    const { getByText } = renderWithTheme(<TextField label='Name' />);
    expect(getByText('Name')).toBeTruthy();
  });

  it('uses themed placeholder color in dark mode', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <TextField placeholder='Email' />,
      { themeMode: 'dark' },
    );
    const input = getByPlaceholderText('Email');
    expect(input.props.placeholderTextColor).toBe(darkPalette.textTertiary);
  });
});
