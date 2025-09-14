import { SymbolType, WinLine } from '@/types';
import { SYMBOLS, PAYLINES } from '@/constants/config';

export class PayoutCalculator {
  /**
   * Calculate payout for a specific symbol combination
   */
  static calculateSymbolPayout(
    symbol: SymbolType,
    count: number,
    betAmount: number
  ): number {
    const symbolData = SYMBOLS[symbol];
    if (!symbolData) return 0;
    
    // Get multiplier for the count (index is count - 1)
    const multiplier = symbolData.multiplier[count - 1] || 0;
    return multiplier * betAmount;
  }
  
  /**
   * Calculate total payout for all winning lines
   */
  static calculateTotalPayout(winLines: WinLine[], betAmount: number): number {
    return winLines.reduce((total, line) => total + line.payout * betAmount, 0);
  }
  
  /**
   * Check if symbols form a winning combination
   */
  static isWinningCombination(symbols: SymbolType[]): boolean {
    if (symbols.length < 3) return false;
    
    const firstSymbol = symbols[0];
    const firstIsWild = SYMBOLS[firstSymbol]?.isWild;
    
    // Count consecutive matching symbols from left
    let matchCount = 1;
    
    for (let i = 1; i < symbols.length; i++) {
      const currentSymbol = symbols[i];
      const currentIsWild = SYMBOLS[currentSymbol]?.isWild;
      
      // Match if same symbol, or if either is wild
      if (currentSymbol === firstSymbol || currentIsWild || firstIsWild) {
        matchCount++;
      } else {
        break;
      }
    }
    
    return matchCount >= 3;
  }
  
  /**
   * Calculate win multiplier based on special conditions
   */
  static calculateMultiplier(
    winLines: WinLine[],
    hasLightning: boolean,
    lightningMultiplier: number
  ): number {
    let multiplier = 1;
    
    // Apply lightning multiplier if active
    if (hasLightning) {
      multiplier *= lightningMultiplier;
    }
    
    // Bonus for multiple win lines
    if (winLines.length >= 5) {
      multiplier *= 1.5;
    } else if (winLines.length >= 3) {
      multiplier *= 1.2;
    }
    
    return multiplier;
  }
  
  /**
   * Determine win tier (regular, big win, jackpot)
   */
  static determineWinTier(
    payout: number,
    betAmount: number
  ): { isBigWin: boolean; isJackpot: boolean } {
    const ratio = payout / betAmount;
    
    return {
      isBigWin: ratio >= 25,
      isJackpot: ratio >= 100,
    };
  }
  
  /**
   * Calculate expected RTP for current configuration
   */
  static calculateExpectedRTP(
    payouts: number[],
    probabilities: number[]
  ): number {
    if (payouts.length !== probabilities.length) {
      throw new Error('Payouts and probabilities must have same length');
    }
    
    let expectedValue = 0;
    
    for (let i = 0; i < payouts.length; i++) {
      expectedValue += payouts[i] * probabilities[i];
    }
    
    return expectedValue;
  }
  
  /**
   * Calculate volatility index
   */
  static calculateVolatility(
    payouts: number[],
    probabilities: number[]
  ): 'low' | 'medium' | 'high' {
    const mean = this.calculateExpectedRTP(payouts, probabilities);
    
    // Calculate variance
    let variance = 0;
    for (let i = 0; i < payouts.length; i++) {
      variance += probabilities[i] * Math.pow(payouts[i] - mean, 2);
    }
    
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = standardDeviation / mean;
    
    if (coefficientOfVariation < 1) return 'low';
    if (coefficientOfVariation < 2) return 'medium';
    return 'high';
  }
  
  /**
   * Apply win cap to prevent excessive payouts
   */
  static applyWinCap(payout: number, maxWin: number): number {
    return Math.min(payout, maxWin);
  }
  
  /**
   * Calculate progressive jackpot contribution
   */
  static calculateJackpotContribution(
    betAmount: number,
    contributionRate: number = 0.01
  ): number {
    return betAmount * contributionRate;
  }
  
  /**
   * Format payout for display
   */
  static formatPayout(payout: number): string {
    if (payout >= 1000000) {
      return `${(payout / 1000000).toFixed(2)}M`;
    }
    if (payout >= 1000) {
      return `${(payout / 1000).toFixed(1)}K`;
    }
    return payout.toFixed(2);
  }
  
  /**
   * Calculate bonus round payout
   */
  static calculateBonusPayout(
    baseWin: number,
    bonusMultiplier: number,
    bonusCoins: number
  ): number {
    const coinBonus = bonusCoins * 10; // Each coin worth 10x base bet
    return (baseWin * bonusMultiplier) + coinBonus;
  }
  
  /**
   * Validate payout against RTP limits
   */
  static validatePayout(
    payout: number,
    betAmount: number,
    targetRTP: number,
    tolerance: number = 0.05
  ): boolean {
    const actualRTP = payout / betAmount;
    const minRTP = targetRTP - tolerance;
    const maxRTP = targetRTP + tolerance;
    
    return actualRTP >= minRTP && actualRTP <= maxRTP;
  }
}