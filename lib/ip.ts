import type { NextRequest } from 'next/server'

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map(s => s.trim())
    if (parts.length > 0) return parts[0]
  }
  // Vercel: x-real-ip may be present
  const xrip = req.headers.get('x-real-ip')
  if (xrip) return xrip
  // Fallback to ip from request
  // @ts-ignore
  return (req as any).ip || '0.0.0.0'
}
