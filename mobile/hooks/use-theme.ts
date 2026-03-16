import { Colors } from '@/constants/theme';
import { useColorScheme } from './use-color-scheme';

export type AppTheme = typeof Colors.light;

export function useTheme(): AppTheme {
  const scheme = useColorScheme() ?? 'light';
  return Colors[scheme];
}
