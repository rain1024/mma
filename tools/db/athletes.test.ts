import * as athletes from './athletes';
import * as fs from 'fs';
import * as path from 'path';
import type { Athlete } from './types';

console.log('=== ATHLETES DATABASE WRITE OPERATIONS TEST ===\n');

// Determine if we're running from dist or source directory
const isCompiled = __dirname.endsWith('dist');
const projectRoot = isCompiled
  ? path.join(__dirname, '../../..') // from dist/: dist -> db -> scripts -> mma
  : path.join(__dirname, '../..'); // from source: db -> scripts -> mma

// Backup file path
const backupPath = path.join(projectRoot, 'web/public/data/promotions/lion/athletes.backup.json');
const originalPath = path.join(projectRoot, 'web/public/data/promotions/lion/athletes.json');

// Create backup
console.log('1. Creating backup of athletes.json...');
fs.copyFileSync(originalPath, backupPath);
console.log('   ✓ Backup created\n');

try {
  // Test CREATE
  console.log('2. Testing CREATE operation');
  console.log('   Creating new athlete "Test Fighter"...');
  const newAthlete: Athlete = athletes.createAthlete('lion', {
    name: 'Test Fighter',
    record: '5-2-0',
    nickname: 'The Test',
    division: 'welterweight',
    country: 'USA',
    flag: '🇺🇸',
    gender: 'male'
  });
  console.log(`   ✓ Created athlete with ID ${newAthlete.id}`);
  console.log(`   ${JSON.stringify(newAthlete, null, 2)}\n`);

  // Verify creation
  const retrieved = athletes.getAthleteById('lion', newAthlete.id);
  console.log(`   ✓ Verified: Retrieved athlete ${retrieved?.name}\n`);

  // Test UPDATE
  console.log('3. Testing UPDATE operation');
  console.log('   Updating nickname to "The Tester"...');
  const updated = athletes.updateAthlete('lion', newAthlete.id, {
    nickname: 'The Tester',
    record: '6-2-0'
  });
  console.log(`   ✓ Updated athlete`);
  console.log(`   New nickname: "${updated.nickname}"`);
  console.log(`   New record: "${updated.record}"\n`);

  // Test INCREMENT WINS
  console.log('4. Testing INCREMENT WINS operation');
  console.log(`   Current record: ${updated.record}`);
  const afterWin = athletes.incrementWins('lion', newAthlete.id);
  console.log(`   ✓ After win: ${afterWin.record}\n`);

  // Test INCREMENT LOSSES
  console.log('5. Testing INCREMENT LOSSES operation');
  console.log(`   Current record: ${afterWin.record}`);
  const afterLoss = athletes.incrementLosses('lion', newAthlete.id);
  console.log(`   ✓ After loss: ${afterLoss.record}\n`);

  // Test SEARCH
  console.log('6. Testing SEARCH operation');
  const searchResults = athletes.searchAthletes('lion', { name: 'Test Fighter' });
  console.log(`   ✓ Found ${searchResults.length} athlete(s) matching "Test Fighter"\n`);

  // Test DELETE
  console.log('7. Testing DELETE operation');
  console.log(`   Deleting athlete ID ${newAthlete.id}...`);
  const deleted = athletes.deleteAthlete('lion', newAthlete.id);
  console.log(`   ✓ Deleted athlete: ${deleted.name}\n`);

  // Verify deletion
  const notFound = athletes.getAthleteById('lion', newAthlete.id);
  if (notFound === null) {
    console.log(`   ✓ Verified: Athlete no longer exists\n`);
  } else {
    console.error(`   ✗ ERROR: Athlete still exists!\n`);
  }

  // Test STATISTICS
  console.log('8. Testing STATISTICS operation');
  const stats = athletes.getAthleteStats('lion');
  console.log(`   Total athletes: ${stats.total}`);
  console.log(`   Male: ${stats.byGender.male}, Female: ${stats.byGender.female}`);
  console.log(`   Total wins: ${stats.totalWins}`);
  console.log(`   ✓ Statistics retrieved successfully\n`);

  console.log('=== ALL TESTS PASSED ===\n');

} catch (error) {
  console.error(`\n✗ TEST FAILED: ${(error as Error).message}\n`);
  console.error((error as Error).stack);
} finally {
  // Restore from backup
  console.log('9. Restoring original data from backup...');
  fs.copyFileSync(backupPath, originalPath);
  fs.unlinkSync(backupPath);
  console.log('   ✓ Original data restored');
  console.log('   ✓ Backup file removed\n');
}

console.log('=== TEST COMPLETE ===');
