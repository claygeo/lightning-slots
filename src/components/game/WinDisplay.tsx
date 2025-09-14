'use client';

import { motion } from 'framer-motion';
import { WinResult } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import styles from '@/styles/WinDisplay.module.css';

interface WinDisplayProps {
  win: WinResult | null;
  bet: number;
  show: boolean;
}

export default function WinDisplay({ win, bet, show }: WinDisplayProps) {
  if (!win || !show) return null;
  
  const winAmount = win.totalWin * bet;
  
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }}
    >
      <motion.div
        className={styles.content}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: win.isJackpot ? 1.2 : win.isBigWin ? 1.1 : 1,
          rotate: 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
      >
        {/* Win Type */}
        <div className={`${styles.winType} ${
          win.isJackpot ? styles.jackpot :
          win.isBigWin ? styles.bigWin :
          styles.regular
        }`}>
          {win.isJackpot && '💰 JACKPOT! 💰'}
          {win.isBigWin && !win.isJackpot && 'BIG WIN!'}
          {!win.isBigWin && !win.isJackpot && 'WIN!'}
        </div>
        
        {/* Win Amount */}
        <div className={styles.winAmount}>
          {formatCurrency(winAmount)}
        </div>
        
        {/* Multiplier */}
        {win.totalWin > 0 && (
          <div className={styles.multiplier}>
            {win.totalWin}x
          </div>
        )}
      </motion.div>
      
      {/* Background Effects */}
      {win.isBigWin && (
        <div className={styles.effects}>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              style={{
                left: `${50 + Math.cos(i * Math.PI / 4) * 30}%`,
                top: `${50 + Math.sin(i * Math.PI / 4) * 30}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              💰
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}