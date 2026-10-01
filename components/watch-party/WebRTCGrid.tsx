'use client';

import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Monitor, Crown, Users } from 'lucide-react';
import { ParticipantPresence } from '../../lib/supabase';

interface WebRTCGridProps {
  participants: ParticipantPresence[];
  currentUserId: string;
  isHost: boolean;
}

export const WebRTCGrid: React.FC<WebRTCGridProps> = ({
  participants,
  currentUserId,
}) => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Fallback demo users if room is solo
  const displayParticipants =
    participants.length > 0
      ? participants
      : [
          {
            userId: currentUserId,
            username: 'You (Host)',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
            isHost: true,
            isAudioActive: !isMicMuted,
            isVideoActive: !isVideoDisabled,
            currentPlayhead: 0,
            isDriftCorrecting: false,
            joinedAt: new Date().toISOString(),
          },
          {
            userId: 'peer_alex',
            username: 'Alex R.',
            avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
            isHost: false,
            isAudioActive: true,
            isVideoActive: true,
            currentPlayhead: 0,
            isDriftCorrecting: false,
            joinedAt: new Date().toISOString(),
          },
          {
            userId: 'peer_elena',
            username: 'Elena V.',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
            isHost: false,
            isAudioActive: false,
            isVideoActive: false,
            currentPlayhead: 0,
            isDriftCorrecting: false,
            joinedAt: new Date().toISOString(),
          },
        ];

  return (
    <div className="flex flex-col h-full bg-[#141414] text-gray-200">
      {/* Header Info */}
      <div className="px-4 py-3 bg-[#181818] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#E50914]" />
          <span className="text-xs font-semibold text-white tracking-wide">
            Live Stage ({displayParticipants.length})
          </span>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
          WebRTC Connected
        </span>
      </div>

      {/* Video Tile Grid */}
      <div className="flex-1 p-3 grid grid-cols-2 gap-2 overflow-y-auto auto-rows-fr">
        {displayParticipants.map((peer) => {
          const isCurrentUser = peer.userId === currentUserId;
          const audioActive = isCurrentUser ? !isMicMuted : peer.isAudioActive;
          const videoActive = isCurrentUser ? !isVideoDisabled : peer.isVideoActive;

          return (
            <div
              key={peer.userId}
              className={`relative rounded-lg overflow-hidden bg-[#1f1f1f] aspect-video flex items-center justify-center border transition-all ${
                audioActive
                  ? 'border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'border-white/5'
              }`}
            >
              {videoActive ? (
                <img
                  src={peer.avatarUrl}
                  alt={peer.username}
                  className="w-full h-full object-cover filter brightness-90"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <img
                    src={peer.avatarUrl}
                    alt={peer.username}
                    className="w-10 h-10 rounded-full border-2 border-white/20 mb-1"
                  />
                  <span className="text-[11px] text-gray-400 font-medium">Camera Off</span>
                </div>
              )}

              {/* Top Host Crown */}
              {peer.isHost && (
                <div className="absolute top-1.5 left-1.5 bg-[#E50914] text-white p-1 rounded">
                  <Crown className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Bottom Label & Audio Status */}
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">
                <span className="text-white truncate font-medium max-w-[80px]">
                  {isCurrentUser ? 'You' : peer.username}
                </span>
                <span className="flex items-center">
                  {audioActive ? (
                    <Mic className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <MicOff className="w-3 h-3 text-[#E50914]" />
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Media Controls Dock */}
      <div className="p-3 bg-[#181818] border-t border-white/10 flex items-center justify-center gap-2">
        {/* Mic Toggle */}
        <button
          onClick={() => setIsMicMuted(!isMicMuted)}
          className={`p-2.5 rounded-full transition flex items-center justify-center ${
            isMicMuted
              ? 'bg-[#E50914] text-white hover:bg-[#b80710]'
              : 'bg-[#2b2b2b] text-white hover:bg-[#383838]'
          }`}
          title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={() => setIsVideoDisabled(!isVideoDisabled)}
          className={`p-2.5 rounded-full transition flex items-center justify-center ${
            isVideoDisabled
              ? 'bg-[#E50914] text-white hover:bg-[#b80710]'
              : 'bg-[#2b2b2b] text-white hover:bg-[#383838]'
          }`}
          title={isVideoDisabled ? 'Turn On Camera' : 'Turn Off Camera'}
        >
          {isVideoDisabled ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
        </button>

        {/* Deafen Toggle */}
        <button
          onClick={() => setIsDeafened(!isDeafened)}
          className={`p-2.5 rounded-full transition flex items-center justify-center ${
            isDeafened
              ? 'bg-[#E50914] text-white hover:bg-[#b80710]'
              : 'bg-[#2b2b2b] text-white hover:bg-[#383838]'
          }`}
          title={isDeafened ? 'Undeafen' : 'Deafen Stage'}
        >
          {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`p-2.5 rounded-full transition flex items-center justify-center ${
            isScreenSharing
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-[#2b2b2b] text-white hover:bg-[#383838]'
          }`}
          title="Share Screen"
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
