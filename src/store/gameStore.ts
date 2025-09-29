import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, PlayerProgress, GameSettings, WinResult, LightningRoundState } from '@/types';
import { GAME_CONFIG, LEVEL_CONFIG } from '@/constants/config';

interface GameStore {
  // Game State
  balance: number;
  bet: number;
  totalWin: number;
  isSpinning: boolean;
  isAutoPlay: boolean;
  autoPlayCount: number;
  lastWin: WinResult | null;
  
  // Power Meter & Lightning Round
  powerMeter: number;
  isLightningRound: boolean;
  lightningMultiplier: number;
  lightningRoundState: LightningRoundState;
  
  // Player Progress
  level: number;
  experience: number;
  experienceToNext: number;
  totalSpins: number;
  totalWins: number;
  biggestWin: number;
  achievements: string[];
  
  // Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  quickSpin: boolean;
  
  // Reel State
  reelPositions: number[][];
  reelSymbols: string[][];
  
  // Authentication Integration
  isLoggedIn: boolean;
  username: string | null;
  playerId: string | null;
  
  // Actions
  spin: () => void;
  stopSpin: (winResult: WinResult) => void;
  setBet: (bet: number) => void;
  updateBalance: (amount: number) => void;
  toggleAutoPlay: () => void;
  setAutoPlayCount: (count: number) => void;
  
  // Power Meter & Lightning Round Actions
  incrementPowerMeter: () => void;
  startLightningRound: () => void;
  endLightningRound: (multiplier: number) => void;
  collectLightningCoin: (value: number) => void;
  updateLightningRoundTime: (time: number) => void;
  
  // Progression Actions
  addExperience: (xp: number) => void;
  levelUp: () => void;
  unlockAchievement: (achievementId: string) => void;
  updateStats: (win: number) => void;
  
  // Settings Actions
  toggleSound: () => void;
  toggleMusic: () => void;
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  toggleQuickSpin: () => void;
  
  // Authentication Actions - FIXED
  loadUserProgress: (player: any) => void;
  getProgressForSync: () => any;
  signOut: () => void;
  
  // Utility Actions
  resetGame: () => void;
  loadSavedState: () => void;
}

const initialState = {
  // Game State
  balance: GAME_CONFIG.STARTING_BALANCE,
  bet: GAME_CONFIG.DEFAULT_BET,
  totalWin: 0,
  isSpinning: false,
  isAutoPlay: false,
  autoPlayCount: 0,
  lastWin: null,
  
  // Power Meter & Lightning Round
  powerMeter: 0,
  isLightningRound: false,
  lightningMultiplier: 1,
  lightningRoundState: {
    active: false,
    timeRemaining: 0,
    coins: [],
    totalCollected: 0,
    multiplierEarned: 1,
  },
  
  // Player Progress
  level: 1,
  experience: 0,
  experienceToNext: LEVEL_CONFIG.BASE_XP,
  totalSpins: 0,
  totalWins: 0,
  biggestWin: 0,
  achievements: [],
  
  // Settings
  soundEnabled: true,
  musicEnabled: true,
  animationSpeed: 'normal' as const,
  quickSpin: false,
  
  // Reel State
  reelPositions: Array(5).fill([0, 1, 2]),
  reelSymbols: Array(5).fill(['cherry', 'cherry', 'cherry']),
  
  // Authentication
  isLoggedIn: false,
  username: null,
  playerId: null,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Core Game Actions
      spin: () => {
        const state = get();
        if (state.balance < state.bet || state.isSpinning) return;
        
        set({
          balance: state.balance - state.bet,
          isSpinning: true,
          lastWin: null,
          totalWin: 0,
          totalSpins: state.totalSpins + 1,
        });
        
        // Increment power meter
        get().incrementPowerMeter();
        
        // Add XP for spinning
        get().addExperience(LEVEL_CONFIG.XP_PER_SPIN * 0.5);
      },
      
      stopSpin: (winResult: WinResult) => {
        const state = get();
        const winAmount = winResult.totalWin * state.bet;
        
        set({
          isSpinning: false,
          lastWin: winResult,
          totalWin: winAmount,
          balance: state.balance + winAmount,
        });
        
        // Update stats and XP
        if (winAmount > 0) {
          get().updateStats(winAmount);
          const xpEarned = Math.floor(LEVEL_CONFIG.XP_PER_WIN + (winResult.totalWin * 0.5));
          get().addExperience(xpEarned);
          
          // Achievement checks
          if (winAmount >= 50 * state.bet) {
            get().unlockAchievement('big_win');
          }
          if (winResult.isJackpot) {
            get().unlockAchievement('jackpot');
          }
        }
        
        // Handle auto play
        if (state.isAutoPlay && state.autoPlayCount > 0) {
          set({ autoPlayCount: state.autoPlayCount - 1 });
          setTimeout(() => get().spin(), 500);
        } else if (state.isAutoPlay && state.autoPlayCount === 0) {
          set({ isAutoPlay: false });
        }
      },
      
      setBet: (newBet: number) => {
        const state = get();
        if (newBet >= GAME_CONFIG.MIN_BET && newBet <= state.balance) {
          set({ bet: newBet });
        }
      },
      
      updateBalance: (amount: number) => {
        set(state => ({ balance: Math.max(0, state.balance + amount) }));
      },
      
      toggleAutoPlay: () => set(state => ({ isAutoPlay: !state.isAutoPlay })),
      
      setAutoPlayCount: (count: number) => set({ autoPlayCount: count }),
      
      // Power Meter & Lightning Round
      incrementPowerMeter: () => {
        const state = get();
        const increment = Math.random() < 0.3 ? 1 : 0;
        const newMeter = Math.min(state.powerMeter + increment, GAME_CONFIG.POWER_METER_MAX);
        set({ powerMeter: newMeter });
        
        if (newMeter >= GAME_CONFIG.POWER_METER_MAX) {
          get().startLightningRound();
        }
      },
      
      startLightningRound: () => {
        set({
          isLightningRound: true,
          powerMeter: 0,
          lightningRoundState: {
            active: true,
            timeRemaining: 30,
            coins: [],
            totalCollected: 0,
            multiplierEarned: 1,
          },
        });
      },
      
      endLightningRound: (multiplier: number) => {
        set({
          isLightningRound: false,
          lightningMultiplier: multiplier,
          lightningRoundState: {
            ...get().lightningRoundState,
            active: false,
          },
        });
      },
      
      collectLightningCoin: (value: number) => {
        const state = get();
        set({
          lightningRoundState: {
            ...state.lightningRoundState,
            totalCollected: state.lightningRoundState.totalCollected + 1,
            multiplierEarned: Math.min(
              state.lightningRoundState.multiplierEarned + value,
              10
            ),
          },
        });
      },
      
      updateLightningRoundTime: (time: number) => {
        set(state => ({
          lightningRoundState: {
            ...state.lightningRoundState,
            timeRemaining: time,
          },
        }));
      },
      
      // Progression System
      addExperience: (xp: number) => {
        const state = get();
        let newExperience = state.experience + xp;
        let currentLevel = state.level;
        let currentExperienceToNext = state.experienceToNext;
        
        // Keep leveling up while we have enough XP
        while (newExperience >= currentExperienceToNext) {
          newExperience = newExperience - currentExperienceToNext;
          currentLevel++;
          currentExperienceToNext = Math.floor(
            LEVEL_CONFIG.BASE_XP * Math.pow(LEVEL_CONFIG.XP_MULTIPLIER * 1.5, currentLevel - 1)
          );
        }
        
        set({
          experience: newExperience,
          level: currentLevel,
          experienceToNext: currentExperienceToNext,
        });
        
        if (currentLevel > state.level) {
          get().unlockAchievement(`level_${currentLevel}`);
        }
      },
      
      levelUp: () => {
        const state = get();
        const newLevel = state.level + 1;
        const newExperienceToNext = Math.floor(
          LEVEL_CONFIG.BASE_XP * Math.pow(LEVEL_CONFIG.XP_MULTIPLIER * 1.5, newLevel - 1)
        );
        
        set({
          level: newLevel,
          experience: 0,
          experienceToNext: newExperienceToNext,
        });
        
        get().unlockAchievement(`level_${newLevel}`);
      },
      
      unlockAchievement: (achievementId: string) => {
        const state = get();
        if (!state.achievements.includes(achievementId)) {
          set({ achievements: [...state.achievements, achievementId] });
          get().addExperience(LEVEL_CONFIG.XP_PER_ACHIEVEMENT);
        }
      },
      
      updateStats: (win: number) => {
        const state = get();
        set({
          totalWins: state.totalWins + 1,
          biggestWin: Math.max(state.biggestWin, win),
        });
      },
      
      // Settings
      toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
      toggleMusic: () => set(state => ({ musicEnabled: !state.musicEnabled })),
      setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
      toggleQuickSpin: () => set(state => ({ quickSpin: !state.quickSpin })),
      
      // FIXED Authentication Integration
      loadUserProgress: (player: any) => {
        console.log('Loading user progress:', player);
        set({
          isLoggedIn: true,
          username: player.username,
          playerId: player.id,
          // Load progress from database
          balance: player.balance || GAME_CONFIG.STARTING_BALANCE,
          level: player.level || 1,
          experience: player.experience || 0,
          experienceToNext: player.experienceToNext || LEVEL_CONFIG.BASE_XP,
          totalSpins: player.total_spins || 0,
          totalWins: player.total_wins || 0,
          biggestWin: player.biggest_win || 0,
          achievements: player.achievements || [],
        });
      },
      
      getProgressForSync: () => {
        const state = get();
        return {
          balance: state.balance,
          level: state.level,
          experience: state.experience,
          total_spins: state.totalSpins,
          total_wins: state.totalWins,
          biggest_win: state.biggestWin,
          achievements: state.achievements,
        };
      },
      
      signOut: () => {
        // Only reset auth state, keep guest progress
        set({
          isLoggedIn: false,
          username: null,
          playerId: null,
          // Keep current progress for guest mode
        });
      },
      
      // Utility
      resetGame: () => {
        set(initialState);
      },
      
      loadSavedState: () => {
        // This is handled by zustand persist middleware
      },
    }),
    {
      name: 'lightning-slots-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist settings and guest progress only
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        animationSpeed: state.animationSpeed,
        quickSpin: state.quickSpin,
        // Persist guest progress only when not logged in
        balance: !state.isLoggedIn ? state.balance : GAME_CONFIG.STARTING_BALANCE,
        level: !state.isLoggedIn ? state.level : 1,
        experience: !state.isLoggedIn ? state.experience : 0,
        experienceToNext: !state.isLoggedIn ? state.experienceToNext : LEVEL_CONFIG.BASE_XP,
        totalSpins: !state.isLoggedIn ? state.totalSpins : 0,
        totalWins: !state.isLoggedIn ? state.totalWins : 0,
        biggestWin: !state.isLoggedIn ? state.biggestWin : 0,
        achievements: !state.isLoggedIn ? state.achievements : [],
      }),
    }
  )
);