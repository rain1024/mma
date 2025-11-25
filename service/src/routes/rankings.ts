import { Router, Request, Response } from 'express';
import { RankingModel, P4PRankingModel } from '../models/ranking.model';

const router = Router();

// Helper function to format record string
function formatRecord(wins: number = 0, losses: number = 0, draws: number = 0): string {
  return `${wins}-${losses}-${draws}`;
}

// Transform ranking to frontend format
function transformRanking(ranking: any) {
  return {
    rank: ranking.rank,
    name: ranking.athlete_name,
    record: formatRecord(ranking.wins, ranking.losses, ranking.draws),
    move: '-'
  };
}

// Transform champion to frontend format
function transformChampion(champion: any) {
  if (!champion) return { name: '', record: '', nickname: '' };
  return {
    name: champion.athlete_name,
    record: formatRecord(champion.wins, champion.losses, champion.draws),
    nickname: '',
    country: champion.country,
    flag: champion.flag
  };
}

// GET /api/rankings/p4p - Get P4P rankings
router.get('/p4p', async (req: Request, res: Response) => {
  try {
    // Support both 'tournament' (legacy) and 'promotion_id' query params
    const promotionId = (req.query.promotion_id || req.query.tournament || 'ufc') as string;

    const p4pRankings = P4PRankingModel.getAll(promotionId);

    res.json({
      promotion_id: promotionId,
      tournament: promotionId, // Legacy support
      p4pRankings: p4pRankings.map(transformRanking)
    });
  } catch (error) {
    console.error('Error fetching P4P rankings:', error);
    res.status(500).json({ error: 'Failed to fetch P4P rankings' });
  }
});

// GET /api/rankings - Get all rankings for a promotion/tournament
router.get('/', async (req: Request, res: Response) => {
  try {
    // Support both 'tournament' (legacy) and 'promotion_id' query params
    const promotionId = (req.query.promotion_id || req.query.tournament || 'ufc') as string;

    const divisions = RankingModel.getAllDivisions(promotionId);
    const divisionsData: any = {};

    divisions.forEach(division => {
      const rankings = RankingModel.getByDivision(promotionId, division);
      const champion = RankingModel.getChampion(promotionId, division);

      divisionsData[division] = {
        champion: transformChampion(champion),
        rankings: rankings.filter(r => !r.is_champion).map(transformRanking)
      };
    });

    const p4pRankings = P4PRankingModel.getAll(promotionId);

    res.json({
      promotion_id: promotionId,
      tournament: promotionId, // Legacy support
      pfpRankings: p4pRankings.map(transformRanking),
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
    // Support both 'tournament' (legacy) and 'promotion_id' query params
    const promotionId = (req.query.promotion_id || req.query.tournament || 'ufc') as string;

    const rankings = RankingModel.getByDivision(promotionId, division);
    const champion = RankingModel.getChampion(promotionId, division);

    res.json({
      promotion_id: promotionId,
      tournament: promotionId, // Legacy support
      division,
      champion: transformChampion(champion),
      rankings: rankings.filter(r => !r.is_champion).map(transformRanking)
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
