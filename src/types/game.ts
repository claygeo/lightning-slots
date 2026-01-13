// ============================================
// ROYAL JACKPOT - Type Definitions
// ============================================

// Symbol Types
export type SymbolId =
  | 'crown'      // Wild - Highest value
  | 'diamond'    // Premium symbol
  | 'seven'      // High value
  | 'bar'        // Medium-high value
  | 'bell'       // Medium value
  | 'cherry'     // Low value
  | 'lemon'      // Low value
  | 'grape';     // Low value

export interface GameSymbol {
  id: SymbolId;
  name: string;
  emoji: string;
  image?: string;
  isWild: boolean;
  isScatter: boolean;
  payouts: {
    3: number;
    4: number;
    5: number;
  };
  weight: number; // Reel weight for probability
}

// Reel & Grid Types
export interface ReelPosition {
  reel: number;
  row: number;
  symbol: SymbolId;
}

export type ReelGrid = SymbolId[][];

export interface ReelState {
  symbols: SymbolId[];
  spinning: boolean;
  stopIndex: number;
}

// Win Types
export interface WinLine {
  paylineIndex: number;
  positions: ReelPosition[];
  symbol: SymbolId;
  count: number;
  payout: number;
}

export interface SpinResult {
  grid: ReelGrid;
  wins: WinLine[];
  totalWin: number;
  isJackpot: boolean;
  isBigWin: boolean;
  isMegaWin: boolean;
  freeSpinsWon: number;
  bonusTriggered: boolean;
}

// Player Types
export interface Player {
  id: string;
  username: string;
  pinHash: string;
  balance: number;
  level: number;
  experience: number;
  totalSpins: number;
  totalWins: number;
  totalWagered: number;
  biggestWin: number;
  currentStreak: number;
  bestStreak: number;
  achievements: string[];
  vipTier: VIPTier;
  createdAt: string;
  updatedAt: string;
  lastSeen: string;
}

export type VIPTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  reward: number;
  category: 'spins' | 'wins' | 'streaks' | 'jackpots' | 'special';
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  score: number;
  level: number;
  biggestWin: number;
  vipTier: VIPTier;
}

// Game State Types
export interface GameState {
  // Core game state
  balance: number;
  bet: number;
  isSpinning: boolean;
  isAutoSpin: boolean;
  autoSpinCount: number;

  // Current spin
  currentGrid: ReelGrid;
  lastResult: SpinResult | null;
  winningLines: number[];

  // Bonus features
  freeSpinsRemaining: number;
  freeSpinsTotalWin: number;
  multiplier: number;
  jackpotMeter: number;

  // Player progress
  level: number;
  experience: number;
  experienceToNextLevel: number;
  totalSpins: number;
  totalWins: number;
  biggestWin: number;
  currentStreak: number;

  // Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  turboMode: boolean;

  // Auth
  isLoggedIn: boolean;
  player: Player | null;
}

// Action Types
export type GameAction =
  | { type: 'SET_BET'; payload: number }
  | { type: 'SPIN_START' }
  | { type: 'SPIN_COMPLETE'; payload: SpinResult }
  | { type: 'ADD_BALANCE'; payload: number }
  | { type: 'SET_AUTO_SPIN'; payload: { enabled: boolean; count: number } }
  | { type: 'TRIGGER_FREE_SPINS'; payload: number }
  | { type: 'USE_FREE_SPIN' }
  | { type: 'SET_MULTIPLIER'; payload: number }
  | { type: 'ADD_EXPERIENCE'; payload: number }
  | { type: 'LEVEL_UP' }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'TOGGLE_TURBO' }
  | { type: 'LOGIN'; payload: Player }
  | { type: 'LOGOUT' }
  | { type: 'SYNC_PROGRESS'; payload: Partial<Player> };

// Payline Pattern (defines which positions form a payline)
export type PaylinePattern = [number, number, number, number, number];

// Animation Types
export interface AnimationConfig {
  spinDuration: number;
  reelStopDelay: number;
  winDisplayDuration: number;
  celebrationDuration: number;
}

// Sound Types
export type SoundEffect =
  | 'spin'
  | 'reel-stop'
  | 'win-small'
  | 'win-medium'
  | 'win-big'
  | 'win-mega'
  | 'jackpot'
  | 'bonus'
  | 'free-spin'
  | 'level-up'
  | 'achievement'
  | 'button-click'
  | 'coin-drop';

// Theme Types
export interface Theme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
}
