import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...rest }: InputProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? theme.danger : theme.border,
            color: theme.text,
            backgroundColor: theme.background,
          },
          style,
        ]}
        placeholderTextColor={theme.subtext}
        {...rest}
      />
      {error ? (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.sm + 4,
  },
  label: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    ...Typography.body,
  },
  error: {
    ...Typography.label,
    marginTop: Spacing.xs,
  },
});
