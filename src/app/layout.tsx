import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import '@/styles/globals.css'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/layout/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Travel Planner - Plan Your Perfect Trip',
  description: 'A comprehensive travel planning application to organize, plan, and visualize all aspects of your trips.',
  keywords: ['travel', 'planning', 'itinerary', 'vacation', 'trip'],
  authors: [{ name: 'Travel Planner Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          manrope.variable
        )}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}