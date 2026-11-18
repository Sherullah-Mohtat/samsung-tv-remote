import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTvStore } from '../src/store/tvStore';
import { RemoteTheme } from '../src/constants/theme';
import { isValidIpAddress, discoverSamsungTvs } from '../src/services/discovery';
import { isValidMacAddress, sendWakeOnLan } from '../src/services/wol';
import { samsungTvService } from '../src/services/samsungTv';
import type { SamsungDiscoveredDevice } from '../src/native';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    tvIp,
    tvMac,
    tvName,
    tvPort,
    token,
    status,
    statusMessage,
    mockMode,
    setTvConfig,
    setMockMode,
    forgetTv,
  } = useTvStore();

  const [inputIp, setInputIp] = useState(tvIp);
  const [inputMac, setInputMac] = useState(tvMac);
  const [inputName, setInputName] = useState(tvName);
  const [selectedPort, setSelectedPort] = useState(tvPort);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredTvs, setDiscoveredTvs] = useState<SamsungDiscoveredDevice[]>([]);
  const [ipError, setIpError] = useState<string | null>(null);
  const [macError, setMacError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Scan for TVs using SSDP
  const handleScan = async () => {
    setIsScanning(true);
    setDiscoveredTvs([]);
    try {
      const devices = await discoverSamsungTvs(3.0);
      setDiscoveredTvs(devices);
      if (devices.length === 0) {
        Alert.alert(
          'No TVs Found via SSDP',
          'Ensure your TV is powered on and connected to the same Wi-Fi. You can always enter your TV IP address manually below.'
        );
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectDiscovered = (device: SamsungDiscoveredDevice) => {
    setInputIp(device.ip);
    setInputName(device.name);
    setIpError(null);
  };

  // Validate and Save TV Settings
  const handleSaveAndPair = async () => {
    setIpError(null);
    setMacError(null);

    const trimmedIp = inputIp.trim();
    const trimmedMac = inputMac.trim();

    if (!mockMode && !isValidIpAddress(trimmedIp)) {
      setIpError('Please enter a valid IPv4 address (e.g. 192.168.1.100)');
      return;
    }

    if (trimmedMac && !isValidMacAddress(trimmedMac)) {
      setMacError('Invalid MAC format. Use XX:XX:XX:XX:XX:XX or XXXXXXXXXXXX');
      return;
    }

    setIsSaving(true);
    try {
      await setTvConfig({
        tvIp: trimmedIp,
        tvMac: trimmedMac,
        tvName: inputName.trim() || 'Samsung Smart TV',
        tvPort: selectedPort,
      });

      // Disconnect current socket and initiate fresh connection
      samsungTvService.disconnect();
      setTimeout(() => {
        samsungTvService.connect();
      }, 300);

      Alert.alert(
        'Connecting & Pairing',
        'Look at your TV screen. If this is the first time connecting, select "Allow" when the prompt appears.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Forget TV confirmation
  const handleForget = () => {
    Alert.alert(
      'Forget TV?',
      'This will erase the saved IP address, MAC, and security authorization token.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forget',
          style: 'destructive',
          onPress: async () => {
            samsungTvService.disconnect();
            await forgetTv();
            setInputIp('');
            setInputMac('');
            setInputName('Samsung Smart TV');
          },
        },
      ]
    );
  };

  // Test Wake-on-LAN
  const handleTestWol = async () => {
    const result = await sendWakeOnLan(inputMac.trim());
    Alert.alert(result.success ? 'WoL Transmitted' : 'WoL Error', result.message);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Connection Status Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Current Status</Text>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  status === 'connected'
                    ? '#22c55e25'
                    : status === 'connecting'
                    ? '#eab30825'
                    : status === 'pairing_prompt'
                    ? '#3b82f625'
                    : '#ef444425',
              },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                {
                  color:
                    status === 'connected'
                      ? '#22c55e'
                      : status === 'connecting'
                      ? '#eab308'
                      : status === 'pairing_prompt'
                      ? '#3b82f6'
                      : '#ef4444',
                },
              ]}
            >
              {status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.statusDescription}>{statusMessage}</Text>

        <View style={styles.tokenStatusRow}>
          <Ionicons
            name={token ? 'shield-checkmark' : 'shield-outline'}
            size={18}
            color={token ? '#22c55e' : '#6b7280'}
          />
          <Text style={styles.tokenStatusText}>
            {token ? `Paired (Token: ${token.substring(0, 5)}...)` : 'Not Paired (No token stored)'}
          </Text>
        </View>
      </View>

      {/* Auto Discovery (SSDP) Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Local Network Discovery</Text>
          <Pressable
            onPress={handleScan}
            disabled={isScanning}
            style={({ pressed }) => [
              styles.scanButton,
              pressed && styles.buttonPressed,
              isScanning && styles.disabledButton,
            ]}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="refresh" size={14} color="#ffffff" />
                <Text style={styles.scanButtonText}>Scan Wi-Fi</Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.helperText}>
          Broadcasts SSDP discovery to locate Samsung Smart TVs on your subnet.
        </Text>

        {discoveredTvs.length > 0 && (
          <View style={styles.deviceList}>
            {discoveredTvs.map((dev) => (
              <Pressable
                key={dev.ip}
                style={styles.deviceItem}
                onPress={() => handleSelectDiscovered(dev)}
              >
                <Ionicons name="tv-outline" size={22} color={RemoteTheme.colors.textPrimary} />
                <View style={styles.deviceDetails}>
                  <Text style={styles.deviceName}>{dev.name}</Text>
                  <Text style={styles.deviceIp}>{dev.ip}</Text>
                </View>
                <Text style={styles.selectText}>Use</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Manual Configuration Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manual Configuration</Text>
        <Text style={styles.helperText}>
          Find IP on your TV: Settings &gt; General &gt; Network &gt; Network Status &gt; IP Settings.
        </Text>

        {/* TV IP */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>TV IP Address *</Text>
          <TextInput
            value={inputIp}
            onChangeText={(text) => {
              setInputIp(text);
              if (ipError) setIpError(null);
            }}
            placeholder="192.168.1.xxx"
            placeholderTextColor="#555966"
            keyboardType="decimal-pad"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, ipError ? styles.inputError : undefined]}
          />
          {ipError ? <Text style={styles.errorText}>{ipError}</Text> : null}
        </View>

        {/* TV MAC */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>TV MAC Address (for Wake-on-LAN)</Text>
            {inputMac ? (
              <Pressable onPress={handleTestWol}>
                <Text style={styles.testLink}>Test WoL</Text>
              </Pressable>
            ) : null}
          </View>
          <TextInput
            value={inputMac}
            onChangeText={(text) => {
              setInputMac(text);
              if (macError) setMacError(null);
            }}
            placeholder="AA:BB:CC:DD:EE:FF"
            placeholderTextColor="#555966"
            autoCapitalize="characters"
            autoCorrect={false}
            style={[styles.input, macError ? styles.inputError : undefined]}
          />
          {macError ? <Text style={styles.errorText}>{macError}</Text> : null}
          <Text style={styles.inputHint}>
            Allows powering on the TV when it is fully turned off.
          </Text>
        </View>

        {/* TV Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>TV Label (Optional)</Text>
          <TextInput
            value={inputName}
            onChangeText={setInputName}
            placeholder="Living Room TV"
            placeholderTextColor="#555966"
            style={styles.input}
          />
        </View>

        {/* Port Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Port & Protocol</Text>
          <View style={styles.portSelector}>
            <Pressable
              onPress={() => setSelectedPort(8002)}
              style={[
                styles.portOption,
                selectedPort === 8002 && styles.portOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.portOptionText,
                  selectedPort === 8002 && styles.portOptionTextSelected,
                ]}
              >
                8002 (WSS Secure, 2016+)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSelectedPort(8001)}
              style={[
                styles.portOption,
                selectedPort === 8001 && styles.portOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.portOptionText,
                  selectedPort === 8001 && styles.portOptionTextSelected,
                ]}
              >
                8001 (WS Legacy)
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Save & Pair Button */}
        <Pressable
          onPress={handleSaveAndPair}
          disabled={isSaving}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="link" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>
            {token ? 'Save & Reconnect' : 'Pair with TV'}
          </Text>
        </Pressable>

        {/* Forget TV Button */}
        {(tvIp || token) && (
          <Pressable
            onPress={handleForget}
            style={({ pressed }) => [
              styles.dangerButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text style={styles.dangerButtonText}>Forget TV & Reset Token</Text>
          </Pressable>
        )}
      </View>

      {/* Developer Options Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Developer & Testing</Text>
        <View style={styles.switchRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.switchTitle}>Mock TV Mode</Text>
            <Text style={styles.switchSubtitle}>
              Simulates a live Samsung QLED Tizen TV for UI testing without needing a physical TV.
            </Text>
          </View>
          <Switch
            value={mockMode}
            onValueChange={(val) => {
              setMockMode(val);
              samsungTvService.disconnect();
              setTimeout(() => {
                samsungTvService.connect();
              }, 300);
            }}
            trackColor={{ false: '#333742', true: '#2563eb' }}
            thumbColor="#ffffff"
          />
        </View>
        <Pressable
          onPress={() => router.push('/debug')}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: RemoteTheme.colors.chassisSecondary,
              borderWidth: 1,
              borderColor: RemoteTheme.colors.buttonBorder,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 14,
              marginTop: 14,
            },
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="terminal-outline" size={18} color="#60a5fa" />
            <View>
              <Text style={styles.switchTitle}>Network Diagnostics & Logs</Text>
              <Text style={styles.switchSubtitle}>View live WebSocket traffic and TV responses</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={RemoteTheme.colors.textSecondary} />
        </Pressable>
      </View>
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
  card: {
    backgroundColor: RemoteTheme.colors.chassisBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusDescription: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  tokenStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: RemoteTheme.colors.divider,
  },
  tokenStatusText: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 12,
  },
  helperText: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  deviceList: {
    marginTop: 8,
    gap: 8,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RemoteTheme.colors.chassisSecondary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
  },
  deviceDetails: {
    flex: 1,
    marginLeft: 10,
  },
  deviceName: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  deviceIp: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  selectText: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testLink: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '700',
  },
  inputLabel: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: RemoteTheme.colors.chassisSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
    color: RemoteTheme.colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
  },
  inputHint: {
    color: RemoteTheme.colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  portSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  portOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
    backgroundColor: RemoteTheme.colors.chassisSecondary,
    alignItems: 'center',
  },
  portOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f620',
  },
  portOptionText: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  portOptionTextSelected: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef444450',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  switchTitle: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  switchSubtitle: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
});

