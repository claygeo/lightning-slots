import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import soundManager from '@/lib/audio/SoundManager';

export function useSound() {
  const { soundEnabled, musicEnabled } = useGameStore();
  
  // Sync sound manager with store state
  useEffect(() => {
    if (soundEnabled) {
      soundManager.unmute();
    } else {
      soundManager.mute();
    }
  }, [soundEnabled]);
  
  useEffect(() => {
    if (musicEnabled) {
      soundManager.startMusic();
    } else {
      soundManager.stopMusic();
    }
  }, [musicEnabled]);
  
  // Sound effect functions
  const playSound = useCallback((soundKey: string, options?: any) => {
    if (soundEnabled) {
      soundManager.play(soundKey, options);
    }
  }, [soundEnabled]);
  
  const playSpinStart = useCallback(() => {
    if (soundEnabled) {
      soundManager.playSpinStart();
    }
  }, [soundEnabled]);
  
  const playSpinStop = useCallback(() => {
    if (soundEnabled) {
      soundManager.playSpinStop();
    }
  }, [soundEnabled]);
  
  const playWin = useCallback((multiplier: number) => {
    if (soundEnabled) {
      soundManager.playWin(multiplier);
    }
  }, [soundEnabled]);
  
  const playCoinCollect = useCallback(() => {
    if (soundEnabled) {
      soundManager.playCoinCollect();
    }
  }, [soundEnabled]);
  
  const playLightningRound = useCallback(() => {
    if (soundEnabled) {
      soundManager.playLightningRound();
    }
  }, [soundEnabled]);
  
  const playLevelUp = useCallback(() => {
    if (soundEnabled) {
      soundManager.play('levelUp');
    }
  }, [soundEnabled]);
  
  const playAchievement = useCallback(() => {
    if (soundEnabled) {
      soundManager.play('achievement');
    }
  }, [soundEnabled]);
  
  return {
    playSound,
    playSpinStart,
    playSpinStop,
    playWin,
    playCoinCollect,
    playLightningRound,
    playLevelUp,
    playAchievement,
  };
}