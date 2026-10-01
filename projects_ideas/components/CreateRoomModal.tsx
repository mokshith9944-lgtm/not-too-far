'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Film, Link as LinkIcon, Lock, Sparkles, Video } from 'lucide-react';
import { MOCK_ROOMS } from '@/lib/mock-data';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  universeId?: string;
  orbitId?: string;
}

const PRESET_VIDEOS = [
  {
    title: 'Big Buck Bunny (4K Ultra)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    duration: 596,
  },
  {
    title: 'Tears of Steel (Sci-Fi Cyberpunk)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
    duration: 734,
  },
  {
    title: 'Sintel (Fantasy Adventure)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    duration: 888,
  },
  {
    title: 'Cosmic Laundromat (Sci-Fi Comedy)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    duration: 360,
  },
];

export default function CreateRoomModal({ isOpen, onClose, universeId, orbitId }: CreateRoomModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_VIDEOS[0]) => {
    setMediaTitle(preset.title);
    setTitle(`${preset.title} Watch Party`);
    setMediaUrl(preset.url);
    setThumbnailUrl(preset.thumbnail);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newId = `room-${Date.now()}`;
    const newRoom = {
      id: newId,
      title: title || 'Synced Watch Party',
      media_title: mediaTitle || 'Direct Stream',
      media_url: mediaUrl || PRESET_VIDEOS[0].url,
      thumbnail_url: thumbnailUrl || PRESET_VIDEOS[0].thumbnail,
      duration: 600,
      playback_state: 'PAUSED' as const,
      current_timestamp: 0,
      playback_speed: 1.0,
      is_locked: isLocked,
      is_private: false,
      universe_id: universeId,
      orbit_id: orbitId,
      created_at: new Date().toISOString(),
    };

    // Store in localStorage for instant access across tabs
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('ntf_custom_rooms') || '[]');
        stored.unshift(newRoom);
        localStorage.setItem('ntf_custom_rooms', JSON.stringify(stored));
      } catch (err) {
        console.error(err);
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      router.push(`/rooms/${newId}`);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-netflix-surface border border-white/10 rounded-lg shadow-cinema overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-netflix-red" />
            <h2 className="text-lg font-bold text-white">Create Synced Watch Party</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-netflix-gray hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick presets */}
          <div>
            <label className="block text-xs font-semibold text-netflix-gray uppercase tracking-wider mb-2">
              Choose Cinema Stream Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_VIDEOS.map((preset) => (
                <button
                  type="button"
                  key={preset.title}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded text-left border transition-all text-xs flex flex-col justify-between ${
                    mediaUrl === preset.url
                      ? 'bg-netflix-red/10 border-netflix-red text-white'
                      : 'bg-netflix-card border-white/5 text-netflix-gray hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="font-semibold line-clamp-1">{preset.title}</span>
                  <span className="text-[10px] text-netflix-muted mt-1">Direct 1080p MP4</span>
                </button>
              ))}
            </div>
          </div>

          {/* Room Title */}
          <div>
            <label className="block text-xs font-semibold text-netflix-gray uppercase tracking-wider mb-1.5">
              Party Room Name
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Friday Sci-Fi Marathon"
              className="w-full bg-netflix-card border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
            />
          </div>

          {/* Media Title */}
          <div>
            <label className="block text-xs font-semibold text-netflix-gray uppercase tracking-wider mb-1.5">
              Video / Feature Title
            </label>
            <input
              type="text"
              required
              value={mediaTitle}
              onChange={(e) => setMediaTitle(e.target.value)}
              placeholder="e.g., Big Buck Bunny"
              className="w-full bg-netflix-card border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
            />
          </div>

          {/* Media URL */}
          <div>
            <label className="block text-xs font-semibold text-netflix-gray uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Stream URL (MP4, HLS m3u8, or Web Stream)</span>
              <span className="text-[10px] text-netflix-red font-mono">Zero-Drift Certified</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-netflix-muted absolute left-3 top-3" />
              <input
                type="url"
                required
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://...mp4 or m3u8"
                className="w-full bg-netflix-card border border-white/10 rounded pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
              />
            </div>
          </div>

          {/* Host Lock Control */}
          <div className="flex items-center justify-between p-3 rounded bg-netflix-card border border-white/5">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                <span>Host-Only Control Lock</span>
              </span>
              <p className="text-xs text-netflix-muted">
                When enabled, only the room host can pause, play, or scrub the timeline.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
              className="w-4 h-4 accent-netflix-red rounded cursor-pointer"
            />
          </div>

          {/* Footer CTA */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-sm text-netflix-gray hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded bg-netflix-red hover:bg-netflix-redHover text-white text-sm font-bold shadow-glow-red transition-all flex items-center space-x-1.5"
            >
              <Video className="w-4 h-4" />
              <span>{isSubmitting ? 'Launching Room...' : 'Launch Watch Party'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
