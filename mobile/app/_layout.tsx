import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

/**
 * RouteGuard
 * Watches the auth state and redirects accordingly:
 *  - Unauthenticated user trying to reach a protected screen → /login
 *  - Authenticated user landing on /login or /signup         → /(tabs)
 * Renders nothing; only runs side-effects.
 */
function RouteGuard() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait until AsyncStorage is read

    const inProtectedGroup = segments[0] === '(tabs)';
    const inGuestGroup =
      segments[0] === 'login' || segments[0] === 'signup';

    if (!token && inProtectedGroup) {
      router.replace('/login');
    } else if (token && inGuestGroup) {
      router.replace('/(tabs)');
    }
  }, [token, loading, segments]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RouteGuard />
        <Stack initialRouteName="login">
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
