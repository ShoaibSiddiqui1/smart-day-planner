import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius, Typography } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color: string;
  variant?: 'solid' | 'outline';
}

export function Badge({ label, color, variant = 'solid' }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        variant === 'solid'
          ? { backgroundColor: color }
          : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: color },
      ]}
    >
      <Text style={[styles.text, { color: variant === 'solid' ? 'white' : color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.label,
  },
});
