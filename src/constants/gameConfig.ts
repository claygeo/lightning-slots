// ============================================
// ROYAL JACKPOT - Game Configuration
// ============================================

import { GameSymbol, PaylinePattern, Achievement, AnimationConfig } from '@/types/game';

// ============================================
// Core Game Settings
// ============================================

export const GAME_CONFIG = {
  NAME: 'Royal Jackpot',
  VERSION: '2.0.0',

  // Grid Configuration
  REELS: 5,
  ROWS: 3,
  TOTAL_SYMBOLS: 15, // 5 reels * 3 rows

  // Betting
  MIN_BET: 0.10,
  MAX_BET: 500,
  DEFAULT_BET: 1,
  BET_INCREMENTS: [0.10, 0.25, 0.50, 1, 2, 5, 10, 25, 50, 100, 250, 500],

  // Starting Values
  STARTING_BALANCE: 1000,
  DEMO_BALANCE: 10000,

  // Win Limits
  MAX_WIN_MULTIPLIER: 10000,

  // Auto Spin
  AUTO_SPIN_OPTIONS: [10, 25, 50, 100, 'infinite'],

  // Experience & Leveling
  BASE_XP: 100,
  XP_MULTIPLIER: 1.4,
  MAX_LEVEL: 100,
  XP_PER_SPIN: 10,
  XP_PER_WIN: 25,
  XP_BIG_WIN_BONUS: 100,
  XP_JACKPOT_BONUS: 500,

  // Jackpot
  JACKPOT_CONTRIBUTION: 0.01, // 1% of each bet goes to jackpot
  JACKPOT_TRIGGER_CHANCE: 0.0001, // 0.01% base chance

  // Free Spins
  FREE_SPINS_TRIGGER: 3, // Scatter symbols needed
  FREE_SPINS_AWARD: [10, 15, 25], // For 3, 4, 5 scatters
  FREE_SPINS_MULTIPLIER: 2,
} as const;

// ============================================
// Game Mathematics
// ============================================

export const GAME_MATH = {
  RTP: 0.96, // 96% Return to Player
  HIT_FREQUENCY: 0.22, // 22% of spins result in a win
  VOLATILITY: 'medium-high',

  // Win Distribution (when a win occurs)
  WIN_DISTRIBUTION: {
    small: 0.70,    // 70% small wins (2x-8x)
    medium: 0.20,   // 20% medium wins (8x-25x)
    big: 0.08,      // 8% big wins (25x-100x)
    mega: 0.018,    // 1.8% mega wins (100x-500x)
    jackpot: 0.002, // 0.2% jackpot wins (500x+)
  },

  // Win Categories (multiplier thresholds)
  WIN_THRESHOLDS: {
    big: 20,      // 20x bet = Big Win
    mega: 50,     // 50x bet = Mega Win
    jackpot: 100, // 100x bet = Jackpot
  },

  // Streak management (prevents exploitation)
  MAX_WIN_STREAK: 5,
  STREAK_REDUCTION: 0.15, // 15% reduction per streak
} as const;

// ============================================
// Symbol Configuration
// ============================================

export const SYMBOLS: Record<string, GameSymbol> = {
  crown: {
    id: 'crown',
    name: 'Royal Crown',
    emoji: '👑',
    isWild: true,
    isScatter: false,
    payouts: { 3: 50, 4: 200, 5: 1000 },
    weight: 5,
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    emoji: '💎',
    isWild: false,
    isScatter: true,
    payouts: { 3: 25, 4: 100, 5: 500 },
    weight: 8,
  },
  seven: {
    id: 'seven',
    name: 'Lucky Seven',
    emoji: '7️⃣',
    isWild: false,
    isScatter: false,
    payouts: { 3: 20, 4: 75, 5: 300 },
    weight: 10,
  },
  bar: {
    id: 'bar',
    name: 'Gold Bar',
    emoji: '🏆',
    isWild: false,
    isScatter: false,
    payouts: { 3: 15, 4: 50, 5: 200 },
    weight: 12,
  },
  bell: {
    id: 'bell',
    name: 'Golden Bell',
    emoji: '🔔',
    isWild: false,
    isScatter: false,
    payouts: { 3: 10, 4: 30, 5: 100 },
    weight: 15,
  },
  cherry: {
    id: 'cherry',
    name: 'Cherry',
    emoji: '🍒',
    isWild: false,
    isScatter: false,
    payouts: { 3: 5, 4: 15, 5: 50 },
    weight: 18,
  },
  lemon: {
    id: 'lemon',
    name: 'Lemon',
    emoji: '🍋',
    isWild: false,
    isScatter: false,
    payouts: { 3: 3, 4: 10, 5: 30 },
    weight: 20,
  },
  grape: {
    id: 'grape',
    name: 'Grape',
    emoji: '🍇',
    isWild: false,
    isScatter: false,
    payouts: { 3: 2, 4: 8, 5: 25 },
    weight: 22,
  },
};

export const SYMBOL_LIST = Object.values(SYMBOLS);
export const WILD_SYMBOL = SYMBOLS.crown;
export const SCATTER_SYMBOL = SYMBOLS.diamond;

// ============================================
// Payline Patterns (25 paylines)
// Pattern: [row index for each of 5 reels]
// Row indices: 0 = top, 1 = middle, 2 = bottom
// ============================================

export const PAYLINES: PaylinePattern[] = [
  // Classic horizontal lines
  [1, 1, 1, 1, 1], // 1: Middle line
  [0, 0, 0, 0, 0], // 2: Top line
  [2, 2, 2, 2, 2], // 3: Bottom line

  // V-shapes
  [0, 1, 2, 1, 0], // 4: V shape
  [2, 1, 0, 1, 2], // 5: Inverted V

  // Zigzags
  [0, 0, 1, 2, 2], // 6: Descending zigzag
  [2, 2, 1, 0, 0], // 7: Ascending zigzag
  [1, 0, 0, 0, 1], // 8: Top dip
  [1, 2, 2, 2, 1], // 9: Bottom dip

  // Waves
  [0, 1, 0, 1, 0], // 10: Top wave
  [2, 1, 2, 1, 2], // 11: Bottom wave
  [1, 0, 1, 0, 1], // 12: Upper wave
  [1, 2, 1, 2, 1], // 13: Lower wave

  // Stairs
  [0, 0, 1, 1, 2], // 14: Descending stairs
  [2, 2, 1, 1, 0], // 15: Ascending stairs
  [0, 1, 1, 1, 0], // 16: Plateau top
  [2, 1, 1, 1, 2], // 17: Plateau bottom

  // Complex patterns
  [1, 0, 2, 0, 1], // 18: W pattern
  [1, 2, 0, 2, 1], // 19: M pattern
  [0, 2, 0, 2, 0], // 20: Extreme zigzag
  [2, 0, 2, 0, 2], // 21: Inverse extreme zigzag

  // Mixed
  [0, 1, 2, 2, 2], // 22: Drop off
  [2, 1, 0, 0, 0], // 23: Climb up
  [0, 0, 0, 1, 2], // 24: Late drop
  [2, 2, 2, 1, 0], // 25: Late climb
];

// ============================================
// Animation Configuration
// ============================================

export const ANIMATION_CONFIG: AnimationConfig = {
  spinDuration: 2500,      // Base spin time in ms
  reelStopDelay: 300,      // Delay between each reel stopping
  winDisplayDuration: 2000, // How long to show win animation
  celebrationDuration: 4000, // Confetti/celebration duration
};

export const TURBO_ANIMATION_CONFIG: AnimationConfig = {
  spinDuration: 800,
  reelStopDelay: 100,
  winDisplayDuration: 1000,
  celebrationDuration: 2000,
};

// ============================================
// Achievements
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
  // Spin Achievements
  { id: 'first-spin', name: 'Rookie Spinner', description: 'Complete your first spin', icon: '🎰', requirement: 1, reward: 50, category: 'spins' },
  { id: 'spins-100', name: 'Getting Started', description: 'Complete 100 spins', icon: '💫', requirement: 100, reward: 100, category: 'spins' },
  { id: 'spins-500', name: 'Regular Player', description: 'Complete 500 spins', icon: '⭐', requirement: 500, reward: 250, category: 'spins' },
  { id: 'spins-1000', name: 'Dedicated Gambler', description: 'Complete 1,000 spins', icon: '🌟', requirement: 1000, reward: 500, category: 'spins' },
  { id: 'spins-5000', name: 'Slot Master', description: 'Complete 5,000 spins', icon: '✨', requirement: 5000, reward: 1000, category: 'spins' },

  // Win Achievements
  { id: 'first-win', name: 'Winner!', description: 'Win for the first time', icon: '🎉', requirement: 1, reward: 25, category: 'wins' },
  { id: 'wins-50', name: 'Lucky Charm', description: 'Win 50 times', icon: '🍀', requirement: 50, reward: 200, category: 'wins' },
  { id: 'wins-100', name: 'On a Roll', description: 'Win 100 times', icon: '🎲', requirement: 100, reward: 400, category: 'wins' },
  { id: 'wins-500', name: 'Fortune Favored', description: 'Win 500 times', icon: '💰', requirement: 500, reward: 1000, category: 'wins' },

  // Streak Achievements
  { id: 'streak-3', name: 'Hot Streak', description: 'Win 3 spins in a row', icon: '🔥', requirement: 3, reward: 75, category: 'streaks' },
  { id: 'streak-5', name: 'Fire Streak', description: 'Win 5 spins in a row', icon: '🔥', requirement: 5, reward: 150, category: 'streaks' },
  { id: 'streak-7', name: 'Unstoppable', description: 'Win 7 spins in a row', icon: '⚡', requirement: 7, reward: 300, category: 'streaks' },
  { id: 'streak-10', name: 'Legendary Streak', description: 'Win 10 spins in a row', icon: '👑', requirement: 10, reward: 500, category: 'streaks' },

  // Jackpot Achievements
  { id: 'big-win', name: 'Big Winner', description: 'Get a Big Win (20x+)', icon: '💎', requirement: 1, reward: 100, category: 'jackpots' },
  { id: 'mega-win', name: 'Mega Winner', description: 'Get a Mega Win (50x+)', icon: '💎', requirement: 1, reward: 250, category: 'jackpots' },
  { id: 'jackpot', name: 'Jackpot!', description: 'Hit the Jackpot (100x+)', icon: '🏆', requirement: 1, reward: 500, category: 'jackpots' },
  { id: 'crown-five', name: 'Royal Flush', description: 'Get 5 Crowns on a payline', icon: '👑', requirement: 1, reward: 1000, category: 'jackpots' },

  // Special Achievements
  { id: 'free-spins', name: 'Free Roller', description: 'Trigger Free Spins', icon: '💫', requirement: 1, reward: 100, category: 'special' },
  { id: 'max-bet', name: 'High Roller', description: 'Place a maximum bet', icon: '💵', requirement: 1, reward: 50, category: 'special' },
  { id: 'level-10', name: 'Rising Star', description: 'Reach Level 10', icon: '⭐', requirement: 10, reward: 200, category: 'special' },
  { id: 'level-25', name: 'Veteran', description: 'Reach Level 25', icon: '🌟', requirement: 25, reward: 500, category: 'special' },
  { id: 'level-50', name: 'Elite Player', description: 'Reach Level 50', icon: '✨', requirement: 50, reward: 1000, category: 'special' },
  { id: 'level-100', name: 'Legend', description: 'Reach Level 100', icon: '👑', requirement: 100, reward: 5000, category: 'special' },
];

// ============================================
// VIP Tiers
// ============================================

export const VIP_TIERS = {
  bronze: { minLevel: 1, name: 'Bronze', color: '#cd7f32', bonusMultiplier: 1.0 },
  silver: { minLevel: 10, name: 'Silver', color: '#c0c0c0', bonusMultiplier: 1.1 },
  gold: { minLevel: 25, name: 'Gold', color: '#ffd700', bonusMultiplier: 1.25 },
  platinum: { minLevel: 50, name: 'Platinum', color: '#e5e4e2', bonusMultiplier: 1.5 },
  diamond: { minLevel: 75, name: 'Diamond', color: '#b9f2ff', bonusMultiplier: 2.0 },
} as const;

// ============================================
// Reel Strip (weighted symbol distribution)
// ============================================

export function generateWeightedReelStrip(): string[] {
  const reelStrip: string[] = [];

  for (const symbol of SYMBOL_LIST) {
    for (let i = 0; i < symbol.weight; i++) {
      reelStrip.push(symbol.id);
    }
  }

  // Shuffle the reel strip
  for (let i = reelStrip.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [reelStrip[i], reelStrip[j]] = [reelStrip[j], reelStrip[i]];
  }

  return reelStrip;
}

// Create 5 unique reel strips
export const REEL_STRIPS = Array.from({ length: 5 }, () => generateWeightedReelStrip());
