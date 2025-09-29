import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Database types
export interface Player {
  id: string;
  username: string;
  pin_hash: string;
  balance: number;
  level: number;
  experience: number;
  total_spins: number;
  total_wins: number;
  biggest_win: number;
  achievements: string[];
  created_at: string;
  updated_at: string;
  last_seen: string;
}

export interface LeaderboardEntry {
  username: string;
  level: number;
  balance: number;
  biggest_win: number;
  total_spins: number;
}

// Simple hash function for PINs (client-side)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'lightning_slots_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple custom auth functions with PIN protection
export const authService = {
  async signUp(username: string, pin: string) {
    try {
      console.log('Creating player with username:', username);
      
      // Validate PIN format
      if (!/^\d{4}$/.test(pin)) {
        throw new Error('PIN must be exactly 4 digits');
      }
      
      // Check if username exists
      const { data: existing } = await supabase
        .from('players')
        .select('username')
        .eq('username', username)
        .single();
      
      if (existing) {
        throw new Error('Username already taken');
      }
      
      // Hash the PIN
      const pinHash = await hashPin(pin);
      
      // Create new player
      const { data, error } = await supabase
        .from('players')
        .insert({
          username,
          pin_hash: pinHash,
          balance: 1000,
          level: 1,
          experience: 0,
          total_spins: 0,
          total_wins: 0,
          biggest_win: 0,
          achievements: [],
        })
        .select()
        .single();

      if (error) {
        console.error('Player creation error:', error);
        throw new Error(error.message);
      }

      console.log('Player created successfully:', data);
      return { user: data };
    } catch (error) {
      console.error('Custom signup error:', error);
      throw error;
    }
  },

  async signIn(username: string, pin: string) {
    try {
      console.log('Looking for player:', username);
      
      // Validate PIN format
      if (!/^\d{4}$/.test(pin)) {
        throw new Error('PIN must be exactly 4 digits');
      }
      
      // Find existing player
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        throw new Error('Username not found');
      }

      // Verify PIN
      const pinHash = await hashPin(pin);
      if (pinHash !== data.pin_hash) {
        throw new Error('Incorrect PIN');
      }

      // Update last seen
      await supabase
        .from('players')
        .update({ last_seen: new Date().toISOString() })
        .eq('username', username);

      console.log('Player found and authenticated:', data.username);
      return { user: data };
    } catch (error) {
      console.error('Custom signin error:', error);
      throw error;
    }
  },

  async signOut() {
    // Just clear local storage
    localStorage.removeItem('current_player');
    return Promise.resolve();
  },

  async getCurrentUser() {
    // Check localStorage for current player
    const stored = localStorage.getItem('current_player');
    return stored ? JSON.parse(stored) : null;
  },
};

// Progress functions
export const progressService = {
  async saveProgress(playerId: string, progress: Partial<Player>) {
    const { error } = await supabase
      .from('players')
      .update({
        ...progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', playerId);

    if (error) throw error;
  },

  async loadProgress(playerId: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getLeaderboard(type: 'level' | 'balance' | 'biggest_win' = 'level', limit = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('players')
      .select('username, balance, level, biggest_win, total_spins')
      .order(type, { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getUserRank(username: string, type: 'level' | 'balance' | 'biggest_win' = 'level'): Promise<number> {
    const { data, error } = await supabase.rpc('get_player_rank', {
      target_username: username,
      rank_type: type,
    });

    if (error) throw error;
    return data || 0;
  },
};