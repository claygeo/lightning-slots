import { useCallback, useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GAME_CONFIG } from '@/constants/config';

export function useBalance() {
  const { balance, updateBalance } = useGameStore();
  const [isLowBalance, setIsLowBalance] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  
  // Check for low balance
  useEffect(() => {
    setIsLowBalance(balance < 10);
  }, [balance]);
  
  // Add credits (for demo mode)
  const addCredits = useCallback((amount: number) => {
    updateBalance(amount);
  }, [updateBalance]);
  
  // Check if player can afford bet
  const canAfford = useCallback((amount: number): boolean => {
    return balance >= amount;
  }, [balance]);
  
  // Format balance for display
  const formattedBalance = balance.toFixed(2);
  
  // Get balance status
  const getBalanceStatus = useCallback(() => {
    if (balance === 0) return 'empty';
    if (balance < GAME_CONFIG.MIN_BET) return 'insufficient';
    if (balance < 10) return 'low';
    if (balance < 100) return 'normal';
    return 'high';
  }, [balance]);
  
  // Handle insufficient funds
  const handleInsufficientFunds = useCallback(() => {
    setShowInsufficientFunds(true);
    setTimeout(() => setShowInsufficientFunds(false), 3000);
  }, []);
  
  // Calculate sessions remaining at current bet
  const getSessionsRemaining = useCallback((betAmount: number): number => {
    if (betAmount === 0) return 0;
    return Math.floor(balance / betAmount);
  }, [balance]);
  
  return {
    balance,
    formattedBalance,
    isLowBalance,
    showInsufficientFunds,
    addCredits,
    canAfford,
    getBalanceStatus,
    handleInsufficientFunds,
    getSessionsRemaining,
  };
}