import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const ensureTable = async () => {
  const createSql = `
    CREATE TABLE IF NOT EXISTS scoring_config (
      id SERIAL PRIMARY KEY,
      formula TEXT NOT NULL,
      variables JSONB NOT NULL,
      updated_by TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
  await pool.query(createSql)
}

const defaultConfig = {
  formula: 'score = 0.4*urgencia + 0.2*clasificacion + 0.2*plataformas + 0.2*antiguedad',
  variables: {
    urgencia: { weight: 0.4, description: 'De P1..P4 -> 100,70,40,25' },
    clasificacion: { weight: 0.2, description: 'proyecto=100, requerimiento=70' },
    plataformas: { weight: 0.2, description: 'Cantidad de plataformas involucradas * 10 (cap 100)' },
    antiguedad: { weight: 0.2, description: 'Días desde creación (cap 100)' }
  }
}

export async function GET() {
  try {
    await ensureTable()

    const res = await pool.query('SELECT id, formula, variables, updated_by, updated_at FROM scoring_config ORDER BY id ASC LIMIT 1')
    if (res.rows.length === 0) {
      // Seed with default
      const insert = await pool.query(
        'INSERT INTO scoring_config (formula, variables, updated_by) VALUES ($1, $2, $3) RETURNING id, formula, variables, updated_by, updated_at',
        [defaultConfig.formula, JSON.stringify(defaultConfig.variables), 'system']
      )
      return NextResponse.json({ success: true, data: insert.rows[0] })
    }

    return NextResponse.json({ success: true, data: res.rows[0] })
  } catch (e) {
    console.error('GET scoring-config error', e)
    return NextResponse.json({ success: false, error: 'Error obteniendo configuración de scoring' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureTable()
    const body = await request.json()
    const { formula, variables, updated_by } = body || {}

    if (!formula || !variables) {
      return NextResponse.json({ success: false, error: 'formula y variables son requeridos' }, { status: 400 })
    }

    // Upsert single row (id=1)
    const upsertSql = `
      INSERT INTO scoring_config (id, formula, variables, updated_by, updated_at)
      VALUES (1, $1, $2, $3, NOW())
      ON CONFLICT (id)
      DO UPDATE SET formula = EXCLUDED.formula, variables = EXCLUDED.variables, updated_by = EXCLUDED.updated_by, updated_at = NOW()
      RETURNING id, formula, variables, updated_by, updated_at
    `
    const res = await pool.query(upsertSql, [formula, JSON.stringify(variables), updated_by || 'leader'])
    return NextResponse.json({ success: true, data: res.rows[0] })
  } catch (e) {
    console.error('PUT scoring-config error', e)
    return NextResponse.json({ success: false, error: 'Error actualizando configuración de scoring' }, { status: 500 })
  }
}
