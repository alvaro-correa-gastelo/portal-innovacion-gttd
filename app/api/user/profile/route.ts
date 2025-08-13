import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/user/profile
 * Endpoint para obtener información del perfil del usuario
 * Usado por N8N para validar sesiones y obtener contexto del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    // Generar IDs por defecto si no se proporcionan
    const effectiveUserId = userId || `user_${Date.now()}`;
    const effectiveSessionId = sessionId || `session_${Date.now()}`;

    // Simular datos del perfil del usuario
    // En producción, esto vendría de tu base de datos
    const userProfile = {
      userId: effectiveUserId,
      sessionId: effectiveSessionId,
      name: 'Usuario Demo',
      email: 'usuario@utp.edu.pe',
      department: 'Académico',
      role: 'Solicitante',
      preferences: {
        notifications: true,
        language: 'es'
      },
      stats: {
        totalRequests: 3,
        pendingRequests: 1,
        approvedRequests: 2
      },
      lastActivity: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: userProfile,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en /api/user/profile:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/profile
 * Endpoint para actualizar información del perfil del usuario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, ...updateData } = body;

    // Validar parámetros requeridos
    if (!userId && !sessionId) {
      return NextResponse.json(
        { 
          error: 'Se requiere userId o sessionId',
          code: 'MISSING_PARAMETERS'
        },
        { status: 400 }
      );
    }

    // Simular actualización del perfil
    // En producción, esto actualizaría la base de datos
    const updatedProfile = {
      userId: userId || `user_${sessionId}`,
      sessionId: sessionId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updatedProfile,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
