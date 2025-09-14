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
        get().addExperience(LEVEL_CONFIG.XP_PER_SPIN);
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
          // Fixed: Use a reasonable XP calculation
          const xpEarned = LEVEL_CONFIG.XP_PER_WIN + Math.floor(winResult.totalWin * 2);
          get().addExperience(xpEarned);
          
          // Check achievements
          if (winAmount >= 100 * state.bet) {
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
        set(state => ({ balance: state.balance + amount }));
      },
      
      toggleAutoPlay: () => set(state => ({ isAutoPlay: !state.isAutoPlay })),
      
      setAutoPlayCount: (count: number) => set({ autoPlayCount: count }),
      
      // Power Meter & Lightning Round
      incrementPowerMeter: () => {
        const state = get();
        const newMeter = Math.min(state.powerMeter + 1, GAME_CONFIG.POWER_METER_MAX);
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
      
      // FIXED Progression System
      addExperience: (xp: number) => {
        const state = get();
        let newExperience = state.experience + xp;
        let currentLevel = state.level;
        let currentExperienceToNext = state.experienceToNext;
        
        // Keep leveling up while we have enough XP
        while (newExperience >= currentExperienceToNext) {
          newExperience = newExperience - currentExperienceToNext;
          currentLevel++;
          // Calculate XP needed for next level
          currentExperienceToNext = Math.floor(
            LEVEL_CONFIG.BASE_XP * Math.pow(LEVEL_CONFIG.XP_MULTIPLIER, currentLevel - 1)
          );
        }
        
        // Update state with new values
        set({
          experience: newExperience,
          level: currentLevel,
          experienceToNext: currentExperienceToNext,
        });
        
        // If we leveled up, trigger achievement
        if (currentLevel > state.level) {
          get().unlockAchievement(`level_${currentLevel}`);
        }
      },
      
      levelUp: () => {
        const state = get();
        const newLevel = state.level + 1;
        const newExperienceToNext = Math.floor(
          LEVEL_CONFIG.BASE_XP * Math.pow(LEVEL_CONFIG.XP_MULTIPLIER, newLevel - 1)
        );
        
        set({
          level: newLevel,
          experience: 0,
          experienceToNext: newExperienceToNext,
        });
        
        // Achievement for leveling up
        get().unlockAchievement(`level_${newLevel}`);
      },
      
      unlockAchievement: (achievementId: string) => {
        const state = get();
        if (!state.achievements.includes(achievementId)) {
          set({ achievements: [...state.achievements, achievementId] });
          // Award XP for achievement
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
        balance: state.balance,
        level: state.level,
        experience: state.experience,
        experienceToNext: state.experienceToNext,
        totalSpins: state.totalSpins,
        totalWins: state.totalWins,
        biggestWin: state.biggestWin,
        achievements: state.achievements,
        soundEnabled: state.soundEnabled,
        musicEnabled: state.musicEnabled,
        animationSpeed: state.animationSpeed,
      }),
    }
  )
);