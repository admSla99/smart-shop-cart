import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { darkPalette, lightPalette, type Palette } from '../theme/colors';
import { createLayout, type Layout } from '../theme/layout';
import { createTypography, type Typography } from '../theme/typography';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  themeMode: ThemeMode;
  palette: Palette;
  typography: Typography;
  layout: Layout;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = 'theme-preference';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren<{ initialMode?: ThemeMode }>> = ({
  children,
  initialMode,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode ?? 'light');

  useEffect(() => {
    if (initialMode) return;
    let isMounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (!isMounted) return;
        if (stored === 'light' || stored === 'dark') {
          setThemeMode(stored);
        }
      })
      .catch(() => null);

    return () => {
      isMounted = false;
    };
  }, [initialMode]);

  const toggleTheme = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => null);
  };

  const palette = themeMode === 'dark' ? darkPalette : lightPalette;
  const typography = useMemo(() => createTypography(palette), [palette]);
  const layout = useMemo(() => createLayout(palette), [palette]);

  const value = useMemo(
    () => ({
      themeMode,
      palette,
      typography,
      layout,
      toggleTheme,
    }),
    [themeMode, palette, typography, layout],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
};
