'use client'

import { useState, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Mail, Compass, Mountain, MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      const result = await signIn(provider, {
        callbackUrl,
        redirect: false,
      })
      
      if (result?.ok) {
        // Check if user is signed in
        const session = await getSession()
        if (session) {
          router.push(callbackUrl)
        }
      }
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 flex items-center justify-center relative overflow-hidden">
      {/* Nature Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-300/40 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-tl from-blue-200/30 to-sky-300/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-br from-teal-200/20 to-cyan-300/30 rounded-full blur-2xl" />
      </div>

      {/* Mountain Silhouettes */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-200/10 to-transparent">
        <svg viewBox="0 0 1200 200" className="w-full h-full">
          <path d="M0,200 L200,80 L400,120 L600,40 L800,100 L1000,60 L1200,140 L1200,200 Z" fill="rgba(34, 197, 94, 0.05)" />
          <path d="M0,200 L150,120 L350,160 L550,90 L750,140 L950,100 L1200,180 L1200,200 Z" fill="rgba(14, 165, 233, 0.03)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            asChild 
            className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/50 backdrop-blur-sm"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        <Card className="bg-white/80 backdrop-blur-xl border-white/60 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            {/* Logo Section */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <Compass className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Mountain className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                Bienvenido Aventurero
              </CardTitle>
              <CardDescription className="text-slate-600">
                Inicia sesión para continuar planificando tus próximas aventuras y descubrir destinos increíbles
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Button
                className="w-full bg-white hover:bg-gray-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => handleSignIn('google')}
                disabled={isLoading}
              >
                <Mail className="mr-3 h-5 w-5 text-red-500" />
                Continuar con Google
              </Button>
              
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md transition-all duration-200"
                onClick={() => handleSignIn('github')}
                disabled={isLoading}
              >
                <Github className="mr-3 h-5 w-5" />
                Continuar con GitHub
              </Button>
            </div>

            {/* Adventure Stats */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-xl p-4 border border-emerald-100/60">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-emerald-700">2.5K+</div>
                  <div className="text-xs text-slate-600">Aventureros</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-teal-700">150+</div>
                  <div className="text-xs text-slate-600">Destinos</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-sky-700">4.9★</div>
                  <div className="text-xs text-slate-600">Rating</div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600">
                ¿Primera vez aquí?{' '}
                <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                  Comienza tu aventura
                </Link>
              </p>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <MapPin className="h-3 w-3" />
                <span>Seguro, rápido y gratuito</span>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 leading-relaxed">
              <p>
                Al continuar, aceptas nuestros{' '}
                <Link href="/terms" className="text-emerald-600 hover:underline">
                  Términos
                </Link>{' '}
                y{' '}
                <Link href="/privacy" className="text-emerald-600 hover:underline">
                  Política de Privacidad
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Feature Highlight */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/60 text-sm text-slate-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Únete a aventureros de todo el mundo</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 flex items-center justify-center">
        <div className="text-emerald-600">Cargando...</div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}