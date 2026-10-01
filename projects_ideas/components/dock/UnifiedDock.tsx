'use client';

import React, { useState } from 'react';
import { MessageSquare, Video, Users, ChevronRight, UserPlus, Shield, Activity } from 'lucide-react';
import ChatPanel from './ChatPanel';
import WebRTCStage from './WebRTCStage';
import { ChatMessage, Profile, PartyRoom } from '@/lib/types';

interface UnifiedDockProps {
  room: PartyRoom;
  currentUser: Profile;
  messages: ChatMessage[];
  currentVideoTime: number;
  isHost: boolean;
  driftMs: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSendMessage: (content: string, timestampTag?: number) => void;
  onSeekToTimestamp: (seconds: number) => void;
  onOpenInviteModal: () => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
}

export default function UnifiedDock({
  room,
  currentUser,
  messages,
  currentVideoTime,
  isHost,
  driftMs,
  isCollapsed,
  onToggleCollapse,
  onSendMessage,
  onSeekToTimestamp,
  onOpenInviteModal,
  onAddReaction,
}: UnifiedDockProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'stage' | 'presence'>('chat');

  if (isCollapsed) {
    return (
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={onToggleCollapse}
          className="flex items-center space-x-2 bg-netflix-surface/90 hover:bg-netflix-surface border border-white/15 px-3 py-2 rounded-md shadow-cinema backdrop-blur-md text-xs font-semibold text-white hover:scale-105 transition-all"
        >
          <MessageSquare className="w-4 h-4 text-netflix-red" />
          <span>Open Dock</span>
        </button>
      </div>
    );
  }

  return (
    <aside className="w-80 md:w-96 h-full flex flex-col bg-netflix-surface border-l border-white/10 shadow-cinema z-30 transition-all">
      {/* Top Dock Header & Tabs */}
      <div className="p-3 border-b border-white/10 bg-black/60 flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-netflix-card p-1 rounded-md border border-white/5">
          {/* Chat Tab */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-netflix-red text-white shadow-glow-red'
                : 'text-netflix-gray hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          {/* Voice/Video Stage Tab */}
          <button
            onClick={() => setActiveTab('stage')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === 'stage'
                ? 'bg-netflix-red text-white shadow-glow-red'
                : 'text-netflix-gray hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Stage</span>
          </button>

          {/* Sync Telemetry Tab */}
          <button
            onClick={() => setActiveTab('presence')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              activeTab === 'presence'
                ? 'bg-netflix-red text-white shadow-glow-red'
                : 'text-netflix-gray hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenInviteModal}
            className="p-1.5 text-netflix-gray hover:text-white rounded hover:bg-white/10"
            title="Invite to Watch Party"
          >
            <UserPlus className="w-4 h-4 text-netflix-red" />
          </button>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-netflix-gray hover:text-white rounded hover:bg-white/10"
            title="Collapse Dock"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatPanel
            messages={messages}
            currentUser={currentUser}
            currentVideoTime={currentVideoTime}
            onSendMessage={onSendMessage}
            onSeekToTimestamp={onSeekToTimestamp}
            onAddReaction={onAddReaction}
          />
        )}

        {activeTab === 'stage' && (
          <WebRTCStage currentUser={currentUser} isHost={isHost} />
        )}

        {activeTab === 'presence' && (
          <div className="p-4 space-y-4 text-xs overflow-y-auto h-full">
            <div>
              <h3 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                <span>Drift Telemetry & Latency</span>
              </h3>
              <div className="bg-netflix-card p-3 rounded border border-white/5 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-netflix-muted">Measured Playhead Drift:</span>
                  <span className="text-green-400 font-bold">{driftMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-netflix-muted">Drift Correction Threshold:</span>
                  <span className="text-white">1500 ms (&gt;1.5s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-netflix-muted">Network Latency (RTT / 2):</span>
                  <span className="text-white">18.5 ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-netflix-muted">Sync Broadcast Engine:</span>
                  <span className="text-netflix-red font-semibold">Supabase Realtime</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-netflix-red" />
                <span>Room Authority</span>
              </h3>
              <div className="bg-netflix-card p-3 rounded border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-netflix-muted">Host Authority:</span>
                  <span className="text-white font-semibold">
                    {room.host_profile?.display_name || 'Elena Rostova'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-netflix-muted">Scrubbing Access:</span>
                  <span className={room.is_locked ? 'text-yellow-400' : 'text-green-400'}>
                    {room.is_locked ? 'Host Only' : 'Open to All'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
