import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { useTheme } from '@/hooks/use-theme';
import { Typography, Spacing } from '@/constants/theme';

interface MetricCardProps {
  value: string | number;
  label: string;
  /** Accent color for the value — defaults to theme tint */
  color?: string;
}

export function MetricCard({ value, label, color }: MetricCardProps) {
  const theme = useTheme();
  const accentColor = color ?? theme.tint;

  return (
    <Card style={styles.card}>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.subtext }]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginBottom: 0,
    paddingVertical: Spacing.md,
  },
  value: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.caption,
  },
});
