import { Router, Request, Response } from 'express';
import { EventModel } from '../models/event.model';
import { MatchModel } from '../models/match.model';

const router = Router();

// Helper function to transform database matches to frontend format
function transformEventWithMatches(event: any, matches: any[]) {
  // Group matches by category
  const categoriesMap = new Map<string, any[]>();

  for (const match of matches) {
    const category = match.category || 'MAIN CARD';
    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, []);
    }

    categoriesMap.get(category)!.push({
      round: match.round_title || '',
      fighter1: {
        name: match.fighter1_name,
        stats: match.fighter1_stats || '',
        flag: match.fighter1_flag || '',
        winner: match.winner === 1
      },
      fighter2: {
        name: match.fighter2_name,
        stats: match.fighter2_stats || '',
        flag: match.fighter2_flag || '',
        winner: match.winner === 2
      },
      video: match.video || undefined,
      result: match.method ? {
        method: match.method,
        technique: match.technique || '',
        time: match.time || '',
        round: match.result_round || '',
        totalTime: ''
      } : undefined
    });
  }

  // Convert to fights array
  const fights = Array.from(categoriesMap.entries()).map(([category, categoryMatches]) => ({
    category,
    matches: categoryMatches
  }));

  return {
    id: event.id,
    promotion_id: event.promotion_id,
    logo: event.id.toUpperCase(),
    title: event.name,
    name: event.name,
    date: event.date || '',
    location: event.location || '',
    venue: event.venue || '',
    status: event.status || 'completed',
    fights
  };
}

// GET /api/events - Get all events for a promotion
router.get('/', async (req: Request, res: Response) => {
  try {
    // Support both 'tournament' (legacy) and 'promotion_id' query params
    const promotionId = (req.query.promotion_id || req.query.tournament || 'ufc') as string;

    // Get events from database
    const dbEvents = EventModel.getAll(promotionId);

    // Transform each event with its matches
    const events = dbEvents.map(event => {
      const matches = MatchModel.getAll(event.id);
      return transformEventWithMatches(event, matches);
    });

    res.json({
      promotion_id: promotionId,
      tournament: promotionId, // Legacy support
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id - Get event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = EventModel.getById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const matches = MatchModel.getAll(id);
    const transformedEvent = transformEventWithMatches(event, matches);

    res.json(transformedEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events - Create new event
router.post('/', async (req: Request, res: Response) => {
  try {
    const eventId = EventModel.create(req.body);
    const event = EventModel.getById(eventId);

    res.status(201).json({ event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = EventModel.update(id, req.body);

    if (!success) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = EventModel.getById(id);
    res.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = EventModel.delete(id);

    if (!success) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /api/events/:id/matches - Add match to event
router.post('/:id/matches', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = EventModel.getById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const matchId = MatchModel.create({ ...req.body, event_id: id });
    const match = MatchModel.getById(matchId);

    res.status(201).json({ match });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

export default router;
