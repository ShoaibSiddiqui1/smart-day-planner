import { Platform } from 'react-native';

const brandBlue = '#2563EB';
const brandTeal = '#14B8A6';
const darkNavy = '#0F172A';
const lightBg = '#F8FAFC';

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
    text: '#F8FAFC',
    subtext: '#94A3B8',
    background: darkNavy,
    card: '#111827',
    tint: '#60A5FA',
    accent: '#2DD4BF',
    icon: '#94A3B8',
    border: '#1F2937',
    tabIconDefault: '#64748B',
    tabIconSelected: '#60A5FA',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    priorityHigh: '#F87171',
    priorityMedium: '#FBBF24',
    priorityLow: '#4ADE80',
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
  hero:    { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1:      { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
  h2:      { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.2 },
  h3:      { fontSize: 18, fontWeight: '700' as const },
  h4:      { fontSize: 16, fontWeight: '700' as const },
  body:    { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySm:  { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label:   { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.3 },
  caption: { fontSize: 13, fontWeight: '500' as const },
  button:  { fontSize: 15, fontWeight: '700' as const },
  buttonSm:{ fontSize: 13, fontWeight: '700' as const },
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