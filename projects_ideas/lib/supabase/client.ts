import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * In-memory fallback event bus for local dev when real Supabase project
 * is not yet provisioned. Enables multi-tab video sync testing locally!
 */
class LocalRealtimeChannel {
  private channelName: string;
  private listeners: Map<string, Array<(payload: any) => void>> = new Map();
  private presenceCallbacks: Array<(presence: any) => void> = [];
  private broadcastStorageKey: string;

  constructor(channelName: string) {
    this.channelName = channelName;
    this.broadcastStorageKey = `__ntf_realtime_${channelName}`;

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.broadcastStorageKey && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.dispatch(data.event, data.payload);
          } catch (err) {
            console.error('Failed to parse realtime local broadcast:', err);
          }
        }
      });
    }
  }

  on(event: string, callbackOrConfig: any, maybeCallback?: any) {
    let eventName = event;
    let cb = maybeCallback;

    if (typeof callbackOrConfig === 'function') {
      cb = callbackOrConfig;
    } else if (callbackOrConfig?.event) {
      eventName = callbackOrConfig.event;
    }

    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    if (cb) {
      this.listeners.get(eventName)!.push(cb);
    }
    return this;
  }

  subscribe(statusCallback?: (status: string) => void) {
    setTimeout(() => {
      if (statusCallback) statusCallback('SUBSCRIBED');
    }, 50);
    return this;
  }

  unsubscribe() {
    this.listeners.clear();
    return this;
  }

  send(data: { type: 'broadcast'; event: string; payload: any }) {
    this.dispatch(data.event, data.payload);

    // Cross-tab synchronization via local storage event bus
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          this.broadcastStorageKey,
          JSON.stringify({
            event: data.event,
            payload: data.payload,
            _t: Date.now() + Math.random(),
          })
        );
      } catch (e) {
        // quota exceeded or private mode
      }
    }
  }

  track(presenceState: any) {
    // Notify presence listeners
    this.presenceCallbacks.forEach((cb) => cb(presenceState));
    return Promise.resolve();
  }

  private dispatch(event: string, payload: any) {
    const cbs = this.listeners.get(event) || [];
    cbs.forEach((cb) => {
      try {
        cb({ payload, event });
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });

    const wildcardCbs = this.listeners.get('*') || [];
    wildcardCbs.forEach((cb) => cb({ payload, event }));
  }
}

const localChannels = new Map<string, LocalRealtimeChannel>();

export function getRealtimeChannel(channelName: string) {
  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');

  if (isMock) {
    if (!localChannels.has(channelName)) {
      localChannels.set(channelName, new LocalRealtimeChannel(channelName));
    }
    return localChannels.get(channelName)!;
  }

  const supabase = createClient();
  return supabase.channel(channelName, {
    config: {
      broadcast: { self: true, ack: true },
      presence: { key: 'participant' },
    },
  });
}
