import { SymbolType, WinLine, WinResult, ReelPosition } from '@/types';
import { SYMBOLS, REEL_STRIPS, PAYLINES, GAME_CONFIG, GAME_MATH } from '@/constants/config';

export class SlotEngine {
  private reelStrips: string[][];
  private currentPositions: number[];
  private displayGrid: SymbolType[][];
  
  constructor() {
    this.reelStrips = REEL_STRIPS;
    this.currentPositions = [0, 0, 0, 0, 0];
    this.displayGrid = this.generateDisplayGrid();
  }
  
  /**
   * Main spin function - generates random outcome based on RTP
   */
  public spin(): { grid: SymbolType[][], result: WinResult } {
    // Generate random positions for each reel
    this.currentPositions = this.generateRandomPositions();
    
    // Create the display grid
    this.displayGrid = this.generateDisplayGrid();
    
    // Calculate wins
    const result = this.calculateWins();
    
    return {
      grid: this.displayGrid,
      result,
    };
  }
  
  /**
   * Generate random positions for each reel with weighted RTP
   */
  private generateRandomPositions(): number[] {
    const positions: number[] = [];
    
    // Adjusted hit frequency for more realistic gameplay
    // Original was too high, making wins too frequent
    const isWinningSpray = Math.random() < (GAME_MATH.hitFrequency * 0.7); // Reduced by 30%
    
    if (isWinningSpray) {
      // Generate a winning combination based on RTP distribution
      return this.generateWinningPositions();
    } else {
      // Generate truly random positions
      for (let i = 0; i < GAME_CONFIG.REELS; i++) {
        positions.push(Math.floor(Math.random() * this.reelStrips[i].length));
      }
    }
    
    return positions;
  }
  
  /**
   * Generate positions that guarantee a win (for RTP control)
   */
  private generateWinningPositions(): number[] {
    const positions: number[] = [];
    const winType = this.selectWinType();
    
    switch (winType) {
      case 'small': // 3 matching low symbols
        return this.generateMatchingSymbols(['cherry', 'lemon'], 3);
      case 'medium': // 3-4 matching mid symbols
        const mediumCount = Math.random() < 0.3 ? 4 : 3; // 30% chance for 4 symbols
        return this.generateMatchingSymbols(['bell', 'bar'], mediumCount);
      case 'big': // 4-5 matching high symbols (rare)
        const bigCount = Math.random() < 0.1 ? 5 : 4; // Only 10% chance for 5 symbols
        return this.generateMatchingSymbols(['seven'], bigCount);
      case 'jackpot': // 5 matching diamonds (very rare)
        return this.generateMatchingSymbols(['diamond'], 5);
      default: // Random positions
        for (let i = 0; i < GAME_CONFIG.REELS; i++) {
          positions.push(Math.floor(Math.random() * this.reelStrips[i].length));
        }
    }
    
    return positions;
  }
  
  /**
   * Select win type based on RTP distribution - ADJUSTED FOR LESS FREQUENT BIG WINS
   */
  private selectWinType(): 'small' | 'medium' | 'big' | 'jackpot' | 'none' {
    const rand = Math.random();
    
    // Adjusted probabilities for more realistic gameplay
    if (rand < 0.75) return 'small';      // 75% of wins are small (was 60%)
    if (rand < 0.92) return 'medium';     // 17% of wins are medium (was 30%)
    if (rand < 0.995) return 'big';       // 7.5% of wins are big (was 9%)
    if (rand < 0.9995) return 'jackpot';  // 0.05% jackpot (was implicit 1%)
    return 'none';
  }
  
  /**
   * Generate matching symbols on a random payline
   */
  private generateMatchingSymbols(symbolOptions: string[], count: number): number[] {
    // Select random symbol
    const symbol = symbolOptions[Math.floor(Math.random() * symbolOptions.length)];
    
    // Select random payline
    const payline = PAYLINES[Math.floor(Math.random() * PAYLINES.length)];
    
    const positions: number[] = [];
    
    for (let reel = 0; reel < GAME_CONFIG.REELS; reel++) {
      // Find positions where the symbol appears on the required row for the payline
      const requiredRow = payline.positions[reel][0]; // [row, col] but col is reel
      
      // Find all positions on this reel where shifting would show the symbol at required row
      const possibleStarts: number[] = [];
      
      for (let start = 0; start < this.reelStrips[reel].length; start++) {
        const displaySymbol = this.reelStrips[reel][(start + requiredRow) % this.reelStrips[reel].length];
        if (displaySymbol === symbol || SYMBOLS[displaySymbol]?.isWild) {
          possibleStarts.push(start);
        }
      }
      
      // If no possible position, fall back to random
      if (possibleStarts.length === 0) {
        positions.push(Math.floor(Math.random() * this.reelStrips[reel].length));
        continue;
      }
      
      // For first 'count' reels, force match
      if (reel < count) {
        positions.push(possibleStarts[Math.floor(Math.random() * possibleStarts.length)]);
      } else {
        // For remaining reels, random to avoid always full line
        positions.push(Math.floor(Math.random() * this.reelStrips[reel].length));
      }
    }
    
    return positions;
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
    
    // Check each payline
    for (const payline of PAYLINES) {
      const lineWin = this.checkPayline(payline);
      
      if (lineWin) {
        winLines.push(lineWin);
        totalWin += lineWin.payout;
      }
    }
    
    // Adjusted win thresholds for better gameplay
    const isBigWin = totalWin >= 50;  // Increased from 25
    const isJackpot = totalWin >= 500; // Increased from 100
    
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
    
    // Collect symbols along the payline
    for (const [row, col] of payline.positions) {
      const symbol = this.displayGrid[row][col];
      symbols.push(symbol);
      positions.push({ symbol, row, col });
    }
    
    // Check for matching symbols from left to right
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
    
    // Calculate payout if we have at least 3 matching symbols
    if (matchCount >= 3) {
      const symbolData = SYMBOLS[hasWild ? 'diamond' : firstSymbol];
      const multiplier = symbolData.multiplier[matchCount - 1] || 0;
      const payout = multiplier;
      
      if (payout > 0) {
        return {
          lineId: payline.id,
          symbols: symbols.slice(0, matchCount),
          positions: positions.slice(0, matchCount),
          payout,
          multiplier: 1,
        };
      }
    }
    
    return null;
  }
  
  /**
   * Get current display grid
   */
  public getDisplayGrid(): SymbolType[][] {
    return this.displayGrid;
  }
  
  /**
   * Get symbol at specific position
   */
  public getSymbolAt(row: number, col: number): SymbolType {
    return this.displayGrid[row][col];
  }
  
  /**
   * Force specific outcome (for testing)
   */
  public forceOutcome(grid: SymbolType[][]): WinResult {
    this.displayGrid = grid;
    return this.calculateWins();
  }
  
  /**
   * Calculate theoretical RTP
   */
  public calculateTheoreticalRTP(): number {
    let totalPayout = 0;
    let totalSpins = 10000;
    
    for (let i = 0; i < totalSpins; i++) {
      const { result } = this.spin();
      totalPayout += result.totalWin;
    }
    
    return totalPayout / totalSpins;
  }
  
  /**
   * Reset the engine
   */
  public reset(): void {
    this.currentPositions = [0, 0, 0, 0, 0];
    this.displayGrid = this.generateDisplayGrid();
  }
}