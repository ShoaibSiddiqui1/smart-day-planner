import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { AnimatedBackground } from './AnimatedBackground';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  bottomPad?: number;
  style?: ViewStyle;
  avoidKeyboard?: boolean;
  bgVariant?: 'gradient' | 'waves' | 'subtle';
}

export function ScreenContainer({
  children,
  scrollable = false,
  bottomPad = 120,
  style,
  avoidKeyboard = false,
  bgVariant = 'subtle',
}: ScreenContainerProps) {
  const theme = useTheme();

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottomPad },
        style,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, style]}>{children}</View>
  );

  const wrapped = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <View style={[styles.safe, { backgroundColor: theme.background }]}>
      {/*  Pass isDark down */}
      <AnimatedBackground
        variant={bgVariant}
        isDark={theme.isDark}
        background={theme.background}
      />

      {/* Prevent overlay from forcing white */}
      <SafeAreaView style={[styles.safeOverlay, { backgroundColor: 'transparent' }]}>
        {wrapped}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  safeOverlay: { flex: 1 },

  fill: { flex: 1 },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
});