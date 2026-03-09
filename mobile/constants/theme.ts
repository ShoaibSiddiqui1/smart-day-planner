import { Platform } from 'react-native';

const brandBlue = '#2563EB';
const brandTeal = '#14B8A6';
const darkNavy = '#0F172A';
const lightBg = '#F8FAFC';

export const Colors = {
  light: {
    text: '#111827',
    subtext: '#6B7280',
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