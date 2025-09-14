'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="glass border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-4 max-w-md">
        <div className="space-y-3">
          {/* Responsible Gaming */}
          <motion.div
            className="text-center text-xs text-gray-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="mb-2">🎲 Play Responsibly</p>
            <p>This is a demo game with virtual currency only.</p>
            <p>No real money gambling.</p>
          </motion.div>
          
          {/* Game Info */}
          <motion.div
            className="flex justify-center gap-4 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span>RTP: 96%</span>
            <span>•</span>
            <span>Volatility: Medium</span>
            <span>•</span>
            <span>Max Win: 5000x</span>
          </motion.div>
          
          {/* Copyright */}
          <motion.div
            className="text-center text-xs text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>© 2024 Lightning Slots™. All rights reserved.</p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}