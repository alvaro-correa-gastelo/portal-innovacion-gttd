import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// POST /api/configurations/:id/activate - Activar configuración específica
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { changed_by } = body;

    if (!changed_by) {
      return NextResponse.json(
        { error: 'Campo changed_by requerido', success: false },
        { status: 400 }
      );
    }

    // Iniciar transacción
    await query('BEGIN');

    // 1. Desactivar todas las configuraciones activas
    await query('UPDATE scoring_configurations SET is_active = false WHERE is_active = true');

    // 2. Activar la configuración específica
    const { rows: updatedConfigs } = await query(
      'UPDATE scoring_configurations SET is_active = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (updatedConfigs.length === 0) {
      await query('ROLLBACK');
      return NextResponse.json(
        { error: 'Configuración no encontrada para activar', success: false },
        { status: 404 }
      );
    }

    // 3. Registrar en la auditoría
    const { rows: auditRows } = await query(
      'INSERT INTO configuration_audit (config_id, action, changed_by) VALUES ($1, $2, $3) RETURNING id',
      [id, 'activated', changed_by]
    );

    // Finalizar transacción
    await query('COMMIT');

    console.log(`Configuration ${id} activated by ${changed_by}`);

    return NextResponse.json({
      success: true,
      activated_config: updatedConfigs[0],
      audit_id: auditRows[0].id,
      message: 'Configuración activada exitosamente'
    });

  } catch (error) {
    console.error('Error activating configuration:', error);
    return NextResponse.json(
      { error: 'Error al activar configuración', success: false },
      { status: 500 }
    );
  }
}
