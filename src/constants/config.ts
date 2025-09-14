import { Symbol, Payline, GameMath, BetOption } from '@/types';

// Game Configuration
export const GAME_CONFIG = {
  REELS: 5,
  ROWS: 3,
  PAYLINES: 20,
  MIN_BET: 0.10,
  MAX_BET: 100,
  DEFAULT_BET: 1,
  STARTING_BALANCE: 1000,
  MAX_WIN_MULTIPLIER: 5000,
  POWER_METER_MAX: 10,
  LIGHTNING_ROUND_DURATION: 5000, // 5 seconds
  SPIN_DURATION: 2000, // 2 seconds
  REEL_STOP_DELAY: 200, // Stagger between reels
  AUTO_PLAY_DELAY: 1000, // Delay between auto spins
};

// Game Mathematics - Realistic RTP
export const GAME_MATH: GameMath = {
  rtp: 0.96,
  hitFrequency: 0.286, // 28.6% - 1 in 3.5 spins
  maxWin: 5000,
  volatility: 'medium',
  baseGameRTP: 0.86,
  bonusGameRTP: 0.10,
};

// Symbol Definitions with Balanced Payouts
export const SYMBOLS: Record<string, Symbol> = {
  cherry: {
    id: 'cherry',
    name: 'Cherry',
    multiplier: [0, 0, 2, 5, 10], // 3x=2, 4x=5, 5x=10
    color: '#FF1744',
    icon: '🍒',
  },
  lemon: {
    id: 'lemon',
    name: 'Lemon',
    multiplier: [0, 0, 3, 8, 15], // 3x=3, 4x=8, 5x=15
    color: '#FFD600',
    icon: '🍋',
  },
  bell: {
    id: 'bell',
    name: 'Bell',
    multiplier: [0, 0, 5, 15, 30], // 3x=5, 4x=15, 5x=30
    color: '#FFC107',
    icon: '🔔',
  },
  bar: {
    id: 'bar',
    name: 'Bar',
    multiplier: [0, 0, 10, 25, 50], // 3x=10, 4x=25, 5x=50
    color: '#9C27B0',
    icon: '🟦',
  },
  seven: {
    id: 'seven',
    name: 'Seven',
    multiplier: [0, 0, 20, 50, 100], // 3x=20, 4x=50, 5x=100
    color: '#F44336',
    icon: '7️⃣',
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    multiplier: [0, 0, 50, 200, 500], // 3x=50, 4x=200, 5x=500 (JACKPOT)
    isWild: true,
    color: '#00BCD4',
    icon: '💎',
  },
};

// Reel Strips with Proper Symbol Distribution
// 40% low (cherry, lemon), 30% medium (bell, bar), 20% high (seven), 10% wild (diamond)
export const REEL_STRIPS = [
  // Reel 1 - 20 symbols total
  ['cherry', 'cherry', 'cherry', 'cherry', 'lemon', 'lemon', 'lemon', 'lemon',  // 8 low (40%)
   'bell', 'bell', 'bell', 'bar', 'bar', 'bar',                                  // 6 medium (30%)
   'seven', 'seven', 'seven', 'seven',                                           // 4 high (20%)
   'diamond', 'diamond'],                                                         // 2 wild (10%)
   
  // Reel 2 - 20 symbols total
  ['cherry', 'cherry', 'cherry', 'lemon', 'lemon', 'lemon', 'lemon', 'lemon',   // 8 low (40%)
   'bell', 'bell', 'bell', 'bar', 'bar', 'bar',                                  // 6 medium (30%)
   'seven', 'seven', 'seven', 'seven',                                           // 4 high (20%)
   'diamond', 'diamond'],                                                         // 2 wild (10%)
   
  // Reel 3 - 20 symbols total (center reel - slightly fewer wilds)
  ['cherry', 'cherry', 'cherry', 'cherry', 'lemon', 'lemon', 'lemon', 'lemon',  // 8 low (40%)
   'bell', 'bell', 'bell', 'bar', 'bar', 'bar',                                  // 6 medium (30%)
   'seven', 'seven', 'seven', 'seven', 'seven',                                  // 5 high (25%)
   'diamond'],                                                                    // 1 wild (5%)
   
  // Reel 4 - 20 symbols total
  ['cherry', 'cherry', 'cherry', 'lemon', 'lemon', 'lemon', 'lemon', 'lemon',   // 8 low (40%)
   'bell', 'bell', 'bell', 'bar', 'bar', 'bar',                                  // 6 medium (30%)
   'seven', 'seven', 'seven', 'seven',                                           // 4 high (20%)
   'diamond', 'diamond'],                                                         // 2 wild (10%)
   
  // Reel 5 - 20 symbols total (last reel - slightly fewer high symbols)
  ['cherry', 'cherry', 'cherry', 'cherry', 'lemon', 'lemon', 'lemon', 'lemon', 'lemon', // 9 low (45%)
   'bell', 'bell', 'bell', 'bar', 'bar', 'bar',                                         // 6 medium (30%)
   'seven', 'seven', 'seven',                                                           // 3 high (15%)
   'diamond', 'diamond'],                                                                // 2 wild (10%)
];

// Payline Patterns
export const PAYLINES: Payline[] = [
  { id: 1, name: 'Center', positions: [[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]], color: '#FF0000' },
  { id: 2, name: 'Top', positions: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], color: '#00FF00' },
  { id: 3, name: 'Bottom', positions: [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4]], color: '#0000FF' },
  { id: 4, name: 'V-Shape', positions: [[0, 0], [1, 1], [2, 2], [1, 3], [0, 4]], color: '#FFFF00' },
  { id: 5, name: 'Inverted-V', positions: [[2, 0], [1, 1], [0, 2], [1, 3], [2, 4]], color: '#FF00FF' },
  { id: 6, name: 'W-Shape', positions: [[0, 0], [2, 1], [0, 2], [2, 3], [0, 4]], color: '#00FFFF' },
  { id: 7, name: 'M-Shape', positions: [[2, 0], [0, 1], [2, 2], [0, 3], [2, 4]], color: '#FFA500' },
  { id: 8, name: 'Diagonal-Down', positions: [[0, 0], [1, 1], [1, 2], [1, 3], [2, 4]], color: '#800080' },
  { id: 9, name: 'Diagonal-Up', positions: [[2, 0], [1, 1], [1, 2], [1, 3], [0, 4]], color: '#008080' },
  { id: 10, name: 'Top-Center', positions: [[0, 0], [1, 1], [1, 2], [1, 3], [0, 4]], color: '#FF1493' },
  { id: 11, name: 'Bottom-Center', positions: [[2, 0], [1, 1], [1, 2], [1, 3], [2, 4]], color: '#32CD32' },
  { id: 12, name: 'Zigzag-1', positions: [[0, 0], [1, 1], [0, 2], [1, 3], [0, 4]], color: '#FFD700' },
  { id: 13, name: 'Zigzag-2', positions: [[2, 0], [1, 1], [2, 2], [1, 3], [2, 4]], color: '#DC143C' },
  { id: 14, name: 'Top-Wave', positions: [[1, 0], [0, 1], [1, 2], [0, 3], [1, 4]], color: '#4B0082' },
  { id: 15, name: 'Bottom-Wave', positions: [[1, 0], [2, 1], [1, 2], [2, 3], [1, 4]], color: '#FF4500' },
  { id: 16, name: 'Diamond', positions: [[1, 0], [0, 1], [1, 2], [2, 3], [1, 4]], color: '#2E8B57' },
  { id: 17, name: 'Hourglass', positions: [[0, 0], [1, 1], [1, 2], [1, 3], [0, 4]], color: '#8B4513' },
  { id: 18, name: 'Cross', positions: [[1, 0], [1, 1], [0, 2], [1, 3], [1, 4]], color: '#708090' },
  { id: 19, name: 'L-Shape', positions: [[0, 0], [0, 1], [0, 2], [1, 3], [2, 4]], color: '#FF69B4' },
  { id: 20, name: 'J-Shape', positions: [[2, 0], [2, 1], [2, 2], [1, 3], [0, 4]], color: '#00CED1' },
];

// Betting Options - Dynamic max will be handled by component
export const BET_OPTIONS: BetOption[] = [
  { value: 0.10, label: '$0.10' },
  { value: 0.25, label: '$0.25' },
  { value: 0.50, label: '$0.50' },
  { value: 1.00, label: '$1.00', isQuick: true },
  { value: 2.00, label: '$2.00' },
  { value: 5.00, label: '$5.00', isQuick: true },
  { value: 10.00, label: '$10.00', isQuick: true },
  { value: 25.00, label: '$25.00' },
  { value: 50.00, label: '$50.00' },
  { value: 100.00, label: 'MAX', isQuick: true }, // Will be dynamic
];

// Level Progression
export const LEVEL_CONFIG = {
  BASE_XP: 100,
  XP_MULTIPLIER: 1.5,
  MAX_LEVEL: 100,
  XP_PER_SPIN: 10,
  XP_PER_WIN: 25,
  XP_PER_BIG_WIN: 100,
  XP_PER_ACHIEVEMENT: 50,
};

// Lightning Round Configuration
export const LIGHTNING_CONFIG = {
  MIN_COINS: 20,
  MAX_COINS: 40,
  MIN_COIN_VALUE: 2,
  MAX_COIN_VALUE: 10,
  COIN_FALL_SPEED: 2,
  COIN_SIZE: 40,
  SPAWN_RATE: 200, // ms between spawns
};

// Achievement Definitions
export const ACHIEVEMENTS = [
  {
    id: 'first-spin',
    name: 'First Spin',
    description: 'Complete your first spin',
    target: 1,
    reward: { type: 'xp' as const, amount: 50 },
  },
  {
    id: 'lucky-seven',
    name: 'Lucky Seven',
    description: 'Get three sevens in a row',
    target: 1,
    reward: { type: 'coins' as const, amount: 100 },
  },
  {
    id: 'lightning-master',
    name: 'Lightning Master',
    description: 'Complete 10 Lightning Rounds',
    target: 10,
    reward: { type: 'multiplier' as const, amount: 2 },
  },
  {
    id: 'high-roller',
    name: 'High Roller',
    description: 'Place a max bet',
    target: 1,
    reward: { type: 'xp' as const, amount: 100 },
  },
  {
    id: 'winning-streak',
    name: 'Winning Streak',
    description: 'Win 5 times in a row',
    target: 5,
    reward: { type: 'coins' as const, amount: 500 },
  },
];

// Animation Timings
export const ANIMATION_CONFIG = {
  REEL_SPIN_SPEED: 100,
  REEL_STOP_DURATION: 500,
  WIN_HIGHLIGHT_DURATION: 2000,
  COIN_DROP_ANIMATION: 1000,
  LEVEL_UP_ANIMATION: 3000,
  ACHIEVEMENT_POPUP_DURATION: 4000,
};

// Sound File Paths
export const SOUND_PATHS = {
  spin: '/sounds/spin.mp3',
  win: '/sounds/win.mp3',
  bigWin: '/sounds/bigwin.mp3',
  coin: '/sounds/coin.mp3',
  lightning: '/sounds/lightning.mp3',
  levelUp: '/sounds/level-up.mp3',
  achievement: '/sounds/achievement.mp3',
  background: '/sounds/background.mp3',
};