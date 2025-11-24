import { Router, Request, Response } from 'express';
import { PromotionModel } from '../models/promotion.model';

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

// POST /api/promotions/:id/events - Add event to promotion
router.post('/:id/events', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { event_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ error: 'event_id is required' });
    }

    const promotion = PromotionModel.getById(id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    const success = PromotionModel.addEvent(id, event_id);
    if (!success) {
      return res.status(500).json({ error: 'Failed to add event to promotion' });
    }

    const updatedPromotion = PromotionModel.getById(id);
    res.status(201).json({
      message: 'Event added to promotion successfully',
      promotion: updatedPromotion
    });
  } catch (error) {
    console.error('Error adding event to promotion:', error);
    res.status(500).json({ error: 'Failed to add event to promotion' });
  }
});

// DELETE /api/promotions/:id/events - Remove event from promotion
router.delete('/:id/events', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { event_id } = req.query;

    if (!event_id || typeof event_id !== 'string') {
      return res.status(400).json({ error: 'event_id query parameter is required' });
    }

    const promotion = PromotionModel.getById(id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    const success = PromotionModel.removeEvent(id, event_id);
    if (!success) {
      return res.status(500).json({ error: 'Failed to remove event from promotion' });
    }

    const updatedPromotion = PromotionModel.getById(id);
    res.json({
      message: 'Event removed from promotion successfully',
      promotion: updatedPromotion
    });
  } catch (error) {
    console.error('Error removing event from promotion:', error);
    res.status(500).json({ error: 'Failed to remove event from promotion' });
  }
});

export default router;
