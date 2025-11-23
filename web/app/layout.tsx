import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MMA Rankings | Official Fighter Rankings',
  description: 'UFC and Lion Championship fighter rankings and events',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="lion-theme">{children}</body>
    </html>
  )
}
