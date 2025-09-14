import { SlotEngine } from '@/lib/game-engine/SlotEngine';
import { GAME_CONFIG, GAME_MATH } from '@/constants/config';

describe('SlotEngine', () => {
  let engine: SlotEngine;
  
  beforeEach(() => {
    engine = new SlotEngine();
  });
  
  describe('initialization', () => {
    it('should initialize with correct grid size', () => {
      const grid = engine.getDisplayGrid();
      expect(grid.length).toBe(GAME_CONFIG.ROWS);
      expect(grid[0].length).toBe(GAME_CONFIG.REELS);
    });
    
    it('should have valid symbols in initial grid', () => {
      const grid = engine.getDisplayGrid();
      const validSymbols = ['cherry', 'lemon', 'bell', 'bar', 'seven', 'diamond'];
      
      grid.forEach(row => {
        row.forEach(symbol => {
          expect(validSymbols).toContain(symbol);
        });
      });
    });
  });
  
  describe('spin', () => {
    it('should return a valid grid and result', () => {
      const { grid, result } = engine.spin();
      
      expect(grid).toBeDefined();
      expect(result).toBeDefined();
      expect(result.winLines).toBeInstanceOf(Array);
      expect(typeof result.totalWin).toBe('number');
      expect(typeof result.isBigWin).toBe('boolean');
      expect(typeof result.isJackpot).toBe('boolean');
    });
    
    it('should generate different results on multiple spins', () => {
      const results = [];
      for (let i = 0; i < 10; i++) {
        const { grid } = engine.spin();
        results.push(JSON.stringify(grid));
      }
      
      // At least some results should be different
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBeGreaterThan(1);
    });
  });
  
  describe('RTP calculation', () => {
    it('should achieve target RTP over many spins', () => {
      const spins = 10000;
      let totalWin = 0;
      let totalBet = spins; // Assuming bet of 1 per spin
      
      for (let i = 0; i < spins; i++) {
        const { result } = engine.spin();
        totalWin += result.totalWin;
      }
      
      const actualRTP = totalWin / totalBet;
      const tolerance = 0.05; // 5% tolerance
      
      expect(actualRTP).toBeGreaterThan(GAME_MATH.rtp - tolerance);
      expect(actualRTP).toBeLessThan(GAME_MATH.rtp + tolerance);
    });
  });
  
  describe('win detection', () => {
    it('should detect three matching symbols as a win', () => {
      const testGrid = [
        ['cherry', 'cherry', 'cherry', 'lemon', 'bell'],
        ['lemon', 'lemon', 'lemon', 'bar', 'seven'],
        ['bell', 'bell', 'bell', 'diamond', 'cherry']
      ];
      
      const result = engine.forceOutcome(testGrid as any);
      expect(result.winLines.length).toBeGreaterThan(0);
      expect(result.totalWin).toBeGreaterThan(0);
    });
    
    it('should not detect win with less than three matching symbols', () => {
      const testGrid = [
        ['cherry', 'lemon', 'bell', 'bar', 'seven'],
        ['lemon', 'bell', 'bar', 'seven', 'diamond'],
        ['bell', 'bar', 'seven', 'diamond', 'cherry']
      ];
      
      const result = engine.forceOutcome(testGrid as any);
      expect(result.winLines.length).toBe(0);
      expect(result.totalWin).toBe(0);
    });
    
    it('should handle wild symbols correctly', () => {
      const testGrid = [
        ['diamond', 'diamond', 'cherry', 'lemon', 'bell'],
        ['cherry', 'cherry', 'cherry', 'bar', 'seven'],
        ['bell', 'bell', 'bell', 'diamond', 'cherry']
      ];
      
      const result = engine.forceOutcome(testGrid as any);
      // Diamond is wild, so first row should win
      expect(result.winLines.length).toBeGreaterThan(0);
    });
  });
  
  describe('big win detection', () => {
    it('should mark wins >= 25x as big wins', () => {
      const testGrid = [
        ['seven', 'seven', 'seven', 'seven', 'seven'],
        ['bar', 'bar', 'bar', 'bar', 'bar'],
        ['bell', 'bell', 'bell', 'bell', 'bell']
      ];
      
      const result = engine.forceOutcome(testGrid as any);
      expect(result.isBigWin).toBe(true);
    });
    
    it('should mark wins >= 100x as jackpots', () => {
      const testGrid = [
        ['diamond', 'diamond', 'diamond', 'diamond', 'diamond'],
        ['seven', 'seven', 'seven', 'seven', 'seven'],
        ['seven', 'seven', 'seven', 'seven', 'seven']
      ];
      
      const result = engine.forceOutcome(testGrid as any);
      expect(result.isJackpot).toBe(true);
    });
  });
  
  describe('reset', () => {
    it('should reset to initial state', () => {
      const initialGrid = JSON.stringify(engine.getDisplayGrid());
      
      engine.spin();
      engine.reset();
      
      const resetGrid = JSON.stringify(engine.getDisplayGrid());
      expect(resetGrid).toBe(initialGrid);
    });
  });
});