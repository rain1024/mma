// Type definitions for Tapology event scraping
// Shared types are imported from db/types.ts

export interface CountryToFlag {
  [key: string]: string;
}

// Raw scraped fighter data (intermediate format)
export interface FighterData {
  name: string;
  url: string;
  country: string;
  record: string;
  weight: string;
  gender: string;
  winner: boolean;
}

// Raw scraped match data (intermediate format)
export interface MatchData {
  round: string;
  fighter1: FighterData;
  fighter2: FighterData;
}

// Raw scraped event data (intermediate format from page.evaluate)
export interface ScrapedEventData {
  fights: Array<{
    category: string;
    matches: MatchData[];
  }>;
  title: string;
  date?: string;
  location?: string;
  promotionLinks: Array<{ url: string; text: string }>;
}

// Output format for scraped event JSON file (includes extra metadata)
export interface ScrapedEventOutput {
  id: string;
  eventId: string;
  url: string;
  logo: string;
  title: string;
  date?: string;
  location?: string;
  status: string;
  promotionLinks: Array<{ url: string; text: string }>;
  fights: Array<{
    category: string;
    matches: Array<{
      round: string;
      fighter1: {
        name: string;
        link: string;
        stats: string;
        flag: string;
        winner: boolean;
      };
      fighter2: {
        name: string;
        link: string;
        stats: string;
        flag: string;
        winner: boolean;
      };
    }>;
  }>;
}
