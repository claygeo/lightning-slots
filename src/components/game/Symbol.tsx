'use client';

import { motion } from 'framer-motion';
import { SymbolType } from '@/types';
import { SYMBOLS } from '@/constants/config';
import styles from '@/styles/Symbol.module.css';

interface SymbolProps {
  type: SymbolType;
  isWinning?: boolean;
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
}

export default function Symbol({ 
  type, 
  isWinning = false, 
  size = 'medium',
  animate = false 
}: SymbolProps) {
  const symbol = SYMBOLS[type];
  
  if (!symbol) return null;
  
  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  }[size];
  
  return (
    <motion.div
      className={`${styles.symbolWrapper}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <motion.div
        className={`${styles.symbol} ${sizeClass} ${isWinning ? styles.winning : ''} ${
          symbol.isWild ? styles.wild : ''
        }`}
        style={{
          '--symbol-color': symbol.color,
          position: 'absolute',
        } as React.CSSProperties}
        animate={
          isWinning
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }
            : animate
            ? {
                rotate: [0, 360],
              }
            : {}
        }
        transition={{
          duration: isWinning ? 0.5 : 2,
          repeat: isWinning ? Infinity : 0,
          repeatDelay: isWinning ? 1 : 0,
        }}
      >
        {/* Symbol Background */}
        <div className={styles.background} />
        
        {/* Symbol Icon */}
        <span className={styles.icon}>
          {symbol.icon}
        </span>
        
        {/* Wild Badge */}
        {symbol.isWild && (
          <div className={styles.wildBadge}>
            WILD
          </div>
        )}
        
        {/* Winning Effects */}
        {isWinning && (
          <>
            <div className={styles.winGlow} />
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.sparkle}
                style={{
                  top: ['0', '0', '100%', '100%'][i],
                  left: ['0', '100%', '0', '100%'][i],
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.25,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </motion.div>
  );
}