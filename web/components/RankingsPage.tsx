'use client'

import { TournamentData, Fighter, Champion } from '@/types'

interface RankingsPageProps {
  tournamentData: TournamentData
}

export default function RankingsPage({ tournamentData }: RankingsPageProps) {
  if (!tournamentData) {
    return <div className="loading">Loading rankings...</div>
  }

  const { pfpRankings, champion, rankings } = tournamentData

  return (
    <div className="rankings-page">
      <div className="page-header">
        <h1 className="page-title">Rankings</h1>
      </div>

      {/* Pound-for-Pound Rankings */}
      {pfpRankings && pfpRankings.length > 0 && (
        <section className="rankings-section">
          <h2 className="section-title">Pound-for-Pound Top Fighters</h2>
          <div className="rankings-table">
            <div className="table-header">
              <div className="rank-col">Rank</div>
              <div className="fighter-col">Fighter</div>
              <div className="record-col">Division/Status</div>
              <div className="move-col">Move</div>
            </div>
            {pfpRankings.map((fighter: Fighter) => (
              <div key={fighter.rank} className="table-row">
                <div className="rank-col">#{fighter.rank}</div>
                <div className="fighter-col">{fighter.name}</div>
                <div className="record-col">{fighter.record}</div>
                <div className="move-col">{fighter.move}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightweight Division Rankings */}
      {(champion || rankings) && (
        <section className="rankings-section">
          <h2 className="section-title">Lightweight Division</h2>

          {/* Champion */}
          {champion && (
            <div className="champion-card">
              <div className="champion-badge">Champion</div>
              <div className="champion-info">
                <div className="champion-name">{champion.name}</div>
                {champion.nickname && <div className="champion-nickname">"{champion.nickname}"</div>}
                <div className="champion-record">{champion.record}</div>
              </div>
            </div>
          )}

          {/* Rankings */}
          {rankings && rankings.length > 0 && (
            <div className="rankings-table">
              <div className="table-header">
                <div className="rank-col">Rank</div>
                <div className="fighter-col">Fighter</div>
                <div className="record-col">Record</div>
                <div className="move-col">Move</div>
              </div>
              {rankings.map((fighter: Fighter) => (
                <div key={fighter.rank} className="table-row">
                  <div className="rank-col">#{fighter.rank}</div>
                  <div className="fighter-col">{fighter.name}</div>
                  <div className="record-col">{fighter.record}</div>
                  <div className="move-col">{fighter.move}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <style jsx>{`
        .rankings-page {
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 40px;
        }

        .page-title {
          font-size: 48px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 2px;
        }

        .rankings-section {
          margin-bottom: 60px;
        }

        .section-title {
          font-size: 28px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 20px;
          letter-spacing: 1px;
          border-bottom: 3px solid var(--primary-color, #d20a0a);
          padding-bottom: 10px;
        }

        .champion-card {
          background: linear-gradient(135deg, var(--primary-color, #d20a0a) 0%, rgba(210, 10, 10, 0.7) 100%);
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 30px;
          position: relative;
          overflow: hidden;
        }

        .champion-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.2);
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .champion-info {
          color: white;
        }

        .champion-name {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .champion-nickname {
          font-size: 20px;
          font-style: italic;
          margin-bottom: 12px;
          opacity: 0.9;
        }

        .champion-record {
          font-size: 18px;
          opacity: 0.8;
        }

        .rankings-table {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 80px 1fr 200px 100px;
          padding: 15px 20px;
          background: rgba(255, 255, 255, 0.1);
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 1px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 80px 1fr 200px 100px;
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: background 0.2s;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .rank-col {
          font-weight: bold;
          color: var(--primary-color, #d20a0a);
        }

        .fighter-col {
          font-weight: 600;
          font-size: 16px;
        }

        .record-col {
          opacity: 0.8;
        }

        .move-col {
          text-align: right;
          font-weight: bold;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 32px;
          }

          .section-title {
            font-size: 22px;
          }

          .champion-name {
            font-size: 28px;
          }

          .champion-nickname {
            font-size: 16px;
          }

          .table-header,
          .table-row {
            grid-template-columns: 60px 1fr 120px 80px;
            padding: 15px;
            font-size: 14px;
          }

          .table-header {
            font-size: 11px;
          }

          .fighter-col {
            font-size: 14px;
          }

          .record-col,
          .move-col {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  )
}
