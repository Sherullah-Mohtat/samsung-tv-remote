import { NativeSamsungRemote } from '../native';
import { useTvStore } from '../store/tvStore';
import { sendWakeOnLan } from './wol';
import { mockTvInstance } from './mockTv';

const APP_NAME = 'SamsungRemoteApp';

/**
 * Base64 encoding compatible across all environments (Native, Hermes, Web).
 */
function toBase64(str: string): string {
  try {
    if (typeof btoa === 'function') {
      return btoa(str);
    }
  } catch {}
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const b1 = str.charCodeAt(i);
    const b2 = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
    const b3 = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;

    const e1 = b1 >> 2;
    const e2 = ((b1 & 3) << 4) | (b2 >> 4);
    let e3 = ((b2 & 15) << 2) | (b3 >> 6);
    let e4 = b3 & 63;

    if (i + 1 >= str.length) {
      e3 = 64;
      e4 = 64;
    } else if (i + 2 >= str.length) {
      e4 = 64;
    }

    output += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }
  return output;
}

export type KeyCommandType = 'Click' | 'Press' | 'Release';

class SamsungTvService {
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private maxReconnectDelay = 15000;
  private isExplicitlyDisconnected = false;
  private nativeListeners: { remove: () => void }[] = [];
  private isConnecting = false;

  constructor() {
    this.setupListeners();
  }

  private setupListeners() {
    // Clean up any existing listeners
    this.nativeListeners.forEach((l) => l.remove());
    this.nativeListeners = [];

    // Native Socket Events
    this.nativeListeners.push(
      NativeSamsungRemote.addListener('onOpen', () => {
        this.handleOpen();
      })
    );

    this.nativeListeners.push(
      NativeSamsungRemote.addListener('onMessage', (event) => {
        this.handleMessage(event.data);
      })
    );

    this.nativeListeners.push(
      NativeSamsungRemote.addListener('onError', (event) => {
        this.handleError(event.message);
      })
    );

    this.nativeListeners.push(
      NativeSamsungRemote.addListener('onClose', (event) => {
        this.handleClose(event.code, event.reason);
      })
    );

    // Mock TV Listener
    mockTvInstance.setListener({
      onOpen: () => this.handleOpen(),
      onMessage: (msg) => this.handleMessage(msg),
      onError: (err) => this.handleError(err),
      onClose: (code, reason) => this.handleClose(code, reason),
    });
  }

  /**
   * Constructs the Samsung Tizen WebSocket URL with base64 app name and stored token.
   */
  public buildWebSocketUrl(ip: string, port = 8002, token?: string | null): string {
    const protocol = port === 8001 ? 'ws' : 'wss';
    const encodedAppName = encodeURIComponent(toBase64(APP_NAME));
    let url = `${protocol}://${ip}:${port}/api/v2/channels/samsung.remote.control?name=${encodedAppName}`;
    if (token) {
      url += `&token=${encodeURIComponent(token)}`;
    }
    return url;
  }

  /**
   * Connect to the TV.
   */
  public async connect(): Promise<void> {
    const store = useTvStore.getState();
    const { tvIp, tvPort, token, mockMode } = store;

    if (this.isConnecting) return;

    if (!tvIp && !mockMode) {
      store.setStatus('disconnected', 'Please enter your TV IP in Settings.');
      return;
    }

    this.isExplicitlyDisconnected = false;
    this.isConnecting = true;
    store.setStatus('connecting', `Connecting to ${tvIp || 'Mock TV'}:${tvPort}...`);

    store.addLog({
      type: 'status',
      message: `Connecting to ${tvIp || 'Mock'}:${tvPort} (Token: ${token ? 'Present' : 'None'})`,
    });

    if (mockMode) {
      mockTvInstance.connect(token);
      this.isConnecting = false;
      return;
    }

    const targetUrl = this.buildWebSocketUrl(tvIp, tvPort, token);
    try {
      NativeSamsungRemote.connect(targetUrl, tvIp);
    } catch (err) {
      this.isConnecting = false;
      const msg = err instanceof Error ? err.message : String(err);
      this.handleError(`Native connect error: ${msg}`);
    }
  }

  /**
   * Disconnect from the TV.
   */
  public disconnect(): void {
    this.isExplicitlyDisconnected = true;
    this.isConnecting = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempt = 0;

    const store = useTvStore.getState();
    if (store.mockMode) {
      mockTvInstance.disconnect();
    } else {
      NativeSamsungRemote.disconnect(1000, 'User initiated disconnect');
    }
    store.setStatus('disconnected', 'Disconnected by user');
  }

  /**
   * Sends a key command to the TV.
   * If key is KEY_POWER and disconnected, automatically attempts Wake-on-LAN.
   */
  public async sendKey(keyCode: string, command: KeyCommandType = 'Click'): Promise<boolean> {
    const store = useTvStore.getState();

    // Handle Power Key when TV is offline / disconnected
    if (keyCode === 'KEY_POWER' && store.status !== 'connected') {
      store.addLog({
        type: 'sent',
        message: 'TV offline: triggering Wake-on-LAN magic packet',
      });
      const wolResult = await sendWakeOnLan();
      if (wolResult.success) {
        store.setStatus('connecting', 'Wake-on-LAN sent. Powering on TV...');
        // Try connecting after giving TV a moment to boot
        setTimeout(() => this.connect(), 2500);
      }
      return wolResult.success;
    }

    if (store.status !== 'connected') {
      store.addLog({
        type: 'error',
        message: `Cannot send ${keyCode}: TV not connected (Current: ${store.status})`,
      });
      // Trigger a reconnect attempt
      this.connect();
      return false;
    }

    const payload = JSON.stringify({
      method: 'ms.remote.control',
      params: {
        Cmd: command,
        DataOfCmd: keyCode,
        Option: 'false',
        TypeOfRemote: 'SendRemoteKey',
      },
    });

    store.addLog({
      type: 'sent',
      message: `Key: ${keyCode} [${command}]`,
      details: payload,
    });

    if (store.mockMode) {
      mockTvInstance.send(payload);
      return true;
    }

    try {
      NativeSamsungRemote.send(payload);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      store.addLog({
        type: 'error',
        message: `Failed to send key ${keyCode}: ${msg}`,
      });
      return false;
    }
  }

  /**
   * Press-and-hold helper: Sends Press followed by Release on finish.
   */
  public async pressKey(keyCode: string): Promise<void> {
    await this.sendKey(keyCode, 'Press');
  }

  public async releaseKey(keyCode: string): Promise<void> {
    await this.sendKey(keyCode, 'Release');
  }

  // MARK: - Event Handlers
  private handleOpen(): void {
    this.isConnecting = false;
    this.reconnectAttempt = 0;
    const store = useTvStore.getState();

    store.addLog({
      type: 'status',
      message: 'WebSocket connected to TV. Waiting for authorization/channel event...',
    });

    // If we don't have a token, we inform user to look at TV screen
    if (!store.token) {
      store.setStatus('pairing_prompt', 'Look at TV: Select "Allow" with physical remote');
    } else {
      store.setStatus('connected', 'Connected to Samsung Smart TV');
    }
  }

  private handleMessage(rawMessage: string): void {
    const store = useTvStore.getState();

    store.addLog({
      type: 'received',
      message: 'Message from TV',
      details: rawMessage,
    });

    try {
      const parsed = JSON.parse(rawMessage);
      const eventName = parsed?.event;

      if (eventName === 'ms.channel.connect') {
        const receivedToken = parsed?.data?.token;
        if (receivedToken) {
          store.setToken(receivedToken);
          store.addLog({
            type: 'status',
            message: `Pairing successful! Token received and securely stored: ${receivedToken.substring(0, 4)}****`,
          });
        }
        store.setStatus('connected', 'Connected and Authorized');
      } else if (eventName === 'ms.channel.unauthorized') {
        store.addLog({
          type: 'error',
          message: 'TV pairing rejected or unauthorized. Resetting saved token.',
        });
        store.setToken(null);
        store.setStatus('error', 'Authorization denied by TV. Tap Pair to retry.');
      }
    } catch {
      // Non-JSON message from TV, safe to ignore
    }
  }

  private handleError(errorMessage: string): void {
    this.isConnecting = false;
    const store = useTvStore.getState();

    store.addLog({
      type: 'error',
      message: `WebSocket error: ${errorMessage}`,
    });

    let friendlyMessage = 'Unable to reach TV. Ensure both devices are on same Wi-Fi.';
    if (errorMessage.toLowerCase().includes('refused')) {
      friendlyMessage = 'Connection refused. Is TV turned on and IP correct?';
    } else if (errorMessage.toLowerCase().includes('timeout')) {
      friendlyMessage = 'Connection timed out. Check TV IP or power state.';
    }

    store.setStatus('error', friendlyMessage);
    this.scheduleReconnect();
  }

  private handleClose(code: number, reason: string): void {
    this.isConnecting = false;
    const store = useTvStore.getState();

    store.addLog({
      type: 'status',
      message: `WebSocket closed (Code ${code}: ${reason || 'Closed'})`,
    });

    if (this.isExplicitlyDisconnected) {
      store.setStatus('disconnected', 'Disconnected');
      return;
    }

    store.setStatus('disconnected', 'Connection lost. Reconnecting...');
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.isExplicitlyDisconnected || this.reconnectTimer) return;

    this.reconnectAttempt += 1;
    // Exponential backoff: 1.5s, 3s, 6s, 12s, max 15s
    const delay = Math.min(1500 * Math.pow(1.5, this.reconnectAttempt - 1), this.maxReconnectDelay);

    const store = useTvStore.getState();
    store.addLog({
      type: 'status',
      message: `Scheduling auto-reconnect attempt #${this.reconnectAttempt} in ${(delay / 1000).toFixed(1)}s`,
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isExplicitlyDisconnected) {
        this.connect();
      }
    }, delay);
  }
}

export const samsungTvService = new SamsungTvService();
