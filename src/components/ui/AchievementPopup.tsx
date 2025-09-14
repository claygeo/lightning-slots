'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { ACHIEVEMENTS } from '@/constants/config';

interface AchievementNotification {
  id: string;
  name: string;
  description: string;
  reward: {
    type: 'xp' | 'coins' | 'multiplier';
    amount: number;
  };
}

export default function AchievementPopup() {
  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<AchievementNotification | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const { achievements, totalSpins, totalWins, biggestWin } = useGameStore();
  
  // Check for new achievements
  useEffect(() => {
    const checkAchievements = () => {
      ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = achievements.includes(achievement.id);
        
        if (!isUnlocked) {
          let shouldUnlock = false;
          
          // Check achievement conditions
          switch (achievement.id) {
            case 'first-spin':
              shouldUnlock = totalSpins >= 1;
              break;
            case 'high-roller':
              // This would need to be checked when max bet is placed
              break;
            case 'winning-streak':
              // This would need streak tracking
              break;
            // Add more achievement checks
          }
          
          if (shouldUnlock) {
            setNotifications(prev => [...prev, achievement]);
            useGameStore.getState().unlockAchievement(achievement.id);
          }
        }
      });
    };
    
    checkAchievements();
  }, [totalSpins, totalWins, biggestWin, achievements]);
  
  // Show notifications one by one
  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      const [next, ...rest] = notifications;
      setCurrentNotification(next);
      setNotifications(rest);
      
      // Auto-hide after 5 seconds
      timeoutRef.current = setTimeout(() => {
        setCurrentNotification(null);
      }, 5000);
    }
  }, [notifications, currentNotification]);

  // Handle click outside
  const handleDismiss = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setCurrentNotification(null);
  };
  
  return (
    <AnimatePresence>
      {currentNotification && (
        <>
          {/* Backdrop - click to dismiss */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          />
          
          {/* Achievement Card - Centered */}
          <motion.div
            className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-sm"
            style={{ transform: 'translate(-50%, -50%)' }}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div 
              className="rounded-xl p-6 shadow-2xl border-2"
              style={{
                background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
                borderColor: '#FFD700',
                boxShadow: '0 0 40px rgba(255, 215, 0, 0.3)',
              }}
            >
              {/* Achievement Header */}
              <div className="flex flex-col items-center text-center mb-4">
                <motion.div
                  className="text-5xl mb-3"
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 2,
                  }}
                >
                  🏆
                </motion.div>
                <h3 className="font-bold text-2xl text-yellow-400 mb-1">Achievement Unlocked!</h3>
                <p className="text-lg text-yellow-300 font-semibold">{currentNotification.name}</p>
              </div>
              
              {/* Achievement Description */}
              <p className="text-center text-gray-300 mb-4">
                {currentNotification.description}
              </p>
              
              {/* Reward Display */}
              <motion.div
                className="rounded-lg p-3 text-center"
                style={{
                  background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <span className="text-lg font-bold text-yellow-400">
                  Reward: {' '}
                  {currentNotification.reward.type === 'xp' && `+${currentNotification.reward.amount} XP`}
                  {currentNotification.reward.type === 'coins' && `+$${currentNotification.reward.amount}`}
                  {currentNotification.reward.type === 'multiplier' && `${currentNotification.reward.amount}x Multiplier`}
                </span>
              </motion.div>
              
              {/* Progress Bar */}
              <motion.div
                className="mt-4 h-1 bg-yellow-400 rounded-full"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
              />
              
              {/* Tap to dismiss hint */}
              <p className="text-center text-xs text-gray-500 mt-3">
                Tap anywhere to dismiss
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}