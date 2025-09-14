/**
 * Format currency values
 */
export function formatCurrency(value: number, showCents: boolean = true): string {
  if (showCents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format large numbers with abbreviations
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format time in seconds to mm:ss
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format experience points
 */
export function formatXP(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K XP`;
  }
  return `${value} XP`;
}

/**
 * Format multiplier values
 */
export function formatMultiplier(value: number): string {
  if (value === Math.floor(value)) {
    return `${value}x`;
  }
  return `${value.toFixed(1)}x`;
}

/**
 * Format bet amount for display
 */
export function formatBet(value: number): string {
  if (value >= 100) {
    return `$${Math.floor(value)}`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Format win amount with emphasis
 */
export function formatWin(value: number, bet: number): string {
  const winAmount = value * bet;
  
  if (winAmount >= 1000) {
    return `$${formatNumber(winAmount)}`;
  }
  
  return formatCurrency(winAmount);
}

/**
 * Format level display
 */
export function formatLevel(level: number): string {
  return `Level ${level}`;
}

/**
 * Format achievement progress
 */
export function formatProgress(current: number, total: number): string {
  return `${current}/${total}`;
}

/**
 * Format date for achievements
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format RTP percentage
 */
export function formatRTP(rtp: number): string {
  return `${(rtp * 100).toFixed(2)}%`;
}

/**
 * Calculate and format estimated time to level
 */
export function formatTimeToLevel(currentXP: number, neededXP: number, xpPerMinute: number): string {
  if (xpPerMinute <= 0) return '∞';
  
  const remainingXP = neededXP - currentXP;
  const minutes = Math.ceil(remainingXP / xpPerMinute);
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hours}h ${mins}m`;
  }
  
  return `~${minutes}m`;
}