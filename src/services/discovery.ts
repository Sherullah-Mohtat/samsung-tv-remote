import { NativeSamsungRemote, type SamsungDiscoveredDevice } from '../native';
import { useTvStore } from '../store/tvStore';

/**
 * Validates an IPv4 address.
 */
export function isValidIpAddress(ip: string): boolean {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Scans the local network via SSDP multicast (port 1900) for Samsung Smart TVs.
 */
export async function discoverSamsungTvs(timeoutSeconds = 3.0): Promise<SamsungDiscoveredDevice[]> {
  const store = useTvStore.getState();
  store.addLog({
    type: 'status',
    message: `Starting SSDP network discovery (timeout: ${timeoutSeconds}s)...`,
  });

  if (store.mockMode) {
    const mockTvs: SamsungDiscoveredDevice[] = [
      {
        ip: '192.168.1.150',
        name: 'Samsung 65" QLED (Mock)',
        raw: 'MOCK_TV_DISCOVERED',
      },
    ];
    store.addLog({
      type: 'status',
      message: `[Mock] Discovered 1 Samsung TV at ${mockTvs[0].ip}`,
    });
    return mockTvs;
  }

  try {
    const devices = await NativeSamsungRemote.discoverSamsungTvs(timeoutSeconds);
    store.addLog({
      type: 'status',
      message: `Discovery finished: found ${devices.length} Samsung device(s)`,
    });
    return devices;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    store.addLog({
      type: 'error',
      message: `Discovery failed: ${msg}`,
    });
    return [];
  }
}

