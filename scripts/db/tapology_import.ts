import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import {
  searchAthletes,
  incrementWins,
  incrementLosses,
  updateAthlete,
  getAthleteById,
  createAthlete
} from './athletes';
import type { URL, CreateAthleteData } from './types';

/**
 * Tapology Event Import Module
 *
 * This module imports event data scraped from Tapology.com and processes it into the MMA tournament database.
 *
 * Workflow:
 * 1. Reads a scraped event JSON file containing fight card data
 * 2. Matches fighters to existing athletes in the database by name
 * 3. Updates win/loss records for all fighters based on fight results
 * 4. Adds Tapology profile URLs to athlete records (if not already present)
 * 5. Creates a new event file in web/public/data/{tournament}/events/
 *
 * Usage:
 *   node dist/tapology_import.js --event <path-to-scraped-event.json> [--skip-athletes]
 *
 * Examples:
 *   # Import event and update athlete records
 *   node dist/tapology_import.js --event ../event-105522-scraped.json
 *
 *   # Import event only, skip athlete updates
 *   node dist/tapology_import.js --event ../event-105522-scraped.json --skip-athletes
 *
 * Options:
 *   --event <file>       Path to the scraped event JSON file (required)
 *   --skip-athletes      Skip athlete record updates, only create event file
 *
 * Expected Input Format:
 *   The scraped event JSON should contain:
 *   - id: Event identifier
 *   - title: Event name
 *   - location: Event location (optional, defaults to Corona Resort & Casino)
 *   - fights: Array of fight categories with matches
 *     - Each match contains fighter1 and fighter2 with name, flag, stats, and winner boolean
 *
 * Notes:
 *   - Athletes are matched by name (case-insensitive)
 *   - Ambiguous matches (multiple athletes with same name) are skipped for safety
 *   - Missing athletes are automatically created with parsed gender, division, and Tapology URLs
 *   - All athletes have alternativeNames field (at least containing their own name)
 *   - Currently hardcoded to 'lion' tournament
 */

// Types
interface Fighter {
  name: string;
  link: string;
  stats: string;
  flag: string;
  winner: boolean;
}

interface MatchResult {
  method: string;
  technique?: string;
  time: string;
  round: string;
  totalTime: string;
}

interface Match {
  round: string;
  fighter1: Fighter;
  fighter2: Fighter;
  result?: MatchResult;
}

interface Fight {
  category: string;
  matches: Match[];
}

interface EventData {
  id: string;
  eventId?: string;
  url?: string;
  title: string;
  location?: string;
  fights: Fight[];
  [key: string]: any;
}

// Parse CLI arguments
function parseArgs(): { eventFile?: string; skipAthletes?: boolean } {
  const args = process.argv.slice(2);
  const params: { eventFile?: string; skipAthletes?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--event' && i + 1 < args.length) {
      params.eventFile = args[i + 1];
      i++;
    } else if (args[i] === '--skip-athletes') {
      params.skipAthletes = true;
    }
  }

  return params;
}

/**
 * Parse fighter stats to extract gender and division
 * Stats format: "115 lbs - Nữ" or " - Nam" or "134 lbs - Nam"
 */
function parseFighterStats(stats: string): { gender: 'male' | 'female'; division: string } {
  const genderMap: Record<string, 'male' | 'female'> = {
    'nam': 'male',
    'nữ': 'female',
    'male': 'male',
    'female': 'female'
  };

  // Extract gender from stats
  const statsLower = stats.toLowerCase().trim();
  let gender: 'male' | 'female' = 'male'; // default

  for (const [key, value] of Object.entries(genderMap)) {
    if (statsLower.includes(key)) {
      gender = value;
      break;
    }
  }

  // Extract weight/division - parse the weight in lbs
  const weightMatch = stats.match(/(\d+)\s*lbs/);
  let division = 'lightweight'; // default

  if (weightMatch) {
    const weightLbs = parseInt(weightMatch[1]);

    // Map weight to division (approximate MMA weight classes)
    if (weightLbs <= 115) {
      division = 'strawweight';
    } else if (weightLbs <= 125) {
      division = 'flyweight';
    } else if (weightLbs <= 135) {
      division = 'bantamweight';
    } else if (weightLbs <= 145) {
      division = 'featherweight';
    } else if (weightLbs <= 155) {
      division = 'lightweight';
    } else if (weightLbs <= 170) {
      division = 'welterweight';
    } else if (weightLbs <= 185) {
      division = 'middleweight';
    } else if (weightLbs <= 205) {
      division = 'light-heavyweight';
    } else {
      division = 'heavyweight';
    }
  }

  return { gender, division };
}

/**
 * Create a new athlete from fighter data
 */
function createAthleteFromFighter(
  tournament: 'ufc' | 'lion',
  fighter: Fighter,
  isWinner: boolean
): number {
  const { gender, division } = parseFighterStats(fighter.stats);

  // Determine initial record based on this fight result
  const record = isWinner ? '1-0-0' : '0-1-0';

  const athleteData: CreateAthleteData = {
    name: fighter.name,
    record,
    division,
    country: 'Vietnam', // Default, can be updated later
    flag: fighter.flag,
    gender,
    alternativeNames: [fighter.name] // Always include at least the name itself
  };

  const newAthlete = createAthlete(tournament, athleteData);

  // Add Tapology URL if available
  if (fighter.link) {
    const newUrl: URL = {
      link: fighter.link,
      type: 'tapology'
    };
    updateAthlete(tournament, newAthlete.id, { urls: [newUrl] });
  }

  console.log(`➕ Created new athlete: ${newAthlete.name} (ID: ${newAthlete.id}) - ${record} - ${division} - ${gender}`);
  if (fighter.link) {
    console.log(`   🔗 Added Tapology URL: ${fighter.link}`);
  }

  return newAthlete.id;
}

/**
 * Process athletes from event data and update their records
 */
function processAthletes(eventData: EventData, tournament: 'ufc' | 'lion'): void {
  console.log('\n📊 Processing athlete records...\n');

  const updatedAthletes = new Set<number>();
  const createdAthletes = new Set<number>();
  const notFoundAthletes: string[] = [];

  // Process each fight in the event
  for (const fight of eventData.fights) {
    for (const match of fight.matches) {
      const fighters = [match.fighter1, match.fighter2];

      for (const fighter of fighters) {
        if (!fighter.name) continue;

        // Search for athlete by name (including alternative names)
        let matches = searchAthletes(tournament, { name: fighter.name });
        let isNewlyCreated = false;

        if (matches.length === 0) {
          // Athlete not found in database - create new athlete
          console.log(`⚠️  Athlete not found: ${fighter.name} ${fighter.flag} - Creating new athlete...`);
          try {
            const newAthleteId = createAthleteFromFighter(tournament, fighter, fighter.winner);
            // Re-fetch the newly created athlete
            const newAthlete = getAthleteById(tournament, newAthleteId);
            if (newAthlete) {
              matches = [newAthlete];
              notFoundAthletes.push(fighter.name);
              createdAthletes.add(newAthleteId);
              isNewlyCreated = true;
              // Don't add to updatedAthletes yet - let it be added below after processing
            }
          } catch (error) {
            console.error(`   Failed to create athlete: ${(error as Error).message}`);
            continue;
          }
        }

        if (matches.length > 1) {
          console.log(`⚠️  Multiple matches for "${fighter.name}":`);
          matches.forEach(a => console.log(`   - ID ${a.id}: ${a.name} (${a.division})`));
          console.log(`   Skipping update. Please update manually.`);
          continue;
        }

        // Found exactly one match
        const athlete = matches[0];

        // Skip if already updated in this event
        if (updatedAthletes.has(athlete.id)) {
          continue;
        }

        // Update record based on win/loss (skip if newly created as record is already set)
        try {
          if (!isNewlyCreated) {
            // Update the win/loss record
            let updated;
            if (fighter.winner) {
              updated = incrementWins(tournament, athlete.id);
              console.log(`✅ ${athlete.name} (ID: ${athlete.id}): ${athlete.record} → ${updated.record} (Win)`);
            } else {
              updated = incrementLosses(tournament, athlete.id);
              console.log(`❌ ${athlete.name} (ID: ${athlete.id}): ${athlete.record} → ${updated.record} (Loss)`);
            }
          }

          // Update Tapology URL if available and not already added (skip if newly created)
          if (fighter.link && !isNewlyCreated) {
            const currentAthlete = getAthleteById(tournament, athlete.id);
            const existingUrls = currentAthlete?.urls || [];

            // Check if this Tapology URL is already in the list
            const tapologyUrlExists = existingUrls.some(
              (url: URL) => url.link === fighter.link || url.type === 'tapology'
            );

            if (!tapologyUrlExists) {
              const newUrl: URL = {
                link: fighter.link,
                type: 'tapology'
              };
              const updatedUrls = [...existingUrls, newUrl];
              updateAthlete(tournament, athlete.id, { urls: updatedUrls });
              console.log(`   🔗 Added Tapology URL: ${fighter.link}`);
            }
          }

          updatedAthletes.add(athlete.id);
        } catch (error) {
          console.error(`Error updating ${athlete.name}:`, (error as Error).message);
        }
      }
    }
  }

  // Summary
  console.log(`\n📈 Summary:`);
  console.log(`   Updated: ${updatedAthletes.size - createdAthletes.size} athletes`);
  console.log(`   Created: ${createdAthletes.size} new athletes`);
  console.log(`   Total processed: ${updatedAthletes.size} athletes`);
}

// Main execution
async function main() {
  const { eventFile, skipAthletes } = parseArgs();

  if (!eventFile) {
    console.error('Error: Event file is required');
    console.log('Usage: ts-node import_tapology.ts --event <path-to-scraped-event.json> [--skip-athletes]');
    console.log('Example: ts-node import_tapology.ts --event ../event-105522-scraped.json');
    console.log('\nOptions:');
    console.log('  --skip-athletes  Skip athlete record updates (only import event)');
    process.exit(1);
  }

  // Resolve the file path
  const scrapedEventPath = path.resolve(eventFile);

  if (!fs.existsSync(scrapedEventPath)) {
    console.error(`Error: File not found: ${scrapedEventPath}`);
    process.exit(1);
  }

  try {
    // Read and parse the scraped event file
    const eventData: EventData = JSON.parse(fs.readFileSync(scrapedEventPath, 'utf-8'));

    // Check if location is missing and add default if needed
    if (!eventData.location) {
      console.log('⚠️  Warning: No location found, adding default location');
      eventData.location = 'Corona Resort & Casino, Phu Quoc, Vietnam';
    }

    console.log(`\n🏆 Importing event: ${eventData.title} (${eventData.id})`);

    // Process athletes first (before creating event)
    const tournament = 'lion'; // Hardcoded for now, could be a CLI param
    if (!skipAthletes) {
      processAthletes(eventData, tournament);
    } else {
      console.log('\n⏭️  Skipping athlete updates (--skip-athletes flag)');
    }

    // Remove fields that shouldn't be in the final event data
    const { eventId, url, ...cleanEventData } = eventData;

    console.log(`\n📝 Creating event file...`);

    // Determine if running from compiled code or source
    const isCompiled = __dirname.endsWith('dist');
    const eventsScript = isCompiled ? 'events.js' : 'dist/events.js';

    // Run the events CLI with the JSON data
    const child = spawn('node', [eventsScript, 'create', tournament, JSON.stringify(cleanEventData)], {
      stdio: 'inherit',
      cwd: __dirname
    });

    child.on('exit', (code) => {
      if (code === 0) {
        console.log('\n✅ Event imported successfully!');
        console.log(`📁 File: web/public/data/${tournament}/events/${eventData.id}.json`);
      }
      process.exit(code || 0);
    });

    child.on('error', (error) => {
      console.error('Error running events CLI:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Error reading or parsing event file:', (error as Error).message);
    process.exit(1);
  }
}

main();
