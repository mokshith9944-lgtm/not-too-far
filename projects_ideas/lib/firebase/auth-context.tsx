'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './config';
import { Profile } from '@/lib/types';
import { CURRENT_USER } from '@/lib/mock-data';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  loginAsGuest: (name?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile>(CURRENT_USER);
  const [loading, setLoading] = useState(true);

  // Helper to map Firebase User to application Profile
  const mapFirebaseUserToProfile = (fbUser: FirebaseUser): Profile => {
    const rawUsername = fbUser.email ? fbUser.email.split('@')[0] : 'cinephile';
    const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');

    return {
      id: fbUser.uid,
      username: cleanUsername,
      display_name: fbUser.displayName || rawUsername,
      avatar_url:
        fbUser.photoURL ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
      bio: 'Cinema explorer & streaming sync pioneer.',
      status: 'online',
      custom_status: 'Streaming together 🎬',
      created_at: fbUser.metadata.creationTime || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  useEffect(() => {
    // Check if a guest user was saved in localStorage
    if (typeof window !== 'undefined') {
      const savedGuest = localStorage.getItem('ntf_guest_user');
      if (savedGuest) {
        try {
          setProfile(JSON.parse(savedGuest));
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    // Subscribe to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const mapped = mapFirebaseUserToProfile(fbUser);
        setProfile(mapped);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ntf_guest_user');
        }
      } else {
        setUser(null);
        // If not signed in via Firebase, keep guest profile or default
        const savedGuest = typeof window !== 'undefined' ? localStorage.getItem('ntf_guest_user') : null;
        if (savedGuest) {
          setProfile(JSON.parse(savedGuest));
        } else {
          setProfile(CURRENT_USER);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      setUser(result.user);
      const mapped = mapFirebaseUserToProfile(result.user);
      setProfile(mapped);
    }
  };

  const handleSignInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      setUser(result.user);
      const mapped = mapFirebaseUserToProfile(result.user);
      setProfile(mapped);
    }
  };

  const handleSignUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      if (displayName) {
        await updateProfile(result.user, {
          displayName,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${result.user.uid}`,
        });
      }
      setUser(result.user);
      const mapped = mapFirebaseUserToProfile(result.user);
      if (displayName) mapped.display_name = displayName;
      setProfile(mapped);
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setProfile(CURRENT_USER);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ntf_guest_user');
    }
  };

  const loginAsGuest = (name: string = 'Alex Vance') => {
    const guest: Profile = {
      ...CURRENT_USER,
      id: `guest-${Date.now()}`,
      display_name: name,
      username: name.toLowerCase().replace(/\s+/g, '_'),
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`,
    };
    setUser(null);
    setProfile(guest);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ntf_guest_user', JSON.stringify(guest));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: isFirebaseConfigured,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        signOutUser: handleSignOut,
        loginAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
