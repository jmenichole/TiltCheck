import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TiltCheck - Nosana AI Agent',
  description: 'Decentralized tilt detection powered by Nosana AI and Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}
