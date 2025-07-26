'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github, Mail, Plane } from 'lucide-react'
import Link from 'next/link'

export default function SignInPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-success-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-primary" />
              <span className="font-heading text-2xl font-bold">TravelPlanner</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue planning your trips
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSignIn('google')}
            disabled={isLoading}
          >
            <Mail className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSignIn('github')}
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Don't have an account?{' '}
              <Link href="/" className="text-primary hover:underline">
                Get started
              </Link>
            </p>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>
              By signing in, you agree to our{' '}
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}