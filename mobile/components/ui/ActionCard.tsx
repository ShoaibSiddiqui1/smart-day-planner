import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Button } from './Button';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Typography, Spacing, Shadows } from '@/constants/theme';

interface ActionCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
  /** Background color — defaults to theme tint (blue) */
  color?: string;
  style?: ViewStyle;
}

export function ActionCard({
  title,
  description,
  buttonLabel,
  onPress,
  color,
  style,
}: ActionCardProps) {
  const theme = useTheme();
  const bg = color ?? theme.tint;

  return (
    <View style={[styles.card, Shadows.md, { backgroundColor: bg }, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Button
        label={buttonLabel}
        onPress={onPress}
        style={styles.button}
        textStyle={{ color: bg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: 'white',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
});
