export interface Athlete {
  id?: number;
  name: string;
  tournament: string;
  division?: string;
  country?: string;
  flag?: string;
  gender?: string;
  wins?: number;
  losses?: number;
  draws?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  tournament: string;
  name: string;
  date?: string;
  location?: string;
  venue?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Match {
  id?: number;
  event_id: string;
  category?: string;
  fighter1_id?: number;
  fighter1_name: string;
  fighter1_country?: string;
  fighter1_flag?: string;
  fighter2_id?: number;
  fighter2_name: string;
  fighter2_country?: string;
  fighter2_flag?: string;
  weight_class?: string;
  winner?: number;
  method?: string;
  round?: number;
  time?: string;
}

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

export interface P4PRanking {
  id?: number;
  tournament: string;
  rank: number;
  athlete_id?: number;
  athlete_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Promotion {
  id: string;
  name: string;
  subtitle: string;
  theme: string;
  color: string;
  events: string[];
}
