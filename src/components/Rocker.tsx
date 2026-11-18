import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RemoteTheme } from '../constants/theme';

export interface RockerProps {
  title: string;
  topLabel?: string;
  bottomLabel?: string;
  onTopPress: () => void;
  onBottomPress: () => void;
  repeatIntervalMs?: number;
}

export const Rocker: React.FC<RockerProps> = ({
  title,
  topLabel = '+',
  bottomLabel = '-',
  onTopPress,
  onBottomPress,
  repeatIntervalMs = 140,
}) => {
  const topIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [topAnim] = useState(() => new Animated.Value(1));
  const [bottomAnim] = useState(() => new Animated.Value(1));

  // Top Action (Volume Up / Channel Up)
  const handleTopPressIn = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    Animated.spring(topAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 40,
    }).start();

    onTopPress();

    // Start repeating on hold after 350ms delay
    topIntervalRef.current = setTimeout(() => {
      topIntervalRef.current = setInterval(() => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        onTopPress();
      }, repeatIntervalMs);
    }, 350) as any;
  };

  const handleTopPressOut = () => {
    Animated.spring(topAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();

    if (topIntervalRef.current) {
      clearInterval(topIntervalRef.current);
      clearTimeout(topIntervalRef.current as any);
      topIntervalRef.current = null;
    }
  };

  // Bottom Action (Volume Down / Channel Down)
  const handleBottomPressIn = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    Animated.spring(bottomAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 40,
    }).start();

    onBottomPress();

    // Start repeating on hold after 350ms delay
    bottomIntervalRef.current = setTimeout(() => {
      bottomIntervalRef.current = setInterval(() => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        onBottomPress();
      }, repeatIntervalMs);
    }, 350) as any;
  };

  const handleBottomPressOut = () => {
    Animated.spring(bottomAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();

    if (bottomIntervalRef.current) {
      clearInterval(bottomIntervalRef.current);
      clearTimeout(bottomIntervalRef.current as any);
      bottomIntervalRef.current = null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Rocker Segment */}
      <Animated.View style={{ transform: [{ scale: topAnim }] }}>
        <Pressable
          onPressIn={handleTopPressIn}
          onPressOut={handleTopPressOut}
          style={({ pressed }) => [
            styles.segment,
            styles.topSegment,
            pressed && styles.segmentPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${title} Up`}
        >
          <Text style={styles.segmentText}>{topLabel}</Text>
        </Pressable>
      </Animated.View>

      {/* Middle Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      {/* Bottom Rocker Segment */}
      <Animated.View style={{ transform: [{ scale: bottomAnim }] }}>
        <Pressable
          onPressIn={handleBottomPressIn}
          onPressOut={handleBottomPressOut}
          style={({ pressed }) => [
            styles.segment,
            styles.bottomSegment,
            pressed && styles.segmentPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${title} Down`}
        >
          <Text style={styles.segmentText}>{bottomLabel}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 128,
    borderRadius: 30,
    backgroundColor: RemoteTheme.colors.buttonBackground,
    borderWidth: 1.5,
    borderColor: RemoteTheme.colors.buttonBorder,
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...RemoteTheme.shadows.rocker,
  },
  segment: {
    width: 60,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RemoteTheme.colors.buttonBackground,
  },
  topSegment: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  bottomSegment: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  segmentPressed: {
    backgroundColor: RemoteTheme.colors.buttonPressed,
  },
  labelContainer: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: RemoteTheme.typography.labelMicro,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  segmentText: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
});
