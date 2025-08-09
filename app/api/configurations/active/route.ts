import { NextRequest, NextResponse } from 'next/server';
import { getActiveConfig } from '@/lib/database';

export const dynamic = 'force-dynamic'; // Evita el cacheo estático de la ruta

// GET /api/configurations/active - Obtener configuración activa
export async function GET(request: NextRequest) {
  try {
    const activeConfig = await getActiveConfig();

    if (!activeConfig) {
      return NextResponse.json(
        { error: 'No hay configuración activa', success: false },
        { status: 404 }
      );
    }
    return NextResponse.json({
      config: activeConfig,
      success: true
    });

  } catch (error) {
    console.error('Error fetching active configuration:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración activa', success: false },
      { status: 500 }
    );
  }
}
