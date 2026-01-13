'use client';

// ============================================
// ROYAL JACKPOT - Authentication Modal
// Premium login/signup experience
// ============================================

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import styles from './AuthModal.module.scss';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { username: string; id: string }) => void;
}

type AuthMode = 'login' | 'signup';

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  const handlePinChange = (index: number, value: string, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = isConfirm ? [...confirmPin] : [...pin];
    newPin[index] = value.slice(-1);

    if (isConfirm) {
      setConfirmPin(newPin);
    } else {
      setPin(newPin);
    }

    // Auto-focus next input
    if (value && index < 3) {
      const refs = isConfirm ? confirmPinRefs : pinRefs;
      refs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent, isConfirm = false) => {
    if (e.key === 'Backspace') {
      const currentPin = isConfirm ? confirmPin : pin;
      if (!currentPin[index] && index > 0) {
        const refs = isConfirm ? confirmPinRefs : pinRefs;
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    const pinCode = pin.join('');
    if (pinCode.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    if (mode === 'signup') {
      const confirmPinCode = confirmPin.join('');
      if (pinCode !== confirmPinCode) {
        setError('PINs do not match');
        return;
      }
    }

    setIsLoading(true);

    // Simulate auth (replace with actual Supabase call)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock success
      onSuccess({
        username,
        id: `user_${Date.now()}`,
      });
    } catch {
      setError(mode === 'login' ? 'Invalid credentials' : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setPin(['', '', '', '']);
    setConfirmPin(['', '', '', '']);
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close Button */}
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerIcon}>👑</div>
              <h2 className={styles.headerTitle}>
                {mode === 'login' ? 'Welcome Back' : 'Join Royal Jackpot'}
              </h2>
              <p className={styles.headerSubtitle}>
                {mode === 'login'
                  ? 'Sign in to continue your winning streak'
                  : 'Create an account to save your progress'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Username */}
              <div className={styles.inputGroup}>
                <label htmlFor="username">Username</label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon}>👤</span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="Enter your username"
                    maxLength={20}
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* PIN */}
              <div className={styles.inputGroup}>
                <label>4-Digit PIN</label>
                <div className={styles.pinInputs}>
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { pinRefs.current[index] = el; }}
                      type="password"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      maxLength={1}
                      disabled={isLoading}
                      className={styles.pinInput}
                    />
                  ))}
                </div>
              </div>

              {/* Confirm PIN (signup only) */}
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    className={styles.inputGroup}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label>Confirm PIN</label>
                    <div className={styles.pinInputs}>
                      {confirmPin.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { confirmPinRefs.current[index] = el; }}
                          type="password"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handlePinChange(index, e.target.value, true)}
                          onKeyDown={(e) => handlePinKeyDown(index, e, true)}
                          maxLength={1}
                          disabled={isLoading}
                          className={styles.pinInput}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className={styles.error}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <span className={styles.errorIcon}>⚠️</span>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <span className={styles.loader} />
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </motion.button>
            </form>

            {/* Toggle Mode */}
            <div className={styles.toggleMode}>
              <span>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <button type="button" onClick={toggleMode}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>

            {/* Guest Option */}
            <div className={styles.guestOption}>
              <button type="button" onClick={onClose} className={styles.guestButton}>
                Continue as Guest
              </button>
              <p className={styles.guestNote}>Your progress will not be saved</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.getElementById('modal-root') || document.body);
}
