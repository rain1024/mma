import db from '../config/database';
import fs from 'fs';
import path from 'path';

interface JsonAthlete {
  id: number;
  name: string;
  record: string;
  nickname: string;
  division: string;
  country: string;
  flag: string;
  gender?: string;
  urls?: { link: string; type: string }[];
  alternativeNames?: string[];
}

interface JsonRankings {
  pfpRankings: { rank: number; name: string; record: string; move: string }[];
  divisions: {
    [key: string]: {
      champion: { name: string; record: string; country?: string; flag?: string };
      rankings: { rank: number; name: string; record: string; move: string }[];
    };
  };
}

interface JsonPromotion {
  id: string;
  name: string;
  subtitle: string;
  theme: string;
  color: string;
  events: string[];
}

interface JsonFighter {
  name: string;
  link?: string;
  stats?: string;
  flag: string;
  winner: boolean;
}

interface JsonMatch {
  round?: string;
  fighter1: JsonFighter;
  fighter2: JsonFighter;
}

interface JsonFightCategory {
  category: string;
  matches: JsonMatch[];
}

interface JsonEvent {
  id: string;
  logo?: string;
  title: string;
  date: string;
  location: string;
  status: string;
  fights: JsonFightCategory[];
}

function parseRecord(record: string): { wins: number; losses: number; draws: number } {
  const match = record.match(/(\d+)-(\d+)-(\d+)/);
  if (match) {
    return {
      wins: parseInt(match[1], 10),
      losses: parseInt(match[2], 10),
      draws: parseInt(match[3], 10)
    };
  }
  return { wins: 0, losses: 0, draws: 0 };
}

function readJsonFile<T>(filePath: string): T {
  const fullPath = path.join(__dirname, '../../..', filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(content);
}

export function seedPromotions() {
  console.log('🔄 Seeding promotions...');

  const promotions = ['lion', 'ufc'];

  for (const promotionId of promotions) {
    try {
      const promotion = readJsonFile<JsonPromotion>(`service/data/seed/${promotionId}/promotion.json`);

      // Check if promotion already exists
      const existing = db.prepare('SELECT id FROM promotions WHERE id = ?').get(promotionId);

      if (!existing) {
        db.prepare(`
          INSERT INTO promotions (id, name, subtitle, theme, color)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          promotion.id,
          promotion.name,
          promotion.subtitle,
          promotion.theme,
          promotion.color
        );
        console.log(`  ✅ Added promotion: ${promotion.name}`);
      } else {
        console.log(`  ⏭️ Promotion already exists: ${promotionId}`);
      }
    } catch (error) {
      console.error(`  ❌ Error seeding promotion ${promotionId}:`, error);
    }
  }
}

export function seedAthletes(promotionId: string) {
  console.log(`🔄 Seeding athletes for ${promotionId}...`);

  try {
    const data = readJsonFile<{ athletes: JsonAthlete[] }>(`service/data/seed/${promotionId}/athletes.json`);
    const athletes = data.athletes;

    let added = 0;
    let skipped = 0;

    for (const athlete of athletes) {
      // Check if athlete already exists by name and tournament
      const existing = db.prepare(
        'SELECT id FROM athletes WHERE name = ? AND tournament = ?'
      ).get(athlete.name, promotionId);

      if (!existing) {
        const { wins, losses, draws } = parseRecord(athlete.record);

        db.prepare(`
          INSERT INTO athletes (name, tournament, division, country, flag, gender, wins, losses, draws)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          athlete.name,
          promotionId,
          athlete.division || null,
          athlete.country || null,
          athlete.flag || null,
          athlete.gender || 'male',
          wins,
          losses,
          draws
        );
        added++;
      } else {
        skipped++;
      }
    }

    console.log(`  ✅ Added ${added} athletes, skipped ${skipped} existing`);
  } catch (error) {
    console.error(`  ❌ Error seeding athletes for ${promotionId}:`, error);
  }
}

export function seedEvents(promotionId: string) {
  console.log(`🔄 Seeding events for ${promotionId}...`);

  try {
    const promotion = readJsonFile<JsonPromotion>(`service/data/seed/${promotionId}/promotion.json`);
    const eventIds = promotion.events || [];

    let eventsAdded = 0;
    let matchesAdded = 0;

    for (const eventId of eventIds) {
      try {
        const eventData = readJsonFile<JsonEvent>(`service/data/seed/${promotionId}/events/${eventId}.json`);

        // Check if event already exists
        const existing = db.prepare('SELECT id FROM events WHERE id = ?').get(eventId);

        if (!existing) {
          // Insert event
          db.prepare(`
            INSERT INTO events (id, promotion_id, name, date, location, status)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            eventData.id,
            promotionId,
            eventData.title,
            eventData.date || null,
            eventData.location || null,
            eventData.status || null
          );
          eventsAdded++;

          // Insert matches for this event
          for (const fightCategory of eventData.fights) {
            for (const match of fightCategory.matches) {
              // Determine winner: 1 = fighter1, 2 = fighter2, null = no winner/draw
              let winner: number | null = null;
              if (match.fighter1.winner) winner = 1;
              else if (match.fighter2.winner) winner = 2;

              db.prepare(`
                INSERT INTO matches (event_id, category, fighter1_name, fighter1_flag, fighter2_name, fighter2_flag, winner)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `).run(
                eventData.id,
                fightCategory.category,
                match.fighter1.name,
                match.fighter1.flag || null,
                match.fighter2.name,
                match.fighter2.flag || null,
                winner
              );
              matchesAdded++;
            }
          }
        }
      } catch (error) {
        // Event file might not exist, skip
        console.log(`  ⚠️ Could not load event ${eventId}`);
      }
    }

    console.log(`  ✅ Added ${eventsAdded} events with ${matchesAdded} matches`);
  } catch (error) {
    console.error(`  ❌ Error seeding events for ${promotionId}:`, error);
  }
}

export function seedRankings(promotionId: string) {
  console.log(`🔄 Seeding rankings for ${promotionId}...`);

  try {
    const rankings = readJsonFile<JsonRankings>(`service/data/seed/${promotionId}/rankings.json`);

    // Clear existing rankings for this tournament
    db.prepare('DELETE FROM rankings WHERE tournament = ?').run(promotionId);
    db.prepare('DELETE FROM p4p_rankings WHERE tournament = ?').run(promotionId);

    // Seed P4P rankings
    for (const p4p of rankings.pfpRankings) {
      // Try to find athlete_id
      const athlete = db.prepare(
        'SELECT id FROM athletes WHERE name = ? AND tournament = ?'
      ).get(p4p.name, promotionId) as { id: number } | undefined;

      db.prepare(`
        INSERT INTO p4p_rankings (tournament, rank, athlete_id, athlete_name)
        VALUES (?, ?, ?, ?)
      `).run(
        promotionId,
        p4p.rank,
        athlete?.id || null,
        p4p.name
      );
    }
    console.log(`  ✅ Added ${rankings.pfpRankings.length} P4P rankings`);

    // Seed division rankings
    let divisionCount = 0;
    for (const [division, divisionData] of Object.entries(rankings.divisions)) {
      // Add champion
      const champion = divisionData.champion;
      const championAthlete = db.prepare(
        'SELECT id FROM athletes WHERE name = ? AND tournament = ?'
      ).get(champion.name, promotionId) as { id: number } | undefined;

      db.prepare(`
        INSERT INTO rankings (tournament, division, rank, athlete_id, athlete_name, is_champion)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        promotionId,
        division,
        0, // Champion is rank 0
        championAthlete?.id || null,
        champion.name,
        1 // is_champion = true
      );

      // Add division rankings
      for (const ranked of divisionData.rankings) {
        const rankedAthlete = db.prepare(
          'SELECT id FROM athletes WHERE name = ? AND tournament = ?'
        ).get(ranked.name, promotionId) as { id: number } | undefined;

        db.prepare(`
          INSERT INTO rankings (tournament, division, rank, athlete_id, athlete_name, is_champion)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          promotionId,
          division,
          ranked.rank,
          rankedAthlete?.id || null,
          ranked.name,
          0 // is_champion = false
        );
      }

      divisionCount++;
    }
    console.log(`  ✅ Added rankings for ${divisionCount} divisions`);

  } catch (error) {
    console.error(`  ❌ Error seeding rankings for ${promotionId}:`, error);
  }
}

export function seedAllData() {
  console.log('🚀 Starting data seed...\n');

  // Seed promotions first
  seedPromotions();

  // Seed athletes for each promotion
  const promotions = ['lion', 'ufc'];
  for (const promotionId of promotions) {
    seedAthletes(promotionId);
  }

  // Seed events for each promotion
  for (const promotionId of promotions) {
    seedEvents(promotionId);
  }

  // Seed rankings for each promotion
  for (const promotionId of promotions) {
    seedRankings(promotionId);
  }

  console.log('\n✅ Data seed completed!');
}

// Run if executed directly
if (require.main === module) {
  seedAllData();
  db.close();
}
