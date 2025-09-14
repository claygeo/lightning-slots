'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { SlotEngine } from '@/lib/game-engine/SlotEngine';
import { WinlineChecker } from '@/lib/game-engine/WinlineChecker';
import { SymbolType } from '@/types';
import { SYMBOLS, GAME_CONFIG, ANIMATION_CONFIG } from '@/constants/config';
import { useAnimation } from '@/hooks/useAnimation';
import ReelStrip from './ReelStrip';
import Paylines from './Paylines';
import WinDisplay from './WinDisplay';
import styles from '@/styles/SlotMachine.module.css';

export default function SlotMachine() {
  const [reelSymbols, setReelSymbols] = useState<SymbolType[][]>([]);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [displayGrid, setDisplayGrid] = useState<SymbolType[][]>([]);
  
  const engineRef = useRef<SlotEngine | null>(null);
  const winlineCheckerRef = useRef<WinlineChecker | null>(null);
  const { isAnimating, startSpin, reelStates, phase } = useAnimation(5);
  
  const {
    isSpinning,
    stopSpin,
    lastWin,
    bet,
    lightningMultiplier,
  } = useGameStore();

  // Initialize engines
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new SlotEngine();
      winlineCheckerRef.current = new WinlineChecker();
      
      const initialGrid = engineRef.current.getDisplayGrid();
      setReelSymbols(initialGrid);
      setDisplayGrid(initialGrid);
    }
  }, []);

  // Handle spin
  useEffect(() => {
    if (isSpinning && engineRef.current && winlineCheckerRef.current) {
      setHighlightedLine(null);
      setShowWin(false);
      
      // Start animation
      startSpin();
      
      // Generate final result
      const { grid } = engineRef.current.spin();
      
      // Wait for animation to complete
      const totalAnimationTime = GAME_CONFIG.SPIN_DURATION + (ANIMATION_CONFIG.REEL_STOP_DURATION * 2);
      
      setTimeout(() => {
        // Set final symbols
        setReelSymbols(grid);
        setDisplayGrid(grid);
        
        // Check for wins
        const { winLines, totalWin } = winlineCheckerRef.current!.checkWins(grid, bet);
        const specialWins = winlineCheckerRef.current!.checkSpecialWins(grid);
        
        // Apply lightning multiplier if active
        const finalWin = lightningMultiplier > 1 ? totalWin * lightningMultiplier : totalWin;
        
        // Create result object
        const result = {
          grid,
          winLines,
          totalWin: finalWin,
          ...specialWins,
        };
        
        // Stop spin and update store
        stopSpin(result);
        
        // Show win animations if there are wins
        if (winLines.length > 0) {
          setShowWin(true);
          animateWinLines(winLines);
          
          // Hide win display after animation
          setTimeout(() => {
            setShowWin(false);
          }, ANIMATION_CONFIG.WIN_HIGHLIGHT_DURATION + (winLines.length * 1000));
        }
      }, totalAnimationTime);
    }
  }, [isSpinning, stopSpin, lightningMultiplier, bet, startSpin]);

  // Animate winning paylines sequentially
  const animateWinLines = (winLines: any[]) => {
    let currentLine = 0;
    
    const showNextLine = () => {
      if (currentLine < winLines.length) {
        setHighlightedLine(winLines[currentLine].lineId);
        currentLine++;
        
        // Show each line for 1.5 seconds
        setTimeout(() => {
          if (currentLine < winLines.length) {
            showNextLine();
          } else {
            // After showing all lines, cycle through them once more quickly
            setTimeout(() => {
              cycleAllLines(winLines);
            }, 500);
          }
        }, 1500);
      }
    };
    
    showNextLine();
  };

  // Quick cycle through all winning lines
  const cycleAllLines = (winLines: any[]) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < winLines.length) {
        setHighlightedLine(winLines[index].lineId);
        index++;
      } else {
        clearInterval(interval);
        setHighlightedLine(null);
      }
    }, 300);
  };

  // Convert grid format for display (rows x cols)
  const getDisplaySymbols = () => {
    const display: SymbolType[][] = [];
    for (let col = 0; col < 5; col++) {
      const column: SymbolType[] = [];
      for (let row = 0; row < 3; row++) {
        column.push(displayGrid[row]?.[col] || 'cherry');
      }
      display.push(column);
    }
    return display;
  };

  const displaySymbols = getDisplaySymbols();

  return (
    <div className={styles.slotMachine}>
      {/* Machine Frame */}
      <div className={styles.machineFrame}>
        {/* Top Display */}
        <div className={styles.topDisplay}>
          <div className={styles.displayText}>
            {lastWin && lastWin.totalWin > 0 && !isAnimating ? (
              <motion.span 
                className={styles.winDisplay}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                WIN: {lastWin.totalWin}x
              </motion.span>
            ) : (
              <span className={styles.idleDisplay}>
                LIGHTNING SLOTS™
              </span>
            )}
          </div>
        </div>
        
        {/* Reels Window */}
        <div className={styles.reelsWindow}>
          {/* Reels Container with relative positioning */}
          <div className={styles.reelsContainer}>
            {/* Background Pattern */}
            <div className={styles.backgroundPattern} />
            
            {/* Reel Columns Grid */}
            <div className={styles.reelsGrid}>
              {[...Array(5)].map((_, colIndex) => (
                <div key={colIndex} className={styles.reelColumn}>
                  <div className={styles.reelFrame}>
                    <ReelStrip
                      symbols={displaySymbols[colIndex] || ['cherry', 'cherry', 'cherry']}
                      isSpinning={reelStates[colIndex]}
                      reelIndex={colIndex}
                    />
                  </div>
                  {/* Reel Separator */}
                  {colIndex < 4 && <div className={styles.reelSeparator} />}
                </div>
              ))}
            </div>
            
            {/* Paylines Overlay - MUST be positioned absolutely within reelsContainer */}
            {lastWin && lastWin.winLines.length > 0 && !isAnimating && (
              <div className={styles.paylinesOverlay}>
                <Paylines
                  winLines={lastWin.winLines}
                  highlightedLine={highlightedLine}
                />
              </div>
            )}
            
            {/* Win Glow Effect */}
            <AnimatePresence>
              {lastWin && lastWin.totalWin > 0 && !isAnimating && (
                <motion.div
                  className={styles.winGlow}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0.3] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2 }}
                />
              )}
            </AnimatePresence>
          </div>
          
          {/* Frame Lights REMOVED - No more flashing dots */}
        </div>
        
        {/* Bottom Panel */}
        <div className={styles.bottomPanel}>
          <div className={styles.panelInfo}>
            <span>BET: ${bet.toFixed(2)}</span>
            {lightningMultiplier > 1 && (
              <motion.span 
                className={styles.multiplierBadge}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {lightningMultiplier}x
              </motion.span>
            )}
            <span>LINES: 20</span>
          </div>
        </div>
      </div>
      
      {/* Lightning Effect Overlay */}
      <AnimatePresence>
        {lightningMultiplier > 1 && (
          <motion.div
            className={styles.lightningOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: 3 }}
          />
        )}
      </AnimatePresence>

      {/* Win Display Overlay - Separate from slot machine */}
      <AnimatePresence>
        {showWin && lastWin && phase !== 'spinning' && (
          <WinDisplay win={lastWin} bet={bet} show={showWin} />
        )}
      </AnimatePresence>
    </div>
  );
}