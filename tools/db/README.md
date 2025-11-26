# MMA Database API

This module provides CRUD operations for managing MMA data across different promotions (UFC and Lion Championship). It includes three main modules:

- **athletes.ts** - Manage fighter/athlete data
- **events.ts** - Manage event and fight card data
- **promotions.ts** - Manage promotion metadata and statistics

**Written in TypeScript** with full type definitions and compile-time safety.

## Installation

```bash
cd scripts/db
yarn install
yarn build
```

## Usage

### As a Node.js Module

```typescript
import * as athletes from './scripts/db/athletes';
// or
import { getAllAthletes, createAthlete } from './scripts/db/athletes';
```

### As a CLI Tool

```bash
# From the project root:
node scripts/db/dist/athletes.js <command> [options]

# Or using yarn scripts from scripts/db:
yarn cli <command> [options]

# Quick examples:
node scripts/db/dist/athletes.js list lion
node scripts/db/dist/athletes.js get lion 1
node scripts/db/dist/athletes.js search lion '{"division":"lightweight"}'
node scripts/db/dist/athletes.js help
```

## Tournament Names

- `'ufc'` - UFC tournament data
- `'lion'` - Lion Championship tournament data

---

# Quick Start Guide

## Common Use Cases

### 1. View All Fighters

```typescript
import * as athletes from './scripts/db/athletes';

// Get all UFC fighters
const ufcFighters = athletes.getAllAthletes('ufc');
console.log(`UFC has ${ufcFighters.length} fighters`);

// Get all Lion Championship fighters
const lionFighters = athletes.getAllAthletes('lion');
console.log(`Lion has ${lionFighters.length} fighters`);
```

### 2. Find a Specific Fighter

```typescript
// By ID
const fighter = athletes.getAthleteById('lion', 1);
console.log(fighter?.name); // "Kouzi"

// By name
const results = athletes.searchAthletes('lion', { name: 'Kouzi' });
console.log(results[0].nickname); // "The Lion King"
```

### 3. Filter Fighters

```typescript
// Get all lightweights
const lightweights = athletes.getAthletesByDivision('lion', 'lightweight');

// Get all Vietnamese fighters
const vietnamese = athletes.getAthletesByCountry('lion', 'Vietnam');

// Get all female fighters
const females = athletes.searchAthletes('lion', { gender: 'female' });

// Combine filters
const vietnameseLightweights = athletes.searchAthletes('lion', {
  division: 'lightweight',
  country: 'Vietnam'
});
```

### 4. Add a New Fighter

```typescript
const newFighter = athletes.createAthlete('lion', {
  name: 'John Smith',
  record: '10-5-0',
  nickname: 'The Hammer',
  division: 'welterweight',
  country: 'USA',
  flag: '🇺🇸',
  gender: 'male'
});

console.log(`Created fighter with ID: ${newFighter.id}`);
```

### 5. Update Fighter Information

```typescript
// Update any fields
athletes.updateAthlete('lion', 1, {
  nickname: 'The King',
  record: '20-2-0'
});

// Just update the record
athletes.updateAthleteRecord('lion', 1, '19-2-0');
```

### 6. Update Fight Record After a Match

```typescript
// Fighter wins
athletes.incrementWins('lion', 1);
// Record changes from "18-2-0" to "19-2-0"

// Fighter loses
athletes.incrementLosses('lion', 1);
// Record changes from "19-2-0" to "19-3-0"
```

### 7. Remove a Fighter

```typescript
const deleted = athletes.deleteAthlete('lion', 155);
console.log(`Removed ${deleted.name}`);
```

### 8. Get Statistics

```typescript
const stats = athletes.getAthleteStats('lion');

console.log(`Total fighters: ${stats.total}`);
console.log(`Male: ${stats.byGender.male}`);
console.log(`Female: ${stats.byGender.female}`);
console.log(`Total wins: ${stats.totalWins}`);

// Fighters by division
console.log('Fighters per division:');
Object.entries(stats.byDivision).forEach(([div, count]) => {
  console.log(`  ${div}: ${count}`);
});

// Fighters by country
console.log('Fighters per country:');
Object.entries(stats.byCountry).forEach(([country, count]) => {
  console.log(`  ${country}: ${count}`);
});
```

## Complete Example Script

```typescript
import * as athletes from './scripts/db/athletes';

// Add a new fighter after a match
const newFighter = athletes.createAthlete('lion', {
  name: 'Mike Johnson',
  record: '0-1-0',  // Just lost their first fight
  nickname: '',
  division: 'lightweight',
  country: 'USA',
  flag: '🇺🇸',
  gender: 'male'
});

console.log(`Added ${newFighter.name} with ID ${newFighter.id}`);

// Later, they win a fight
const updated = athletes.incrementWins('lion', newFighter.id);
console.log(`${updated.name} is now ${updated.record}`);

// Search for all American lightweights
const americanLightweights = athletes.searchAthletes('lion', {
  division: 'lightweight',
  country: 'USA'
});

console.log(`Found ${americanLightweights.length} American lightweight fighters`);
```

---

# CLI Commands Reference

## Read Operations

### List All Athletes
```bash
node dist/athletes.js list <tournament>
node dist/athletes.js list lion
```

### Get Athlete by ID
```bash
node dist/athletes.js get <tournament> <id>
node dist/athletes.js get lion 1
```

### Get Tournament Metadata
```bash
node dist/athletes.js meta <tournament>
node dist/athletes.js meta ufc
```

## Search Operations

### Search with JSON Criteria
```bash
node dist/athletes.js search <tournament> '<json>'
node dist/athletes.js search lion '{"division":"lightweight","country":"Vietnam"}'
node dist/athletes.js search ufc '{"name":"Islam"}'
```

### Get Athletes by Division
```bash
node dist/athletes.js division <tournament> <division>
node dist/athletes.js division lion lightweight
```

### Get Athletes by Country
```bash
node dist/athletes.js country <tournament> <country>
node dist/athletes.js country lion Vietnam
```

## Create Operations

### Create New Athlete
```bash
node dist/athletes.js create <tournament> '<json>'
node dist/athletes.js create lion '{"name":"John Doe","record":"5-2-0","nickname":"The Beast","division":"welterweight","country":"USA","flag":"🇺🇸","gender":"male"}'
```

Required fields: `name`, `record`, `division`, `country`, `flag`, `gender`
Optional fields: `nickname`

## Update Operations

### Update Athlete Data
```bash
node dist/athletes.js update <tournament> <id> '<json>'
node dist/athletes.js update lion 1 '{"nickname":"The King","record":"20-2-0"}'
```

### Update Fight Record
```bash
node dist/athletes.js record <tournament> <id> <record>
node dist/athletes.js record lion 1 19-2-0
```

### Increment Wins
```bash
node dist/athletes.js win <tournament> <id>
node dist/athletes.js win lion 1
```

### Increment Losses
```bash
node dist/athletes.js loss <tournament> <id>
node dist/athletes.js loss lion 1
```

## Delete Operations

### Delete Athlete
```bash
node dist/athletes.js delete <tournament> <id> --confirm
node dist/athletes.js delete lion 155 --confirm
```

**Note:** The `--confirm` flag is required to prevent accidental deletions.

## Utility Operations

### Get Statistics
```bash
node dist/athletes.js stats <tournament>
node dist/athletes.js stats lion
```

Shows total athletes, gender breakdown, division distribution, and country representation.

### Help
```bash
node dist/athletes.js help
```

---

# Module API Reference

### Read Operations

#### `getAllAthletes(tournament)`

Get all athletes from a tournament.

```typescript
const ufcAthletes = athletes.getAllAthletes('ufc');
const lionAthletes = athletes.getAllAthletes('lion');
```

**Returns:** `Array<Athlete>` - Array of all athletes

---

#### `getAthleteById(tournament, id)`

Get a specific athlete by their ID.

```typescript
const athlete = athletes.getAthleteById('lion', 1);
// Returns: { id: 1, name: "Kouzi", record: "18-2-0", ... }
```

**Parameters:**
- `tournament` (string) - Tournament name
- `id` (number) - Athlete ID

**Returns:** `Athlete | null` - The athlete object or null if not found

---

#### `getTournamentMetadata(tournament)`

Get tournament metadata (name, subtitle, divisions).

```typescript
const metadata = athletes.getTournamentMetadata('ufc');
// Returns: { name: "UFC", subtitle: "...", divisions: [...] }
```

**Returns:** `Object` - Tournament metadata

---

### Search Operations

#### `searchAthletes(tournament, criteria)`

Search athletes by various criteria.

```typescript
// Search by name
const results = athletes.searchAthletes('lion', { name: 'Kouzi' });

// Search by division
const lightweights = athletes.searchAthletes('lion', { division: 'lightweight' });

// Search by country
const vietnamese = athletes.searchAthletes('lion', { country: 'Vietnam' });

// Search by multiple criteria
const results = athletes.searchAthletes('lion', {
  division: 'lightweight',
  country: 'Vietnam',
  gender: 'male'
});
```

**Parameters:**
- `tournament` (string) - Tournament name
- `criteria` (object) - Search criteria:
  - `name` (string, optional) - Partial match, case-insensitive
  - `division` (string, optional) - Exact match
  - `country` (string, optional) - Exact match
  - `gender` (string, optional) - Exact match ('male' or 'female')
  - `nickname` (string, optional) - Partial match, case-insensitive

**Returns:** `Array<Athlete>` - Array of matching athletes

---

#### `getAthletesByDivision(tournament, division)`

Get all athletes in a specific division.

```typescript
const lightweights = athletes.getAthletesByDivision('lion', 'lightweight');
```

**Returns:** `Array<Athlete>`

---

#### `getAthletesByCountry(tournament, country)`

Get all athletes from a specific country.

```typescript
const vietnamese = athletes.getAthletesByCountry('lion', 'Vietnam');
```

**Returns:** `Array<Athlete>`

---

### Create Operations

#### `createAthlete(tournament, athleteData)`

Create a new athlete.

```typescript
const newAthlete = athletes.createAthlete('lion', {
  name: 'John Doe',
  record: '5-2-0',
  nickname: 'The Beast',
  division: 'welterweight',
  country: 'USA',
  flag: '🇺🇸',
  gender: 'male'
});
// Returns: { id: 155, name: "John Doe", ... }
```

**Parameters:**
- `tournament` (string) - Tournament name
- `athleteData` (object) - Athlete data:
  - `name` (string, required) - Athlete name
  - `record` (string, required) - Fight record (e.g., "10-2-0")
  - `nickname` (string, optional) - Nickname (use empty string if none)
  - `division` (string, required) - Weight division
  - `country` (string, required) - Country name
  - `flag` (string, required) - Country flag emoji
  - `gender` (string, required) - 'male' or 'female'

**Returns:** `Athlete` - The created athlete with assigned ID

**Note:** ID is auto-generated (max existing ID + 1)

---

### Update Operations

#### `updateAthlete(tournament, id, updates)`

Update an existing athlete.

```typescript
const updated = athletes.updateAthlete('lion', 1, {
  nickname: 'The Lion King',
  record: '20-2-0'
});
```

**Parameters:**
- `tournament` (string) - Tournament name
- `id` (number) - Athlete ID
- `updates` (object) - Fields to update (partial athlete object)

**Returns:** `Athlete` - The updated athlete

**Note:** ID cannot be changed

---

#### `updateAthleteRecord(tournament, id, newRecord)`

Update an athlete's fight record.

```typescript
const updated = athletes.updateAthleteRecord('lion', 1, '19-2-0');
```

**Returns:** `Athlete` - The updated athlete

---

#### `incrementWins(tournament, id)`

Increment an athlete's win count.

```typescript
// Athlete has record "18-2-0"
const updated = athletes.incrementWins('lion', 1);
// Now has record "19-2-0"
```

**Returns:** `Athlete` - The updated athlete

---

#### `incrementLosses(tournament, id)`

Increment an athlete's loss count.

```typescript
// Athlete has record "18-2-0"
const updated = athletes.incrementLosses('lion', 1);
// Now has record "18-3-0"
```

**Returns:** `Athlete` - The updated athlete

---

### Delete Operations

#### `deleteAthlete(tournament, id)`

Delete an athlete by ID.

```typescript
const deleted = athletes.deleteAthlete('lion', 154);
// Returns the deleted athlete object
```

**Parameters:**
- `tournament` (string) - Tournament name
- `id` (number) - Athlete ID

**Returns:** `Athlete` - The deleted athlete

---

#### `deleteAllAthletes(tournament)`

Delete all athletes from a tournament. **Use with caution!**

```typescript
const count = athletes.deleteAllAthletes('lion');
console.log(`Deleted ${count} athletes`);
```

**Returns:** `number` - Number of athletes deleted

---

### Utility Operations

#### `getAthleteStats(tournament)`

Get statistics about athletes in a tournament.

```typescript
const stats = athletes.getAthleteStats('lion');
console.log(stats);
```

**Returns:** `Object` - Statistics object:
```typescript
{
  total: 154,
  byGender: {
    male: 140,
    female: 14
  },
  byDivision: {
    'lightweight': 8,
    'welterweight': 25,
    // ...
  },
  byCountry: {
    'Vietnam': 130,
    'Japan': 4,
    // ...
  },
  totalWins: 450,
  totalLosses: 450,
  totalDraws: 0
}
```

---

## Data Structure

### Athlete Object

```typescript
{
  id: 1,
  name: "Kouzi",
  record: "18-2-0",
  nickname: "The Lion King",
  division: "lightweight",
  country: "Vietnam",
  flag: "🇻🇳",
  gender: "male",
  urls: [
    { link: "https://example.com/kouzi", type: "website" },
    { link: "https://youtube.com/@kouzi", type: "youtube" },
    { link: "https://tapology.com/kouzi", type: "tapology" }
  ]
}
```

**Note:** The `urls` field is optional and can contain zero or more URL objects.

### File Structure

```typescript
{
  name: "LION CHAMPIONSHIP",
  subtitle: "Official Lion Championship Fighter Rankings",
  divisions: [
    { value: "pfp", label: "Pound-for-Pound" },
    { value: "heavyweight", label: "Heavyweight" },
    // ...
  ],
  athletes: [
    // Array of athlete objects
  ]
}
```

## Error Handling

All functions throw errors for invalid inputs:

```typescript
try {
  const athlete = athletes.createAthlete('lion', {
    name: 'Test Fighter'
    // Missing required fields
  });
} catch (error) {
  console.error(error.message);
  // "Missing required field: record"
}
```

## Testing and Examples

Run the test suite to see comprehensive examples:
```bash
cd scripts/db
yarn test
```

Use the CLI for interactive testing:
```bash
cd scripts/db
node dist/athletes.js help
# or
yarn cli help
```

## TypeScript Types

The module exports comprehensive TypeScript types. You can import them from either the `types` module or the main `athletes` module:

```typescript
// Import from types module (recommended)
import type {
  Athlete,
  Tournament,
  SearchCriteria,
  CreateAthleteData,
  AthleteStats,
  TournamentMetadata,
  TournamentData,
  URL
} from './scripts/db/types';

// Or import from athletes module (backward compatible)
import type {
  Athlete,
  Tournament,
  SearchCriteria,
  CreateAthleteData,
  AthleteStats,
  TournamentMetadata,
  TournamentData,
  URL
} from './scripts/db/athletes';

// Use types in your code
const search: SearchCriteria = {
  division: 'lightweight',
  gender: 'male'
};

const stats: AthleteStats = athletes.getAthleteStats('lion');

// Using URLs
const athleteUrls: URL[] = [
  { link: 'https://example.com/profile', type: 'website' },
  { link: 'https://youtube.com/@fighter', type: 'youtube' },
  { link: 'https://tapology.com/fighter', type: 'tapology' },
  { link: 'https://instagram.com/fighter', type: 'other' }
];
```

### URL Interface

```typescript
interface URL {
  link: string;
  type: 'website' | 'youtube' | 'tapology' | 'other';
}
```

The `URL` interface is used to store links for athletes, fighters, and promotions:
- **link** - The full URL string
- **type** - Type of the link:
  - `'website'` - Official website
  - `'youtube'` - YouTube channel or video
  - `'tapology'` - Tapology fighter profile
  - `'other'` - Social media, news articles, etc.

Athletes, MatchFighters, and PromotionMetadata all have an optional `urls` field that accepts an array of URL objects.

## Record Format

Fight records use the format: `"WINS-LOSSES-DRAWS"`

Examples:
- `"10-0-0"` - 10 wins, 0 losses, 0 draws (undefeated)
- `"18-2-0"` - 18 wins, 2 losses, 0 draws
- `"5-5-1"` - 5 wins, 5 losses, 1 draw

## Division Names

Valid division names:
- `pfp` - Pound-for-Pound
- `heavyweight`
- `light-heavyweight`
- `middleweight`
- `welterweight`
- `lightweight`
- `featherweight`
- `bantamweight`
- `flyweight`
- `strawweight`
- `women-bantamweight` (UFC only)
- `women-flyweight` (UFC only)
- `women-strawweight` (UFC only)

## Country Flags

Common country flag emojis:
- 🇻🇳 Vietnam
- 🇺🇸 USA
- 🇯🇵 Japan
- 🇧🇷 Brazil
- 🇷🇺 Russia
- 🇰🇭 Cambodia
- 🇹🇭 Thailand
- 🇨🇳 China
- 🇬🇧 UK
- 🇩🇪 Germany
- 🇮🇹 Italy
- 🇵🇭 Philippines

---

# Events Database API

The events module provides CRUD operations for managing event and fight card data across promotions.

## CLI Usage

```bash
# List all events
node dist/events.js list lion

# Get specific event
node dist/events.js get lion lc28

# Search events
node dist/events.js search lion '{"status":"completed"}'

# Get events by status
node dist/events.js status lion completed
node dist/events.js upcoming lion
node dist/events.js completed lion

# Create new event
node dist/events.js create lion '{"id":"lc29","logo":"LC29","title":"Lion Championship 29","date":"08:00 | 15.12.2024","location":"Vietnam","status":"upcoming"}'

# Update event
node dist/events.js update lion lc29 '{"status":"live"}'
node dist/events.js setstatus lion lc29 completed

# Delete event
node dist/events.js delete lion lc29 --confirm

# Get statistics
node dist/events.js stats lion

# Show help
node dist/events.js help
```

## Module Usage

```typescript
import * as events from './scripts/db/events';

// Read operations
const allEvents = events.getAllEvents('lion');
const eventIds = events.getAllEventIds('lion');
const event = events.getEventById('lion', 'lc28');

// Search operations
const completed = events.getCompletedEvents('lion');
const upcoming = events.getUpcomingEvents('lion');
const filtered = events.searchEvents('lion', {
  status: 'completed',
  location: 'Hanoi'
});

// Create operation
const newEvent = events.createEvent('lion', {
  id: 'lc29',
  logo: 'LC29',
  title: 'Lion Championship 29',
  date: '08:00 | 15.12.2024',
  location: 'Vietnam',
  status: 'upcoming'
});

// Update operations
const updated = events.updateEvent('lion', 'lc29', { status: 'live' });
const completed = events.updateEventStatus('lion', 'lc29', 'completed');

// Delete operation
const deleted = events.deleteEvent('lion', 'lc29');

// Statistics
const stats = events.getEventStats('lion');
// Returns: { total, byStatus, totalFights, byLocation }
```

## Event Data Structure

```typescript
{
  id: "lc28",
  logo: "LC28",
  title: "Lion Championship 28",
  date: "08:00 | 08.11.2024",
  location: "Quang Truong Corona Resort and Casino, Phú Quốc",
  status: "completed",
  fights: [
    {
      category: "MMA PRO",
      matches: [
        {
          round: "Trận 1",
          fighter1: {
            name: "Zhou Luo",
            stats: "150 lbs - Nam",
            flag: "🇨🇳",
            winner: true,
            urls: [
              { link: "https://example.com/zhou", type: "website" }
            ]
          },
          fighter2: {
            name: "The Anh Ha",
            stats: "150 lbs - Nam",
            flag: "🇻🇳",
            winner: false
          }
        }
      ]
    }
  ]
}
```

## Event Status Values

- `upcoming` - Event has not occurred yet
- `live` - Event is currently happening
- `completed` - Event has finished

---

# Promotions Database API

The promotions module manages promotion-level metadata and provides cross-promotion statistics.

## CLI Usage

```bash
# List all promotions
node dist/promotions.js list

# Get promotion metadata
node dist/promotions.js get lion

# Get promotion data path
node dist/promotions.js path ufc

# Get promotion statistics
node dist/promotions.js stats lion
node dist/promotions.js allstats

# Compare promotions
node dist/promotions.js compare

# Initialize promotion data structure
node dist/promotions.js init ufc

# Check if promotion data exists
node dist/promotions.js exists lion

# Show help
node dist/promotions.js help
```

## Module Usage

```typescript
import * as promotions from './scripts/db/promotions';

// Get all promotions
const allPromotions = promotions.getAllPromotions();
// Returns: ['ufc', 'lion']

// Get metadata
const metadata = promotions.getPromotionMetadata('lion');
// Returns: { id, name, subtitle, theme, color }

const allMetadata = promotions.getAllPromotionMetadata();

// Check if promotion exists
if (promotions.promotionExists('lion')) {
  // ...
}

// Get statistics
const stats = promotions.getPromotionStats('lion');
// Returns: { totalAthletes, totalEvents, divisions }

const allStats = promotions.getAllPromotionStats();

// Compare promotions
const comparison = promotions.comparePromotions();
// Returns: { promotions, stats, totals }

// Get data paths
const dataPath = promotions.getPromotionDataPath('lion');
const exists = promotions.promotionDataExists('lion');

// Initialize promotion data structure
const success = promotions.initializePromotionData('ufc');
```

## Promotion Metadata

```typescript
{
  ufc: {
    id: 'ufc',
    name: 'UFC',
    subtitle: 'Ultimate Fighting Championship',
    theme: 'ufc-theme',
    color: '#d20a0a',
    urls: [
      { link: 'https://www.ufc.com', type: 'website' },
      { link: 'https://youtube.com/@ufc', type: 'youtube' }
    ]
  },
  lion: {
    id: 'lion',
    name: 'Lion Championship',
    subtitle: 'Lion Fighting Championship',
    theme: 'lion-theme',
    color: '#ff8c00',
    urls: [
      { link: 'https://lionchampionship.com', type: 'website' }
    ]
  }
}
```

**Note:** The `urls` field is optional and can contain zero or more URL objects for promotion-related links.

## Promotion Statistics

```typescript
{
  totalAthletes: 154,
  totalEvents: 27,
  divisions: [
    'heavyweight',
    'light-heavyweight',
    'middleweight',
    'welterweight',
    'lightweight',
    'featherweight',
    'bantamweight',
    'flyweight'
  ]
}
```

---

## Module Summary

### athletes.ts
- Manages fighter/athlete roster data
- CRUD operations for athletes
- Search and filter by division, country, gender
- Track fight records (wins/losses/draws)
- Calculate statistics

### events.ts
- Manages event and fight card data
- CRUD operations for events
- Track event status (upcoming, live, completed)
- Organize fights by category
- Store fight results and winners

### promotions.ts
- Manages promotion-level configuration
- Provides metadata (name, theme, colors)
- Calculates cross-promotion statistics
- Initializes data directory structures
- Compares promotions

All modules:
- Written in TypeScript with full type safety
- Support both CLI and programmatic usage
- Include comprehensive error handling
- Follow consistent API patterns
