import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Route segment config to ensure dynamic execution and no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// Configuración de la base de datos (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// GET /api/requests/[id]/timeline
// Returns audit/history entries for a request, newest last
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await context.params
  const url = new URL(req.url)
  const audience = (url.searchParams.get('audience') || 'leader').toLowerCase()

  if (!requestId) {
    return NextResponse.json({ success: false, error: 'Falta requestId' }, { status: 400 })
  }

  try {
    // Prefer an explicit audit table if it exists
    const auditQuery = `
      SELECT 
        id,
        request_id,
        action_type,
        previous_status,
        new_status,
        leader_id,
        comments,
        created_at
      FROM requests_audit
      WHERE request_id = $1
      ORDER BY created_at ASC
    `

    let rows: any[] = []
    try {
      const res = await pool.query(auditQuery, [requestId])
      rows = res.rows
    } catch (e) {
      // Ignore and handle in fallback below
    }

    if (!rows.length) {
      // Fallback: synthesize a minimal timeline from requests when audit is missing or empty
      const fallbackQuery = `
        SELECT id, status, created_at, user_id
        FROM requests
        WHERE id = $1
      `
      const res = await pool.query(fallbackQuery, [requestId])
      if (res.rows.length) {
        const r = res.rows[0]
        rows = [
          {
            id: 1,
            request_id: r.id,
            action_type: 'created',
            previous_status: null,
            new_status: r.status || 'submitted',
            leader_id: r.user_id,
            comments: 'Solicitud creada',
            created_at: r.created_at || new Date().toISOString(),
          },
        ]
      }
    }

    // Helper sanitizers for requester
    const sanitizeText = (input: string) => {
      if (!input) return ''
      let text = input as string
      text = text.replace(/\s*---\s*INFO:.*/i, '')
      text = text.replace(/Clasificación(?:\s+final)?\s*:\s*[^.|\n]+[.|\n]?/gi, '')
      text = text.replace(/Prioridad(?:\s+final)?\s*:\s*[^.|\n]+[.|\n]?/gi, '')
      text = text.replace(/(requiere|requirió) aprobación gerencial\.?/gi, '')
      text = text.replace(/aprobación gerencial necesaria\.?/gi, '')
      text = text.replace(/enviado a aprobación gerencial\.?/gi, '')
      text = text.replace(/pendiente de aprobación gerencial\.?/gi, '')
      return text.replace(/\s{2,}/g, ' ').replace(/\s+\./g, '.').trim()
    }
    const formatUser = (user?: string) => {
      if (!user) return undefined
      const local = String(user).split('@')[0]
      return (local || user).replace(/\./g, ' ')
    }

    // Return events; sanitize if audience=user
    const data = rows.map((ev, idx) => {
      const action = ev.action_type || ev.new_status || 'update'
      const status = ev.new_status || ev.action_type || 'update'
      const base = {
        id: ev.id ?? idx + 1,
        action_type: action,
        status,
        created_at: ev.created_at,
        fecha_cambio: ev.created_at,
        comments: ev.comments,
        comment: ev.comments,
        user_name: ev.user_name,
        leader_id: ev.leader_id,
      }
      if (audience === 'user') {
        return {
          ...base,
          // Mantener status original (el cliente lo mapea), pero limpiar textos y autor
          comments: sanitizeText(ev.comments || ''),
          comment: sanitizeText(ev.comments || ''),
          user_name: formatUser(ev.user_name || ev.leader_id) || undefined,
          leader_id: undefined,
        }
      }
      return base
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener el historial',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
