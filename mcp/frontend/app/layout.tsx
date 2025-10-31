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
      <body className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] min-h-screen">
        {children}
      </body>
    </html>
  )
}
