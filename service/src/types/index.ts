/**
 * Service types - imported from @mma/shared
 */

// Re-export all shared types
export {
  type ExternalURL as URL,
  type Division,
  type AthleteBase as Athlete,
  type AthleteInput,
  type EventBase as Event,
  type EventInput,
  type MatchBase as Match,
  type MatchInput,
  type Ranking,
  type RankingInput,
  type P4PRanking,
  type P4PRankingInput,
  type Promotion,
  type PromotionInput,
  computeRecord,
  parseRecord,
} from '@mma/shared';

// Service-specific types

export interface AthleteFilters {
  tournament?: string;
  division?: string;
  gender?: string;
  search?: string;
}

export interface EventFilters {
  promotion_id?: string;
  status?: string;
}

export interface RankingFilters {
  tournament?: string;
  division?: string;
}
