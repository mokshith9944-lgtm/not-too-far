'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Film,
  ArrowLeft,
  Share2,
  Users,
  Radio,
  Lock,
  Unlock,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Settings
} from 'lucide-react';
import VideoPlayer from '@/components/player/VideoPlayer';
import UnifiedDock from '@/components/dock/UnifiedDock';
import InviteModal from '@/components/InviteModal';
import { PartyRoom, ChatMessage, PlaybackState, SyncActionBroadcast, SyncStateBroadcast } from '@/lib/types';
import { MOCK_ROOMS, MOCK_MESSAGES, CURRENT_USER, MOCK_HOST_PROFILE } from '@/lib/mock-data';
import { getRealtimeChannel } from '@/lib/supabase/client';
import { evaluateDrift, formatTimecode } from '@/lib/sync-engine';

interface RoomPageProps {
  params: {
    id: string;
  };
}

export default function WatchRoomPage({ params }: RoomPageProps) {
  const roomId = params.id;
  const router = useRouter();

  // Room state
  const [room, setRoom] = useState<PartyRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('PAUSED');
  const [hostPlayhead, setHostPlayhead] = useState<number>(0);
  const [localVideoTime, setLocalVideoTime] = useState<number>(0);
  const [localVideoDuration, setLocalVideoDuration] = useState<number>(0);
  const [measuredDriftMs, setMeasuredDriftMs] = useState<number>(0);
  const [rttMs, setRttMs] = useState<number>(37); // Simulated / measured round-trip time

  // UI state
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChangeSourceModalOpen, setIsChangeSourceModalOpen] = useState(false);
  const [customSourceInput, setCustomSourceInput] = useState('');
  const [isHost, setIsHost] = useState(false);

  // Realtime channel reference
  const channelRef = useRef<any>(null);
  const lastBroadcastEpochRef = useRef<number>(Date.now());
  const hostHeartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize room data
  useEffect(() => {
    // 1. Look in mock rooms
    let foundRoom = MOCK_ROOMS.find((r) => r.id === roomId);

    // 2. Check localStorage custom created rooms
    if (!foundRoom && typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('ntf_custom_rooms') || '[]');
        foundRoom = stored.find((r: PartyRoom) => r.id === roomId);
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Fallback generic room if not found
    if (!foundRoom) {
      foundRoom = {
        ...MOCK_ROOMS[0],
        id: roomId,
        title: `Room #${roomId.substring(0, 8)}`,
        host_id: CURRENT_USER.id,
        host_profile: CURRENT_USER,
      };
    }

    setRoom(foundRoom);
    setPlaybackState(foundRoom.playback_state);
    setHostPlayhead(foundRoom.current_timestamp);
    setIsHost(foundRoom.host_id === CURRENT_USER.id);

    // Load initial messages
    const initialMsgs = MOCK_MESSAGES[roomId] || [
      {
        id: 'welcome-msg',
        room_id: roomId,
        user_id: foundRoom.host_id,
        content: `Welcome to "${foundRoom.title}". Video synchronization is active! 🚀`,
        created_at: new Date().toISOString(),
        sender: foundRoom.host_profile || MOCK_HOST_PROFILE,
      },
    ];
    setMessages(initialMsgs);
  }, [roomId]);

  // Connect to Supabase Realtime Broadcast Channel
  useEffect(() => {
    if (!room) return;

    const channelName = `watch_room_${roomId}`;
    const channel = getRealtimeChannel(channelName);
    channelRef.current = channel;

    // Listen to real-time sync actions from participants/host
    channel.on('broadcast', { event: 'SYNC_ACTION' }, (data: any) => {
      const payload: SyncActionBroadcast = data.payload || data;
      if (payload.senderId === CURRENT_USER.id) return; // Ignore own broadcast

      console.log('[Realtime Sync Action received]:', payload);
      lastBroadcastEpochRef.current = payload.timestamp;

      if (payload.action === 'PLAY') {
        setPlaybackState('PLAYING');
        if (payload.targetTime !== undefined) {
          setHostPlayhead(payload.targetTime);
        }
      } else if (payload.action === 'PAUSE') {
        setPlaybackState('PAUSED');
        if (payload.targetTime !== undefined) {
          setHostPlayhead(payload.targetTime);
        }
      } else if (payload.action === 'SEEK') {
        if (payload.targetTime !== undefined) {
          setHostPlayhead(payload.targetTime);
        }
      } else if (payload.action === 'CHANGE_MEDIA') {
        if (payload.mediaUrl) {
          setRoom((prev) =>
            prev
              ? {
                  ...prev,
                  media_url: payload.mediaUrl!,
                  media_title: payload.mediaTitle || 'Custom Stream',
                }
              : prev
          );
        }
      }
    });

    // Listen to periodic host heartbeats
    channel.on('broadcast', { event: 'HEARTBEAT' }, (data: any) => {
      const payload: SyncStateBroadcast = data.payload || data;
      if (payload.senderId === CURRENT_USER.id) return;

      lastBroadcastEpochRef.current = payload.timestamp;
      setPlaybackState(payload.playbackState);

      // Perform client-side drift assessment
      const assessment = evaluateDrift(
        localVideoTime,
        payload.currentTime,
        payload.timestamp,
        payload.playbackState,
        payload.playbackSpeed,
        rttMs,
        isHost
      );

      setMeasuredDriftMs(Math.round(assessment.absoluteDrift * 1000));
      setHostPlayhead(assessment.targetTime);
    });

    // Listen to live chat messages
    channel.on('broadcast', { event: 'CHAT_MESSAGE' }, (data: any) => {
      const payload: ChatMessage = data.payload || data;
      setMessages((prev) => [...prev, payload]);
    });

    // Subscribe to channel
    channel.subscribe((status: string) => {
      console.log(`[Supabase Realtime Channel Status: ${channelName}] -> ${status}`);
    });

    return () => {
      channel.unsubscribe();
      if (hostHeartbeatTimerRef.current) clearInterval(hostHeartbeatTimerRef.current);
    };
  }, [room?.id, roomId, isHost, localVideoTime, rttMs]);

  // Host Heartbeat Broadcast Loop (every 1 second when room host)
  useEffect(() => {
    if (!isHost || !room) return;

    if (hostHeartbeatTimerRef.current) clearInterval(hostHeartbeatTimerRef.current);

    hostHeartbeatTimerRef.current = setInterval(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'HEARTBEAT',
          payload: {
            type: 'SYNC_STATE_BROADCAST',
            roomId,
            senderId: CURRENT_USER.id,
            playbackState,
            currentTime: localVideoTime,
            playbackSpeed: 1.0,
            timestamp: Date.now(),
            mediaUrl: room.media_url,
            mediaTitle: room.media_title,
          },
        });
      }
    }, 1000);

    return () => {
      if (hostHeartbeatTimerRef.current) clearInterval(hostHeartbeatTimerRef.current);
    };
  }, [isHost, room?.media_url, room?.media_title, playbackState, localVideoTime, roomId]);

  // Web Extension Bridge integration via window.postMessage
  useEffect(() => {
    const handleBridgeMessage = (event: MessageEvent) => {
      if (event.data?.source !== 'NOT_TOO_FAR_EXTENSION') return;

      const { type, payload } = event.data;
      console.log('[Web Extension Bridge Event received]:', type, payload);

      if (type === 'MEDIA_EVENT_PLAY') {
        handlePlayAction(payload.currentTime);
      } else if (type === 'MEDIA_EVENT_PAUSE') {
        handlePauseAction(payload.currentTime);
      } else if (type === 'MEDIA_EVENT_SEEK') {
        handleSeekAction(payload.currentTime);
      }
    };

    window.addEventListener('message', handleBridgeMessage);
    return () => window.removeEventListener('message', handleBridgeMessage);
  }, []);

  // Broadcast Actions
  const handlePlayAction = (currentTime: number) => {
    setPlaybackState('PLAYING');
    setHostPlayhead(currentTime);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'SYNC_ACTION',
        payload: {
          type: 'SYNC_ACTION',
          roomId,
          senderId: CURRENT_USER.id,
          action: 'PLAY',
          targetTime: currentTime,
          timestamp: Date.now(),
        },
      });
    }

    // Forward to extension bridge if connected
    if (typeof window !== 'undefined') {
      window.postMessage({ channel: 'NOT_TOO_FAR_SYNC_BRIDGE_V1', type: 'COMMAND_PLAY' }, '*');
    }
  };

  const handlePauseAction = (currentTime: number) => {
    setPlaybackState('PAUSED');
    setHostPlayhead(currentTime);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'SYNC_ACTION',
        payload: {
          type: 'SYNC_ACTION',
          roomId,
          senderId: CURRENT_USER.id,
          action: 'PAUSE',
          targetTime: currentTime,
          timestamp: Date.now(),
        },
      });
    }

    if (typeof window !== 'undefined') {
      window.postMessage({ channel: 'NOT_TOO_FAR_SYNC_BRIDGE_V1', type: 'COMMAND_PAUSE' }, '*');
    }
  };

  const handleSeekAction = (targetTime: number) => {
    setHostPlayhead(targetTime);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'SYNC_ACTION',
        payload: {
          type: 'SYNC_ACTION',
          roomId,
          senderId: CURRENT_USER.id,
          action: 'SEEK',
          targetTime,
          timestamp: Date.now(),
        },
      });
    }

    if (typeof window !== 'undefined') {
      window.postMessage(
        {
          channel: 'NOT_TOO_FAR_SYNC_BRIDGE_V1',
          type: 'COMMAND_SEEK',
          payload: { targetTime },
        },
        '*'
      );
    }
  };

  const handleSpeedAction = (speed: number) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'SYNC_ACTION',
        payload: {
          type: 'SYNC_ACTION',
          roomId,
          senderId: CURRENT_USER.id,
          action: 'SPEED_CHANGE',
          speed,
          timestamp: Date.now(),
        },
      });
    }
  };

  const handleSendMessage = (content: string, timestampTag?: number) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      room_id: roomId,
      user_id: CURRENT_USER.id,
      content,
      timestamp_tag: timestampTag,
      created_at: new Date().toISOString(),
      sender: CURRENT_USER,
    };

    setMessages((prev) => [...prev, newMsg]);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'CHAT_MESSAGE',
        payload: newMsg,
      });
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions || {};
        const userList = currentReactions[emoji] || [];
        const hasReacted = userList.includes(CURRENT_USER.id);

        return {
          ...msg,
          reactions: {
            ...currentReactions,
            [emoji]: hasReacted
              ? userList.filter((id) => id !== CURRENT_USER.id)
              : [...userList, CURRENT_USER.id],
          },
        };
      })
    );
  };

  const handleChangeMediaSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSourceInput.trim() || !room) return;

    const newUrl = customSourceInput.trim();
    setRoom((prev) => (prev ? { ...prev, media_url: newUrl } : prev));
    setIsChangeSourceModalOpen(false);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'SYNC_ACTION',
        payload: {
          type: 'SYNC_ACTION',
          roomId,
          senderId: CURRENT_USER.id,
          action: 'CHANGE_MEDIA',
          mediaUrl: newUrl,
          mediaTitle: 'Direct Stream',
          timestamp: Date.now(),
        },
      });
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-netflix-dark flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-sm text-netflix-gray">Connecting to Not Too Far Room Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-netflix-dark overflow-hidden flex flex-col select-none">
      {/* Top Header Bar */}
      <header className="h-12 bg-netflix-base/90 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between z-40">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-netflix-gray hover:text-white transition-colors text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Lounge</span>
          </Link>

          <span className="text-white/20">|</span>

          <div className="flex items-center space-x-2">
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
              {room.title}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-netflix-red/20 text-netflix-red border border-netflix-red/30">
              {room.media_title}
            </span>
          </div>
        </div>

        {/* Room Header Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Invite CTA */}
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-netflix-red hover:bg-netflix-redHover text-white text-xs font-semibold shadow-glow-red transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>

          {/* Universe Link if attached */}
          {room.universe_id && (
            <Link
              href={`/universes/${room.universe_id}`}
              className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-netflix-red" />
              <span>Universe</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Workspace (Player + Unified Dock) */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Cinema Video Player Viewport */}
        <main className="flex-1 h-full relative bg-black flex items-center justify-center overflow-hidden">
          <VideoPlayer
            mediaUrl={room.media_url}
            mediaTitle={room.media_title}
            isHost={isHost}
            isLocked={room.is_locked}
            currentPlaybackState={playbackState}
            currentHostTime={hostPlayhead}
            driftMs={measuredDriftMs}
            onPlayAction={handlePlayAction}
            onPauseAction={handlePauseAction}
            onSeekAction={handleSeekAction}
            onSpeedAction={handleSpeedAction}
            onTimeUpdateLocal={(time, duration) => {
              setLocalVideoTime(time);
              setLocalVideoDuration(duration);
            }}
            isDockCollapsed={isDockCollapsed}
            onToggleDock={() => setIsDockCollapsed(!isDockCollapsed)}
            onOpenSourceModal={() => setIsChangeSourceModalOpen(true)}
          />
        </main>

        {/* Collapsible Unified Communication Dock */}
        <UnifiedDock
          room={room}
          currentUser={CURRENT_USER}
          messages={messages}
          currentVideoTime={localVideoTime}
          isHost={isHost}
          driftMs={measuredDriftMs}
          isCollapsed={isDockCollapsed}
          onToggleCollapse={() => setIsDockCollapsed(!isDockCollapsed)}
          onSendMessage={handleSendMessage}
          onSeekToTimestamp={handleSeekAction}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          onAddReaction={handleAddReaction}
        />
      </div>

      {/* Change Stream Source Modal */}
      {isChangeSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-netflix-surface border border-white/10 rounded-lg p-6 max-w-md w-full space-y-4 shadow-cinema">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-netflix-red" />
              <span>Change Stream URL (Host Control)</span>
            </h3>
            <form onSubmit={handleChangeMediaSource} className="space-y-3">
              <div>
                <label className="text-xs text-netflix-gray block mb-1">
                  Enter new MP4, HLS (.m3u8), or web stream URL
                </label>
                <input
                  type="url"
                  required
                  value={customSourceInput}
                  onChange={(e) => setCustomSourceInput(e.target.value)}
                  placeholder="https://commondatastorage.googleapis.com/...mp4"
                  className="w-full bg-netflix-card border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-netflix-red"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangeSourceModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs text-netflix-gray hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-netflix-red hover:bg-netflix-redHover text-white text-xs font-bold shadow-glow-red"
                >
                  Apply & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        roomId={room.id}
        roomTitle={room.title}
      />
    </div>
  );
}
