import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'
import { Pool } from 'pg'

// Configuración de la base de datos (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtrado
    const status = searchParams.get('status')
    const domain = searchParams.get('domain')
    const priority = searchParams.get('priority')
    const leader = searchParams.get('leader')
    const user_id = searchParams.get('user_id') // Para filtrar por usuario específico
    const search = searchParams.get('search')
    
    // Query base
    let query = `
      SELECT 
        r.*,
        s.current_stage,
        s.conversation_data,
        COALESCE(r.leader_comments, '') as leader_comments,
        COALESCE(r.technical_analysis, '{}') as technical_analysis,
        EXTRACT(EPOCH FROM (NOW() - r.created_at))/86400 as days_since_created,
        CASE 
          WHEN r.status = 'pending_approval' THEN EXTRACT(EPOCH FROM (NOW() - r.created_at))/3600
          ELSE 0
        END as hours_waiting
      FROM requests r
      LEFT JOIN session_states s ON r.session_id = s.session_id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0
    
    // Aplicar filtros dinámicamente
    if (status) {
      paramCount++
      query += ` AND r.status = $${paramCount}`
      params.push(status)
    }
    
    if (user_id) {
      paramCount++
      query += ` AND r.user_id = $${paramCount}`
      params.push(user_id)
    }
    
    if (domain) {
      paramCount++
      query += ` AND r.departamento_solicitante = $${paramCount}`
      params.push(domain)
    }
    
    if (priority) {
      paramCount++
      query += ` AND r.prioridad_sugerida = $${paramCount}`
      params.push(priority)
    }
    
    if (search) {
      paramCount++
      query += ` AND (
        r.titulo_solicitud ILIKE $${paramCount} OR 
        r.problema_principal ILIKE $${paramCount} OR
        r.objetivo_esperado ILIKE $${paramCount}
      )`
      params.push(`%${search}%`)
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    query += ` ORDER BY r.created_at DESC`
    
    // Ejecutar query con fallback si falta tabla session_states
    let result
    try {
      result = await pool.query(query, params)
    } catch (e: any) {
      const msg = String(e?.message || '')
      // Si falta la tabla de estados de sesión, reintentar sin el JOIN
      if (msg.includes('relation') && msg.includes('session_states')) {
        const simpleQuery = `
          SELECT 
            r.*,
            NULL::text as current_stage,
            NULL::jsonb as conversation_data,
            COALESCE(r.leader_comments, '') as leader_comments,
            COALESCE(r.technical_analysis, '{}') as technical_analysis,
            EXTRACT(EPOCH FROM (NOW() - r.created_at))/86400 as days_since_created,
            CASE 
              WHEN r.status = 'pending_approval' THEN EXTRACT(EPOCH FROM (NOW() - r.created_at))/3600
              ELSE 0
            END as hours_waiting
          FROM requests r
          WHERE 1=1
          ${status ? ' AND r.status = $1' : ''}
        `
        result = await pool.query(simpleQuery, params.slice(0, status ? 1 : 0))
      } else if (msg.includes('relation') && msg.includes('requests')) {
        // Si la tabla principal no existe aún, devolver vacío en vez de 500
        return NextResponse.json({ success: true, data: [], total: 0, timestamp: new Date().toISOString() })
      } else {
        throw e
      }
    }
    
    // Transformar datos para el frontend
    const requests = result.rows.map((row: any) => ({
      id: row.id,
      session_id: row.session_id,
      user_id: row.user_id,
      title: row.titulo_solicitud ?? row.title ?? 'Sin título',
      problem: row.problema_principal ?? row.description ?? '',
      objective: row.objetivo_esperado,
      platforms: row.plataformas_involucradas || [],
      beneficiaries: row.beneficiarios,
      frequency: row.frecuencia_uso,
      timeframe: row.plazo_deseado,
      department: row.departamento_solicitante,
      score: row.score_estimado,
      classification: row.clasificacion_sugerida,
      priority: row.prioridad_sugerida,
      technical_analysis: row.technical_analysis,
      status: row.status,
      leader_comments: row.leader_comments,
      created_at: row.created_at,
      days_since_created: Math.floor(row.days_since_created),
      hours_waiting: Math.floor(row.hours_waiting),
      // Datos adicionales de la sesión
      conversation_data: row.conversation_data,
      current_stage: row.current_stage
    }))
    
    return NextResponse.json({
      success: true,
      data: requests,
      total: requests.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las solicitudes',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// POST para crear nuevas solicitudes (desde N8N)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      session_id,
      user_id,
      titulo_solicitud,
      problema_principal,
      objetivo_esperado,
      plataformas_involucradas,
      beneficiarios,
      frecuencia_uso,
      plazo_deseado,
      departamento_solicitante,
      score_estimado,
      clasificacion_sugerida,
      prioridad_sugerida,
      technical_analysis = null,
      status = 'pending_approval'
    } = body
    
    const query = `
      INSERT INTO requests (
        session_id,
        user_id,
        titulo_solicitud,
        problema_principal,
        objetivo_esperado,
        plataformas_involucradas,
        beneficiarios,
        frecuencia_uso,
        plazo_deseado,
        departamento_solicitante,
        score_estimado,
        clasificacion_sugerida,
        prioridad_sugerida,
        technical_analysis,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, created_at
    `
    
    const result = await pool.query(query, [
      session_id,
      user_id,
      titulo_solicitud,
      problema_principal,
      objetivo_esperado,
      JSON.stringify(plataformas_involucradas),
      beneficiarios,
      frecuencia_uso,
      plazo_deseado,
      departamento_solicitante,
      score_estimado,
      clasificacion_sugerida,
      prioridad_sugerida,
      technical_analysis ? JSON.stringify(technical_analysis) : null,
      status
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at,
        folio: result.rows[0].id.toString().padStart(6, '0')
      },
      message: 'Solicitud creada exitosamente'
    })
    
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear la solicitud',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
