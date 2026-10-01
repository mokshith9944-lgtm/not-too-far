/**
 * ANTIGRAVITY WEB EXTENSION BRIDGE SPECIFICATION
 * Interoperable communication bridge between Antigravity Web App
 * and external streaming provider tabs (Netflix, Prime Video, Disney+ Hotstar)
 * via window.postMessage and Chrome Runtime messaging.
 */

export const EXTENSION_MESSAGE_SOURCE_APP = 'ANTIGRAVITY_WEB_APP';
export const EXTENSION_MESSAGE_SOURCE_EXT = 'ANTIGRAVITY_BROWSER_EXTENSION';

export type ExtensionBridgeAction =
  | 'SYNC_COMMAND_PLAY'
  | 'SYNC_COMMAND_PAUSE'
  | 'SYNC_COMMAND_SEEK'
  | 'REQUEST_SESSION_HEARTBEAT'
  | 'EXTENSION_PONG'
  | 'EXTERNAL_PLAYER_STATE_CHANGE';

export interface ExtensionMessagePayload {
  source: typeof EXTENSION_MESSAGE_SOURCE_APP | typeof EXTENSION_MESSAGE_SOURCE_EXT;
  action: ExtensionBridgeAction;
  roomId: string;
  provider?: 'netflix' | 'prime' | 'hotstar' | 'direct';
  timestamp?: number;
  playbackState?: 'PLAY' | 'PAUSE' | 'SEEK';
  clientTimestamp: number;
}

/**
 * Dispatch command from Antigravity Room to Browser Extension Content Script
 */
export function sendExtensionSyncCommand(
  action: ExtensionBridgeAction,
  roomId: string,
  timestamp: number,
  playbackState: 'PLAY' | 'PAUSE' | 'SEEK'
): void {
  if (typeof window === 'undefined') return;

  const payload: ExtensionMessagePayload = {
    source: EXTENSION_MESSAGE_SOURCE_APP,
    action,
    roomId,
    timestamp,
    playbackState,
    clientTimestamp: Date.now(),
  };

  window.postMessage(payload, '*');
}

/**
 * Setup listener for messages originating from the browser extension
 */
export function registerExtensionBridgeListener(
  onExternalStateChange: (payload: ExtensionMessagePayload) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (event: MessageEvent) => {
    // Only accept messages from our verified extension signature
    if (
      event.data &&
      event.data.source === EXTENSION_MESSAGE_SOURCE_EXT &&
      typeof event.data.action === 'string'
    ) {
      onExternalStateChange(event.data as ExtensionMessagePayload);
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}
