import { GAME_CONFIG } from '@/constants/config';

/**
 * Validate bet amount
 */
export function validateBet(bet: number, balance: number): {
  valid: boolean;
  error?: string;
} {
  if (bet < GAME_CONFIG.MIN_BET) {
    return {
      valid: false,
      error: `Minimum bet is $${GAME_CONFIG.MIN_BET}`,
    };
  }
  
  if (bet > GAME_CONFIG.MAX_BET) {
    return {
      valid: false,
      error: `Maximum bet is $${GAME_CONFIG.MAX_BET}`,
    };
  }
  
  if (bet > balance) {
    return {
      valid: false,
      error: 'Insufficient balance',
    };
  }
  
  // Check if bet is a valid increment (e.g., multiples of 0.01)
  if (!Number.isFinite(bet) || bet !== Math.round(bet * 100) / 100) {
    return {
      valid: false,
      error: 'Invalid bet amount',
    };
  }
  
  return { valid: true };
}

/**
 * Validate auto-play settings
 */
export function validateAutoPlay(
  rounds: number,
  balance: number,
  bet: number
): {
  valid: boolean;
  error?: string;
} {
  if (rounds < 1 || rounds > 100) {
    return {
      valid: false,
      error: 'Auto-play rounds must be between 1 and 100',
    };
  }
  
  const totalRequired = rounds * bet;
  if (totalRequired > balance) {
    return {
      valid: false,
      error: `Insufficient balance for ${rounds} rounds`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate win amount
 */
export function validateWin(
  win: number,
  bet: number,
  maxMultiplier: number = GAME_CONFIG.MAX_WIN_MULTIPLIER
): boolean {
  const maxWin = bet * maxMultiplier;
  return win <= maxWin;
}

/**
 * Validate RTP is within acceptable range
 */
export function validateRTP(rtp: number): boolean {
  return rtp >= 0.85 && rtp <= 0.99;
}

/**
 * Validate level progression
 */
export function validateLevel(
  level: number,
  experience: number,
  requiredExperience: number
): boolean {
  if (level < 1 || level > 100) return false;
  if (experience < 0) return false;
  if (experience >= requiredExperience && level < 100) return false; // Should have leveled up
  return true;
}

/**
 * Validate lightning round multiplier
 */
export function validateLightningMultiplier(multiplier: number): boolean {
  return multiplier >= 1 && multiplier <= 10;
}

/**
 * Validate game state consistency
 */
export function validateGameState(state: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check balance
  if (state.balance < 0) {
    errors.push('Balance cannot be negative');
  }
  
  // Check bet
  const betValidation = validateBet(state.bet, state.balance);
  if (!betValidation.valid && betValidation.error) {
    errors.push(betValidation.error);
  }
  
  // Check power meter
  if (state.powerMeter < 0 || state.powerMeter > GAME_CONFIG.POWER_METER_MAX) {
    errors.push('Invalid power meter value');
  }
  
  // Check level and experience
  if (!validateLevel(state.level, state.experience, state.experienceToNext)) {
    errors.push('Invalid level progression');
  }
  
  // Check lightning multiplier
  if (!validateLightningMultiplier(state.lightningMultiplier)) {
    errors.push('Invalid lightning multiplier');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate symbol grid
 */
export function validateSymbolGrid(grid: string[][]): boolean {
  if (grid.length !== GAME_CONFIG.ROWS) return false;
  
  for (const row of grid) {
    if (row.length !== GAME_CONFIG.REELS) return false;
    
    for (const symbol of row) {
      if (!isValidSymbol(symbol)) return false;
    }
  }
  
  return true;
}

/**
 * Check if symbol is valid
 */
export function isValidSymbol(symbol: string): boolean {
  const validSymbols = ['cherry', 'lemon', 'bell', 'bar', 'seven', 'diamond'];
  return validSymbols.includes(symbol);
}

/**
 * Validate payline configuration
 */
export function validatePayline(payline: any): boolean {
  if (!payline.id || !payline.positions) return false;
  if (payline.positions.length !== GAME_CONFIG.REELS) return false;
  
  for (const position of payline.positions) {
    if (!Array.isArray(position) || position.length !== 2) return false;
    const [row, col] = position;
    if (row < 0 || row >= GAME_CONFIG.ROWS) return false;
    if (col < 0 || col >= GAME_CONFIG.REELS) return false;
  }
  
  return true;
}

/**
 * Validate achievement
 */
export function validateAchievement(achievement: any): boolean {
  if (!achievement.id || !achievement.name || !achievement.description) {
    return false;
  }
  
  if (!achievement.target || achievement.target < 1) {
    return false;
  }
  
  if (!achievement.reward || !achievement.reward.type || !achievement.reward.amount) {
    return false;
  }
  
  const validRewardTypes = ['xp', 'coins', 'multiplier'];
  if (!validRewardTypes.includes(achievement.reward.type)) {
    return false;
  }
  
  return true;
}

/**
 * Validate sound settings
 */
export function validateSoundSettings(settings: any): boolean {
  if (typeof settings.soundEnabled !== 'boolean') return false;
  if (typeof settings.musicEnabled !== 'boolean') return false;
  if (settings.volume < 0 || settings.volume > 1) return false;
  
  return true;
}

/**
 * Validate animation speed
 */
export function validateAnimationSpeed(speed: string): boolean {
  const validSpeeds = ['slow', 'normal', 'fast'];
  return validSpeeds.includes(speed);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  // Remove any HTML tags
  const cleaned = input.replace(/<[^>]*>/g, '');
  
  // Trim whitespace
  return cleaned.trim();
}

/**
 * Validate email for account features
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate age for gambling compliance
 */
export function validateAge(age: number): boolean {
  return age >= 18 && age <= 120;
}