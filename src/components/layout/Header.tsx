'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import styles from '@/styles/Header.module.css';

export default function Header() {
  const router = useRouter();
  const { 
    balance, 
    level, 
    experience, 
    experienceToNext,
    soundEnabled,
    toggleSound,
  } = useGameStore();

  const progress = (experience / experienceToNext) * 100;

  return (
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

        {/* Right: Level & Sound */}
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
          <button
            onClick={toggleSound}
            className={styles.soundButton}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </header>
  );
}