'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  Lock,
  Unlock,
  Settings,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Film
} from 'lucide-react';
import { PlaybackState } from '@/lib/types';
import { formatTimecode } from '@/lib/sync-engine';

interface VideoPlayerProps {
  mediaUrl: string;
  mediaTitle: string;
  isHost: boolean;
  isLocked: boolean;
  currentPlaybackState: PlaybackState;
  currentHostTime: number;
  driftMs: number;
  onPlayAction: (currentTime: number) => void;
  onPauseAction: (currentTime: number) => void;
  onSeekAction: (targetTime: number) => void;
  onSpeedAction: (speed: number) => void;
  onTimeUpdateLocal?: (currentTime: number, duration: number) => void;
  isDockCollapsed: boolean;
  onToggleDock: () => void;
  onOpenSourceModal?: () => void;
}

export default function VideoPlayer({
  mediaUrl,
  mediaTitle,
  isHost,
  isLocked,
  currentPlaybackState,
  currentHostTime,
  driftMs,
  onPlayAction,
  onPauseAction,
  onSeekAction,
  onSpeedAction,
  onTimeUpdateLocal,
  isDockCollapsed,
  onToggleDock,
  onOpenSourceModal,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isScrubbing) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3000);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in chat or input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-10);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isHost, isLocked]);

  // Synchronize internal playback state with room state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (currentPlaybackState === 'PLAYING') {
      if (video.paused) {
        video.play().catch((err) => console.log('Autoplay handled:', err));
      }
      setIsPlaying(true);
    } else if (currentPlaybackState === 'PAUSED') {
      if (!video.paused) {
        video.pause();
      }
      setIsPlaying(false);
    }
  }, [currentPlaybackState]);

  // Smooth seeking on drift alignment
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isHost || isScrubbing) return;

    const delta = Math.abs(video.currentTime - currentHostTime);
    // Hard seek trigger if drift exceeds 1.5s
    if (delta > 1.5) {
      console.log(`[Drift Alignment] Local playhead drifted ${delta.toFixed(2)}s. Re-aligning to host time ${currentHostTime.toFixed(2)}s`);
      video.currentTime = currentHostTime;
    }
  }, [currentHostTime, isHost, isScrubbing]);

  const togglePlay = () => {
    if (isLocked && !isHost) {
      alert('This room has Host-Only controls locked.');
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
      onPlayAction(video.currentTime);
    } else {
      video.pause();
      setIsPlaying(false);
      onPauseAction(video.currentTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (isLocked && !isHost) return;
    const video = videoRef.current;
    if (!video) return;

    const target = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    video.currentTime = target;
    setCurrentTime(target);
    onSeekAction(target);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked && !isHost) return;
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
  };

  const handleSeekCommit = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    if (isLocked && !isHost) return;
    const target = currentTime;
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
    setIsScrubbing(false);
    onSeekAction(target);
  };

  const handleScrubHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(e.clientX - rect.left);
    setHoverTime(percent * duration);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleSpeedSelect = (speed: number) => {
    if (isLocked && !isHost) return;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    onSpeedAction(speed);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full h-full bg-black select-none overflow-hidden flex items-center justify-center group"
    >
      {/* Primary Video Element */}
      <video
        ref={videoRef}
        src={mediaUrl}
        playsInline
        preload="auto"
        onClick={togglePlay}
        onTimeUpdate={() => {
          if (!videoRef.current || isScrubbing) return;
          const ct = videoRef.current.currentTime;
          setCurrentTime(ct);
          if (onTimeUpdateLocal) onTimeUpdateLocal(ct, videoRef.current.duration || 0);
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration || 0);
          }
        }}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Center Large Play/Pause Flash Overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute z-20 w-20 h-20 rounded-full bg-netflix-red/90 text-white flex items-center justify-center shadow-glow-red hover:scale-110 transition-transform"
        >
          <Play className="w-10 h-10 fill-white translate-x-1" />
        </button>
      )}

      {/* TOP HUD GRADIENT (Media Title, Drift Stats, Host Badge) */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 player-gradient-top px-6 py-4 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-netflix-red/20 border border-netflix-red/40 flex items-center justify-center text-netflix-red">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide drop-shadow-md">
              {mediaTitle}
            </h2>
            <div className="flex items-center space-x-2 text-[11px] text-netflix-gray">
              <span className="flex items-center gap-1 text-green-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Synchronized
              </span>
              <span>•</span>
              <span className="font-mono text-white/90">
                Drift: {driftMs > 0 ? `+${driftMs}ms` : `${driftMs}ms`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Top Status & Settings */}
        <div className="flex items-center space-x-2.5">
          {/* Lock status pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-black/60 border border-white/10 text-xs font-medium">
            {isLocked ? (
              <span className="text-yellow-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Host Locked
              </span>
            ) : (
              <span className="text-green-400 flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5" /> Unlocked
              </span>
            )}
          </div>

          {/* Change Stream URL (Host only) */}
          {isHost && onOpenSourceModal && (
            <button
              onClick={onOpenSourceModal}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white flex items-center space-x-1 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-netflix-red" />
              <span>Change Stream</span>
            </button>
          )}

          {/* Dock / Cinema toggle */}
          <button
            onClick={onToggleDock}
            className="p-1.5 rounded bg-black/60 hover:bg-white/10 border border-white/10 text-netflix-gray hover:text-white transition-colors"
            title={isDockCollapsed ? 'Show Communication Dock' : 'Cinema Mode (Hide Dock)'}
          >
            <ChevronRight
              className={`w-4 h-4 transform transition-transform ${isDockCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* BOTTOM HUD GRADIENT (Timeline Scrubber, Controls, Volume, Fullscreen) */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 player-gradient-bottom px-6 pb-5 pt-8 space-y-3 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Timeline Scrubber Container */}
        <div
          className="relative w-full group/scrub py-1 cursor-pointer"
          onMouseMove={handleScrubHover}
          onMouseLeave={() => setHoverTime(null)}
        >
          {/* Hover Timecode Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-7 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[11px] font-mono text-white transform -translate-x-1/2 pointer-events-none z-40"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatTimecode(hoverTime)}
            </div>
          )}

          {/* Background Track */}
          <div className="relative w-full h-1.5 group-hover/scrub:h-2.5 rounded-full bg-white/25 overflow-hidden transition-all">
            {/* Played Progress Bar */}
            <div
              className="absolute top-0 left-0 bottom-0 bg-netflix-red rounded-full"
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Invisible scrubbing range input over the visual track */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            disabled={isLocked && !isHost}
            onMouseDown={() => setIsScrubbing(true)}
            onTouchStart={() => setIsScrubbing(true)}
            onChange={handleSeekChange}
            onMouseUp={handleSeekCommit}
            onTouchEnd={handleSeekCommit}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Control Bar Actions */}
        <div className="flex items-center justify-between text-white">
          {/* Left Controls: Play, Skip, Volume, Timecode */}
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              disabled={isLocked && !isHost}
              className="p-1.5 text-white hover:text-netflix-red hover:scale-110 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
            </button>

            <button
              onClick={() => handleSkip(-10)}
              disabled={isLocked && !isHost}
              className="p-1 text-netflix-gray hover:text-white hover:scale-110 transition-all"
              title="Skip -10s"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleSkip(10)}
              disabled={isLocked && !isHost}
              className="p-1 text-netflix-gray hover:text-white hover:scale-110 transition-all"
              title="Skip +10s"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume scrub */}
            <div className="flex items-center space-x-2 group/vol">
              <button onClick={toggleMute} className="text-netflix-gray hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/30 rounded-lg accent-netflix-red cursor-pointer"
              />
            </div>

            {/* Timecode display */}
            <div className="text-xs font-mono text-netflix-gray select-none">
              <span className="text-white font-medium">{formatTimecode(currentTime)}</span>
              <span className="mx-1">/</span>
              <span>{formatTimecode(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Speed, Cinema Mode, Fullscreen */}
          <div className="flex items-center space-x-3 relative">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded hover:bg-white/10 text-xs font-mono text-netflix-gray hover:text-white transition-colors"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 bg-netflix-surface border border-white/10 rounded-md py-1 shadow-cinema w-24 text-xs font-mono z-50">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedSelect(rate)}
                      className={`block w-full text-left px-3 py-1 hover:bg-netflix-red hover:text-white ${
                        playbackSpeed === rate ? 'text-netflix-red font-bold' : 'text-netflix-gray'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-netflix-gray hover:text-white hover:scale-110 transition-transform"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
