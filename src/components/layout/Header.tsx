'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGameStore } from '@/store/gameStore';
import { LoginModal } from '@/components/ui/LoginModal';
import { Leaderboard } from '@/components/ui/Leaderboard';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import styles from '@/styles/Header.module.css';

export default function Header() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { user, signOut, saveProgress } = useAuth();
  const { 
    balance, 
    level, 
    experience, 
    experienceToNext,
    totalSpins,
    biggestWin,
    soundEnabled,
    toggleSound,
    getProgressForSync,
    loadUserProgress,
    isLoggedIn
  } = useGameStore();

  const progress = (experience / experienceToNext) * 100;

  // Sync game progress to database when user is logged in
  React.useEffect(() => {
    if (user && isLoggedIn) {
      const gameProgress = getProgressForSync();
      
      // Check if we need to sync (significant changes)
      const shouldSync = 
        Math.abs(gameProgress.balance - user.balance) > 100 ||
        gameProgress.level > user.level ||
        gameProgress.biggest_win > user.biggest_win ||
        gameProgress.total_spins > user.total_spins + 10;
      
      if (shouldSync) {
        saveProgress(gameProgress).catch(console.error);
      }
    }
  }, [balance, level, totalSpins, biggestWin, user, isLoggedIn]);

  // Load user progress when user logs in (only once)
  React.useEffect(() => {
    if (user && !isLoggedIn) {
      // User just logged in, load their progress from database
      loadUserProgress(user);
    }
  }, [user?.id]); // Only trigger on user ID change

  const handleSignOut = async () => {
    try {
      // Save final progress before signing out
      if (user) {
        await saveProgress(getProgressForSync());
      }
      
      // Clear game store auth state
      const { signOut: gameSignOut } = useGameStore.getState();
      gameSignOut();
      
      // Sign out from auth context
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleToggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  const handleToggleLogin = () => {
    setShowLoginModal(!showLoginModal);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Left: Home & Logo */}
          <div className={styles.left}>
            <button
              onClick={() => router.push('/')}
              className={styles.homeButton}
              title="Home"
            >
              🏠
            </button>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>⚡</span>
              <span className={styles.logoText}>Lightning Slots™</span>
            </div>
          </div>

          {/* Center: Balance */}
          <div className={styles.center}>
            <div className={styles.balance}>
              <span className={styles.balanceLabel}>Balance</span>
              <span className={styles.balanceAmount}>${balance.toFixed(2)}</span>
            </div>
          </div>

          {/* Right: Level & Controls */}
          <div className={styles.right}>
            <div className={styles.level}>
              <span className={styles.levelLabel}>Lvl {level}</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            {/* Auth & Controls - FIXED BUTTONS */}
            <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user ? (
                <>
                  <button
                    onClick={handleSignOut}
                    className="header-btn header-btn-red"
                    title={`Sign out ${user.username}`}
                  >
                    👤
                  </button>
                  <button
                    onClick={handleToggleLeaderboard}
                    className="header-btn header-btn-purple"
                    title="Leaderboard"
                  >
                    🏆
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleToggleLogin}
                    className="header-btn header-btn-blue"
                    title="Sign In"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleToggleLeaderboard}
                    className="header-btn header-btn-purple"
                    title="Leaderboard"
                  >
                    🏆
                  </button>
                </>
              )}
              
              <button
                onClick={toggleSound}
                className={styles.soundButton}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>
            </div>
          </div>
        </div>

        {/* User Status Bar (Mobile) */}
        {user && (
          <motion.div 
            className="bg-black/20 border-t border-white/10 px-4 py-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex justify-between items-center text-xs text-gray-300">
              <span>Welcome, {user.username}</span>
              <div className="flex gap-4">
                <span>🎯 {totalSpins} spins</span>
                <span>💎 ${biggestWin.toLocaleString()} best</span>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Guest Warning Bar */}
        {!user && (
          <motion.div 
            className="bg-yellow-900/30 border-t border-yellow-500/20 px-4 py-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="text-center text-xs text-yellow-300">
              ⚠️ Playing as Guest - Progress won't be saved
            </div>
          </motion.div>
        )}
      </header>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      <Modal 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)}
        title=""
      >
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      </Modal>
    </>
  );
}