'use client';

// ============================================
// ROYAL JACKPOT - Game Page
// Premium slot machine gaming experience
// ============================================

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import SlotMachine from '@/components/game/SlotMachine';
import BettingControls from '@/components/game/BettingControls';
import { useGameStore } from '@/store/gameStore';
import styles from './game.module.scss';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Floating coin particle
const FloatingCoin = ({ delay }: { delay: number }) => (
  <motion.div
    className={styles.floatingCoin}
    initial={{ y: '100vh', x: Math.random() * 100 - 50, opacity: 0 }}
    animate={{
      y: '-100vh',
      opacity: [0, 1, 1, 0],
      rotate: [0, 360, 720],
    }}
    transition={{
      duration: 8 + Math.random() * 4,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    💰
  </motion.div>
);

export default function GamePage() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    lastResult,
    totalSpins,
    totalWins,
    biggestWin,
  } = useGameStore();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Confetti effect for big wins
  useEffect(() => {
    if (lastResult && (lastResult.isBigWin || lastResult.isMegaWin || lastResult.isJackpot)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [lastResult]);

  // Generate floating coins
  const floatingCoins = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 2,
  }));

  return (
    <div className={styles.gameContainer}>
      {/* Background Effects */}
      <div className={styles.backgroundEffects}>
        {floatingCoins.map(coin => (
          <FloatingCoin key={coin.id} delay={coin.delay} />
        ))}
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={300}
            gravity={0.15}
            colors={['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6']}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.gameLayout}>
          {/* Left Stats Panel (Desktop) */}
          <aside className={styles.statsPanel}>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🎰</span>
              <span className={styles.statLabel}>Total Spins</span>
              <span className={styles.statValue}>{totalSpins.toLocaleString()}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>🏆</span>
              <span className={styles.statLabel}>Total Wins</span>
              <span className={styles.statValue}>{totalWins.toLocaleString()}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>💎</span>
              <span className={styles.statLabel}>Biggest Win</span>
              <span className={styles.statValue}>${biggestWin.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>📊</span>
              <span className={styles.statLabel}>Win Rate</span>
              <span className={styles.statValue}>
                {totalSpins > 0 ? ((totalWins / totalSpins) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </aside>

          {/* Center Game Area */}
          <div className={styles.gameArea}>
            {/* Slot Machine */}
            <SlotMachine />

            {/* Betting Controls */}
            <div className={styles.controlsWrapper}>
              <BettingControls />
            </div>
          </div>

          {/* Right Panel (Desktop) - Paytable Preview */}
          <aside className={styles.paytablePanel}>
            <div className={styles.paytableHeader}>
              <span className={styles.paytableIcon}>📋</span>
              <span className={styles.paytableTitle}>Paytable</span>
            </div>
            <div className={styles.paytableList}>
              <div className={styles.paytableItem}>
                <span className={styles.paytableSymbol}>👑</span>
                <span className={styles.paytableName}>Crown (Wild)</span>
                <span className={styles.paytablePay}>1000x</span>
              </div>
              <div className={styles.paytableItem}>
                <span className={styles.paytableSymbol}>💎</span>
                <span className={styles.paytableName}>Diamond</span>
                <span className={styles.paytablePay}>500x</span>
              </div>
              <div className={styles.paytableItem}>
                <span className={styles.paytableSymbol}>7️⃣</span>
                <span className={styles.paytableName}>Lucky 7</span>
                <span className={styles.paytablePay}>300x</span>
              </div>
              <div className={styles.paytableItem}>
                <span className={styles.paytableSymbol}>🏆</span>
                <span className={styles.paytableName}>Trophy</span>
                <span className={styles.paytablePay}>200x</span>
              </div>
              <div className={styles.paytableItem}>
                <span className={styles.paytableSymbol}>🔔</span>
                <span className={styles.paytableName}>Bell</span>
                <span className={styles.paytablePay}>100x</span>
              </div>
            </div>
            <div className={styles.paytableNote}>
              <p>25 Paylines | 3+ to win</p>
              <p>Crown substitutes for all</p>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Stats Bar */}
      <div className={styles.mobileStats}>
        <div className={styles.mobileStat}>
          <span>🎰</span>
          <span>{totalSpins}</span>
        </div>
        <div className={styles.mobileStat}>
          <span>🏆</span>
          <span>{totalWins}</span>
        </div>
        <div className={styles.mobileStat}>
          <span>💎</span>
          <span>${biggestWin.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
