'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import styles from '@/styles/Home.module.css';

export default function HomePage() {
  const router = useRouter();
  const { loadSavedState } = useGameStore();

  useEffect(() => {
    loadSavedState();
  }, [loadSavedState]);

  const handlePlayNow = () => {
    router.push('/game');
  };

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.backgroundEffects}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>

      {/* Main Content */}
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className={styles.logoSection}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className={styles.logoIcon}>⚡</div>
          <h1 className={styles.logoTitle}>Lightning</h1>
          <h2 className={styles.logoSubtitle}>SLOTS™</h2>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Experience the Thrill of Lightning Wins!
        </motion.p>

        {/* Features Grid */}
        <motion.div
          className={styles.features}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎰</div>
            <div className={styles.featureTitle}>5x3 Reels</div>
            <div className={styles.featureValue}>20 Paylines</div>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <div className={styles.featureTitle}>Lightning Round</div>
            <div className={styles.featureValue}>10x Multiplier</div>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏆</div>
            <div className={styles.featureTitle}>Progressive</div>
            <div className={styles.featureValue}>Level System</div>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💰</div>
            <div className={styles.featureTitle}>Max Win</div>
            <div className={styles.featureValue}>5000x Bet</div>
          </div>
        </motion.div>

        {/* Play Button */}
        <motion.button
          onClick={handlePlayNow}
          className={styles.playButton}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          PLAY NOW
        </motion.button>

        {/* Demo Notice */}
        <motion.div
          className={styles.demoNotice}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>🎮 Demo Mode: 1000 Free Credits</p>
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <div className={styles.floatingElements}>
        <motion.div
          className={styles.float1}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🎰
        </motion.div>
        
        <motion.div
          className={styles.float2}
          animate={{
            y: [0, 20, 0],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          💎
        </motion.div>
        
        <motion.div
          className={styles.float3}
          animate={{
            y: [0, -15, 0],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ⚡
        </motion.div>
        
        <motion.div
          className={styles.float4}
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          7️⃣
        </motion.div>
      </div>
    </div>
  );
}