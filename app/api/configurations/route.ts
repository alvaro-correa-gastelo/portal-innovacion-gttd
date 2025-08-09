import { NextRequest, NextResponse } from 'next/server';
import { query, createConfiguration } from '@/lib/database';

// GET /api/configurations - Obtener todas las configuraciones
export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT id, name, version, config_data, created_by, created_at, is_active, description
      FROM scoring_configurations
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      configurations: result.rows,
      success: true
    });

  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuraciones', success: false },
      { status: 500 }
    );
  }
}

// POST /api/configurations - Crear nueva configuración
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, version, config_data, description, created_by } = body;

    // Validaciones básicas
    if (!name || !version || !config_data || !created_by) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos', success: false },
        { status: 400 }
      );
    }

    // Crear configuración en la base de datos
    const newConfig = await createConfiguration({
      name,
      version,
      config_data,
      description,
      created_by
    });

    // Log audit trail
    await query(`
      INSERT INTO configuration_audit (config_id, action, changed_by, changes, timestamp)
      VALUES ($1, 'created', $2, $3, NOW())
    `, [newConfig.id, created_by, JSON.stringify(config_data)]);

    return NextResponse.json({
      configuration: newConfig,
      success: true
    });

  } catch (error) {
    console.error('Error creating configuration:', error);
    return NextResponse.json(
      { error: 'Error al crear configuración', success: false },
      { status: 500 }
    );
  }
}


