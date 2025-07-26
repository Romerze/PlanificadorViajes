import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Paths that require authentication
        const protectedPaths = ['/dashboard', '/trips', '/itinerary', '/transportation', '/accommodation', '/activities', '/budget', '/documents', '/gallery', '/profile', '/settings']
        
        const isProtectedPath = protectedPaths.some(path => 
          req.nextUrl.pathname.startsWith(path)
        )
        
        // If it's a protected path, require a token
        if (isProtectedPath) {
          return !!token
        }
        
        // Allow access to public paths
        return true
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}