import { Variants } from 'framer-motion';

/**
 * Fade in animation variants
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0 }
};

/**
 * Slide up animation variants
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0, y: -20 }
};

/**
 * Scale animation variants
 */
export const scale: Variants = {
  hidden: { scale: 0 },
  visible: { 
    scale: 1,
    transition: { type: 'spring', stiffness: 200 }
  },
  exit: { scale: 0 }
};

/**
 * Bounce animation variants
 */
export const bounce: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: [0, 1.2, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.6, 1],
      type: 'spring',
      stiffness: 300
    }
  }
};

/**
 * Spin animation variants
 */
export const spin: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

/**
 * Pulse animation variants
 */
export const pulse: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: 'loop'
    }
  }
};

/**
 * Glow animation variants
 */
export const glow: Variants = {
  hidden: { filter: 'brightness(1)' },
  visible: {
    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop'
    }
  }
};

/**
 * Shake animation variants
 */
export const shake: Variants = {
  hidden: { x: 0 },
  visible: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      times: [0, 0.25, 0.5, 0.75, 1]
    }
  }
};

/**
 * Lightning flash animation
 */
export const lightning: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 1, 0, 1, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.2, 0.4, 0.8, 1]
    }
  }
};

/**
 * Coin drop animation
 */
export const coinDrop: Variants = {
  hidden: { 
    y: -100, 
    opacity: 0,
    rotate: 0 
  },
  visible: {
    y: window.innerHeight + 100,
    opacity: 1,
    rotate: 720,
    transition: {
      duration: 3,
      ease: 'linear',
      rotate: {
        duration: 3,
        ease: 'linear'
      }
    }
  }
};

/**
 * Winning line draw animation
 */
export const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeInOut' },
      opacity: { duration: 0.2 }
    }
  }
};

/**
 * Stagger children animation
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

/**
 * Stagger item animation
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

/**
 * Reel spin animation config
 */
export const reelSpin = {
  spinning: {
    y: [0, -100],
    transition: {
      duration: 0.1,
      repeat: Infinity,
      ease: 'linear'
    }
  },
  stopping: {
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

/**
 * Create custom spring config
 */
export const springConfig = (stiffness = 200, damping = 20) => ({
  type: 'spring',
  stiffness,
  damping
});

/**
 * Create custom tween config
 */
export const tweenConfig = (duration = 0.3, ease = 'easeInOut') => ({
  type: 'tween',
  duration,
  ease
});

/**
 * Win celebration animation
 */
export const winCelebration = {
  initial: { scale: 0, rotate: 0 },
  animate: {
    scale: [0, 1.5, 1],
    rotate: [0, 360],
    transition: {
      duration: 1,
      scale: {
        times: [0, 0.5, 1],
        type: 'spring',
        stiffness: 200
      },
      rotate: {
        duration: 0.7,
        ease: 'easeOut'
      }
    }
  }
};

/**
 * Level up animation
 */
export const levelUp = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    y: [50, -20, 0],
    transition: {
      duration: 0.8,
      times: [0, 0.5, 1],
      type: 'spring',
      stiffness: 150
    }
  },
  exit: {
    scale: 0,
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.3
    }
  }
};