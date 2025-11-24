import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';
const DATA_PATH = path.join(__dirname, '../web/public/data/promotions');
const TOURNAMENT = process.argv[2] || process.env.TOURNAMENT || 'lion';

// Types matching the JSON structure
interface WebFighter {
  name: string;
  stats: string;
  flag: string;
  winner: boolean;
}

interface WebMatch {
  round: string;
  fighter1: WebFighter;
  fighter2: WebFighter;
}

interface WebCategory {
  category: string;
  matches: WebMatch[];
}

interface WebEvent {
  id: string;
  logo: string;
  title: string;
  date: string;
  location: string;
  status: string;
  fights: WebCategory[];
}

// Service API types
interface ServiceEvent {
  id: string;
  tournament: string;
  name: string;
  date?: string;
  location?: string;
  venue?: string;
  status?: string;
}

interface ServiceMatch {
  event_id: string;
  category?: string;
  fighter1_name: string;
  fighter1_flag?: string;
  fighter2_name: string;
  fighter2_flag?: string;
  weight_class?: string;
  winner?: number;
  round?: string;
}

// Validation result types
interface ValidationResult {
  success: boolean;
  eventId: string;
  errors: string[];
  warnings: string[];
}

interface MigrationStats {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  totalMatches: number;
  successfulMatches: number;
  failedMatches: number;
}

class EventMigration {
  private stats: MigrationStats = {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    totalMatches: 0,
    successfulMatches: 0,
    failedMatches: 0,
  };

  private validationResults: ValidationResult[] = [];

  /**
   * Get all event JSON files for the tournament
   */
  private getEventFiles(): string[] {
    const eventsPath = path.join(DATA_PATH, TOURNAMENT, 'events');

    if (!fs.existsSync(eventsPath)) {
      throw new Error(`Events directory not found: ${eventsPath}`);
    }

    const files = fs.readdirSync(eventsPath)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(eventsPath, file));

    console.log(`=� Found ${files.length} event files for ${TOURNAMENT}`);
    return files;
  }

  /**
   * Read and parse event JSON file
   */
  private readEventFile(filePath: string): WebEvent {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as WebEvent;
  }

  /**
   * Extract weight class from fighter stats
   * Lion format: "Trận 3 | 185 lbs - Nam" -> "185 lbs"
   * UFC format: "Heavyweight Champion" -> "Heavyweight"
   */
  private extractWeightClass(stats: string): string | undefined {
    // Try Lion format first (numeric weight)
    const numericMatch = stats.match(/(\d+)\s*lbs/);
    if (numericMatch) {
      return `${numericMatch[1]} lbs`;
    }

    // Try UFC format (weight class names)
    const weightClasses = [
      'Heavyweight', 'Light Heavyweight', 'Middleweight',
      'Welterweight', 'Lightweight', 'Featherweight',
      'Bantamweight', 'Flyweight', 'Strawweight'
    ];

    for (const weightClass of weightClasses) {
      if (stats.includes(weightClass)) {
        return weightClass;
      }
    }

    return undefined;
  }

  /**
   * Parse date from various formats to ISO-8601
   * Lion format: "19:00 | 10.05.2025"
   * UFC format: "November 16, 2024"
   */
  private parseDate(dateStr: string): string {
    try {
      // Lion format: "19:00 | 10.05.2025"
      const parts = dateStr.split('|');
      if (parts.length === 2) {
        const datePart = parts[1].trim();
        const [day, month, year] = datePart.split('.');
        const time = parts[0].trim();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}:00`;
      }
    } catch (error) {
      // Continue to UFC format
    }

    // UFC format: "November 16, 2024" or other standard date strings
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // Return YYYY-MM-DD
      }
    } catch (error) {
      console.warn(`⚠️  Failed to parse date: ${dateStr}`);
    }

    return dateStr;
  }

  /**
   * Transform web event to service event format
   */
  private transformEvent(webEvent: WebEvent): ServiceEvent {
    return {
      id: webEvent.id,
      tournament: TOURNAMENT,
      name: webEvent.title,
      date: this.parseDate(webEvent.date),
      location: webEvent.location,
      status: webEvent.status,
    };
  }

  /**
   * Transform web matches to service match format
   */
  private transformMatches(webEvent: WebEvent): ServiceMatch[] {
    const matches: ServiceMatch[] = [];

    for (const fight of webEvent.fights) {
      for (const match of fight.matches) {
        const weightClass = this.extractWeightClass(match.fighter1.stats) ||
                          this.extractWeightClass(match.fighter2.stats);

        const serviceMatch: ServiceMatch = {
          event_id: webEvent.id,
          category: fight.category,
          fighter1_name: match.fighter1.name,
          fighter1_flag: match.fighter1.flag,
          fighter2_name: match.fighter2.name,
          fighter2_flag: match.fighter2.flag,
          weight_class: weightClass,
          winner: match.fighter1.winner ? 1 : (match.fighter2.winner ? 2 : undefined),
          round: match.round,
        };

        matches.push(serviceMatch);
      }
    }

    return matches;
  }

  /**
   * Post event to service API
   */
  private async postEvent(event: ServiceEvent): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/events`, event);
      console.log(` Created event: ${event.id} (${event.name})`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`L Failed to create event ${event.id}:`, error.response?.data || error.message);
      } else {
        console.error(`L Failed to create event ${event.id}:`, error);
      }
      return false;
    }
  }

  /**
   * Post match to service API
   */
  private async postMatch(match: ServiceMatch): Promise<boolean> {
    try {
      await axios.post(`${API_BASE_URL}/api/events/${match.event_id}/matches`, match);
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(`❌ Failed to create match for event ${match.event_id}:`, error.response?.data || error.message);
      } else {
        console.error(`❌ Failed to create match for event ${match.event_id}:`, error);
      }
      return false;
    }
  }

  /**
   * Validate migrated data
   */
  private async validateEvent(webEvent: WebEvent): Promise<ValidationResult> {
    const result: ValidationResult = {
      success: true,
      eventId: webEvent.id,
      errors: [],
      warnings: [],
    };

    try {
      // Fetch event from service
      const eventResponse = await axios.get(`${API_BASE_URL}/api/events/${webEvent.id}`);
      const { event, matches } = eventResponse.data;

      // Validate event fields
      if (event.name !== webEvent.title) {
        result.errors.push(`Event name mismatch: expected "${webEvent.title}", got "${event.name}"`);
      }

      if (event.tournament !== TOURNAMENT) {
        result.errors.push(`Tournament mismatch: expected "${TOURNAMENT}", got "${event.tournament}"`);
      }

      if (event.location !== webEvent.location) {
        result.warnings.push(`Location mismatch: expected "${webEvent.location}", got "${event.location}"`);
      }

      if (event.status !== webEvent.status) {
        result.warnings.push(`Status mismatch: expected "${webEvent.status}", got "${event.status}"`);
      }

      // Count expected matches
      const expectedMatchCount = webEvent.fights.reduce((total, fight) => total + fight.matches.length, 0);

      if (matches.length !== expectedMatchCount) {
        result.errors.push(`Match count mismatch: expected ${expectedMatchCount}, got ${matches.length}`);
      }

      // Validate each match
      for (const fight of webEvent.fights) {
        for (const webMatch of fight.matches) {
          const serviceMatch = matches.find(
            (m: any) => m.fighter1_name === webMatch.fighter1.name &&
                       m.fighter2_name === webMatch.fighter2.name
          );

          if (!serviceMatch) {
            result.errors.push(`Match not found: ${webMatch.fighter1.name} vs ${webMatch.fighter2.name}`);
            continue;
          }

          // Validate winner
          const expectedWinner = webMatch.fighter1.winner ? 1 : (webMatch.fighter2.winner ? 2 : null);
          if (serviceMatch.winner !== expectedWinner) {
            result.errors.push(
              `Winner mismatch for ${webMatch.fighter1.name} vs ${webMatch.fighter2.name}: ` +
              `expected ${expectedWinner}, got ${serviceMatch.winner}`
            );
          }

          // Validate flags
          if (serviceMatch.fighter1_flag !== webMatch.fighter1.flag) {
            result.warnings.push(
              `Fighter1 flag mismatch for ${webMatch.fighter1.name}: ` +
              `expected "${webMatch.fighter1.flag}", got "${serviceMatch.fighter1_flag}"`
            );
          }

          if (serviceMatch.fighter2_flag !== webMatch.fighter2.flag) {
            result.warnings.push(
              `Fighter2 flag mismatch for ${webMatch.fighter2.name}: ` +
              `expected "${webMatch.fighter2.flag}", got "${serviceMatch.fighter2_flag}"`
            );
          }
        }
      }

      result.success = result.errors.length === 0;

    } catch (error: unknown) {
      result.success = false;
      if (axios.isAxiosError(error)) {
        result.errors.push(`API error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      } else {
        result.errors.push(`Validation error: ${String(error)}`);
      }
    }

    return result;
  }

  /**
   * Migrate a single event
   */
  private async migrateEvent(filePath: string): Promise<void> {
    try {
      console.log(`\n📄 Processing: ${path.basename(filePath)}`);

      // Read and parse
      const webEvent = this.readEventFile(filePath);
      this.stats.totalEvents++;

      // Transform
      const serviceEvent = this.transformEvent(webEvent);
      const serviceMatches = this.transformMatches(webEvent);
      this.stats.totalMatches += serviceMatches.length;

      console.log(`   Event: ${serviceEvent.name}`);
      console.log(`   Matches: ${serviceMatches.length}`);

      // Post event
      const eventSuccess = await this.postEvent(serviceEvent);
      if (!eventSuccess) {
        this.stats.failedEvents++;
        return;
      }
      this.stats.successfulEvents++;

      // Post matches
      let matchSuccessCount = 0;
      for (const match of serviceMatches) {
        const success = await this.postMatch(match);
        if (success) {
          matchSuccessCount++;
          this.stats.successfulMatches++;
        } else {
          this.stats.failedMatches++;
        }
      }

      console.log(`    Migrated ${matchSuccessCount}/${serviceMatches.length} matches`);

      // Validate
      const validation = await this.validateEvent(webEvent);
      this.validationResults.push(validation);

      if (!validation.success) {
        console.log(`   �  Validation failed with ${validation.errors.length} errors`);
      } else if (validation.warnings.length > 0) {
        console.log(`   �  Validation passed with ${validation.warnings.length} warnings`);
      } else {
        console.log(`    Validation passed`);
      }

    } catch (error: unknown) {
      console.error(`❌ Error processing ${path.basename(filePath)}:`, error);
      this.stats.failedEvents++;
    }
  }

  /**
   * Print validation report
   */
  private printValidationReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('=� VALIDATION REPORT');
    console.log('='.repeat(80));

    const failedValidations = this.validationResults.filter(r => !r.success);
    const validationsWithWarnings = this.validationResults.filter(r => r.success && r.warnings.length > 0);

    console.log(`\n Passed: ${this.validationResults.filter(r => r.success && r.warnings.length === 0).length}`);
    console.log(`�  Passed with warnings: ${validationsWithWarnings.length}`);
    console.log(`L Failed: ${failedValidations.length}`);

    if (failedValidations.length > 0) {
      console.log('\nL FAILED VALIDATIONS:');
      for (const result of failedValidations) {
        console.log(`\n  Event: ${result.eventId}`);
        result.errors.forEach(error => console.log(`    - ${error}`));
      }
    }

    if (validationsWithWarnings.length > 0) {
      console.log('\n�  WARNINGS:');
      for (const result of validationsWithWarnings) {
        console.log(`\n  Event: ${result.eventId}`);
        result.warnings.forEach(warning => console.log(`    - ${warning}`));
      }
    }
  }

  /**
   * Print migration summary
   */
  private printSummary(): void {
    console.log('\n' + '='.repeat(80));
    console.log('=� MIGRATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nEvents:`);
    console.log(`  Total:      ${this.stats.totalEvents}`);
    console.log(`  Successful: ${this.stats.successfulEvents}`);
    console.log(`  Failed:     ${this.stats.failedEvents}`);
    console.log(`\nMatches:`);
    console.log(`  Total:      ${this.stats.totalMatches}`);
    console.log(`  Successful: ${this.stats.successfulMatches}`);
    console.log(`  Failed:     ${this.stats.failedMatches}`);
    console.log('\n' + '='.repeat(80));
  }

  /**
   * Check if service is running
   */
  private async checkService(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log(` Service is running: ${response.data.status}`);
      return true;
    } catch (error: unknown) {
      console.error(`❌ Service is not running at ${API_BASE_URL}`);
      console.error(`   Please start the service with: cd service && npm run dev`);
      return false;
    }
  }

  /**
   * Run the migration
   */
  async run(): Promise<void> {
    console.log('=� Starting Event Migration');
    console.log(`   Source: ${path.join(DATA_PATH, TOURNAMENT, 'events')}`);
    console.log(`   Target: ${API_BASE_URL}/api/events`);
    console.log(`   Tournament: ${TOURNAMENT.toUpperCase()}`);

    // Check if service is running
    if (!await this.checkService()) {
      process.exit(1);
    }

    try {
      // Get all event files
      const eventFiles = this.getEventFiles();

      // Migrate each event
      for (const filePath of eventFiles) {
        await this.migrateEvent(filePath);
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Print reports
      this.printSummary();
      this.printValidationReport();

      // Exit with appropriate code
      const hasFailures = this.stats.failedEvents > 0 ||
                         this.validationResults.some(r => !r.success);

      if (hasFailures) {
        console.log('\n❌ Migration completed with errors');
        process.exit(1);
      } else {
        console.log('\n Migration completed successfully');
        process.exit(0);
      }

    } catch (error: unknown) {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  const migration = new EventMigration();
  migration.run().catch((error: unknown) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default EventMigration;
