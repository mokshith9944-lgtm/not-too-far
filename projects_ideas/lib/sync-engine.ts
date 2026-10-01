import { PlaybackState } from './types';

export interface DriftAssessment {
  absoluteDrift: number; // in seconds
  driftDirection: 'AHEAD' | 'BEHIND' | 'SYNCHRONIZED';
  action: 'SEEK' | 'MICRO_ADJUST' | 'IN_SYNC';
  recommendedRate: number;
  targetTime: number;
  rttCompensationSeconds: number;
}

/**
 * Calculates estimated current host playhead based on the last broadcast packet
 * and calculated round-trip latency.
 */
export function calculateEstimatedHostTime(
  broadcastPlayhead: number,
  broadcastEpochMs: number,
  playbackState: PlaybackState,
  playbackSpeed: number = 1.0,
  rttMs: number = 50
): number {
  if (playbackState !== 'PLAYING') {
    return broadcastPlayhead;
  }

  const now = Date.now();
  const elapsedMs = Math.max(0, now - broadcastEpochMs);
  const oneWayLatencyMs = Math.max(0, rttMs / 2);
  const totalOffsetSeconds = ((elapsedMs + oneWayLatencyMs) / 1000) * playbackSpeed;

  return broadcastPlayhead + totalOffsetSeconds;
}

/**
 * High-precision drift analysis comparing participant's video currentTime
 * against estimated authoritative host position.
 */
export function evaluateDrift(
  localCurrentTime: number,
  broadcastPlayhead: number,
  broadcastEpochMs: number,
  playbackState: PlaybackState,
  playbackSpeed: number = 1.0,
  rttMs: number = 50,
  isHost: boolean = false
): DriftAssessment {
  if (isHost) {
    return {
      absoluteDrift: 0,
      driftDirection: 'SYNCHRONIZED',
      action: 'IN_SYNC',
      recommendedRate: playbackSpeed,
      targetTime: localCurrentTime,
      rttCompensationSeconds: 0,
    };
  }

  const rttCompensationSeconds = (rttMs / 2) / 1000;
  const targetTime = calculateEstimatedHostTime(
    broadcastPlayhead,
    broadcastEpochMs,
    playbackState,
    playbackSpeed,
    rttMs
  );

  const rawDelta = localCurrentTime - targetTime;
  const absoluteDrift = Math.abs(rawDelta);
  const driftDirection = rawDelta > 0.05 ? 'AHEAD' : rawDelta < -0.05 ? 'BEHIND' : 'SYNCHRONIZED';

  // Specified requirement: If drift > 1.5 seconds, smoothly seek to align
  if (absoluteDrift > 1.5) {
    return {
      absoluteDrift,
      driftDirection,
      action: 'SEEK',
      recommendedRate: playbackSpeed,
      targetTime: Math.max(0, targetTime),
      rttCompensationSeconds,
    };
  }

  // Micro-adjustment zone: between 0.3s and 1.5s
  // Accelerate or decelerate slightly to align smoothly without jarring seek
  if (absoluteDrift > 0.3 && playbackState === 'PLAYING') {
    const rateAdjustment = driftDirection === 'BEHIND' ? 1.05 : 0.95;
    return {
      absoluteDrift,
      driftDirection,
      action: 'MICRO_ADJUST',
      recommendedRate: Number((playbackSpeed * rateAdjustment).toFixed(2)),
      targetTime: Math.max(0, targetTime),
      rttCompensationSeconds,
    };
  }

  return {
    absoluteDrift,
    driftDirection: 'SYNCHRONIZED',
    action: 'IN_SYNC',
    recommendedRate: playbackSpeed,
    targetTime: Math.max(0, targetTime),
    rttCompensationSeconds,
  };
}

/**
 * Format raw seconds to MM:SS or HH:MM:SS (Netflix style)
 */
export function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Parse timecode string like "02:15" or "1:05:22" back to seconds
 */
export function parseTimecode(text: string): number | null {
  const parts = text.split(':').map(Number);
  if (parts.some(isNaN)) return null;

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return null;
}
