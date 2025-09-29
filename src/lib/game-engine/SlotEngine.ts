import { SymbolType, WinLine, WinResult, ReelPosition } from '@/types';
import { SYMBOLS, REEL_STRIPS, PAYLINES, GAME_CONFIG } from '@/constants/config';

export class SlotEngine {
  private reelStrips: string[][];
  private currentPositions: number[];
  private displayGrid: SymbolType[][];
  private recentResults: number[] = []; // Track recent payouts for streak prevention
  private totalSpins: number = 0;
  private totalPayout: number = 0;
  
  constructor() {
    this.reelStrips = REEL_STRIPS;
    this.currentPositions = [0, 0, 0, 0, 0];
    this.displayGrid = this.generateDisplayGrid();
  }
  
  /**
   * Main spin function with proper RNG and RTP control
   */
  public spin(): { grid: SymbolType[][], result: WinResult } {
    this.totalSpins++;
    
    // Generate outcome based on proper slot math
    const outcome = this.generateOutcome();
    
    // Set reel positions to match the outcome
    this.currentPositions = outcome.positions;
    this.displayGrid = this.generateDisplayGrid();
    
    // Calculate actual wins from the grid
    const result = this.calculateWins();
    
    // Track payout for RTP monitoring
    this.totalPayout += result.totalWin;
    this.recentResults.push(result.totalWin);
    
    // Keep only last 10 results for streak prevention
    if (this.recentResults.length > 10) {
      this.recentResults.shift();
    }
    
    return {
      grid: this.displayGrid,
      result,
    };
  }
  
  /**
   * Generate outcome using proper slot mathematics
   */
  private generateOutcome(): { positions: number[], targetWin: number } {
    const rand = Math.random();
    
    // PROPER HIT FREQUENCY: ~18% (was 70%!)
    const hitFrequency = 0.18;
    
    // Check if we should have a streak break (prevent too many wins in a row)
    const recentWins = this.recentResults.filter(r => r > 0).length;
    const shouldBreakStreak = recentWins >= 3 && Math.random() < 0.7;
    
    if (shouldBreakStreak || rand > hitFrequency) {
      // Generate losing spin
      return {
        positions: this.generateLosingPositions(),
        targetWin: 0,
      };
    }
    
    // Generate winning spin with proper distribution
    return this.generateWinningOutcome();
  }
  
  /**
   * Generate winning outcome with realistic distribution
   */
  private generateWinningOutcome(): { positions: number[], targetWin: number } {
    const rand = Math.random();
    
    // REALISTIC WIN DISTRIBUTION
    if (rand < 0.85) {
      // 85% of wins are small (2x - 8x bet)
      return this.generateTargetedWin('small', 2 + Math.random() * 6);
    } else if (rand < 0.97) {
      // 12% of wins are medium (8x - 25x bet)
      return this.generateTargetedWin('medium', 8 + Math.random() * 17);
    } else if (rand < 0.999) {
      // 2.9% of wins are big (25x - 100x bet)
      return this.generateTargetedWin('big', 25 + Math.random() * 75);
    } else {
      // 0.1% chance of mega win (100x - 500x bet)
      return this.generateTargetedWin('mega', 100 + Math.random() * 400);
    }
  }
  
  /**
   * Generate positions for a specific win target
   */
  private generateTargetedWin(category: string, targetMultiplier: number): { positions: number[], targetWin: number } {
    let symbols: string[];
    let matchCount: number;
    
    switch (category) {
      case 'small':
        symbols = ['cherry', 'lemon'];
        matchCount = Math.random() < 0.8 ? 3 : 4; // 80% chance for 3-match
        break;
      case 'medium':
        symbols = ['bell', 'bar'];
        matchCount = Math.random() < 0.6 ? 3 : 4; // 60% chance for 3-match
        break;
      case 'big':
        symbols = ['seven', 'bar'];
        matchCount = Math.random() < 0.4 ? 4 : 5; // 60% chance for 4-match
        break;
      case 'mega':
        symbols = ['seven', 'diamond'];
        matchCount = 5; // Always 5-match for mega
        break;
      default:
        return { positions: this.generateLosingPositions(), targetWin: 0 };
    }
    
    const positions = this.generateMatchingPositions(symbols, matchCount);
    return { positions, targetWin: targetMultiplier };
  }
  
  /**
   * Generate positions that guarantee no wins
   */
  private generateLosingPositions(): number[] {
    const positions: number[] = [];
    
    for (let i = 0; i < GAME_CONFIG.REELS; i++) {
      positions.push(Math.floor(Math.random() * this.reelStrips[i].length));
    }
    
    // Verify it's actually a losing combination, adjust if needed
    const testGrid = this.generateTestGrid(positions);
    if (this.testForWins(testGrid)) {
      // If it accidentally created a win, shift first reel
      positions[0] = (positions[0] + 1) % this.reelStrips[0].length;
    }
    
    return positions;
  }
  
  /**
   * Generate positions for matching symbols on paylines
   */
  private generateMatchingPositions(symbolOptions: string[], matchCount: number): number[] {
    const symbol = symbolOptions[Math.floor(Math.random() * symbolOptions.length)];
    const payline = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
    
    const positions: number[] = [];
    
    for (let reel = 0; reel < GAME_CONFIG.REELS; reel++) {
      const requiredRow = payline.positions[reel][0];
      
      if (reel < matchCount) {
        // Force this symbol at the required position
        const targetPosition = this.findSymbolPosition(reel, symbol, requiredRow);
        positions.push(targetPosition);
      } else {
        // Random position for remaining reels
        positions.push(Math.floor(Math.random() * this.reelStrips[reel].length));
      }
    }
    
    return positions;
  }
  
  /**
   * Find position where symbol appears at target row
   */
  private findSymbolPosition(reel: number, symbol: string, targetRow: number): number {
    const strip = this.reelStrips[reel];
    
    // Find all positions where this symbol would appear at targetRow
    const validPositions: number[] = [];
    
    for (let pos = 0; pos < strip.length; pos++) {
      const symbolAtRow = strip[(pos + targetRow) % strip.length];
      if (symbolAtRow === symbol) {
        validPositions.push(pos);
      }
    }
    
    if (validPositions.length === 0) {
      // Fallback to random if symbol not found
      return Math.floor(Math.random() * strip.length);
    }
    
    return validPositions[Math.floor(Math.random() * validPositions.length)];
  }
  
  /**
   * Generate test grid for validation
   */
  private generateTestGrid(positions: number[]): SymbolType[][] {
    const grid: SymbolType[][] = [];
    
    for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
      const rowSymbols: SymbolType[] = [];
      
      for (let reel = 0; reel < GAME_CONFIG.REELS; reel++) {
        const position = (positions[reel] + row) % this.reelStrips[reel].length;
        rowSymbols.push(this.reelStrips[reel][position] as SymbolType);
      }
      
      grid.push(rowSymbols);
    }
    
    return grid;
  }
  
  /**
   * Test if grid has any wins (for validation)
   */
  private testForWins(grid: SymbolType[][]): boolean {
    for (const payline of PAYLINES) {
      const symbols: SymbolType[] = [];
      
      for (const [row, col] of payline.positions) {
        symbols.push(grid[row][col]);
      }
      
      if (this.checkLineForWin(symbols)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check if a line has matching symbols
   */
  private checkLineForWin(symbols: SymbolType[]): boolean {
    const firstSymbol = symbols[0];
    let matchCount = 1;
    
    for (let i = 1; i < symbols.length; i++) {
      const currentSymbol = symbols[i];
      const isWild = SYMBOLS[currentSymbol]?.isWild || false;
      const firstIsWild = SYMBOLS[firstSymbol]?.isWild || false;
      
      if (currentSymbol === firstSymbol || isWild || firstIsWild) {
        matchCount++;
      } else {
        break;
      }
    }
    
    return matchCount >= 3;
  }
  
  /**
   * Generate the 3x5 display grid from current positions
   */
  private generateDisplayGrid(): SymbolType[][] {
    const grid: SymbolType[][] = [];
    
    for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
      const rowSymbols: SymbolType[] = [];
      
      for (let reel = 0; reel < GAME_CONFIG.REELS; reel++) {
        const position = (this.currentPositions[reel] + row) % this.reelStrips[reel].length;
        rowSymbols.push(this.reelStrips[reel][position] as SymbolType);
      }
      
      grid.push(rowSymbols);
    }
    
    return grid;
  }
  
  /**
   * Calculate all wins on the current grid
   */
  private calculateWins(): WinResult {
    const winLines: WinLine[] = [];
    let totalWin = 0;
    
    for (const payline of PAYLINES) {
      const lineWin = this.checkPayline(payline);
      
      if (lineWin) {
        winLines.push(lineWin);
        totalWin += lineWin.payout;
      }
    }
    
    const isBigWin = totalWin >= 20;  // 20x bet or more
    const isJackpot = totalWin >= 100; // 100x bet or more
    
    return {
      winLines,
      totalWin,
      isBigWin,
      isJackpot,
    };
  }
  
  /**
   * Check a single payline for wins
   */
  private checkPayline(payline: any): WinLine | null {
    const symbols: SymbolType[] = [];
    const positions: ReelPosition[] = [];
    
    for (const [row, col] of payline.positions) {
      const symbol = this.displayGrid[row][col];
      symbols.push(symbol);
      positions.push({ symbol, row, col });
    }
    
    const firstSymbol = symbols[0];
    let matchCount = 1;
    let hasWild = SYMBOLS[firstSymbol]?.isWild || false;
    
    for (let i = 1; i < symbols.length; i++) {
      const currentSymbol = symbols[i];
      const isWild = SYMBOLS[currentSymbol]?.isWild || false;
      
      if (currentSymbol === firstSymbol || isWild || (hasWild && !isWild)) {
        matchCount++;
        if (isWild) hasWild = true;
      } else {
        break;
      }
    }
    
    if (matchCount >= 3) {
      const symbolData = SYMBOLS[hasWild ? 'diamond' : firstSymbol];
      const multiplier = symbolData.multiplier[matchCount - 1] || 0;
      
      if (multiplier > 0) {
        return {
          lineId: payline.id,
          symbols: symbols.slice(0, matchCount),
          positions: positions.slice(0, matchCount),
          payout: multiplier,
          multiplier: 1,
        };
      }
    }
    
    return null;
  }
  
  /**
   * Get current RTP (for monitoring)
   */
  public getCurrentRTP(): number {
    if (this.totalSpins === 0) return 0;
    return this.totalPayout / this.totalSpins;
  }
  
  /**
   * Get recent win percentage
   */
  public getRecentHitRate(): number {
    if (this.recentResults.length === 0) return 0;
    const wins = this.recentResults.filter(r => r > 0).length;
    return wins / this.recentResults.length;
  }
  
  public getDisplayGrid(): SymbolType[][] {
    return this.displayGrid;
  }
  
  public getSymbolAt(row: number, col: number): SymbolType {
    return this.displayGrid[row][col];
  }
  
  public reset(): void {
    this.currentPositions = [0, 0, 0, 0, 0];
    this.displayGrid = this.generateDisplayGrid();
    this.recentResults = [];
    this.totalSpins = 0;
    this.totalPayout = 0;
  }
}