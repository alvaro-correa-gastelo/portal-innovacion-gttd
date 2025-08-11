import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configuración de la base de datos (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// Alinear con otros handlers: runtime Node y sin caché
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

// GET de cortesía (evita 404 por GET en Vercel)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    success: true,
    message: 'Use PUT to reject a request',
    request_id: params.id,
    allowed_methods: ['PUT', 'OPTIONS']
  })
}

// OPTIONS para preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store',
    },
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id
    const body = await request.json()
    
    const {
      status = 'rejected',
      leader_comments,
      rejected_by,
      rejected_at
    } = body

    // Actualizar la solicitud en la base de datos
    const query = `
      UPDATE requests
      SET 
        status = $1,
        leader_comments = $2,
        rejected_by = $3,
        rejected_at = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `
    
    const result = await pool.query(query, [
      status,
      leader_comments,
      rejected_by,
      rejected_at || new Date().toISOString(),
      requestId
    ])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Solicitud no encontrada'
        },
        { status: 404 }
      )
    }

    // Registrar en el log de auditoría (si existe la tabla)
    try {
      await pool.query(`
        INSERT INTO audit_logs (
          request_id,
          action,
          performed_by,
          details,
          created_at
        ) VALUES ($1, $2, $3, $4, NOW())
      `, [
        requestId,
        'REJECTED',
        rejected_by,
        JSON.stringify({ rejection_reason: leader_comments })
      ])
    } catch (auditError) {
      // Si no existe la tabla de auditoría, continuamos sin error
      console.log('Audit table not found, skipping audit log')
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        leader_comments: result.rows[0].leader_comments
      },
      message: 'Solicitud rechazada'
    })
    
  } catch (error) {
    console.error('Error rejecting request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al rechazar la solicitud',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
