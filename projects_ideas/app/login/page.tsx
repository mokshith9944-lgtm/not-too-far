'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  CheckCircle2,
  LogOut
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
    signOutUser,
    loginAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAlternativeAuth, setShowAlternativeAuth] = useState(false);

  // Auto trigger Google sign-in if requested in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('google') === '1' && !user) {
        handleGoogleSignIn();
      }
    }
  }, [user]);

  // Handle Google 1-Click Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await signInWithGoogle();
      setSuccessMessage('Successfully authenticated with Google!');
      setTimeout(() => router.push('/'), 700);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(
          'Firebase Domain Authorization Notice: To allow Google OAuth on this domain, add "not-too-far.vercel.app" to Firebase Console > Authentication > Settings > Authorized domains. You can also click below to enter instantly!'
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google Sign-In window was closed. Click Continue with Google to try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('A Google Sign-In request is already in progress.');
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
        setSuccessMessage('Welcome back! Loading cinema rooms...');
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
    loginAsGuest(displayName || 'Cinephile Explorer');
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

        {/* Live Authentication Badge */}
        <div className="flex items-center space-x-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border backdrop-blur-md bg-green-500/20 text-green-400 border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Google 1-Click Auth: Active</span>
          </span>
        </div>
      </header>

      {/* Auth Card Center */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-netflix-base/95 border border-white/10 rounded-2xl p-8 sm:p-10 shadow-cinema backdrop-blur-xl space-y-6">
          {/* Active User Card (if already logged in) */}
          {user ? (
            <div className="text-center space-y-5">
              <div className="relative inline-block mx-auto">
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-20 h-20 rounded-full border-4 border-netflix-red shadow-glow-red object-cover mx-auto"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Welcome back!</h2>
                <p className="text-base font-semibold text-netflix-red">{profile.display_name}</p>
                <p className="text-xs text-netflix-muted font-mono">{user.email}</p>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full py-3 rounded-lg bg-netflix-red hover:bg-netflix-redHover text-white font-bold text-xs tracking-wider shadow-glow-red transition-all flex items-center justify-center space-x-2"
                >
                  <span>Enter Cinema Lounge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={signOutUser}
                  className="w-full py-2 rounded-lg bg-netflix-card hover:bg-white/10 border border-white/10 text-xs font-semibold text-netflix-gray hover:text-white transition-colors flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Account / Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header Title */}
              <div className="text-center space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Sign In to Stream
                </h1>
                <p className="text-xs text-netflix-gray">
                  Ultra-low latency cinema co-watching with your friends.
                </p>
              </div>

              {/* HERO PRIMARY ACTION: GOOGLE 1-CLICK AUTH */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-extrabold text-sm transition-all flex items-center justify-center space-x-3 shadow-lg hover:scale-[1.02] border border-white"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                  <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google (1-Click)'}</span>
                </button>

                <p className="text-[11px] text-center text-netflix-muted">
                  Instant login. No password required.
                </p>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 space-y-2">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full py-1.5 rounded bg-netflix-red/20 hover:bg-netflix-red text-white text-xs font-semibold border border-netflix-red/40 transition-colors"
                  >
                    Enter Instantly as Guest
                  </button>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-xs text-green-400 flex items-center space-x-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Secondary Accordion: Alternative Sign In / Guest */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAlternativeAuth(!showAlternativeAuth)}
                  className="w-full flex items-center justify-between text-xs text-netflix-gray hover:text-white py-1 transition-colors"
                >
                  <span>Other sign-in options (Email or Guest)</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transform transition-transform ${
                      showAlternativeAuth ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showAlternativeAuth && (
                  <div className="pt-4 space-y-4">
                    {/* Instant Guest */}
                    <button
                      type="button"
                      onClick={handleGuestLogin}
                      className="w-full py-2.5 rounded-lg bg-netflix-card hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-netflix-gold" />
                      <span>Instant Guest Mode (Zero Login)</span>
                    </button>

                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-white/10 w-full" />
                      <span className="bg-netflix-base px-2 text-[10px] text-netflix-muted uppercase font-mono">
                        Or Email
                      </span>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-3">
                      {mode === 'signup' && (
                        <div>
                          <label className="block text-[10px] font-semibold text-netflix-gray uppercase tracking-wider mb-1">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your Name"
                            className="w-full bg-netflix-surface border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-semibold text-netflix-gray uppercase tracking-wider mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@cinema.com"
                          className="w-full bg-netflix-surface border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-netflix-gray uppercase tracking-wider mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-netflix-surface border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-netflix-muted focus:outline-none focus:border-netflix-red"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 rounded bg-netflix-card hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
                      >
                        {mode === 'signup' ? 'Create Account' : 'Sign In with Email'}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                          className="text-[11px] text-netflix-gray hover:text-white underline"
                        >
                          {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-netflix-muted">
        <span>Protected with Google Identity Provider &amp; Zero-Drift Video Sync Architecture.</span>
      </footer>
    </div>
  );
}
