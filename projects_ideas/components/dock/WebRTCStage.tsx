'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  MonitorUp,
  Radio,
  Crown,
  Users,
  Sparkles
} from 'lucide-react';
import { Profile, RoomParticipant } from '@/lib/types';
import { MOCK_PARTICIPANTS } from '@/lib/mock-data';

interface WebRTCStageProps {
  currentUser: Profile;
  isHost: boolean;
}

export default function WebRTCStage({ currentUser, isHost }: WebRTCStageProps) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);

  // Initialize participants
  const [participants, setParticipants] = useState<RoomParticipant[]>([
    {
      id: currentUser.id,
      username: currentUser.username,
      display_name: currentUser.display_name,
      avatar_url: currentUser.avatar_url,
      isHost: isHost,
      isMuted: !isMicOn,
      isDeafened: isDeafened,
      isCameraOn: isCameraOn,
      isScreenSharing: false,
      isSpeaking: false,
      currentPlayhead: 0,
      latencyMs: 14,
      joinedAt: Date.now(),
    },
    ...MOCK_PARTICIPANTS.filter((p) => p.id !== currentUser.id).map((p, idx) => ({
      id: p.id,
      username: p.username,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      isHost: idx === 0 && !isHost,
      isMuted: idx % 2 === 1,
      isDeafened: false,
      isCameraOn: idx === 0,
      isScreenSharing: false,
      isSpeaking: false,
      currentPlayhead: 0,
      latencyMs: 18 + idx * 6,
      joinedAt: Date.now() - 50000,
    })),
  ]);

  // Periodic active speaker simulation to demonstrate speech detection halos
  useEffect(() => {
    const interval = setInterval(() => {
      const luckyIndex = Math.floor(Math.random() * participants.length);
      setActiveSpeakerIndex(luckyIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [participants.length]);

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    setParticipants((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, isMuted: isMicOn } : p))
    );
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    setParticipants((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, isCameraOn: !isCameraOn } : p))
    );
  };

  const toggleDeafen = () => {
    setIsDeafened(!isDeafened);
  };

  return (
    <div className="flex flex-col h-full bg-netflix-surface text-white">
      {/* Stage Header Info */}
      <div className="p-3 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-white">Live Voice & Video Stage</span>
        </div>
        <div className="flex items-center space-x-1.5 text-netflix-muted font-mono text-[11px]">
          <Users className="w-3.5 h-3.5" />
          <span>{participants.length} On Stage</span>
        </div>
      </div>

      {/* Video Call Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 auto-rows-max">
        {participants.map((participant, index) => {
          const isSpeaking = index === activeSpeakerIndex && !participant.isMuted;
          const isMe = participant.id === currentUser.id;

          return (
            <div
              key={participant.id}
              className={`relative rounded-md overflow-hidden bg-netflix-card border transition-all aspect-video flex flex-col items-center justify-center ${
                isSpeaking
                  ? 'border-netflix-red shadow-glow-red ring-2 ring-netflix-red/50'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Camera feed or avatar placeholder */}
              {participant.isCameraOn ? (
                <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                  <img
                    src={participant.avatar_url}
                    alt={participant.display_name}
                    className="w-full h-full object-cover filter brightness-90"
                  />
                  {/* Subtle video scanning overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1.5">
                  <div className="relative">
                    <img
                      src={participant.avatar_url}
                      alt={participant.display_name}
                      className={`w-12 h-12 rounded-full object-cover border-2 ${
                        isSpeaking ? 'border-netflix-red scale-105' : 'border-white/20'
                      } transition-all`}
                    />
                    {isSpeaking && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-netflix-red rounded-full flex items-center justify-center">
                        <Radio className="w-2.5 h-2.5 text-white animate-pulse" />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                <span className="text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded truncate max-w-[80px]">
                  {isMe ? 'You' : participant.display_name}
                </span>

                <div className="flex items-center space-x-1">
                  {participant.isHost && (
                    <span className="p-0.5 rounded bg-netflix-gold/20 text-netflix-gold" title="Host">
                      <Crown className="w-3 h-3" />
                    </span>
                  )}
                  {participant.isMuted ? (
                    <span className="p-0.5 rounded bg-netflix-red/40 text-netflix-red" title="Muted">
                      <MicOff className="w-3 h-3" />
                    </span>
                  ) : (
                    <span className="p-0.5 rounded bg-green-500/20 text-green-400" title="Mic Active">
                      <Mic className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Bottom Dock Controls */}
      <div className="p-3 bg-netflix-dark border-t border-white/10 flex items-center justify-center space-x-3">
        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          className={`p-2.5 rounded-full transition-all ${
            isMicOn
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-netflix-red hover:bg-netflix-redHover text-white shadow-glow-red'
          }`}
          title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          className={`p-2.5 rounded-full transition-all ${
            isCameraOn
              ? 'bg-white/20 text-white'
              : 'bg-white/10 hover:bg-white/20 text-netflix-gray hover:text-white'
          }`}
          title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {isCameraOn ? <Video className="w-4 h-4 text-green-400" /> : <VideoOff className="w-4 h-4" />}
        </button>

        {/* Deafen Toggle */}
        <button
          onClick={toggleDeafen}
          className={`p-2.5 rounded-full transition-all ${
            isDeafened
              ? 'bg-netflix-red text-white shadow-glow-red'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
          title={isDeafened ? 'Undeafen Audio' : 'Deafen (Mute Room Audio)'}
        >
          {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`p-2.5 rounded-full transition-all ${
            isScreenSharing
              ? 'bg-netflix-red text-white shadow-glow-red'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
          title="Share Screen"
        >
          <MonitorUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
