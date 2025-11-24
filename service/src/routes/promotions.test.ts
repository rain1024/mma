import request from 'supertest';
import app from '../app';
import { PromotionModel } from '../models/promotion.model';
import { runMigrations } from '../db/migrate';

describe('Promotions API', () => {
  beforeAll(() => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    // Initialize database
    runMigrations();
  });

  beforeEach(() => {
    // Clean up promotions before each test
    const promotions = PromotionModel.getAll();
    promotions.forEach(promo => PromotionModel.delete(promo.id));
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
        color: '#d20a0a',
        events: ['ufc309']
      });

      PromotionModel.create({
        id: 'bellator',
        name: 'Bellator MMA',
        subtitle: 'Fighting Championship',
        theme: 'bellator-theme',
        color: '#0066cc',
        events: []
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
        color: '#d20a0a',
        events: ['ufc309']
      });

      const response = await request(app)
        .get('/api/promotions/ufc')
        .expect(200);

      expect(response.body.promotion).toMatchObject({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a',
        events: ['ufc309']
      });
      expect(response.body.promotion).toHaveProperty('created_at');
      expect(response.body.promotion).toHaveProperty('updated_at');
    });
  });

  describe('POST /api/promotions', () => {
    it('should create a new promotion', async () => {
      const newPromotion = {
        id: 'bellator',
        name: 'Bellator MMA',
        subtitle: 'Fighting Championship',
        theme: 'bellator-theme',
        color: '#0066cc',
        events: ['bellator300']
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

    it('should create promotion with empty events array if not provided', async () => {
      const newPromotion = {
        id: 'one',
        name: 'ONE Championship',
        subtitle: 'Asian MMA',
        theme: 'one-theme',
        color: '#000000'
      };

      const response = await request(app)
        .post('/api/promotions')
        .send(newPromotion)
        .expect(201);

      expect(response.body.promotion.events).toEqual([]);
    });
  });

  describe('PUT /api/promotions/:id', () => {
    beforeEach(() => {
      PromotionModel.create({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a',
        events: ['ufc309']
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
        theme: 'ufc-theme',
        events: ['ufc309']
      });

      // Verify updates were saved
      const updated = PromotionModel.getById('ufc');
      expect(updated?.subtitle).toBe('The Ultimate Fighting Championship');
      expect(updated?.color).toBe('#ff0000');
    });

    it('should update events array', async () => {
      const response = await request(app)
        .put('/api/promotions/ufc')
        .send({ events: ['ufc309', 'ufc310', 'ufc311'] })
        .expect(200);

      expect(response.body.promotion.events).toEqual(['ufc309', 'ufc310', 'ufc311']);
    });
  });

  describe('DELETE /api/promotions/:id', () => {
    beforeEach(() => {
      PromotionModel.create({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a',
        events: ['ufc309']
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

  describe('POST /api/promotions/:id/events', () => {
    beforeEach(() => {
      PromotionModel.create({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a',
        events: ['ufc309']
      });
    });

    it('should return 404 for non-existent promotion', async () => {
      const response = await request(app)
        .post('/api/promotions/nonexistent/events')
        .send({ event_id: 'event1' })
        .expect(404);

      expect(response.body).toEqual({
        error: 'Promotion not found'
      });
    });

    it('should return 400 if event_id is missing', async () => {
      const response = await request(app)
        .post('/api/promotions/ufc/events')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: 'event_id is required'
      });
    });

    it('should add event to promotion', async () => {
      const response = await request(app)
        .post('/api/promotions/ufc/events')
        .send({ event_id: 'ufc310' })
        .expect(201);

      expect(response.body.message).toBe('Event added to promotion successfully');
      expect(response.body.promotion.events).toEqual(['ufc309', 'ufc310']);

      // Verify it was saved
      const updated = PromotionModel.getById('ufc');
      expect(updated?.events).toEqual(['ufc309', 'ufc310']);
    });

    it('should not add duplicate event', async () => {
      const response = await request(app)
        .post('/api/promotions/ufc/events')
        .send({ event_id: 'ufc309' })
        .expect(201);

      expect(response.body.promotion.events).toEqual(['ufc309']);
    });
  });

  describe('DELETE /api/promotions/:id/events', () => {
    beforeEach(() => {
      PromotionModel.create({
        id: 'ufc',
        name: 'UFC',
        subtitle: 'Ultimate Fighting Championship',
        theme: 'ufc-theme',
        color: '#d20a0a',
        events: ['ufc309', 'ufc310', 'ufc311']
      });
    });

    it('should return 404 for non-existent promotion', async () => {
      const response = await request(app)
        .delete('/api/promotions/nonexistent/events?event_id=event1')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Promotion not found'
      });
    });

    it('should return 400 if event_id is missing', async () => {
      const response = await request(app)
        .delete('/api/promotions/ufc/events')
        .expect(400);

      expect(response.body).toEqual({
        error: 'event_id query parameter is required'
      });
    });

    it('should remove event from promotion', async () => {
      const response = await request(app)
        .delete('/api/promotions/ufc/events?event_id=ufc310')
        .expect(200);

      expect(response.body.message).toBe('Event removed from promotion successfully');
      expect(response.body.promotion.events).toEqual(['ufc309', 'ufc311']);

      // Verify it was saved
      const updated = PromotionModel.getById('ufc');
      expect(updated?.events).toEqual(['ufc309', 'ufc311']);
    });

    it('should succeed even if event does not exist in array', async () => {
      const response = await request(app)
        .delete('/api/promotions/ufc/events?event_id=nonexistent')
        .expect(200);

      expect(response.body.promotion.events).toEqual(['ufc309', 'ufc310', 'ufc311']);
    });
  });
});
