import * as fs from 'fs';
import * as path from 'path';

// Re-export all types from types.ts for backward compatibility
export type {
  Athlete,
  Division,
  TournamentData,
  TournamentMetadata,
  SearchCriteria,
  AthleteStats,
  CreateAthleteData,
  Tournament,
  URL
} from './types';

// Import types for internal use
import type {
  Athlete,
  TournamentData,
  TournamentMetadata,
  SearchCriteria,
  AthleteStats,
  CreateAthleteData,
  Tournament
} from './types';

// ==================== FILE PATHS ====================

// Determine if we're running from dist or source directory
const isCompiled = __dirname.endsWith('dist');
const projectRoot = isCompiled
  ? path.join(__dirname, '../../..') // from dist/: dist -> db -> scripts -> mma
  : path.join(__dirname, '../..'); // from source: db -> scripts -> mma

const DATA_PATHS: Record<Tournament, string> = {
  ufc: path.join(projectRoot, 'web/public/data/promotions/ufc/athletes.json'),
  lion: path.join(projectRoot, 'web/public/data/promotions/lion/athletes.json')
};

// ==================== FILE OPERATIONS ====================

/**
 * Read the athletes data from a tournament file
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns The complete athletes data object
 */
function readAthletesFile(tournament: Tournament): TournamentData {
  const filePath = DATA_PATHS[tournament];
  if (!filePath) {
    throw new Error(`Invalid tournament: ${tournament}. Must be 'ufc' or 'lion'`);
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as TournamentData;
  } catch (error) {
    throw new Error(`Failed to read athletes file for ${tournament}: ${(error as Error).message}`);
  }
}

/**
 * Write athletes data to a tournament file
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param data - The complete data object to write
 */
function writeAthletesFile(tournament: Tournament, data: TournamentData): void {
  const filePath = DATA_PATHS[tournament];
  if (!filePath) {
    throw new Error(`Invalid tournament: ${tournament}. Must be 'ufc' or 'lion'`);
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to write athletes file for ${tournament}: ${(error as Error).message}`);
  }
}

// ==================== READ OPERATIONS ====================

/**
 * Get all athletes from a tournament
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns Array of all athletes
 */
export function getAllAthletes(tournament: Tournament): Athlete[] {
  const data = readAthletesFile(tournament);
  return data.athletes || [];
}

/**
 * Get a specific athlete by ID
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param id - Athlete ID
 * @returns The athlete object or null if not found
 */
export function getAthleteById(tournament: Tournament, id: number): Athlete | null {
  const athletes = getAllAthletes(tournament);
  return athletes.find(athlete => athlete.id === id) || null;
}

/**
 * Get tournament metadata (name, subtitle, divisions)
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns Tournament metadata
 */
export function getTournamentMetadata(tournament: Tournament): TournamentMetadata {
  const data = readAthletesFile(tournament);
  return {
    name: data.name,
    subtitle: data.subtitle,
    divisions: data.divisions
  };
}

// ==================== SEARCH OPERATIONS ====================

/**
 * Search athletes by various criteria
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param criteria - Search criteria
 * @returns Array of matching athletes
 */
export function searchAthletes(tournament: Tournament, criteria: SearchCriteria = {}): Athlete[] {
  let athletes = getAllAthletes(tournament);

  // Filter by name (partial, case-insensitive)
  // Searches in both the main name and alternative names
  if (criteria.name) {
    const searchName = criteria.name.toLowerCase();
    athletes = athletes.filter(athlete => {
      // Check main name
      if (athlete.name.toLowerCase().includes(searchName)) {
        return true;
      }
      // Check alternative names if they exist
      if (athlete.alternativeNames && athlete.alternativeNames.length > 0) {
        return athlete.alternativeNames.some(altName =>
          altName.toLowerCase().includes(searchName)
        );
      }
      return false;
    });
  }

  // Filter by division (exact match)
  if (criteria.division) {
    athletes = athletes.filter(athlete =>
      athlete.division === criteria.division
    );
  }

  // Filter by country (exact match)
  if (criteria.country) {
    athletes = athletes.filter(athlete =>
      athlete.country === criteria.country
    );
  }

  // Filter by gender (exact match)
  if (criteria.gender) {
    athletes = athletes.filter(athlete =>
      athlete.gender === criteria.gender
    );
  }

  // Filter by nickname (partial, case-insensitive)
  if (criteria.nickname) {
    const searchNickname = criteria.nickname.toLowerCase();
    athletes = athletes.filter(athlete =>
      athlete.nickname && athlete.nickname.toLowerCase().includes(searchNickname)
    );
  }

  return athletes;
}

/**
 * Get athletes by division
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param division - Division name
 * @returns Array of athletes in the division
 */
export function getAthletesByDivision(tournament: Tournament, division: string): Athlete[] {
  return searchAthletes(tournament, { division });
}

/**
 * Get athletes by country
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param country - Country name
 * @returns Array of athletes from the country
 */
export function getAthletesByCountry(tournament: Tournament, country: string): Athlete[] {
  return searchAthletes(tournament, { country });
}

// ==================== CREATE OPERATIONS ====================

/**
 * Create a new athlete
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param athleteData - Athlete data
 * @returns The created athlete with assigned ID
 */
export function createAthlete(tournament: Tournament, athleteData: CreateAthleteData): Athlete {
  const data = readAthletesFile(tournament);

  // Validate required fields
  const requiredFields: (keyof CreateAthleteData)[] = ['name', 'record', 'division', 'country', 'flag', 'gender'];
  for (const field of requiredFields) {
    if (!athleteData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate gender
  if (!['male', 'female'].includes(athleteData.gender)) {
    throw new Error(`Invalid gender: ${athleteData.gender}. Must be 'male' or 'female'`);
  }

  // Generate new ID (max existing ID + 1)
  const maxId = data.athletes.reduce((max, athlete) =>
    Math.max(max, athlete.id), 0
  );
  const newId = maxId + 1;

  // Create new athlete object
  const newAthlete: Athlete = {
    id: newId,
    name: athleteData.name,
    record: athleteData.record,
    nickname: athleteData.nickname || '',
    division: athleteData.division,
    country: athleteData.country,
    flag: athleteData.flag,
    gender: athleteData.gender,
    ...(athleteData.alternativeNames && athleteData.alternativeNames.length > 0 && {
      alternativeNames: athleteData.alternativeNames
    })
  };

  // Add to athletes array
  data.athletes.push(newAthlete);

  // Write back to file
  writeAthletesFile(tournament, data);

  return newAthlete;
}

// ==================== UPDATE OPERATIONS ====================

/**
 * Update an existing athlete
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param id - Athlete ID
 * @param updates - Fields to update
 * @returns The updated athlete
 */
export function updateAthlete(tournament: Tournament, id: number, updates: Partial<Omit<Athlete, 'id'>>): Athlete {
  const data = readAthletesFile(tournament);

  // Find athlete index
  const athleteIndex = data.athletes.findIndex(athlete => athlete.id === id);
  if (athleteIndex === -1) {
    throw new Error(`Athlete with ID ${id} not found in ${tournament}`);
  }

  // Validate gender if being updated
  if (updates.gender && !['male', 'female'].includes(updates.gender)) {
    throw new Error(`Invalid gender: ${updates.gender}. Must be 'male' or 'female'`);
  }

  // Update athlete
  data.athletes[athleteIndex] = {
    ...data.athletes[athleteIndex],
    ...updates
  };

  // Write back to file
  writeAthletesFile(tournament, data);

  return data.athletes[athleteIndex];
}

/**
 * Update an athlete's record
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param id - Athlete ID
 * @param newRecord - New fight record (e.g., "11-2-0")
 * @returns The updated athlete
 */
export function updateAthleteRecord(tournament: Tournament, id: number, newRecord: string): Athlete {
  return updateAthlete(tournament, id, { record: newRecord });
}

/**
 * Increment athlete's win count
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param id - Athlete ID
 * @returns The updated athlete
 */
export function incrementWins(tournament: Tournament, id: number): Athlete {
  const athlete = getAthleteById(tournament, id);
  if (!athlete) {
    throw new Error(`Athlete with ID ${id} not found in ${tournament}`);
  }

  const [wins, losses, draws] = athlete.record.split('-').map(Number);
  const newRecord = `${wins + 1}-${losses}-${draws}`;

  return updateAthleteRecord(tournament, id, newRecord);
}

/**
 * Increment athlete's loss count
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param id - Athlete ID
 * @returns The updated athlete
 */
export function incrementLosses(tournament: Tournament, id: number): Athlete {
  const athlete = getAthleteById(tournament, id);
  if (!athlete) {
    throw new Error(`Athlete with ID ${id} not found in ${tournament}`);
  }

  const [wins, losses, draws] = athlete.record.split('-').map(Number);
  const newRecord = `${wins}-${losses + 1}-${draws}`;

  return updateAthleteRecord(tournament, id, newRecord);
}

// ==================== DELETE OPERATIONS ====================

/**
 * Delete an athlete by ID
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param id - Athlete ID
 * @returns The deleted athlete
 */
export function deleteAthlete(tournament: Tournament, id: number): Athlete {
  const data = readAthletesFile(tournament);

  // Find athlete
  const athleteIndex = data.athletes.findIndex(athlete => athlete.id === id);
  if (athleteIndex === -1) {
    throw new Error(`Athlete with ID ${id} not found in ${tournament}`);
  }

  // Remove athlete
  const deletedAthlete = data.athletes.splice(athleteIndex, 1)[0];

  // Write back to file
  writeAthletesFile(tournament, data);

  return deletedAthlete;
}

/**
 * Delete all athletes from a tournament (use with caution!)
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns Number of athletes deleted
 */
export function deleteAllAthletes(tournament: Tournament): number {
  const data = readAthletesFile(tournament);
  const count = data.athletes.length;

  data.athletes = [];

  // Write back to file
  writeAthletesFile(tournament, data);

  return count;
}

// ==================== UTILITY OPERATIONS ====================

/**
 * Get statistics about athletes in a tournament
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns Statistics object
 */
export function getAthleteStats(tournament: Tournament): AthleteStats {
  const athletes = getAllAthletes(tournament);

  const stats: AthleteStats = {
    total: athletes.length,
    byGender: {
      male: athletes.filter(a => a.gender === 'male').length,
      female: athletes.filter(a => a.gender === 'female').length
    },
    byDivision: {},
    byCountry: {},
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0
  };

  athletes.forEach(athlete => {
    // Count by division
    stats.byDivision[athlete.division] = (stats.byDivision[athlete.division] || 0) + 1;

    // Count by country
    stats.byCountry[athlete.country] = (stats.byCountry[athlete.country] || 0) + 1;

    // Sum up records
    const [wins, losses, draws] = athlete.record.split('-').map(Number);
    stats.totalWins += wins;
    stats.totalLosses += losses;
    stats.totalDraws += draws;
  });

  return stats;
}

// ==================== CLI INTERFACE ====================
// Only run CLI if this file is executed directly (not imported as module)
if (require.main === module) {
  // Color codes for terminal output
  const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
  };

  // Helper functions for colored output
  function print(message: string, color: keyof typeof colors = 'reset'): void {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  function printSuccess(message: string): void {
    print(`✓ ${message}`, 'green');
  }

  function printError(message: string): void {
    print(`✗ Error: ${message}`, 'red');
  }

  function printWarning(message: string): void {
    print(`⚠ ${message}`, 'yellow');
  }

  function printInfo(message: string): void {
    print(message, 'cyan');
  }

  // Helper to parse JSON from command line
  function parseJSON(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      printError(`Invalid JSON: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  // Helper to format athlete output
  function formatAthlete(athlete: Athlete): string {
    const altNames = athlete.alternativeNames && athlete.alternativeNames.length > 0
      ? ` | Alt: [${athlete.alternativeNames.join(', ')}]`
      : '';
    return `ID: ${athlete.id} | ${athlete.name} (${athlete.record}) | ${athlete.division} | ${athlete.country} ${athlete.flag}${athlete.nickname ? ` | "${athlete.nickname}"` : ''}${athlete.gender ? ` | ${athlete.gender}` : ''}${altNames}`;
  }

  // Helper to display usage
  function showUsage(): void {
    console.log(`
${colors.bright}Athletes Database CLI${colors.reset}
${colors.cyan}Manage fighter data for UFC and Lion Championship${colors.reset}

${colors.bright}USAGE:${colors.reset}
  node athletes.js <command> [options]

${colors.bright}COMMANDS:${colors.reset}

  ${colors.green}READ OPERATIONS:${colors.reset}
    list <tournament>
      List all athletes in a tournament
      Example: node athletes.js list lion

    get <tournament> <id>
      Get a specific athlete by ID
      Example: node athletes.js get lion 1

    meta <tournament>
      Get tournament metadata
      Example: node athletes.js meta ufc

  ${colors.green}SEARCH OPERATIONS:${colors.reset}
    search <tournament> <json>
      Search athletes with criteria (JSON object)
      Example: node athletes.js search lion '{"division":"lightweight","country":"Vietnam"}'
      Criteria: name, division, country, gender, nickname

    division <tournament> <division>
      Get all athletes in a division
      Example: node athletes.js division lion lightweight

    country <tournament> <country>
      Get all athletes from a country
      Example: node athletes.js country lion Vietnam

  ${colors.green}CREATE OPERATIONS:${colors.reset}
    create <tournament> <json>
      Create a new athlete (JSON object)
      Example: node athletes.js create lion '{"name":"John Doe","record":"5-2-0","nickname":"The Beast","division":"welterweight","country":"USA","flag":"🇺🇸","gender":"male","alternativeNames":["ジョン・ドー","존 도"]}'
      Required: name, record, division, country, flag, gender
      Optional: nickname, alternativeNames (array of strings)

  ${colors.green}UPDATE OPERATIONS:${colors.reset}
    update <tournament> <id> <json>
      Update an athlete (JSON object with fields to update)
      Example: node athletes.js update lion 1 '{"nickname":"The King","record":"20-2-0"}'

    record <tournament> <id> <record>
      Update just the fight record
      Example: node athletes.js record lion 1 19-2-0

    win <tournament> <id>
      Increment win count
      Example: node athletes.js win lion 1

    loss <tournament> <id>
      Increment loss count
      Example: node athletes.js loss lion 1

  ${colors.green}DELETE OPERATIONS:${colors.reset}
    delete <tournament> <id>
      Delete an athlete by ID
      Example: node athletes.js delete lion 155 --confirm

  ${colors.green}UTILITY OPERATIONS:${colors.reset}
    stats <tournament>
      Get statistics for a tournament
      Example: node athletes.js stats lion

    help
      Show this help message

${colors.bright}TOURNAMENTS:${colors.reset}
  ufc   - UFC
  lion  - Lion Championship

${colors.bright}DIVISIONS:${colors.reset}
  pfp, heavyweight, light-heavyweight, middleweight, welterweight,
  lightweight, featherweight, bantamweight, flyweight, strawweight

${colors.bright}EXAMPLES:${colors.reset}
  # List all Lion Championship fighters
  node athletes.js list lion

  # Find Vietnamese lightweights
  node athletes.js search lion '{"division":"lightweight","country":"Vietnam"}'

  # Add a new fighter
  node athletes.js create lion '{"name":"Mike Smith","record":"10-5-0","nickname":"The Hammer","division":"welterweight","country":"USA","flag":"🇺🇸","gender":"male"}'

  # Update fighter record after a win
  node athletes.js win lion 1

  # Get tournament statistics
  node athletes.js stats lion
`);
  }

  // Main CLI handler
  function runCLI(): void {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
      showUsage();
      process.exit(0);
    }

    const command = args[0];

    try {
      switch (command) {
        // ==================== READ OPERATIONS ====================
        case 'list': {
          if (args.length < 2) {
            printError('Missing tournament name');
            print('Usage: node athletes.js list <tournament>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const allAthletes = getAllAthletes(tournament);

          printInfo(`\n${tournament.toUpperCase()} Athletes (${allAthletes.length} total):\n`);
          allAthletes.forEach(athlete => {
            console.log(formatAthlete(athlete));
          });
          break;
        }

        case 'get': {
          if (args.length < 3) {
            printError('Missing tournament name or athlete ID');
            print('Usage: node athletes.js get <tournament> <id>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const id = parseInt(args[2]);
          const athlete = getAthleteById(tournament, id);

          if (athlete) {
            printInfo('\nAthlete Found:');
            console.log(JSON.stringify(athlete, null, 2));
          } else {
            printWarning(`\nAthlete with ID ${id} not found in ${tournament}`);
          }
          break;
        }

        case 'meta': {
          if (args.length < 2) {
            printError('Missing tournament name');
            print('Usage: node athletes.js meta <tournament>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const metadata = getTournamentMetadata(tournament);

          printInfo('\nTournament Metadata:');
          console.log(JSON.stringify(metadata, null, 2));
          break;
        }

        // ==================== SEARCH OPERATIONS ====================
        case 'search': {
          if (args.length < 3) {
            printError('Missing tournament name or search criteria');
            print('Usage: node athletes.js search <tournament> \'{"division":"lightweight"}\'');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const criteria = parseJSON(args[2]) as SearchCriteria;
          const results = searchAthletes(tournament, criteria);

          printInfo(`\nSearch Results (${results.length} found):\n`);
          if (results.length === 0) {
            printWarning('No athletes match the criteria');
          } else {
            results.forEach(athlete => {
              console.log(formatAthlete(athlete));
            });
          }
          break;
        }

        case 'division': {
          if (args.length < 3) {
            printError('Missing tournament name or division');
            print('Usage: node athletes.js division <tournament> <division>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const division = args[2];
          const results = getAthletesByDivision(tournament, division);

          printInfo(`\n${division.toUpperCase()} Division - ${tournament.toUpperCase()} (${results.length} fighters):\n`);
          if (results.length === 0) {
            printWarning(`No fighters in ${division} division`);
          } else {
            results.forEach(athlete => {
              console.log(formatAthlete(athlete));
            });
          }
          break;
        }

        case 'country': {
          if (args.length < 3) {
            printError('Missing tournament name or country');
            print('Usage: node athletes.js country <tournament> <country>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const country = args.slice(2).join(' '); // Allow multi-word countries
          const results = getAthletesByCountry(tournament, country);

          printInfo(`\nFighters from ${country} in ${tournament.toUpperCase()} (${results.length} total):\n`);
          if (results.length === 0) {
            printWarning(`No fighters from ${country}`);
          } else {
            results.forEach(athlete => {
              console.log(formatAthlete(athlete));
            });
          }
          break;
        }

        // ==================== CREATE OPERATIONS ====================
        case 'create': {
          if (args.length < 3) {
            printError('Missing tournament name or athlete data');
            print('Usage: node athletes.js create <tournament> \'{"name":"John Doe","record":"5-2-0",...}\'');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const athleteData = parseJSON(args[2]) as CreateAthleteData;
          const newAthlete = createAthlete(tournament, athleteData);

          printSuccess(`\nCreated athlete with ID ${newAthlete.id}:`);
          console.log(JSON.stringify(newAthlete, null, 2));
          break;
        }

        // ==================== UPDATE OPERATIONS ====================
        case 'update': {
          if (args.length < 4) {
            printError('Missing tournament name, athlete ID, or update data');
            print('Usage: node athletes.js update <tournament> <id> \'{"nickname":"New Name"}\'');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const id = parseInt(args[2]);
          const updates = parseJSON(args[3]) as Partial<Omit<Athlete, 'id'>>;
          const updated = updateAthlete(tournament, id, updates);

          printSuccess(`\nUpdated athlete ID ${id}:`);
          console.log(JSON.stringify(updated, null, 2));
          break;
        }

        case 'record': {
          if (args.length < 4) {
            printError('Missing tournament name, athlete ID, or new record');
            print('Usage: node athletes.js record <tournament> <id> <record>');
            print('Example: node athletes.js record lion 1 19-2-0');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const id = parseInt(args[2]);
          const newRecord = args[3];
          const before = getAthleteById(tournament, id);
          const updated = updateAthleteRecord(tournament, id, newRecord);

          printSuccess(`\nUpdated record for ${updated.name}:`);
          console.log(`  Old record: ${before?.record}`);
          console.log(`  New record: ${updated.record}`);
          break;
        }

        case 'win': {
          if (args.length < 3) {
            printError('Missing tournament name or athlete ID');
            print('Usage: node athletes.js win <tournament> <id>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const id = parseInt(args[2]);
          const before = getAthleteById(tournament, id);
          const updated = incrementWins(tournament, id);

          printSuccess(`\n${updated.name} wins!`);
          console.log(`  Previous record: ${before?.record}`);
          console.log(`  New record: ${updated.record}`);
          break;
        }

        case 'loss': {
          if (args.length < 3) {
            printError('Missing tournament name or athlete ID');
            print('Usage: node athletes.js loss <tournament> <id>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const id = parseInt(args[2]);
          const before = getAthleteById(tournament, id);
          const updated = incrementLosses(tournament, id);

          printWarning(`\n${updated.name} loses`);
          console.log(`  Previous record: ${before?.record}`);
          console.log(`  New record: ${updated.record}`);
          break;
        }

        // ==================== DELETE OPERATIONS ====================
        case 'delete': {
          if (args.length < 3) {
            printError('Missing tournament name or athlete ID');
            print('Usage: node athletes.js delete <tournament> <id> --confirm');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const id = parseInt(args[2]);

          // Confirm deletion
          const athlete = getAthleteById(tournament, id);
          if (!athlete) {
            printWarning(`\nAthlete with ID ${id} not found in ${tournament}`);
            process.exit(1);
          }

          printWarning(`\nAbout to delete: ${athlete.name} (ID: ${id})`);

          if (args.includes('--confirm')) {
            const deleted = deleteAthlete(tournament, id);
            printSuccess(`\nDeleted athlete: ${deleted.name} (ID: ${deleted.id})`);
          } else {
            printInfo('To confirm deletion, add --confirm flag');
            printInfo(`Example: node athletes.js delete ${tournament} ${id} --confirm`);
          }
          break;
        }

        // ==================== UTILITY OPERATIONS ====================
        case 'stats': {
          if (args.length < 2) {
            printError('Missing tournament name');
            print('Usage: node athletes.js stats <tournament>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const stats = getAthleteStats(tournament);

          printInfo(`\n${tournament.toUpperCase()} Statistics:\n`);
          console.log(`Total Athletes: ${stats.total}`);
          console.log(`  Male: ${stats.byGender.male}`);
          console.log(`  Female: ${stats.byGender.female}`);
          console.log(`\nTotal Wins: ${stats.totalWins}`);
          console.log(`Total Losses: ${stats.totalLosses}`);
          console.log(`Total Draws: ${stats.totalDraws}`);

          console.log('\nAthletes by Division:');
          Object.entries(stats.byDivision)
            .sort((a, b) => b[1] - a[1])
            .forEach(([division, count]) => {
              console.log(`  ${division.padEnd(20)} ${count}`);
            });

          console.log('\nAthletes by Country:');
          Object.entries(stats.byCountry)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10) // Top 10 countries
            .forEach(([country, count]) => {
              console.log(`  ${country.padEnd(20)} ${count}`);
            });
          break;
        }

        default:
          printError(`Unknown command: ${command}`);
          print('\nRun "node athletes.js help" for usage information');
          process.exit(1);
      }
    } catch (error) {
      printError((error as Error).message);
      if (process.env.DEBUG) {
        console.error((error as Error).stack);
      }
      process.exit(1);
    }
  }

  // Run the CLI
  runCLI();
}
