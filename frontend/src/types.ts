export type Phase = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final';

export interface User {
  id: number;
  username: string;
  teamPick: string | null;
  createdAt: string;
  isAdmin: boolean;
  phone: string | null;
  forceReset: boolean;
}

export interface Game {
  id: number;
  phase: Phase;
  group_name: string | null;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string;
  home_score: number | null;
  away_score: number | null;
  status: 'scheduled' | 'live' | 'finished';
}

export interface Bet {
  id: number;
  user_id: number;
  game_id: number;
  home_score: number;
  away_score: number;
  placed_at: string;
  // joined fields
  phase?: Phase;
  group_name?: string | null;
  home_team?: string;
  away_team?: string;
  match_date?: string;
  venue?: string;
  actual_home?: number | null;
  actual_away?: number | null;
  status?: string;
}

export interface StandingEntry {
  rank: number;
  userId: number;
  username: string;
  teamPick: string | null;
  totalPoints: number;
  betPoints: number;
  teamPickBonus: number;
  gamesBet: number;
  gamesWithPoints: number;
}

export interface TeamStats {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  group?: string;
}

export interface GameWithBet extends Game {
  bet_home: number | null;
  bet_away: number | null;
  points: number | null;
}

export interface GamePrediction {
  username: string;
  home_score: number;
  away_score: number;
}

export interface AuthResponse {
  token: string;
  username: string;
  userId: number;
}
