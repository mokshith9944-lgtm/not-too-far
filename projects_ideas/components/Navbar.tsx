'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Film,
  Compass,
  Users,
  Radio,
  PlusCircle,
  Bell,
  Search,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Shield,
  Volume2,
  LogOut,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

interface NavbarProps {
  onOpenCreateRoom?: () => void;
  onOpenCreateUniverse?: () => void;
}

export default function Navbar({ onOpenCreateRoom, onOpenCreateUniverse }: NavbarProps) {
  const pathname = usePathname();
  const { user, profile, signOutUser } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: Film },
    { name: 'Universes', href: '/universes', icon: Compass },
    { name: 'Live Parties', href: '/#live-rooms', icon: Radio },
    { name: 'Extension Bridge', href: '/extension-bridge', icon: ExternalLink },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-netflix-dark/95 backdrop-blur-md border-b border-white/10 shadow-cinema py-3'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded bg-netflix-red flex items-center justify-center shadow-glow-red group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wider text-netflix-red uppercase drop-shadow-md">
                NOT TOO FAR
              </span>
              <span className="text-[9px] uppercase tracking-widest text-netflix-gray -mt-1 font-semibold">
                Sync Cinema Engine
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-white ${
                    isActive ? 'text-white font-semibold' : 'text-netflix-gray'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          {/* Quick Search */}
          <div className="hidden lg:flex items-center relative">
            <Search className="w-4 h-4 text-netflix-muted absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search movies, rooms, or orbits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-netflix-surface/80 border border-white/10 text-xs rounded-full pl-9 pr-4 py-1.5 w-60 text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red focus:ring-1 focus:ring-netflix-red transition-all"
            />
          </div>

          {/* Start Watch Party CTA */}
          <button
            onClick={onOpenCreateRoom}
            className="flex items-center space-x-2 bg-netflix-red hover:bg-netflix-redHover text-white px-3.5 py-1.5 rounded text-xs font-semibold tracking-wide shadow-glow-red hover:scale-105 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Party</span>
          </button>

          {/* New Universe CTA */}
          <button
            onClick={onOpenCreateUniverse}
            className="hidden sm:flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white px-3 py-1.5 rounded text-xs font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-netflix-red" />
            <span>New Universe</span>
          </button>

          {/* Notifications */}
          <button className="p-2 text-netflix-gray hover:text-white relative rounded-full hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-netflix-red rounded-full animate-pulse" />
          </button>

          {/* User Profile avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 rounded hover:bg-white/5 transition-colors"
            >
              <div className="relative">
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-8 h-8 rounded border border-white/20 object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black" />
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-netflix-gray hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-netflix-surface border border-white/10 rounded-md shadow-cinema py-2 text-sm z-50">
                <div className="px-4 py-2 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white truncate max-w-[140px]">{profile.display_name}</p>
                    {user ? (
                      <span className="text-[10px] bg-netflix-red/20 text-netflix-red px-1.5 py-0.5 rounded font-mono">Firebase</span>
                    ) : (
                      <span className="text-[10px] bg-white/10 text-netflix-gray px-1.5 py-0.5 rounded font-mono">Guest</span>
                    )}
                  </div>
                  <p className="text-xs text-netflix-muted truncate">
                    {user?.email || `@${profile.username}`}
                  </p>
                </div>
                <div className="py-1">
                  <div className="px-4 py-1.5 text-xs text-green-400 flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Realtime Presence: Active</span>
                  </div>
                  <Link
                    href="/universes"
                    className="block px-4 py-2 hover:bg-white/5 text-netflix-gray hover:text-white transition-colors text-xs"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Universes
                  </Link>
                  <Link
                    href="/extension-bridge"
                    className="block px-4 py-2 hover:bg-white/5 text-netflix-gray hover:text-white transition-colors text-xs"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Extension Companion
                  </Link>
                </div>
                <div className="border-t border-white/10 pt-1 mt-1">
                  {user ? (
                    <button
                      onClick={async () => {
                        await signOutUser();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out (Firebase)</span>
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-xs text-netflix-red hover:bg-white/5 transition-colors flex items-center space-x-1.5"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In with Google / Email</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
