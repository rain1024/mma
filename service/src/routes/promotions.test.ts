import request from 'supertest';
import app from '../app';
import { PromotionModel } from '../models/promotion.model';
import { EventModel } from '../models/event.model';
import { runMigrations } from '../db/migrate';
import db from '../config/database';

describe('Promotions API', () => {
  beforeAll(() => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    // Initialize database
    runMigrations();
  });

  beforeEach(() => {
    // Clean up events first (FK constraint), then promotions
    db.prepare('DELETE FROM events').run();
    db.prepare('DELETE FROM promotions').run();
  });

  describe('GET /api/promotions', () => {
    it('should return empty array when no promotions exist', async () => {
      const response = await request(app)
        .get('/api/promotions')
        .expect(200);

      expect(response.body).toEqual({
        count: 0,
        promotions: []
      });
    });

    it('should return all promotions', async () => {
      // Create test promotions
      PromotionModel.create({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a'
      });

      PromotionModel.create({
        id: 'bellator',
        name: 'Bellator MMA',
        subtitle: 'Fighting Championship',
        theme: 'bellator-theme',
        color: '#0066cc'
      });

      const response = await request(app)
        .get('/api/promotions')
        .expect(200);

      expect(response.body.count).toBe(2);
      expect(response.body.promotions).toHaveLength(2);
      expect(response.body.promotions[0].name).toBe('Bellator MMA');
      expect(response.body.promotions[1].name).toBe('UFC');
    });
  });

  describe('GET /api/promotions/:id', () => {
    it('should return 404 for non-existent promotion', async () => {
      const response = await request(app)
        .get('/api/promotions/nonexistent')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Promotion not found'
      });
    });

    it('should return promotion by id', async () => {
      PromotionModel.create({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a'
      });

      const response = await request(app)
        .get('/api/promotions/ufc')
        .expect(200);

      expect(response.body.promotion).toMatchObject({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a'
      });
      expect(response.body.promotion).toHaveProperty('created_at');
      expect(response.body.promotion).toHaveProperty('updated_at');
    });
  });

  describe('GET /api/promotions/:id/events', () => {
    beforeEach(() => {
      PromotionModel.create({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a'
      });
    });

    it('should return 404 for non-existent promotion', async () => {
      const response = await request(app)
        .get('/api/promotions/nonexistent/events')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Promotion not found'
      });
    });

    it('should return empty events array when no events exist', async () => {
      const response = await request(app)
        .get('/api/promotions/ufc/events')
        .expect(200);

      expect(response.body).toEqual({
        promotion_id: 'ufc',
        count: 0,
        events: []
      });
    });

    it('should return events for promotion', async () => {
      // Create some events for the promotion
      EventModel.create({
        id: 'ufc-300',
        promotion_id: 'ufc',
        name: 'UFC 300',
        date: '2024-04-13',
        status: 'completed'
      });

      EventModel.create({
        id: 'ufc-301',
        promotion_id: 'ufc',
        name: 'UFC 301',
        date: '2024-05-04',
        status: 'upcoming'
      });

      const response = await request(app)
        .get('/api/promotions/ufc/events')
        .expect(200);

      expect(response.body.promotion_id).toBe('ufc');
      expect(response.body.count).toBe(2);
      expect(response.body.events).toHaveLength(2);
    });
  });

  describe('POST /api/promotions', () => {
    it('should create a new promotion', async () => {
      const newPromotion = {
        id: 'bellator',
        name: 'Bellator MMA',
        subtitle: 'Fighting Championship',
        theme: 'bellator-theme',
        color: '#0066cc'
      };

      const response = await request(app)
        .post('/api/promotions')
        .send(newPromotion)
        .expect(201);

      expect(response.body.promotion).toMatchObject(newPromotion);
      expect(response.body.promotion).toHaveProperty('created_at');
      expect(response.body.promotion).toHaveProperty('updated_at');

      // Verify it was saved to database
      const saved = PromotionModel.getById('bellator');
      expect(saved).toBeDefined();
      expect(saved?.name).toBe('Bellator MMA');
    });
  });

  describe('PUT /api/promotions/:id', () => {
    beforeEach(() => {
      PromotionModel.create({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a'
      });
    });

    it('should return 404 for non-existent promotion', async () => {
      const response = await request(app)
        .put('/api/promotions/nonexistent')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toEqual({
        error: 'Promotion not found'
      });
    });

    it('should update promotion fields', async () => {
      const updates = {
        subtitle: 'The Ultimate Fighting Championship',
        color: '#ff0000'
      };

      const response = await request(app)
        .put('/api/promotions/ufc')
        .send(updates)
        .expect(200);

      expect(response.body.promotion).toMatchObject({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'The Ultimate Fighting Championship',
        color: '#ff0000',
        theme: 'ufc-theme'
      });

      // Verify updates were saved
      const updated = PromotionModel.getById('ufc');
      expect(updated?.subtitle).toBe('The Ultimate Fighting Championship');
      expect(updated?.color).toBe('#ff0000');
    });
  });

  describe('DELETE /api/promotions/:id', () => {
    beforeEach(() => {
      PromotionModel.create({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a'
      });
    });

    it('should return 404 for non-existent promotion', async () => {
      const response = await request(app)
        .delete('/api/promotions/nonexistent')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Promotion not found'
      });
    });

    it('should delete promotion', async () => {
      const response = await request(app)
        .delete('/api/promotions/ufc')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Promotion deleted successfully'
      });

      // Verify it was deleted from database
      const deleted = PromotionModel.getById('ufc');
      expect(deleted).toBeUndefined();
    });
  });
});
