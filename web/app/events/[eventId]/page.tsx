'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import EventsPage from '@/components/EventsPage'
import { TournamentData, EventData } from '@/types'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [currentTournament, setCurrentTournament] = useState<'ufc' | 'lion'>('lion')
  const [currentPage, setCurrentPage] = useState('events')
  const [tournamentData, setTournamentData] = useState<{ ufc?: TournamentData; lion?: TournamentData }>({})
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load data
    async function loadData() {
      try {
        const [
          ufcAthletesRes,
          ufcRankingsRes,
          ufcEventsRes,
          lionAthletesRes,
          lionRankingsRes,
          lionEventsRes,
        ] = await Promise.all([
          fetch('/data/ufc/athletes.json'),
          fetch('/data/ufc/rankings.json'),
          fetch('/data/ufc/events.json'),
          fetch('/data/lion/athletes.json'),
          fetch('/data/lion/rankings.json'),
          fetch('/data/lion/events.json'),
        ])

        const ufcAthletes = await ufcAthletesRes.json()
        const ufcRankings = await ufcRankingsRes.json()
        const ufcEvents = await ufcEventsRes.json()
        const lionAthletes = await lionAthletesRes.json()
        const lionRankings = await lionRankingsRes.json()
        const lionEvents = await lionEventsRes.json()

        // Merge data for each tournament
        const ufc = {
          ...ufcAthletes,
          ...ufcRankings,
          champion: ufcRankings.divisions.lightweight.champion,
          rankings: ufcRankings.divisions.lightweight.rankings,
          athletes: ufcAthletes.athletes,
          divisions: ufcAthletes.divisions,
        }

        const lion = {
          ...lionAthletes,
          ...lionRankings,
          champion: lionRankings.divisions.lightweight.champion,
          rankings: lionRankings.divisions.lightweight.rankings,
          athletes: lionAthletes.athletes,
          divisions: lionAthletes.divisions,
        }

        setTournamentData({ ufc, lion })

        // Find the event by ID
        const allEvents = [...(ufcEvents.events || []), ...(lionEvents.events || [])]
        const foundEvent = allEvents.find((event: EventData) => event.id === eventId)

        if (foundEvent) {
          setEventData(foundEvent)
          // Determine tournament based on event ID
          if (eventId.startsWith('ufc')) {
            setCurrentTournament('ufc')
          } else if (eventId.startsWith('lc')) {
            setCurrentTournament('lion')
          }
        } else {
          // Event not found, redirect to events page
          router.push('/events')
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [eventId, router])

  useEffect(() => {
    // Update theme
    if (currentTournament === 'lion') {
      document.body.classList.add('lion-theme')
    } else {
      document.body.classList.remove('lion-theme')
    }
  }, [currentTournament])

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    router.push(`/${page}`)
  }

  const currentTournamentData = tournamentData[currentTournament]

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-text">Loading...</div>
        <style jsx>{`
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #000;
          }
          .loading-text {
            font-size: 24px;
            color: #fff;
          }
        `}</style>
      </div>
    )
  }

  if (!eventData) {
    return null
  }

  return (
    <>
      <Header
        currentTournament={currentTournament}
        onTournamentChange={setCurrentTournament}
        tournamentName={currentTournamentData?.name || 'LION CHAMPIONSHIP'}
      />
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />

      <main className="container">
        <EventsPage eventData={eventData} />
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
      `}</style>
    </>
  )
}
