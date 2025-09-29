'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalProps } from '@/types';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}: ModalProps) {
  // Memoize the close function to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)'; // Prevent layout shift
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape, true);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [isOpen, handleClose]);

  // Prevent event bubbling on backdrop clicks
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleClose();
  }, [handleClose]);

  // Prevent clicks inside modal from closing it
  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Enhanced Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-40 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          />
          
          {/* Modal Container */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`
                relative w-full max-w-lg max-h-[90vh] overflow-hidden pointer-events-auto
                bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98
                backdrop-blur-xl border border-yellow-500/30 rounded-2xl
                shadow-2xl shadow-yellow-500/20
                ${className}
              `}
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 25,
                duration: 0.3
              }}
              onClick={handleModalClick}
            >
              {/* Lightning Border Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-pulse" />
              
              {/* Header */}
              {title && (
                <div className="relative flex items-center justify-between p-6 pb-4 border-b border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                      {title}
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    type="button"
                    className="
                      w-10 h-10 rounded-full bg-red-500/20 border border-red-400/40
                      text-red-300 hover:text-red-100 hover:bg-red-500/30
                      transition-all duration-200 flex items-center justify-center
                      group focus:outline-none focus:ring-2 focus:ring-red-400/50
                    "
                    title="Close (ESC)"
                    aria-label="Close modal"
                  >
                    <svg 
                      className="w-5 h-5 group-hover:scale-110 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Content */}
              <div className="relative p-6 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-yellow-500/50">
                <div className="text-gray-100">
                  {children}
                </div>
              </div>
              
              {/* Bottom Glow Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-yellow-500/10 to-transparent pointer-events-none rounded-b-2xl" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Named export for compatibility
export { Modal };