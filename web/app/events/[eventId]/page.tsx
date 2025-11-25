'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import EventsPage from '@/components/EventsPage'
import { TournamentData, EventData, Division } from '@/types'
import { fetchEventById, fetchPromotions } from '@/lib/api'

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
        // Determine tournament based on event ID
        let tournament: 'ufc' | 'lion' = 'lion'
        if (eventId.startsWith('ufc')) {
          tournament = 'ufc'
        } else if (eventId.startsWith('lc')) {
          tournament = 'lion'
        }

        setCurrentTournament(tournament)

        // Fetch event and promotions in parallel
        const [eventResult, promotionsResult] = await Promise.all([
          fetchEventById(eventId, tournament),
          fetchPromotions(),
        ])

        // Get promotion info for names
        const ufcPromotion = promotionsResult.data?.promotions.find(p => p.id === 'ufc')
        const lionPromotion = promotionsResult.data?.promotions.find(p => p.id === 'lion')

        // Build tournament data (minimal, just for header display)
        const ufc: TournamentData = {
          name: ufcPromotion?.name || 'UFC',
          subtitle: ufcPromotion?.subtitle || 'Ultimate Fighting Championship',
          divisions: DEFAULT_DIVISIONS,
          athletes: [],
          pfpRankings: [],
          champion: { name: '', record: '', nickname: '' },
          rankings: [],
        }

        const lion: TournamentData = {
          name: lionPromotion?.name || 'LION CHAMPIONSHIP',
          subtitle: lionPromotion?.subtitle || "Vietnam's Premier MMA",
          divisions: DEFAULT_DIVISIONS,
          athletes: [],
          pfpRankings: [],
          champion: { name: '', record: '', nickname: '' },
          rankings: [],
        }

        setTournamentData({ ufc, lion })

        if (eventResult.data) {
          setEventData(eventResult.data)
        } else {
          console.error('Error loading event from API:', eventResult.error)
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
    // Update theme - ensure clean state
    document.body.classList.remove('lion-theme')
    if (currentTournament === 'lion') {
      document.body.classList.add('lion-theme')
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
        <EventsPage eventData={eventData} tournament={currentTournament} />
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
