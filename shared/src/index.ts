/**
 * Shared types for MMA application
 * Used by both service (backend) and web (frontend)
 */

// ============================================
// Common Types
// ============================================

export interface ExternalURL {
  link: string;
  type: 'website' | 'youtube' | 'other' | 'tapology';
}

export interface Division {
  value: string;
  label: string;
}

// ============================================
// Database Entity Types (used by service)
// ============================================

/**
 * Base Athlete type - matches database schema
 * id is optional for CREATE operations
 */
export interface AthleteBase {
  id?: number;
  name: string;
  tournament: string;
  division?: string;
  country?: string;
  flag?: string;
  gender?: 'male' | 'female';
  wins?: number;
  losses?: number;
  draws?: number;
  record?: string; // Computed: "W-L-D"
  nickname?: string;
  image_url?: string;
  alternativeNames?: string[];
  urls?: ExternalURL[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Athlete with required id (after fetch from DB)
 */
export interface Athlete extends AthleteBase {
  id: number;
}

/**
 * Athlete input for CREATE (no id)
 */
export type AthleteInput = Omit<AthleteBase, 'id' | 'created_at' | 'updated_at'>;

/**
 * Base Event type - matches database schema
 */
export interface EventBase {
  id: string;
  promotion_id: string;
  name: string;
  date?: string;
  location?: string;
  venue?: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface Event extends EventBase {}

export type EventInput = Omit<EventBase, 'created_at' | 'updated_at'>;

/**
 * Base Match type - flat structure matching database schema
 */
export interface MatchBase {
  id?: number;
  event_id: string;
  category?: string;
  round_title?: string;
  fighter1_id?: number;
  fighter1_name: string;
  fighter1_country?: string;
  fighter1_flag?: string;
  fighter1_stats?: string;
  fighter2_id?: number;
  fighter2_name: string;
  fighter2_country?: string;
  fighter2_flag?: string;
  fighter2_stats?: string;
  weight_class?: string;
  winner?: 1 | 2 | null; // 1 = fighter1, 2 = fighter2, null = draw/NC
  method?: string;
  technique?: string;
  time?: string;
  result_round?: string;
  round?: number; // Legacy field for backward compatibility
  video?: string;
}

export interface Match extends MatchBase {
  id: number;
}

export type MatchInput = Omit<MatchBase, 'id'>;

/**
 * Ranking type - matches database schema
 */
export interface Ranking {
  id?: number;
  tournament: string;
  division: string;
  rank: number;
  athlete_id?: number;
  athlete_name: string;
  is_champion?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type RankingInput = Omit<Ranking, 'id' | 'created_at' | 'updated_at'>;

/**
 * P4P Ranking type - matches database schema
 */
export interface P4PRanking {
  id?: number;
  tournament: string;
  rank: number;
  athlete_id?: number;
  athlete_name: string;
  created_at?: string;
  updated_at?: string;
}

export type P4PRankingInput = Omit<P4PRanking, 'id' | 'created_at' | 'updated_at'>;

/**
 * Promotion type - matches database schema
 */
export interface Promotion {
  id: string;
  name: string;
  subtitle: string;
  theme: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export type PromotionInput = Omit<Promotion, 'created_at' | 'updated_at'>;

// ============================================
// UI/Display Types (used primarily by web)
// ============================================

/**
 * Fighter display in rankings
 */
export interface RankedFighter {
  rank: number;
  name: string;
  record: string;
  move?: string; // Position change indicator
}

/**
 * Champion display
 */
export interface Champion {
  name: string;
  record: string;
  nickname?: string;
}

/**
 * Fighter in a match (UI display)
 */
export interface MatchFighter {
  id?: number;
  name: string;
  country?: string;
  flag?: string;
  stats?: string;
  winner: boolean;
}

/**
 * Match result details
 */
export interface MatchResult {
  method: string;
  technique?: string;
  time: string;
  round: string;
  totalTime?: string;
}

/**
 * Match for UI display (transformed from MatchBase)
 */
export interface MatchDisplay {
  id?: number;
  event_id: string;
  category?: string;
  round_title?: string;
  round?: string; // Legacy alias for round_title
  weight_class?: string;
  fighter1: MatchFighter;
  fighter2: MatchFighter;
  result?: MatchResult;
  video?: string;
}

/**
 * Fight category grouping
 */
export interface FightCategory {
  category: string;
  matches: MatchDisplay[];
}

/**
 * Event for UI display (with fights grouped)
 */
export interface EventDisplay {
  id: string;
  promotion_id?: string;
  logo?: string;
  title: string;
  name?: string;
  date: string;
  location: string;
  venue?: string;
  status: string;
  fights?: FightCategory[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Tournament data for UI
 */
export interface TournamentData {
  name: string;
  subtitle: string;
  divisions: Division[];
  athletes?: Athlete[];
  pfpRankings: RankedFighter[];
  champion: Champion;
  rankings: RankedFighter[];
}

/**
 * Events data map by event ID
 */
export interface EventsDataMap {
  [eventId: string]: EventDisplay;
}

/**
 * Video timestamp marker
 */
export interface Timestamp {
  time: number; // Time in seconds
  label: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Convert database match to display format
 */
export function matchToDisplay(match: MatchBase): MatchDisplay {
  return {
    id: match.id,
    event_id: match.event_id,
    category: match.category,
    round_title: match.round_title,
    weight_class: match.weight_class,
    fighter1: {
      id: match.fighter1_id,
      name: match.fighter1_name,
      country: match.fighter1_country,
      flag: match.fighter1_flag,
      stats: match.fighter1_stats,
      winner: match.winner === 1,
    },
    fighter2: {
      id: match.fighter2_id,
      name: match.fighter2_name,
      country: match.fighter2_country,
      flag: match.fighter2_flag,
      stats: match.fighter2_stats,
      winner: match.winner === 2,
    },
    result: match.method ? {
      method: match.method,
      technique: match.technique,
      time: match.time || '',
      round: match.result_round || '',
    } : undefined,
    video: match.video,
  };
}

/**
 * Convert display match back to database format
 */
export function displayToMatch(display: MatchDisplay): MatchBase {
  return {
    id: display.id,
    event_id: display.event_id,
    category: display.category,
    round_title: display.round_title,
    weight_class: display.weight_class,
    fighter1_id: display.fighter1.id,
    fighter1_name: display.fighter1.name,
    fighter1_country: display.fighter1.country,
    fighter1_flag: display.fighter1.flag,
    fighter1_stats: display.fighter1.stats,
    fighter2_id: display.fighter2.id,
    fighter2_name: display.fighter2.name,
    fighter2_country: display.fighter2.country,
    fighter2_flag: display.fighter2.flag,
    fighter2_stats: display.fighter2.stats,
    winner: display.fighter1.winner ? 1 : display.fighter2.winner ? 2 : null,
    method: display.result?.method,
    technique: display.result?.technique,
    time: display.result?.time,
    result_round: display.result?.round,
    video: display.video,
  };
}

/**
 * Compute record string from wins/losses/draws
 */
export function computeRecord(wins: number = 0, losses: number = 0, draws: number = 0): string {
  return `${wins}-${losses}-${draws}`;
}

/**
 * Parse record string to wins/losses/draws
 */
export function parseRecord(record: string): { wins: number; losses: number; draws: number } {
  const parts = record.split('-').map(Number);
  return {
    wins: parts[0] || 0,
    losses: parts[1] || 0,
    draws: parts[2] || 0,
  };
}
