import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTvStore, type LogEntry } from '../src/store/tvStore';
import { ALL_SAMSUNG_KEYCODES } from '../src/constants/keys';
import { RemoteTheme } from '../src/constants/theme';
import { samsungTvService, type KeyCommandType } from '../src/services/samsungTv';

export default function DebugScreen() {
  const { logs, clearLogs, status, tvIp, token, mockMode } = useTvStore();
  const [customKey, setCustomKey] = useState('KEY_VOLUP');
  const [selectedCmd, setSelectedCmd] = useState<KeyCommandType>('Click');
  const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'error'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const handleSendCustomKey = async () => {
    const key = customKey.trim().toUpperCase();
    if (!key) return;
    await samsungTvService.sendKey(key, selectedCmd);
  };

  const formatTimestamp = (ts: number): string => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d
      .getMilliseconds()
      .toString()
      .padStart(3, '0')}`;
  };

  const getLogTypeColor = (type: LogEntry['type']): string => {
    switch (type) {
      case 'sent':
        return '#38bdf8'; // Sky blue
      case 'received':
        return '#4ade80'; // Bright green
      case 'error':
        return '#f87171'; // Red
      case 'status':
      default:
        return '#fbbf24'; // Amber
    }
  };

  return (
    <View style={styles.container}>
      {/* Target Status Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Target: {tvIp || (mockMode ? 'Mock TV' : 'No IP')}
          </Text>
          <Text style={styles.headerSubtitle}>
            Status: {status} • Token: {token ? 'Valid' : 'None'}
          </Text>
        </View>
        <Pressable
          onPress={() => clearLogs()}
          style={({ pressed }) => [styles.clearBtn, pressed && styles.btnPressed]}
        >
          <Ionicons name="trash-bin-outline" size={16} color="#ef4444" />
          <Text style={styles.clearBtnText}>Clear</Text>
        </Pressable>
      </View>

      {/* Manual Key Sender Tool */}
      <View style={styles.testerCard}>
        <Text style={styles.cardTitle}>Send Raw Key / Test Unsupported Keys</Text>
        <View style={styles.testerRow}>
          <TextInput
            value={customKey}
            onChangeText={setCustomKey}
            placeholder="KEY_CODE (e.g. KEY_HOME)"
            placeholderTextColor="#555966"
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.keyInput}
          />
          <Pressable
            onPress={handleSendCustomKey}
            style={({ pressed }) => [styles.sendBtn, pressed && styles.btnPressed]}
          >
            <Ionicons name="paper-plane" size={16} color="#ffffff" />
            <Text style={styles.sendBtnText}>Send</Text>
          </Pressable>
        </View>

        {/* Command type selector */}
        <View style={styles.cmdRow}>
          {(['Click', 'Press', 'Release'] as KeyCommandType[]).map((cmd) => (
            <Pressable
              key={cmd}
              onPress={() => setSelectedCmd(cmd)}
              style={[
                styles.cmdOption,
                selectedCmd === cmd && styles.cmdOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.cmdOptionText,
                  selectedCmd === cmd && styles.cmdOptionTextSelected,
                ]}
              >
                {cmd}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Quick Suggestion Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionPills}
        >
          {ALL_SAMSUNG_KEYCODES.slice(0, 16).map((k: string) => (
            <Pressable
              key={k}
              onPress={() => setCustomKey(k)}
              style={[
                styles.suggestionPill,
                customKey === k && styles.suggestionPillActive,
              ]}
            >
              <Text
                style={[
                  styles.suggestionText,
                  customKey === k && styles.suggestionTextActive,
                ]}
              >
                {k.replace('KEY_', '')}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'sent', 'received', 'error'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === f && styles.filterTabTextActive,
              ]}
            >
              {f.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Real-time Logs List */}
      <ScrollView
        style={styles.logList}
        contentContainerStyle={styles.logContent}
        showsVerticalScrollIndicator={true}
      >
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={36} color="#475569" />
            <Text style={styles.emptyText}>No logs recorded yet.</Text>
            <Text style={styles.emptySubtext}>
              Press any button on the remote to see real-time packet logs.
            </Text>
          </View>
        ) : (
          filteredLogs.map((log) => {
            const badgeColor = getLogTypeColor(log.type);
            return (
              <View key={log.id} style={styles.logEntry}>
                <View style={styles.logHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: `${badgeColor}20` }]}>
                    <Text style={[styles.typeText, { color: badgeColor }]}>
                      {log.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.logTimestamp}>
                    {formatTimestamp(log.timestamp)}
                  </Text>
                </View>
                <Text style={styles.logMessage}>{log.message}</Text>
                {log.details ? (
                  <View style={styles.detailsContainer}>
                    <Text style={styles.detailsText} selectable>
                      {log.details}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RemoteTheme.colors.screenBackground,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: RemoteTheme.colors.chassisSecondary,
    borderBottomWidth: 1,
    borderBottomColor: RemoteTheme.colors.divider,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef444440',
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.7,
  },
  testerCard: {
    backgroundColor: RemoteTheme.colors.chassisBackground,
    margin: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
  },
  cardTitle: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  testerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keyInput: {
    flex: 1,
    backgroundColor: RemoteTheme.colors.chassisSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
    color: RemoteTheme.colors.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Courier',
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cmdRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  cmdOption: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: RemoteTheme.colors.chassisSecondary,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
  },
  cmdOptionSelected: {
    backgroundColor: '#3b82f625',
    borderColor: '#3b82f6',
  },
  cmdOptionText: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  cmdOptionTextSelected: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  suggestionPills: {
    gap: 6,
    marginTop: 10,
  },
  suggestionPill: {
    backgroundColor: RemoteTheme.colors.chassisSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
  },
  suggestionPillActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f620',
  },
  suggestionText: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  suggestionTextActive: {
    color: '#60a5fa',
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 6,
    gap: 6,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: RemoteTheme.colors.chassisSecondary,
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabText: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  logList: {
    flex: 1,
  },
  logContent: {
    padding: 12,
    gap: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    color: RemoteTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptySubtext: {
    color: RemoteTheme.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  logEntry: {
    backgroundColor: RemoteTheme.colors.chassisBackground,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: RemoteTheme.colors.buttonBorder,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  logTimestamp: {
    color: RemoteTheme.colors.textMuted,
    fontSize: 10,
    fontFamily: 'Courier',
  },
  logMessage: {
    color: RemoteTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: '#0a0a0c',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  detailsText: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'Courier',
  },
});
