import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RemoteChassis } from '../src/components/RemoteChassis';
import { RemoteTheme } from '../src/constants/theme';

export default function RemoteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <RemoteChassis
          onOpenSettings={() => router.push('/settings')}
          onOpenOnboarding={() => router.push('/onboarding')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: RemoteTheme.colors.screenBackground,
  },
  container: {
    flex: 1,
    backgroundColor: RemoteTheme.colors.screenBackground,
  },
});

