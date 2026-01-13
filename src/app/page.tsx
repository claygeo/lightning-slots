'use client';

// ============================================
// ROYAL JACKPOT - Landing Page
// Premium casino entry experience
// ============================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from './page.module.scss';

// Floating particle component
const FloatingParticle = ({ delay, duration, left }: { delay: number; duration: number; left: number }) => (
  <motion.div
    className={styles.particle}
    initial={{ y: '100vh', opacity: 0, rotate: 0 }}
    animate={{
      y: '-100vh',
      opacity: [0, 1, 1, 0],
      rotate: 720,
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
    style={{ left: `${left}%` }}
  />
);

// Jackpot counter animation
const JackpotCounter = () => {
  const [value, setValue] = useState(2847593.42);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => prev + Math.random() * 10);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.jackpotCounter}>
      <span className={styles.jackpotLabel}>PROGRESSIVE JACKPOT</span>
      <motion.span
        className={styles.jackpotValue}
        key={Math.floor(value)}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.1 }}
      >
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </motion.span>
    </div>
  );
};

// Slot reel preview
const SlotPreview = () => {
  const symbols = ['👑', '💎', '7️⃣', '🏆', '🔔', '🍒', '🍋', '🍇'];
  const [reelSymbols, setReelSymbols] = useState<string[][]>([
    ['👑', '💎', '7️⃣'],
    ['👑', '💎', '7️⃣'],
    ['👑', '💎', '7️⃣'],
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReelSymbols(prev => prev.map(reel =>
        reel.map(() => symbols[Math.floor(Math.random() * symbols.length)])
      ));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.slotPreview}>
      {reelSymbols.map((reel, i) => (
        <div key={i} className={styles.previewReel}>
          {reel.map((symbol, j) => (
            <motion.div
              key={`${i}-${j}-${symbol}`}
              className={styles.previewSymbol}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 + j * 0.05 }}
            >
              {symbol}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/game');
    }, 800);
  };

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 10,
    left: Math.random() * 100,
  }));

  return (
    <main className={styles.main}>
      {/* Background effects */}
      <div className={styles.backgroundEffects}>
        {particles.map(p => (
          <FloatingParticle key={p.id} {...p} />
        ))}
      </div>

      {/* Radial glow */}
      <div className={styles.radialGlow} />

      {/* Content */}
      <div className={styles.content}>
        {/* Logo */}
        <motion.div
          className={styles.logoContainer}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className={styles.crown}>👑</div>
          <h1 className={styles.title}>
            <span className={styles.royal}>ROYAL</span>
            <span className={styles.jackpot}>JACKPOT</span>
          </h1>
          <p className={styles.tagline}>Premium Casino Experience</p>
        </motion.div>

        {/* Jackpot Counter */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <JackpotCounter />
        </motion.div>

        {/* Slot Preview */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <SlotPreview />
        </motion.div>

        {/* Features */}
        <motion.div
          className={styles.features}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎰</span>
            <span className={styles.featureText}>25 Paylines</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>💎</span>
            <span className={styles.featureText}>Free Spins</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🏆</span>
            <span className={styles.featureText}>10,000x Max Win</span>
          </div>
        </motion.div>

        {/* Play Button */}
        <motion.div
          className={styles.buttonContainer}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <motion.button
            className={styles.playButton}
            onClick={handlePlay}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={styles.loader}
                >
                  <span className={styles.spinner} />
                </motion.span>
              ) : (
                <motion.span
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  PLAY NOW
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <p className={styles.bonusText}>Start with 1,000 FREE Credits!</p>
        </motion.div>

        {/* Footer info */}
        <motion.div
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p>96% RTP | Play Responsibly | 18+</p>
        </motion.div>
      </div>
    </main>
  );
}
