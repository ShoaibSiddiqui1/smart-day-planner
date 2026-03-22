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

export default function ResetPassword() {
  const router = useRouter();
  const [token, setToken]               = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState(false);
  const [loading, setLoading]           = useState(false);

  const handleReset = async () => {
    if (!token.trim() || !newPassword || !confirmPassword) {
      setError('All fields are required.'); return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    setError(''); setLoading(true);
    try {
      await authApi.resetPassword(token.trim(), newPassword);
      setSuccess(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Invalid or expired reset code.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.root}>
        <AppBackground />
        <SafeAreaView style={styles.safe}>
          <View style={styles.successWrap}>
            <View style={styles.card}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.title}>Password Updated</Text>
              <Text style={styles.subtitle}>
                Your password has been reset successfully.
              </Text>
              <Button
                label="Back to Login"
                fullWidth
                onPress={() => router.replace('/login')}
                style={styles.primaryBtn}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
              <Text style={styles.title}>Enter New Password</Text>
              <Text style={styles.subtitle}>
                Enter the reset code from your email and choose a new password.
              </Text>

              {[
                { placeholder: 'Reset code',         value: token,       setter: setToken,       secure: false },
                { placeholder: 'New password',       value: newPassword, setter: setNewPassword, secure: true  },
                { placeholder: 'Confirm password',   value: confirmPassword, setter: setConfirm, secure: true  },
              ].map(({ placeholder, value, setter, secure }) => (
                <TextInput
                  key={placeholder}
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor={SUBTEXT}
                  autoCapitalize="none"
                  secureTextEntry={secure}
                  value={value}
                  onChangeText={setter}
                />
              ))}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                label="Reset Password"
                fullWidth
                loading={loading}
                onPress={handleReset}
                style={styles.primaryBtn}
              />

              <Pressable onPress={() => router.back()} style={styles.backLink}>
                <Text style={styles.backText}>← Back</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
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
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
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
  brandText: { ...Typography.h3, color: TEXT, letterSpacing: 0.5 },
  card: {
    backgroundColor: DARK_CARD,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: DARK_BORDER,
    padding: Spacing.lg,
  },
  successIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    color: TEAL,
  },
  title:    { ...Typography.h1, color: TEXT,    textAlign: 'center', marginBottom: Spacing.xs },
  subtitle: { ...Typography.body, color: SUBTEXT, textAlign: 'center', marginBottom: Spacing.lg },
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
  error:      { ...Typography.caption, color: '#F87171', textAlign: 'center', marginBottom: Spacing.sm },
  primaryBtn: { backgroundColor: BLUE },
  backLink:   { marginTop: Spacing.md, alignItems: 'center' },
  backText:   { ...Typography.body, color: SUBTEXT, fontWeight: '600' },
});
