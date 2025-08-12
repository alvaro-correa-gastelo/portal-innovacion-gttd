import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    return NextResponse.json({
      success: true,
      message: "Ruta dinámica de App Router funcionando correctamente.",
      id: params.id,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error en el endpoint de prueba de App Router',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
