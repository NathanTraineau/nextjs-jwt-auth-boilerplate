// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if a user session exists
  if (
    !request.cookies.get('accessToken') ||
    request.cookies.get('accessToken')?.value === ''
  ) {
    const allowedPaths = ['/login', '/signup', '/two-factor']
    const currentPath = request.nextUrl.pathname

    if (!allowedPaths.includes(currentPath)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
}

// See "Matching Paths" below to learn more
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - favicon.ico (favicon file)
   */
  matcher: '/((?!api|_next/static|favicon.ico).*)',
}
