'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { WinLine } from '@/types';
import { PAYLINES } from '@/constants/config';
import { useEffect, useState } from 'react';

interface PaylinesProps {
  winLines: WinLine[];
  highlightedLine: number | null;
}

export default function Paylines({ winLines, highlightedLine }: PaylinesProps) {
  const [showLineNumber, setShowLineNumber] = useState(false);
  
  // Show line number briefly when highlighted
  useEffect(() => {
    if (highlightedLine) {
      setShowLineNumber(true);
      const timer = setTimeout(() => setShowLineNumber(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [highlightedLine]);
  
  const activeLine = highlightedLine 
    ? winLines.find(line => line.lineId === highlightedLine)
    : null;
    
  const paylineConfig = highlightedLine 
    ? PAYLINES.find(p => p.id === highlightedLine)
    : null;
  
  if (!activeLine || !paylineConfig) return null;
  
  // Calculate SVG path for the payline with proper grid alignment
  const createPath = () => {
    const COLUMNS = 5;
    const ROWS = 3;
    const cellWidth = 100 / COLUMNS;
    const cellHeight = 100 / ROWS;
    
    // Only trace through winning symbols
    const winningPositions = paylineConfig.positions.slice(0, activeLine.symbolCount);
    
    // Calculate exact center points for each cell
    const points = winningPositions.map(([row, col]) => ({
      x: (col * cellWidth) + (cellWidth / 2),
      y: (row * cellHeight) + (cellHeight / 2),
    }));
    
    if (points.length < 2) return '';
    
    // Create smooth path through center of symbols
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };
  
  // Create smaller highlight boxes that fit the symbols better
  const createHighlightBoxes = () => {
    const COLUMNS = 5;
    const ROWS = 3;
    const cellWidth = 100 / COLUMNS;
    const cellHeight = 100 / ROWS;
    
    // Make boxes smaller - 70% of cell size to fit symbols better
    const boxScale = 0.7;
    const boxWidth = cellWidth * boxScale;
    const boxHeight = cellHeight * boxScale;
    
    const winningPositions = paylineConfig.positions.slice(0, activeLine.symbolCount);
    
    return winningPositions.map(([row, col], index) => {
      // Center the smaller box within the cell
      const cellCenterX = (col * cellWidth) + (cellWidth / 2);
      const cellCenterY = (row * cellHeight) + (cellHeight / 2);
      
      return {
        x: cellCenterX - (boxWidth / 2),
        y: cellCenterY - (boxHeight / 2),
        width: boxWidth,
        height: boxHeight,
        delay: index * 0.1,
      };
    });
  };
  
  const highlightBoxes = createHighlightBoxes();
  
  return (
    <>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ 
          zIndex: 20,
          width: '100%',
          height: '100%',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* SVG overlay - exactly matches reel grid */}
        <svg
          className="absolute"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <defs>
            {/* Gradient for animated line */}
            <linearGradient 
              id={`gradient-${highlightedLine}`}
              x1="0%" y1="0%" x2="100%" y2="0%"
            >
              <stop offset="0%" stopColor={paylineConfig.color} stopOpacity="0.8" />
              <stop offset="50%" stopColor={paylineConfig.color} stopOpacity="1" />
              <stop offset="100%" stopColor={paylineConfig.color} stopOpacity="0.8" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Smaller highlight boxes for winning symbol cells */}
          {highlightBoxes.map((box, index) => (
            <motion.rect
              key={`box-${highlightedLine}-${index}`}
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              rx="2"  // Rounded corners
              ry="2"
              fill={paylineConfig.color}
              fillOpacity="0"
              stroke={paylineConfig.color}
              strokeWidth="0.8"
              strokeOpacity="0"
              initial={{ strokeOpacity: 0, fillOpacity: 0 }}
              animate={{ 
                strokeOpacity: [0, 0.8, 0.4],
                fillOpacity: [0, 0.2, 0.1],
              }}
              transition={{
                duration: 0.8,
                delay: box.delay,
              }}
            />
          ))}
          
          {/* Main payline path */}
          <motion.path
            d={createPath()}
            stroke={paylineConfig.color}
            strokeWidth="2"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.9"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1,
              opacity: [0, 1, 0.9],
            }}
            transition={{
              pathLength: { duration: 0.7, ease: 'easeInOut' },
              opacity: { duration: 0.9 },
            }}
          />
          
          {/* Small center dots on winning symbols */}
          {paylineConfig.positions.slice(0, activeLine.symbolCount).map(([row, col], index) => {
            const cellWidth = 100 / 5;
            const cellHeight = 100 / 3;
            const x = (col * cellWidth) + (cellWidth / 2);
            const y = (row * cellHeight) + (cellHeight / 2);
            
            return (
              <g key={`dot-${highlightedLine}-${index}`}>
                {/* Outer pulse ring - smaller */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="none"
                  stroke={paylineConfig.color}
                  strokeWidth="0.4"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 2, 2.5],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: index * 0.1,
                  }}
                />
                
                {/* Center dot - smaller */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r="1"
                  fill={paylineConfig.color}
                  fillOpacity="0.9"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: [0, 1, 0.9],
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                  }}
                />
              </g>
            );
          })}
        </svg>
      </motion.div>
      
      {/* Win amount display */}
      <AnimatePresence>
        {showLineNumber && (
          <motion.div
            className="absolute bottom-2 left-1/2 -translate-x-1/2"
            style={{ zIndex: 30 }}
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ 
              scale: [0, 1.15, 1],
              opacity: 1,
              y: 0,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
          >
            <div
              className="px-3 py-1 rounded-full font-bold text-white shadow-lg text-sm"
              style={{
                backgroundColor: paylineConfig.color,
                boxShadow: `0 0 20px ${paylineConfig.color}, 0 2px 4px rgba(0,0,0,0.3)`,
              }}
            >
              Line {highlightedLine}: {activeLine.payout}x
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}