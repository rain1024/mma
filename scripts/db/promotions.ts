import * as fs from 'fs';
import * as path from 'path';
import { getAllAthletes } from './athletes';
import { getAllEventIds } from './events';

// Re-export promotion types
export type {
  PromotionMetadata,
  PromotionStats,
  Tournament,
  URL
} from './types';

// Import types for internal use
import type {
  PromotionMetadata,
  PromotionStats,
  Tournament
} from './types';

// ==================== PROMOTION DEFINITIONS ====================

const PROMOTIONS: Record<Tournament, PromotionMetadata> = {
  ufc: {
    id: 'ufc',
    name: 'UFC',
    subtitle: 'Ultimate Fighting Championship',
    theme: 'ufc-theme',
    color: '#d20a0a'
  },
  lion: {
    id: 'lion',
    name: 'Lion Championship',
    subtitle: 'Lion Fighting Championship',
    theme: 'lion-theme',
    color: '#ff8c00'
  }
};

// Determine if we're running from dist or source directory
const isCompiled = __dirname.endsWith('dist');
const projectRoot = isCompiled
  ? path.join(__dirname, '../../..') // from dist/: dist -> db -> scripts -> mma
  : path.join(__dirname, '../..'); // from source: db -> scripts -> mma

const DATA_ROOT_PATHS: Record<Tournament, string> = {
  ufc: path.join(projectRoot, 'web/public/data/ufc'),
  lion: path.join(projectRoot, 'web/public/data/lion')
};

// ==================== READ OPERATIONS ====================

/**
 * Get all available promotions
 * @returns Array of promotion IDs
 */
export function getAllPromotions(): Tournament[] {
  return Object.keys(PROMOTIONS) as Tournament[];
}

/**
 * Get metadata for a specific promotion
 * @param promotion - Promotion ID ('ufc' or 'lion')
 * @returns Promotion metadata
 */
export function getPromotionMetadata(promotion: Tournament): PromotionMetadata {
  const metadata = PROMOTIONS[promotion];
  if (!metadata) {
    throw new Error(`Invalid promotion: ${promotion}. Must be 'ufc' or 'lion'`);
  }
  return metadata;
}

/**
 * Get all promotion metadata
 * @returns Map of all promotion metadata
 */
export function getAllPromotionMetadata(): Record<Tournament, PromotionMetadata> {
  return { ...PROMOTIONS };
}

/**
 * Check if a promotion exists
 * @param promotion - Promotion ID to check
 * @returns True if promotion exists
 */
export function promotionExists(promotion: string): promotion is Tournament {
  return promotion in PROMOTIONS;
}

// ==================== STATISTICS OPERATIONS ====================

/**
 * Get comprehensive statistics for a promotion
 * @param promotion - Promotion ID ('ufc' or 'lion')
 * @returns Statistics object
 */
export function getPromotionStats(promotion: Tournament): PromotionStats {
  // Get athletes count
  let totalAthletes = 0;
  try {
    const athletes = getAllAthletes(promotion);
    totalAthletes = athletes.length;
  } catch (error) {
    console.warn(`Could not load athletes for ${promotion}: ${(error as Error).message}`);
  }

  // Get events count
  let totalEvents = 0;
  try {
    const eventIds = getAllEventIds(promotion);
    totalEvents = eventIds.length;
  } catch (error) {
    console.warn(`Could not load events for ${promotion}: ${(error as Error).message}`);
  }

  // Get divisions
  const divisions: string[] = [];
  try {
    const athletesDataPath = path.join(DATA_ROOT_PATHS[promotion], 'athletes.json');
    const athletesData = JSON.parse(fs.readFileSync(athletesDataPath, 'utf8'));
    if (athletesData.divisions) {
      athletesData.divisions.forEach((div: any) => {
        divisions.push(div.value);
      });
    }
  } catch (error) {
    console.warn(`Could not load divisions for ${promotion}: ${(error as Error).message}`);
  }

  return {
    totalAthletes,
    totalEvents,
    divisions
  };
}

/**
 * Get statistics for all promotions
 * @returns Map of promotion statistics
 */
export function getAllPromotionStats(): Record<Tournament, PromotionStats> {
  const stats: Record<string, PromotionStats> = {};

  for (const promotion of getAllPromotions()) {
    try {
      stats[promotion] = getPromotionStats(promotion);
    } catch (error) {
      console.warn(`Could not get stats for ${promotion}: ${(error as Error).message}`);
    }
  }

  return stats as Record<Tournament, PromotionStats>;
}

// ==================== DATA DIRECTORY OPERATIONS ====================

/**
 * Get the data directory path for a promotion
 * @param promotion - Promotion ID ('ufc' or 'lion')
 * @returns Absolute path to promotion data directory
 */
export function getPromotionDataPath(promotion: Tournament): string {
  const dataPath = DATA_ROOT_PATHS[promotion];
  if (!dataPath) {
    throw new Error(`Invalid promotion: ${promotion}. Must be 'ufc' or 'lion'`);
  }
  return dataPath;
}

/**
 * Check if promotion data directory exists
 * @param promotion - Promotion ID ('ufc' or 'lion')
 * @returns True if data directory exists
 */
export function promotionDataExists(promotion: Tournament): boolean {
  try {
    const dataPath = getPromotionDataPath(promotion);
    return fs.existsSync(dataPath);
  } catch (error) {
    return false;
  }
}

/**
 * Initialize promotion data directory structure
 * @param promotion - Promotion ID ('ufc' or 'lion')
 * @returns True if successful
 */
export function initializePromotionData(promotion: Tournament): boolean {
  try {
    const dataPath = getPromotionDataPath(promotion);
    const metadata = getPromotionMetadata(promotion);

    // Create main data directory
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }

    // Create events subdirectory
    const eventsDir = path.join(dataPath, 'events');
    if (!fs.existsSync(eventsDir)) {
      fs.mkdirSync(eventsDir, { recursive: true });
    }

    // Create athletes.json if it doesn't exist
    const athletesPath = path.join(dataPath, 'athletes.json');
    if (!fs.existsSync(athletesPath)) {
      const athletesData = {
        name: metadata.name,
        subtitle: metadata.subtitle,
        divisions: [
          { value: 'heavyweight', label: 'Heavyweight' },
          { value: 'light-heavyweight', label: 'Light Heavyweight' },
          { value: 'middleweight', label: 'Middleweight' },
          { value: 'welterweight', label: 'Welterweight' },
          { value: 'lightweight', label: 'Lightweight' },
          { value: 'featherweight', label: 'Featherweight' },
          { value: 'bantamweight', label: 'Bantamweight' },
          { value: 'flyweight', label: 'Flyweight' },
          { value: 'strawweight', label: 'Strawweight' }
        ],
        athletes: []
      };
      fs.writeFileSync(athletesPath, JSON.stringify(athletesData, null, 2), 'utf8');
    }

    // Create events.json if it doesn't exist
    const eventsListPath = path.join(dataPath, 'events.json');
    if (!fs.existsSync(eventsListPath)) {
      const eventsData = {
        events: []
      };
      fs.writeFileSync(eventsListPath, JSON.stringify(eventsData, null, 2), 'utf8');
    }

    // Create rankings.json if it doesn't exist
    const rankingsPath = path.join(dataPath, 'rankings.json');
    if (!fs.existsSync(rankingsPath)) {
      const rankingsData = {
        pfpRankings: [],
        divisions: {}
      };
      fs.writeFileSync(rankingsPath, JSON.stringify(rankingsData, null, 2), 'utf8');
    }

    return true;
  } catch (error) {
    console.error(`Failed to initialize ${promotion} data: ${(error as Error).message}`);
    return false;
  }
}

// ==================== COMPARISON OPERATIONS ====================

/**
 * Compare statistics between promotions
 * @returns Comparison object
 */
export function comparePromotions(): {
  promotions: PromotionMetadata[];
  stats: Record<Tournament, PromotionStats>;
  totals: {
    athletes: number;
    events: number;
  };
} {
  const allPromotions = getAllPromotions();
  const allMetadata = allPromotions.map(p => getPromotionMetadata(p));
  const allStats = getAllPromotionStats();

  const totals = {
    athletes: 0,
    events: 0
  };

  Object.values(allStats).forEach(stat => {
    totals.athletes += stat.totalAthletes;
    totals.events += stat.totalEvents;
  });

  return {
    promotions: allMetadata,
    stats: allStats,
    totals
  };
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

  // Helper to display usage
  function showUsage(): void {
    console.log(`
${colors.bright}Promotions Database CLI${colors.reset}
${colors.cyan}Manage MMA promotion metadata and statistics${colors.reset}

${colors.bright}USAGE:${colors.reset}
  node promotions.js <command> [options]

${colors.bright}COMMANDS:${colors.reset}

  ${colors.green}READ OPERATIONS:${colors.reset}
    list
      List all available promotions
      Example: node promotions.js list

    get <promotion>
      Get metadata for a specific promotion
      Example: node promotions.js get lion

    path <promotion>
      Get the data directory path for a promotion
      Example: node promotions.js path ufc

  ${colors.green}STATISTICS OPERATIONS:${colors.reset}
    stats <promotion>
      Get comprehensive statistics for a promotion
      Example: node promotions.js stats lion

    allstats
      Get statistics for all promotions
      Example: node promotions.js allstats

    compare
      Compare statistics between all promotions
      Example: node promotions.js compare

  ${colors.green}UTILITY OPERATIONS:${colors.reset}
    init <promotion>
      Initialize data directory structure for a promotion
      Example: node promotions.js init ufc

    exists <promotion>
      Check if promotion data directory exists
      Example: node promotions.js exists lion

    help
      Show this help message

${colors.bright}AVAILABLE PROMOTIONS:${colors.reset}
  ufc   - UFC (Ultimate Fighting Championship)
  lion  - Lion Championship (Lion Fighting Championship)

${colors.bright}EXAMPLES:${colors.reset}
  # List all promotions
  node promotions.js list

  # Get Lion Championship metadata
  node promotions.js get lion

  # Get UFC statistics
  node promotions.js stats ufc

  # Compare all promotions
  node promotions.js compare

  # Initialize new promotion data structure
  node promotions.js init ufc
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
          const promotions = getAllPromotions();
          const metadata = getAllPromotionMetadata();

          printInfo('\nAvailable Promotions:\n');
          promotions.forEach(promo => {
            const meta = metadata[promo];
            console.log(`${colors.bright}${meta.id}${colors.reset}`);
            console.log(`  Name: ${meta.name}`);
            console.log(`  Subtitle: ${meta.subtitle}`);
            console.log(`  Theme: ${meta.theme}`);
            console.log(`  Color: ${meta.color}`);
            console.log();
          });
          break;
        }

        case 'get': {
          if (args.length < 2) {
            printError('Missing promotion name');
            print('Usage: node promotions.js get <promotion>');
            process.exit(1);
          }
          const promotion = args[1] as Tournament;
          const metadata = getPromotionMetadata(promotion);

          printInfo('\nPromotion Metadata:');
          console.log(JSON.stringify(metadata, null, 2));
          break;
        }

        case 'path': {
          if (args.length < 2) {
            printError('Missing promotion name');
            print('Usage: node promotions.js path <promotion>');
            process.exit(1);
          }
          const promotion = args[1] as Tournament;
          const dataPath = getPromotionDataPath(promotion);

          printInfo('\nData Path:');
          console.log(dataPath);

          if (promotionDataExists(promotion)) {
            printSuccess('\nDirectory exists ✓');
          } else {
            printWarning('\nDirectory does not exist');
          }
          break;
        }

        // ==================== STATISTICS OPERATIONS ====================
        case 'stats': {
          if (args.length < 2) {
            printError('Missing promotion name');
            print('Usage: node promotions.js stats <promotion>');
            process.exit(1);
          }
          const promotion = args[1] as Tournament;
          const metadata = getPromotionMetadata(promotion);
          const stats = getPromotionStats(promotion);

          printInfo(`\n${metadata.name} Statistics:\n`);
          console.log(`Total Athletes: ${stats.totalAthletes}`);
          console.log(`Total Events: ${stats.totalEvents}`);
          console.log(`\nDivisions (${stats.divisions.length}):`);
          stats.divisions.forEach(div => {
            console.log(`  - ${div}`);
          });
          break;
        }

        case 'allstats': {
          const allStats = getAllPromotionStats();
          const allMetadata = getAllPromotionMetadata();

          printInfo('\nAll Promotion Statistics:\n');

          Object.entries(allStats).forEach(([promo, stats]) => {
            const meta = allMetadata[promo as Tournament];
            console.log(`${colors.bright}${meta.name}${colors.reset}`);
            console.log(`  Athletes: ${stats.totalAthletes}`);
            console.log(`  Events: ${stats.totalEvents}`);
            console.log(`  Divisions: ${stats.divisions.length}`);
            console.log();
          });
          break;
        }

        case 'compare': {
          const comparison = comparePromotions();

          printInfo('\nPromotion Comparison:\n');

          console.log(`${colors.bright}Totals Across All Promotions:${colors.reset}`);
          console.log(`  Total Athletes: ${comparison.totals.athletes}`);
          console.log(`  Total Events: ${comparison.totals.events}`);
          console.log();

          console.log(`${colors.bright}Individual Promotions:${colors.reset}\n`);

          comparison.promotions.forEach(promo => {
            const stats = comparison.stats[promo.id];
            console.log(`${colors.cyan}${promo.name}${colors.reset}`);
            console.log(`  Athletes: ${stats.totalAthletes} (${((stats.totalAthletes / comparison.totals.athletes) * 100).toFixed(1)}%)`);
            console.log(`  Events: ${stats.totalEvents} (${((stats.totalEvents / comparison.totals.events) * 100).toFixed(1)}%)`);
            console.log(`  Divisions: ${stats.divisions.length}`);
            console.log();
          });
          break;
        }

        // ==================== UTILITY OPERATIONS ====================
        case 'init': {
          if (args.length < 2) {
            printError('Missing promotion name');
            print('Usage: node promotions.js init <promotion>');
            process.exit(1);
          }
          const promotion = args[1] as Tournament;
          const metadata = getPromotionMetadata(promotion);

          printInfo(`\nInitializing data structure for ${metadata.name}...`);

          const success = initializePromotionData(promotion);

          if (success) {
            printSuccess('\nData structure initialized successfully!');
            const dataPath = getPromotionDataPath(promotion);
            console.log(`\nCreated at: ${dataPath}`);
            console.log('\nFiles created:');
            console.log('  - athletes.json');
            console.log('  - events.json');
            console.log('  - rankings.json');
            console.log('  - events/ (directory)');
          } else {
            printError('\nFailed to initialize data structure');
            process.exit(1);
          }
          break;
        }

        case 'exists': {
          if (args.length < 2) {
            printError('Missing promotion name');
            print('Usage: node promotions.js exists <promotion>');
            process.exit(1);
          }
          const promotion = args[1] as Tournament;
          const exists = promotionDataExists(promotion);
          const dataPath = getPromotionDataPath(promotion);

          printInfo(`\nPromotion: ${promotion}`);
          console.log(`Path: ${dataPath}`);

          if (exists) {
            printSuccess('\n✓ Data directory exists');
          } else {
            printWarning('\n✗ Data directory does not exist');
            printInfo('\nTo create it, run:');
            console.log(`  node promotions.js init ${promotion}`);
          }
          break;
        }

        default:
          printError(`Unknown command: ${command}`);
          print('\nRun "node promotions.js help" for usage information');
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
