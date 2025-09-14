'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GAME_CONFIG } from '@/constants/config';
import styles from '@/styles/BettingControls.module.css';

export default function BettingControls() {
  const { bet, setBet, balance, isSpinning } = useGameStore();
  
  // Dynamic bet options based on balance
  const generateBetOptions = () => {
    const options = [];
    const presets = [0.10, 0.25, 0.50, 1, 2, 5, 10, 25, 50, 100];
    
    for (const value of presets) {
      if (value <= balance) {
        options.push(value);
      }
    }
    
    // Always add current balance as MAX option if it's not already in the list
    if (balance > 0 && !options.includes(balance)) {
      options.push(balance);
    }
    
    return options;
  };
  
  const betOptions = generateBetOptions();
  
  // Quick bet buttons - show relevant options
  const getQuickBets = () => {
    const quickOptions = [];
    
    // Always show $1 if affordable
    if (balance >= 1) quickOptions.push(1);
    
    // Show $5 if affordable
    if (balance >= 5) quickOptions.push(5);
    
    // Show $10 if affordable
    if (balance >= 10) quickOptions.push(10);
    
    // Always show MAX (entire balance)
    if (balance > 0) {
      quickOptions.push(balance);
    }
    
    return quickOptions;
  };
  
  const quickBets = getQuickBets();
  
  const handleBetChange = (newBet: number) => {
    if (!isSpinning && newBet >= GAME_CONFIG.MIN_BET && newBet <= balance) {
      setBet(newBet);
    }
  };
  
  const increaseBet = () => {
    const currentIndex = betOptions.findIndex(option => option >= bet);
    if (currentIndex < betOptions.length - 1) {
      handleBetChange(betOptions[currentIndex + 1]);
    } else if (bet < balance) {
      handleBetChange(balance); // Set to max
    }
  };
  
  const decreaseBet = () => {
    const currentIndex = betOptions.findIndex(option => option >= bet);
    if (currentIndex > 0) {
      handleBetChange(betOptions[currentIndex - 1]);
    }
  };
  
  return (
    <div className={styles.bettingControls}>
      {/* Bet Display Row */}
      <div className={styles.betDisplay}>
        <span className={styles.label}>BET AMOUNT</span>
        <motion.div
          className={styles.betAmount}
          key={bet}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          ${bet.toFixed(2)}
        </motion.div>
      </div>
      
      {/* Bet Adjustment */}
      <div className={styles.betAdjustment}>
        <button
          onClick={decreaseBet}
          disabled={isSpinning || bet <= GAME_CONFIG.MIN_BET}
          className={`${styles.adjustButton} ${styles.decrease}`}
        >
          −
        </button>
        
        <div className={styles.betInput}>
          <span className={styles.currency}>$</span>
          <input
            type="number"
            value={bet.toFixed(2)}
            onChange={(e) => handleBetChange(parseFloat(e.target.value) || 0)}
            disabled={isSpinning}
            className={styles.input}
            step="0.10"
            min={GAME_CONFIG.MIN_BET}
            max={balance}
          />
        </div>
        
        <button
          onClick={increaseBet}
          disabled={isSpinning || bet >= balance}
          className={`${styles.adjustButton} ${styles.increase}`}
        >
          +
        </button>
      </div>
      
      {/* Quick Bets */}
      <div className={styles.quickBets}>
        {quickBets.map((value) => (
          <motion.button
            key={value}
            onClick={() => handleBetChange(value)}
            disabled={isSpinning}
            className={`${styles.quickButton} ${
              bet === value ? styles.active : ''
            }`}
            whileHover={!isSpinning ? { scale: 1.05 } : {}}
            whileTap={!isSpinning ? { scale: 0.95 } : {}}
          >
            {value === balance ? 'MAX' : `$${value.toFixed(value < 1 ? 2 : 0)}`}
          </motion.button>
        ))}
      </div>
      
      {/* Bet Limits */}
      <div className={styles.limits}>
        <span>Min: ${GAME_CONFIG.MIN_BET.toFixed(2)}</span>
        <span>Max: ${balance.toFixed(2)}</span>
      </div>
    </div>
  );
}