import { NativeSamsungRemote } from '../native';
import { useTvStore } from '../store/tvStore';

/**
 * Validates a standard 6-byte MAC address format (e.g. AA:BB:CC:DD:EE:FF or AA-BB-CC-DD-EE-FF).
 */
export function isValidMacAddress(mac: string): boolean {
  const clean = mac.replace(/[:-]/g, '').trim();
  return /^[0-9A-Fa-f]{12}$/.test(clean);
}

/**
 * Sends a Wake-on-LAN UDP magic packet to power on the Samsung TV.
 * Uses the native iOS module with broadcast UDP socket on ports 9 and 7.
 */
export async function sendWakeOnLan(macAddress?: string): Promise<{ success: boolean; message: string }> {
  const store = useTvStore.getState();
  const targetMac = macAddress || store.tvMac;

  if (!targetMac || !isValidMacAddress(targetMac)) {
    store.addLog({
      type: 'error',
      message: 'WoL Failed: Missing or invalid TV MAC address',
      details: targetMac ? `Invalid: ${targetMac}` : 'Please enter MAC in Settings',
    });
    return {
      success: false,
      message: 'Invalid MAC address. Please specify in Settings (e.g. AA:BB:CC:DD:EE:FF).',
    };
  }

  store.addLog({
    type: 'sent',
    message: `Sending WoL Magic Packet to ${targetMac}`,
  });

  if (store.mockMode) {
    store.addLog({
      type: 'status',
      message: '[Mock] TV awakened via simulated Wake-on-LAN',
    });
    return { success: true, message: '[Mock] Wake-on-LAN magic packet sent' };
  }

  try {
    const success = await NativeSamsungRemote.sendWakeOnLan(targetMac, '255.255.255.255');
    if (success) {
      store.addLog({
        type: 'status',
        message: `WoL packet sent successfully to ${targetMac}`,
      });
      return { success: true, message: 'Wake-on-LAN packet transmitted.' };
    } else {
      store.addLog({
        type: 'error',
        message: 'WoL packet broadcast failed (native UDP socket error)',
      });
      return { success: false, message: 'Failed to broadcast WoL magic packet.' };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    store.addLog({
      type: 'error',
      message: `WoL Error: ${msg}`,
    });
    return { success: false, message: msg };
  }
}

