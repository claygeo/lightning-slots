import { Howl, Howler } from 'howler';
import { SOUND_PATHS } from '@/constants/config';

class SoundManager {
  private sounds: Map<string, Howl>;
  private backgroundMusic: Howl | null;
  private enabled: boolean;
  private musicEnabled: boolean;
  private volume: number;
  
  constructor() {
    this.sounds = new Map();
    this.backgroundMusic = null;
    this.enabled = true;
    this.musicEnabled = true;
    this.volume = 0.5;
    
    // Set global volume
    Howler.volume(this.volume);
    
    // Initialize sounds
    this.initializeSounds();
  }
  
  private initializeSounds() {
    // Load all game sounds
    const soundConfigs = [
      { key: 'spin', src: SOUND_PATHS.spin, volume: 0.3 },
      { key: 'win', src: SOUND_PATHS.win, volume: 0.5 },
      { key: 'bigWin', src: SOUND_PATHS.bigWin, volume: 0.6 },
      { key: 'coin', src: SOUND_PATHS.coin, volume: 0.4 },
      { key: 'lightning', src: SOUND_PATHS.lightning, volume: 0.7 },
      { key: 'levelUp', src: SOUND_PATHS.levelUp, volume: 0.6 },
      { key: 'achievement', src: SOUND_PATHS.achievement, volume: 0.5 },
    ];
    
    soundConfigs.forEach(config => {
      try {
        const sound = new Howl({
          src: [config.src],
          volume: config.volume,
          preload: true,
          html5: true, // Use HTML5 Audio for better mobile support
        });
        
        this.sounds.set(config.key, sound);
      } catch (error) {
        console.warn(`Failed to load sound: ${config.key}`, error);
      }
    });
    
    // Load background music
    try {
      this.backgroundMusic = new Howl({
        src: [SOUND_PATHS.background],
        volume: 0.2,
        loop: true,
        html5: true,
      });
    } catch (error) {
      console.warn('Failed to load background music', error);
    }
  }
  
  /**
   * Play a sound effect
   */
  play(soundKey: string, options?: { volume?: number; rate?: number }) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundKey);
    if (!sound) {
      console.warn(`Sound not found: ${soundKey}`);
      return;
    }
    
    try {
      const id = sound.play();
      
      if (options?.volume !== undefined) {
        sound.volume(options.volume, id);
      }
      
      if (options?.rate !== undefined) {
        sound.rate(options.rate, id);
      }
      
      return id;
    } catch (error) {
      console.error(`Error playing sound: ${soundKey}`, error);
    }
  }
  
  /**
   * Stop a specific sound
   */
  stop(soundKey: string, id?: number) {
    const sound = this.sounds.get(soundKey);
    if (sound) {
      if (id !== undefined) {
        sound.stop(id);
      } else {
        sound.stop();
      }
    }
  }
  
  /**
   * Play spin sound with increasing pitch
   */
  playSpinStart() {
    if (!this.enabled) return;
    
    const spinSound = this.sounds.get('spin');
    if (spinSound) {
      const id = spinSound.play();
      
      // Gradually increase pitch
      let rate = 1;
      const interval = setInterval(() => {
        rate += 0.1;
        if (rate >= 1.5) {
          clearInterval(interval);
        } else {
          spinSound.rate(rate, id);
        }
      }, 100);
      
      return id;
    }
  }
  
  /**
   * Play spin stop sound with decreasing pitch
   */
  playSpinStop() {
    if (!this.enabled) return;
    
    const spinSound = this.sounds.get('spin');
    if (spinSound) {
      const id = spinSound.play();
      spinSound.rate(1.5, id);
      
      // Gradually decrease pitch
      let rate = 1.5;
      const interval = setInterval(() => {
        rate -= 0.1;
        if (rate <= 0.5) {
          clearInterval(interval);
          spinSound.stop(id);
        } else {
          spinSound.rate(rate, id);
        }
      }, 100);
    }
  }
  
  /**
   * Play win sound based on win size
   */
  playWin(multiplier: number) {
    if (!this.enabled) return;
    
    if (multiplier >= 50) {
      this.play('bigWin');
    } else {
      this.play('win', { 
        volume: 0.3 + (multiplier * 0.01), // Volume increases with win size
        rate: 1 + (multiplier * 0.01), // Pitch increases slightly with win size
      });
    }
  }
  
  /**
   * Play lightning round sounds
   */
  playLightningRound() {
    if (!this.enabled) return;
    
    this.play('lightning');
    
    // Play ambient lightning sounds periodically
    const ambientInterval = setInterval(() => {
      this.play('lightning', { volume: 0.2 });
    }, 3000);
    
    // Stop after 5 seconds (lightning round duration)
    setTimeout(() => {
      clearInterval(ambientInterval);
    }, 5000);
  }
  
  /**
   * Play coin collection sound with variation
   */
  playCoinCollect() {
    if (!this.enabled) return;
    
    // Add slight pitch variation for each coin
    const rate = 0.9 + Math.random() * 0.3;
    this.play('coin', { rate });
  }
  
  /**
   * Start background music
   */
  startMusic() {
    if (!this.musicEnabled || !this.backgroundMusic) return;
    
    try {
      this.backgroundMusic.play();
    } catch (error) {
      console.error('Error starting background music', error);
    }
  }
  
  /**
   * Stop background music
   */
  stopMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }
  
  /**
   * Toggle sound effects
   */
  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
  
  /**
   * Toggle background music
   */
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    
    return this.musicEnabled;
  }
  
  /**
   * Set global volume
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.volume);
  }
  
  /**
   * Get current volume
   */
  getVolume() {
    return this.volume;
  }
  
  /**
   * Mute all sounds
   */
  mute() {
    Howler.mute(true);
  }
  
  /**
   * Unmute all sounds
   */
  unmute() {
    Howler.mute(false);
  }
  
  /**
   * Clean up and unload all sounds
   */
  destroy() {
    this.stopMusic();
    
    this.sounds.forEach(sound => {
      sound.unload();
    });
    
    this.sounds.clear();
    
    if (this.backgroundMusic) {
      this.backgroundMusic.unload();
      this.backgroundMusic = null;
    }
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Export for use in components
export default soundManager;