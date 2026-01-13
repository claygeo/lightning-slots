// ============================================
// ROYAL JACKPOT - Game Engine
// Advanced slot machine mechanics with fair RNG
// ============================================

import {
  SymbolId,
  ReelGrid,
  SpinResult,
  WinLine,
  ReelPosition,
} from '@/types/game';
import {
  GAME_CONFIG,
  GAME_MATH,
  SYMBOLS,
  SYMBOL_LIST,
  PAYLINES,
  WILD_SYMBOL,
  SCATTER_SYMBOL,
  REEL_STRIPS,
} from '@/constants/gameConfig';

// ============================================
// Cryptographically Secure RNG
// ============================================

class SecureRNG {
  private static instance: SecureRNG;

  private constructor() {}

  static getInstance(): SecureRNG {
    if (!SecureRNG.instance) {
      SecureRNG.instance = new SecureRNG();
    }
    return SecureRNG.instance;
  }

  // Generate random number between 0 and 1
  random(): number {
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] / (0xFFFFFFFF + 1);
    }
    return Math.random();
  }

  // Generate random integer between min and max (inclusive)
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  // Pick random element from array
  randomChoice<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)];
  }

  // Weighted random selection
  weightedChoice(weights: number[]): number {
    const total = weights.reduce((sum, w) => sum + w, 0);
    let random = this.random() * total;

    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return i;
    }

    return weights.length - 1;
  }
}

const rng = SecureRNG.getInstance();

// ============================================
// Game Engine Class
// ============================================

export class GameEngine {
  private recentResults: boolean[] = []; // Track win/loss for streak management
  private sessionPayouts: number = 0;
  private sessionWagers: number = 0;

  constructor() {
    this.recentResults = [];
  }

  // ============================================
  // Main Spin Logic
  // ============================================

  spin(bet: number): SpinResult {
    this.sessionWagers += bet;

    // Determine if this spin should win
    const shouldWin = this.determineWinOutcome();

    // Generate the grid
    let grid: ReelGrid;
    let wins: WinLine[];

    if (shouldWin) {
      // Generate a winning grid
      const winData = this.generateWinningGrid(bet);
      grid = winData.grid;
      wins = winData.wins;
    } else {
      // Generate a losing grid (no winning combinations)
      grid = this.generateLosingGrid();
      wins = [];
    }

    // Check for scatter wins (diamonds trigger free spins)
    const scatterData = this.checkScatters(grid);

    // Calculate total win
    const totalWin = wins.reduce((sum, w) => sum + w.payout, 0);

    // Track session RTP
    this.sessionPayouts += totalWin;

    // Update recent results for streak management
    this.recentResults.push(totalWin > 0);
    if (this.recentResults.length > 20) {
      this.recentResults.shift();
    }

    // Determine win category
    const winMultiplier = totalWin / bet;
    const isBigWin = winMultiplier >= GAME_MATH.WIN_THRESHOLDS.big;
    const isMegaWin = winMultiplier >= GAME_MATH.WIN_THRESHOLDS.mega;
    const isJackpot = winMultiplier >= GAME_MATH.WIN_THRESHOLDS.jackpot;

    return {
      grid,
      wins,
      totalWin,
      isBigWin,
      isMegaWin,
      isJackpot,
      freeSpinsWon: scatterData.freeSpins,
      bonusTriggered: scatterData.bonusTriggered,
    };
  }

  // ============================================
  // Win Determination
  // ============================================

  private determineWinOutcome(): boolean {
    // Base hit frequency
    let hitChance = GAME_MATH.HIT_FREQUENCY;

    // Streak management - reduce win chance after consecutive wins
    const recentWins = this.recentResults.filter(r => r).length;
    const recentTotal = this.recentResults.length;

    if (recentTotal >= 5) {
      const winRate = recentWins / recentTotal;

      // If winning too much, reduce chance
      if (winRate > 0.35) {
        hitChance *= 0.7;
      }
      // If losing too much, slightly increase chance
      else if (winRate < 0.15) {
        hitChance *= 1.2;
      }
    }

    // Check for excessive streak
    const lastResults = this.recentResults.slice(-GAME_MATH.MAX_WIN_STREAK);
    const allWins = lastResults.every(r => r);

    if (allWins && lastResults.length >= GAME_MATH.MAX_WIN_STREAK) {
      hitChance *= (1 - GAME_MATH.STREAK_REDUCTION);
    }

    return rng.random() < hitChance;
  }

  // ============================================
  // Grid Generation
  // ============================================

  private generateWinningGrid(bet: number): { grid: ReelGrid; wins: WinLine[] } {
    // Determine win size
    const winCategory = this.selectWinCategory();
    const targetMultiplier = this.getTargetMultiplier(winCategory);

    // Select which payline(s) to win on
    const winningPaylineCount = winCategory === 'small' ? 1 : rng.randomInt(1, 3);
    const selectedPaylines = this.selectRandomPaylines(winningPaylineCount);

    // Select winning symbol based on target multiplier
    const winningSymbol = this.selectWinningSymbol(targetMultiplier);
    const matchCount = this.determineMatchCount(winCategory);

    // Generate base grid
    const grid = this.generateBaseGrid();

    // Apply winning combinations to selected paylines
    const wins: WinLine[] = [];

    for (const paylineIndex of selectedPaylines) {
      const payline = PAYLINES[paylineIndex];
      const positions: ReelPosition[] = [];

      // Place winning symbols
      for (let reel = 0; reel < matchCount; reel++) {
        const row = payline[reel];
        grid[reel][row] = winningSymbol.id as SymbolId;
        positions.push({ reel, row, symbol: winningSymbol.id as SymbolId });
      }

      const payout = winningSymbol.payouts[matchCount as 3 | 4 | 5] * bet;

      wins.push({
        paylineIndex,
        positions,
        symbol: winningSymbol.id as SymbolId,
        count: matchCount,
        payout,
      });
    }

    // Ensure non-winning positions don't create accidental wins
    this.sanitizeGrid(grid, selectedPaylines);

    return { grid, wins };
  }

  private generateLosingGrid(): ReelGrid {
    const grid: ReelGrid = [];

    // Generate random symbols from reel strips
    for (let reel = 0; reel < GAME_CONFIG.REELS; reel++) {
      grid[reel] = [];
      const reelStrip = REEL_STRIPS[reel];
      const startPos = rng.randomInt(0, reelStrip.length - GAME_CONFIG.ROWS);

      for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
        grid[reel][row] = reelStrip[startPos + row] as SymbolId;
      }
    }

    // Verify no accidental wins and regenerate if needed
    const wins = this.checkAllPaylines(grid, 1);
    if (wins.length > 0) {
      return this.generateLosingGrid(); // Recursively try again
    }

    return grid;
  }

  private generateBaseGrid(): ReelGrid {
    const grid: ReelGrid = [];

    for (let reel = 0; reel < GAME_CONFIG.REELS; reel++) {
      grid[reel] = [];
      const reelStrip = REEL_STRIPS[reel];
      const startPos = rng.randomInt(0, reelStrip.length - GAME_CONFIG.ROWS);

      for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
        grid[reel][row] = reelStrip[startPos + row] as SymbolId;
      }
    }

    return grid;
  }

  // ============================================
  // Win Calculation Helpers
  // ============================================

  private selectWinCategory(): keyof typeof GAME_MATH.WIN_DISTRIBUTION {
    const rand = rng.random();
    let cumulative = 0;

    for (const [category, probability] of Object.entries(GAME_MATH.WIN_DISTRIBUTION)) {
      cumulative += probability;
      if (rand <= cumulative) {
        return category as keyof typeof GAME_MATH.WIN_DISTRIBUTION;
      }
    }

    return 'small';
  }

  private getTargetMultiplier(category: keyof typeof GAME_MATH.WIN_DISTRIBUTION): number {
    switch (category) {
      case 'small': return rng.randomInt(2, 8);
      case 'medium': return rng.randomInt(8, 25);
      case 'big': return rng.randomInt(25, 100);
      case 'mega': return rng.randomInt(100, 500);
      case 'jackpot': return rng.randomInt(500, 1000);
      default: return 5;
    }
  }

  private selectWinningSymbol(targetMultiplier: number) {
    // Find symbol that gives closest payout to target
    let bestSymbol = SYMBOL_LIST[0];
    let bestDiff = Infinity;

    for (const symbol of SYMBOL_LIST) {
      if (symbol.isScatter) continue; // Scatters handled separately

      for (const matchCount of [3, 4, 5] as const) {
        const payout = symbol.payouts[matchCount];
        const diff = Math.abs(payout - targetMultiplier);

        if (diff < bestDiff) {
          bestDiff = diff;
          bestSymbol = symbol;
        }
      }
    }

    return bestSymbol;
  }

  private determineMatchCount(category: keyof typeof GAME_MATH.WIN_DISTRIBUTION): 3 | 4 | 5 {
    switch (category) {
      case 'jackpot': return 5;
      case 'mega': return rng.random() > 0.3 ? 5 : 4;
      case 'big': return rng.random() > 0.5 ? 5 : 4;
      case 'medium': return rng.random() > 0.6 ? 4 : 3;
      default: return 3;
    }
  }

  private selectRandomPaylines(count: number): number[] {
    const indices: number[] = [];
    const available = Array.from({ length: PAYLINES.length }, (_, i) => i);

    for (let i = 0; i < Math.min(count, PAYLINES.length); i++) {
      const randomIndex = rng.randomInt(0, available.length - 1);
      indices.push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }

    return indices;
  }

  private sanitizeGrid(grid: ReelGrid, protectedPaylines: number[]): void {
    // Check all non-protected paylines for accidental wins
    for (let i = 0; i < PAYLINES.length; i++) {
      if (protectedPaylines.includes(i)) continue;

      const payline = PAYLINES[i];
      const symbols: SymbolId[] = payline.map((row, reel) => grid[reel][row]);

      // Check if this payline would win
      const firstSymbol = symbols[0];
      let matchCount = 1;

      for (let j = 1; j < symbols.length; j++) {
        const sym = symbols[j];
        if (sym === firstSymbol || sym === WILD_SYMBOL.id || firstSymbol === WILD_SYMBOL.id) {
          matchCount++;
        } else {
          break;
        }
      }

      // If accidental win, replace a symbol
      if (matchCount >= 3) {
        const replaceReel = rng.randomInt(0, 2); // Replace one of first 3 symbols
        const replaceRow = payline[replaceReel];

        // Pick a different symbol
        const differentSymbol = SYMBOL_LIST.find(
          s => s.id !== firstSymbol && s.id !== WILD_SYMBOL.id
        );
        if (differentSymbol) {
          grid[replaceReel][replaceRow] = differentSymbol.id as SymbolId;
        }
      }
    }
  }

  // ============================================
  // Scatter & Bonus Detection
  // ============================================

  private checkScatters(grid: ReelGrid): { freeSpins: number; bonusTriggered: boolean } {
    let scatterCount = 0;

    for (let reel = 0; reel < GAME_CONFIG.REELS; reel++) {
      for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
        if (grid[reel][row] === SCATTER_SYMBOL.id) {
          scatterCount++;
        }
      }
    }

    if (scatterCount >= GAME_CONFIG.FREE_SPINS_TRIGGER) {
      const freeSpinsIndex = Math.min(scatterCount - 3, 2);
      return {
        freeSpins: GAME_CONFIG.FREE_SPINS_AWARD[freeSpinsIndex],
        bonusTriggered: true,
      };
    }

    return { freeSpins: 0, bonusTriggered: false };
  }

  // ============================================
  // Payline Checking
  // ============================================

  checkAllPaylines(grid: ReelGrid, bet: number): WinLine[] {
    const wins: WinLine[] = [];

    for (let i = 0; i < PAYLINES.length; i++) {
      const win = this.checkPayline(grid, i, bet);
      if (win) {
        wins.push(win);
      }
    }

    return wins;
  }

  private checkPayline(grid: ReelGrid, paylineIndex: number, bet: number): WinLine | null {
    const payline = PAYLINES[paylineIndex];
    const symbols: SymbolId[] = payline.map((row, reel) => grid[reel][row]);
    const positions: ReelPosition[] = payline.map((row, reel) => ({
      reel,
      row,
      symbol: grid[reel][row],
    }));

    // Get first non-wild symbol
    let baseSymbol = symbols[0];
    if (baseSymbol === WILD_SYMBOL.id) {
      baseSymbol = symbols.find(s => s !== WILD_SYMBOL.id) || baseSymbol;
    }

    // Count consecutive matches from left
    let matchCount = 0;
    for (const sym of symbols) {
      if (sym === baseSymbol || sym === WILD_SYMBOL.id) {
        matchCount++;
      } else {
        break;
      }
    }

    if (matchCount >= 3) {
      const symbol = SYMBOLS[baseSymbol];
      const payout = symbol.payouts[matchCount as 3 | 4 | 5] * bet;

      return {
        paylineIndex,
        positions: positions.slice(0, matchCount),
        symbol: baseSymbol,
        count: matchCount,
        payout,
      };
    }

    return null;
  }

  // ============================================
  // Statistics
  // ============================================

  getSessionRTP(): number {
    if (this.sessionWagers === 0) return 0;
    return this.sessionPayouts / this.sessionWagers;
  }

  resetSession(): void {
    this.sessionPayouts = 0;
    this.sessionWagers = 0;
    this.recentResults = [];
  }
}

// Singleton instance
let engineInstance: GameEngine | null = null;

export function getGameEngine(): GameEngine {
  if (!engineInstance) {
    engineInstance = new GameEngine();
  }
  return engineInstance;
}
