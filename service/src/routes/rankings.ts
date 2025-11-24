import { Router, Request, Response } from 'express';
import { RankingModel, P4PRankingModel } from '../models/ranking.model';

const router = Router();

// GET /api/rankings/p4p - Get P4P rankings
router.get('/p4p', async (req: Request, res: Response) => {
  try {
    const { tournament = 'ufc' } = req.query;

    const p4pRankings = P4PRankingModel.getAll(tournament as string);

    res.json({
      tournament,
      p4pRankings
    });
  } catch (error) {
    console.error('Error fetching P4P rankings:', error);
    res.status(500).json({ error: 'Failed to fetch P4P rankings' });
  }
});

// GET /api/rankings - Get all rankings for a tournament
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tournament = 'ufc' } = req.query;

    const divisions = RankingModel.getAllDivisions(tournament as string);
    const divisionsData: any = {};

    divisions.forEach(division => {
      const rankings = RankingModel.getByDivision(tournament as string, division);
      const champion = RankingModel.getChampion(tournament as string, division);

      divisionsData[division] = {
        champion,
        rankings: rankings.filter(r => !r.is_champion)
      };
    });

    const p4pRankings = P4PRankingModel.getAll(tournament as string);

    res.json({
      tournament,
      p4pRankings,
      divisions: divisionsData
    });
  } catch (error) {
    console.error('Error fetching rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
});

// GET /api/rankings/:division - Get rankings for a specific division
router.get('/:division', async (req: Request, res: Response) => {
  try {
    const { division } = req.params;
    const { tournament = 'ufc' } = req.query;

    const rankings = RankingModel.getByDivision(tournament as string, division);
    const champion = RankingModel.getChampion(tournament as string, division);

    res.json({
      tournament,
      division,
      champion,
      rankings: rankings.filter(r => !r.is_champion)
    });
  } catch (error) {
    console.error('Error fetching division rankings:', error);
    res.status(500).json({ error: 'Failed to fetch division rankings' });
  }
});

// POST /api/rankings - Create new ranking
router.post('/', async (req: Request, res: Response) => {
  try {
    const rankingId = RankingModel.create(req.body);

    res.status(201).json({ id: rankingId, message: 'Ranking created successfully' });
  } catch (error) {
    console.error('Error creating ranking:', error);
    res.status(500).json({ error: 'Failed to create ranking' });
  }
});

// POST /api/rankings/p4p - Create new P4P ranking
router.post('/p4p', async (req: Request, res: Response) => {
  try {
    const rankingId = P4PRankingModel.create(req.body);

    res.status(201).json({ id: rankingId, message: 'P4P ranking created successfully' });
  } catch (error) {
    console.error('Error creating P4P ranking:', error);
    res.status(500).json({ error: 'Failed to create P4P ranking' });
  }
});

export default router;
