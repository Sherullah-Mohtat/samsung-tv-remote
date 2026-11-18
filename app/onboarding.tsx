import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RemoteTheme } from '../src/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Ionicons name="tv-outline" size={48} color="#3b82f6" />
        <Text style={styles.headerTitle}>Connect to Your Samsung TV</Text>
        <Text style={styles.headerSubtitle}>
          Follow these 3 quick steps to pair your iPhone with your Samsung Smart TV.
        </Text>
      </View>

      {/* STEP 1 */}
      <View style={styles.stepCard}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>1</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Same Wi-Fi Network</Text>
          <Text style={styles.stepDescription}>
            Make sure your iPhone and your Samsung TV are connected to the exact same Wi-Fi
            network (same SSID and subnet).
          </Text>
          <View style={styles.tipBox}>
            <Ionicons name="information-circle-outline" size={16} color="#60a5fa" />
            <Text style={styles.tipText}>
              Guest Wi-Fi networks and dual-band isolation (2.4GHz vs 5GHz) often block local
              device communication.
            </Text>
          </View>
        </View>
      </View>

      {/* STEP 2 */}
      <View style={styles.stepCard}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>2</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Enable TV Settings</Text>
          <Text style={styles.stepDescription}>
            On your physical TV, navigate to:
          </Text>
          <View style={styles.navPath}>
            <Text style={styles.pathText}>
              Settings &gt; General &gt; External Device Manager &gt; Device Connection Manager
            </Text>
          </View>
          <Text style={styles.stepDescription}>
            Set <Text style={styles.highlight}>Access Notification</Text> to{' '}
            <Text style={styles.highlight}>First Time</Text> (or Always Accept).
          </Text>
          <Text style={[styles.stepDescription, { marginTop: 6 }]}>
            Also enable <Text style={styles.highlight}>Power On with Mobile</Text> so Wake-on-LAN can
            power on the TV from sleep.
          </Text>
        </View>
      </View>

      {/* STEP 3 */}
      <View style={styles.stepCard}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>3</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>Accept Pairing Prompt on TV</Text>
          <Text style={styles.stepDescription}>
            When you enter your TV IP in Settings and tap <Text style={styles.highlight}>Pair</Text>, a
            prompt titled &quot;SamsungRemoteApp&quot; will appear in the top-right corner of your TV.
          </Text>
          <Text style={[styles.stepDescription, { marginTop: 6 }]}>
            Grab your physical TV remote and select <Text style={styles.highlight}>Allow</Text>. The
            app will receive an authorization token and stay paired.
          </Text>
        </View>
      </View>

      {/* TROUBLESHOOTING CARD */}
      <View style={styles.troubleCard}>
        <Text style={styles.troubleTitle}>Troubleshooting & Tips</Text>

        <View style={styles.troubleItem}>
          <Text style={styles.troubleQ}>• Prompt not appearing on TV?</Text>
          <Text style={styles.troubleA}>
            Check Device Connection Manager &gt; Device List on your TV. If SamsungRemoteApp was
            previously &quot;Denied&quot;, delete it and try pairing again.
          </Text>
        </View>

        <View style={styles.troubleItem}>
          <Text style={styles.troubleQ}>• Older Samsung Model (Pre-2016)?</Text>
          <Text style={styles.troubleA}>
            In Settings, change the port from 8002 (WSS) to 8001 (WS Legacy).
          </Text>
        </View>

        <View style={styles.troubleItem}>
          <Text style={styles.troubleQ}>• Local Network Permission</Text>
          <Text style={styles.troubleA}>
            If iOS asked for &quot;Local Network&quot; permission and was denied, enable it in iOS
            Settings &gt; Privacy &amp; Security &gt; Local Network &gt; Samsung Remote.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/settings')}
        style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}
      >
        <Text style={styles.continueButtonText}>Open Settings &amp; Pair</Text>
        <Ionicons name="arrow-forward" size={18} color="#ffffff" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RemoteTheme.colors.screenBackground,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 12,
  },
  headerTitle: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: RemoteTheme.colors.chassisBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
    gap: 14,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepDescription: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  highlight: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  navPath: {
    backgroundColor: RemoteTheme.colors.chassisSecondary,
    padding: 8,
    borderRadius: 8,
    marginVertical: 6,
  },
  pathText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '600',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3b82f615',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  tipText: {
    color: '#93c5fd',
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  troubleCard: {
    backgroundColor: RemoteTheme.colors.chassisBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
  },
  troubleTitle: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  troubleItem: {
    marginBottom: 10,
  },
  troubleQ: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  troubleA: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});
