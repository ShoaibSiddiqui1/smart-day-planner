import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing } from '@/constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Optional element rendered to the right of the title row (e.g. a button) */
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function Header({ title, subtitle, right, style }: HeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <View style={styles.textGroup}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.subtext }]}>{subtitle}</Text>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textGroup: { flex: 1 },
  title: {
    ...Typography.h1,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.body,
    marginTop: 2,
  },
  right: {
    marginLeft: Spacing.sm,
    alignSelf: 'center',
  },
});
