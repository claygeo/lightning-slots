'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from '@/styles/PowerMeter.module.css';

interface PowerMeterProps {
  value: number;
  max: number;
}

export default function PowerMeter({ value, max }: PowerMeterProps) {
  const [isCharging, setIsCharging] = useState(false);
  const [isFull, setIsFull] = useState(false);
  
  const percentage = (value / max) * 100;
  
  useEffect(() => {
    setIsCharging(value > 0 && value < max);
    setIsFull(value >= max);
  }, [value, max]);
  
  return (
    <div className={styles.powerMeter}>
      {/* Header */}
      <div className={styles.header}>
        <motion.span
          className={styles.icon}
          animate={isFull ? {
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          } : {}}
          transition={{
            duration: 0.5,
            repeat: isFull ? Infinity : 0,
            repeatDelay: 0.5,
          }}
        >
          ⚡
        </motion.span>
        <span className={styles.title}>Power Meter</span>
        <span className={styles.counter}>{value}/{max}</span>
      </div>
      
      {/* Meter Bar */}
      <div className={styles.meterContainer}>
        <div className={styles.meterTrack}>
          {/* Segments */}
          <div className={styles.segments}>
            {[...Array(max)].map((_, i) => (
              <div key={i} className={styles.segment} />
            ))}
          </div>
          
          {/* Fill */}
          <motion.div
            className={`${styles.meterFill} ${isFull ? styles.full : ''}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {isCharging && (
              <motion.div
                className={styles.chargeEffect}
                animate={{ x: ['-100%', '200%'] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </motion.div>
          
          {/* Full Pulse */}
          {isFull && (
            <motion.div
              className={styles.fullPulse}
              animate={{
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
          )}
        </div>
        
        {/* REMOVED ANIMATED DOTS - No more flashing dots below the meter */}
      </div>
      
      {/* Status */}
      <AnimatePresence mode="wait">
        {isFull ? (
          <motion.div
            key="ready"
            className={styles.status}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            <span className={styles.readyText}>⚡ LIGHTNING ROUND READY! ⚡</span>
          </motion.div>
        ) : (
          <motion.div
            key="charging"
            className={styles.status}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            <span className={styles.chargingText}>
              {max - value} more spin{max - value !== 1 ? 's' : ''} to Lightning Round
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}