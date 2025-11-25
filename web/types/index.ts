/**
 * Web types - imported from @mma/shared
 */

// Re-export shared types
export {
  type ExternalURL as URL,
  type Division,
  type Athlete,
  type Promotion,
  type RankedFighter as Fighter,
  type Champion,
  type MatchFighter,
  type MatchResult,
  type MatchDisplay as Match,
  type FightCategory,
  type EventDisplay as EventData,
  type TournamentData,
  type EventsDataMap as EventsData,
  type Timestamp,
  matchToDisplay,
  displayToMatch,
  computeRecord,
  parseRecord,
} from '@mma/shared';
