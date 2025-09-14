// Main type definitions for Lightning Slots™

// Symbol types
export type SymbolType = 'cherry' | 'lemon' | 'bell' | 'bar' | 'seven' | 'diamond';

export interface Symbol {
  id: SymbolType;
  name: string;
  multiplier: number[];
  isWild?: boolean;
  color: string;
  icon: string;
}

// Reel types
export interface ReelPosition {
  symbol: SymbolType;
  row: number;
  col: number;
}

export interface ReelState {
  positions: SymbolType[];
  isSpinning: boolean;
  currentPosition: number;
  targetPosition: number;
}

// Win types
export interface WinLine {
  lineId: number;
  symbols: SymbolType[];
  positions: ReelPosition[];
  payout: number;
  multiplier: number;
}

export interface WinResult {
  winLines: WinLine[];
  totalWin: number;
  isJackpot: boolean;
  isBigWin: boolean;
}

// Game state types
export interface GameState {
  balance: number;
  bet: number;
  totalWin: number;
  isSpinning: boolean;
  isAutoPlay: boolean;
  autoPlayCount: number;
  reels: ReelState[];
  lastWin: WinResult | null;
  powerMeter: number;
  isLightningRound: boolean;
  lightningMultiplier: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

// Lightning Round types
export interface LightningCoin {
  id: string;
  x: number;
  y: number;
  value: number;
  speed: number;
  collected: boolean;
}

export interface LightningRoundState {
  active: boolean;
  timeRemaining: number;
  coins: LightningCoin[];
  totalCollected: number;
  multiplierEarned: number;
}

// Progression types
export interface PlayerProgress {
  level: number;
  experience: number;
  experienceToNext: number;
  totalSpins: number;
  totalWins: number;
  biggestWin: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  target: number;
  reward: {
    type: 'xp' | 'coins' | 'multiplier';
    amount: number;
  };
}

// Betting types
export interface BetOption {
  value: number;
  label: string;
  isQuick?: boolean;
}

// Animation types
export interface AnimationConfig {
  spinDuration: number;
  stopDelay: number;
  winCelebrationDuration: number;
  symbolDropDuration: number;
  reelStopStagger: number;
}

// Sound types
export interface SoundConfig {
  enabled: boolean;
  volume: number;
  sounds: {
    spin: string;
    stop: string;
    win: string;
    bigWin: string;
    coin: string;
    lightning: string;
    levelUp: string;
    achievement: string;
  };
}

// Settings types
export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  showPaylines: boolean;
  quickSpin: boolean;
  autoPlaySpeed: 'slow' | 'normal' | 'fast';
}

// Store types
export interface GameStore {
  // State
  gameState: GameState;
  playerProgress: PlayerProgress;
  settings: GameSettings;
  
  // Actions
  spin: () => void;
  stopSpin: () => void;
  setBet: (bet: number) => void;
  toggleAutoPlay: () => void;
  collectLightningCoin: (coinId: string) => void;
  updateBalance: (amount: number) => void;
  addExperience: (xp: number) => void;
  unlockAchievement: (achievementId: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetGame: () => void;
  saveProgress: () => void;
  loadProgress: () => void;
}

// Payline definitions
export interface Payline {
  id: number;
  name: string;
  positions: [number, number][];
  color: string;
}

// RTP and game math types
export interface GameMath {
  rtp: number;
  hitFrequency: number;
  maxWin: number;
  volatility: 'low' | 'medium' | 'high';
  baseGameRTP: number;
  bonusGameRTP: number;
}

// UI Component props types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}