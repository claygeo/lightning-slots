'use client';

import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export default function Spinner({ 
  size = 'medium', 
  color = 'var(--primary)',
  className = '' 
}: SpinnerProps) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };
  
  const spinnerSize = sizeMap[size];
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.svg
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 50 50"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="80 20"
        />
      </motion.svg>
    </div>
  );
}