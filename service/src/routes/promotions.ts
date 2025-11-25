import { Router, Request, Response } from 'express';
import { PromotionModel } from '../models/promotion.model';
import { EventModel } from '../models/event.model';

const router = Router();

// GET /api/promotions - Get all promotions
router.get('/', async (req: Request, res: Response) => {
  try {
    const promotions = PromotionModel.getAll();

    res.json({
      count: promotions.length,
      promotions
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// GET /api/promotions/:id - Get promotion by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promotion = PromotionModel.getById(id);

    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.json({ promotion });
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ error: 'Failed to fetch promotion' });
  }
});

// GET /api/promotions/:id/events - Get all events for a promotion
router.get('/:id/events', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promotion = PromotionModel.getById(id);

    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    const events = PromotionModel.getEvents(id);

    res.json({
      promotion_id: id,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching promotion events:', error);
    res.status(500).json({ error: 'Failed to fetch promotion events' });
  }
});

// POST /api/promotions - Create new promotion
router.post('/', async (req: Request, res: Response) => {
  try {
    const promotionId = PromotionModel.create(req.body);
    const promotion = PromotionModel.getById(promotionId);

    res.status(201).json({ promotion });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

// PUT /api/promotions/:id - Update promotion
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = PromotionModel.update(id, req.body);

    if (!success) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    const promotion = PromotionModel.getById(id);
    res.json({ promotion });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ error: 'Failed to update promotion' });
  }
});

// DELETE /api/promotions/:id - Delete promotion
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = PromotionModel.delete(id);

    if (!success) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

export default router;
