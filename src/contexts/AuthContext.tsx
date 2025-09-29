'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authService, progressService, Player } from '@/lib/supabase';

interface AuthContextType {
  user: Player | null;
  userProgress: Player | null;
  loading: boolean;
  signIn: (username: string, pin: string) => Promise<void>;
  signUp: (username: string, pin: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveProgress: (progress: Partial<Player>) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Player | null>(null);
  const [userProgress, setUserProgress] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on startup
    const stored = localStorage.getItem('current_player');
    if (stored) {
      try {
        const player = JSON.parse(stored);
        setUser(player);
        setUserProgress(player);
      } catch (error) {
        console.error('Error parsing stored player:', error);
        localStorage.removeItem('current_player');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, pin: string) => {
    try {
      setLoading(true);
      const { user: player } = await authService.signIn(username, pin);
      
      setUser(player);
      setUserProgress(player);
      localStorage.setItem('current_player', JSON.stringify(player));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, pin: string) => {
    try {
      setLoading(true);
      const { user: player } = await authService.signUp(username, pin);
      
      setUser(player);
      setUserProgress(player);
      localStorage.setItem('current_player', JSON.stringify(player));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setUserProgress(null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const saveProgress = async (progress: Partial<Player>) => {
    if (!user) return;
    
    try {
      await progressService.saveProgress(user.id, progress);
      
      // Update local state
      const updatedUser = { ...user, ...progress };
      setUser(updatedUser);
      setUserProgress(updatedUser);
      localStorage.setItem('current_player', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  const refreshProgress = async () => {
    if (!user) return;
    
    try {
      const updated = await progressService.loadProgress(user.id);
      if (updated) {
        setUser(updated);
        setUserProgress(updated);
        localStorage.setItem('current_player', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error refreshing progress:', error);
    }
  };

  const value = {
    user,
    userProgress,
    loading,
    signIn,
    signUp,
    signOut,
    saveProgress,
    refreshProgress,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}