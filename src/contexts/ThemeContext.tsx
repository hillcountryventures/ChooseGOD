/**
 * ThemeContext — App-wide theme provider
 *
 * Reads system color scheme, allows manual toggle, persists to AsyncStorage.
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, darkTheme, lightTheme } from '../constants/theme';

const STORAGE_KEY = '@choosegod_theme_preference';

type ThemePreference = 'system' | 'dark' | 'light';

export interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  toggleTheme: () => void;
  setPreference: (pref: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  preference: 'system',
  toggleTheme: () => {},
  setPreference: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'dark' || value === 'light' || value === 'system') {
        setPreferenceState(value);
      }
    });
  }, []);

  const resolvedTheme = (() => {
    if (preference === 'dark') return darkTheme;
    if (preference === 'light') return lightTheme;
    return systemScheme === 'light' ? lightTheme : darkTheme;
  })();

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = resolvedTheme.dark ? 'light' : 'dark';
    setPreference(next);
  }, [resolvedTheme.dark, setPreference]);

  return (
    <ThemeContext.Provider value={{ theme: resolvedTheme, preference, toggleTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};
