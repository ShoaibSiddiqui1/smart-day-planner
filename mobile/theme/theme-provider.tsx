import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = {
  isDark: boolean;
  toggleTheme: () => void;
  text: string;
  subtext: string;
  background: string;
  card: string;
  tint: string;
  accent: string;
  icon: string;
  border: string;
  tabIconDefault: string;
  tabIconSelected: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  overlay: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
};

const THEME_STORAGE_KEY = 'app_theme_dark';

const lightTheme = {
  isDark: false,
  text: '#0F172A',
  subtext: '#64748B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  tint: '#3B82F6',
  accent: '#14B8A6',
  icon: '#64748B',
  border: '#E2E8F0',
  tabIconDefault: '#94A3B8',
  tabIconSelected: '#3B82F6',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  shadow: 'rgba(0,0,0,0.08)',
  overlay: 'rgba(15,23,42,0.08)',
  priorityHigh: '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow: '#22C55E',
};

const darkTheme = {
  isDark: true,
  text: '#F8FAFC',
  subtext: '#94A3B8',
  background: '#020817',
  card: '#1E293B',
  tint: '#60A5FA',
  accent: '#2DD4BF',
  icon: '#94A3B8',
  border: '#334155',
  tabIconDefault: '#64748B',
  tabIconSelected: '#60A5FA',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  shadow: 'rgba(0,0,0,0.25)',
  overlay: 'rgba(255,255,255,0.06)',
  priorityHigh: '#F87171',
  priorityMedium: '#FBBF24',
  priorityLow: '#4ADE80',
};

type ThemeContextType = ThemeType;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'true');
        }
      } catch (error) {
        console.log('Failed to load theme preference', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const nextValue = !isDark;
      setIsDark(nextValue);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, String(nextValue));
    } catch (error) {
      console.log('Failed to save theme preference', error);
    }
  };

  const value = useMemo(
    () => ({
      ...(isDark ? darkTheme : lightTheme),
      isDark,
      toggleTheme,
    }),
    [isDark]
  );

  if (!isLoaded) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }

  return context;
}