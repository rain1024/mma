'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { fetchMatchData, MatchData } from '@/lib/utils'
import Link from 'next/link'

export default function MatchDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const matchId = params.id as string
  const type = searchParams.get('type')
  const url = searchParams.get('url')
  const tournament = searchParams.get('tournament') || 'lion'

  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (matchId) {
      fetchMatchData(matchId, tournament).then(data => {
        setMatchData(data)
      })
    }
  }, [matchId, tournament])

  // Convert YouTube watch URL to embed URL
  const getEmbedUrl = (videoUrl: string) => {
    if (!videoUrl) return ''

    // Handle youtube.com/watch?v=xxx
    const watchMatch = videoUrl.match(/youtube\.com\/watch\?v=([^&]+)/)
    if (watchMatch) {
      const videoId = watchMatch[1]
      // Check for timestamp parameter
      const timestampMatch = videoUrl.match(/[?&]t=(\d+)/)
      const timestamp = timestampMatch ? `?start=${timestampMatch[1]}` : ''
      return `https://www.youtube.com/embed/${videoId}${timestamp}&enablejsapi=1`
    }

    // Handle youtu.be/xxx?t=xxx
    const shortMatch = videoUrl.match(/youtu\.be\/([^?]+)(\?t=(\d+))?/)
    if (shortMatch) {
      const videoId = shortMatch[1]
      const timestamp = shortMatch[3] ? `?start=${shortMatch[3]}` : ''
      return `https://www.youtube.com/embed/${videoId}${timestamp}&enablejsapi=1`
    }

    return videoUrl
  }

  const embedUrl = url ? getEmbedUrl(url) : ''

  return (
    <div className="match-detail-page">
      {/* Header with back link */}
      <div className="match-header">
        <Link href={`/?tournament=${tournament}`} className="back-link">
          ← Back to Events
        </Link>
      </div>

      {/* Main Content - Side by Side Layout */}
      <div className="main-content">
        {/* Left Side - Video Player (1/2) */}
        <div className="video-section">
          <div className="video-container">
            {type === 'youtube' && embedUrl ? (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title="Match Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="no-video">
                <p>No video available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Match Info (1/2) */}
        <div className="info-section">
          {matchData && (
            <div className="match-info">
              <h1 className="match-title">Match Details</h1>

              <div className="event-info">
                <div className="info-row">
                  <span className="label">Event:</span>
                  <span className="value">{matchData.eventTitle}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{matchData.eventDate}</span>
                </div>
                <div className="info-row">
                  <span className="label">Location:</span>
                  <span className="value">{matchData.eventLocation}</span>
                </div>
                <div className="info-row">
                  <span className="label">Category:</span>
                  <span className="value">{matchData.category}</span>
                </div>
                <div className="info-row">
                  <span className="label">Round:</span>
                  <span className="value">{matchData.round}</span>
                </div>
              </div>

              <div className="fighters-info">
                <div className={`fighter-card ${matchData.fighter1.winner ? 'winner' : ''}`}>
                  <div className="fighter-flag">{matchData.fighter1.flag}</div>
                  <h3>{matchData.fighter1.name}</h3>
                  <p>{matchData.fighter1.stats}</p>
                  {matchData.fighter1.winner && <div className="winner-badge">WINNER</div>}
                </div>

                <div className="vs">VS</div>

                <div className={`fighter-card ${matchData.fighter2.winner ? 'winner' : ''}`}>
                  <div className="fighter-flag">{matchData.fighter2.flag}</div>
                  <h3>{matchData.fighter2.name}</h3>
                  <p>{matchData.fighter2.stats}</p>
                  {matchData.fighter2.winner && <div className="winner-badge">WINNER</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .match-detail-page {
          min-height: 100vh;
          background-color: #0a0a0a;
          color: #fff;
          padding: 20px;
        }

        .match-header {
          max-width: 1600px;
          margin: 0 auto 20px;
        }

        .back-link {
          color: var(--primary-color, #d20a0a);
          text-decoration: none;
          font-size: 16px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: opacity 0.2s;
        }

        .back-link:hover {
          opacity: 0.8;
        }

        /* Main Content - Side by Side */
        .main-content {
          max-width: 1600px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Left Side - Video */
        .video-section {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 20px;
        }

        .video-container {
          width: 100%;
          aspect-ratio: 16 / 9;
          background-color: #000;
          border-radius: 8px;
          overflow: hidden;
        }

        .video-container iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .no-video {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-size: 24px;
        }

        /* Right Side - Info Section */
        .info-section {
          background: #1a1a1a;
          border-radius: 8px;
          padding: 30px;
          overflow-y: auto;
          max-height: calc(100vh - 120px);
        }

        /* Match Info Styles */
        .match-info {
          animation: fadeIn 0.3s ease-in;
        }

        .match-title {
          font-size: 28px;
          margin-bottom: 20px;
          text-align: center;
          color: var(--primary-color, #d20a0a);
        }

        .event-info {
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #333;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #252525;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: bold;
          color: #999;
        }

        .value {
          color: #fff;
          text-align: right;
        }

        .fighters-info {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 15px;
          align-items: center;
        }

        .fighter-card {
          background: #252525;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          border: 2px solid transparent;
          transition: all 0.3s;
        }

        .fighter-card.winner {
          border-color: var(--primary-color, #d20a0a);
          background: linear-gradient(135deg, #1a0a0a 0%, #2a1515 100%);
        }

        :global(body.lion-theme) .fighter-card.winner {
          background: linear-gradient(135deg, #1a0a00 0%, #2a1500 100%);
        }

        .fighter-flag {
          font-size: 40px;
          margin-bottom: 10px;
        }

        .fighter-card h3 {
          font-size: 20px;
          margin: 10px 0;
        }

        .fighter-card p {
          color: #999;
          font-size: 13px;
        }

        .winner-badge {
          margin-top: 10px;
          padding: 5px 15px;
          background: var(--primary-color, #d20a0a);
          color: white;
          border-radius: 4px;
          display: inline-block;
          font-weight: bold;
          font-size: 11px;
        }

        .vs {
          font-size: 24px;
          font-weight: bold;
          color: var(--primary-color, #d20a0a);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .main-content {
            grid-template-columns: 1fr;
          }

          .info-section {
            max-height: none;
          }

          .fighters-info {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .vs {
            padding: 10px 0;
          }
        }

        @media (max-width: 768px) {
          .match-detail-page {
            padding: 10px;
          }

          .video-section,
          .info-section {
            padding: 15px;
          }

          .match-title {
            font-size: 24px;
          }

          .fighter-card h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  )
}
