import { Router, Request, Response } from 'express';
import { AthleteModel } from '../models/athlete.model';

const router = Router();

// GET /api/athletes - Get all athletes for a promotion/tournament
router.get('/', async (req: Request, res: Response) => {
  try {
    // Support both 'tournament' (legacy) and 'promotion_id' query params
    const promotionId = (req.query.promotion_id || req.query.tournament || 'ufc') as string;
    const { division, gender, search } = req.query;

    const athletes = AthleteModel.getAll(promotionId, {
      division: division as string,
      gender: gender as string,
      search: search as string
    });

    res.json({
      promotion_id: promotionId,
      tournament: promotionId, // Legacy support
      count: athletes.length,
      athletes
    });
  } catch (error) {
    console.error('Error fetching athletes:', error);
    res.status(500).json({ error: 'Failed to fetch athletes' });
  }
});

// GET /api/athletes/:id - Get athlete by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const athlete = AthleteModel.getById(parseInt(id));

    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    res.json({ athlete });
  } catch (error) {
    console.error('Error fetching athlete:', error);
    res.status(500).json({ error: 'Failed to fetch athlete' });
  }
});

// POST /api/athletes - Create new athlete
router.post('/', async (req: Request, res: Response) => {
  try {
    const athleteId = AthleteModel.create(req.body);
    const athlete = AthleteModel.getById(athleteId);

    res.status(201).json({ athlete });
  } catch (error) {
    console.error('Error creating athlete:', error);
    res.status(500).json({ error: 'Failed to create athlete' });
  }
});

// PUT /api/athletes/:id - Update athlete
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = AthleteModel.update(parseInt(id), req.body);

    if (!success) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    const athlete = AthleteModel.getById(parseInt(id));
    res.json({ athlete });
  } catch (error) {
    console.error('Error updating athlete:', error);
    res.status(500).json({ error: 'Failed to update athlete' });
  }
});

// DELETE /api/athletes/:id - Delete athlete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = AthleteModel.delete(parseInt(id));

    if (!success) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    res.json({ message: 'Athlete deleted successfully' });
  } catch (error) {
    console.error('Error deleting athlete:', error);
    res.status(500).json({ error: 'Failed to delete athlete' });
  }
});

export default router;
