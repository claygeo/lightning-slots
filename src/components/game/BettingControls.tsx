'use client';

// ============================================
// ROYAL JACKPOT - Betting Controls
// Premium betting interface
// ============================================

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GAME_CONFIG } from '@/constants/gameConfig';
import styles from './BettingControls.module.scss';

export default function BettingControls() {
  const {
    bet,
    balance,
    isSpinning,
    freeSpinsRemaining,
    setBet,
    incrementBet,
    decrementBet,
    setMaxBet,
  } = useGameStore();

  const quickBets = [1, 5, 10, 25, 50, 100];
  const canDecrease = bet > GAME_CONFIG.MIN_BET && !isSpinning;
  const canIncrease = bet < Math.min(GAME_CONFIG.MAX_BET, balance) && !isSpinning;

  return (
    <div className={styles.bettingControls}>
      {/* Bet Display */}
      <div className={styles.betDisplay}>
        <span className={styles.betLabel}>BET AMOUNT</span>
        <div className={styles.betValue}>
          <motion.button
            className={styles.adjustButton}
            onClick={decrementBet}
            disabled={!canDecrease}
            whileHover={canDecrease ? { scale: 1.1 } : {}}
            whileTap={canDecrease ? { scale: 0.9 } : {}}
          >
            <span>−</span>
          </motion.button>

          <div className={styles.betAmount}>
            <span className={styles.currency}>$</span>
            <motion.span
              className={styles.amount}
              key={bet}
              initial={{ scale: 1.2, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {bet.toFixed(2)}
            </motion.span>
          </div>

          <motion.button
            className={styles.adjustButton}
            onClick={incrementBet}
            disabled={!canIncrease}
            whileHover={canIncrease ? { scale: 1.1 } : {}}
            whileTap={canIncrease ? { scale: 0.9 } : {}}
          >
            <span>+</span>
          </motion.button>
        </div>
      </div>

      {/* Quick Bet Buttons */}
      <div className={styles.quickBets}>
        {quickBets.map((amount) => {
          const isActive = bet === amount;
          const isDisabled = amount > balance || isSpinning;

          return (
            <motion.button
              key={amount}
              className={`${styles.quickBetButton} ${isActive ? styles.active : ''}`}
              onClick={() => setBet(amount)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
            >
              ${amount}
            </motion.button>
          );
        })}

        <motion.button
          className={`${styles.quickBetButton} ${styles.maxButton}`}
          onClick={setMaxBet}
          disabled={isSpinning}
          whileHover={!isSpinning ? { scale: 1.05, y: -2 } : {}}
          whileTap={!isSpinning ? { scale: 0.95 } : {}}
        >
          MAX
        </motion.button>
      </div>

      {/* Potential Win */}
      <div className={styles.potentialWin}>
        <span className={styles.potentialLabel}>Max Potential Win</span>
        <span className={styles.potentialValue}>
          ${(bet * GAME_CONFIG.MAX_WIN_MULTIPLIER).toLocaleString('en-US')}
        </span>
      </div>

      {/* Free Spins Indicator */}
      {freeSpinsRemaining > 0 && (
        <motion.div
          className={styles.freeSpinsNotice}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className={styles.freeSpinsIcon}>💎</span>
          <span>Bets are FREE during free spins!</span>
        </motion.div>
      )}
    </div>
  );
}
