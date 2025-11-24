import db from '../config/database';
import { Athlete } from '../types';

export class AthleteModel {
  static getAll(tournament: string, filters?: { division?: string; gender?: string; search?: string }): Athlete[] {
    let query = 'SELECT * FROM athletes WHERE tournament = ?';
    const params: any[] = [tournament];

    if (filters?.division) {
      query += ' AND division = ?';
      params.push(filters.division);
    }

    if (filters?.gender) {
      query += ' AND gender = ?';
      params.push(filters.gender);
    }

    if (filters?.search) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY name ASC';

    const stmt = db.prepare(query);
    return stmt.all(...params) as Athlete[];
  }

  static getById(id: number): Athlete | undefined {
    const stmt = db.prepare('SELECT * FROM athletes WHERE id = ?');
    return stmt.get(id) as Athlete | undefined;
  }

  static create(athlete: Athlete): number {
    const stmt = db.prepare(`
      INSERT INTO athletes (name, tournament, division, country, flag, gender, wins, losses, draws, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      athlete.image_url || null
    );

    return result.lastInsertRowid as number;
  }

  static update(id: number, athlete: Partial<Athlete>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(athlete).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
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
    return stmt.get(name, tournament) as Athlete | undefined;
  }
}
