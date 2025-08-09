import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configuración de la base de datos (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id
    const body = await request.json()
    
    const {
      status = 'approved',
      leader_comments,
      priority_final,
      classification_final,
      approved_by,
      approved_at
    } = body

    // Actualizar la solicitud en la base de datos
    const query = `
      UPDATE requests
      SET 
        status = $1,
        leader_comments = $2,
        prioridad_sugerida = COALESCE($3, prioridad_sugerida),
        clasificacion_sugerida = COALESCE($4, clasificacion_sugerida),
        approved_by = $5,
        approved_at = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `
    
    const result = await pool.query(query, [
      status,
      leader_comments,
      priority_final,
      classification_final,
      approved_by,
      approved_at || new Date().toISOString(),
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
        'APPROVED',
        approved_by,
        JSON.stringify({ leader_comments, priority_final, classification_final })
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
        leader_comments: result.rows[0].leader_comments,
        priority: result.rows[0].prioridad_sugerida,
        classification: result.rows[0].clasificacion_sugerida
      },
      message: 'Solicitud aprobada exitosamente'
    })
    
  } catch (error) {
    console.error('Error approving request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al aprobar la solicitud',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
