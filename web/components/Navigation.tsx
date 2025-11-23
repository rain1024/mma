'use client'

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const pages = [
    { id: 'athletes', label: 'Athletes', href: '/athletes' },
    { id: 'rankings', label: 'Rankings', href: '/rankings' },
    { id: 'events', label: 'Events', href: '/events' },
    { id: 'news', label: 'News', href: '#' },
    { id: 'watch', label: 'Watch', href: '#' },
  ]

  return (
    <nav className="nav">
      <div className="nav-content">
        {pages.map((page) => (
          <a
            key={page.id}
            href={page.href}
            className={currentPage === page.id ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              onPageChange(page.id)
            }}
          >
            {page.label}
          </a>
        ))}
      </div>

      <style jsx>{`
        .nav {
          background-color: #1a1a1a;
          padding: 15px 0;
          border-bottom: 1px solid #333;
        }

        .nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          gap: 30px;
        }

        .nav-content a {
          color: #fff;
          text-decoration: none;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: color 0.3s;
        }

        .nav-content a:hover {
          color: #d20a0a;
        }

        .nav-content a.active {
          color: #d20a0a;
        }

        :global(body.lion-theme) .nav-content a:hover {
          color: #ff8c00;
        }

        :global(body.lion-theme) .nav-content a.active {
          color: #ff8c00;
        }

        @media (max-width: 768px) {
          .nav-content {
            gap: 15px;
            overflow-x: auto;
          }

          .nav-content a {
            font-size: 12px;
            white-space: nowrap;
          }
        }
      `}</style>
    </nav>
  )
}
