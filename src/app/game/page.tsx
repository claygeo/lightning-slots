'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import SlotMachine from '@/components/game/SlotMachine';
import BettingControls from '@/components/ui/BettingControls';
import PowerMeter from '@/components/game/PowerMeter';
import LightningRound from '@/components/game/LightningRound';
import AchievementPopup from '@/components/ui/AchievementPopup';
import WinDisplay from '@/components/game/WinDisplay';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/styles/Game.module.css';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function GamePage() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWin, setShowWin] = useState(false);
  
  const {
    balance,
    bet,
    isSpinning,
    isLightningRound,
    lastWin,
    powerMeter,
    spin,
  } = useGameStore();

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (lastWin && lastWin.totalWin > 0) {
      setShowWin(true);
      
      if (lastWin.isBigWin || lastWin.isJackpot) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      // Hide win display after 3 seconds
      setTimeout(() => setShowWin(false), 3000);
    }
  }, [lastWin]);

  const handleSpin = () => {
    if (!isSpinning && balance >= bet) {
      setShowWin(false); // Hide any existing win display
      spin();
    }
  };

  return (
    <div className={styles.gameContainer}>
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
          colors={['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB']}
        />
      )}

      {/* Compact Header */}
      <Header />

      {/* Main Game Area */}
      <main className={styles.mainContent}>
        {/* Win Display Overlay - Absolute positioned */}
        <AnimatePresence>
          {showWin && lastWin && (
            <WinDisplay 
              win={lastWin} 
              bet={bet} 
              show={showWin}
            />
          )}
        </AnimatePresence>

        {/* Game Content */}
        <div className={styles.gameContent}>
          {/* Slot Machine */}
          <div className={styles.slotContainer}>
            <SlotMachine />
          </div>

          {/* Power Meter */}
          <div className={styles.powerMeterContainer}>
            <PowerMeter value={powerMeter} max={10} />
          </div>

          {/* Betting Controls */}
          <div className={styles.bettingContainer}>
            <BettingControls />
          </div>

          {/* Action Buttons - Only Spin Button */}
          <div className={styles.actionButtons}>
            <motion.button
              onClick={handleSpin}
              disabled={isSpinning || balance < bet}
              className={`${styles.spinButton} ${
                isSpinning || balance < bet ? styles.disabled : styles.ready
              }`}
              whileHover={!isSpinning && balance >= bet ? { scale: 1.02 } : {}}
              whileTap={!isSpinning && balance >= bet ? { scale: 0.98 } : {}}
            >
              {isSpinning ? (
                <span className={styles.spinning}>
                  <span className={styles.spinner} /> SPINNING...
                </span>
              ) : balance < bet ? (
                'INSUFFICIENT'
              ) : (
                'SPIN'
              )}
            </motion.button>

            {/* REMOVED AUTO AND INFO BUTTONS */}
          </div>
        </div>
      </main>

      {/* Lightning Round Overlay */}
      <AnimatePresence>
        {isLightningRound && <LightningRound />}
      </AnimatePresence>

      {/* Achievement Popup */}
      <AchievementPopup />
    </div>
  );
}