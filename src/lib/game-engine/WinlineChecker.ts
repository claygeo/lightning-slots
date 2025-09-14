import { SymbolType, WinLine } from '@/types';
import { SYMBOLS, PAYLINES } from '@/constants/config';

export class WinlineChecker {
  /**
   * Check all paylines for wins
   */
  checkWins(grid: SymbolType[][], bet: number): {
    winLines: WinLine[];
    totalWin: number;
  } {
    const winLines: WinLine[] = [];
    let totalWin = 0;

    // Check each payline
    for (const payline of PAYLINES) {
      const symbols = this.getSymbolsOnPayline(grid, payline.positions);
      const winResult = this.checkPaylineWin(symbols, payline.id);
      
      if (winResult) {
        winLines.push(winResult);
        totalWin += winResult.payout * bet;
      }
    }

    return { winLines, totalWin };
  }

  /**
   * Get symbols on a specific payline
   */
  private getSymbolsOnPayline(
    grid: SymbolType[][],
    positions: [number, number][]
  ): SymbolType[] {
    return positions.map(([row, col]) => {
      // Grid is organized as [rows][cols]
      if (grid[row] && grid[row][col]) {
        return grid[row][col];
      }
      return 'cherry'; // Fallback
    });
  }

  /**
   * Check if a payline has a winning combination
   */
  private checkPaylineWin(symbols: SymbolType[], lineId: number): WinLine | null {
    if (!symbols || symbols.length === 0) return null;

    // Start from the leftmost symbol
    let firstSymbol = symbols[0];
    let count = 1;
    
    // Check for wild at the beginning
    if (firstSymbol === 'diamond') {
      // Find first non-wild symbol
      for (let i = 1; i < symbols.length; i++) {
        if (symbols[i] !== 'diamond') {
          firstSymbol = symbols[i];
          break;
        }
        count++;
      }
      
      // All wilds case
      if (firstSymbol === 'diamond') {
        const symbolData = SYMBOLS['diamond'];
        if (count >= 3 && symbolData.multiplier[count - 1] > 0) {
          return {
            lineId,
            symbols: Array(count).fill('diamond'),
            payout: symbolData.multiplier[count - 1],
            // REMOVED: symbolCount - not needed, use symbols.length
          };
        }
        return null;
      }
    }

    // Count matching symbols from left to right
    count = 0;
    for (const symbol of symbols) {
      if (symbol === firstSymbol || symbol === 'diamond') {
        count++;
      } else {
        break; // Stop at first non-matching symbol
      }
    }

    // Check if we have a win (minimum 3 matching symbols)
    const symbolData = SYMBOLS[firstSymbol];
    if (count >= 3 && symbolData && symbolData.multiplier[count - 1] > 0) {
      return {
        lineId,
        symbols: symbols.slice(0, count),
        payout: symbolData.multiplier[count - 1],
        // REMOVED: symbolCount - not needed, use symbols.length
      };
    }

    return null;
  }

  /**
   * Calculate total payout including special features
   */
  calculateTotalPayout(
    winLines: WinLine[],
    bet: number,
    multiplier: number = 1
  ): number {
    const baseWin = winLines.reduce((sum, line) => sum + line.payout, 0);
    return baseWin * bet * multiplier;
  }

  /**
   * Check for special win conditions
   */
  checkSpecialWins(grid: SymbolType[][]): {
    isBigWin: boolean;
    isJackpot: boolean;
    hasFiveOfKind: boolean;
  } {
    let isBigWin = false;
    let isJackpot = false;
    let hasFiveOfKind = false;

    // Check for five of a kind on any payline
    for (const payline of PAYLINES) {
      const symbols = this.getSymbolsOnPayline(grid, payline.positions);
      
      // Check for five matching symbols
      const firstSymbol = symbols[0];
      const allMatch = symbols.every(s => s === firstSymbol || s === 'diamond');
      
      if (allMatch) {
        hasFiveOfKind = true;
        
        // Check if it's five diamonds (jackpot)
        if (symbols.every(s => s === 'diamond')) {
          isJackpot = true;
        }
        
        // Check if it's five sevens (big win)
        if (firstSymbol === 'seven' || (firstSymbol === 'diamond' && symbols.some(s => s === 'seven'))) {
          isBigWin = true;
        }
      }
    }

    return { isBigWin, isJackpot, hasFiveOfKind };
  }

  /**
   * Get winning positions for highlighting
   */
  getWinningPositions(winLine: WinLine): [number, number][] {
    const payline = PAYLINES.find(p => p.id === winLine.lineId);
    if (!payline) return [];
    
    // Return only the positions that contributed to the win
    // FIXED: Use symbols.length instead of symbolCount
    return payline.positions.slice(0, winLine.symbols.length);
  }
}