import { useCallback, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSound } from './useSound';

export function useGameState() {
  const {
    balance,
    bet,
    isSpinning,
    isAutoPlay,
    autoPlayCount,
    lastWin,
    powerMeter,
    isLightningRound,
    lightningMultiplier,
    spin,
    stopSpin,
    setBet,
    toggleAutoPlay,
    setAutoPlayCount,
  } = useGameStore();
  
  const { playSpinStart, playSpinStop, playWin } = useSound();
  
  // Handle spin with sound
  const handleSpin = useCallback(() => {
    if (!isSpinning && balance >= bet) {
      playSpinStart();
      spin();
    }
  }, [isSpinning, balance, bet, spin, playSpinStart]);
  
  // Handle spin stop with sound
  const handleSpinStop = useCallback((result: any) => {
    playSpinStop();
    stopSpin(result);
    
    if (result.totalWin > 0) {
      playWin(result.totalWin);
    }
  }, [stopSpin, playSpinStop, playWin]);
  
  // Auto-play logic
  useEffect(() => {
    if (isAutoPlay && !isSpinning && autoPlayCount > 0 && balance >= bet) {
      const timer = setTimeout(() => {
        handleSpin();
      }, 1000); // 1 second delay between auto spins
      
      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, isSpinning, autoPlayCount, balance, bet, handleSpin]);
  
  // Check for insufficient balance
  const canSpin = balance >= bet && !isSpinning;
  const insufficientBalance = balance < bet;
  
  // Calculate next bet options
  const getNextBetOptions = useCallback(() => {
    const options = [0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100];
    return options.filter(option => option <= balance);
  }, [balance]);
  
  // Calculate win potential
  const maxWinPotential = bet * 5000; // Max win is 5000x
  
  return {
    // State
    balance,
    bet,
    isSpinning,
    isAutoPlay,
    autoPlayCount,
    lastWin,
    powerMeter,
    isLightningRound,
    lightningMultiplier,
    
    // Computed
    canSpin,
    insufficientBalance,
    maxWinPotential,
    
    // Actions
    handleSpin,
    handleSpinStop,
    setBet,
    toggleAutoPlay,
    setAutoPlayCount,
    getNextBetOptions,
  };
}