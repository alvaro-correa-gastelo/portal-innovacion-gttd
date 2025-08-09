import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';

// GET /api/database/test - Probar conexión a la base de datos
export async function GET(request: NextRequest) {
  try {
    const result = await testConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Conexión a base de datos exitosa',
        timestamp: result.time,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Error de conexión a base de datos',
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al probar conexión',
      error: error.message
    }, { status: 500 });
  }
}
