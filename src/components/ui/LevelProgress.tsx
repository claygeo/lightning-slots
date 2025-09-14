'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from '@/styles/LevelProgress.module.css';

interface LevelProgressProps {
  level: number;
  experience: number;
  experienceToNext: number;
}

export default function LevelProgress({ 
  level, 
  experience, 
  experienceToNext 
}: LevelProgressProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);
  
  const progress = (experience / experienceToNext) * 100;
  
  useEffect(() => {
    if (level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(level);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [level, prevLevel]);
  
  return (
    <div className={styles.levelContainer}>
      {/* Level Up Animation */}
      {showLevelUp && (
        <motion.div
          className={styles.levelUpBadge}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          LEVEL UP!
        </motion.div>
      )}
      
      {/* Level Info */}
      <div className={styles.levelInfo}>
        <span className={styles.label}>Level</span>
        <motion.span
          className={styles.levelNumber}
          key={level}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          {level}
        </motion.span>
      </div>
      
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <motion.div
          className={styles.progressFill}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.progressShine} />
        </motion.div>
        <span className={styles.progressText}>
          {experience}/{experienceToNext} XP
        </span>
      </div>
    </div>
  );
}