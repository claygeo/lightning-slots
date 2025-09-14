'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from '@/styles/Balance.module.css';

interface BalanceProps {
  balance: number;
  showCurrency?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function Balance({ 
  balance, 
  showCurrency = true,
  size = 'small' 
}: BalanceProps) {
  const [prevBalance, setPrevBalance] = useState(balance);
  const [isIncreasing, setIsIncreasing] = useState(false);
  
  useEffect(() => {
    if (balance !== prevBalance) {
      setIsIncreasing(balance > prevBalance);
      setPrevBalance(balance);
    }
  }, [balance, prevBalance]);
  
  return (
    <div className={styles.balanceContainer}>
      <div className={styles.header}>
        <span className={styles.label}>Balance</span>
        {balance < 10 && (
          <span className={styles.lowBalance}>Low</span>
        )}
      </div>
      
      <motion.div
        className={styles.amount}
        animate={{
          scale: isIncreasing ? [1, 1.05, 1] : [1, 0.98, 1],
        }}
        transition={{ duration: 0.3 }}
      >
        {showCurrency && <span className={styles.currency}>$</span>}
        <AnimatePresence mode="wait">
          <motion.span
            key={balance}
            initial={{ y: isIncreasing ? 10 : -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: isIncreasing ? -10 : 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {balance.toFixed(2)}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}