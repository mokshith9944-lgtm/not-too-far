'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  supabase,
  PlaybackState,
  SyncBroadcastPayload,
  ChatMessagePayload,
  ParticipantPresence,
} from '../../../lib/supabase';
import {
  evaluatePlaybackDrift,
  HEARTBEAT_INTERVAL_MS,
} from '../../../lib/sync-engine';
import {
  sendExtensionSyncCommand,
  registerExtensionBridgeListener,
} from '../../../lib/extension-bridge';
import { VideoPlayer } from '../../../components/watch-party/VideoPlayer';
import { UnifiedSidebar } from '../../../components/watch-party/UnifiedSidebar';
import { InviteModal } from '../../../components/watch-party/InviteModal';
import { Tv, Sparkles, ArrowLeft, ShieldCheck, Share2 } from 'lucide-react';

export default function WatchRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = (params?.id as string) || 'universe-alpha-cinema';

  // Current session & user state
  const [currentUserId] = useState<string>(() => 'user_' + Math.random().toString(36).substring(2, 9));
  const [username] = useState<string>(() => 'Antigrav_' + Math.random().toString(36).substring(2, 6));
  const [avatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
  );
  const [isHost, setIsHost] = useState<boolean>(true); // Host by default if creating room

  // Playback & Video Sync state
  const [playbackState, setPlaybackState] = useState<PlaybackState>('PAUSE');
  const [targetTimestamp, setTargetTimestamp] = useState<number>(0);
  const [localPlayhead, setLocalPlayhead] = useState<number>(0);
  const [isDriftCorrecting, setIsDriftCorrecting] = useState<boolean>(false);
  const [driftSeconds, setDriftSeconds] = useState<number>(0);
  const [oneWayLatencyMs, setOneWayLatencyMs] = useState<number>(18);
  const [streamType, setStreamType] = useState<'direct' | 'extension_bridge'>('direct');

  // Media info
  const [mediaTitle] = useState<string>('Cyberpunk: Edgerunners - Episode 1');
  const [mediaUrl] = useState<string>(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );

  // Communication & Participants
  const [messages, setMessages] = useState<ChatMessagePayload[]>([
    {
      id: 'welcome_1',
      roomId,
      userId: 'system',
      username: 'Antigravity Bot',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=128&q=80',
      content: 'Welcome to the synced cinema orbit! Ultra-Sync drift correction is active.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [participants, setParticipants] = useState<ParticipantPresence[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);

  // Supabase Realtime channel ref
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // --------------------------------------------------------------------------
  // 1. SUPABASE REALTIME BROADCAST & PRESENCE SETUP
  // --------------------------------------------------------------------------
  useEffect(() => {
    const channelName = `room:${roomId}:sync`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true },
        presence: { key: currentUserId },
      },
    });

    // A. Listen for Video Synchronization broadcasts
    channel
      .on('broadcast', { event: 'video_sync' }, ({ payload }) => {
        const syncPayload = payload as SyncBroadcastPayload;

        // Skip our own broadcasts
        if (syncPayload.hostId === currentUserId) return;

        // Compute drift and network latency compensation (RTT / 2)
        const evaluation = evaluatePlaybackDrift(localPlayhead, syncPayload);
        setDriftSeconds(evaluation.driftSeconds);
        setOneWayLatencyMs(evaluation.oneWayLatencySeconds * 1000);

        // Update state
        setPlaybackState(syncPayload.playbackState);

        // Forward command to extension bridge if in extension mode
        if (streamType === 'extension_bridge') {
          const action =
            syncPayload.playbackState === 'PLAY'
              ? 'SYNC_COMMAND_PLAY'
              : syncPayload.playbackState === 'PAUSE'
              ? 'SYNC_COMMAND_PAUSE'
              : 'SYNC_COMMAND_SEEK';
          sendExtensionSyncCommand(
            action,
            roomId,
            evaluation.expectedHostPlayhead,
            syncPayload.playbackState
          );
        }

        // Apply drift correction if playhead diverged > 1.5 seconds
        if (evaluation.needsCorrection) {
          setIsDriftCorrecting(true);
          setTargetTimestamp(evaluation.expectedHostPlayhead);

          // Reset drift correcting badge after smooth seek
          setTimeout(() => setIsDriftCorrecting(false), 800);
        }
      })
      // B. Listen for Real-Time Chat messages
      .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
        const msg = payload as ChatMessagePayload;
        setMessages((prev) => [...prev, msg]);
      })
      // C. Listen for Presence changes (User joined, audio/video status)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeList: ParticipantPresence[] = [];

        Object.values(state).forEach((presences) => {
          (presences as unknown as ParticipantPresence[]).forEach((p) => {
            activeList.push(p);
          });
        });

        setParticipants(activeList);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await channel.track({
            userId: currentUserId,
            username,
            avatarUrl,
            isHost,
            isAudioActive: true,
            isVideoActive: true,
            currentPlayhead: localPlayhead,
            isDriftCorrecting: false,
            joinedAt: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUserId, username, avatarUrl, isHost, localPlayhead, streamType]);

  // --------------------------------------------------------------------------
  // 2. WEB EXTENSION BRIDGE INTEGRATION
  // --------------------------------------------------------------------------
  useEffect(() => {
    const unregisterBridge = registerExtensionBridgeListener((payload) => {
      if (payload.action === 'EXTERNAL_PLAYER_STATE_CHANGE' && isHost) {
        // External Netflix/Prime player changed state -> broadcast to all
        broadcastSyncState(
          payload.playbackState || 'PLAY',
          payload.timestamp || localPlayhead
        );
      }
    });

    return () => unregisterBridge();
  }, [isHost, localPlayhead]);

  // --------------------------------------------------------------------------
  // 3. HOST PERIODIC HEARTBEAT BROADCAST
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isHost || playbackState !== 'PLAY') return;

    const interval = setInterval(() => {
      broadcastSyncState('PLAY', localPlayhead);
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isHost, playbackState, localPlayhead]);

  // Broadcast sync state to room participants
  const broadcastSyncState = useCallback(
    (state: PlaybackState, timestamp: number) => {
      if (!channelRef.current) return;

      const payload: SyncBroadcastPayload = {
        roomId,
        playbackState: state,
        timestamp,
        hostId: currentUserId,
        senderTimestamp: Date.now(),
        mediaUrl,
        mediaTitle,
      };

      channelRef.current.send({
        type: 'broadcast',
        event: 'video_sync',
        payload,
      });

      // Also dispatch to extension bridge
      if (streamType === 'extension_bridge') {
        const action =
          state === 'PLAY'
            ? 'SYNC_COMMAND_PLAY'
            : state === 'PAUSE'
            ? 'SYNC_COMMAND_PAUSE'
            : 'SYNC_COMMAND_SEEK';
        sendExtensionSyncCommand(action, roomId, timestamp, state);
      }
    },
    [roomId, currentUserId, mediaUrl, mediaTitle, streamType]
  );

  // --------------------------------------------------------------------------
  // 4. USER CONTROLS HANDLERS
  // --------------------------------------------------------------------------
  const handleUserPlay = (timestamp: number) => {
    setPlaybackState('PLAY');
    setLocalPlayhead(timestamp);
    if (isHost) broadcastSyncState('PLAY', timestamp);
  };

  const handleUserPause = (timestamp: number) => {
    setPlaybackState('PAUSE');
    setLocalPlayhead(timestamp);
    if (isHost) broadcastSyncState('PAUSE', timestamp);
  };

  const handleUserSeek = (timestamp: number) => {
    setTargetTimestamp(timestamp);
    setLocalPlayhead(timestamp);
    if (isHost) broadcastSyncState('SEEK', timestamp);
  };

  const handleSendMessage = (content: string, timestampTag?: number) => {
    const newMessage: ChatMessagePayload = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      roomId,
      userId: currentUserId,
      username,
      avatarUrl,
      content,
      timestampTag,
      createdAt: new Date().toISOString(),
    };

    // Update local state immediately
    setMessages((prev) => [...prev, newMessage]);

    // Broadcast to room channel
    channelRef.current?.send({
      type: 'broadcast',
      event: 'chat_message',
      payload: newMessage,
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#141414] text-white font-sans overflow-hidden select-none">
      {/* Top Navigation Bar: Netflix Style */}
      <header className="h-14 bg-[#141414]/95 border-b border-white/10 px-6 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition p-1.5 hover:bg-white/5 rounded-lg flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Lobby
          </button>

          <span className="text-[#E50914] font-black tracking-widest text-lg font-sans">
            ANTIGRAVITY
          </span>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* Universe Orbit Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Universe:</span>
            <span className="font-semibold text-white">Cinephile Hub</span>
            <span className="text-gray-600">/</span>
            <span className="text-gray-400">Orbit:</span>
            <span className="text-[#E50914] font-mono font-medium">#cinema-main</span>
          </div>
        </div>

        {/* Center / Right Telemetry & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[#1f1f1f] px-3 py-1 rounded-full border border-white/5 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-300">Edge Encrypted</span>
            <span className="text-gray-500">•</span>
            <span className="font-mono text-emerald-400">RLS Active</span>
          </div>

          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 bg-[#E50914] hover:bg-[#b80710] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-[#E50914]/20 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            Invite Friends
          </button>
        </div>
      </header>

      {/* Main Content Area: Video Viewport + Unified Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Player Main Viewport */}
        <main className="flex-1 relative h-full overflow-hidden bg-[#0d0d0d]">
          <VideoPlayer
            mediaUrl={mediaUrl}
            mediaTitle={mediaTitle}
            isHost={isHost}
            playbackState={playbackState}
            targetTimestamp={targetTimestamp}
            isDriftCorrecting={isDriftCorrecting}
            driftSeconds={driftSeconds}
            oneWayLatencyMs={oneWayLatencyMs}
            streamType={streamType}
            onUserPlay={handleUserPlay}
            onUserPause={handleUserPause}
            onUserSeek={handleUserSeek}
            onToggleStreamType={() =>
              setStreamType((prev) => (prev === 'direct' ? 'extension_bridge' : 'direct'))
            }
            onOpenInvite={() => setIsInviteOpen(true)}
          />
        </main>

        {/* Unified Communication Dock: Sticky & Collapsible */}
        <UnifiedSidebar
          messages={messages}
          participants={participants}
          currentUserId={currentUserId}
          isHost={isHost}
          currentPlayhead={localPlayhead}
          onSendMessage={handleSendMessage}
          onSeekToTimestamp={handleUserSeek}
        />
      </div>

      {/* Invite Friends Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        roomId={roomId}
        roomTitle={mediaTitle}
      />
    </div>
  );
}
