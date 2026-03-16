import {
  View, Text, TextInput, Pressable,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { AppBackground } from '@/components/layout/AppBackground';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/services/api';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';

const DARK_CARD   = 'rgba(4, 16, 30, 0.82)';
const DARK_INPUT  = 'rgba(255,255,255,0.07)';
const DARK_BORDER = 'rgba(20, 184, 166, 0.25)';
const TEXT        = '#F8FAFC';
const SUBTEXT     = 'rgba(255,255,255,0.55)';
const TEAL        = '#14B8A6';
const BLUE        = '#3B82F6';

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.register(username.trim(), email.trim(), password);
      router.replace('/login');
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setError(detail ?? 'Registration failed. Please try again.');
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
            {/* Brand */}
            <View style={styles.brand}>
              <View style={styles.brandDot} />
              <Text style={styles.brandText}>SmartDayPlanner</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>
                Plan smarter. Move faster. Stay productive.
              </Text>

              <DarkInput
                placeholder="Full name"
                value={username}
                onChangeText={setUsername}
              />
              <DarkInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <DarkInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                label="Sign Up"
                fullWidth
                loading={loading}
                onPress={handleSignup}
                style={styles.primaryBtn}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable onPress={() => router.back()} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Back to login</Text>
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
  root: { flex: 1, backgroundColor: '#04101E' },
  safe: { flex: 1 },
  kav:  { flex: 1 },
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
    width: 10, height: 10,
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
  error: {
    ...Typography.caption,
    color: '#F87171',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  primaryBtn: {
    backgroundColor: BLUE,
    borderRadius: BorderRadius.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1, height: 1,
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
