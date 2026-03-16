import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { AnimatedBackground } from './AnimatedBackground';

interface ScreenContainerProps {
  children: React.ReactNode;
  /** Set false for full-screen non-scrollable screens (e.g. Map) */
  scrollable?: boolean;
  /** Extra padding at the bottom — defaults to 108 so content clears the floating tab bar */
  bottomPad?: number;
  style?: ViewStyle;
  /** Wrap in KeyboardAvoidingView — useful for form screens */
  avoidKeyboard?: boolean;
  /** Background animation variant: 'gradient', 'waves', or 'subtle' (default) */
  bgVariant?: 'gradient' | 'waves' | 'subtle';
}

export function ScreenContainer({
  children,
  scrollable = true,
  bottomPad = 120,
  style,
  avoidKeyboard = false,
  bgVariant = 'subtle',
}: ScreenContainerProps) {
  const theme = useTheme();

  const inner = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }, style]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, style]}>{children}</View>
  );

  const content = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {inner}
    </KeyboardAvoidingView>
  ) : inner;

  return (
    <View style={[styles.safe, { backgroundColor: theme.background }]}>
      <AnimatedBackground variant={bgVariant} />
      <SafeAreaView style={styles.safeOverlay}>
        {content}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  safeOverlay: { flex: 1 },
  fill: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
});
