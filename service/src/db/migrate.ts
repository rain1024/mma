import db from '../config/database';
import fs from 'fs';
import path from 'path';

export function runMigrations() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Enable foreign keys
    db.exec('PRAGMA foreign_keys = ON');

    // Execute schema
    db.exec(schema);

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    throw error;
  }
}

export function resetDatabase() {
  console.log('🔄 Resetting database...');

  try {
    // Disable foreign key checks temporarily
    db.exec('PRAGMA foreign_keys = OFF');

    // Drop all tables in correct order (respecting dependencies)
    const tables = [
      'p4p_rankings',
      'rankings',
      'matches',
      'events',
      'athletes',
      'promotions'
    ];

    for (const table of tables) {
      try {
        db.exec(`DROP TABLE IF EXISTS ${table}`);
        console.log(`  Dropped table: ${table}`);
      } catch (error) {
        console.error(`  Error dropping ${table}:`, error);
      }
    }

    // Re-enable foreign keys
    db.exec('PRAGMA foreign_keys = ON');

    // Run migrations to recreate schema
    runMigrations();

    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--reset')) {
    resetDatabase();
  } else {
    runMigrations();
  }

  console.log('Database initialized at:', db.name);
  db.close();
}
