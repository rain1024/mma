import { EventData } from '@/types'
import Link from 'next/link'
import { generateAthleteSlug } from '@/lib/utils'

interface EventsPageProps {
  eventData: EventData
  tournament?: 'ufc' | 'lion'
}

export default function EventsPage({ eventData, tournament = 'lion' }: EventsPageProps) {
  return (
    <div className="events-page">
      <div className="event-header">
        <div className="event-logo">{eventData.logo}</div>
        <div className="event-title">{eventData.title}</div>
        <div className="event-info">{eventData.date}</div>
        <div className="event-location">{eventData.location}</div>
      </div>

      {eventData.fights?.map((fightCategory, categoryIndex) => (
        <div key={categoryIndex}>
          <div className="fight-category">{fightCategory.category}</div>

          {fightCategory.matches.map((match, matchIndex) => {
            const winnerClass = match.fighter1.winner
              ? 'winner-left'
              : match.fighter2.winner
              ? 'winner-right'
              : ''

            // Generate unique match ID
            const matchId = `${eventData.id}-${categoryIndex}-${matchIndex}`

            // Generate video player URL
            const videoPlayerUrl = match.video
              ? `/matches/${matchId}?type=youtube&url=${encodeURIComponent(match.video)}&tournament=${tournament}`
              : null

            // Generate athlete slugs for navigation
            const fighter1Slug = generateAthleteSlug(match.fighter1.name)
            const fighter2Slug = generateAthleteSlug(match.fighter2.name)

            return (
              <div key={matchIndex} className={`fight-card ${winnerClass}`}>
                <div className="fighter">
                  <div className="fighter-image">
                    <div className="fighter-flag">{match.fighter1.flag}</div>
                  </div>
                  <div className="fighter-details">
                    <Link href={`/athletes/${fighter1Slug}`} className="fighter-name-link">
                      <div className="fighter-name-text">{match.fighter1.name}</div>
                    </Link>
                    <div className="fighter-stats">{match.fighter1.stats}</div>
                  </div>
                </div>

                <div className="vs-divider">
                  <span>VS</span>
                  <span className="fight-round">{match.round}</span>
                  {match.result && (
                    <div className="match-result">
                      <div className="result-method">{match.result.method}</div>
                      {match.result.technique && (
                        <div className="result-technique">{match.result.technique}</div>
                      )}
                      <div className="result-time">{match.result.time} - {match.result.round}</div>
                    </div>
                  )}
                  {videoPlayerUrl && (
                    <Link href={videoPlayerUrl} className="watch-video-btn">
                      Watch Video
                    </Link>
                  )}
                </div>

                <div className="fighter right">
                  <div className="fighter-image">
                    <div className="fighter-flag">{match.fighter2.flag}</div>
                  </div>
                  <div className="fighter-details">
                    <Link href={`/athletes/${fighter2Slug}`} className="fighter-name-link">
                      <div className="fighter-name-text">{match.fighter2.name}</div>
                    </Link>
                    <div className="fighter-stats">{match.fighter2.stats}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      <style jsx>{`
        .event-header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          padding: 40px;
          border-radius: 8px;
          margin-bottom: 40px;
          text-align: center;
        }

        :global(body.lion-theme) .event-header {
          background: linear-gradient(135deg, #1a0a00 0%, #2a1500 100%);
        }

        .event-logo {
          font-size: 72px;
          font-weight: bold;
          margin-bottom: 10px;
          letter-spacing: 4px;
        }

        .event-title {
          font-size: 32px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 15px;
          letter-spacing: 3px;
        }

        .event-info {
          font-size: 16px;
          color: #999;
          margin-bottom: 5px;
        }

        .event-location {
          font-size: 14px;
          color: #666;
        }

        .fight-category {
          font-size: 24px;
          font-weight: bold;
          text-transform: uppercase;
          text-align: center;
          padding: 20px;
          background-color: #1a1a1a;
          margin: 30px 0 20px 0;
          border-left: 4px solid #d20a0a;
          letter-spacing: 2px;
        }

        :global(body.lion-theme) .fight-category {
          border-left-color: #ff8c00;
        }

        .fight-card {
          background-color: #1a1a1a;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .fight-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #d20a0a 0%, #a00808 100%);
        }

        :global(body.lion-theme) .fight-card::before {
          background: linear-gradient(90deg, #ff8c00 0%, #cc7000 100%);
        }

        .fight-card.winner-left::after,
        .fight-card.winner-right::after {
          content: 'WINNER';
          position: absolute;
          top: 15px;
          background-color: #d20a0a;
          color: #fff;
          padding: 5px 15px;
          font-size: 12px;
          font-weight: bold;
          border-radius: 20px;
          letter-spacing: 1px;
        }

        .fight-card.winner-left::after {
          left: 15px;
        }

        .fight-card.winner-right::after {
          right: 15px;
        }

        :global(body.lion-theme) .fight-card.winner-left::after,
        :global(body.lion-theme) .fight-card.winner-right::after {
          background-color: #ff8c00;
        }

        .fighter {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .fighter.right {
          flex-direction: row-reverse;
          text-align: right;
        }

        .fighter-image {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: #333;
          border: 3px solid #444;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #666;
          flex-shrink: 0;
          position: relative;
        }

        .fighter-flag {
          position: absolute;
          bottom: -5px;
          right: -5px;
          width: 30px;
          height: 20px;
          border-radius: 3px;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fighter-details {
          flex: 1;
        }

        :global(.fighter-name-link) {
          text-decoration: none !important;
          color: inherit !important;
          display: inline-block;
          transition: all 0.2s ease;
        }

        .fighter:not(.right) :global(.fighter-name-link:hover) {
          transform: translateX(4px);
        }

        .fighter.right :global(.fighter-name-link:hover) {
          transform: translateX(-4px);
        }

        :global(.fighter-name-link:hover .fighter-name-text) {
          color: var(--primary-color, #d20a0a);
          text-decoration: underline;
        }

        :global(body.lion-theme .fighter-name-link:hover .fighter-name-text) {
          color: #ff8c00;
        }

        .fighter-name-text {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .fighter-stats {
          font-size: 14px;
          color: #999;
        }

        .vs-divider {
          font-size: 24px;
          font-weight: bold;
          color: #d20a0a;
          padding: 0 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        :global(body.lion-theme) .vs-divider {
          color: #ff8c00;
        }

        .fight-round {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }

        .match-result {
          margin-top: 12px;
          padding: 12px 20px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          border: 1px solid rgba(210, 10, 10, 0.3);
        }

        :global(body.lion-theme) .match-result {
          border-color: rgba(255, 140, 0, 0.3);
        }

        .result-method {
          font-size: 14px;
          font-weight: bold;
          color: #fff;
          text-transform: uppercase;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }

        .result-technique {
          font-size: 12px;
          color: #d20a0a;
          margin-bottom: 4px;
          font-weight: 600;
        }

        :global(body.lion-theme) .result-technique {
          color: #ff8c00;
        }

        .result-time {
          font-size: 11px;
          color: #999;
          font-style: italic;
        }

        :global(.watch-video-btn) {
          display: inline-block;
          margin-top: 10px;
          padding: 10px 24px;
          background-color: #d20a0a !important;
          color: #fff !important;
          text-decoration: none !important;
          border-radius: 5px;
          font-size: 13px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(210, 10, 10, 0.4);
        }

        :global(.watch-video-btn:hover) {
          background-color: #a00808 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(210, 10, 10, 0.6);
        }

        :global(body.lion-theme .watch-video-btn) {
          background-color: #ff8c00 !important;
          box-shadow: 0 2px 8px rgba(255, 140, 0, 0.4);
        }

        :global(body.lion-theme .watch-video-btn:hover) {
          background-color: #cc7000 !important;
          box-shadow: 0 4px 12px rgba(255, 140, 0, 0.6);
        }

        @media (max-width: 768px) {
          .event-logo {
            font-size: 48px;
          }

          .event-title {
            font-size: 24px;
          }

          .fight-card {
            flex-direction: column;
            gap: 20px;
          }

          .fighter {
            width: 100%;
          }

          .fighter.right {
            flex-direction: row;
            text-align: left;
          }

          .vs-divider {
            padding: 15px 0;
          }

          .fighter-name-text {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  )
}
