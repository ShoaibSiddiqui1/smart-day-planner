  /**
   * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
   * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
   */

  import { Platform } from 'react-native';

  const lightBg = '#F8FAFC';   // A very light slate/gray
  const brandBlue = '#3B82F6';  // A standard blue
  const brandTeal = '#14B8A6';  // A standard teal

  const tintColorLight = '#0a7ea4';
  const tintColorDark = '#fff';

  export const Colors = {
    light: {
      text: '#0F172A',
      subtext: '#64748B',
      background: lightBg,
      card: '#FFFFFF',
      tint: brandBlue,
      accent: brandTeal,
      icon: '#64748B',
      border: '#E2E8F0',
      tabIconDefault: '#94A3B8',
      tabIconSelected: brandBlue,
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
      priorityHigh: '#EF4444',
      priorityMedium: '#F59E0B',
      priorityLow: '#22C55E',
    },
    dark: {
      text: '#ECEDEE',
      subtext: '#94A3B8',
      background: '#0F172A',   // Deep dark slate
      card: '#1E293B',         // Slightly lighter than background
      tint: tintColorDark,
      accent: brandTeal,
      icon: '#9BA1A6',
      border: '#334155',
      tabIconDefault: '#9BA1A6',
      tabIconSelected: tintColorDark,
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
      priorityHigh: '#EF4444',
      priorityMedium: '#F59E0B',
      priorityLow: '#22C55E',
    },
  };

  export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  } as const;

  export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    full: 9999,
  } as const;

  export const Typography = {
    hero:     { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
    h1:       { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
    h2:       { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.2 },
    h3:       { fontSize: 18, fontWeight: '700' as const },
    h4:       { fontSize: 16, fontWeight: '700' as const },
    body:     { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    bodySm:   { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
    label:    { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.3 },
    caption:  { fontSize: 13, fontWeight: '500' as const },
    button:   { fontSize: 15, fontWeight: '700' as const },
    buttonSm: { fontSize: 13, fontWeight: '700' as const },
  } as const;

  export const Shadows = {
    sm: {
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  } as const;

  export const Fonts = Platform.select({
    ios: {
      sans: 'system-ui',
      serif: 'ui-serif',
      rounded: 'ui-rounded',
      mono: 'ui-monospace',
    },
    default: {
      sans: 'normal',
      serif: 'serif',
      rounded: 'normal',
      mono: 'monospace',
    },
    web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
      rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
  });