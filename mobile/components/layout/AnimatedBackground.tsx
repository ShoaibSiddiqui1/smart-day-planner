import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'waves' | 'subtle';
  isDark: boolean;
  background: string;
}

export function AnimatedBackground({
  variant = 'subtle',
  isDark,
  background,
}: AnimatedBackgroundProps) {
  const rotate1 = useSharedValue(0);
  const rotate2 = useSharedValue(0);

  useEffect(() => {
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
  }, []);

  const animated1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate1.value}deg` }],
  }));

  const animated2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate2.value}deg` }],
  }));

  // 🌑 DARK MODE COLORS (deep, not glowing)
  const darkPrimary = '#1E293B';   // slate
  const darkSecondary = '#020617'; // near black

  // 🌞 LIGHT MODE COLORS
  const lightPrimary = '#3B82F6';
  const lightSecondary = '#06B6D4';

  if (variant === 'gradient') {
    return (
      <View style={styles.container}>
        <View style={[styles.base, { backgroundColor: background }]} />

        <Animated.View style={[styles.orb1, animated1]}>
          <View
            style={[
              styles.orbGradient,
              {
                backgroundColor: isDark ? darkPrimary : lightPrimary,
                opacity: isDark ? 0.4 : 0.15,
              },
            ]}
          />
        </Animated.View>

        <Animated.View style={[styles.orb2, animated2]}>
          <View
            style={[
              styles.orbGradient,
              {
                backgroundColor: isDark ? darkSecondary : lightSecondary,
                opacity: isDark ? 0.5 : 0.1,
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
        <View style={[styles.base, { backgroundColor: background }]} />

        <Animated.View style={[styles.wave1, animated1]}>
          <View
            style={[
              styles.waveFill,
              {
                backgroundColor: isDark
                  ? 'rgba(30, 41, 59, 0.25)'
                  : 'rgba(59, 130, 246, 0.08)',
              },
            ]}
          />
        </Animated.View>

        <Animated.View style={[styles.wave2, animated2]}>
          <View
            style={[
              styles.waveFill,
              {
                backgroundColor: isDark
                  ? 'rgba(2, 6, 23, 0.3)'
                  : 'rgba(6, 182, 212, 0.06)',
              },
            ]}
          />
        </Animated.View>
      </View>
    );
  }

  // 🌟 DEFAULT: subtle (best)
  return (
    <View style={styles.container}>
      <View style={[styles.base, { backgroundColor: background }]} />

      <Animated.View style={[styles.subtleOrb1, animated1]}>
        <View
          style={[
            styles.subtleOrbFill,
            {
              backgroundColor: isDark ? darkPrimary : lightPrimary,
              opacity: isDark ? 0.4 : 0.04,
            },
          ]}
        />
      </Animated.View>

      <Animated.View style={[styles.subtleOrb2, animated2]}>
        <View
          style={[
            styles.subtleOrbFill,
            {
              backgroundColor: isDark ? darkSecondary : lightSecondary,
              opacity: isDark ? 0.5 : 0.03,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1, // ✅ keeps background behind everything
  },

  base: {
    flex: 1,
  },

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
  },

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