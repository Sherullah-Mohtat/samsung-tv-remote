import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { RemoteTheme } from '../constants/theme';

export interface DPadProps {
  onUp: () => void;
  onDown: () => void;
  onLeft: () => void;
  onRight: () => void;
  onEnter: () => void;
}

export const DPad: React.FC<DPadProps> = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onEnter,
}) => {
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  return (
    <View style={styles.outerCircle}>
      {/* UP BUTTON */}
      <Pressable
        onPress={() => {
          triggerHaptic();
          onUp();
        }}
        accessibilityRole="button"
        accessibilityLabel="Navigate Up"
        style={({ pressed }) => [
          styles.dirButton,
          styles.btnUp,
          pressed && styles.dirPressed,
        ]}
      >
        <Ionicons name="caret-up" size={24} color={RemoteTheme.colors.textPrimary} />
      </Pressable>

      {/* DOWN BUTTON */}
      <Pressable
        onPress={() => {
          triggerHaptic();
          onDown();
        }}
        accessibilityRole="button"
        accessibilityLabel="Navigate Down"
        style={({ pressed }) => [
          styles.dirButton,
          styles.btnDown,
          pressed && styles.dirPressed,
        ]}
      >
        <Ionicons name="caret-down" size={24} color={RemoteTheme.colors.textPrimary} />
      </Pressable>

      {/* LEFT BUTTON */}
      <Pressable
        onPress={() => {
          triggerHaptic();
          onLeft();
        }}
        accessibilityRole="button"
        accessibilityLabel="Navigate Left"
        style={({ pressed }) => [
          styles.dirButton,
          styles.btnLeft,
          pressed && styles.dirPressed,
        ]}
      >
        <Ionicons name="caret-back" size={24} color={RemoteTheme.colors.textPrimary} />
      </Pressable>

      {/* RIGHT BUTTON */}
      <Pressable
        onPress={() => {
          triggerHaptic();
          onRight();
        }}
        accessibilityRole="button"
        accessibilityLabel="Navigate Right"
        style={({ pressed }) => [
          styles.dirButton,
          styles.btnRight,
          pressed && styles.dirPressed,
        ]}
      >
        <Ionicons name="caret-forward" size={24} color={RemoteTheme.colors.textPrimary} />
      </Pressable>

      {/* CENTER ENTER BUTTON */}
      <Pressable
        onPress={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch {}
          onEnter();
        }}
        accessibilityRole="button"
        accessibilityLabel="Enter / Select"
        style={({ pressed }) => [
          styles.centerButton,
          pressed && styles.centerPressed,
        ]}
      >
        <Ionicons name="return-down-back" size={22} color={RemoteTheme.colors.textPrimary} />
        <Text style={styles.enterText}>ENTER</Text>
      </Pressable>
    </View>
  );
};

const DPAD_SIZE = 186;
const CENTER_SIZE = 72;

const styles = StyleSheet.create({
  outerCircle: {
    width: DPAD_SIZE,
    height: DPAD_SIZE,
    borderRadius: DPAD_SIZE / 2,
    backgroundColor: RemoteTheme.colors.buttonBackground,
    borderWidth: 1.5,
    borderColor: RemoteTheme.colors.buttonBorder,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...RemoteTheme.shadows.dpad,
  },
  dirButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dirPressed: {
    backgroundColor: RemoteTheme.colors.buttonPressed,
  },
  btnUp: {
    top: 0,
    left: 44,
    right: 44,
    height: 54,
  },
  btnDown: {
    bottom: 0,
    left: 44,
    right: 44,
    height: 54,
  },
  btnLeft: {
    left: 0,
    top: 44,
    bottom: 44,
    width: 54,
  },
  btnRight: {
    right: 0,
    top: 44,
    bottom: 44,
    width: 54,
  },
  centerButton: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: RemoteTheme.colors.chassisSecondary,
    borderWidth: 1.5,
    borderColor: RemoteTheme.colors.buttonBorder,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...RemoteTheme.shadows.button,
  },
  centerPressed: {
    backgroundColor: RemoteTheme.colors.buttonPressed,
  },
  enterText: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

