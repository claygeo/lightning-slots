'use client';

import { motion } from 'framer-motion';
import { PAYLINES } from '@/constants/config';

interface PaylineIndicatorsProps {
  side: 'left' | 'right';
  activeLines: number[];
  highlightedLine: number | null;
  totalLines: number;
}

export default function PaylineIndicators({ 
  side, 
  activeLines, 
  highlightedLine,
  totalLines 
}: PaylineIndicatorsProps) {
  // Determine which lines to show on each side
  const lines = side === 'left' 
    ? Array.from({ length: Math.ceil(totalLines / 2) }, (_, i) => i + 1)
    : Array.from({ length: Math.floor(totalLines / 2) }, (_, i) => i + Math.ceil(totalLines / 2) + 1);

  // Get payline color
  const getLineColor = (lineId: number) => {
    const payline = PAYLINES.find(p => p.id === lineId);
    return payline ? payline.color : '#FFD700';
  };

  // Determine position based on payline pattern
  const getIndicatorPosition = (lineId: number): 'top' | 'middle' | 'bottom' => {
    const payline = PAYLINES.find(p => p.id === lineId);
    if (!payline) return 'middle';
    
    // Check starting position for left side, ending position for right side
    const checkPosition = side === 'left' ? payline.positions[0] : payline.positions[4];
    const row = checkPosition[0];
    
    if (row === 0) return 'top';
    if (row === 2) return 'bottom';
    return 'middle';
  };

  return (
    <div 
      className={`flex flex-col justify-between items-center py-2 ${
        side === 'left' ? 'pr-2' : 'pl-2'
      }`}
      style={{ 
        width: '40px',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)',
      }}
    >
      {/* Line indicators */}
      <div className="flex flex-col justify-around h-full w-full">
        {lines.map((lineId) => {
          const isActive = activeLines.includes(lineId);
          const isHighlighted = highlightedLine === lineId;
          const position = getIndicatorPosition(lineId);
          const color = getLineColor(lineId);
          
          return (
            <div
              key={lineId}
              className="relative flex items-center justify-center"
              style={{ 
                flex: 1,
                maxHeight: '30px',
              }}
            >
              {/* Connection line to reel */}
              <div
                className="absolute"
                style={{
                  width: '100%',
                  height: '2px',
                  background: isHighlighted 
                    ? `linear-gradient(90deg, ${color}00, ${color}FF)`
                    : isActive 
                    ? `linear-gradient(90deg, ${color}00, ${color}40)`
                    : 'transparent',
                  [side === 'left' ? 'right' : 'left']: 0,
                  top: position === 'top' ? '25%' : position === 'bottom' ? '75%' : '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              
              {/* Indicator circle/diamond */}
              <motion.div
                className="relative z-10"
                animate={{
                  scale: isHighlighted ? [1, 1.3, 1] : 1,
                  rotate: isHighlighted ? [0, 180, 360] : 0,
                }}
                transition={{
                  duration: 1,
                  repeat: isHighlighted ? Infinity : 0,
                }}
              >
                <div
                  className="flex items-center justify-center font-bold text-xs"
                  style={{
                    width: '28px',
                    height: '28px',
                    background: isHighlighted 
                      ? `radial-gradient(circle, ${color}FF, ${color}AA)`
                      : isActive 
                      ? `radial-gradient(circle, ${color}88, ${color}44)`
                      : 'radial-gradient(circle, #333333, #1a1a1a)',
                    border: `2px solid ${isHighlighted ? color : isActive ? `${color}66` : '#444444'}`,
                    borderRadius: '50%',
                    boxShadow: isHighlighted 
                      ? `0 0 15px ${color}, inset 0 0 10px ${color}66`
                      : isActive
                      ? `0 0 5px ${color}44`
                      : 'inset 0 0 5px rgba(0,0,0,0.5)',
                    color: isHighlighted ? '#FFFFFF' : isActive ? '#FFD700' : '#666666',
                    textShadow: isHighlighted ? '0 0 5px rgba(0,0,0,0.8)' : 'none',
                  }}
                >
                  {lineId}
                </div>
                
                {/* Glow effect when highlighted */}
                {isHighlighted && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${color}44, transparent)`,
                      filter: 'blur(8px)',
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
      
      {/* Side label */}
      <div 
        className="text-xs font-semibold text-gray-400 mt-1"
        style={{ writingMode: 'vertical-rl' }}
      >
        LINES
      </div>
    </div>
  );
}