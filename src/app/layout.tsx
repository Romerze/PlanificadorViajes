import type { Metadata } from 'next'
import '@/styles/globals.css'
import { cn } from '@/lib/utils'
import { Providers } from '@/components/layout/providers'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'Planificador de Viajes - Planifica tu Viaje Perfecto',
  description: 'Una aplicación completa de planificación de viajes para organizar, planificar y visualizar todos los aspectos de tus viajes.',
  keywords: ['viajes', 'planificación', 'itinerario', 'vacaciones', 'turismo', 'perú'],
  authors: [{ name: 'Planificador de Viajes' }],
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
    <html lang="es-PE" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased'
        )}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}