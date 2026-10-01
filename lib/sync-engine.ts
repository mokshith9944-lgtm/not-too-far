import { PlaybackState, SyncBroadcastPayload } from './supabase';

export const DRIFT_TOLERANCE_SECONDS = 1.5;
export const HEARTBEAT_INTERVAL_MS = 2000;

export interface DriftEvaluationResult {
  needsCorrection: boolean;
  expectedHostPlayhead: number;
  driftSeconds: number;
  oneWayLatencySeconds: number;
}

/**
 * Calculates drift against host playhead, compensating for network transmission latency (RTT / 2).
 */
export function evaluatePlaybackDrift(
  localPlayhead: number,
  payload: SyncBroadcastPayload
): DriftEvaluationResult {
  const now = Date.now();
  // Half of round-trip or transmission delay estimate
  const oneWayLatencySeconds = Math.max(0, (now - payload.senderTimestamp) / 1000) / 2;

  // If host is actively playing, estimate forward position based on latency
  const expectedHostPlayhead =
    payload.playbackState === 'PLAY'
      ? payload.timestamp + oneWayLatencySeconds
      : payload.timestamp;

  const driftSeconds = Math.abs(localPlayhead - expectedHostPlayhead);

  return {
    needsCorrection: driftSeconds > DRIFT_TOLERANCE_SECONDS,
    expectedHostPlayhead,
    driftSeconds,
    oneWayLatencySeconds,
  };
}

/**
 * Formats time in seconds to HH:MM:SS or MM:SS
 */
export function formatVideoTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const paddedMins = mins.toString().padStart(2, '0');
  const paddedSecs = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }
  return `${paddedMins}:${paddedSecs}`;
}
