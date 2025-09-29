/**
 * Balanced payout configuration for realistic slot gameplay
 */

export interface PayoutTable {
  symbol: string;
  name: string;
  x3: number;
  x4: number;
  x5: number;
  isWild?: boolean;
}

// BALANCED payout table - much more realistic than before
export const PAYOUT_TABLE: PayoutTable[] = [
  {
    symbol: 'cherry',
    name: 'Cherry',
    x3: 1,    // Was 2 - reduced for balance
    x4: 3,    // Was 5 - reduced for balance
    x5: 6,    // Was 10 - reduced for balance
  },
  {
    symbol: 'lemon',
    name: 'Lemon',
    x3: 2,    // Was 3 - slightly reduced
    x4: 5,    // Was 8 - reduced for balance
    x5: 10,   // Was 15 - reduced for balance
  },
  {
    symbol: 'bell',
    name: 'Bell',
    x3: 3,    // Was 5 - reduced for balance
    x4: 8,    // Was 15 - reduced for balance
    x5: 20,   // Was 30 - reduced for balance
  },
  {
    symbol: 'bar',
    name: 'Bar',
    x3: 5,    // Was 10 - reduced for balance
    x4: 15,   // Was 25 - reduced for balance
    x5: 35,   // Was 50 - reduced for balance
  },
  {
    symbol: 'seven',
    name: 'Seven',
    x3: 10,   // Was 20 - reduced for balance
    x4: 30,   // Was 50 - reduced for balance
    x5: 75,   // Was 100 - reduced for balance
  },
  {
    symbol: 'diamond',
    name: 'Diamond (Wild)',
    x3: 25,   // Was 50 - reduced for balance
    x4: 100,  // Was 200 - reduced for balance
    x5: 250,  // Was 500 - reduced for balance
    isWild: true,
  },
];

// Adjusted win categories for better balance
export const WIN_CATEGORIES = {
  SMALL: { min: 0, max: 3, label: 'WIN', color: '#FFD700' },
  MEDIUM: { min: 3, max: 15, label: 'NICE WIN', color: '#FFA500' },
  BIG: { min: 15, max: 50, label: 'BIG WIN', color: '#FF6347' },
  MEGA: { min: 50, max: 150, label: 'MEGA WIN', color: '#FF1493' },
  JACKPOT: { min: 150, max: Infinity, label: 'JACKPOT', color: '#9400D3' },
};

/**
 * Calculate win category based on multiplier
 */
export function getWinCategory(multiplier: number) {
  for (const [key, category] of Object.entries(WIN_CATEGORIES)) {
    if (multiplier > category.min && multiplier <= category.max) {
      return { key, ...category };
    }
  }
  return WIN_CATEGORIES.SMALL;
}

/**
 * Calculate payout for a specific symbol combination
 */
export function calculatePayout(symbol: string, count: number): number {
  const payoutData = PAYOUT_TABLE.find(p => p.symbol === symbol);
  if (!payoutData) return 0;

  switch (count) {
    case 3:
      return payoutData.x3;
    case 4:
      return payoutData.x4;
    case 5:
      return payoutData.x5;
    default:
      return 0;
  }
}

/**
 * Format win amount for display
 */
export function formatWin(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  } else if (amount >= 100) {
    return amount.toFixed(0);
  } else {
    return amount.toFixed(2);
  }
}

/**
 * Calculate total win including line wins and multipliers
 */
export function calculateTotalWin(
  lineWins: number[],
  bet: number,
  multiplier: number = 1
): number {
  const baseWin = lineWins.reduce((sum, win) => sum + win, 0);
  return baseWin * bet * multiplier;
}

/**
 * Get payout info for display
 */
export function getPayoutInfo(symbol: string): PayoutTable | undefined {
  return PAYOUT_TABLE.find(p => p.symbol === symbol);
}

/**
 * Check if win qualifies for special effects - ADJUSTED THRESHOLDS
 */
export function getWinEffects(multiplier: number): {
  confetti: boolean;
  sound: 'win' | 'bigwin' | 'jackpot';
  duration: number;
} {
  if (multiplier >= 150) {
    return { confetti: true, sound: 'jackpot', duration: 5000 };
  } else if (multiplier >= 50) {
    return { confetti: true, sound: 'bigwin', duration: 4000 };
  } else if (multiplier >= 15) {
    return { confetti: false, sound: 'bigwin', duration: 3000 };
  } else {
    return { confetti: false, sound: 'win', duration: 2000 };
  }
}

/**
 * Calculate progressive betting recommendations
 */
export function getBettingStrategy(balance: number, currentBet: number): {
  recommended: number;
  safe: number;
  aggressive: number;
} {
  const balanceRatio = balance / 1000; // Relative to starting balance
  
  return {
    recommended: Math.max(1, Math.floor(balance * 0.02)), // 2% of balance
    safe: Math.max(1, Math.floor(balance * 0.01)),        // 1% of balance
    aggressive: Math.max(1, Math.floor(balance * 0.05)),  // 5% of balance
  };
}

/**
 * Calculate session statistics
 */
export function calculateSessionStats(
  spins: number,
  totalWagered: number,
  totalWon: number,
  startingBalance: number,
  currentBalance: number
): {
  rtp: number;
  netResult: number;
  hitRate: number;
  averageWin: number;
} {
  const netResult = currentBalance - startingBalance;
  const rtp = totalWagered > 0 ? (totalWon / totalWagered) : 0;
  
  return {
    rtp,
    netResult,
    hitRate: spins > 0 ? (totalWon > 0 ? 0.18 : 0) : 0, // Theoretical hit rate
    averageWin: spins > 0 ? totalWon / spins : 0,
  };
}