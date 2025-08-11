import { NextRequest, NextResponse } from 'next/server'
import { getClientIp } from '@/lib/ip'
import { rateLimit } from '@/lib/rate-limit'

const DEMO_MODE = process.env.DEMO_MODE === 'true' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
const DEMO_MAX_REQUESTS_PER_IP = Number(process.env.DEMO_MAX_REQUESTS_PER_IP ?? '30')
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ''
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || ''

// Separate 24h limiter for SUMMARY_CONFIRMED (1 per IP in demo)
const SUMMARY_WINDOW_MS = 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  // Do NOT require clients to send secrets. Secrets are injected server-side when calling n8n.
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Server misconfigured: WEBHOOK_SECRET missing' }, { status: 500 })
  }

  // Parse JSON body
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = payload?.event_type || 'CHAT_MESSAGE'
  const userKey: string | undefined = payload?.user?.email || payload?.user?.id || payload?.session_id

  // Global IP rate limit for demo/proxy
  const globalLimit = Math.max(1, DEMO_MAX_REQUESTS_PER_IP)
  const r1 = rateLimit(`global:${ip}`, globalLimit, 60 * 60 * 1000) // 1h window
  if (!r1.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((r1.resetAt - Date.now()) / 1000).toString(),
        },
      },
    )
  }

  // Single finalize per IP per day (SUMMARY_CONFIRMED)
  if (eventType === 'SUMMARY_CONFIRMED') {
    const r2 = rateLimit(`summary:${ip}`, 1, SUMMARY_WINDOW_MS)
    if (!r2.allowed) {
      return NextResponse.json(
        { error: 'Solo 1 solicitud finalizada por IP cada 24h en modo demo.' },
        { status: 429 },
      )
    }
    // Additionally, limit per user/email/session
    if (userKey) {
      const r3 = rateLimit(`summary-user:${userKey}`, 1, SUMMARY_WINDOW_MS)
      if (!r3.allowed) {
        return NextResponse.json(
          { error: 'Solo 1 solicitud finalizada por usuario cada 24h en modo demo.' },
          { status: 429 },
        )
      }
    }
  }

  // Force demo_mode in payload when enabled
  if (DEMO_MODE) {
    payload.demo_mode = true
  }

  // Demo short-circuit: return mocked responses without calling n8n
  if (DEMO_MODE) {
    if (eventType === 'SUMMARY_CONFIRMED') {
      return NextResponse.json({
        ok: true,
        message: 'Demo: solicitud creada (simulada) con estado submitted',
        request: {
          id: 'demo-' + Date.now(),
          status: 'submitted',
          title: payload?.summary?.title ?? 'Solicitud de demostración',
          scoring: { total: 62, impacto: 30, urgencia: 12, alineacion: 20 },
        },
      })
    }
    // Chat mock
    return NextResponse.json({
      ok: true,
      message: 'Demo: respuesta del agente simulada',
      suggestions: [
        '¿Deseas confirmar el resumen para crear la solicitud?',
        'Puedo estimar prioridad basada en impacto y urgencia.',
      ],
    })
  }

  // Forward to n8n when not in demo
  if (!N8N_WEBHOOK_URL) {
    return NextResponse.json({ error: 'N8N_WEBHOOK_URL not configured' }, { status: 500 })
  }

  try {
    const upstream = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': ip,
        // Inject server-side secret to protect the n8n webhook
        'x-webhook-secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify(payload),
      // keepalive helps with edge runtimes
      cache: 'no-store',
    })

    const text = await upstream.text()
    // Try parse JSON, else pass text as message
    try {
      const data = JSON.parse(text)
      return NextResponse.json(data, { status: upstream.status })
    } catch {
      return NextResponse.json({ ok: upstream.ok, message: text }, { status: upstream.status })
    }
  } catch (err: any) {
    return NextResponse.json({ error: 'Upstream error', detail: err?.message }, { status: 502 })
  }
}
