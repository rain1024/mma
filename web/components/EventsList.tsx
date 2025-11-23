'use client'

import { useRouter } from 'next/navigation'
import { EventData } from '@/types'

interface EventsListProps {
  events: EventData[]
  tournament: 'ufc' | 'lion'
}

export default function EventsList({ events, tournament }: EventsListProps) {
  const router = useRouter()

  // Sort events: upcoming first, then by date (latest first for completed)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1
    return 0
  })

  const latestEvent = sortedEvents[0]

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  return (
    <div className="events-list">
      <div className="page-title">Events</div>

      {latestEvent && (
        <div className="latest-event-section">
          <div className="section-label">Latest Event</div>
          <div className="latest-event-card" onClick={() => handleEventClick(latestEvent.id)}>
            <div className="event-logo">{latestEvent.logo}</div>
            <div className="event-info">
              <div className="event-title">{latestEvent.title}</div>
              <div className="event-date">{latestEvent.date}</div>
              <div className="event-location">{latestEvent.location}</div>
              <div className={`event-status ${latestEvent.status}`}>
                {latestEvent.status === 'upcoming' ? 'Upcoming' : 'Completed'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="all-events-section">
        <div className="section-label">All Events</div>
        <div className="events-grid">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="event-card"
              onClick={() => handleEventClick(event.id)}
            >
              <div className="event-logo-small">{event.logo}</div>
              <div className="event-card-info">
                <div className="event-card-title">{event.title}</div>
                <div className="event-card-date">{event.date}</div>
                <div className={`event-status ${event.status}`}>
                  {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .page-title {
          font-size: 48px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 40px;
          letter-spacing: 2px;
        }

        .section-label {
          font-size: 24px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 20px;
          letter-spacing: 1px;
          color: #999;
        }

        .latest-event-section {
          margin-bottom: 60px;
        }

        .latest-event-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border-radius: 8px;
          padding: 40px;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          border-top: 4px solid #d20a0a;
        }

        .latest-event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(210, 10, 10, 0.3);
        }

        :global(body.lion-theme) .latest-event-card {
          background: linear-gradient(135deg, #1a0a00 0%, #2a1500 100%);
          border-top-color: #ff8c00;
        }

        :global(body.lion-theme) .latest-event-card:hover {
          box-shadow: 0 8px 24px rgba(255, 140, 0, 0.3);
        }

        .event-logo {
          font-size: 64px;
          font-weight: bold;
          margin-bottom: 20px;
          letter-spacing: 4px;
        }

        .event-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .event-title {
          font-size: 28px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .event-date {
          font-size: 16px;
          color: #999;
        }

        .event-location {
          font-size: 14px;
          color: #666;
        }

        .event-status {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 10px;
          width: fit-content;
        }

        .event-status.upcoming {
          background-color: #d20a0a;
          color: #fff;
        }

        .event-status.completed {
          background-color: #333;
          color: #999;
        }

        :global(body.lion-theme) .event-status.upcoming {
          background-color: #ff8c00;
        }

        .all-events-section {
          margin-top: 60px;
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .event-card {
          background-color: #1a1a1a;
          border-radius: 8px;
          padding: 30px;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          border-left: 4px solid #d20a0a;
        }

        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(210, 10, 10, 0.2);
        }

        :global(body.lion-theme) .event-card {
          border-left-color: #ff8c00;
        }

        :global(body.lion-theme) .event-card:hover {
          box-shadow: 0 4px 12px rgba(255, 140, 0, 0.2);
        }

        .event-logo-small {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 15px;
          letter-spacing: 2px;
        }

        .event-card-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .event-card-title {
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .event-card-date {
          font-size: 14px;
          color: #999;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 32px;
          }

          .latest-event-card {
            padding: 30px 20px;
          }

          .event-logo {
            font-size: 48px;
          }

          .event-title {
            font-size: 20px;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
