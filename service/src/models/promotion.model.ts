import db from '../config/database';
import { Promotion } from '../types';

export class PromotionModel {
  static getAll(): Promotion[] {
    const stmt = db.prepare('SELECT * FROM promotions ORDER BY name ASC');
    const rows = stmt.all() as any[];

    return rows.map(row => ({
      ...row,
      events: JSON.parse(row.events)
    }));
  }

  static getById(id: string): Promotion | undefined {
    const stmt = db.prepare('SELECT * FROM promotions WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return undefined;

    return {
      ...row,
      events: JSON.parse(row.events)
    };
  }

  static create(promotion: Promotion): string {
    const stmt = db.prepare(`
      INSERT INTO promotions (id, name, subtitle, theme, color, events)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      promotion.id,
      promotion.name,
      promotion.subtitle,
      promotion.theme,
      promotion.color,
      JSON.stringify(promotion.events || [])
    );

    return promotion.id;
  }

  static update(id: string, promotion: Partial<Promotion>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(promotion).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        if (key === 'events') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE promotions SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM promotions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static addEvent(id: string, eventId: string): boolean {
    const promotion = this.getById(id);
    if (!promotion) return false;

    if (!promotion.events.includes(eventId)) {
      promotion.events.push(eventId);
      return this.update(id, { events: promotion.events });
    }

    return true;
  }

  static removeEvent(id: string, eventId: string): boolean {
    const promotion = this.getById(id);
    if (!promotion) return false;

    const index = promotion.events.indexOf(eventId);
    if (index > -1) {
      promotion.events.splice(index, 1);
      return this.update(id, { events: promotion.events });
    }

    return true;
  }
}
