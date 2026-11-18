import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'pairing_prompt'
  | 'connected'
  | 'error';

export interface LogEntry {
  id: string;
  timestamp: number;
  type: 'sent' | 'received' | 'status' | 'error';
  message: string;
  details?: string;
}

export interface TvState {
  // Target TV Configuration
  tvIp: string;
  tvMac: string;
  tvName: string;
  tvPort: number; // 8002 (WSS) or 8001 (WS)
  token: string | null;

  // Connection State
  status: ConnectionStatus;
  statusMessage: string;
  lastConnectedAt: number | null;

  // Development & Mocking
  mockMode: boolean;

  // Debug Logging
  logs: LogEntry[];

  // Actions
  setTvConfig: (config: { tvIp?: string; tvMac?: string; tvName?: string; tvPort?: number }) => Promise<void>;
  setToken: (token: string | null) => Promise<void>;
  setStatus: (status: ConnectionStatus, message?: string) => void;
  setMockMode: (enabled: boolean) => void;
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  forgetTv: () => Promise<void>;
  loadSavedSettings: () => Promise<void>;
}

const STORAGE_KEYS = {
  IP: 'samsung_tv_ip',
  MAC: 'samsung_tv_mac',
  NAME: 'samsung_tv_name',
  PORT: 'samsung_tv_port',
  TOKEN: 'samsung_tv_token',
  MOCK: 'samsung_tv_mock',
} as const;

export const useTvStore = create<TvState>((set, get) => ({
  tvIp: '',
  tvMac: '',
  tvName: 'Samsung Smart TV',
  tvPort: 8002,
  token: null,

  status: 'disconnected',
  statusMessage: 'Not connected. Configure IP in Settings.',
  lastConnectedAt: null,
  mockMode: false,
  logs: [],

  setTvConfig: async (config) => {
    set((state) => ({
      ...state,
      ...config,
    }));

    try {
      if (config.tvIp !== undefined) {
        await SecureStore.setItemAsync(STORAGE_KEYS.IP, config.tvIp);
      }
      if (config.tvMac !== undefined) {
        await SecureStore.setItemAsync(STORAGE_KEYS.MAC, config.tvMac);
      }
      if (config.tvName !== undefined) {
        await SecureStore.setItemAsync(STORAGE_KEYS.NAME, config.tvName);
      }
      if (config.tvPort !== undefined) {
        await SecureStore.setItemAsync(STORAGE_KEYS.PORT, String(config.tvPort));
      }
    } catch (err) {
      console.warn('[TvStore] Failed to persist config to secure store:', err);
    }
  },

  setToken: async (token) => {
    set({ token });
    try {
      if (token) {
        await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
      }
    } catch (err) {
      console.warn('[TvStore] Failed to update token in secure store:', err);
    }
  },

  setStatus: (status, message) => {
    const defaultMessages: Record<ConnectionStatus, string> = {
      disconnected: 'Disconnected',
      connecting: 'Connecting to TV...',
      pairing_prompt: 'Check TV screen: Press "Allow" with physical remote',
      connected: 'Connected to Samsung Smart TV',
      error: 'Connection failed',
    };

    set({
      status,
      statusMessage: message || defaultMessages[status],
      lastConnectedAt: status === 'connected' ? Date.now() : get().lastConnectedAt,
    });
  },

  setMockMode: (enabled) => {
    set({ mockMode: enabled });
    get().addLog({
      type: 'status',
      message: `Mock mode ${enabled ? 'ENABLED' : 'DISABLED'}`,
    });
  },

  addLog: ({ type, message, details }) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      type,
      message,
      details,
    };
    set((state) => ({
      logs: [entry, ...state.logs.slice(0, 199)], // keep last 200 logs
    }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  forgetTv: async () => {
    set({
      tvIp: '',
      tvMac: '',
      tvName: 'Samsung Smart TV',
      token: null,
      status: 'disconnected',
      statusMessage: 'TV forgotten. Please configure in Settings.',
    });

    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.IP);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.MAC);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.NAME);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PORT);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    } catch (err) {
      console.warn('[TvStore] Error forgetting TV:', err);
    }
  },

  loadSavedSettings: async () => {
    try {
      const [savedIp, savedMac, savedName, savedPort, savedToken] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.IP),
        SecureStore.getItemAsync(STORAGE_KEYS.MAC),
        SecureStore.getItemAsync(STORAGE_KEYS.NAME),
        SecureStore.getItemAsync(STORAGE_KEYS.PORT),
        SecureStore.getItemAsync(STORAGE_KEYS.TOKEN),
      ]);

      set({
        tvIp: savedIp || '',
        tvMac: savedMac || '',
        tvName: savedName || 'Samsung Smart TV',
        tvPort: savedPort ? parseInt(savedPort, 10) : 8002,
        token: savedToken || null,
      });
    } catch (err) {
      console.warn('[TvStore] Failed to load saved TV settings:', err);
    }
  },
}));
