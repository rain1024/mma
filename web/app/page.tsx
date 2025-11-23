'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import EventsList from '@/components/EventsList'
import AthletesPage from '@/components/AthletesPage'
import { TournamentData, EventData } from '@/types'

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentTournament, setCurrentTournament] = useState<'ufc' | 'lion'>('lion')
  const [currentPage, setCurrentPage] = useState('events')
  const [tournamentData, setTournamentData] = useState<{ ufc?: TournamentData; lion?: TournamentData }>({})
  const [allEvents, setAllEvents] = useState<{ ufc: EventData[]; lion: EventData[] }>({ ufc: [], lion: [] })

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

        // Set events data
        setAllEvents({
          ufc: ufcEvents.events || [],
          lion: lionEvents.events || [],
        })
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Sync currentPage from URL on mount and redirect / to /events
    if (pathname === '/') {
      router.push('/events')
      return
    }
    const path = pathname.slice(1)
    if (['events', 'athletes', 'rankings'].includes(path)) {
      setCurrentPage(path)
    }
  }, [pathname, router])

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

  return (
    <>
      <Header
        currentTournament={currentTournament}
        onTournamentChange={setCurrentTournament}
        tournamentName={currentTournamentData?.name || 'LION CHAMPIONSHIP'}
      />
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />

      <main className="container">
        {currentPage === 'events' && (
          <EventsList events={allEvents[currentTournament]} tournament={currentTournament} />
        )}
        {currentPage === 'rankings' && (
          <div className="page-title">Rankings Page - Coming Soon</div>
        )}
        {currentPage === 'athletes' && currentTournamentData && (
          <AthletesPage tournamentData={currentTournamentData} />
        )}
      </main>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .page-title {
          font-size: 48px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 2px;
        }
      `}</style>
    </>
  )
}
