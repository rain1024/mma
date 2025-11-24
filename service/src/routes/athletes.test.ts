import request from 'supertest';
import app from '../app';
import { AthleteModel } from '../models/athlete.model';
import { runMigrations } from '../db/migrate';

describe('Athletes API', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    runMigrations();
  });

  beforeEach(() => {
    // Clean up athletes before each test
    const athletes = AthleteModel.getAll('ufc');
    athletes.forEach(athlete => athlete.id && AthleteModel.delete(athlete.id));
    const lionAthletes = AthleteModel.getAll('lion');
    lionAthletes.forEach(athlete => athlete.id && AthleteModel.delete(athlete.id));
  });

  describe('GET /api/athletes', () => {
    it('should return empty array when no athletes exist', async () => {
      const response = await request(app)
        .get('/api/athletes')
        .expect(200);

      expect(response.body).toEqual({
        tournament: 'ufc',
        count: 0,
        athletes: []
      });
    });

    it('should return all athletes for default tournament (ufc)', async () => {
      AthleteModel.create({
        name: 'Jon Jones',
        tournament: 'ufc',
        division: 'heavyweight',
        country: 'USA',
        gender: 'male',
        wins: 27,
        losses: 1,
        draws: 0
      });

      AthleteModel.create({
        name: 'Alexander Volkanovski',
        tournament: 'ufc',
        division: 'featherweight',
        country: 'Australia',
        gender: 'male',
        wins: 26,
        losses: 3,
        draws: 0
      });

      const response = await request(app)
        .get('/api/athletes')
        .expect(200);

      expect(response.body.tournament).toBe('ufc');
      expect(response.body.count).toBe(2);
      expect(response.body.athletes).toHaveLength(2);
    });

    it('should filter athletes by tournament', async () => {
      AthleteModel.create({
        name: 'Jon Jones',
        tournament: 'ufc',
        division: 'heavyweight'
      });

      AthleteModel.create({
        name: 'Thanh Le',
        tournament: 'lion',
        division: 'featherweight'
      });

      const response = await request(app)
        .get('/api/athletes?tournament=lion')
        .expect(200);

      expect(response.body.tournament).toBe('lion');
      expect(response.body.count).toBe(1);
      expect(response.body.athletes[0].name).toBe('Thanh Le');
    });

    it('should filter athletes by division', async () => {
      AthleteModel.create({
        name: 'Jon Jones',
        tournament: 'ufc',
        division: 'heavyweight'
      });

      AthleteModel.create({
        name: 'Alexander Volkanovski',
        tournament: 'ufc',
        division: 'featherweight'
      });

      const response = await request(app)
        .get('/api/athletes?division=heavyweight')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.athletes[0].division).toBe('heavyweight');
    });

    it('should filter athletes by gender', async () => {
      AthleteModel.create({
        name: 'Jon Jones',
        tournament: 'ufc',
        gender: 'male'
      });

      AthleteModel.create({
        name: 'Amanda Nunes',
        tournament: 'ufc',
        gender: 'female'
      });

      const response = await request(app)
        .get('/api/athletes?gender=female')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.athletes[0].gender).toBe('female');
    });

    it('should search athletes by name', async () => {
      AthleteModel.create({
        name: 'Jon Jones',
        tournament: 'ufc'
      });

      AthleteModel.create({
        name: 'Alexander Volkanovski',
        tournament: 'ufc'
      });

      const response = await request(app)
        .get('/api/athletes?search=Jones')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.athletes[0].name).toBe('Jon Jones');
    });

    it('should combine multiple filters', async () => {
      AthleteModel.create({
        name: 'Jon Jones',
        tournament: 'ufc',
        division: 'heavyweight',
        gender: 'male'
      });

      AthleteModel.create({
        name: 'Francis Ngannou',
        tournament: 'ufc',
        division: 'heavyweight',
        gender: 'male'
      });

      AthleteModel.create({
        name: 'Amanda Nunes',
        tournament: 'ufc',
        division: 'bantamweight',
        gender: 'female'
      });

      const response = await request(app)
        .get('/api/athletes?division=heavyweight&gender=male&search=Jones')
        .expect(200);

      expect(response.body.count).toBe(1);
      expect(response.body.athletes[0].name).toBe('Jon Jones');
    });
  });

  describe('GET /api/athletes/:id', () => {
    it('should return 404 for non-existent athlete', async () => {
      const response = await request(app)
        .get('/api/athletes/999')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Athlete not found'
      });
    });

    it('should return athlete by id', async () => {
      const athleteId = AthleteModel.create({
        name: 'Jon Jones',
        tournament: 'ufc',
        division: 'heavyweight',
        country: 'USA',
        wins: 27,
        losses: 1,
        draws: 0
      });

      const response = await request(app)
        .get(`/api/athletes/${athleteId}`)
        .expect(200);

      expect(response.body.athlete).toMatchObject({
        id: athleteId,
        name: 'Jon Jones',
        tournament: 'ufc',
        division: 'heavyweight',
        country: 'USA',
        wins: 27,
        losses: 1,
        draws: 0
      });
      expect(response.body.athlete).toHaveProperty('created_at');
      expect(response.body.athlete).toHaveProperty('updated_at');
    });
  });

  describe('POST /api/athletes', () => {
    it('should create a new athlete', async () => {
      const newAthlete = {
        name: 'Conor McGregor',
        tournament: 'ufc',
        division: 'lightweight',
        country: 'Ireland',
        gender: 'male',
        wins: 22,
        losses: 6,
        draws: 0
      };

      const response = await request(app)
        .post('/api/athletes')
        .send(newAthlete)
        .expect(201);

      expect(response.body.athlete).toMatchObject(newAthlete);
      expect(response.body.athlete).toHaveProperty('id');
      expect(response.body.athlete).toHaveProperty('created_at');

      // Verify it was saved
      const saved = AthleteModel.getById(response.body.athlete.id);
      expect(saved).toBeDefined();
      expect(saved?.name).toBe('Conor McGregor');
    });

    it('should create athlete with default values for optional fields', async () => {
      const minimalAthlete = {
        name: 'Test Fighter',
        tournament: 'ufc'
      };

      const response = await request(app)
        .post('/api/athletes')
        .send(minimalAthlete)
        .expect(201);

      expect(response.body.athlete.name).toBe('Test Fighter');
      expect(response.body.athlete.wins).toBe(0);
      expect(response.body.athlete.losses).toBe(0);
      expect(response.body.athlete.draws).toBe(0);
    });
  });

  describe('PUT /api/athletes/:id', () => {
    let athleteId: number;

    beforeEach(() => {
      athleteId = AthleteModel.create({
        name: 'Jon Jones',
        tournament: 'ufc',
        division: 'heavyweight',
        wins: 27,
        losses: 1,
        draws: 0
      });
    });

    it('should return 404 for non-existent athlete', async () => {
      const response = await request(app)
        .put('/api/athletes/999')
        .send({ wins: 30 })
        .expect(404);

      expect(response.body).toEqual({
        error: 'Athlete not found'
      });
    });

    it('should update athlete fields', async () => {
      const updates = {
        wins: 28,
        losses: 1,
        division: 'light heavyweight'
      };

      const response = await request(app)
        .put(`/api/athletes/${athleteId}`)
        .send(updates)
        .expect(200);

      expect(response.body.athlete).toMatchObject({
        id: athleteId,
        name: 'Jon Jones',
        wins: 28,
        losses: 1,
        division: 'light heavyweight'
      });

      // Verify updates were saved
      const updated = AthleteModel.getById(athleteId);
      expect(updated?.wins).toBe(28);
      expect(updated?.division).toBe('light heavyweight');
    });

    it('should update only provided fields', async () => {
      const response = await request(app)
        .put(`/api/athletes/${athleteId}`)
        .send({ wins: 30 })
        .expect(200);

      expect(response.body.athlete.wins).toBe(30);
      expect(response.body.athlete.name).toBe('Jon Jones');
      expect(response.body.athlete.division).toBe('heavyweight');
    });
  });

  describe('DELETE /api/athletes/:id', () => {
    let athleteId: number;

    beforeEach(() => {
      athleteId = AthleteModel.create({
        name: 'Jon Jones',
        tournament: 'ufc'
      });
    });

    it('should return 404 for non-existent athlete', async () => {
      const response = await request(app)
        .delete('/api/athletes/999')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Athlete not found'
      });
    });

    it('should delete athlete', async () => {
      const response = await request(app)
        .delete(`/api/athletes/${athleteId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Athlete deleted successfully'
      });

      // Verify it was deleted
      const deleted = AthleteModel.getById(athleteId);
      expect(deleted).toBeUndefined();
    });
  });
});
