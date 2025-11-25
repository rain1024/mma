import { EventData, Athlete, Fighter, Champion, Division, Promotion } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface AthletesResponse {
  athletes: Athlete[]
  count: number
}

export interface RankingsResponse {
  pfpRankings: Fighter[]
  divisions: {
    [key: string]: {
      champion: Champion
      rankings: Fighter[]
    }
  }
}

export interface PromotionsResponse {
  promotions: Promotion[]
  count: number
}

/**
 * Fetch all events for a tournament from the backend API
 */
export async function fetchEvents(tournament: 'ufc' | 'lion'): Promise<ApiResponse<EventData[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events?tournament=${tournament}`)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const result = await response.json()

    return {
      data: result.events || []
    }
  } catch (error) {
    console.error('Error fetching events from API:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch events'
    }
  }
}

/**
 * Fetch a single event by ID from the backend API
 */
export async function fetchEventById(
  eventId: string,
  tournament: 'ufc' | 'lion'
): Promise<ApiResponse<EventData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}?tournament=${tournament}`)

    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'Event not found' }
      }
      throw new Error(`API request failed with status ${response.status}`)
    }

    const event = await response.json()

    return {
      data: event
    }
  } catch (error) {
    console.error('Error fetching event from API:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch event'
    }
  }
}

/**
 * Fetch all athletes for a promotion from the backend API
 */
export async function fetchAthletes(
  promotionId: 'ufc' | 'lion',
  filters?: { division?: string; gender?: string; search?: string }
): Promise<ApiResponse<AthletesResponse>> {
  try {
    const params = new URLSearchParams({ tournament: promotionId })
    if (filters?.division) params.append('division', filters.division)
    if (filters?.gender) params.append('gender', filters.gender)
    if (filters?.search) params.append('search', filters.search)

    const response = await fetch(`${API_BASE_URL}/athletes?${params}`)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const result = await response.json()

    // Transform database athletes to include record string
    const athletes = (result.athletes || []).map((athlete: any) => ({
      ...athlete,
      record: athlete.record || `${athlete.wins || 0}-${athlete.losses || 0}-${athlete.draws || 0}`
    }))

    return {
      data: {
        athletes,
        count: result.count || athletes.length
      }
    }
  } catch (error) {
    console.error('Error fetching athletes from API:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch athletes'
    }
  }
}

/**
 * Fetch rankings for a promotion from the backend API
 */
export async function fetchRankings(promotionId: 'ufc' | 'lion'): Promise<ApiResponse<RankingsResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/rankings?tournament=${promotionId}`)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const result = await response.json()

    return {
      data: {
        pfpRankings: result.pfpRankings || [],
        divisions: result.divisions || {}
      }
    }
  } catch (error) {
    console.error('Error fetching rankings from API:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch rankings'
    }
  }
}

/**
 * Fetch all promotions from the backend API
 */
export async function fetchPromotions(): Promise<ApiResponse<PromotionsResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions`)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const result = await response.json()

    return {
      data: {
        promotions: result.promotions || [],
        count: result.count || 0
      }
    }
  } catch (error) {
    console.error('Error fetching promotions from API:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch promotions'
    }
  }
}
