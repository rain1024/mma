export function generateAthleteSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

export function findAthleteBySlug(athletes: any[], slug: string) {
  if (!athletes || !Array.isArray(athletes)) {
    return undefined
  }

  return athletes.find(athlete => generateAthleteSlug(athlete.name) === slug)
}

export interface MatchData {
  matchId: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  category: string
  round: string
  fighter1: {
    name: string
    stats: string
    flag: string
    winner: boolean
  }
  fighter2: {
    name: string
    stats: string
    flag: string
    winner: boolean
  }
  video?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export async function fetchMatchData(matchId: string, tournament: string): Promise<MatchData | null> {
  try {
    // Parse matchId format: {eventId}-{categoryIndex}-{matchIndex}
    const parts = matchId.split('-')
    if (parts.length < 3) return null

    const matchIndex = parseInt(parts[parts.length - 1])
    const categoryIndex = parseInt(parts[parts.length - 2])
    const eventId = parts.slice(0, -2).join('-')

    // Fetch event from backend API
    const eventResponse = await fetch(`${API_BASE_URL}/events/${eventId}?tournament=${tournament}`)
    if (!eventResponse.ok) return null

    const event = await eventResponse.json()
    if (!event) return null

    const category = event.fights?.[categoryIndex]
    if (!category) return null

    const match = category.matches?.[matchIndex]
    if (!match) return null

    return {
      matchId,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      category: category.category,
      round: match.round,
      fighter1: match.fighter1,
      fighter2: match.fighter2,
      video: match.video
    }
  } catch (error) {
    console.error('Error fetching match data:', error)
    return null
  }
}
