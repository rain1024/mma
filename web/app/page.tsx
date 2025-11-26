'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import EventsList from '@/components/EventsList'
import AthletesPage from '@/components/AthletesPage'
import RankingsPage from '@/components/RankingsPage'
import { TournamentData, EventData, Division } from '@/types'
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

const TOURNAMENT_STORAGE_KEY = 'mma-current-tournament'
const DEFAULT_TOURNAMENT: 'ufc' | 'lion' = 'lion'

function getStoredTournament(): 'ufc' | 'lion' {
  if (typeof window === 'undefined') return DEFAULT_TOURNAMENT
  const stored = localStorage.getItem(TOURNAMENT_STORAGE_KEY)
  if (stored === 'ufc' || stored === 'lion') return stored
  return DEFAULT_TOURNAMENT
}

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentTournament, setCurrentTournament] = useState<'ufc' | 'lion'>(DEFAULT_TOURNAMENT)
  const [currentPage, setCurrentPage] = useState('events')
  const [tournamentData, setTournamentData] = useState<{ ufc?: TournamentData; lion?: TournamentData }>({})
  const [allEvents, setAllEvents] = useState<{ ufc: EventData[]; lion: EventData[] }>({ ufc: [], lion: [] })

  // Load tournament from localStorage on mount
  useEffect(() => {
    setCurrentTournament(getStoredTournament())
  }, [])

  useEffect(() => {
    // Load all data from API
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

        // Set events data from API
        setAllEvents({
          ufc: ufcEventsResult.data || [],
          lion: lionEventsResult.data || [],
        })

        // Log API errors if any
        const errors = [
          ufcAthletesResult.error && `UFC athletes: ${ufcAthletesResult.error}`,
          ufcRankingsResult.error && `UFC rankings: ${ufcRankingsResult.error}`,
          lionAthletesResult.error && `Lion athletes: ${lionAthletesResult.error}`,
          lionRankingsResult.error && `Lion rankings: ${lionRankingsResult.error}`,
          ufcEventsResult.error && `UFC events: ${ufcEventsResult.error}`,
          lionEventsResult.error && `Lion events: ${lionEventsResult.error}`,
        ].filter(Boolean)

        if (errors.length > 0) {
          console.error('API errors:', errors)
        }
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
    // Update theme - ensure clean state
    document.body.classList.remove('lion-theme')
    if (currentTournament === 'lion') {
      document.body.classList.add('lion-theme')
    }
    // Persist tournament selection to localStorage
    localStorage.setItem(TOURNAMENT_STORAGE_KEY, currentTournament)
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
        {currentPage === 'rankings' && currentTournamentData && (
          <RankingsPage tournamentData={currentTournamentData} />
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
