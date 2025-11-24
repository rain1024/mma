import request from 'supertest';
import app from '../app';
import { RankingModel, P4PRankingModel } from '../models/ranking.model';
import { runMigrations } from '../db/migrate';
import db from '../config/database';

describe('Rankings API', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    runMigrations();
  });

  beforeEach(() => {
    // Clean up all rankings before each test
    db.prepare('DELETE FROM rankings').run();
    db.prepare('DELETE FROM p4p_rankings').run();
  });

  describe('GET /api/rankings/p4p', () => {
    it('should return empty P4P rankings for tournament', async () => {
      const response = await request(app)
        .get('/api/rankings/p4p')
        .expect(200);

      expect(response.body).toEqual({
        tournament: 'ufc',
        p4pRankings: []
      });
    });

    it('should return P4P rankings for default tournament (ufc)', async () => {
      P4PRankingModel.create({
        tournament: 'ufc',
        rank: 1,
        athlete_name: 'Islam Makhachev'
      });

      P4PRankingModel.create({
        tournament: 'ufc',
        rank: 2,
        athlete_name: 'Jon Jones'
      });

      const response = await request(app)
        .get('/api/rankings/p4p')
        .expect(200);

      expect(response.body.tournament).toBe('ufc');
      expect(response.body.p4pRankings).toHaveLength(2);
      expect(response.body.p4pRankings[0].rank).toBe(1);
      expect(response.body.p4pRankings[0].athlete_name).toBe('Islam Makhachev');
    });

    it('should filter P4P rankings by tournament', async () => {
      P4PRankingModel.create({
        tournament: 'ufc',
        rank: 1,
        athlete_name: 'Islam Makhachev'
      });

      P4PRankingModel.create({
        tournament: 'lion',
        rank: 1,
        athlete_name: 'Thanh Le'
      });

      const response = await request(app)
        .get('/api/rankings/p4p?tournament=lion')
        .expect(200);

      expect(response.body.tournament).toBe('lion');
      expect(response.body.p4pRankings).toHaveLength(1);
      expect(response.body.p4pRankings[0].athlete_name).toBe('Thanh Le');
    });
  });

  describe('GET /api/rankings', () => {
    it('should return empty rankings when no data exists', async () => {
      const response = await request(app)
        .get('/api/rankings')
        .expect(200);

      expect(response.body).toEqual({
        tournament: 'ufc',
        p4pRankings: [],
        divisions: {}
      });
    });

    it('should return all rankings with divisions and P4P', async () => {
      // Create P4P rankings
      P4PRankingModel.create({
        tournament: 'ufc',
        rank: 1,
        athlete_name: 'Islam Makhachev'
      });

      // Create division rankings with champion
      RankingModel.create({
        tournament: 'ufc',
        division: 'lightweight',
        rank: 0,
        athlete_name: 'Islam Makhachev',
        is_champion: true
      });

      RankingModel.create({
        tournament: 'ufc',
        division: 'lightweight',
        rank: 1,
        athlete_name: 'Charles Oliveira',
        is_champion: false
      });

      RankingModel.create({
        tournament: 'ufc',
        division: 'welterweight',
        rank: 0,
        athlete_name: 'Leon Edwards',
        is_champion: true
      });

      const response = await request(app)
        .get('/api/rankings')
        .expect(200);

      expect(response.body.tournament).toBe('ufc');
      expect(response.body.p4pRankings).toHaveLength(1);
      expect(response.body.divisions).toHaveProperty('lightweight');
      expect(response.body.divisions).toHaveProperty('welterweight');
      expect(response.body.divisions.lightweight.champion.athlete_name).toBe('Islam Makhachev');
      expect(response.body.divisions.lightweight.rankings).toHaveLength(1);
      expect(response.body.divisions.lightweight.rankings[0].athlete_name).toBe('Charles Oliveira');
    });

    it('should filter rankings by tournament', async () => {
      RankingModel.create({
        tournament: 'ufc',
        division: 'lightweight',
        rank: 1,
        athlete_name: 'Islam Makhachev'
      });

      RankingModel.create({
        tournament: 'lion',
        division: 'featherweight',
        rank: 1,
        athlete_name: 'Thanh Le'
      });

      const response = await request(app)
        .get('/api/rankings?tournament=lion')
        .expect(200);

      expect(response.body.tournament).toBe('lion');
      expect(response.body.divisions).toHaveProperty('featherweight');
      expect(response.body.divisions).not.toHaveProperty('lightweight');
    });
  });

  describe('GET /api/rankings/:division', () => {
    beforeEach(() => {
      RankingModel.create({
        tournament: 'ufc',
        division: 'lightweight',
        rank: 0,
        athlete_name: 'Islam Makhachev',
        is_champion: true
      });

      RankingModel.create({
        tournament: 'ufc',
        division: 'lightweight',
        rank: 1,
        athlete_name: 'Charles Oliveira',
        is_champion: false
      });

      RankingModel.create({
        tournament: 'ufc',
        division: 'lightweight',
        rank: 2,
        athlete_name: 'Justin Gaethje',
        is_champion: false
      });
    });

    it('should return rankings for specific division', async () => {
      const response = await request(app)
        .get('/api/rankings/lightweight')
        .expect(200);

      expect(response.body.tournament).toBe('ufc');
      expect(response.body.division).toBe('lightweight');
      expect(response.body.champion).toMatchObject({
        athlete_name: 'Islam Makhachev',
        is_champion: 1
      });
      expect(response.body.rankings).toHaveLength(2);
      expect(response.body.rankings[0].athlete_name).toBe('Charles Oliveira');
      expect(response.body.rankings[1].athlete_name).toBe('Justin Gaethje');
    });

    it('should filter division rankings by tournament', async () => {
      RankingModel.create({
        tournament: 'lion',
        division: 'lightweight',
        rank: 1,
        athlete_name: 'Different Fighter'
      });

      const response = await request(app)
        .get('/api/rankings/lightweight?tournament=lion')
        .expect(200);

      expect(response.body.tournament).toBe('lion');
      expect(response.body.rankings).toHaveLength(1);
      expect(response.body.rankings[0].athlete_name).toBe('Different Fighter');
    });

    it('should return empty rankings for division with no data', async () => {
      const response = await request(app)
        .get('/api/rankings/heavyweight')
        .expect(200);

      expect(response.body.division).toBe('heavyweight');
      expect(response.body.rankings).toEqual([]);
      expect(response.body.champion).toBeUndefined();
    });
  });

  describe('POST /api/rankings', () => {
    it('should create a new ranking', async () => {
      const newRanking = {
        tournament: 'ufc',
        division: 'lightweight',
        rank: 1,
        athlete_name: 'Charles Oliveira',
        is_champion: false
      };

      const response = await request(app)
        .post('/api/rankings')
        .send(newRanking)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.message).toBe('Ranking created successfully');

      // Verify it was saved
      const saved = RankingModel.getByDivision('ufc', 'lightweight');
      expect(saved).toHaveLength(1);
      expect(saved[0].athlete_name).toBe('Charles Oliveira');
    });

    it('should create champion ranking', async () => {
      const championRanking = {
        tournament: 'ufc',
        division: 'lightweight',
        rank: 0,
        athlete_name: 'Islam Makhachev',
        is_champion: true
      };

      const response = await request(app)
        .post('/api/rankings')
        .send(championRanking)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      // Verify champion was saved
      const champion = RankingModel.getChampion('ufc', 'lightweight');
      expect(champion).toBeDefined();
      expect(champion?.athlete_name).toBe('Islam Makhachev');
    });
  });

  describe('POST /api/rankings/p4p', () => {
    it('should create a new P4P ranking', async () => {
      const newP4PRanking = {
        tournament: 'ufc',
        rank: 1,
        athlete_name: 'Islam Makhachev'
      };

      const response = await request(app)
        .post('/api/rankings/p4p')
        .send(newP4PRanking)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.message).toBe('P4P ranking created successfully');

      // Verify it was saved
      const saved = P4PRankingModel.getAll('ufc');
      expect(saved).toHaveLength(1);
      expect(saved[0].athlete_name).toBe('Islam Makhachev');
    });

    it('should create multiple P4P rankings in order', async () => {
      await request(app)
        .post('/api/rankings/p4p')
        .send({
          tournament: 'ufc',
          rank: 1,
          athlete_name: 'Islam Makhachev'
        })
        .expect(201);

      await request(app)
        .post('/api/rankings/p4p')
        .send({
          tournament: 'ufc',
          rank: 2,
          athlete_name: 'Jon Jones'
        })
        .expect(201);

      const saved = P4PRankingModel.getAll('ufc');
      expect(saved).toHaveLength(2);
      expect(saved[0].rank).toBe(1);
      expect(saved[1].rank).toBe(2);
    });
  });
});
