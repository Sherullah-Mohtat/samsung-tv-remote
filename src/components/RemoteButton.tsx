import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  Animated,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { RemoteTheme } from '../constants/theme';

export interface RemoteButtonProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  variant?: 'standard' | 'power' | 'secondary' | 'color' | 'numpad';
  color?: string;
  pressedColor?: string;
  width?: number | `${number}%` | 'auto';
  height?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
}

export const RemoteButton: React.FC<RemoteButtonProps> = ({
  label,
  icon,
  iconSize = 18,
  iconColor,
  onPress,
  onPressIn,
  onPressOut,
  variant = 'standard',
  color,
  pressedColor,
  width,
  height = RemoteTheme.dimensions.minTouchTarget,
  style,
  textStyle,
  disabled = false,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
}) => {
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    if (disabled) return;
    try {
      Haptics.impactAsync(hapticStyle);
    } catch {}

    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

    onPressIn?.();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();

    onPressOut?.();
  };

  // Determine button background colors based on variant
  let defaultBg = RemoteTheme.colors.buttonBackground;
  let activeBg = RemoteTheme.colors.buttonPressed;

  if (variant === 'power') {
    defaultBg = RemoteTheme.colors.powerRed;
    activeBg = RemoteTheme.colors.powerRedPressed;
  } else if (variant === 'secondary') {
    defaultBg = RemoteTheme.colors.chassisSecondary;
    activeBg = RemoteTheme.colors.buttonPressed;
  } else if (color) {
    defaultBg = color;
    activeBg = pressedColor || color;
  }

  const resolvedIconColor =
    iconColor ||
    (variant === 'power'
      ? '#ffffff'
      : RemoteTheme.colors.textPrimary);

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        width ? { width: width as any } : undefined,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label || icon}
        style={({ pressed }) => [
          styles.base,
          {
            backgroundColor: pressed ? activeBg : defaultBg,
            height,
            minWidth: height,
          },
          variant === 'power' && styles.powerButton,
          style,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={resolvedIconColor}
            style={label ? styles.iconWithLabel : undefined}
          />
        )}
        {label ? (
          <Text
            style={[
              styles.labelText,
              variant === 'numpad' && styles.numpadText,
              variant === 'power' && styles.powerText,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RemoteTheme.radii.md,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
    minHeight: RemoteTheme.dimensions.minTouchTarget,
    paddingHorizontal: 10,
    ...RemoteTheme.shadows.button,
  },
  powerButton: {
    borderRadius: RemoteTheme.radii.round,
    borderColor: '#b31e22',
  },
  labelText: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: RemoteTheme.typography.labelSmall,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  numpadText: {
    fontSize: RemoteTheme.typography.numpadDigit,
    fontWeight: '600',
  },
  powerText: {
    color: '#ffffff',
    fontSize: RemoteTheme.typography.labelMicro,
    fontWeight: '800',
  },
  iconWithLabel: {
    marginBottom: 2,
  },
});
