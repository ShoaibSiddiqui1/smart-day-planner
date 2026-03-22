import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/use-theme';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'waves' | 'subtle';
}

export function AnimatedBackground({ variant = 'subtle' }: AnimatedBackgroundProps) {
  const theme = useTheme();

  const rotate1 = useSharedValue(0);
  const rotate2 = useSharedValue(0);

  useEffect(() => {
    // Continuous rotating animation for gradient orbs
    rotate1.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1
    );

    rotate2.value = withRepeat(
      withTiming(360, {
        duration: 25000,
        easing: Easing.linear,
      }),
      -1
    );
  }, [rotate1, rotate2]);

  const animated1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate1.value}deg` }],
  }));

  const animated2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate2.value}deg` }],
  }));

  const isDark = theme.background === '#0F172A';

  if (variant === 'gradient') {
    return (
      <View style={styles.container}>
        {/* Base solid background */}
        <View
          style={[
            styles.base,
            {
              backgroundColor: theme.background,
            },
          ]}
        />

        {/* Gradient orbs with animation */}
        <Animated.View style={[styles.orb1, animated1]}>
          <View
            style={[
              styles.orbGradient,
              {
                backgroundColor: isDark ? '#2563EB' : '#3B82F6',
                opacity: isDark ? 0.25 : 0.15,
              },
            ]}
          />
        </Animated.View>

        <Animated.View style={[styles.orb2, animated2]}>
          <View
            style={[
              styles.orbGradient,
              {
                backgroundColor: isDark ? '#14B8A6' : '#06B6D4',
                opacity: isDark ? 0.2 : 0.1,
              },
            ]}
          />
        </Animated.View>
      </View>
    );
  }

  if (variant === 'waves') {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.base,
            {
              backgroundColor: theme.background,
            },
          ]}
        />

        {/* Top gradient wave */}
        <Animated.View style={[styles.wave1, animated1]}>
          <View
            style={[
              styles.waveFill,
              {
                backgroundColor: isDark
                  ? 'rgba(37, 99, 235, 0.1)'
                  : 'rgba(59, 130, 246, 0.08)',
              },
            ]}
          />
        </Animated.View>

        {/* Bottom gradient wave */}
        <Animated.View style={[styles.wave2, animated2]}>
          <View
            style={[
              styles.waveFill,
              {
                backgroundColor: isDark
                  ? 'rgba(20, 184, 166, 0.08)'
                  : 'rgba(6, 182, 212, 0.06)',
              },
            ]}
          />
        </Animated.View>
      </View>
    );
  }

  // Default: subtle background
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.base,
          {
            backgroundColor: theme.background,
          },
        ]}
      />

      {/* Subtle accent orbs - very light and slow */}
      <Animated.View style={[styles.subtleOrb1, animated1]}>
        <View
          style={[
            styles.subtleOrbFill,
            {
              backgroundColor: isDark ? '#2563EB' : '#3B82F6',
              opacity: isDark ? 0.08 : 0.04,
            },
          ]}
        />
      </Animated.View>

      <Animated.View style={[styles.subtleOrb2, animated2]}>
        <View
          style={[
            styles.subtleOrbFill,
            {
              backgroundColor: isDark ? '#14B8A6' : '#06B6D4',
              opacity: isDark ? 0.06 : 0.03,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  base: {
    flex: 1,
  },

  // Gradient variant orbs
  orb1: {
    position: 'absolute',
    top: '-30%',
    right: '-20%',
    width: '80%',
    aspectRatio: 1,
  },
  orb2: {
    position: 'absolute',
    bottom: '-40%',
    left: '-30%',
    width: '100%',
    aspectRatio: 1,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    blur: 100,
  },

  // Waves variant
  wave1: {
    position: 'absolute',
    top: '-20%',
    left: '-50%',
    width: '200%',
    height: '100%',
  },
  wave2: {
    position: 'absolute',
    bottom: '-20%',
    right: '-50%',
    width: '200%',
    height: '100%',
  },
  waveFill: {
    width: '100%',
    height: '100%',
  },

  // Subtle variant orbs
  subtleOrb1: {
    position: 'absolute',
    top: '-50%',
    right: '-40%',
    width: '120%',
    aspectRatio: 1,
  },
  subtleOrb2: {
    position: 'absolute',
    bottom: '-50%',
    left: '-40%',
    width: '120%',
    aspectRatio: 1,
  },
  subtleOrbFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
});
