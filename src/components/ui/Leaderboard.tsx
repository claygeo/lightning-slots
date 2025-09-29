'use client';

import React, { useState, useEffect } from 'react';
import { progressService, LeaderboardEntry } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatWin } from '@/constants/payouts';

interface LeaderboardProps {
  onClose?: () => void;
}

interface TournamentEntry extends LeaderboardEntry {
  tournamentPoints: number;
  rank: number;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<TournamentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRank, setUserRank] = useState<number>(0);
  
  const { user } = useAuth();

  // Tournament end date - October 10, 2024
  const tournamentEndDate = new Date('2024-10-10T23:59:59');
  const now = new Date();
  const daysRemaining = Math.ceil((tournamentEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Calculate tournament points using weighted scoring
  const calculateTournamentPoints = (player: LeaderboardEntry): number => {
    const level = player.level || 1;
    const balance = player.balance || 0;
    const biggestWin = player.biggest_win || 0;
    
    // Weighted scoring system
    const levelPoints = level * 1000;           // Heavy weight on progression (40%)
    const balancePoints = balance * 0.5;        // Current balance (30%)
    const bestWinPoints = biggestWin * 0.3;     // Best single win (30%)
    
    return Math.floor(levelPoints + balancePoints + bestWinPoints);
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load all three leaderboards to get complete data
      const [levelData, balanceData, winData] = await Promise.all([
        progressService.getLeaderboard('level', 100),
        progressService.getLeaderboard('balance', 100),
        progressService.getLeaderboard('biggest_win', 100)
      ]);
      
      // Combine data and calculate tournament points
      const playerMap = new Map<string, TournamentEntry>();
      
      // Process all data to ensure we have complete player info
      [...levelData, ...balanceData, ...winData].forEach(entry => {
        const existing = playerMap.get(entry.username) || entry as TournamentEntry;
        playerMap.set(entry.username, {
          ...existing,
          ...entry,
          tournamentPoints: 0,
          rank: 0
        });
      });
      
      // Calculate tournament points for each player
      const tournamentData = Array.from(playerMap.values()).map(player => ({
        ...player,
        tournamentPoints: calculateTournamentPoints(player),
        rank: 0
      }));
      
      // Sort by tournament points (highest first)
      tournamentData.sort((a, b) => b.tournamentPoints - a.tournamentPoints);
      
      // Assign ranks
      tournamentData.forEach((player, index) => {
        player.rank = index + 1;
      });
      
      setLeaderboard(tournamentData);
      
      // Find user's rank
      if (user) {
        const userEntry = tournamentData.find(p => p.username === user.username);
        setUserRank(userEntry ? userEntry.rank : 0);
      }
    } catch (err: any) {
      setError('Failed to load tournament standings');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Safe value formatter
  const safeValue = (value: any, defaultValue: number = 0): number => {
    return value !== null && value !== undefined ? value : defaultValue;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
      borderRadius: '16px',
      padding: '20px',
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: 'white',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      position: 'relative'
    }}>
      {/* Tournament Badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'linear-gradient(135deg, #ff6b00, #ff9100)',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(255, 107, 0, 0.4)'
      }}>
        🔥 {daysRemaining > 0 ? `${daysRemaining} DAYS LEFT` : 'FINAL DAY!'}
      </div>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>🏆</span>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            margin: 0,
            background: 'linear-gradient(90deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            TOURNAMENT STANDINGS
          </h1>
          <span style={{ fontSize: '24px' }}>🏆</span>
        </div>
        <p style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.8)',
          margin: '4px 0'
        }}>
          Competition ends October 10, 2024
        </p>
      </div>

      {/* Prize Indicator - Compact */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.15), rgba(255, 140, 0, 0.15))',
        borderRadius: '8px',
        padding: '8px 12px',
        marginBottom: '12px',
        border: '1px solid rgba(255, 215, 0, 0.25)',
        fontSize: '11px',
        color: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <span>🥇 1st Place: $30 Food Delivery</span>
        <span>🥈 2nd Place: Candy Pack</span>
        <span>🥉 3rd Place: Candy</span>
      </div>

      {/* Column Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '45px 1fr 90px 70px 80px 90px',
        gap: '8px',
        padding: '10px 12px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        marginBottom: '8px',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
      }}>
        <div>Rank</div>
        <div>Player</div>
        <div style={{ textAlign: 'center' }}>Points</div>
        <div style={{ textAlign: 'center' }}>Level</div>
        <div style={{ textAlign: 'center' }}>Balance</div>
        <div style={{ textAlign: 'center' }}>Best Win</div>
      </div>

      {/* Leaderboard Entries */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '4px'
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }}></div>
            Loading tournament standings...
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            <p style={{ marginBottom: '16px' }}>{error}</p>
            <button
              onClick={loadLeaderboard}
              style={{
                padding: '8px 24px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Retry
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px'
          }}>
            No players yet. Be the first to compete!
          </div>
        ) : (
          leaderboard.slice(0, 50).map((entry, index) => {
            const isCurrentUser = entry.username === user?.username;
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const isPrizePosition = rank <= 3;
            
            // Safe value extraction
            const level = safeValue(entry.level, 1);
            const balance = safeValue(entry.balance, 0);
            const biggestWin = safeValue(entry.biggest_win, 0);
            
            return (
              <div
                key={`${entry.username}-${index}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '45px 1fr 90px 70px 80px 90px',
                  gap: '8px',
                  padding: '12px',
                  background: isCurrentUser 
                    ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.2))'
                    : isPrizePosition 
                      ? `linear-gradient(90deg, ${
                          rank === 1 ? 'rgba(255, 215, 0, 0.15), rgba(255, 195, 0, 0.1)' :
                          rank === 2 ? 'rgba(192, 192, 192, 0.15), rgba(169, 169, 169, 0.1)' :
                          'rgba(205, 127, 50, 0.15), rgba(184, 115, 51, 0.1)'
                        })`
                      : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  marginBottom: '3px',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: isCurrentUser 
                    ? '2px solid rgba(255, 215, 0, 0.6)' 
                    : isPrizePosition
                      ? '1px solid rgba(255, 215, 0, 0.2)'
                      : '1px solid transparent',
                  transition: 'all 0.2s',
                  cursor: 'default',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentUser && !isPrizePosition) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentUser && !isPrizePosition) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }
                }}
              >
                {/* Rank */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isTop3 ? '18px' : '14px',
                  fontWeight: 'bold'
                }}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                </div>
                
                {/* Player Name */}
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  overflow: 'hidden',
                  minWidth: 0
                }}>
                  <span style={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: isCurrentUser ? '#FFD700' : isPrizePosition ? '#FFF' : 'rgba(255, 255, 255, 0.9)',
                    fontWeight: isCurrentUser || isPrizePosition ? 'bold' : '500'
                  }}>
                    {entry.username}
                  </span>
                  {/* Prize Badge - Next to name */}
                  {isPrizePosition && (
                    <span style={{
                      background: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32',
                      color: '#000',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {rank === 1 ? '1ST PLACE' : rank === 2 ? '2ND PLACE' : '3RD PLACE'}
                    </span>
                  )}
                  {isCurrentUser && !isPrizePosition && (
                    <span style={{
                      fontSize: '9px',
                      background: 'rgba(255, 215, 0, 0.4)',
                      padding: '2px 5px',
                      borderRadius: '3px',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      YOU
                    </span>
                  )}
                </div>
                
                {/* Tournament Points */}
                <div style={{ 
                  textAlign: 'center', 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  color: isPrizePosition ? '#FFD700' : '#4AE54A'
                }}>
                  {entry.tournamentPoints.toLocaleString()}
                </div>
                
                {/* Stats */}
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {level}
                </div>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  ${balance.toLocaleString()}
                </div>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  ${biggestWin.toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User's position if not visible */}
      {user && userRank > 50 && (
        <div style={{
          marginTop: '8px',
          padding: '12px',
          background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.1))',
          borderRadius: '8px',
          border: '2px solid rgba(255, 215, 0, 0.4)',
          fontSize: '13px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Your Current Rank: #{userRank}
        </div>
      )}

      {/* Footer Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: '16px',
        justifyContent: 'center'
      }}>
        <button
          onClick={loadLeaderboard}
          disabled={loading}
          style={{
            padding: '10px 28px',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.9), rgba(67, 160, 71, 0.9))',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            opacity: loading ? 0.5 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
          }}
        >
          🔄 Refresh
        </button>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '10px 28px',
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.9), rgba(229, 57, 53, 0.9))',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)';
            }}
          >
            ✕ Close
          </button>
        )}
      </div>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}