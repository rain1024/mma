'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console (could be sent to error reporting service)
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-title">Something went wrong</h1>
        <p className="error-message">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="error-digest">Error ID: {error.digest}</p>
        )}
        <button className="error-button" onClick={reset}>
          Try again
        </button>
      </div>

      <style jsx>{`
        .error-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #0a0a0a;
        }

        .error-content {
          text-align: center;
          max-width: 500px;
        }

        .error-title {
          font-size: 32px;
          font-weight: bold;
          color: #fff;
          margin-bottom: 16px;
        }

        .error-message {
          font-size: 16px;
          color: #999;
          margin-bottom: 8px;
        }

        .error-digest {
          font-size: 12px;
          color: #666;
          font-family: monospace;
          margin-bottom: 24px;
        }

        .error-button {
          padding: 12px 24px;
          background: var(--primary-color, #d20a0a);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s;
        }

        .error-button:hover {
          background: #a00808;
        }

        :global(body.lion-theme) .error-button {
          background: #ff8c00;
        }

        :global(body.lion-theme) .error-button:hover {
          background: #cc7000;
        }
      `}</style>
    </div>
  )
}
