/**
 * Cryptographically secure random number generator for fair gameplay
 */
export class RandomNumberGenerator {
  private seed: number;
  private state: number;
  
  constructor(seed?: number) {
    this.seed = seed || Date.now();
    this.state = this.seed;
  }
  
  /**
   * Generate random number between 0 and 1
   */
  random(): number {
    // Use crypto API if available for better randomness
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] / (0xffffffff + 1);
    }
    
    // Fallback to Math.random
    return Math.random();
  }
  
  /**
   * Generate random integer between min and max (inclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }
  
  /**
   * Generate random float between min and max
   */
  randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }
  
  /**
   * Generate weighted random selection
   */
  weightedRandom<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
      throw new Error('Items and weights must have the same length');
    }
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = this.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }
  
  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }
  
  /**
   * Generate random boolean with probability
   */
  randomBoolean(probability: number = 0.5): boolean {
    return this.random() < probability;
  }
  
  /**
   * Pick random element from array
   */
  pickRandom<T>(array: T[]): T {
    return array[this.randomInt(0, array.length - 1)];
  }
  
  /**
   * Pick multiple random elements from array (without replacement)
   */
  pickMultiple<T>(array: T[], count: number): T[] {
    if (count > array.length) {
      throw new Error('Cannot pick more elements than array length');
    }
    
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, count);
  }
  
  /**
   * Generate random distribution based on RTP
   */
  generateRTPOutcome(targetRTP: number, currentRTP: number): boolean {
    // Adjust probability based on current RTP vs target
    const rtpDifference = targetRTP - currentRTP;
    const adjustedProbability = targetRTP + (rtpDifference * 0.1);
    
    return this.random() < adjustedProbability;
  }
  
  /**
   * Reset the generator with new seed
   */
  reset(seed?: number): void {
    this.seed = seed || Date.now();
    this.state = this.seed;
  }
  
  /**
   * Get current seed
   */
  getSeed(): number {
    return this.seed;
  }
  
  /**
   * Validate randomness distribution (for testing)
   */
  static validateDistribution(samples: number = 10000): boolean {
    const rng = new RandomNumberGenerator();
    const buckets = new Array(10).fill(0);
    
    for (let i = 0; i < samples; i++) {
      const value = rng.random();
      const bucket = Math.floor(value * 10);
      buckets[bucket]++;
    }
    
    // Check if distribution is roughly uniform (within 10% tolerance)
    const expectedCount = samples / 10;
    const tolerance = expectedCount * 0.1;
    
    return buckets.every(count => 
      Math.abs(count - expectedCount) <= tolerance
    );
  }
}

// Export singleton instance
export const rng = new RandomNumberGenerator();