'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Film, Mail, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { CURRENT_USER } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleInstantDemoLogin = () => {
    router.push('/');
  };

  return (
    <div className="relative min-h-screen bg-netflix-dark flex flex-col justify-between overflow-hidden select-none">
      {/* Background Poster Collage with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80"
          alt="Cinematic Background"
          className="w-full h-full object-cover filter brightness-25 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-base via-netflix-base/70 to-black/80" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-netflix-red flex items-center justify-center shadow-glow-red">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-netflix-red uppercase">
            NOT TOO FAR
          </span>
        </Link>
      </header>

      {/* Auth Card Center */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-netflix-base/90 border border-white/10 rounded-xl p-8 sm:p-10 shadow-cinema backdrop-blur-xl space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Sign In to Stream
            </h1>
            <p className="text-xs text-netflix-gray">
              Co-watch movies and synchronized streams in zero-drift rooms.
            </p>
          </div>

          {/* Social Auth Providers */}
          <div className="space-y-3">
            <button
              onClick={handleInstantDemoLogin}
              className="w-full py-2.5 px-4 rounded-md bg-white hover:bg-gray-100 text-black font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            <button
              onClick={handleInstantDemoLogin}
              className="w-full py-2.5 px-4 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.88c.61-.74 1.02-1.77.9-2.8-.88.04-1.95.59-2.58 1.33-.55.64-.99 1.68-.86 2.68.98.08 1.93-.47 2.54-1.21z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-netflix-base px-3 text-[11px] text-netflix-muted uppercase font-mono">
              Or passwordless link
            </span>
          </div>

          {/* Magic Link Form */}
          {isSubmitted ? (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 mx-auto flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-white">Magic Link Dispatched!</p>
              <p className="text-[11px] text-netflix-gray">
                Check your inbox at <span className="text-white font-mono">{email}</span>. Click the link to enter immediately.
              </p>
              <button
                onClick={handleInstantDemoLogin}
                className="mt-2 text-xs font-bold text-netflix-red hover:underline"
              >
                Or Continue Directly to App &rarr;
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-netflix-gray uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-netflix-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-netflix-surface border border-white/10 rounded px-3 pl-9 py-2 text-xs text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded bg-netflix-red hover:bg-netflix-redHover text-white text-xs font-bold shadow-glow-red transition-all flex items-center justify-center space-x-1.5"
              >
                <span>{isLoading ? 'Sending Link...' : 'Send Magic Sign-In Link'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Instant Guest Mode CTA */}
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={handleInstantDemoLogin}
              className="w-full py-2 rounded bg-netflix-card hover:bg-white/10 border border-white/10 text-xs font-semibold text-netflix-gray hover:text-white transition-colors flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-netflix-gold" />
              <span>Explore as Guest Cinephile ({CURRENT_USER.display_name})</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-netflix-muted">
        <span>Protected by Supabase Auth with Row Level Security &amp; End-to-End Session Cookies.</span>
      </footer>
    </div>
  );
}
