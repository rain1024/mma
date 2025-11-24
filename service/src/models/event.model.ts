import db from '../config/database';
import { Event, Match } from '../types';

export class EventModel {
  static getAll(tournament: string): Event[] {
    const stmt = db.prepare('SELECT * FROM events WHERE tournament = ? ORDER BY date DESC');
    return stmt.all(tournament) as Event[];
  }

  static getById(id: string): Event | undefined {
    const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
    return stmt.get(id) as Event | undefined;
  }

  static create(event: Event): string {
    const stmt = db.prepare(`
      INSERT INTO events (id, tournament, name, date, location, venue, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      event.id,
      event.tournament,
      event.name,
      event.date || null,
      event.location || null,
      event.venue || null,
      event.status || null
    );

    return event.id;
  }

  static update(id: string, event: Partial<Event>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(event).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM events WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getMatches(eventId: string): Match[] {
    const stmt = db.prepare('SELECT * FROM matches WHERE event_id = ? ORDER BY id ASC');
    return stmt.all(eventId) as Match[];
  }
}
