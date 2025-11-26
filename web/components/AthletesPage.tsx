'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TournamentData } from '@/types'
import { generateAthleteSlug } from '@/lib/utils'

interface AthletesPageProps {
  tournamentData: TournamentData
}

export default function AthletesPage({ tournamentData }: AthletesPageProps) {
  const router = useRouter()
  const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'women'>('all')
  const [divisionFilter, setDivisionFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const handleAthleteClick = (athleteName: string) => {
    const slug = generateAthleteSlug(athleteName)
    router.push(`/athletes/${slug}`)
  }

  if (!tournamentData || !tournamentData.athletes) {
    return <div className="loading">Loading athletes...</div>
  }

  // Filter athletes
  const filteredAthletes = tournamentData.athletes.filter((athlete) => {
    // Search filter - searches in both name and alternative names
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      const matchesName = athlete.name.toLowerCase().includes(searchLower)
      const matchesAltNames = athlete.alternativeNames?.some(altName =>
        altName.toLowerCase().includes(searchLower)
      )
      if (!matchesName && !matchesAltNames) {
        return false
      }
    }

    // Division filter
    if (divisionFilter !== 'all' && athlete.division !== divisionFilter) {
      return false
    }

    // Gender filter
    if (genderFilter === 'women') {
      return athlete.gender === 'female'
    }
    if (genderFilter === 'men') {
      return athlete.gender === 'male' || !athlete.gender
    }

    return true
  })

  return (
    <div className="athletes-page">
      <div className="page-header">
        <h1 className="page-title">Athletes</h1>
        <p className="athlete-count">{filteredAthletes.length} Fighters</p>
      </div>

      <div className="filters-section">
        <div className="gender-filter">
          <button
            className={genderFilter === 'all' ? 'active' : ''}
            onClick={() => setGenderFilter('all')}
          >
            All
          </button>
          <button
            className={genderFilter === 'men' ? 'active' : ''}
            onClick={() => setGenderFilter('men')}
          >
            Men
          </button>
          <button
            className={genderFilter === 'women' ? 'active' : ''}
            onClick={() => setGenderFilter('women')}
          >
            Women
          </button>
        </div>

        <div className="search-filter">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="division-filter">
          <label>Division:</label>
          <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)}>
            <option value="all">All Divisions</option>
            {tournamentData.divisions?.map((division) => (
              <option key={division.value} value={division.value}>
                {division.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="athletes-grid">
        {filteredAthletes.map((athlete) => (
          <div key={athlete.id} className="athlete-card" onClick={() => handleAthleteClick(athlete.name)}>
            <div className="athlete-image">
              <div className="placeholder-image">
                {athlete.flag || '🥊'}
              </div>
            </div>
            <div className="athlete-info">
              {athlete.nickname && (
                <div className="athlete-nickname">&quot;{athlete.nickname}&quot;</div>
              )}
              <div className="athlete-name">{athlete.name}</div>
              <div className="athlete-division">
                {tournamentData.divisions?.find((d) => d.value === athlete.division)?.label || athlete.division}
              </div>
              <div className="athlete-record">Record: {athlete.record}</div>
              <div className="athlete-country">
                {athlete.flag} {athlete.country}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAthletes.length === 0 && (
        <div className="no-results">No athletes found matching your filters.</div>
      )}

      <style jsx>{`
        .athletes-page {
          padding: 20px 0;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-title {
          font-size: 48px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 2px;
        }

        .athlete-count {
          font-size: 18px;
          color: #999;
          margin-bottom: 20px;
        }

        .filters-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          align-items: center;
        }

        .gender-filter {
          display: flex;
          gap: 10px;
        }

        .gender-filter button {
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
        }

        .gender-filter button:hover {
          border-color: var(--primary-color, #d20a0a);
          background: rgba(210, 10, 10, 0.1);
        }

        .gender-filter button.active {
          background: var(--primary-color, #d20a0a);
          border-color: var(--primary-color, #d20a0a);
        }

        .search-filter {
          flex: 1;
          min-width: 200px;
        }

        .search-input {
          width: 100%;
          padding: 10px 15px;
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid #666;
          color: #fff;
          font-size: 14px;
          border-radius: 4px;
          outline: none;
        }

        .search-input:focus {
          border-color: var(--primary-color, #d20a0a);
        }

        .search-input::placeholder {
          color: #999;
        }

        .division-filter {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .division-filter label {
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .division-filter select {
          padding: 10px 15px;
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid #666;
          color: #fff;
          font-size: 14px;
          border-radius: 4px;
          cursor: pointer;
          outline: none;
        }

        .division-filter select:focus {
          border-color: var(--primary-color, #d20a0a);
        }

        .athletes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .athlete-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .athlete-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary-color, #d20a0a);
          box-shadow: 0 5px 20px rgba(210, 10, 10, 0.3);
        }

        .athlete-image {
          width: 100%;
          height: 250px;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .placeholder-image {
          font-size: 80px;
          opacity: 0.5;
        }

        .athlete-info {
          padding: 20px;
        }

        .athlete-nickname {
          font-size: 12px;
          color: var(--primary-color, #d20a0a);
          margin-bottom: 5px;
          font-style: italic;
        }

        .athlete-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .athlete-division {
          font-size: 14px;
          color: #999;
          margin-bottom: 8px;
          text-transform: capitalize;
        }

        .athlete-record {
          font-size: 14px;
          color: #ccc;
          margin-bottom: 8px;
        }

        .athlete-country {
          font-size: 14px;
          color: #999;
        }

        .no-results {
          text-align: center;
          font-size: 24px;
          color: #999;
          padding: 60px 20px;
        }

        .loading {
          text-align: center;
          font-size: 24px;
          padding: 60px 20px;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 32px;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .gender-filter {
            justify-content: center;
          }

          .athletes-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
          }

          .athlete-image {
            height: 200px;
          }
        }
      `}</style>
    </div>
  )
}
