import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTvStore } from '../src/store/tvStore';
import { samsungTvService } from '../src/services/samsungTv';
import { RemoteTheme } from '../src/constants/theme';

export default function RootLayout() {
  const { loadSavedSettings } = useTvStore();

  useEffect(() => {
    // Load persisted settings and attempt background connection if IP was previously saved
    loadSavedSettings().then(() => {
      const state = useTvStore.getState();
      if (state.tvIp || state.mockMode) {
        samsungTvService.connect();
      }
    });
  }, [loadSavedSettings]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: RemoteTheme.colors.chassisSecondary,
          },
          headerTintColor: RemoteTheme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: RemoteTheme.colors.screenBackground,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'TV Settings & Pairing',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            title: 'Setup Guide',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="debug"
          options={{
            title: 'Debug & Key Inspector',
            presentation: 'modal',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

