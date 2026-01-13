'use client';

// ============================================
// ROYAL JACKPOT - Header Component
// Premium navigation with balance & user info
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import AuthModal from '@/components/ui/AuthModal';
import styles from './Header.module.scss';

export default function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const {
    balance,
    level,
    experience,
    experienceToNextLevel,
    isLoggedIn,
    player,
    soundEnabled,
    turboMode,
    toggleSound,
    toggleTurbo,
    login,
    logout,
  } = useGameStore();

  const xpProgress = (experience / experienceToNextLevel) * 100;

  const handleAuthSuccess = (user: { username: string; id: string }) => {
    login({
      id: user.id,
      username: user.username,
      pinHash: '',
      balance: 1000,
      level: 1,
      experience: 0,
      totalSpins: 0,
      totalWins: 0,
      totalWagered: 0,
      biggestWin: 0,
      currentStreak: 0,
      bestStreak: 0,
      achievements: [],
      vipTier: 'bronze',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    });
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
    setShowMenu(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Logo */}
          <div className={styles.logo}>
            <span className={styles.logoIcon}>👑</span>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>ROYAL</span>
              <span className={styles.logoSubtitle}>JACKPOT</span>
            </div>
          </div>

          {/* Stats Bar (Desktop) */}
          <div className={styles.statsBar}>
            {/* Level */}
            <div className={styles.levelBadge}>
              <span className={styles.levelLabel}>LVL</span>
              <span className={styles.levelValue}>{level}</span>
              <div className={styles.xpBar}>
                <motion.div
                  className={styles.xpFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Balance */}
            <div className={styles.balanceBox}>
              <span className={styles.balanceLabel}>BALANCE</span>
              <motion.span
                className={styles.balanceValue}
                key={balance}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </motion.span>
            </div>
          </div>

          {/* Right Section */}
          <div className={styles.rightSection}>
            {/* Settings Buttons */}
            <div className={styles.settingsButtons}>
              <motion.button
                className={`${styles.iconButton} ${soundEnabled ? styles.active : ''}`}
                onClick={toggleSound}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={soundEnabled ? 'Sound On' : 'Sound Off'}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </motion.button>
              <motion.button
                className={`${styles.iconButton} ${turboMode ? styles.active : ''}`}
                onClick={toggleTurbo}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={turboMode ? 'Turbo On' : 'Turbo Off'}
              >
                ⚡
              </motion.button>
            </div>

            {/* User Section */}
            {isLoggedIn && player ? (
              <div className={styles.userSection}>
                <button
                  className={styles.userButton}
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <span className={styles.userAvatar}>
                    {player.username.charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.username}>{player.username}</span>
                  <span className={styles.chevron}>▼</span>
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      className={styles.userMenu}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className={styles.menuHeader}>
                        <span className={styles.menuUsername}>{player.username}</span>
                        <span className={styles.menuLevel}>Level {level}</span>
                      </div>
                      <div className={styles.menuDivider} />
                      <button className={styles.menuItem} onClick={handleLogout}>
                        <span>🚪</span>
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                className={styles.loginButton}
                onClick={() => setShowAuthModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>

        {/* Mobile Balance Bar */}
        <div className={styles.mobileBar}>
          <div className={styles.mobileLevel}>
            <span>LVL {level}</span>
            <div className={styles.mobileXpBar}>
              <div className={styles.mobileXpFill} style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
          <div className={styles.mobileBalance}>
            <span className={styles.mobileBalanceLabel}>$</span>
            <span className={styles.mobileBalanceValue}>
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
