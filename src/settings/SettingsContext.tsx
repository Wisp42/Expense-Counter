import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ThemeName = 'light' | 'dark';

const KEYS = {
  currencySymbol: '@expense-counter/currencySymbol',
  theme: '@expense-counter/theme',
  roundBalance: '@expense-counter/roundBalance',
} as const;

const DEFAULTS = {
  currencySymbol: '$',
  theme: 'light' as ThemeName,
  roundBalance: false,
};

interface SettingsContextValue {
  loaded: boolean;
  currencySymbol: string;
  theme: ThemeName;
  roundBalance: boolean;
  setCurrencySymbol: (v: string) => void;
  setTheme: (v: ThemeName) => void;
  setRoundBalance: (v: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [currencySymbol, setCurrencySymbolState] = useState(DEFAULTS.currencySymbol);
  const [theme, setThemeState] = useState<ThemeName>(DEFAULTS.theme);
  const [roundBalance, setRoundBalanceState] = useState(DEFAULTS.roundBalance);

  useEffect(() => {
    (async () => {
      const entries = await AsyncStorage.multiGet([KEYS.currencySymbol, KEYS.theme, KEYS.roundBalance]);
      const map = Object.fromEntries(entries);
      if (map[KEYS.currencySymbol]) setCurrencySymbolState(map[KEYS.currencySymbol]!);
      if (map[KEYS.theme] === 'light' || map[KEYS.theme] === 'dark') {
        setThemeState(map[KEYS.theme] as ThemeName);
      }
      if (map[KEYS.roundBalance] != null) setRoundBalanceState(map[KEYS.roundBalance] === '1');
      setLoaded(true);
    })();
  }, []);

  const setCurrencySymbol = useCallback((v: string) => {
    setCurrencySymbolState(v);
    AsyncStorage.setItem(KEYS.currencySymbol, v);
  }, []);

  const setTheme = useCallback((v: ThemeName) => {
    setThemeState(v);
    AsyncStorage.setItem(KEYS.theme, v);
  }, []);

  const setRoundBalance = useCallback((v: boolean) => {
    setRoundBalanceState(v);
    AsyncStorage.setItem(KEYS.roundBalance, v ? '1' : '0');
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        loaded,
        currencySymbol,
        theme,
        roundBalance,
        setCurrencySymbol,
        setTheme,
        setRoundBalance,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
