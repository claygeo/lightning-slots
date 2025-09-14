'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GAME_CONFIG, LIGHTNING_CONFIG } from '@/constants/config';

interface Coin {
  id: number;
  x: number;
  y: number;
  value: number;
  collected: boolean;
}

export default function LightningRound() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(GAME_CONFIG.LIGHTNING_ROUND_DURATION / 1000);
  const [totalMultiplier, setTotalMultiplier] = useState(1);
  const [collectedCount, setCollectedCount] = useState(0);
  
  const { endLightningRound } = useGameStore();
  
  // Generate random coins
  const spawnCoin = useCallback(() => {
    const newCoin: Coin = {
      id: Date.now() + Math.random(),
      x: Math.random() * (window.innerWidth - LIGHTNING_CONFIG.COIN_SIZE),
      y: -LIGHTNING_CONFIG.COIN_SIZE,
      value: Math.floor(Math.random() * (LIGHTNING_CONFIG.MAX_COIN_VALUE - LIGHTNING_CONFIG.MIN_COIN_VALUE + 1)) + LIGHTNING_CONFIG.MIN_COIN_VALUE,
      collected: false,
    };
    setCoins(prev => [...prev, newCoin]);
  }, []);
  
  // Handle coin collection
  const collectCoin = (coinId: number, value: number) => {
    setCoins(prev => prev.map(coin => 
      coin.id === coinId ? { ...coin, collected: true } : coin
    ));
    setTotalMultiplier(prev => Math.min(prev + (value / 10), 10)); // Max 10x multiplier
    setCollectedCount(prev => prev + 1);
  };
  
  // Spawn coins periodically
  useEffect(() => {
    const spawnInterval = setInterval(spawnCoin, LIGHTNING_CONFIG.SPAWN_RATE);
    return () => clearInterval(spawnInterval);
  }, [spawnCoin]);
  
  // Update coin positions
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setCoins(prev => prev
        .map(coin => ({
          ...coin,
          y: coin.y + LIGHTNING_CONFIG.COIN_FALL_SPEED,
        }))
        .filter(coin => coin.y < window.innerHeight + LIGHTNING_CONFIG.COIN_SIZE)
      );
    }, 16); // 60 FPS
    
    return () => clearInterval(moveInterval);
  }, []);
  
  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          endLightningRound(totalMultiplier);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, [totalMultiplier, endLightningRound]);
  
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-gradient-to-b from-purple-900/90 via-blue-900/90 to-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Lightning Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 bg-gradient-to-b from-transparent via-yellow-400 to-transparent"
            style={{
              left: `${20 * (i + 1)}%`,
              height: '100%',
            }}
            animate={{
              opacity: [0, 1, 0],
              scaleY: [0, 1, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <div className="relative z-10 text-center pt-8">
        <motion.h2
          className="text-4xl font-bold text-yellow-400 neon-glow mb-2"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        >
          ⚡ LIGHTNING ROUND ⚡
        </motion.h2>
        <p className="text-white text-lg">Tap the coins to increase your multiplier!</p>
      </div>
      
      {/* Timer */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          className={`text-5xl font-bold ${
            timeRemaining <= 1 ? 'text-red-500' : 'text-white'
          }`}
          animate={timeRemaining <= 1 ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={{
            duration: 0.5,
            repeat: timeRemaining <= 1 ? Infinity : 0,
          }}
        >
          {timeRemaining.toFixed(1)}s
        </motion.div>
      </div>
      
      {/* Multiplier Display */}
      <div className="absolute top-8 right-8 z-10 text-right">
        <div className="text-sm text-gray-300">Multiplier</div>
        <motion.div
          className="text-3xl font-bold text-green-400"
          key={totalMultiplier}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {totalMultiplier.toFixed(1)}x
        </motion.div>
        <div className="text-sm text-gray-300 mt-1">
          Coins: {collectedCount}
        </div>
      </div>
      
      {/* Coins */}
      <AnimatePresence>
        {coins.map(coin => (
          <motion.button
            key={coin.id}
            className={`absolute flex items-center justify-center rounded-full font-bold text-black transition-all ${
              coin.collected ? 'pointer-events-none' : 'cursor-pointer'
            }`}
            style={{
              left: coin.x,
              top: coin.y,
              width: LIGHTNING_CONFIG.COIN_SIZE,
              height: LIGHTNING_CONFIG.COIN_SIZE,
              background: coin.collected
                ? 'transparent'
                : `radial-gradient(circle at 30% 30%, #FFD700, #FFA500)`,
              boxShadow: coin.collected
                ? 'none'
                : '0 0 20px rgba(255, 215, 0, 0.8)',
            }}
            onClick={() => !coin.collected && collectCoin(coin.id, coin.value)}
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: coin.collected ? 0 : 1,
              rotate: coin.collected ? 720 : 360,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: coin.collected ? 0.3 : 2,
              ease: coin.collected ? 'easeOut' : 'linear',
            }}
            whileHover={!coin.collected ? { scale: 1.2 } : {}}
            whileTap={!coin.collected ? { scale: 0.9 } : {}}
          >
            {!coin.collected && (
              <>
                <span className="text-sm">+{coin.value}</span>
                {/* Coin Shine Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.5) 50%, transparent 60%)',
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </>
            )}
          </motion.button>
        ))}
      </AnimatePresence>
      
      {/* Collection Effect */}
      <AnimatePresence>
        {coins.filter(c => c.collected).map(coin => (
          <motion.div
            key={`effect-${coin.id}`}
            className="absolute pointer-events-none"
            style={{
              left: coin.x,
              top: coin.y,
            }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: 3,
              opacity: 0,
              y: -50,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-2xl font-bold text-yellow-400">
              +{coin.value}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center z-10">
        <motion.div
          className="text-white/80"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          Tap or Click the falling coins!
        </motion.div>
      </div>
    </motion.div>
  );
}