'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGameStore } from '@/store/gameStore';
import { supabase } from '@/lib/supabase';
import Modal from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    console.log('Form submitted!');
    console.log('Username:', username, 'PIN length:', pin.length);
    console.log('Mode:', isLogin ? 'Sign In' : 'Sign Up');
    
    // Validate before proceeding
    if (username.length < 3 || pin.length !== 4) {
      setError('Please fill in all fields correctly');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (!/^\d{4}$/.test(pin)) {
        throw new Error('PIN must be exactly 4 digits');
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
      }

      // Test database connection first
      console.log('Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('players')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Database connection test failed:', testError);
        throw new Error(`Database error: ${testError.message}`);
      }
      
      console.log('Database connection successful, proceeding with auth...');
      
      if (isLogin) {
        console.log('Calling signIn...');
        await signIn(username, pin);
        console.log('Sign in successful!');
      } else {
        console.log('Calling signUp...');
        await signUp(username, pin);
        console.log('Sign up successful!');
      }
      
      // Load user progress into game store
      const loadUserProgress = useGameStore.getState().loadUserProgress;
      const stored = localStorage.getItem('current_player');
      if (stored) {
        const player = JSON.parse(stored);
        loadUserProgress(player);
      }
      
      console.log('Auth completed, closing modal...');
      onClose();
      resetForm();
    } catch (err: any) {
      console.error('Full error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        fullError: err
      });
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manual button click handler that triggers form submission
  const handleButtonClick = () => {
    console.log('Button clicked - triggering form submission');
    if (formRef.current && username.length >= 3 && pin.length === 4) {
      // Create and dispatch a submit event
      const submitEvent = new Event('submit', { 
        bubbles: true, 
        cancelable: true 
      });
      formRef.current.dispatchEvent(submitEvent);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPin('');
    setError('');
    setIsLogin(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setPin(value);
    }
  };

  const handleModeToggle = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError('');
  };

  const isFormValid = username.length >= 3 && pin.length === 4 && !loading;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isLogin ? '⚡ Welcome Back' : '✨ Join the Game'}>
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div className="bg-slate-900/80 rounded-xl p-1 border border-amber-500/20">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleModeToggle(false)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                background: !isLogin 
                  ? 'linear-gradient(135deg, #F59E0B, #D97706)' 
                  : 'transparent',
                color: !isLogin ? '#000' : '#D1D5DB'
              }}
              onMouseEnter={(e) => {
                if (!isLogin) return;
                e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                if (!isLogin) return;
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#D1D5DB';
              }}
            >
              🎰 Create Account
            </button>
            <button
              type="button"
              onClick={() => handleModeToggle(true)}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                background: isLogin 
                  ? 'linear-gradient(135deg, #F59E0B, #D97706)' 
                  : 'transparent',
                color: isLogin ? '#000' : '#D1D5DB'
              }}
              onMouseEnter={(e) => {
                if (isLogin) return;
                e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                if (isLogin) return;
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#D1D5DB';
              }}
            >
              🔑 Sign In
            </button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="text-center bg-slate-900/40 rounded-lg p-4 border border-gray-700/50">
          <p className="text-gray-200 leading-relaxed">
            {isLogin ? (
              <>
                <span className="text-amber-400 font-semibold">Welcome back!</span><br />
                Enter your credentials to continue playing
              </>
            ) : (
              <>
                <span className="text-amber-400 font-semibold">Ready to play?</span><br />
                Create your account to start winning big
              </>
            )}
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <span className="text-red-400">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-200">
              🎮 Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full px-4 py-3 bg-slate-800/80 border border-gray-600/50 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                text-white placeholder-gray-400 font-medium
                transition-all duration-200 backdrop-blur-sm
              "
              placeholder="Choose your player name"
              required
              minLength={3}
              maxLength={20}
              disabled={loading}
            />
            <p className="text-xs text-gray-400 flex items-center space-x-1">
              <span>💡</span>
              <span>3-20 characters • Letters, numbers, and underscores only</span>
            </p>
          </div>

          {/* PIN Field */}
          <div className="space-y-2">
            <label htmlFor="pin" className="block text-sm font-semibold text-gray-200">
              🔐 4-Digit PIN
            </label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={handlePinChange}
              className="
                w-full px-4 py-3 bg-slate-800/80 border border-gray-600/50 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                text-white text-xl font-bold
                transition-all duration-200 backdrop-blur-sm
              "
              style={{ textAlign: 'left', letterSpacing: '0.2em' }}
              placeholder="1995"
              required
              maxLength={4}
              pattern="\d{4}"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 flex items-center space-x-1">
              <span>🎯</span>
              <span>Choose something memorable (like a year: 1995)</span>
            </p>
          </div>

          {/* Submit Button - Using type="button" with manual submission */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={!isFormValid}
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '12px',
                border: 'none',
                cursor: !isFormValid ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                background: !isFormValid 
                  ? 'linear-gradient(135deg, #6B7280, #4B5563)'
                  : 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: !isFormValid ? '#9CA3AF' : '#000',
                boxShadow: !isFormValid 
                  ? 'none'
                  : '0 4px 20px rgba(245, 158, 11, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)',
                transform: !isFormValid ? 'none' : 'translateY(0)',
                opacity: !isFormValid ? '0.6' : '1'
              }}
              onMouseEnter={(e) => {
                if (!isFormValid) return;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(245, 158, 11, 0.5), 0 3px 6px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #FBBF24, #F59E0B)';
              }}
              onMouseLeave={(e) => {
                if (!isFormValid) return;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 158, 11, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #000',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span>Processing...</span>
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span>{isLogin ? '🎰' : '✨'}</span>
                  <span>{isLogin ? 'Let\'s Play!' : 'Start Gaming!'}</span>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Security Info */}
        <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-lg p-4 border border-gray-600/30 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <span className="text-green-400 text-xl">🛡️</span>
            <div>
              <h3 className="text-sm font-semibold text-green-400 mb-1">Simple & Secure</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Your progress is automatically saved and secured. No email required - just pick a username and PIN you'll remember.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}