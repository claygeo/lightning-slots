/**
 * Payout configuration and calculation utilities
 */

export interface PayoutTable {
  symbol: string;
  name: string;
  x3: number;
  x4: number;
  x5: number;
  isWild?: boolean;
}

// Main payout table
export const PAYOUT_TABLE: PayoutTable[] = [
  {
    symbol: 'cherry',
    name: 'Cherry',
    x3: 2,
    x4: 5,
    x5: 10,
  },
  {
    symbol: 'lemon',
    name: 'Lemon',
    x3: 3,
    x4: 8,
    x5: 15,
  },
  {
    symbol: 'bell',
    name: 'Bell',
    x3: 5,
    x4: 15,
    x5: 30,
  },
  {
    symbol: 'bar',
    name: 'Bar',
    x3: 10,
    x4: 25,
    x5: 50,
  },
  {
    symbol: 'seven',
    name: 'Seven',
    x3: 20,
    x4: 50,
    x5: 100,
  },
  {
    symbol: 'diamond',
    name: 'Diamond (Wild)',
    x3: 50,
    x4: 200,
    x5: 500,
    isWild: true,
  },
];

// Win categories for display
export const WIN_CATEGORIES = {
  SMALL: { min: 0, max: 5, label: 'WIN', color: '#FFD700' },
  MEDIUM: { min: 5, max: 20, label: 'NICE WIN', color: '#FFA500' },
  BIG: { min: 20, max: 100, label: 'BIG WIN', color: '#FF6347' },
  MEGA: { min: 100, max: 500, label: 'MEGA WIN', color: '#FF1493' },
  JACKPOT: { min: 500, max: Infinity, label: 'JACKPOT', color: '#9400D3' },
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
 * Check if win qualifies for special effects
 */
export function getWinEffects(multiplier: number): {
  confetti: boolean;
  sound: 'win' | 'bigwin' | 'jackpot';
  duration: number;
} {
  if (multiplier >= 500) {
    return { confetti: true, sound: 'jackpot', duration: 5000 };
  } else if (multiplier >= 100) {
    return { confetti: true, sound: 'bigwin', duration: 4000 };
  } else if (multiplier >= 20) {
    return { confetti: false, sound: 'bigwin', duration: 3000 };
  } else {
    return { confetti: false, sound: 'win', duration: 2000 };
  }
}