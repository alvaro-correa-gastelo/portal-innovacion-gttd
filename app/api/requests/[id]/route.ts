import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Configuración de la base de datos (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

// GET - Obtener detalles de una solicitud específica
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    // Next.js may pass params as a promise; await defensively
    const { id: requestId } = 'params' in ctx ? await (ctx as any).params : { id: undefined }
    
    const query = `
      SELECT 
        r.*,
        s.conversation_data,
        s.current_stage,
        s.completeness_score,
        COALESCE(r.leader_comments, '') as leader_comments,
        COALESCE(r.technical_analysis, '{}') as technical_analysis,
        EXTRACT(EPOCH FROM (NOW() - r.created_at))/86400 as days_since_created,
        CASE 
          WHEN r.status = 'pending_approval' THEN EXTRACT(EPOCH FROM (NOW() - r.created_at))/3600
          ELSE 0
        END as hours_waiting
      FROM requests r
      LEFT JOIN session_states s ON r.session_id = s.session_id
      WHERE r.id = $1
    `
    
    const result = await pool.query(query, [requestId])
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }
    
    const row = result.rows[0]
    const requestData = {
      id: row.id,
      session_id: row.session_id,
      user_id: row.user_id,
      title: row.titulo_solicitud,
      problem: row.problema_principal,
      objective: row.objetivo_esperado,
      platforms: row.plataformas_involucradas || [],
      beneficiaries: row.beneficiarios,
      frequency: row.frecuencia_uso,
      timeframe: row.plazo_deseado,
      department: row.departamento_solicitante,
      score: row.score_estimado,
      classification: row.clasificacion_sugerida,
      priority: row.prioridad_sugerida,
      final_classification: row.clasificacion_final,
      final_priority: row.prioridad_final,
      leader_override: row.leader_override,
      override_reason: row.override_reason,
      technical_analysis: row.technical_analysis,
      status: row.status,
      leader_comments: row.leader_comments,
      created_at: row.created_at,
      days_since_created: Math.floor(row.days_since_created),
      hours_waiting: Math.floor(row.hours_waiting),
      // Datos adicionales de la sesión
      conversation_data: row.conversation_data,
      current_stage: row.current_stage,
      completeness_score: row.completeness_score
    }
    
    return NextResponse.json({
      success: true,
      data: requestData
    })
    
  } catch (error) {
    console.error('Error fetching request details:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener los detalles de la solicitud',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// PUT - Actualizar estado de solicitud (aprobar, rechazar, comentarios)
export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    // Next.js may pass params as a promise; await defensively
    const { id: requestId } = 'params' in ctx ? await (ctx as any).params : { id: undefined }
    const body = await request.json()
    
    const {
      status,
      leader_comments,
      leader_id,
      action,
      clasificacion_final,
      prioridad_final,
      override_reason
    } = body

    // Obtener estado previo para auditoría y mensajes
    let previousStatus: string | null = null
    try {
      const prev = await pool.query('SELECT status FROM requests WHERE id = $1', [requestId])
      previousStatus = prev.rows?.[0]?.status ?? null
    } catch (e) {
      // no crítico
    }
    
    // Validar estados permitidos
    const validStatuses = [
      'pending_technical_analysis',
      'pending_approval',
      'in_evaluation', 
      'on_hold',
      'approved',
      'rejected'
    ]
    
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Estado no válido' },
        { status: 400 }
      )
    }
    
    // Construir query dinámico
    let updateFields = []
    let queryParams = []
    let paramCount = 0
    
    if (status) {
      paramCount++
      updateFields.push(`status = $${paramCount}`)
      queryParams.push(status)
    }
    
    if (leader_comments !== undefined) {
      paramCount++
      updateFields.push(`leader_comments = $${paramCount}`)
      queryParams.push(leader_comments)
    }
    
    if (clasificacion_final !== undefined) {
      paramCount++
      updateFields.push(`clasificacion_final = $${paramCount}`)
      queryParams.push(clasificacion_final)
    }
    
    if (prioridad_final !== undefined) {
      paramCount++
      updateFields.push(`prioridad_final = $${paramCount}`)
      queryParams.push(prioridad_final)
    }
    
    if (override_reason !== undefined) {
      paramCount++
      updateFields.push(`override_reason = $${paramCount}`)
      queryParams.push(override_reason)
    }
    
    paramCount++
    queryParams.push(requestId)
    
    const query = `
      UPDATE requests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, status, leader_comments, clasificacion_sugerida, prioridad_sugerida, clasificacion_final, prioridad_final, leader_override, override_reason, created_at, updated_at
    `
    
    const result = await pool.query(query, queryParams)
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }
    
    // Log de la acción para auditoría
    const logAction = async () => {
      try {
        const logQuery = `
          INSERT INTO requests_audit (
            request_id, 
            action_type, 
            previous_status, 
            new_status, 
            leader_id,
            comments,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `
        // Este insert puede fallar si no existe la tabla, pero no es crítico
        await pool.query(logQuery, [
          requestId,
          action || 'status_update',
          previousStatus,
          status || previousStatus,
          leader_id,
          leader_comments
        ]).catch(() => {}) // Silenciar error si no existe tabla de auditoría
      } catch (e) {
        // No es crítico si falla el log
      }
    }
    
    logAction()
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: getActionMessage(action, status)
    })
    
  } catch (error) {
    console.error('Error updating request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar la solicitud',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar solicitud (solo para casos especiales)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id
    
    // Verificar que la solicitud existe
    const checkQuery = `SELECT id, status FROM requests WHERE id = $1`
    const checkResult = await pool.query(checkQuery, [requestId])
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }
    
    // No eliminar, solo marcar como cancelada
    const updateQuery = `
      UPDATE requests 
      SET status = 'cancelled'
      WHERE id = $1
      RETURNING id, status
    `
    
    const result = await pool.query(updateQuery, [requestId])
    
    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Solicitud cancelada exitosamente'
    })
    
  } catch (error) {
    console.error('Error cancelling request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al cancelar la solicitud',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

function getActionMessage(action: string, status: string): string {
  switch (action) {
    case 'approve':
      return 'Solicitud aprobada exitosamente'
    case 'reject':
      return 'Solicitud rechazada'
    case 'hold':
      return 'Solicitud puesta en espera'
    case 'evaluate':
      return 'Solicitud marcada como en evaluación'
    case 'update_classification':
      return status
        ? `Clasificación y prioridad guardadas. Estado actualizado a: ${status}`
        : 'Clasificación y prioridad guardadas.'
    case 'actualizar_clasificacion':
      return 'Clasificación y prioridad actualizadas exitosamente'
    default:
      return status ? `Estado actualizado a: ${status}` : 'Solicitud actualizada exitosamente'
  }
}
