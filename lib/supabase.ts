'use client';

import { createClient } from '@supabase/supabase-js';

// Environment variable retrieval with safe fallbacks for client-side and demo runs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-antigravity.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-antigravity-watch-party';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type PlaybackState = 'PLAY' | 'PAUSE' | 'BUFFERING' | 'SEEK';

export interface SyncBroadcastPayload {
  roomId: string;
  playbackState: PlaybackState;
  timestamp: number;
  hostId: string;
  senderTimestamp: number; // Client epoch time when message was broadcast
  mediaUrl?: string;
  mediaTitle?: string;
}

export interface ChatMessagePayload {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  avatarUrl: string;
  content: string;
  timestampTag?: number; // Video jump-to second
  createdAt: string;
}

export interface ParticipantPresence {
  userId: string;
  username: string;
  avatarUrl: string;
  isHost: boolean;
  isAudioActive: boolean;
  isVideoActive: boolean;
  currentPlayhead: number;
  isDriftCorrecting: boolean;
  joinedAt: string;
}
