import { parseArgs, countryToFlag, explore_event } from './tapology_fetch';
import type { ScrapedEventData } from './tapology_types';
import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// Mock modules
jest.mock('playwright');
jest.mock('fs');
jest.mock('path');

describe('fetch_tapology', () => {
  describe('countryToFlag', () => {
    it('should have flag mapping for Vietnam', () => {
      expect(countryToFlag['Vietnam']).toBe('🇻🇳');
    });

    it('should have flag mapping for Russia', () => {
      expect(countryToFlag['Russia']).toBe('🇷🇺');
    });

    it('should have flag mapping for United States', () => {
      expect(countryToFlag['United States']).toBe('🇺🇸');
    });

    it('should have flag mapping for Brazil', () => {
      expect(countryToFlag['Brazil']).toBe('🇧🇷');
    });

    it('should have flag mapping for all major MMA countries', () => {
      const expectedCountries = [
        'Vietnam', 'Russia', 'United States', 'Brazil', 'Thailand',
        'Korea', 'Japan', 'China', 'Philippines', 'Australia',
        'United Kingdom', 'France', 'Germany', 'Netherlands',
        'Sweden', 'Poland', 'Mexico', 'Canada', 'Ireland'
      ];

      expectedCountries.forEach(country => {
        expect(countryToFlag[country]).toBeDefined();
        expect(countryToFlag[country]).toMatch(/\p{Emoji}/u);
      });
    });
  });

  describe('parseArgs', () => {
    const originalArgv = process.argv;

    afterEach(() => {
      process.argv = originalArgv;
    });

    it('should parse event URL from --event argument', () => {
      process.argv = ['node', 'script.js', '--event', 'https://www.tapology.com/fightcenter/events/102834'];
      const result = parseArgs();
      expect(result.eventUrl).toBe('https://www.tapology.com/fightcenter/events/102834');
    });

    it('should return empty object when no arguments provided', () => {
      process.argv = ['node', 'script.js'];
      const result = parseArgs();
      expect(result.eventUrl).toBeUndefined();
    });

    it('should handle missing event URL value', () => {
      process.argv = ['node', 'script.js', '--event'];
      const result = parseArgs();
      expect(result.eventUrl).toBeUndefined();
    });

    it('should parse event URL from middle of arguments', () => {
      process.argv = ['node', 'script.js', 'other', '--event', 'https://example.com', 'more'];
      const result = parseArgs();
      expect(result.eventUrl).toBe('https://example.com');
    });
  });

  describe('explore_event', () => {
    let mockBrowser: jest.Mocked<Browser>;
    let mockPage: jest.Mocked<Page>;
    let mockLocator: any;

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();

      // Mock page.locator
      mockLocator = {
        first: jest.fn().mockReturnThis(),
        isVisible: jest.fn().mockResolvedValue(false),
        click: jest.fn().mockResolvedValue(undefined)
      };

      // Mock page
      mockPage = {
        goto: jest.fn().mockResolvedValue(undefined),
        waitForTimeout: jest.fn().mockResolvedValue(undefined),
        locator: jest.fn().mockReturnValue(mockLocator),
        on: jest.fn(),
        evaluate: jest.fn().mockResolvedValue({
          fights: [],
          title: 'Test Event',
          promotionLinks: []
        } as ScrapedEventData)
      } as any;

      // Mock browser
      mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined)
      } as any;

      // Mock chromium.launch
      (chromium.launch as jest.Mock).mockResolvedValue(mockBrowser);

      // Mock fs.writeFileSync
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

      // Mock path.join
      (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
    });

    it('should extract event ID from URL', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834-lion-championship-3';

      await explore_event(testUrl);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('event-102834-scraped.json'),
        expect.any(String)
      );
    });

    it('should launch browser with correct options', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';

      await explore_event(testUrl);

      expect(chromium.launch).toHaveBeenCalledWith({
        headless: true,
        timeout: 60000
      });
    });

    it('should navigate to event URL', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';

      await explore_event(testUrl);

      expect(mockPage.goto).toHaveBeenCalledWith(testUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
    });

    it('should wait for page to load', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';

      await explore_event(testUrl);

      expect(mockPage.waitForTimeout).toHaveBeenCalledWith(3000);
    });

    it('should attempt to click Fight Card tab if visible', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';
      mockLocator.isVisible.mockResolvedValue(true);

      await explore_event(testUrl);

      expect(mockPage.locator).toHaveBeenCalledWith('text=Fight Card');
      expect(mockLocator.click).toHaveBeenCalled();
    });

    it('should not click Fight Card tab if not visible', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';
      mockLocator.isVisible.mockResolvedValue(false);

      await explore_event(testUrl);

      expect(mockLocator.click).not.toHaveBeenCalled();
    });

    it('should extract event data from page', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';
      const mockEventData: ScrapedEventData = {
        title: 'Lion Championship 3',
        date: 'NOVEMBER 23, 2024',
        location: 'Corona Resort & Casino, Phu Quoc, Vietnam',
        promotionLinks: [
          { url: 'https://lionchampionship.com', text: 'Lion Championship' }
        ],
        fights: [
          {
            category: 'CHAMPIONSHIP',
            matches: [
              {
                round: 'Main Event - LC Lightweight Championship',
                fighter1: {
                  name: 'Fighter One',
                  url: 'https://tapology.com/fighter1',
                  country: 'Vietnam',
                  record: '',
                  weight: '154 lbs',
                  gender: 'Nam',
                  winner: true
                },
                fighter2: {
                  name: 'Fighter Two',
                  url: 'https://tapology.com/fighter2',
                  country: 'Russia',
                  record: '',
                  weight: '154 lbs',
                  gender: 'Nam',
                  winner: false
                }
              }
            ]
          }
        ]
      };

      mockPage.evaluate.mockResolvedValue(mockEventData);

      await explore_event(testUrl);

      expect(mockPage.evaluate).toHaveBeenCalled();
    });

    it('should save formatted data to file', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834-lion-championship-3';
      const mockEventData: ScrapedEventData = {
        title: 'Lion Championship 3',
        promotionLinks: [],
        fights: []
      };

      mockPage.evaluate.mockResolvedValue(mockEventData);

      await explore_event(testUrl);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('event-102834-scraped.json'),
        expect.stringContaining('"id"')
      );
    });

    it('should generate correct event ID and logo from title', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';
      const mockEventData: ScrapedEventData = {
        title: 'Lion Championship 3',
        promotionLinks: [],
        fights: []
      };

      mockPage.evaluate.mockResolvedValue(mockEventData);

      await explore_event(testUrl);

      const savedData = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData.id).toBe('lc3');
      expect(parsedData.logo).toBe('LC3');
    });

    it('should use default ID when title does not match pattern', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/999999';
      const mockEventData: ScrapedEventData = {
        title: 'Some Other Event',
        promotionLinks: [],
        fights: []
      };

      mockPage.evaluate.mockResolvedValue(mockEventData);

      await explore_event(testUrl);

      const savedData = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData.id).toBe('lc');
      expect(parsedData.logo).toBe('LC');
    });

    it('should format fighter data with correct flag emoji', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';
      const mockEventData: ScrapedEventData = {
        title: 'Test Event',
        promotionLinks: [],
        fights: [
          {
            category: 'CHAMPIONSHIP',
            matches: [
              {
                round: 'Main Event',
                fighter1: {
                  name: 'Vietnamese Fighter',
                  url: 'https://tapology.com/fighter1',
                  country: 'Vietnam',
                  record: '',
                  weight: '154 lbs',
                  gender: 'Nam',
                  winner: true
                },
                fighter2: {
                  name: 'Russian Fighter',
                  url: 'https://tapology.com/fighter2',
                  country: 'Russia',
                  record: '',
                  weight: '154 lbs',
                  gender: 'Nam',
                  winner: false
                }
              }
            ]
          }
        ]
      };

      mockPage.evaluate.mockResolvedValue(mockEventData);

      await explore_event(testUrl);

      const savedData = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData.fights[0].matches[0].fighter1.flag).toBe('🇻🇳');
      expect(parsedData.fights[0].matches[0].fighter2.flag).toBe('🇷🇺');
    });

    it('should use default flag for unknown country', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';
      const mockEventData: ScrapedEventData = {
        title: 'Test Event',
        promotionLinks: [],
        fights: [
          {
            category: 'CHAMPIONSHIP',
            matches: [
              {
                round: 'Main Event',
                fighter1: {
                  name: 'Unknown Fighter',
                  url: 'https://tapology.com/fighter1',
                  country: 'Unknown Country',
                  record: '',
                  weight: '154 lbs',
                  gender: 'Nam',
                  winner: true
                },
                fighter2: {
                  name: 'Another Fighter',
                  url: 'https://tapology.com/fighter2',
                  country: 'Unknown',
                  record: '',
                  weight: '154 lbs',
                  gender: 'Nam',
                  winner: false
                }
              }
            ]
          }
        ]
      };

      mockPage.evaluate.mockResolvedValue(mockEventData);

      await explore_event(testUrl);

      const savedData = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData.fights[0].matches[0].fighter1.flag).toBe('🏳️');
      expect(parsedData.fights[0].matches[0].fighter2.flag).toBe('🏳️');
    });

    it('should close browser after completion', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';

      await explore_event(testUrl);

      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should close browser even if error occurs', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';
      mockPage.goto.mockRejectedValue(new Error('Navigation failed'));

      await explore_event(testUrl);

      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle page close event', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';

      await explore_event(testUrl);

      expect(mockPage.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('should include promotion links in formatted data', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';
      const mockEventData: ScrapedEventData = {
        title: 'Test Event',
        promotionLinks: [
          { url: 'https://lionchampionship.com', text: 'Lion Championship' },
          { url: 'https://example.com/stream', text: 'Live Stream' }
        ],
        fights: []
      };

      mockPage.evaluate.mockResolvedValue(mockEventData);

      await explore_event(testUrl);

      const savedData = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData.promotionLinks).toHaveLength(2);
      expect(parsedData.promotionLinks[0]).toEqual({
        url: 'https://lionchampionship.com',
        text: 'Lion Championship'
      });
    });

    it('should set status to completed', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834';

      await explore_event(testUrl);

      const savedData = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData.status).toBe('completed');
    });

    it('should include event URL in formatted data', async () => {
      const testUrl = 'https://www.tapology.com/fightcenter/events/102834-lion-championship';

      await explore_event(testUrl);

      const savedData = (fs.writeFileSync as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);

      expect(parsedData.url).toBe(testUrl);
    });
  });
});
