import db from '../config/database';
import { Ranking, P4PRanking } from '../types';

export class RankingModel {
  static getByDivision(tournament: string, division: string): Ranking[] {
    const stmt = db.prepare(`
      SELECT * FROM rankings
      WHERE tournament = ? AND division = ?
      ORDER BY rank ASC
    `);
    return stmt.all(tournament, division) as Ranking[];
  }

  static getChampion(tournament: string, division: string): Ranking | undefined {
    const stmt = db.prepare(`
      SELECT * FROM rankings
      WHERE tournament = ? AND division = ? AND is_champion = 1
    `);
    return stmt.get(tournament, division) as Ranking | undefined;
  }

  static getAllDivisions(tournament: string): string[] {
    const stmt = db.prepare('SELECT DISTINCT division FROM rankings WHERE tournament = ?');
    const results = stmt.all(tournament) as { division: string }[];
    return results.map(r => r.division);
  }

  static create(ranking: Ranking): number {
    const stmt = db.prepare(`
      INSERT INTO rankings (tournament, division, rank, athlete_id, athlete_name, is_champion)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      ranking.tournament,
      ranking.division,
      ranking.rank,
      ranking.athlete_id || null,
      ranking.athlete_name,
      ranking.is_champion ? 1 : 0
    );

    return result.lastInsertRowid as number;
  }

  static update(id: number, ranking: Partial<Ranking>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(ranking).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        if (key === 'is_champion') {
          fields.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE rankings SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM rankings WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export class P4PRankingModel {
  static getAll(tournament: string): P4PRanking[] {
    const stmt = db.prepare('SELECT * FROM p4p_rankings WHERE tournament = ? ORDER BY rank ASC');
    return stmt.all(tournament) as P4PRanking[];
  }

  static create(ranking: P4PRanking): number {
    const stmt = db.prepare(`
      INSERT INTO p4p_rankings (tournament, rank, athlete_id, athlete_name)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      ranking.tournament,
      ranking.rank,
      ranking.athlete_id || null,
      ranking.athlete_name
    );

    return result.lastInsertRowid as number;
  }

  static update(id: number, ranking: Partial<P4PRanking>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(ranking).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE p4p_rankings SET ${fields.join(', ')} WHERE id = ?`);
    const result = stmt.run(...values);

    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM p4p_rankings WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
