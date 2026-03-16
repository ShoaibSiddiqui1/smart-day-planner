/**
 * AppBackground
 *
 * Full-screen dark-map background that matches the RouteFlow landing page
 * aesthetic from the design reference. Use this on auth screens (login,
 * signup, forgot/reset-password) by rendering it as the first child inside
 * a View that has flex:1.
 *
 * Usage:
 *   <View style={{ flex: 1 }}>
 *     <AppBackground />
 *     {your screen content on top}
 *   </View>
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG       = '#04101E';   // deep navy base
const TEAL     = '#14B8A6';
const TEAL_DIM = '#0D9488';
const BLUE     = '#1D4ED8';
const CYAN     = '#06B6D4';

// ── Dot positions (random-looking scatter of "city lights") ───────────────────
const DOTS: Array<{ x: number; y: number; r: number; opacity: number }> = [
  { x: 0.72, y: 0.18, r: 2.5, opacity: 0.9 },
  { x: 0.65, y: 0.22, r: 1.5, opacity: 0.6 },
  { x: 0.80, y: 0.30, r: 2,   opacity: 0.7 },
  { x: 0.55, y: 0.38, r: 3,   opacity: 0.8 },
  { x: 0.42, y: 0.50, r: 2,   opacity: 0.6 },
  { x: 0.62, y: 0.55, r: 2.5, opacity: 0.9 },
  { x: 0.78, y: 0.60, r: 1.5, opacity: 0.5 },
  { x: 0.30, y: 0.65, r: 2,   opacity: 0.6 },
  { x: 0.50, y: 0.70, r: 1.5, opacity: 0.4 },
  { x: 0.18, y: 0.28, r: 2,   opacity: 0.5 },
  { x: 0.88, y: 0.42, r: 1.5, opacity: 0.5 },
  { x: 0.10, y: 0.55, r: 2,   opacity: 0.4 },
];

export function AppBackground() {
  // Shared values for glow pulse animation
  const glow1Opacity  = useSharedValue(0.25);
  const glow2Opacity  = useSharedValue(0.15);
  const arcOpacity    = useSharedValue(0.55);

  useEffect(() => {
    glow1Opacity.value = withRepeat(
      withTiming(0.5, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    );
    glow2Opacity.value = withRepeat(
      withTiming(0.35, { duration: 4600, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    );
    arcOpacity.value = withRepeat(
      withTiming(0.8, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glow1Style = useAnimatedStyle(() => ({ opacity: glow1Opacity.value }));
  const glow2Style = useAnimatedStyle(() => ({ opacity: glow2Opacity.value }));
  const arcStyle   = useAnimatedStyle(() => ({ opacity: arcOpacity.value }));

  return (
    <View style={styles.root} pointerEvents="none">
      {/* ── 1. Dark base ── */}
      <View style={styles.base} />

      {/* ── 2. Ambient glow blobs ── */}
      {/* Upper-right glow (blue-white) */}
      <Animated.View style={[styles.glowBlob, styles.glowBlobTopRight, glow1Style]} />
      {/* Center glow (teal) */}
      <Animated.View style={[styles.glowBlob, styles.glowBlobCenter, glow2Style]} />
      {/* Bottom-left glow (blue) */}
      <Animated.View style={[styles.glowBlob, styles.glowBlobBottomLeft, glow2Style]} />

      {/* ── 3. Route arc lines ── */}
      {/* Primary arc — large sweep from bottom-left to upper-right */}
      <Animated.View style={[styles.arc, styles.arcPrimary, arcStyle]} />
      {/* Secondary arc — crossing diagonal */}
      <Animated.View style={[styles.arc, styles.arcSecondary, arcStyle]} />
      {/* Tertiary arc — smaller right-side curve */}
      <Animated.View style={[styles.arc, styles.arcTertiary, arcStyle]} />

      {/* ── 4. Glowing route nodes ── */}
      <RouteNode x={W * 0.72} y={H * 0.22} color={CYAN}  size={8} />
      <RouteNode x={W * 0.55} y={H * 0.40} color={TEAL}  size={10} />
      <RouteNode x={W * 0.62} y={H * 0.56} color={TEAL}  size={7} />

      {/* ── 5. Scatter dots ── */}
      {DOTS.map((d, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              width:  d.r * 2,
              height: d.r * 2,
              borderRadius: d.r,
              left: W * d.x - d.r,
              top:  H * d.y - d.r,
              opacity: d.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ── Route node — a bright dot with layered glow rings ─────────────────────────
function RouteNode({
  x, y, color, size,
}: { x: number; y: number; color: string; size: number }) {
  const pulse = useSharedValue(0.6);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2000 + Math.random() * 1500, easing: Easing.inOut(Easing.sin) }),
      -1, true,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ringStyle = useAnimatedStyle(() => ({ opacity: pulse.value * 0.25 }));

  return (
    <View style={[styles.nodeWrap, { left: x - size * 3.5, top: y - size * 3.5 }]}>
      {/* Outer ring glow */}
      <Animated.View
        style={[
          styles.nodeRing,
          ringStyle,
          { width: size * 7, height: size * 7, borderRadius: size * 3.5, borderColor: color },
        ]}
      />
      {/* Inner glow */}
      <View
        style={[
          styles.nodeInner,
          {
            width: size * 3, height: size * 3,
            borderRadius: size * 1.5,
            backgroundColor: color,
            opacity: 0.3,
            left: size * 2, top: size * 2,
          },
        ]}
      />
      {/* Core dot */}
      <View
        style={[
          styles.nodeCore,
          {
            width: size, height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            left: size * 3, top: size * 3,
          },
        ]}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ARC_SIZE  = W * 1.6;
const ARC_HALF  = ARC_SIZE / 2;

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
  },

  // Glow blobs — large, very low opacity circles that pulse
  glowBlob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glowBlobTopRight: {
    width:  W * 0.9,
    height: W * 0.9,
    top: -W * 0.2,
    right: -W * 0.25,
    backgroundColor: BLUE,
    opacity: 0.18,
  },
  glowBlobCenter: {
    width:  W * 0.7,
    height: W * 0.7,
    top: H * 0.25,
    left: W * 0.15,
    backgroundColor: TEAL,
    opacity: 0.10,
  },
  glowBlobBottomLeft: {
    width:  W * 0.6,
    height: W * 0.6,
    bottom: -W * 0.15,
    left: -W * 0.15,
    backgroundColor: BLUE,
    opacity: 0.12,
  },

  // Arc lines — large circles with one visible border side = arc effect
  arc: {
    position: 'absolute',
    width:  ARC_SIZE,
    height: ARC_SIZE,
    borderRadius: ARC_HALF,
    borderWidth: 0,
  },
  arcPrimary: {
    // Sweeps from bottom-left to upper-right
    borderTopWidth: 1.5,
    borderTopColor: TEAL,
    left: -W * 0.55,
    top:  H * 0.10,
    transform: [{ rotate: '-30deg' }],
    opacity: 0.65,
    shadowColor: TEAL,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  arcSecondary: {
    // Crosses diagonally
    borderTopWidth: 1,
    borderTopColor: CYAN,
    left: -W * 0.2,
    top:  H * 0.35,
    transform: [{ rotate: '-15deg' }],
    opacity: 0.45,
    shadowColor: CYAN,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  arcTertiary: {
    // Smaller right-side curve
    width:  W,
    height: W,
    borderRadius: W / 2,
    borderRightWidth: 1.5,
    borderRightColor: TEAL_DIM,
    right: -W * 0.35,
    top:   H * 0.20,
    transform: [{ rotate: '20deg' }],
    opacity: 0.4,
  },

  // Dots
  dot: {
    position: 'absolute',
    backgroundColor: TEAL,
  },

  // Node compound views
  nodeWrap: {
    position: 'absolute',
  },
  nodeRing: {
    position: 'absolute',
    borderWidth: 1,
  },
  nodeInner: {
    position: 'absolute',
  },
  nodeCore: {
    position: 'absolute',
  },
});
