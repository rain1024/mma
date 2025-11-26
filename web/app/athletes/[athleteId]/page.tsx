'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import { TournamentData, EventData, Athlete, Match, Division } from '@/types'
import { findAthleteBySlug } from '@/lib/utils'
import { fetchEvents, fetchAthletes, fetchRankings, fetchPromotions } from '@/lib/api'

// Default divisions for fallback
const DEFAULT_DIVISIONS: Division[] = [
  { value: 'heavyweight', label: 'Heavyweight' },
  { value: 'light-heavyweight', label: 'Light Heavyweight' },
  { value: 'middleweight', label: 'Middleweight' },
  { value: 'welterweight', label: 'Welterweight' },
  { value: 'lightweight', label: 'Lightweight' },
  { value: 'featherweight', label: 'Featherweight' },
  { value: 'bantamweight', label: 'Bantamweight' },
  { value: 'flyweight', label: 'Flyweight' },
]

interface FightResult {
  eventId: string
  eventTitle: string
  eventLogo?: string
  eventDate: string
  opponent: string
  result: 'win' | 'loss'
  method: string
  round?: string
  video?: string
}

export default function AthleteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const athleteId = params.athleteId as string

  const [currentTournament, setCurrentTournament] = useState<'ufc' | 'lion'>('lion')
  const [tournamentData, setTournamentData] = useState<{ ufc?: TournamentData; lion?: TournamentData }>({})
  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [fightHistory, setFightHistory] = useState<FightResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch all data from API in parallel
        const [
          ufcAthletesResult,
          ufcRankingsResult,
          lionAthletesResult,
          lionRankingsResult,
          ufcEventsResult,
          lionEventsResult,
          promotionsResult,
        ] = await Promise.all([
          fetchAthletes('ufc'),
          fetchRankings('ufc'),
          fetchAthletes('lion'),
          fetchRankings('lion'),
          fetchEvents('ufc'),
          fetchEvents('lion'),
          fetchPromotions(),
        ])

        // Get promotion info for names
        const ufcPromotion = promotionsResult.data?.promotions.find(p => p.id === 'ufc')
        const lionPromotion = promotionsResult.data?.promotions.find(p => p.id === 'lion')

        // Build UFC tournament data
        const ufcRankings = ufcRankingsResult.data
        const lightweightDivision = ufcRankings?.divisions?.lightweight
        const ufc: TournamentData = {
          name: ufcPromotion?.name || 'UFC',
          subtitle: ufcPromotion?.subtitle || 'Ultimate Fighting Championship',
          divisions: DEFAULT_DIVISIONS,
          athletes: ufcAthletesResult.data?.athletes || [],
          pfpRankings: ufcRankings?.pfpRankings || [],
          champion: lightweightDivision?.champion || { name: '', record: '', nickname: '' },
          rankings: lightweightDivision?.rankings || [],
        }

        // Build Lion tournament data
        const lionRankings = lionRankingsResult.data
        const lionLightweight = lionRankings?.divisions?.lightweight
        const lion: TournamentData = {
          name: lionPromotion?.name || 'LION CHAMPIONSHIP',
          subtitle: lionPromotion?.subtitle || "Vietnam's Premier MMA",
          divisions: DEFAULT_DIVISIONS,
          athletes: lionAthletesResult.data?.athletes || [],
          pfpRankings: lionRankings?.pfpRankings || [],
          champion: lionLightweight?.champion || { name: '', record: '', nickname: '' },
          rankings: lionLightweight?.rankings || [],
        }

        setTournamentData({ ufc, lion })

        // Get events from API results
        const ufcEvents = ufcEventsResult.data || []
        const lionEvents = lionEventsResult.data || []

        // Find athlete from both tournaments
        let foundAthlete = findAthleteBySlug(lion.athletes || [], athleteId)
        let tournament: 'ufc' | 'lion' = 'lion'

        if (!foundAthlete) {
          foundAthlete = findAthleteBySlug(ufc.athletes || [], athleteId)
          tournament = 'ufc'
        }

        if (foundAthlete) {
          setAthlete(foundAthlete)
          setCurrentTournament(tournament)

          // Build fight history from API events
          const events = tournament === 'lion' ? lionEvents : ufcEvents
          const history: FightResult[] = []

          // Build fight history from events
          events.forEach((event: EventData) => {
            event.fights?.forEach((category) => {
              category.matches.forEach((match: Match) => {
                const fighter1Name = match.fighter1.name
                const fighter2Name = match.fighter2.name

                if (fighter1Name === foundAthlete.name) {
                  history.push({
                    eventId: event.id,
                    eventTitle: event.title,
                    eventLogo: event.logo,
                    eventDate: event.date,
                    opponent: fighter2Name,
                    result: match.fighter1.winner ? 'win' : 'loss',
                    method: match.fighter2.stats || 'Decision',
                    round: match.round,
                    video: match.video,
                  })
                } else if (fighter2Name === foundAthlete.name) {
                  history.push({
                    eventId: event.id,
                    eventTitle: event.title,
                    eventLogo: event.logo,
                    eventDate: event.date,
                    opponent: fighter1Name,
                    result: match.fighter2.winner ? 'win' : 'loss',
                    method: match.fighter1.stats || 'Decision',
                    round: match.round,
                    video: match.video,
                  })
                }
              })
            })
          })

          setFightHistory(history.reverse()) // Most recent first
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [athleteId])

  useEffect(() => {
    if (currentTournament === 'lion') {
      document.body.classList.add('lion-theme')
    } else {
      document.body.classList.remove('lion-theme')
    }
  }, [currentTournament])

  const handlePageChange = (page: string) => {
    router.push(`/${page}`)
  }

  const currentTournamentData = tournamentData[currentTournament]

  if (loading) {
    return (
      <>
        <Header
          currentTournament={currentTournament}
          onTournamentChange={setCurrentTournament}
          tournamentName={currentTournamentData?.name || 'LION CHAMPIONSHIP'}
        />
        <Navigation currentPage="athletes" onPageChange={handlePageChange} />
        <main className="container">
          <div className="loading">Loading athlete details...</div>
        </main>
        <style jsx>{`
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .loading {
            text-align: center;
            font-size: 24px;
            padding: 60px 20px;
          }
        `}</style>
      </>
    )
  }

  if (!athlete) {
    return (
      <>
        <Header
          currentTournament={currentTournament}
          onTournamentChange={setCurrentTournament}
          tournamentName={currentTournamentData?.name || 'LION CHAMPIONSHIP'}
        />
        <Navigation currentPage="athletes" onPageChange={handlePageChange} />
        <main className="container">
          <div className="error">Athlete not found</div>
        </main>
        <style jsx>{`
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .error {
            text-align: center;
            font-size: 24px;
            padding: 60px 20px;
            color: #999;
          }
        `}</style>
      </>
    )
  }

  const division = currentTournamentData?.divisions?.find((d) => d.value === athlete.division)

  return (
    <>
      <Header
        currentTournament={currentTournament}
        onTournamentChange={setCurrentTournament}
        tournamentName={currentTournamentData?.name || 'LION CHAMPIONSHIP'}
      />
      <Navigation currentPage="athletes" onPageChange={handlePageChange} />

      <main className="container">
        <div className="athlete-detail">
          {/* Back button */}
          <button className="back-button" onClick={() => router.push('/athletes')}>
            ← Back to Athletes
          </button>

          {/* Athlete Header */}
          <div className="athlete-header">
            <div className="athlete-image-large">
              <div className="placeholder-image">{athlete.flag || '🥊'}</div>
            </div>

            <div className="athlete-info-main">
              {athlete.nickname && (
                <div className="athlete-nickname">&quot;{athlete.nickname}&quot;</div>
              )}
              <h1 className="athlete-name">{athlete.name}</h1>

              <div className="athlete-stats">
                <div className="stat-item">
                  <div className="stat-label">Record</div>
                  <div className="stat-value">{athlete.record}</div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">Division</div>
                  <div className="stat-value">{division?.label || athlete.division}</div>
                </div>

                <div className="stat-item">
                  <div className="stat-label">Country</div>
                  <div className="stat-value">
                    {athlete.flag} {athlete.country}
                  </div>
                </div>

                {athlete.gender && (
                  <div className="stat-item">
                    <div className="stat-label">Gender</div>
                    <div className="stat-value">{athlete.gender === 'male' ? 'Male' : 'Female'}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Links Section */}
          {athlete.urls && athlete.urls.length > 0 && (
            <div className="links-section">
              <h2 className="section-title">Links</h2>
              <div className="links-list">
                {athlete.urls.map((url, index) => (
                  <a
                    key={index}
                    href={url.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-item"
                  >
                    <span className="link-icon">🔗</span>
                    <span className="link-type">{url.type.toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Fight History */}
          <div className="fight-history-section">
            <h2 className="section-title">Fight History</h2>

            {fightHistory.length > 0 ? (
              <div className="fights-list">
                {fightHistory.map((fight, index) => (
                  <div key={index} className={`fight-item ${fight.result}`}>
                    <div className="fight-result-badge">{fight.result.toUpperCase()}</div>

                    <div className="fight-details">
                      <div
                        className="fight-event-container clickable"
                        onClick={() => router.push(`/events/${fight.eventId}`)}
                      >
                        <div className="event-logo">{fight.eventLogo}</div>
                        <div className="fight-event">{fight.eventTitle}</div>
                      </div>
                      <div className="fight-date">{fight.eventDate}</div>
                      <div className="fight-opponent">vs {fight.opponent}</div>
                      <div className="fight-method">
                        {fight.method} • Round {fight.round}
                      </div>
                    </div>

                    {fight.video && (
                      <a
                        href={fight.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="watch-video-btn"
                      >
                        Watch Video
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-fights">No fight history available</div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .athlete-detail {
          padding: 20px 0;
        }

        .back-button {
          padding: 10px 20px;
          background: transparent;
          border: 2px solid #666;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          transition: all 0.3s ease;
          border-radius: 4px;
          margin-bottom: 30px;
        }

        .back-button:hover {
          border-color: var(--primary-color, #d20a0a);
          background: rgba(210, 10, 10, 0.1);
        }

        .athlete-header {
          display: flex;
          gap: 40px;
          margin-bottom: 60px;
          background: rgba(255, 255, 255, 0.05);
          padding: 40px;
          border-radius: 8px;
        }

        .athlete-image-large {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .placeholder-image {
          font-size: 120px;
          opacity: 0.5;
        }

        .athlete-info-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .athlete-nickname {
          font-size: 18px;
          color: var(--primary-color, #d20a0a);
          margin-bottom: 10px;
          font-style: italic;
        }

        .athlete-name {
          font-size: 48px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 30px;
          letter-spacing: 2px;
        }

        .athlete-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }

        .stat-item {
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #fff;
        }

        .links-section {
          margin-top: 40px;
          margin-bottom: 40px;
        }

        .links-list {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .link-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid #666;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .link-item:hover {
          border-color: var(--primary-color, #d20a0a);
          background: rgba(210, 10, 10, 0.1);
          transform: translateY(-2px);
        }

        .link-icon {
          font-size: 20px;
        }

        .link-type {
          font-size: 14px;
          font-weight: bold;
          color: #fff;
          text-transform: uppercase;
        }

        .fight-history-section {
          margin-top: 40px;
        }

        .section-title {
          font-size: 32px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 30px;
          letter-spacing: 1px;
        }

        .fights-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .fight-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 20px;
          border-left: 4px solid transparent;
        }

        .fight-item.win {
          border-left-color: #4caf50;
        }

        .fight-item.loss {
          border-left-color: #f44336;
        }

        .fight-result-badge {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 14px;
          min-width: 60px;
          text-align: center;
        }

        .fight-item.win .fight-result-badge {
          background: #4caf50;
          color: #fff;
        }

        .fight-item.loss .fight-result-badge {
          background: #f44336;
          color: #fff;
        }

        .fight-details {
          flex: 1;
        }

        .fight-event-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }

        .fight-event-container.clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .fight-event-container.clickable:hover .fight-event {
          text-decoration: underline;
          opacity: 0.8;
        }

        .event-logo {
          font-size: 14px;
          font-weight: bold;
          padding: 4px 8px;
          background: var(--primary-color, #d20a0a);
          border-radius: 4px;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .fight-event {
          font-size: 18px;
          font-weight: bold;
          color: var(--primary-color, #d20a0a);
        }

        .fight-date {
          font-size: 12px;
          color: #999;
          margin-bottom: 5px;
        }

        .fight-opponent {
          font-size: 16px;
          margin-bottom: 5px;
        }

        .fight-method {
          font-size: 14px;
          color: #ccc;
        }

        :global(.watch-video-btn) {
          display: inline-block;
          padding: 12px 24px;
          background: #d20a0a !important;
          color: #fff !important;
          text-decoration: none !important;
          border-radius: 4px;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(210, 10, 10, 0.4);
        }

        :global(.watch-video-btn:hover) {
          background: rgba(210, 10, 10, 0.8) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(210, 10, 10, 0.6);
        }

        :global(body.lion-theme .watch-video-btn) {
          background: #ff8c00 !important;
          box-shadow: 0 2px 8px rgba(255, 140, 0, 0.4);
        }

        :global(body.lion-theme .watch-video-btn:hover) {
          background: #cc7000 !important;
          box-shadow: 0 4px 12px rgba(255, 140, 0, 0.6);
        }

        .no-fights {
          text-align: center;
          font-size: 18px;
          color: #999;
          padding: 40px 20px;
        }

        @media (max-width: 768px) {
          .athlete-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 20px;
          }

          .athlete-image-large {
            width: 200px;
            height: 200px;
          }

          .placeholder-image {
            font-size: 80px;
          }

          .athlete-name {
            font-size: 32px;
          }

          .athlete-stats {
            grid-template-columns: 1fr 1fr;
          }

          .fight-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .watch-video-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </>
  )
}
