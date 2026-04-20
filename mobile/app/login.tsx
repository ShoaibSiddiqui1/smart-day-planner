import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppBackground } from '@/components/layout/AppBackground';
import { Button } from '@/components/ui/Button';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';
import { authApi } from '@/services/api';

const DARK_CARD = 'rgba(4, 16, 30, 0.82)';
const DARK_INPUT = 'rgba(255,255,255,0.07)';
const DARK_BORDER = 'rgba(20, 184, 166, 0.25)';
const TEXT = '#F8FAFC';
const SUBTEXT = 'rgba(255,255,255,0.55)';
const TEAL = '#14B8A6';
const BLUE = '#3B82F6';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await authApi.login(trimmedEmail, trimmedPassword);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('LOGIN ERROR:', err);
      Alert.alert('Login failed', err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <AppBackground />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brand}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>SmartDayPlanner</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your account</Text>

              <DarkInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
                returnKeyType="next"
              />

              <DarkInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <Pressable
                onPress={() => Alert.alert('Coming soon', 'Forgot password is not set up yet.')}
                style={styles.forgotWrap}
                disabled={loading}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <Button
                label={loading ? 'Signing In...' : 'Sign In'}
                fullWidth
                onPress={handleLogin}
                style={styles.primaryBtn}
              />

              {loading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={TEAL} />
                  <Text style={styles.loadingText}>Checking your account...</Text>
                </View>
              )}

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                onPress={() => router.push('/signup')}
                style={styles.secondaryBtn}
                disabled={loading}
              >
                <Text style={styles.secondaryBtnText}>Create an account</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function DarkInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={SUBTEXT}
      style={styles.input}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#04101E',
  },
  safe: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: TEAL,
  },
  brandText: {
    ...Typography.h3,
    color: TEXT,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: DARK_CARD,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: DARK_BORDER,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: TEXT,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: SUBTEXT,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: DARK_INPUT,
    borderWidth: 1,
    borderColor: DARK_BORDER,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    color: TEXT,
    fontSize: 15,
    marginBottom: Spacing.sm + 2,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  forgotText: {
    ...Typography.caption,
    color: TEAL,
  },
  primaryBtn: {
    backgroundColor: BLUE,
    borderRadius: BorderRadius.md,
  },
  loadingRow: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    ...Typography.caption,
    color: SUBTEXT,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DARK_BORDER,
  },
  dividerText: {
    ...Typography.caption,
    color: SUBTEXT,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: DARK_BORDER,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...Typography.button,
    color: TEXT,
  },
});