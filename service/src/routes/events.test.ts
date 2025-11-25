import request from 'supertest';
import app from '../app';
import { EventModel } from '../models/event.model';
import { MatchModel } from '../models/match.model';
import { PromotionModel } from '../models/promotion.model';
import { runMigrations } from '../db/migrate';
import db from '../config/database';

describe('Events API', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    runMigrations();
  });

  beforeEach(() => {
    // Clean up matches and events before each test
    db.prepare('DELETE FROM matches').run();
    db.prepare('DELETE FROM events').run();

    // Ensure promotions exist for FK constraints (use INSERT OR IGNORE)
    db.prepare(`
      INSERT OR IGNORE INTO promotions (id, name, subtitle, theme, color)
      VALUES ('ufc', 'UFC', 'Ultimate Fighting Championship', 'ufc-theme', '#d20a0a')
    `).run();
    db.prepare(`
      INSERT OR IGNORE INTO promotions (id, name, subtitle, theme, color)
      VALUES ('lion', 'Lion Championship', 'Vietnam MMA', 'lion-theme', '#ff8c00')
    `).run();
  });

  describe('POST /api/events', () => {
    it('should create a new event', async () => {
      const newEvent = {
        id: 'ufc-300',
        promotion_id: 'ufc',
        name: 'UFC 300',
        date: '2024-04-13',
        location: 'Las Vegas, Nevada',
        venue: 'T-Mobile Arena',
        status: 'upcoming'
      };

      const response = await request(app)
        .post('/api/events')
        .send(newEvent)
        .expect(201);

      expect(response.body.event).toMatchObject(newEvent);
      expect(response.body.event).toHaveProperty('created_at');
      expect(response.body.event).toHaveProperty('updated_at');

      // Verify it was saved
      const saved = EventModel.getById('ufc-300');
      expect(saved).toBeDefined();
      expect(saved?.name).toBe('UFC 300');
    });

    it('should create event with minimal required fields', async () => {
      const minimalEvent = {
        id: 'ufc-301',
        promotion_id: 'ufc',
        name: 'UFC 301'
      };

      const response = await request(app)
        .post('/api/events')
        .send(minimalEvent)
        .expect(201);

      expect(response.body.event.id).toBe('ufc-301');
      expect(response.body.event.name).toBe('UFC 301');
      expect(response.body.event.promotion_id).toBe('ufc');
    });
  });

  describe('PUT /api/events/:id', () => {
    beforeEach(() => {
      EventModel.create({
        id: 'ufc-300',
        promotion_id: 'ufc',
        name: 'UFC 300',
        date: '2024-04-13',
        location: 'Las Vegas, Nevada',
        status: 'upcoming'
      });
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .put('/api/events/nonexistent')
        .send({ name: 'Updated Event' })
        .expect(404);

      expect(response.body).toEqual({
        error: 'Event not found'
      });
    });

    it('should update event fields', async () => {
      const updates = {
        name: 'UFC 300: Pereira vs Hill',
        status: 'completed',
        location: 'Las Vegas, NV'
      };

      const response = await request(app)
        .put('/api/events/ufc-300')
        .send(updates)
        .expect(200);

      expect(response.body.event).toMatchObject({
        id: 'ufc-300',
        name: 'UFC 300: Pereira vs Hill',
        status: 'completed',
        location: 'Las Vegas, NV'
      });

      // Verify updates were saved
      const updated = EventModel.getById('ufc-300');
      expect(updated?.name).toBe('UFC 300: Pereira vs Hill');
      expect(updated?.status).toBe('completed');
    });
  });

  describe('DELETE /api/events/:id', () => {
    beforeEach(() => {
      EventModel.create({
        id: 'ufc-300',
        promotion_id: 'ufc',
        name: 'UFC 300'
      });
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .delete('/api/events/nonexistent')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Event not found'
      });
    });

    it('should delete event', async () => {
      const response = await request(app)
        .delete('/api/events/ufc-300')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Event deleted successfully'
      });

      // Verify it was deleted
      const deleted = EventModel.getById('ufc-300');
      expect(deleted).toBeUndefined();
    });
  });

  describe('POST /api/events/:id/matches', () => {
    beforeEach(() => {
      EventModel.create({
        id: 'ufc-300',
        promotion_id: 'ufc',
        name: 'UFC 300'
      });
    });

    it('should return 404 if event does not exist', async () => {
      const match = {
        fighter1_name: 'Fighter One',
        fighter2_name: 'Fighter Two'
      };

      const response = await request(app)
        .post('/api/events/nonexistent/matches')
        .send(match)
        .expect(404);

      expect(response.body).toEqual({
        error: 'Event not found'
      });
    });

    it('should add match to event', async () => {
      const match = {
        category: 'main_card',
        fighter1_name: 'Alex Pereira',
        fighter1_country: 'Brazil',
        fighter2_name: 'Jamahal Hill',
        fighter2_country: 'USA',
        weight_class: 'light heavyweight',
        winner: 1,
        method: 'KO/TKO',
        round: 1,
        time: '4:32'
      };

      const response = await request(app)
        .post('/api/events/ufc-300/matches')
        .send(match)
        .expect(201);

      expect(response.body.match).toMatchObject({
        ...match,
        event_id: 'ufc-300'
      });
      expect(response.body.match).toHaveProperty('id');

      // Verify it was saved
      const saved = MatchModel.getById(response.body.match.id);
      expect(saved).toBeDefined();
      expect(saved?.event_id).toBe('ufc-300');
    });

    it('should add match with minimal fields', async () => {
      const match = {
        fighter1_name: 'Fighter A',
        fighter2_name: 'Fighter B'
      };

      const response = await request(app)
        .post('/api/events/ufc-300/matches')
        .send(match)
        .expect(201);

      expect(response.body.match.fighter1_name).toBe('Fighter A');
      expect(response.body.match.fighter2_name).toBe('Fighter B');
      expect(response.body.match.event_id).toBe('ufc-300');
    });
  });
});
