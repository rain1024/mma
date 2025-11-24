import { EventData } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
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
