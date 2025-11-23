import * as fs from 'fs';
import * as path from 'path';

// Re-export all event types for backward compatibility
export type {
  EventData,
  EventsList,
  EventSearchCriteria,
  CreateEventData,
  Match,
  MatchFighter,
  FightCategory,
  Tournament,
  URL
} from './types';

// Import types for internal use
import type {
  EventData,
  EventsList,
  EventSearchCriteria,
  CreateEventData,
  Tournament
} from './types';

// ==================== FILE PATHS ====================

// Determine if we're running from dist or source directory
const isCompiled = __dirname.endsWith('dist');
const projectRoot = isCompiled
  ? path.join(__dirname, '../../..') // from dist/: dist -> db -> scripts -> mma
  : path.join(__dirname, '../..'); // from source: db -> scripts -> mma

const EVENTS_LIST_PATHS: Record<Tournament, string> = {
  ufc: path.join(projectRoot, 'web/public/data/promotions/ufc/events.json'),
  lion: path.join(projectRoot, 'web/public/data/promotions/lion/events.json')
};

const EVENTS_DIR_PATHS: Record<Tournament, string> = {
  ufc: path.join(projectRoot, 'web/public/data/promotions/ufc/events'),
  lion: path.join(projectRoot, 'web/public/data/promotions/lion/events')
};

// ==================== FILE OPERATIONS ====================

/**
 * Read the events list from a tournament file
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns The events list object
 */
function readEventsListFile(tournament: Tournament): EventsList {
  const filePath = EVENTS_LIST_PATHS[tournament];
  if (!filePath) {
    throw new Error(`Invalid tournament: ${tournament}. Must be 'ufc' or 'lion'`);
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as EventsList;
  } catch (error) {
    throw new Error(`Failed to read events list for ${tournament}: ${(error as Error).message}`);
  }
}

/**
 * Write events list to a tournament file
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param data - The events list object to write
 */
function writeEventsListFile(tournament: Tournament, data: EventsList): void {
  const filePath = EVENTS_LIST_PATHS[tournament];
  if (!filePath) {
    throw new Error(`Invalid tournament: ${tournament}. Must be 'ufc' or 'lion'`);
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to write events list for ${tournament}: ${(error as Error).message}`);
  }
}

/**
 * Read a specific event file
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param eventId - Event ID
 * @returns The event data
 */
function readEventFile(tournament: Tournament, eventId: string): EventData {
  const eventsDir = EVENTS_DIR_PATHS[tournament];
  const filePath = path.join(eventsDir, `${eventId}.json`);

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as EventData;
  } catch (error) {
    throw new Error(`Failed to read event ${eventId} for ${tournament}: ${(error as Error).message}`);
  }
}

/**
 * Write a specific event file
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param eventId - Event ID
 * @param data - The event data to write
 */
function writeEventFile(tournament: Tournament, eventId: string, data: EventData): void {
  const eventsDir = EVENTS_DIR_PATHS[tournament];

  // Ensure events directory exists
  if (!fs.existsSync(eventsDir)) {
    fs.mkdirSync(eventsDir, { recursive: true });
  }

  const filePath = path.join(eventsDir, `${eventId}.json`);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to write event ${eventId} for ${tournament}: ${(error as Error).message}`);
  }
}

/**
 * Delete a specific event file
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param eventId - Event ID
 */
function deleteEventFile(tournament: Tournament, eventId: string): void {
  const eventsDir = EVENTS_DIR_PATHS[tournament];
  const filePath = path.join(eventsDir, `${eventId}.json`);

  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    throw new Error(`Failed to delete event ${eventId} for ${tournament}: ${(error as Error).message}`);
  }
}

// ==================== READ OPERATIONS ====================

/**
 * Get all event IDs from a tournament
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns Array of event IDs
 */
export function getAllEventIds(tournament: Tournament): string[] {
  const eventsList = readEventsListFile(tournament);
  return eventsList.events || [];
}

/**
 * Get a specific event by ID
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param eventId - Event ID
 * @returns The event data or null if not found
 */
export function getEventById(tournament: Tournament, eventId: string): EventData | null {
  try {
    return readEventFile(tournament, eventId);
  } catch (error) {
    return null;
  }
}

/**
 * Get all events from a tournament
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns Array of all event data
 */
export function getAllEvents(tournament: Tournament): EventData[] {
  const eventIds = getAllEventIds(tournament);
  const events: EventData[] = [];

  for (const eventId of eventIds) {
    try {
      const event = readEventFile(tournament, eventId);
      events.push(event);
    } catch (error) {
      console.warn(`Warning: Could not read event ${eventId}: ${(error as Error).message}`);
    }
  }

  return events;
}

// ==================== SEARCH OPERATIONS ====================

/**
 * Search events by various criteria
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param criteria - Search criteria
 * @returns Array of matching events
 */
export function searchEvents(tournament: Tournament, criteria: EventSearchCriteria = {}): EventData[] {
  let events = getAllEvents(tournament);

  // Filter by status
  if (criteria.status) {
    events = events.filter(event => event.status === criteria.status);
  }

  // Filter by location (partial, case-insensitive)
  if (criteria.location) {
    const searchLocation = criteria.location.toLowerCase();
    events = events.filter(event =>
      event.location.toLowerCase().includes(searchLocation)
    );
  }

  // Filter by title (partial, case-insensitive)
  if (criteria.titleContains) {
    const searchTitle = criteria.titleContains.toLowerCase();
    events = events.filter(event =>
      event.title.toLowerCase().includes(searchTitle)
    );
  }

  return events;
}

/**
 * Get events by status
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param status - Event status
 * @returns Array of events with the given status
 */
export function getEventsByStatus(tournament: Tournament, status: 'upcoming' | 'completed' | 'live'): EventData[] {
  return searchEvents(tournament, { status });
}

/**
 * Get upcoming events
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns Array of upcoming events
 */
export function getUpcomingEvents(tournament: Tournament): EventData[] {
  return getEventsByStatus(tournament, 'upcoming');
}

/**
 * Get completed events
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns Array of completed events
 */
export function getCompletedEvents(tournament: Tournament): EventData[] {
  return getEventsByStatus(tournament, 'completed');
}

// ==================== CREATE OPERATIONS ====================

/**
 * Create a new event
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param eventData - Event data
 * @returns The created event
 */
export function createEvent(tournament: Tournament, eventData: CreateEventData): EventData {
  // Validate required fields
  const requiredFields: (keyof CreateEventData)[] = ['id', 'logo', 'title', 'date', 'location', 'status'];
  for (const field of requiredFields) {
    if (!eventData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate status
  if (!['upcoming', 'completed', 'live'].includes(eventData.status)) {
    throw new Error(`Invalid status: ${eventData.status}. Must be 'upcoming', 'completed', or 'live'`);
  }

  // Check if event already exists
  const existingEvent = getEventById(tournament, eventData.id);
  if (existingEvent) {
    throw new Error(`Event with ID ${eventData.id} already exists in ${tournament}`);
  }

  // Create new event object
  const newEvent: EventData = {
    id: eventData.id,
    logo: eventData.logo,
    title: eventData.title,
    date: eventData.date,
    location: eventData.location,
    status: eventData.status,
    fights: eventData.fights || []
  };

  // Write event file
  writeEventFile(tournament, eventData.id, newEvent);

  // Add to events list
  const eventsList = readEventsListFile(tournament);
  if (!eventsList.events.includes(eventData.id)) {
    eventsList.events.unshift(eventData.id); // Add to beginning (most recent first)
    writeEventsListFile(tournament, eventsList);
  }

  return newEvent;
}

// ==================== UPDATE OPERATIONS ====================

/**
 * Update an existing event
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param eventId - Event ID
 * @param updates - Fields to update
 * @returns The updated event
 */
export function updateEvent(tournament: Tournament, eventId: string, updates: Partial<Omit<EventData, 'id'>>): EventData {
  const event = getEventById(tournament, eventId);
  if (!event) {
    throw new Error(`Event with ID ${eventId} not found in ${tournament}`);
  }

  // Validate status if being updated
  if (updates.status && !['upcoming', 'completed', 'live'].includes(updates.status)) {
    throw new Error(`Invalid status: ${updates.status}. Must be 'upcoming', 'completed', or 'live'`);
  }

  // Update event
  const updatedEvent: EventData = {
    ...event,
    ...updates
  };

  // Write back to file
  writeEventFile(tournament, eventId, updatedEvent);

  return updatedEvent;
}

/**
 * Update an event's status
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param eventId - Event ID
 * @param status - New status
 * @returns The updated event
 */
export function updateEventStatus(tournament: Tournament, eventId: string, status: 'upcoming' | 'completed' | 'live'): EventData {
  return updateEvent(tournament, eventId, { status });
}

/**
 * Add a fight to an event
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param eventId - Event ID
 * @param category - Fight category
 * @param match - Match data
 * @returns The updated event
 */
export function addFightToEvent(tournament: Tournament, eventId: string, category: string, match: any): EventData {
  const event = getEventById(tournament, eventId);
  if (!event) {
    throw new Error(`Event with ID ${eventId} not found in ${tournament}`);
  }

  // Find or create category
  let categoryIndex = event.fights.findIndex(f => f.category === category);
  if (categoryIndex === -1) {
    event.fights.push({ category, matches: [] });
    categoryIndex = event.fights.length - 1;
  }

  // Add match
  event.fights[categoryIndex].matches.push(match);

  // Write back to file
  writeEventFile(tournament, eventId, event);

  return event;
}

// ==================== DELETE OPERATIONS ====================

/**
 * Delete an event by ID
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @param eventId - Event ID
 * @returns The deleted event
 */
export function deleteEvent(tournament: Tournament, eventId: string): EventData {
  const event = getEventById(tournament, eventId);
  if (!event) {
    throw new Error(`Event with ID ${eventId} not found in ${tournament}`);
  }

  // Remove from events list
  const eventsList = readEventsListFile(tournament);
  const index = eventsList.events.indexOf(eventId);
  if (index > -1) {
    eventsList.events.splice(index, 1);
    writeEventsListFile(tournament, eventsList);
  }

  // Delete event file
  deleteEventFile(tournament, eventId);

  return event;
}

// ==================== UTILITY OPERATIONS ====================

/**
 * Get statistics about events in a tournament
 * @param tournament - Tournament name ('ufc' or 'lion')
 * @returns Statistics object
 */
export function getEventStats(tournament: Tournament): {
  total: number;
  byStatus: Record<string, number>;
  totalFights: number;
  byLocation: Record<string, number>;
} {
  const events = getAllEvents(tournament);

  const stats = {
    total: events.length,
    byStatus: {} as Record<string, number>,
    totalFights: 0,
    byLocation: {} as Record<string, number>
  };

  events.forEach(event => {
    // Count by status
    stats.byStatus[event.status] = (stats.byStatus[event.status] || 0) + 1;

    // Count by location
    stats.byLocation[event.location] = (stats.byLocation[event.location] || 0) + 1;

    // Count total fights
    event.fights.forEach(category => {
      stats.totalFights += category.matches.length;
    });
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

  // Helper to format event output
  function formatEvent(event: EventData): string {
    const fightsCount = event.fights.reduce((sum, cat) => sum + cat.matches.length, 0);
    return `${event.id} | ${event.title} | ${event.date} | ${event.location} | ${event.status} | ${fightsCount} fights`;
  }

  // Helper to display usage
  function showUsage(): void {
    console.log(`
${colors.bright}Events Database CLI${colors.reset}
${colors.cyan}Manage event data for UFC and Lion Championship${colors.reset}

${colors.bright}USAGE:${colors.reset}
  node events.js <command> [options]

${colors.bright}COMMANDS:${colors.reset}

  ${colors.green}READ OPERATIONS:${colors.reset}
    list <tournament>
      List all events in a tournament
      Example: node events.js list lion

    get <tournament> <eventId>
      Get a specific event by ID
      Example: node events.js get lion lc28

    ids <tournament>
      List all event IDs
      Example: node events.js ids lion

  ${colors.green}SEARCH OPERATIONS:${colors.reset}
    search <tournament> <json>
      Search events with criteria (JSON object)
      Example: node events.js search lion '{"status":"completed","location":"Phú Quốc"}'
      Criteria: status, location, titleContains

    status <tournament> <status>
      Get events by status (upcoming, completed, live)
      Example: node events.js status lion completed

    upcoming <tournament>
      Get upcoming events
      Example: node events.js upcoming lion

    completed <tournament>
      Get completed events
      Example: node events.js completed lion

  ${colors.green}CREATE OPERATIONS:${colors.reset}
    create <tournament> <json>
      Create a new event (JSON object)
      Example: node events.js create lion '{"id":"lc29","logo":"LC29","title":"Lion Championship 29","date":"08:00 | 15.12.2024","location":"Vietnam","status":"upcoming"}'
      Required: id, logo, title, date, location, status
      Optional: fights

  ${colors.green}UPDATE OPERATIONS:${colors.reset}
    update <tournament> <eventId> <json>
      Update an event (JSON object with fields to update)
      Example: node events.js update lion lc28 '{"status":"completed"}'

    setstatus <tournament> <eventId> <status>
      Update event status
      Example: node events.js setstatus lion lc29 live

  ${colors.green}DELETE OPERATIONS:${colors.reset}
    delete <tournament> <eventId>
      Delete an event by ID
      Example: node events.js delete lion lc29 --confirm

  ${colors.green}UTILITY OPERATIONS:${colors.reset}
    stats <tournament>
      Get statistics for a tournament's events
      Example: node events.js stats lion

    help
      Show this help message

${colors.bright}TOURNAMENTS:${colors.reset}
  ufc   - UFC
  lion  - Lion Championship

${colors.bright}EVENT STATUSES:${colors.reset}
  upcoming   - Event has not occurred yet
  live       - Event is currently happening
  completed  - Event has finished

${colors.bright}EXAMPLES:${colors.reset}
  # List all Lion Championship events
  node events.js list lion

  # Find completed events in a specific location
  node events.js search lion '{"status":"completed","location":"Phú Quốc"}'

  # Create a new event
  node events.js create lion '{"id":"lc29","logo":"LC29","title":"Lion Championship 29","date":"08:00 | 15.12.2024","location":"Vietnam","status":"upcoming"}'

  # Mark event as completed
  node events.js setstatus lion lc29 completed

  # Get event statistics
  node events.js stats lion
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
            print('Usage: node events.js list <tournament>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const events = getAllEvents(tournament);

          printInfo(`\n${tournament.toUpperCase()} Events (${events.length} total):\n`);
          events.forEach(event => {
            console.log(formatEvent(event));
          });
          break;
        }

        case 'get': {
          if (args.length < 3) {
            printError('Missing tournament name or event ID');
            print('Usage: node events.js get <tournament> <eventId>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const eventId = args[2];
          const event = getEventById(tournament, eventId);

          if (event) {
            printInfo('\nEvent Found:');
            console.log(JSON.stringify(event, null, 2));
          } else {
            printWarning(`\nEvent with ID ${eventId} not found in ${tournament}`);
          }
          break;
        }

        case 'ids': {
          if (args.length < 2) {
            printError('Missing tournament name');
            print('Usage: node events.js ids <tournament>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const eventIds = getAllEventIds(tournament);

          printInfo(`\n${tournament.toUpperCase()} Event IDs (${eventIds.length} total):\n`);
          eventIds.forEach(id => console.log(id));
          break;
        }

        // ==================== SEARCH OPERATIONS ====================
        case 'search': {
          if (args.length < 3) {
            printError('Missing tournament name or search criteria');
            print('Usage: node events.js search <tournament> \'{"status":"completed"}\'');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const criteria = parseJSON(args[2]) as EventSearchCriteria;
          const results = searchEvents(tournament, criteria);

          printInfo(`\nSearch Results (${results.length} found):\n`);
          if (results.length === 0) {
            printWarning('No events match the criteria');
          } else {
            results.forEach(event => {
              console.log(formatEvent(event));
            });
          }
          break;
        }

        case 'status': {
          if (args.length < 3) {
            printError('Missing tournament name or status');
            print('Usage: node events.js status <tournament> <status>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const status = args[2] as 'upcoming' | 'completed' | 'live';
          const results = getEventsByStatus(tournament, status);

          printInfo(`\n${status.toUpperCase()} Events - ${tournament.toUpperCase()} (${results.length} events):\n`);
          if (results.length === 0) {
            printWarning(`No ${status} events`);
          } else {
            results.forEach(event => {
              console.log(formatEvent(event));
            });
          }
          break;
        }

        case 'upcoming': {
          if (args.length < 2) {
            printError('Missing tournament name');
            print('Usage: node events.js upcoming <tournament>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const results = getUpcomingEvents(tournament);

          printInfo(`\nUpcoming Events - ${tournament.toUpperCase()} (${results.length} events):\n`);
          if (results.length === 0) {
            printWarning('No upcoming events');
          } else {
            results.forEach(event => {
              console.log(formatEvent(event));
            });
          }
          break;
        }

        case 'completed': {
          if (args.length < 2) {
            printError('Missing tournament name');
            print('Usage: node events.js completed <tournament>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const results = getCompletedEvents(tournament);

          printInfo(`\nCompleted Events - ${tournament.toUpperCase()} (${results.length} events):\n`);
          if (results.length === 0) {
            printWarning('No completed events');
          } else {
            results.forEach(event => {
              console.log(formatEvent(event));
            });
          }
          break;
        }

        // ==================== CREATE OPERATIONS ====================
        case 'create': {
          if (args.length < 3) {
            printError('Missing tournament name or event data');
            print('Usage: node events.js create <tournament> \'{"id":"lc29",...}\'');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const eventData = parseJSON(args[2]) as CreateEventData;
          const newEvent = createEvent(tournament, eventData);

          printSuccess(`\nCreated event with ID ${newEvent.id}:`);
          console.log(JSON.stringify(newEvent, null, 2));
          break;
        }

        // ==================== UPDATE OPERATIONS ====================
        case 'update': {
          if (args.length < 4) {
            printError('Missing tournament name, event ID, or update data');
            print('Usage: node events.js update <tournament> <eventId> \'{"status":"completed"}\'');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const eventId = args[2];
          const updates = parseJSON(args[3]) as Partial<Omit<EventData, 'id'>>;
          const updated = updateEvent(tournament, eventId, updates);

          printSuccess(`\nUpdated event ${eventId}:`);
          console.log(JSON.stringify(updated, null, 2));
          break;
        }

        case 'setstatus': {
          if (args.length < 4) {
            printError('Missing tournament name, event ID, or status');
            print('Usage: node events.js setstatus <tournament> <eventId> <status>');
            print('Example: node events.js setstatus lion lc29 completed');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const eventId = args[2];
          const status = args[3] as 'upcoming' | 'completed' | 'live';
          const updated = updateEventStatus(tournament, eventId, status);

          printSuccess(`\nUpdated status for ${eventId}:`);
          console.log(`  New status: ${updated.status}`);
          break;
        }

        // ==================== DELETE OPERATIONS ====================
        case 'delete': {
          if (args.length < 3) {
            printError('Missing tournament name or event ID');
            print('Usage: node events.js delete <tournament> <eventId> --confirm');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const eventId = args[2];

          // Confirm deletion
          const event = getEventById(tournament, eventId);
          if (!event) {
            printWarning(`\nEvent with ID ${eventId} not found in ${tournament}`);
            process.exit(1);
          }

          printWarning(`\nAbout to delete: ${event.title} (ID: ${eventId})`);

          if (args.includes('--confirm')) {
            const deleted = deleteEvent(tournament, eventId);
            printSuccess(`\nDeleted event: ${deleted.title} (ID: ${deleted.id})`);
          } else {
            printInfo('To confirm deletion, add --confirm flag');
            printInfo(`Example: node events.js delete ${tournament} ${eventId} --confirm`);
          }
          break;
        }

        // ==================== UTILITY OPERATIONS ====================
        case 'stats': {
          if (args.length < 2) {
            printError('Missing tournament name');
            print('Usage: node events.js stats <tournament>');
            process.exit(1);
          }
          const tournament = args[1] as Tournament;
          const stats = getEventStats(tournament);

          printInfo(`\n${tournament.toUpperCase()} Event Statistics:\n`);
          console.log(`Total Events: ${stats.total}`);
          console.log(`Total Fights: ${stats.totalFights}`);

          console.log('\nEvents by Status:');
          Object.entries(stats.byStatus)
            .sort((a, b) => b[1] - a[1])
            .forEach(([status, count]) => {
              console.log(`  ${status.padEnd(15)} ${count}`);
            });

          console.log('\nEvents by Location:');
          Object.entries(stats.byLocation)
            .sort((a, b) => b[1] - a[1])
            .forEach(([location, count]) => {
              console.log(`  ${location.padEnd(50)} ${count}`);
            });
          break;
        }

        default:
          printError(`Unknown command: ${command}`);
          print('\nRun "node events.js help" for usage information');
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
