'use client'

interface HeaderProps {
  currentTournament: 'ufc' | 'lion';
  onTournamentChange: (tournament: 'ufc' | 'lion') => void;
  tournamentName: string;
}

export default function Header({ currentTournament, onTournamentChange, tournamentName }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" id="logo-text">{tournamentName}</div>
        <div className="tournament-switcher">
          <button
            className={`tournament-btn ${currentTournament === 'ufc' ? 'active' : ''}`}
            onClick={() => onTournamentChange('ufc')}
          >
            UFC
          </button>
          <button
            className={`tournament-btn ${currentTournament === 'lion' ? 'active' : ''}`}
            onClick={() => onTournamentChange('lion')}
          >
            Lion Championship
          </button>
        </div>
      </div>

      <style jsx>{`
        .header {
          background-color: #000;
          border-bottom: 3px solid #d20a0a;
          padding: 20px 0;
          transition: border-color 0.3s;
        }

        :global(body.lion-theme) .header {
          border-bottom-color: #ff8c00;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 36px;
          font-weight: bold;
          color: #d20a0a;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: color 0.3s;
        }

        :global(body.lion-theme) .logo {
          color: #ff8c00;
        }

        .tournament-switcher {
          display: flex;
          gap: 10px;
          background-color: #1a1a1a;
          padding: 5px;
          border-radius: 25px;
        }

        .tournament-btn {
          padding: 10px 20px;
          background-color: transparent;
          color: #999;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s;
        }

        .tournament-btn.active {
          background-color: #d20a0a;
          color: #fff;
        }

        :global(body.lion-theme) .tournament-btn.active {
          background-color: #ff8c00;
        }

        .tournament-btn:hover:not(.active) {
          color: #fff;
        }

        @media (max-width: 768px) {
          .logo {
            font-size: 24px;
          }

          .tournament-btn {
            padding: 8px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </header>
  )
}
