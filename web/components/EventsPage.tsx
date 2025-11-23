import { EventData } from '@/types'

interface EventsPageProps {
  eventData: EventData
}

export default function EventsPage({ eventData }: EventsPageProps) {
  return (
    <div className="events-page">
      <div className="event-header">
        <div className="event-logo">{eventData.logo}</div>
        <div className="event-title">{eventData.title}</div>
        <div className="event-info">{eventData.date}</div>
        <div className="event-location">{eventData.location}</div>
      </div>

      {eventData.fights.map((fightCategory, categoryIndex) => (
        <div key={categoryIndex}>
          <div className="fight-category">{fightCategory.category}</div>

          {fightCategory.matches.map((match, matchIndex) => {
            const winnerClass = match.fighter1.winner
              ? 'winner-left'
              : match.fighter2.winner
              ? 'winner-right'
              : ''

            return (
              <div key={matchIndex} className={`fight-card ${winnerClass}`}>
                <div className="fighter">
                  <div className="fighter-image">
                    <div className="fighter-flag">{match.fighter1.flag}</div>
                  </div>
                  <div className="fighter-details">
                    <div className="fighter-name-text">{match.fighter1.name}</div>
                    <div className="fighter-stats">{match.fighter1.stats}</div>
                  </div>
                </div>

                <div className="vs-divider">
                  <span>VS</span>
                  <span className="fight-round">{match.round}</span>
                  {match.video && (
                    <a
                      href={match.video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="watch-video-btn"
                    >
                      Watch Video
                    </a>
                  )}
                </div>

                <div className="fighter right">
                  <div className="fighter-image">
                    <div className="fighter-flag">{match.fighter2.flag}</div>
                  </div>
                  <div className="fighter-details">
                    <div className="fighter-name-text">{match.fighter2.name}</div>
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

        .fighter-name-text {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
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

        .watch-video-btn {
          margin-top: 10px;
          padding: 8px 20px;
          background-color: #d20a0a;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: background-color 0.3s ease;
        }

        .watch-video-btn:hover {
          background-color: #a00808;
        }

        :global(body.lion-theme) .watch-video-btn {
          background-color: #ff8c00;
        }

        :global(body.lion-theme) .watch-video-btn:hover {
          background-color: #cc7000;
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
