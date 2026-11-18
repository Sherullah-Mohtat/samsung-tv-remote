import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTvStore, type ConnectionStatus } from '../store/tvStore';
import { RemoteTheme } from '../constants/theme';
import { samsungTvService } from '../services/samsungTv';

export interface StatusBadgeProps {
  onPressSettings?: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ onPressSettings }) => {
  const { status, statusMessage, tvIp, mockMode } = useTvStore();

  const getStatusColor = (s: ConnectionStatus): string => {
    switch (s) {
      case 'connected':
        return RemoteTheme.colors.statusConnected;
      case 'connecting':
        return RemoteTheme.colors.statusConnecting;
      case 'pairing_prompt':
        return RemoteTheme.colors.statusPairing;
      case 'error':
        return RemoteTheme.colors.statusError;
      case 'disconnected':
      default:
        return RemoteTheme.colors.statusDisconnected;
    }
  };

  const getStatusLabel = (s: ConnectionStatus): string => {
    switch (s) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'pairing_prompt':
        return 'Pairing (Check TV)';
      case 'error':
        return 'Error';
      case 'disconnected':
      default:
        return 'Disconnected';
    }
  };

  const handlePress = () => {
    if (status === 'disconnected' || status === 'error') {
      samsungTvService.connect();
    } else if (onPressSettings) {
      onPressSettings();
    }
  };

  const dotColor = getStatusColor(status);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Connection status: ${status}`}
    >
      <View style={styles.leftRow}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={styles.statusTitle}>{getStatusLabel(status)}</Text>
            {mockMode && (
              <View style={styles.mockBadge}>
                <Text style={styles.mockText}>MOCK</Text>
              </View>
            )}
          </View>
          <Text style={styles.statusSubtitle} numberOfLines={1}>
            {tvIp ? `${tvIp} • ` : ''}
            {statusMessage}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={RemoteTheme.colors.textMuted}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: RemoteTheme.colors.chassisSecondary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
    width: '100%',
  },
  pressed: {
    opacity: 0.8,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  textColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusTitle: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  statusSubtitle: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  mockBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  mockText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
});

