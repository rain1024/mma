import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import type {
  CountryToFlag,
  MatchData,
  ScrapedEventData,
  ScrapedEventOutput
} from './tapology_types';

// Country code to flag emoji mapping
export const countryToFlag: CountryToFlag = {
  'Vietnam': '🇻🇳',
  'Russia': '🇷🇺',
  'United States': '🇺🇸',
  'Brazil': '🇧🇷',
  'Thailand': '🇹🇭',
  'Korea': '🇰🇷',
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'Philippines': '🇵🇭',
  'Australia': '🇦🇺',
  'United Kingdom': '🇬🇧',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪',
  'Poland': '🇵🇱',
  'Mexico': '🇲🇽',
  'Canada': '🇨🇦',
  'Ireland': '🇮🇪',
};

export async function explore_event(event_url: string): Promise<void> {
  // Extract event ID from URL for dynamic filename
  const eventUrlMatch = event_url.match(/events\/(\d+)/);
  const eventId = eventUrlMatch ? eventUrlMatch[1] : 'unknown';

  const browser: Browser = await chromium.launch({
    headless: true,
    timeout: 60000
  });
  const page: Page = await browser.newPage();

  // Prevent browser from closing unexpectedly
  page.on('close', () => {
    console.log('Page closed unexpectedly');
  });

  try {
    console.log('Navigating to page...');
    await page.goto(event_url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('Waiting for page to load...');
    await page.waitForTimeout(3000);

    // Click on Fight Card tab if available
    try {
      const fightCardTab = await page.locator('text=Fight Card').first();
      if (await fightCardTab.isVisible()) {
        await fightCardTab.click();
        console.log('Clicked Fight Card tab');
        await page.waitForTimeout(2000);
      }
    } catch (e) {
      console.log('Fight Card tab not found or already selected');
    }

    console.log('Extracting fight data...');

    // Extract event details
    const eventData: ScrapedEventData = await page.evaluate(() => {
      const data: ScrapedEventData = {
        fights: [],
        title: '',
        promotionLinks: []
      };

      // Extract event title from h1 or page title
      const h1Element = document.querySelector('h1');
      if (h1Element) {
        data.title = h1Element.textContent?.trim() || '';
      } else {
        // Fallback to document title
        const titleMatch = document.title.match(/^([^|]+)/);
        if (titleMatch) {
          data.title = titleMatch[1].trim();
        }
      }

      // Get event date and location from the event info section
      const locationText = document.body.textContent || '';
      const dateMatch = locationText.match(/NOVEMBER\s+(\d+),\s+(\d+)/i) ||
                       locationText.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
      if (dateMatch) {
        data.date = dateMatch[0];
      }

      const locationMatch = locationText.match(/Phu Quoc,\s*Vietnam/i);
      if (locationMatch) {
        data.location = 'Corona Resort & Casino, Phu Quoc, Vietnam';
      }

      // Extract Promotion Links
      const promotionSection = Array.from(document.querySelectorAll('*')).find(el =>
        el.textContent?.includes('Promotion Links:') || el.textContent?.includes('Promotion:')
      );

      if (promotionSection) {
        // Find all links near the promotion section
        const container = promotionSection.closest('div, section');
        if (container) {
          const links = container.querySelectorAll('a[href]');
          links.forEach(link => {
            const anchor = link as HTMLAnchorElement;
            const href = anchor.href;
            const text = anchor.textContent?.trim() || '';

            // Only include external links (not Tapology internal links)
            if (href && !href.includes('tapology.com') && text) {
              data.promotionLinks.push({
                url: href,
                text: text
              });
            }
          });
        }
      }

      // Also try to find promotion link directly
      const promotionLink = document.querySelector('a[href*="lionchampionship"]') as HTMLAnchorElement | null;
      if (promotionLink && !data.promotionLinks.find(l => l.url === promotionLink.href)) {
        data.promotionLinks.push({
          url: promotionLink.href,
          text: promotionLink.textContent?.trim() || 'Lion Championship'
        });
      }

      console.log('Found', data.promotionLinks.length, 'promotion links');

      // Debug: Check what containers exist
      const allFighterLinks = Array.from(document.querySelectorAll('a[href*="/fightcenter/fighters/"]'));
      console.log('Total fighter links on page:', allFighterLinks.length);

      // Try different selectors to find bout containers
      const borderDivs = document.querySelectorAll('div[class*="border"]');
      console.log('Divs with border class:', borderDivs.length);

      // Find all bout containers first - try broader selector
      const boutContainers = Array.from(document.querySelectorAll('div')).filter(el => {
        // Only include containers that have exactly 2 or more fighter links
        const linksInContainer = el.querySelectorAll('a[href*="/fightcenter/fighters/"]').length;
        return linksInContainer >= 2 && linksInContainer <= 10; // Reasonable range for a bout
      });

      console.log('Found', boutContainers.length, 'potential bout containers');

      const matches: MatchData[] = [];
      const processedFighterUrls = new Set<string>();

      // Process each bout container
      for (const boutContainer of boutContainers) {
        try {
          // Get all fighter links in this bout container
          const fighterLinks = Array.from(boutContainer.querySelectorAll('a[href*="/fightcenter/fighters/"]')) as HTMLAnchorElement[];

          // Deduplicate by URL - each fighter appears multiple times
          const uniqueFighters: HTMLAnchorElement[] = [];
          const seenUrls = new Set<string>();

          for (const link of fighterLinks) {
            const url = link.href;
            if (!seenUrls.has(url)) {
              seenUrls.add(url);
              uniqueFighters.push(link);
            }
          }

          // We need exactly 2 fighters per bout
          if (uniqueFighters.length !== 2) {
            console.log(`Skipping bout with ${uniqueFighters.length} unique fighters`);
            continue;
          }

          const fighter1Link = uniqueFighters[0];
          const fighter2Link = uniqueFighters[1];

          // Skip if we've already processed this fighter URL (additional deduplication)
          if (processedFighterUrls.has(fighter1Link.href) || processedFighterUrls.has(fighter2Link.href)) {
            console.log('Skipping duplicate bout');
            continue;
          }

          processedFighterUrls.add(fighter1Link.href);
          processedFighterUrls.add(fighter2Link.href);

          const fighter1Name = fighter1Link.textContent?.trim() || '';
          const fighter2Name = fighter2Link.textContent?.trim() || '';

          // Get fighter profile URLs
          const fighter1Url = fighter1Link.href;
          const fighter2Url = fighter2Link.href;

          // Get the parent containers for each fighter
          const f1Container = fighter1Link.closest('[class*="rounded"]') || fighter1Link.parentElement;
          const f2Container = fighter2Link.closest('[class*="rounded"]') || fighter2Link.parentElement;

          // Get championship title - look for text containing "Championship" or "Main Event"
          let round = '';
          const boutText = boutContainer.textContent || '';

          // Try to find championship title
          const champMatch = boutText.match(/(Main Event - )?LC\s+\w+\s+Championship(\s+-\s+(Women|Men))?/i) ||
                            boutText.match(/\w+weight\s+Championship/i) ||
                            boutText.match(/Championship/i);
          if (champMatch) {
            round = champMatch[0].trim();
          }

          // Determine winner - check if container has green or red/pink styling
          // "Up to" in text means winner, "Down to" means loser
          const f1Text = f1Container ? f1Container.textContent || '' : '';
          const f2Text = f2Container ? f2Container.textContent || '' : '';

          const f1Winner = f1Text.includes('Up to');
          const f2Winner = f2Text.includes('Up to');

          // Extract weight - try multiple patterns
          let weight = '';
          const weightMatch = boutText.match(/(\d+)\s*lbs/i) ||
                             boutText.match(/(\d+)\s*lb/i) ||
                             boutText.match(/(\d+)\s*pounds/i);

          // If no weight found, infer from division name
          if (!weight && round) {
            const divisionWeights: { [key: string]: string } = {
              'Strawweight': '115 lbs',
              'Flyweight': '126 lbs',
              'Bantamweight': '134 lbs',
              'Featherweight': '146 lbs',
              'Lightweight': '154 lbs',
              'Welterweight': '170 lbs'
            };

            for (const [division, divWeight] of Object.entries(divisionWeights)) {
              if (round.includes(division)) {
                weight = divWeight;
                break;
              }
            }
          } else if (weightMatch) {
            weight = weightMatch[1] + ' lbs';
          }

          // Extract gender - check for female indicators or Vietnamese female name patterns
          let gender = 'Nam'; // Default to male

          // Check for explicit female indicators
          if (boutText.includes('Women') || boutText.includes('Female')) {
            gender = 'Nữ';
          }
          // Check fighter names for Vietnamese female patterns (Thị, Thi at the end)
          else if (fighter1Name.includes('Thị') || fighter1Name.includes(' Thi') ||
                   fighter2Name.includes('Thị') || fighter2Name.includes(' Thi')) {
            gender = 'Nữ';
          }

          // Extract country from fighter page or text
          // For now, check if name suggests non-Vietnamese origin
          const getCountry = (name: string, text: string): string => {
            if (name.includes('Aleksei') || name.includes('Filonenko')) return 'Russia';
            if (text.includes('Russia') || text.includes('RUS')) return 'Russia';
            return 'Vietnam';
          };

          const f1Country = getCountry(fighter1Name, f1Text);
          const f2Country = getCountry(fighter2Name, f2Text);

          matches.push({
            round: round,
            fighter1: {
              name: fighter1Name,
              url: fighter1Url,
              country: f1Country,
              record: '',
              weight: weight,
              gender: gender,
              winner: f1Winner
            },
            fighter2: {
              name: fighter2Name,
              url: fighter2Url,
              country: f2Country,
              record: '',
              weight: weight,
              gender: gender,
              winner: f2Winner
            }
          });

          console.log(`Match ${matches.length}: ${fighter1Name} vs ${fighter2Name}, winner: ${f1Winner ? fighter1Name : (f2Winner ? fighter2Name : 'Unknown')}`);
        } catch (e) {
          const error = e as Error;
          console.log('Error processing bout:', error.message);
        }
      }

      if (matches.length > 0) {
        data.fights.push({
          category: 'CHAMPIONSHIP',
          matches: matches
        });
      }

      return data;
    });

    console.log('\n=== Extracted Event Data ===\n');
    console.log(JSON.stringify(eventData, null, 2));

    // Generate dynamic ID and logo from title or URL
    let eventShortId = 'lc';
    let logoText = 'LC';
    const titleMatch = eventData.title.match(/Lion Championship\s+(\d+)/i);
    if (titleMatch) {
      eventShortId = `lc${titleMatch[1]}`;
      logoText = `LC${titleMatch[1]}`;
    }

    // Format the data to match our structure
    const formattedData: ScrapedEventOutput = {
      id: eventShortId,
      eventId: eventId,
      url: event_url,
      logo: logoText,
      title: eventData.title,
      date: eventData.date,
      location: eventData.location,
      status: 'completed',
      promotionLinks: eventData.promotionLinks || [],
      fights: eventData.fights.map(fight => ({
        category: fight.category,
        matches: fight.matches.map(match => ({
          round: match.round,
          fighter1: {
            name: match.fighter1.name,
            link: match.fighter1.url,
            stats: `${match.fighter1.weight} - ${match.fighter1.gender}`,
            flag: countryToFlag[match.fighter1.country] || '🏳️',
            winner: match.fighter1.winner
          },
          fighter2: {
            name: match.fighter2.name,
            link: match.fighter2.url,
            stats: `${match.fighter2.weight} - ${match.fighter2.gender}`,
            flag: countryToFlag[match.fighter2.country] || '🏳️',
            winner: match.fighter2.winner
          }
        }))
      }))
    };

    console.log('\n=== Formatted Data ===\n');
    console.log(JSON.stringify(formattedData, null, 2));

    // Save to file with dynamic filename based on event ID
    const outputPath = path.join(__dirname, `event-${eventId}-scraped.json`);
    fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));
    console.log(`\nData saved to: ${outputPath}`);

  } catch (error) {
    console.error('Error scraping data:', error);
  } finally {
    await browser.close();
  }
}

// Parse CLI arguments
export function parseArgs(): { eventUrl?: string } {
  const args = process.argv.slice(2);
  const params: { eventUrl?: string } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--event' && i + 1 < args.length) {
      params.eventUrl = args[i + 1];
      i++;
    }
  }

  return params;
}

// Main execution
if (require.main === module) {
  (async () => {
    const { eventUrl } = parseArgs();

    if (!eventUrl) {
      console.error('Error: Event URL is required');
      console.log('Usage: npm run fetch:tapology -- --event <event_url>');
      console.log('Example: npm run fetch:tapology -- --event https://www.tapology.com/fightcenter/events/102834-lion-championship-3');
      process.exit(1);
    }

    console.log(`Fetching event from: ${eventUrl}\n`);
    await explore_event(eventUrl);
  })();
}
