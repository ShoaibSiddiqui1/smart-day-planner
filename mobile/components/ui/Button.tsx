import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Typography, Spacing } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const bgColor = {
    primary: theme.tint,
    secondary: theme.card,
    ghost: 'transparent',
    danger: theme.danger,
  }[variant];

  const textColor = {
    primary: 'white',
    secondary: theme.text,
    ghost: theme.tint,
    danger: 'white',
  }[variant];

  const borderColor = variant === 'secondary' ? theme.border : 'transparent';

  const padding = {
    sm: { paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md },
    md: { paddingVertical: 14, paddingHorizontal: Spacing.lg },
    lg: { paddingVertical: 16, paddingHorizontal: Spacing.xl },
  }[size];

  const textTypo = size === 'sm' ? Typography.buttonSm : Typography.button;

  const buttonStyle: StyleProp<ViewStyle> = [
    animatedStyle,
    styles.base,
    padding,
    {
      backgroundColor: bgColor,
      borderColor,
      borderWidth: variant === 'secondary' ? 1 : 0,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ];

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={buttonStyle} 
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[textTypo, { color: textColor }, textStyle]}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});