import { Router, Request, Response } from 'express';
import { EventModel } from '../models/event.model';
import { MatchModel } from '../models/match.model';
import fs from 'fs';
import path from 'path';

const router = Router();

// Helper function to read JSON files from service/data directory
function readDataFile(filePath: string): any {
  const fullPath = path.join(__dirname, '../../data', filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  return JSON.parse(fileContent);
}

// GET /api/events - Get all events for a tournament
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tournament = 'lion' } = req.query;

    // Read promotion.json to get list of event IDs
    const promotion = readDataFile(`promotions/${tournament}/promotion.json`);

    if (!promotion.events || promotion.events.length === 0) {
      return res.json({
        tournament,
        count: 0,
        events: []
      });
    }

    // Check if events is array of objects (old format) or array of strings (new format)
    const firstEvent = promotion.events[0];
    let events: any[] = [];

    if (typeof firstEvent === 'object' && firstEvent.id) {
      // Old format: array of event objects
      events = promotion.events;
    } else if (typeof firstEvent === 'string') {
      // New format: array of event IDs - load individual event files
      events = promotion.events.map((eventId: string) => {
        try {
          return readDataFile(`promotions/${tournament}/events/${eventId}.json`);
        } catch (error) {
          console.error(`Error loading event ${eventId}:`, error);
          return null;
        }
      }).filter((event: any) => event !== null);
    }

    res.json({
      tournament,
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
    const { tournament = 'lion' } = req.query;

    // Try to read the event JSON file
    try {
      const event = readDataFile(`promotions/${tournament}/events/${id}.json`);
      res.json(event);
    } catch (fileError) {
      // If JSON file doesn't exist, return 404
      return res.status(404).json({ error: 'Event not found' });
    }
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
