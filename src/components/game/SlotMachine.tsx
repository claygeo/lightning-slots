'use client';

// ============================================
// ROYAL JACKPOT - Slot Machine Component
// Premium 3D-style slot machine with smooth animations
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getGameEngine } from '@/lib/gameEngine';
import { SYMBOLS, GAME_CONFIG, ANIMATION_CONFIG, TURBO_ANIMATION_CONFIG } from '@/constants/gameConfig';
import { SymbolId } from '@/types/game';
import styles from './SlotMachine.module.scss';

// Symbol component with 3D effect
const Symbol = ({ symbol, isWinning = false, delay = 0 }: { symbol: SymbolId; isWinning?: boolean; delay?: number }) => {
  const symbolData = SYMBOLS[symbol];

  return (
    <motion.div
      className={`${styles.symbol} ${isWinning ? styles.winning : ''}`}
      initial={false}
      animate={isWinning ? {
        scale: [1, 1.15, 1],
        rotate: [0, 5, -5, 0],
      } : {}}
      transition={{
        duration: 0.5,
        delay,
        repeat: isWinning ? Infinity : 0,
        repeatDelay: 0.5,
      }}
    >
      <span className={styles.symbolEmoji}>{symbolData?.emoji || '?'}</span>
      {isWinning && <div className={styles.symbolGlow} />}
    </motion.div>
  );
};

// Reel component with spinning animation
const Reel = ({
  symbols,
  isSpinning,
  stopDelay,
  reelIndex,
  winningRows,
  turboMode,
}: {
  symbols: SymbolId[];
  isSpinning: boolean;
  stopDelay: number;
  reelIndex: number;
  winningRows: number[];
  turboMode: boolean;
}) => {
  const [displaySymbols, setDisplaySymbols] = useState<SymbolId[]>(symbols);
  const [isReelSpinning, setIsReelSpinning] = useState(false);
  const spinInterval = useRef<NodeJS.Timeout | null>(null);
  const allSymbols = Object.keys(SYMBOLS) as SymbolId[];

  // Generate random symbols for spinning effect
  const getRandomSymbols = () => {
    return [0, 1, 2].map(() => allSymbols[Math.floor(Math.random() * allSymbols.length)]);
  };

  useEffect(() => {
    if (isSpinning) {
      setIsReelSpinning(true);

      // Fast symbol cycling during spin
      const cycleSpeed = turboMode ? 50 : 80;
      spinInterval.current = setInterval(() => {
        setDisplaySymbols(getRandomSymbols());
      }, cycleSpeed);

      // Stop this reel after delay
      const animConfig = turboMode ? TURBO_ANIMATION_CONFIG : ANIMATION_CONFIG;
      const stopTime = animConfig.spinDuration + (stopDelay * animConfig.reelStopDelay);

      setTimeout(() => {
        if (spinInterval.current) {
          clearInterval(spinInterval.current);
        }
        setDisplaySymbols(symbols);
        setIsReelSpinning(false);
      }, stopTime);
    }

    return () => {
      if (spinInterval.current) {
        clearInterval(spinInterval.current);
      }
    };
  }, [isSpinning, symbols, stopDelay, turboMode]);

  return (
    <div className={`${styles.reel} ${isReelSpinning ? styles.spinning : ''}`}>
      <div className={styles.reelInner}>
        {displaySymbols.map((symbol, rowIndex) => (
          <Symbol
            key={`${reelIndex}-${rowIndex}`}
            symbol={symbol}
            isWinning={!isReelSpinning && winningRows.includes(rowIndex)}
            delay={reelIndex * 0.05}
          />
        ))}
      </div>
      {/* Reel shine effect */}
      <div className={styles.reelShine} />
    </div>
  );
};

export default function SlotMachine() {
  const {
    currentGrid,
    isSpinning,
    lastResult,
    bet,
    balance,
    freeSpinsRemaining,
    multiplier,
    turboMode,
    startSpin,
    completeSpin,
  } = useGameStore();

  const [showWin, setShowWin] = useState(false);
  const gameEngine = useRef(getGameEngine());

  // Get winning positions for each reel
  const getWinningRowsForReel = useCallback((reelIndex: number): number[] => {
    if (!lastResult || !lastResult.wins.length) return [];

    const winningRows: number[] = [];
    lastResult.wins.forEach(win => {
      win.positions.forEach(pos => {
        if (pos.reel === reelIndex) {
          winningRows.push(pos.row);
        }
      });
    });

    return Array.from(new Set(winningRows));
  }, [lastResult]);

  // Handle spin
  const handleSpin = useCallback(() => {
    if (isSpinning) return;
    if (freeSpinsRemaining === 0 && balance < bet) return;

    setShowWin(false);
    startSpin();

    // Generate result
    const result = gameEngine.current.spin(bet);

    // Complete spin after animation
    const animConfig = turboMode ? TURBO_ANIMATION_CONFIG : ANIMATION_CONFIG;
    const totalSpinTime = animConfig.spinDuration + (GAME_CONFIG.REELS * animConfig.reelStopDelay) + 200;

    setTimeout(() => {
      completeSpin(result);

      if (result.totalWin > 0) {
        setShowWin(true);
        setTimeout(() => setShowWin(false), animConfig.winDisplayDuration);
      }
    }, totalSpinTime);
  }, [isSpinning, balance, bet, freeSpinsRemaining, startSpin, completeSpin, turboMode]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning) {
        e.preventDefault();
        handleSpin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSpin, isSpinning]);

  return (
    <div className={styles.slotMachine}>
      {/* Machine Frame */}
      <div className={styles.machineFrame}>
        {/* Top decoration */}
        <div className={styles.machineTop}>
          <div className={styles.topLights}>
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.light}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
          <div className={styles.topLabel}>
            <span className={styles.topLabelText}>ROYAL JACKPOT</span>
          </div>
        </div>

        {/* Free Spins Indicator */}
        <AnimatePresence>
          {freeSpinsRemaining > 0 && (
            <motion.div
              className={styles.freeSpinsBanner}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
            >
              <span className={styles.freeSpinsIcon}>💎</span>
              <span className={styles.freeSpinsText}>
                FREE SPINS: {freeSpinsRemaining}
              </span>
              <span className={styles.multiplierBadge}>{multiplier}x</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reels Container */}
        <div className={styles.reelsContainer}>
          <div className={styles.reelsFrame}>
            {/* Reels */}
            <div className={styles.reels}>
              {currentGrid.map((reelSymbols, reelIndex) => (
                <Reel
                  key={reelIndex}
                  symbols={reelSymbols}
                  isSpinning={isSpinning}
                  stopDelay={reelIndex}
                  reelIndex={reelIndex}
                  winningRows={getWinningRowsForReel(reelIndex)}
                  turboMode={turboMode}
                />
              ))}
            </div>

            {/* Payline indicators */}
            <div className={styles.paylineIndicators}>
              <div className={styles.paylineLeft}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.paylineMarker} ${lastResult?.wins.length ? styles.active : ''}`}
                  />
                ))}
              </div>
              <div className={styles.paylineRight}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.paylineMarker} ${lastResult?.wins.length ? styles.active : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Reflection effect */}
          <div className={styles.reelReflection} />
        </div>

        {/* Win Display */}
        <AnimatePresence>
          {showWin && lastResult && lastResult.totalWin > 0 && (
            <motion.div
              className={`${styles.winDisplay} ${lastResult.isJackpot ? styles.jackpot : lastResult.isMegaWin ? styles.mega : lastResult.isBigWin ? styles.big : ''}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <div className={styles.winLabel}>
                {lastResult.isJackpot ? 'JACKPOT!' : lastResult.isMegaWin ? 'MEGA WIN!' : lastResult.isBigWin ? 'BIG WIN!' : 'WIN!'}
              </div>
              <motion.div
                className={styles.winAmount}
                initial={{ scale: 0.5 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                ${(lastResult.totalWin * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spin Button */}
      <div className={styles.spinButtonContainer}>
        <motion.button
          className={`${styles.spinButton} ${isSpinning ? styles.spinning : ''} ${freeSpinsRemaining > 0 ? styles.freeSpin : ''}`}
          onClick={handleSpin}
          disabled={isSpinning || (freeSpinsRemaining === 0 && balance < bet)}
          whileHover={!isSpinning ? { scale: 1.05 } : {}}
          whileTap={!isSpinning ? { scale: 0.95 } : {}}
        >
          <span className={styles.spinButtonInner}>
            {isSpinning ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                ⟳
              </motion.span>
            ) : freeSpinsRemaining > 0 ? (
              '💎 FREE'
            ) : (
              'SPIN'
            )}
          </span>
        </motion.button>

        <p className={styles.spinHint}>Press SPACE to spin</p>
      </div>
    </div>
  );
}
