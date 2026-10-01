'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Tv,
  Crown,
  Share2,
} from 'lucide-react';
import { formatVideoTime } from '../../lib/sync-engine';
import { PlaybackState } from '../../lib/supabase';

interface VideoPlayerProps {
  mediaUrl: string;
  mediaTitle: string;
  isHost: boolean;
  playbackState: PlaybackState;
  targetTimestamp: number;
  isDriftCorrecting: boolean;
  driftSeconds: number;
  oneWayLatencyMs: number;
  streamType: 'direct' | 'extension_bridge';
  onUserPlay: (timestamp: number) => void;
  onUserPause: (timestamp: number) => void;
  onUserSeek: (timestamp: number) => void;
  onToggleStreamType: () => void;
  onOpenInvite: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mediaUrl,
  mediaTitle,
  isHost,
  playbackState,
  targetTimestamp,
  isDriftCorrecting,
  driftSeconds,
  oneWayLatencyMs,
  streamType,
  onUserPlay,
  onUserPause,
  onUserSeek,
  onToggleStreamType,
  onOpenInvite,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external playbackState changes to HTML5 player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playbackState === 'PLAY' && video.paused) {
      video.play().catch(() => {
        // Handle autoplay policy restriction by muting if necessary
        video.muted = true;
        setIsMuted(true);
        video.play().catch(console.warn);
      });
      setIsPlaying(true);
    } else if (playbackState === 'PAUSE' && !video.paused) {
      video.pause();
      setIsPlaying(false);
    }
  }, [playbackState]);

  // Execute smooth seek when targetTimestamp changes or drift correction triggers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - targetTimestamp) > 0.4) {
      video.currentTime = targetTimestamp;
      setCurrentTime(targetTimestamp);
    }
  }, [targetTimestamp]);

  // Fade controls on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        onUserPlay(video.currentTime);
      }).catch(console.warn);
    } else {
      video.pause();
      setIsPlaying(false);
      onUserPause(video.currentTime);
    }
  }, [onUserPlay, onUserPause]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
    onUserSeek(seekTime);
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.min(Math.max(0, video.currentTime + seconds), duration);
    video.currentTime = newTime;
    setCurrentTime(newTime);
    onUserSeek(newTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.warn);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.warn);
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden select-none group"
    >
      {/* Extension Bridge Mode Notification Banner */}
      {streamType === 'extension_bridge' ? (
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg z-10">
          <div className="w-16 h-16 rounded-full bg-[#E50914]/20 border border-[#E50914] flex items-center justify-center mb-4 text-[#E50914] animate-pulse">
            <Tv className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Extension Bridge Active</h2>
          <p className="text-gray-400 text-sm mb-6">
            Antigravity is synchronizing playback via the browser extension directly with your open streaming provider tab (Netflix / Prime / Hotstar).
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleStreamType}
              className="px-4 py-2 bg-[#262626] hover:bg-[#333333] text-white text-sm font-semibold rounded transition"
            >
              Switch to Direct Player
            </button>
            <button
              onClick={onOpenInvite}
              className="px-4 py-2 bg-[#E50914] hover:bg-[#b80710] text-white text-sm font-semibold rounded flex items-center gap-2 transition"
            >
              <Share2 className="w-4 h-4" />
              Invite Friends
            </button>
          </div>
        </div>
      ) : (
        /* Native HTML5 Stream Player */
        <video
          ref={videoRef}
          src={mediaUrl}
          playsInline
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onEnded={() => onUserPause(duration)}
        />
      )}

      {/* Top Overlay: Title, Host Badge & Ultra-Sync Status Pill */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between z-20 pointer-events-auto"
          >
            {/* Title & Badge */}
            <div className="flex items-center gap-3">
              <span className="text-[#E50914] font-black tracking-widest text-lg font-sans">
                ANTIGRAVITY
              </span>
              <span className="text-gray-500">|</span>
              <h1 className="text-white text-base font-semibold tracking-wide truncate max-w-md">
                {mediaTitle}
              </h1>
              {isHost ? (
                <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-[#E50914] text-white px-2 py-0.5 rounded">
                  <Crown className="w-3 h-3" /> Host
                </span>
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-wider bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                  Sync Locked
                </span>
              )}
            </div>

            {/* Sync Telemetry Badge */}
            <div className="flex items-center gap-3">
              {isDriftCorrecting ? (
                <div className="flex items-center gap-2 bg-[#E50914]/20 border border-[#E50914] text-[#E50914] px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Aligning Drift ({driftSeconds.toFixed(2)}s)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ultra-Sync Active ({Math.round(oneWayLatencyMs)}ms RTT)</span>
                </div>
              )}

              <button
                onClick={onToggleStreamType}
                className="text-xs bg-[#222222]/80 hover:bg-[#333333] text-gray-200 px-3 py-1 rounded transition border border-white/10"
              >
                {streamType === 'direct' ? 'Extension Mode' : 'Direct Mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Overlay: Custom Netflix-Style Controls */}
      <AnimatePresence>
        {showControls && streamType === 'direct' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 pointer-events-auto"
          >
            {/* Timeline Scrubber */}
            <div className="relative mb-3 flex items-center group/scrubber cursor-pointer">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-gray-700/60 rounded-lg appearance-none cursor-pointer accent-[#E50914] hover:h-2 transition-all"
              />
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between">
              {/* Left: Playback, Skips, Volume & Time */}
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-[#E50914] transition p-1"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current" />
                  )}
                </button>

                <button
                  onClick={() => handleSkip(-10)}
                  className="text-gray-300 hover:text-white transition p-1"
                  title="Rewind 10 seconds"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleSkip(10)}
                  className="text-gray-300 hover:text-white transition p-1"
                  title="Forward 10 seconds"
                >
                  <RotateCw className="w-5 h-5" />
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-2 group/volume ml-2">
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="text-gray-300 hover:text-white transition"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if (videoRef.current) {
                        videoRef.current.volume = v;
                        videoRef.current.muted = v === 0;
                        setIsMuted(v === 0);
                      }
                    }}
                    className="w-16 h-1 bg-gray-600 rounded appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* Time Display */}
                <span className="text-xs text-gray-300 font-mono tracking-tight ml-2">
                  {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
                </span>
              </div>

              {/* Right: Broadcast Trigger, Fullscreen */}
              <div className="flex items-center gap-4">
                {isHost && (
                  <button
                    onClick={() => onUserSeek(currentTime)}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-[#E50914] hover:bg-[#b80710] text-white px-3 py-1.5 rounded transition shadow-lg shadow-[#E50914]/20"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Force Resync All
                  </button>
                )}

                <button
                  onClick={toggleFullscreen}
                  className="text-gray-300 hover:text-white transition p-1"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
