export interface Fighter {
  rank: number;
  name: string;
  record: string;
  move: string;
}

export interface Champion {
  name: string;
  record: string;
  nickname: string;
}

export interface Division {
  value: string;
  label: string;
}

export interface URL {
  link: string;
  type: 'website' | 'youtube' | 'other' | 'tapology';
}

export interface Athlete {
  id: number;
  name: string;
  record?: string; // String format: "18-2-0" (for JSON compatibility)
  wins?: number; // Individual fields from database
  losses?: number;
  draws?: number;
  nickname?: string;
  division: string;
  country: string;
  flag: string;
  gender?: string;
  image_url?: string;
  alternativeNames?: string[]; // Alternative names in different languages/countries
  urls?: URL[]; // External links (Tapology, Sherdog, etc.)
  created_at?: string;
  updated_at?: string;
}

export interface TournamentData {
  name: string;
  subtitle: string;
  divisions: Division[];
  athletes?: Athlete[];
  pfpRankings: Fighter[];
  champion: Champion;
  rankings: Fighter[];
}

export interface MatchFighter {
  name: string;
  stats: string;
  flag: string;
  winner: boolean;
}

export interface MatchResult {
  method: string;
  technique?: string;
  time: string;
  round: string;
  totalTime: string;
}

export interface Match {
  round: string;
  fighter1: MatchFighter;
  fighter2: MatchFighter;
  video?: string;
  result?: MatchResult;
}

export interface FightCategory {
  category: string;
  matches: Match[];
}

export interface EventData {
  id: string;
  promotion_id?: string;
  logo?: string;
  title: string;
  name?: string; // Alias for title (database compatibility)
  date: string;
  location: string;
  venue?: string;
  status: string;
  fights?: FightCategory[];
  created_at?: string;
  updated_at?: string;
}

export interface Promotion {
  id: string;
  name: string;
  subtitle: string;
  theme: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventsData {
  [key: string]: EventData;
}

export interface Timestamp {
  time: number; // Time in seconds
  label: string; // Description of what happens at this timestamp
}
