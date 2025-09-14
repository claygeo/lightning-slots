'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from '@/styles/MobileContainer.module.css';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

export default function MobileContainer({ children, className = '' }: MobileContainerProps) {
  return (
    <motion.div
      className={`${styles.container} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Content */}
      <div className={styles.content}>
        {children}
      </div>
    </motion.div>
  );
}