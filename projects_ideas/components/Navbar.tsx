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
  const { user, profile, signOutUser, signInWithGoogle } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google One Click sign-in failed:', err);
      window.location.href = '/login?google=1';
    } finally {
      setIsSigningIn(false);
    }
  };

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
        <div className="flex items-center space-x-3 sm:space-x-4">
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
            className="flex items-center space-x-1.5 sm:space-x-2 bg-netflix-red hover:bg-netflix-redHover text-white px-3 sm:px-3.5 py-1.5 rounded text-xs font-semibold tracking-wide shadow-glow-red hover:scale-105 transition-all"
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

          {/* User Auth: Google One-Click OR Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 rounded hover:bg-white/5 transition-colors"
                title={profile.display_name}
              >
                <div className="relative">
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-8 h-8 rounded-full border-2 border-netflix-red/60 object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black" />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-netflix-gray hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-netflix-surface border border-white/10 rounded-lg shadow-cinema py-2 text-sm z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white truncate max-w-[150px]">{profile.display_name}</p>
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-mono">
                        Google
                      </span>
                    </div>
                    <p className="text-xs text-netflix-muted truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <div className="px-4 py-1.5 text-xs text-green-400 flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Zero-Drift Sync: Active</span>
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
                    <button
                      onClick={async () => {
                        await signOutUser();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors flex items-center space-x-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="flex items-center space-x-2 bg-white hover:bg-gray-100 disabled:opacity-50 text-black px-3.5 py-1.5 rounded-md text-xs font-bold shadow-md hover:scale-105 transition-all"
              title="1-Click Sign In with Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.25C.45 8.22 0 10.06 0 12s.45 3.78 1.25 5.39l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span className="hidden sm:inline">
                {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
              </span>
              <span className="sm:hidden">
                {isSigningIn ? '...' : 'Google'}
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
