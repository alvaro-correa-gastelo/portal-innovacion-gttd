import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Global middleware to prevent stale caches in pages and API on Vercel/CDN
export function middleware(_req: NextRequest) {
  const res = NextResponse.next()
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Expires', '0')
  return res
}

// Only apply to pages and API routes (not static assets)
export const config = {
  matcher: [
    '/',
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)).*)',
    '/api/:path*',
  ],
}
