'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Film,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check,
  AlertCircle,
  Key,
  Info,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    profile,
    isConfigured,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loginAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfigHelper, setShowConfigHelper] = useState(false);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await signInWithGoogle();
      setSuccessMessage('Successfully signed in with Google!');
      setTimeout(() => router.push('/'), 600);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(
          'Unauthorized domain: Please add "localhost" to Authorized Domains in your Firebase Console (Authentication > Settings > Authorized domains).'
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google Sign-In popup was closed before completion.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Another sign-in popup is already open.');
      } else {
        setErrorMessage(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName || undefined);
        setSuccessMessage('Account created successfully! Welcome to Not Too Far.');
      } else {
        await signInWithEmail(email, password);
        setSuccessMessage('Welcome back! Loading your universes...');
      }
      setTimeout(() => router.push('/'), 600);
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email. Switch to Create Account.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('Password must be at least 6 characters long.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage(err.message || 'Authentication error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest(displayName || 'Alex Vance');
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

        {/* Firebase Config Status Indicator */}
        <div className="flex items-center space-x-2">
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border backdrop-blur-md ${
              isConfigured
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'
              }`}
            />
            <span>{isConfigured ? 'Firebase: Connected' : 'Firebase: Demo/Test Mode'}</span>
          </span>
        </div>
      </header>

      {/* Auth Card Center */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-netflix-base/95 border border-white/10 rounded-xl p-8 sm:p-10 shadow-cinema backdrop-blur-xl space-y-6">
          {/* Title & Mode Switcher */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {mode === 'signup' ? 'Create Cinephile Account' : 'Sign In to Stream'}
            </h1>
            <p className="text-xs text-netflix-gray">
              Co-watch movies and synchronized streams in zero-drift rooms.
            </p>
          </div>

          {/* Social Auth Providers (Google) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow-md hover:scale-[1.01]"
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
              <span>{isLoading ? 'Connecting...' : 'Continue with Google (Firebase Auth)'}</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-netflix-base px-3 text-[11px] text-netflix-muted uppercase font-mono">
              Or with Email &amp; Password
            </span>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded bg-green-500/10 border border-green-500/30 text-xs text-green-400 flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-netflix-gray uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-netflix-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., Sarah Connor"
                    className="w-full bg-netflix-surface border border-white/10 rounded px-3 pl-9 py-2 text-xs text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
                  />
                </div>
              </div>
            )}

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
                  placeholder="name@cinema.com"
                  className="w-full bg-netflix-surface border border-white/10 rounded px-3 pl-9 py-2 text-xs text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-netflix-gray uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-netflix-muted absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-netflix-surface border border-white/10 rounded px-3 pl-9 py-2 text-xs text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded bg-netflix-red hover:bg-netflix-redHover disabled:opacity-50 text-white text-xs font-bold shadow-glow-red transition-all flex items-center justify-center space-x-1.5"
            >
              <span>
                {isLoading
                  ? 'Authenticating...'
                  : mode === 'signup'
                  ? 'Create Firebase Account'
                  : 'Sign In (Firebase)'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Sign In & Sign Up */}
          <div className="text-center pt-1">
            {mode === 'signin' ? (
              <p className="text-xs text-netflix-gray">
                New to Not Too Far?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage('');
                  }}
                  className="text-white hover:text-netflix-red font-semibold underline ml-1"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-netflix-gray">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage('');
                  }}
                  className="text-white hover:text-netflix-red font-semibold underline ml-1"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>

          {/* Instant Guest / Demo Mode Button */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2 rounded bg-netflix-card hover:bg-white/10 border border-white/10 text-xs font-semibold text-netflix-gray hover:text-white transition-colors flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-netflix-gold" />
              <span>Instant Guest Mode ({profile.display_name})</span>
            </button>

            {/* Collapsible Firebase Environment Helper */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowConfigHelper(!showConfigHelper)}
                className="w-full flex items-center justify-between text-[11px] text-netflix-muted hover:text-netflix-gray transition-colors"
              >
                <span className="flex items-center gap-1 font-mono">
                  <Key className="w-3 h-3 text-netflix-red" />
                  <span>How to connect your live Firebase project</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transform transition-transform ${
                    showConfigHelper ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showConfigHelper && (
                <div className="mt-2 p-3 rounded bg-black/60 border border-white/10 text-[11px] text-netflix-gray space-y-2 font-mono">
                  <p className="text-white font-semibold">Add to your .env.local:</p>
                  <pre className="text-[10px] text-green-400 bg-black p-2 rounded overflow-x-auto select-all">
{`NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:12345:web:abcdef`}
                  </pre>
                  <p className="text-netflix-muted text-[10px]">
                    Google Sign-In requires "Google" enabled under Firebase Console &gt; Authentication &gt; Sign-in method, with "localhost" listed under Authorized domains.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-netflix-muted">
        <span>Protected by Firebase Authentication with Google Identity Provider &amp; Secure Token Handlers.</span>
      </footer>
    </div>
  );
}
