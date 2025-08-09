import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configuración de la base de datos (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// GET /api/requests/[id]/timeline
// Returns audit/history entries for a request, newest last
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await context.params

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

    // Return raw-ish events; front-end hook maps to UI fields
    const data = rows.map((ev, idx) => ({
      id: ev.id ?? idx + 1,
      action_type: ev.action_type || ev.new_status || 'update',
      status: ev.new_status || ev.action_type || 'update',
      created_at: ev.created_at,
      fecha_cambio: ev.created_at,
      comments: ev.comments,
      comment: ev.comments,
      user_name: ev.user_name,
      leader_id: ev.leader_id,
    }))

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
