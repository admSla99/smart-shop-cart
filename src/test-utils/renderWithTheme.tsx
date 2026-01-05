import React from 'react';
import { render } from '@testing-library/react-native';

import { ThemeProvider, type ThemeMode } from '../contexts/ThemeContext';

type RenderOptions = {
  themeMode?: ThemeMode;
};

export const renderWithTheme = (ui: React.ReactElement, options?: RenderOptions) => {
  const { themeMode = 'light' } = options ?? {};
  return render(<ThemeProvider initialMode={themeMode}>{ui}</ThemeProvider>);
};
