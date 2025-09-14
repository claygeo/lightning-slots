'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SymbolType } from '@/types';
import { SYMBOLS, ANIMATION_CONFIG } from '@/constants/config';
import Symbol from './Symbol';

interface ReelStripProps {
  symbols: SymbolType[];
  isSpinning: boolean;
  reelIndex: number;
}

export default function ReelStrip({ symbols, isSpinning, reelIndex }: ReelStripProps) {
  const ensureThreeSymbols = (symbolArray: SymbolType[]): SymbolType[] => {
    if (symbolArray.length === 3) return symbolArray;
    if (symbolArray.length < 3) {
      const padded = [...symbolArray];
      while (padded.length < 3) {
        padded.push('cherry');
      }
      return padded;
    }
    return symbolArray.slice(0, 3);
  };

  const [displaySymbols, setDisplaySymbols] = useState<SymbolType[]>(ensureThreeSymbols(symbols));
  const [spinningSymbols, setSpinningSymbols] = useState<SymbolType[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'stopping'>('idle');
  const spinIntervalRef = useRef<NodeJS.Timeout>();
  
  const SYMBOL_HEIGHT = 50;
  const VISIBLE_SYMBOLS = 3;
  const TOTAL_HEIGHT = SYMBOL_HEIGHT * VISIBLE_SYMBOLS; // 150px
  
  const generateRandomSymbols = (count: number): SymbolType[] => {
    const symbolKeys = Object.keys(SYMBOLS);
    return Array(count).fill(null).map(() => 
      symbolKeys[Math.floor(Math.random() * symbolKeys.length)] as SymbolType
    );
  };

  useEffect(() => {
    if (!isSpinning) {
      setDisplaySymbols(ensureThreeSymbols(symbols));
    }
  }, [symbols, isSpinning]);

  useEffect(() => {
    if (isSpinning) {
      setAnimationPhase('spinning');
      
      const initialSpinSymbols = generateRandomSymbols(20);
      setSpinningSymbols(initialSpinSymbols);
      
      spinIntervalRef.current = setInterval(() => {
        setSpinningSymbols(generateRandomSymbols(20));
      }, 100);
      
      const baseStopTime = ANIMATION_CONFIG.REEL_SPIN_SPEED * 15;
      const cascadeDelay = ANIMATION_CONFIG.REEL_STOP_DURATION / 2;
      const stopTime = baseStopTime + (reelIndex * cascadeDelay);
      
      setTimeout(() => {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current);
        }
        
        setAnimationPhase('stopping');
        
        setTimeout(() => {
          setDisplaySymbols(ensureThreeSymbols(symbols));
          setAnimationPhase('idle');
        }, 300);
      }, stopTime);
      
    } else {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
      setAnimationPhase('idle');
      setDisplaySymbols(ensureThreeSymbols(symbols));
    }
    
    return () => {
      if (spinIntervalRef.current) {
        clearInterval(spinIntervalRef.current);
      }
    };
  }, [isSpinning, symbols, reelIndex]);

  const reelVariants = {
    idle: {
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 10 }
    },
    spinning: {
      y: [0, -SYMBOL_HEIGHT * 15],
      transition: {
        y: {
          repeat: Infinity,
          duration: 0.5,
          ease: 'linear',
        }
      }
    },
    stopping: {
      y: [SYMBOL_HEIGHT * 2, 0],
      transition: {
        type: 'spring',
        stiffness: 120,
        damping: 8,
        mass: 0.5,
      }
    }
  };

  const renderSymbols = () => {
    if (animationPhase === 'spinning') {
      return (
        <motion.div
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }}
          animate={{ y: [-500, 0] }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {spinningSymbols.map((symbol, index) => (
            <div 
              key={`spin-${index}`}
              style={{ 
                height: SYMBOL_HEIGHT,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'blur(2px)',
                opacity: 0.8,
              }}
            >
              <Symbol
                type={symbol}
                isWinning={false}
                size="small"
              />
            </div>
          ))}
        </motion.div>
      );
    }
    
    const finalSymbols = ensureThreeSymbols(displaySymbols);
    
    return (
      <motion.div
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: TOTAL_HEIGHT,
        }}
        variants={reelVariants}
        initial="idle"
        animate={animationPhase}
      >
        {/* Top Symbol - positioned at top */}
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: SYMBOL_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol
            type={finalSymbols[0]}
            isWinning={false}
            size="small"
          />
        </div>
        
        {/* Middle Symbol - positioned at center */}
        <div 
          style={{ 
            position: 'absolute',
            top: SYMBOL_HEIGHT,
            left: 0,
            right: 0,
            height: SYMBOL_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol
            type={finalSymbols[1]}
            isWinning={false}
            size="small"
          />
        </div>
        
        {/* Bottom Symbol - positioned at bottom */}
        <div 
          style={{ 
            position: 'absolute',
            top: SYMBOL_HEIGHT * 2,
            left: 0,
            right: 0,
            height: SYMBOL_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol
            type={finalSymbols[2]}
            isWinning={false}
            size="small"
          />
        </div>
      </motion.div>
    );
  };

  return (
    <div 
      style={{ 
        height: TOTAL_HEIGHT,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence mode="wait">
        {renderSymbols()}
      </AnimatePresence>
      
      <AnimatePresence>
        {animationPhase === 'spinning' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}