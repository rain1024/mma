# @mma/shared

Shared TypeScript types package for the MMA application.

## Overview

This package contains the **single source of truth** for all types used across the service (backend) and web (frontend) layers. It eliminates type duplication and ensures type consistency throughout the application.

## Installation

This package is installed via local file reference in the monorepo:

```json
{
  "dependencies": {
    "@mma/shared": "file:../shared"
  }
}
```

## Usage

### Service (Backend)

```typescript
// service/src/types/index.ts
export {
  type Athlete,
  type Match,
  type Event,
  // ... other types
} from '@mma/shared';
```

### Web (Frontend)

```typescript
// web/types/index.ts
export {
  type Athlete,
  type MatchDisplay as Match,
  type EventDisplay as EventData,
  // ... other types
} from '@mma/shared';
```

## Type Categories

### Database Entity Types

These types match the SQLite database schema:

- `AthleteBase` - Athlete with optional `id` (for CREATE operations)
- `Athlete` - Athlete with required `id` (after DB fetch)
- `EventBase` - Event entity
- `MatchBase` - Match entity (flat structure)
- `Ranking` - Division ranking
- `P4PRanking` - Pound-for-pound ranking
- `Promotion` - Promotion/tournament entity

### UI/Display Types

These types are used for frontend rendering:

- `MatchDisplay` - Match with nested `fighter1`/`fighter2` objects
- `EventDisplay` - Event with fights grouped by category
- `RankedFighter` - Fighter in rankings display
- `Champion` - Champion display
- `TournamentData` - Complete tournament data structure

### Utility Types

- `ExternalURL` - External links (Tapology, Sherdog, etc.)
- `Division` - Weight division
- `Timestamp` - Video timestamp marker
- `ApiResponse<T>` - Generic API response wrapper

## Utility Functions

### `computeRecord(wins, losses, draws): string`

Computes record string from individual stats:

```typescript
computeRecord(18, 2, 0); // Returns "18-2-0"
```

### `parseRecord(record): { wins, losses, draws }`

Parses record string into individual stats:

```typescript
parseRecord("18-2-0"); // Returns { wins: 18, losses: 2, draws: 0 }
```

### `matchToDisplay(match: MatchBase): MatchDisplay`

Converts flat database match to nested UI structure:

```typescript
const dbMatch: MatchBase = {
  id: 1,
  event_id: "lc27",
  fighter1_name: "Fighter A",
  fighter2_name: "Fighter B",
  winner: 1,
  // ...
};

const uiMatch = matchToDisplay(dbMatch);
// Returns: { fighter1: { name: "Fighter A", winner: true }, ... }
```

### `displayToMatch(display: MatchDisplay): MatchBase`

Converts nested UI match back to flat database structure.

## Type Differences: Service vs Web

| Field | Service (MatchBase) | Web (MatchDisplay) |
|-------|---------------------|-------------------|
| Structure | Flat | Nested |
| Fighter data | `fighter1_name`, `fighter1_country`, etc. | `fighter1: MatchFighter` object |
| `id` | Optional (for CREATE) | Optional |
| `round` | `round?: number` (legacy) | `round?: string` (alias) |

## Development

### Build

```bash
yarn build
```

This compiles TypeScript to `dist/` with type declarations.

### Watch Mode

```bash
yarn watch
```

Auto-rebuilds on file changes.

## Version History

### 1.0.0 (2025-11-25)
- Initial release
- Unified types from service and web
- Added utility functions
- Added transformation functions (`matchToDisplay`, `displayToMatch`)

## License

ISC
