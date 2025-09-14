import { useEffect, useRef, useState, useCallback } from 'react';
import { ANIMATION_CONFIG } from '@/constants/config';

interface AnimationState {
  isAnimating: boolean;
  phase: 'idle' | 'spinning' | 'stopping' | 'celebrating';
  reelStates: boolean[];
}

/**
 * Hook for managing slot machine animations
 */
export function useAnimation(reelCount: number = 5) {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    phase: 'idle',
    reelStates: Array(reelCount).fill(false),
  });

  const animationFrameRef = useRef<number>();
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  /**
   * Start spin animation with cascading reel stops
   */
  const startSpin = useCallback(() => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];

    setAnimationState({
      isAnimating: true,
      phase: 'spinning',
      reelStates: Array(reelCount).fill(true),
    });

    // Schedule cascading reel stops
    const baseDelay = ANIMATION_CONFIG.REEL_SPIN_SPEED * 10;
    const cascadeDelay = ANIMATION_CONFIG.REEL_STOP_DURATION / 2;

    for (let i = 0; i < reelCount; i++) {
      const timeout = setTimeout(() => {
        setAnimationState(prev => ({
          ...prev,
          reelStates: prev.reelStates.map((state, index) => 
            index === i ? false : state
          ),
        }));

        // Check if this is the last reel
        if (i === reelCount - 1) {
          setTimeout(() => {
            setAnimationState(prev => ({
              ...prev,
              isAnimating: false,
              phase: 'idle',
            }));
          }, ANIMATION_CONFIG.REEL_STOP_DURATION);
        }
      }, baseDelay + (i * cascadeDelay));

      timeoutsRef.current.push(timeout);
    }
  }, [reelCount]);

  /**
   * Stop all animations immediately
   */
  const stopAnimation = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setAnimationState({
      isAnimating: false,
      phase: 'idle',
      reelStates: Array(reelCount).fill(false),
    });
  }, [reelCount]);

  /**
   * Trigger celebration animation
   */
  const celebrate = useCallback((duration: number = 3000) => {
    setAnimationState(prev => ({
      ...prev,
      phase: 'celebrating',
    }));

    const timeout = setTimeout(() => {
      setAnimationState(prev => ({
        ...prev,
        phase: 'idle',
      }));
    }, duration);

    timeoutsRef.current.push(timeout);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    ...animationState,
    startSpin,
    stopAnimation,
    celebrate,
  };
}

/**
 * Hook for smooth number animations
 */
export function useCountAnimation(
  targetValue: number,
  duration: number = 1000
): number {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef<number>(targetValue);

  useEffect(() => {
    if (displayValue === targetValue) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        startValueRef.current = displayValue;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function (ease-out-cubic)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValueRef.current + 
        (targetValue - startValueRef.current) * easeOutCubic;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        startTimeRef.current = undefined;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, displayValue]);

  return displayValue;
}

/**
 * Hook for symbol bounce animation
 */
export function useSymbolBounce() {
  const [bouncing, setBouncing] = useState<number[]>([]);

  const bounce = useCallback((indices: number[]) => {
    setBouncing(indices);
    
    setTimeout(() => {
      setBouncing([]);
    }, ANIMATION_CONFIG.WIN_HIGHLIGHT_DURATION);
  }, []);

  return { bouncing, bounce };
}

/**
 * Hook for payline trace animation
 */
export function usePaylineAnimation() {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [traceProgress, setTraceProgress] = useState(0);
  const animationRef = useRef<number>();

  const traceLine = useCallback((lineId: number, duration: number = 1000) => {
    setActiveLine(lineId);
    setTraceProgress(0);

    const startTime = performance.now();

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setTraceProgress(progress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Keep line visible for a moment
        setTimeout(() => {
          setActiveLine(null);
          setTraceProgress(0);
        }, 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  const clearTrace = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setActiveLine(null);
    setTraceProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    activeLine,
    traceProgress,
    traceLine,
    clearTrace,
  };
}