import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const n8nUrl = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_WEBHOOK_URL
    if (!n8nUrl) {
      return NextResponse.json({ error: 'Missing N8N_WEBHOOK_URL' }, { status: 500 })
    }

    const body = await req.json().catch(() => ({}))
    const eventType = (body?.event_type || body?.event?.type || 'N8N_VALIDATION') as string

    const resp = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Insight-Event-Type': eventType,
        'X-Insight-Source': 'applicant_portal',
      },
      body: JSON.stringify(body),
      // Vercel allows outgoing fetch by default
    })

    const contentType = resp.headers.get('content-type') || ''
    const headers = new Headers()
    headers.set('Cache-Control', 'no-store')

    if (contentType.includes('application/json')) {
      const data = await resp.json().catch(() => null)
      if (data === null) return new NextResponse(null, { status: resp.status, headers })
      return NextResponse.json(data, { status: resp.status, headers })
    } else {
      const text = await resp.text().catch(() => '')
      return new NextResponse(text, { status: resp.status, headers })
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Proxy error' }, { status: 500 })
  }
}

export async function OPTIONS() {
  // Not strictly necessary for same-origin, but harmless
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Cache-Control': 'no-store',
    },
  })
}
