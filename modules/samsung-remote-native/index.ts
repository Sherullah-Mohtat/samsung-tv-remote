import { EventEmitter, requireOptionalNativeModule } from 'expo-modules-core';

export interface SamsungDiscoveredDevice {
  ip: string;
  name: string;
  raw: string;
}

export interface NativeSocketEvents {
  [key: string]: (...args: any[]) => void;
  onOpen: (event: { protocol?: string }) => void;
  onMessage: (event: { data: string }) => void;
  onError: (event: { message: string }) => void;
  onClose: (event: { code: number; reason: string }) => void;
}

interface SamsungRemoteNativeModuleInterface {
  connect(urlString: string, host: string): void;
  send(message: string): void;
  disconnect(code: number, reason?: string): void;
  isConnected(): boolean;
  sendWakeOnLan(macAddress: string, broadcastIp?: string): Promise<boolean>;
  discoverSamsungTvs(timeoutSeconds: number): Promise<SamsungDiscoveredDevice[]>;
}

const NativeModule = requireOptionalNativeModule<SamsungRemoteNativeModuleInterface>(
  'SamsungRemoteNative'
);

const eventEmitter = NativeModule
  ? new EventEmitter<NativeSocketEvents>(NativeModule as any)
  : null;

export const isNativeModuleAvailable = Boolean(NativeModule);

export const NativeSamsungRemote = {
  isAvailable: isNativeModuleAvailable,

  connect(urlString: string, host: string): void {
    if (NativeModule) {
      NativeModule.connect(urlString, host);
    } else {
      console.warn('[SamsungRemoteNative] Native module unavailable, running in fallback mode');
    }
  },

  send(message: string): void {
    if (NativeModule) {
      NativeModule.send(message);
    } else {
      console.warn('[SamsungRemoteNative] Native module unavailable to send message');
    }
  },

  disconnect(code = 1000, reason = 'Client disconnect'): void {
    if (NativeModule) {
      NativeModule.disconnect(code, reason);
    }
  },

  isConnected(): boolean {
    return NativeModule ? NativeModule.isConnected() : false;
  },

  async sendWakeOnLan(macAddress: string, broadcastIp = '255.255.255.255'): Promise<boolean> {
    if (NativeModule) {
      try {
        return await NativeModule.sendWakeOnLan(macAddress, broadcastIp);
      } catch (err) {
        console.error('[SamsungRemoteNative] WoL failed:', err);
        return false;
      }
    }
    return false;
  },

  async discoverSamsungTvs(timeoutSeconds = 2.5): Promise<SamsungDiscoveredDevice[]> {
    if (NativeModule) {
      try {
        return await NativeModule.discoverSamsungTvs(timeoutSeconds);
      } catch (err) {
        console.error('[SamsungRemoteNative] Discovery error:', err);
        return [];
      }
    }
    return [];
  },

  addListener<K extends keyof NativeSocketEvents>(
    event: K,
    listener: NativeSocketEvents[K]
  ): { remove: () => void } {
    if (eventEmitter) {
      const subscription = eventEmitter.addListener(event, listener as (...args: unknown[]) => void);
      return {
        remove: () => {
          subscription.remove();
        },
      };
    }
    return { remove: () => {} };
  },
};
