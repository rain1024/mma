import db from '../config/database';
import { Match } from '../types';

export class MatchModel {
  static getAll(eventId?: string): Match[] {
    if (eventId) {
      const stmt = db.prepare('SELECT * FROM matches WHERE event_id = ? ORDER BY id ASC');
      return stmt.all(eventId) as Match[];
    }
    const stmt = db.prepare('SELECT * FROM matches ORDER BY event_id, id ASC');
    return stmt.all() as Match[];
  }

  static getById(id: number): Match | undefined {
    const stmt = db.prepare('SELECT * FROM matches WHERE id = ?');
    return stmt.get(id) as Match | undefined;
  }

  static create(match: Match): number {
    const stmt = db.prepare(`
      INSERT INTO matches (
        event_id, category,
        fighter1_id, fighter1_name, fighter1_country, fighter1_flag,
        fighter2_id, fighter2_name, fighter2_country, fighter2_flag,
        weight_class, winner, method, round, time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      match.event_id,
      match.category || null,
      match.fighter1_id || null,
      match.fighter1_name,
      match.fighter1_country || null,
      match.fighter1_flag || null,
      match.fighter2_id || null,
      match.fighter2_name,
      match.fighter2_country || null,
      match.fighter2_flag || null,
      match.weight_class || null,
      match.winner || null,
      match.method || null,
      match.round || null,
      match.time || null
    );

    return result.lastInsertRowid as number;
  }

  static update(id: number, match: Partial<Match>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(match).forEach(([key, value]) => {
      if (key !== 'id' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);

    const stmt = db.prepare(`UPDATE matches SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM matches WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
