import db from '../config/database';
import { Athlete } from '../types';

// Helper to parse JSON fields from database
function parseAthleteFromDb(row: Record<string, unknown>): Athlete {
  return {
    ...row,
    alternativeNames: row.alternative_names ? JSON.parse(row.alternative_names as string) : undefined,
    urls: row.urls ? JSON.parse(row.urls as string) : undefined,
  } as Athlete;
}

export class AthleteModel {
  static getAll(tournament: string, filters?: { division?: string; gender?: string; search?: string }): Athlete[] {
    let query = 'SELECT * FROM athletes WHERE tournament = ?';
    const params: (string | number)[] = [tournament];

    if (filters?.division) {
      query += ' AND division = ?';
      params.push(filters.division);
    }

    if (filters?.gender) {
      query += ' AND gender = ?';
      params.push(filters.gender);
    }

    if (filters?.search) {
      query += ' AND (name LIKE ? OR alternative_names LIKE ?)';
      params.push(`%${filters.search}%`);
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY name ASC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as Record<string, unknown>[];
    return rows.map(parseAthleteFromDb);
  }

  static getById(id: number): Athlete | undefined {
    const stmt = db.prepare('SELECT * FROM athletes WHERE id = ?');
    const row = stmt.get(id) as Record<string, unknown> | undefined;
    return row ? parseAthleteFromDb(row) : undefined;
  }

  static create(athlete: Athlete): number {
    const stmt = db.prepare(`
      INSERT INTO athletes (name, tournament, division, country, flag, gender, wins, losses, draws, nickname, image_url, alternative_names, urls)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      athlete.name,
      athlete.tournament,
      athlete.division || null,
      athlete.country || null,
      athlete.flag || null,
      athlete.gender || null,
      athlete.wins || 0,
      athlete.losses || 0,
      athlete.draws || 0,
      athlete.nickname || null,
      athlete.image_url || null,
      athlete.alternativeNames ? JSON.stringify(athlete.alternativeNames) : null,
      athlete.urls ? JSON.stringify(athlete.urls) : null
    );

    return result.lastInsertRowid as number;
  }

  static update(id: number, athlete: Partial<Athlete>): boolean {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    // Map of JS property names to DB column names
    const columnMap: Record<string, string> = {
      alternativeNames: 'alternative_names',
    };

    // Fields that need JSON serialization
    const jsonFields = ['alternativeNames', 'urls'];

    Object.entries(athlete).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        const columnName = columnMap[key] || key;
        fields.push(`${columnName} = ?`);

        // Serialize JSON fields
        if (jsonFields.includes(key) && value !== null) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value as string | number | null);
        }
      }
    });

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE athletes SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM athletes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static findByName(name: string, tournament: string): Athlete | undefined {
    const stmt = db.prepare('SELECT * FROM athletes WHERE name = ? AND tournament = ?');
    const row = stmt.get(name, tournament) as Record<string, unknown> | undefined;
    return row ? parseAthleteFromDb(row) : undefined;
  }
}
