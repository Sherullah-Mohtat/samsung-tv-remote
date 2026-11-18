import { useTvStore } from '../store/tvStore';

export interface MockTvListener {
  onOpen?: () => void;
  onMessage?: (message: string) => void;
  onError?: (error: string) => void;
  onClose?: (code: number, reason: string) => void;
}

class MockTvServer {
  private listener: MockTvListener | null = null;
  private isConnected = false;
  private pairingTimeout: ReturnType<typeof setTimeout> | null = null;

  setListener(listener: MockTvListener) {
    this.listener = listener;
  }

  connect(token?: string | null) {
    const store = useTvStore.getState();
    store.addLog({
      type: 'status',
      message: '[MockTV] Handshake started (Simulated Tizen 2022 QLED)',
    });

    setTimeout(() => {
      this.isConnected = true;
      this.listener?.onOpen?.();

      if (!token) {
        store.setStatus('pairing_prompt', 'Simulated TV: Press "Allow" on TV');
        this.pairingTimeout = setTimeout(() => {
          const connectMsg = JSON.stringify({
            event: 'ms.channel.connect',
            data: {
              token: 'mock_token_samsung_12345',
              clients: [{ id: 'client_1', attributes: { name: 'SamsungRemoteApp' } }],
            },
          });
          this.listener?.onMessage?.(connectMsg);
          store.setStatus('connected', 'Connected to Simulated Samsung TV');
        }, 1500);
      } else {
        const welcomeMsg = JSON.stringify({
          event: 'ms.channel.connect',
          data: {
            token,
            clients: [{ id: 'client_1', attributes: { name: 'SamsungRemoteApp' } }],
          },
        });
        this.listener?.onMessage?.(welcomeMsg);
        store.setStatus('connected', 'Connected to Simulated Samsung TV (Token valid)');
      }
    }, 600);
  }

  send(rawPayload: string) {
    const store = useTvStore.getState();
    try {
      const parsed = JSON.parse(rawPayload);
      const key = parsed?.params?.DataOfCmd || 'UNKNOWN_KEY';
      const cmd = parsed?.params?.Cmd || 'Click';

      store.addLog({
        type: 'received',
        message: `[MockTV] Received: ${key} (${cmd})`,
        details: rawPayload,
      });

      // Echo TV response back
      const reply = JSON.stringify({
        event: 'd2d_service_message',
        data: {
          result: 'KEY_PROCESSED',
          key,
          cmd,
          timestamp: Date.now(),
        },
      });
      this.listener?.onMessage?.(reply);
    } catch {
      store.addLog({
        type: 'received',
        message: `[MockTV] Received raw: ${rawPayload}`,
      });
    }
  }

  disconnect() {
    if (this.pairingTimeout) clearTimeout(this.pairingTimeout);
    this.isConnected = false;
    this.listener?.onClose?.(1000, 'Mock disconnected');
  }

  getConnected() {
    return this.isConnected;
  }
}

export const mockTvInstance = new MockTvServer();

