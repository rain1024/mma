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

export interface Athlete {
  id: number;
  name: string;
  record: string;
  nickname: string;
  division: string;
  country: string;
  flag: string;
  gender?: string;
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
  status: string;
  fights: FightCategory[];
}

export interface EventsData {
  [key: string]: EventData;
}
