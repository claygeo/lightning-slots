// ============================================
// ROYAL JACKPOT - Zustand Game Store
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, SpinResult, Player, ReelGrid, SymbolId } from '@/types/game';
import { GAME_CONFIG, SYMBOLS, SYMBOL_LIST } from '@/constants/gameConfig';

// Generate initial empty grid
const generateEmptyGrid = (): ReelGrid => {
  const grid: ReelGrid = [];
  for (let reel = 0; reel < GAME_CONFIG.REELS; reel++) {
    grid[reel] = [];
    for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
      // Random initial symbols
      const randomSymbol = SYMBOL_LIST[Math.floor(Math.random() * SYMBOL_LIST.length)];
      grid[reel][row] = randomSymbol.id as SymbolId;
    }
  }
  return grid;
};

// Calculate XP needed for next level
const calculateXPForLevel = (level: number): number => {
  return Math.floor(GAME_CONFIG.BASE_XP * Math.pow(GAME_CONFIG.XP_MULTIPLIER, level - 1));
};

interface GameStore extends GameState {
  // Actions
  setBet: (amount: number) => void;
  incrementBet: () => void;
  decrementBet: () => void;
  setMaxBet: () => void;

  startSpin: () => void;
  completeSpin: (result: SpinResult) => void;

  setAutoSpin: (enabled: boolean, count?: number | 'infinite') => void;
  decrementAutoSpin: () => void;

  addBalance: (amount: number) => void;
  addExperience: (amount: number) => void;

  toggleSound: () => void;
  toggleMusic: () => void;
  toggleTurbo: () => void;

  login: (player: Player) => void;
  logout: () => void;
  updatePlayer: (updates: Partial<Player>) => void;

  unlockAchievement: (achievementId: string) => void;

  setJackpotMeter: (value: number) => void;
  triggerFreeSpins: (count: number) => void;
  useFreeSpins: () => void;
  setMultiplier: (value: number) => void;

  resetGame: () => void;
  getProgressForSync: () => Partial<Player>;
}

const initialState: GameState = {
  // Core game state
  balance: GAME_CONFIG.STARTING_BALANCE,
  bet: GAME_CONFIG.DEFAULT_BET,
  isSpinning: false,
  isAutoSpin: false,
  autoSpinCount: 0,

  // Current spin
  currentGrid: generateEmptyGrid(),
  lastResult: null,
  winningLines: [],

  // Bonus features
  freeSpinsRemaining: 0,
  freeSpinsTotalWin: 0,
  multiplier: 1,
  jackpotMeter: 0,

  // Player progress
  level: 1,
  experience: 0,
  experienceToNextLevel: GAME_CONFIG.BASE_XP,
  totalSpins: 0,
  totalWins: 0,
  biggestWin: 0,
  currentStreak: 0,

  // Settings
  soundEnabled: true,
  musicEnabled: false,
  turboMode: false,

  // Auth
  isLoggedIn: false,
  player: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Betting Actions
      setBet: (amount: number) => {
        const { balance, isSpinning } = get();
        if (isSpinning) return;

        const clampedBet = Math.min(
          Math.max(amount, GAME_CONFIG.MIN_BET),
          Math.min(GAME_CONFIG.MAX_BET, balance)
        );
        set({ bet: Math.round(clampedBet * 100) / 100 });
      },

      incrementBet: () => {
        const { bet, balance, isSpinning } = get();
        if (isSpinning) return;

        const increments = GAME_CONFIG.BET_INCREMENTS;
        const currentIndex = increments.findIndex(i => i >= bet);
        const nextBet = increments[currentIndex + 1] || increments[currentIndex];

        if (nextBet <= balance) {
          set({ bet: nextBet });
        }
      },

      decrementBet: () => {
        const { bet, isSpinning } = get();
        if (isSpinning) return;

        const increments = GAME_CONFIG.BET_INCREMENTS;
        const currentIndex = increments.findIndex(i => i >= bet);
        const prevBet = increments[Math.max(0, currentIndex - 1)];

        set({ bet: prevBet });
      },

      setMaxBet: () => {
        const { balance, isSpinning } = get();
        if (isSpinning) return;

        const maxAffordable = Math.min(GAME_CONFIG.MAX_BET, balance);
        const increments = [...GAME_CONFIG.BET_INCREMENTS].reverse();
        const maxBet = increments.find(i => i <= maxAffordable) || GAME_CONFIG.MIN_BET;

        set({ bet: maxBet });
      },

      // Spin Actions
      startSpin: () => {
        const { balance, bet, isSpinning, freeSpinsRemaining } = get();

        if (isSpinning) return;

        // Check if player can afford the bet (unless using free spins)
        if (freeSpinsRemaining === 0 && balance < bet) return;

        // Deduct bet from balance (unless free spin)
        const newBalance = freeSpinsRemaining > 0 ? balance : balance - bet;

        set({
          isSpinning: true,
          balance: Math.round(newBalance * 100) / 100,
          lastResult: null,
          winningLines: [],
        });
      },

      completeSpin: (result: SpinResult) => {
        const state = get();
        const { bet, multiplier, freeSpinsRemaining, freeSpinsTotalWin, totalSpins, totalWins, biggestWin, currentStreak, jackpotMeter } = state;

        // Calculate final win with multiplier
        const finalWin = result.totalWin * multiplier;

        // Update stats
        const newTotalSpins = totalSpins + 1;
        const newTotalWins = result.totalWin > 0 ? totalWins + 1 : totalWins;
        const newBiggestWin = Math.max(biggestWin, finalWin);
        const newCurrentStreak = result.totalWin > 0 ? currentStreak + 1 : 0;

        // Update jackpot meter (contribution from bet)
        const newJackpotMeter = jackpotMeter + (bet * GAME_CONFIG.JACKPOT_CONTRIBUTION);

        // Handle free spins tracking
        let newFreeSpinsRemaining = freeSpinsRemaining;
        let newFreeSpinsTotalWin = freeSpinsTotalWin;
        let newMultiplier = multiplier;

        if (freeSpinsRemaining > 0) {
          newFreeSpinsRemaining -= 1;
          newFreeSpinsTotalWin += finalWin;

          if (newFreeSpinsRemaining === 0) {
            newMultiplier = 1; // Reset multiplier after free spins
          }
        }

        // Add free spins from scatter wins
        if (result.freeSpinsWon > 0) {
          newFreeSpinsRemaining += result.freeSpinsWon;
          newMultiplier = GAME_CONFIG.FREE_SPINS_MULTIPLIER;
        }

        set({
          isSpinning: false,
          currentGrid: result.grid,
          lastResult: result,
          winningLines: result.wins.map(w => w.paylineIndex),
          balance: Math.round((state.balance + finalWin) * 100) / 100,
          totalSpins: newTotalSpins,
          totalWins: newTotalWins,
          biggestWin: newBiggestWin,
          currentStreak: newCurrentStreak,
          freeSpinsRemaining: newFreeSpinsRemaining,
          freeSpinsTotalWin: newFreeSpinsTotalWin,
          multiplier: newMultiplier,
          jackpotMeter: newJackpotMeter,
        });

        // Award XP
        let xpGained = GAME_CONFIG.XP_PER_SPIN;
        if (result.totalWin > 0) {
          xpGained += GAME_CONFIG.XP_PER_WIN;
        }
        if (result.isBigWin) {
          xpGained += GAME_CONFIG.XP_BIG_WIN_BONUS;
        }
        if (result.isJackpot) {
          xpGained += GAME_CONFIG.XP_JACKPOT_BONUS;
        }

        get().addExperience(xpGained);
      },

      // Auto Spin
      setAutoSpin: (enabled: boolean, count?: number | 'infinite') => {
        if (enabled && count !== undefined) {
          set({
            isAutoSpin: true,
            autoSpinCount: count === 'infinite' ? -1 : count,
          });
        } else {
          set({
            isAutoSpin: false,
            autoSpinCount: 0,
          });
        }
      },

      decrementAutoSpin: () => {
        const { autoSpinCount } = get();
        if (autoSpinCount > 0) {
          const newCount = autoSpinCount - 1;
          set({
            autoSpinCount: newCount,
            isAutoSpin: newCount > 0,
          });
        }
        // If -1 (infinite), don't change
      },

      // Balance
      addBalance: (amount: number) => {
        set(state => ({
          balance: Math.round((state.balance + amount) * 100) / 100,
        }));
      },

      // Experience & Leveling
      addExperience: (amount: number) => {
        const { experience, level, experienceToNextLevel } = get();
        let newExperience = experience + amount;
        let newLevel = level;
        let newExperienceToNextLevel = experienceToNextLevel;

        // Level up logic
        while (newExperience >= newExperienceToNextLevel && newLevel < GAME_CONFIG.MAX_LEVEL) {
          newExperience -= newExperienceToNextLevel;
          newLevel += 1;
          newExperienceToNextLevel = calculateXPForLevel(newLevel);
        }

        set({
          experience: newExperience,
          level: newLevel,
          experienceToNextLevel: newExperienceToNextLevel,
        });
      },

      // Settings
      toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
      toggleMusic: () => set(state => ({ musicEnabled: !state.musicEnabled })),
      toggleTurbo: () => set(state => ({ turboMode: !state.turboMode })),

      // Auth
      login: (player: Player) => {
        set({
          isLoggedIn: true,
          player,
          balance: player.balance,
          level: player.level,
          experience: player.experience,
          experienceToNextLevel: calculateXPForLevel(player.level),
          totalSpins: player.totalSpins,
          totalWins: player.totalWins,
          biggestWin: player.biggestWin,
        });
      },

      logout: () => {
        set({
          isLoggedIn: false,
          player: null,
        });
      },

      updatePlayer: (updates: Partial<Player>) => {
        const { player } = get();
        if (player) {
          set({ player: { ...player, ...updates } });
        }
      },

      // Achievements
      unlockAchievement: (achievementId: string) => {
        const { player } = get();
        if (player && !player.achievements.includes(achievementId)) {
          set({
            player: {
              ...player,
              achievements: [...player.achievements, achievementId],
            },
          });
        }
      },

      // Bonus Features
      setJackpotMeter: (value: number) => set({ jackpotMeter: value }),

      triggerFreeSpins: (count: number) => {
        set(state => ({
          freeSpinsRemaining: state.freeSpinsRemaining + count,
          multiplier: GAME_CONFIG.FREE_SPINS_MULTIPLIER,
        }));
      },

      useFreeSpins: () => {
        set(state => ({
          freeSpinsRemaining: Math.max(0, state.freeSpinsRemaining - 1),
        }));
      },

      setMultiplier: (value: number) => set({ multiplier: value }),

      // Reset
      resetGame: () => set({ ...initialState, currentGrid: generateEmptyGrid() }),

      // Sync helpers
      getProgressForSync: () => {
        const state = get();
        return {
          balance: state.balance,
          level: state.level,
          experience: state.experience,
          totalSpins: state.totalSpins,
          totalWins: state.totalWins,
          biggestWin: state.biggestWin,
          achievements: state.player?.achievements || [],
        };
      },
    }),
    {
      name: 'royal-jackpot-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        balance: state.balance,
        bet: state.bet,
        level: state.level,
        experience: state.experience,
        experienceToNextLevel: state.experienceToNextLevel,
        totalSpins: state.totalSpins,
        totalWins: state.totalWins,
        biggestWin: state.biggestWin,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        turboMode: state.turboMode,
        isLoggedIn: state.isLoggedIn,
        player: state.player,
      }),
    }
  )
);

// Selectors for commonly accessed values
export const selectBalance = (state: GameStore) => state.balance;
export const selectBet = (state: GameStore) => state.bet;
export const selectIsSpinning = (state: GameStore) => state.isSpinning;
export const selectLevel = (state: GameStore) => state.level;
export const selectPlayer = (state: GameStore) => state.player;
