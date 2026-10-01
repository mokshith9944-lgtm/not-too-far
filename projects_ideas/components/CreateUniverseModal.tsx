'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, Globe, Lock, Compass } from 'lucide-react';
import { CURRENT_USER } from '@/lib/mock-data';

interface CreateUniverseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateUniverseModal({ isOpen, onClose }: CreateUniverseModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newId = `univ-${Date.now()}`;
    const newUniverse = {
      id: newId,
      name,
      slug,
      description,
      is_public: isPublic,
      icon_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=150&auto=format&fit=crop&q=80',
      banner_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
      owner_id: CURRENT_USER.id,
      invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      member_count: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('ntf_custom_universes') || '[]');
        stored.unshift(newUniverse);
        localStorage.setItem('ntf_custom_universes', JSON.stringify(stored));
      } catch (err) {
        console.error(err);
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      router.push(`/universes/${newId}`);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-netflix-surface border border-white/10 rounded-lg shadow-cinema overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-netflix-red" />
            <h2 className="text-lg font-bold text-white">Create New Universe</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-netflix-gray hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-netflix-gray uppercase tracking-wider mb-1.5">
              Universe Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cyberpunk Cinema Society"
              className="w-full bg-netflix-card border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-netflix-gray uppercase tracking-wider mb-1.5">
              Description & Purpose
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell movie buffs what this universe is all about..."
              className="w-full bg-netflix-card border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-netflix-card border border-white/5">
            <div className="flex items-center space-x-2.5">
              {isPublic ? <Globe className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-yellow-400" />}
              <div>
                <p className="text-xs font-semibold text-white">{isPublic ? 'Public Universe' : 'Private Universe'}</p>
                <p className="text-[11px] text-netflix-muted">
                  {isPublic ? 'Anyone can discover and join this community' : 'Invite-only access with secure passcodes'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className="text-xs font-semibold text-netflix-red hover:underline"
            >
              Toggle
            </button>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-sm text-netflix-gray hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded bg-netflix-red hover:bg-netflix-redHover text-white text-sm font-bold shadow-glow-red transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Igniting Universe...' : 'Ignite Universe'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
