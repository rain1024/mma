// ==================== TYPE DEFINITIONS ====================

export interface URL {
  link: string;
  type: 'website' | 'youtube' | 'other' | 'tapology';
}

export interface Athlete {
  id: number;
  name: string;
  record: string;
  nickname: string;
  division: string;
  country: string;
  flag: string;
  gender: 'male' | 'female';
  urls?: URL[];
  alternativeNames?: string[]; // Alternative names in different languages/countries
}

export interface Division {
  value: string;
  label: string;
}

export interface TournamentData {
  name: string;
  subtitle: string;
  divisions: Division[];
  athletes: Athlete[];
}

export interface TournamentMetadata {
  name: string;
  subtitle: string;
  divisions: Division[];
}

export interface SearchCriteria {
  name?: string;
  division?: string;
  country?: string;
  gender?: 'male' | 'female';
  nickname?: string;
}

export interface AthleteStats {
  total: number;
  byGender: {
    male: number;
    female: number;
  };
  byDivision: Record<string, number>;
  byCountry: Record<string, number>;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
}

export interface CreateAthleteData {
  name: string;
  record: string;
  nickname?: string;
  division: string;
  country: string;
  flag: string;
  gender: 'male' | 'female';
  alternativeNames?: string[]; // Alternative names in different languages/countries
}

export type Tournament = 'ufc' | 'lion';

// ==================== EVENT TYPES ====================

export interface PromotionLink {
  url: string;
  text: string;
}

export interface MatchFighter {
  name: string;
  stats: string;
  flag: string;
  winner: boolean;
  urls?: URL[];
}

export interface Match {
  round: string;
  fighter1: MatchFighter;
  fighter2: MatchFighter;
  video?: string;
}

export interface FightCategory {
  category: string;
  matches: Match[];
}

export interface EventData {
  id: string;
  logo: string;
  title: string;
  date: string;
  location: string;
  status: 'upcoming' | 'completed' | 'live';
  fights: FightCategory[];
  promotionLinks?: PromotionLink[];
}

export interface EventsList {
  events: string[];
}

export interface EventSearchCriteria {
  status?: 'upcoming' | 'completed' | 'live';
  location?: string;
  titleContains?: string;
}

export interface CreateEventData {
  id: string;
  logo: string;
  title: string;
  date: string;
  location: string;
  status: 'upcoming' | 'completed' | 'live';
  fights?: FightCategory[];
}

// ==================== PROMOTION TYPES ====================

export interface PromotionMetadata {
  id: Tournament;
  name: string;
  subtitle: string;
  theme: string;
  color: string;
  urls?: URL[];
}

export interface PromotionStats {
  totalAthletes: number;
  totalEvents: number;
  divisions: string[];
}
