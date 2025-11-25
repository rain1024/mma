import db from '../config/database';
import { Promotion, Event } from '../types';

export class PromotionModel {
  static getAll(): Promotion[] {
    const stmt = db.prepare('SELECT * FROM promotions ORDER BY name ASC');
    return stmt.all() as Promotion[];
  }

  static getById(id: string): Promotion | undefined {
    const stmt = db.prepare('SELECT * FROM promotions WHERE id = ?');
    return stmt.get(id) as Promotion | undefined;
  }

  static create(promotion: Promotion): string {
    const stmt = db.prepare(`
      INSERT INTO promotions (id, name, subtitle, theme, color)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      promotion.id,
      promotion.name,
      promotion.subtitle,
      promotion.theme,
      promotion.color
    );

    return promotion.id;
  }

  static update(id: string, promotion: Partial<Promotion>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(promotion).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
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

  static getEvents(promotionId: string): Event[] {
    const stmt = db.prepare('SELECT * FROM events WHERE promotion_id = ? ORDER BY date DESC');
    return stmt.all(promotionId) as Event[];
  }
}
