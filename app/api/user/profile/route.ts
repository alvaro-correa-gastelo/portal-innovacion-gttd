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

    // Perfiles realistas variados para demostración
    const userProfiles = [
      {
        user_id: effectiveUserId,
        name: "Dr. María Elena Rodríguez",
        area: "Académico",
        role: "Coordinadora de Innovación Educativa",
        email: "maria.rodriguez@utp.edu.pe",
        department: "Académico - Vicerrectoría de Investigación",
        phone: "+51 1 315 9600 ext. 2847",
        location: "Campus Lima - Edificio Central"
      },
      {
        user_id: effectiveUserId,
        name: "Ing. Carlos Mendoza Silva",
        area: "Académico",
        role: "Director de Tecnología Educativa",
        email: "carlos.mendoza@utp.edu.pe",
        department: "Académico - Dirección de Sistemas",
        phone: "+51 1 315 9600 ext. 3142",
        location: "Campus Lima - Torre Académica"
      },
      {
        user_id: effectiveUserId,
        name: "Dra. Ana Patricia Vega",
        area: "Académico",
        role: "Jefa de Laboratorios de Innovación",
        email: "ana.vega@utp.edu.pe",
        department: "Académico - Facultad de Ingeniería",
        phone: "+51 1 315 9600 ext. 2956",
        location: "Campus Lima - Laboratorios"
      }
    ];

    // Seleccionar perfil basado en el userId o aleatorio
    const profileIndex = userId ? 
      Math.abs(userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % userProfiles.length :
      Math.floor(Math.random() * userProfiles.length);
    
    const selectedProfile = userProfiles[profileIndex];

    // Completar con datos dinámicos
    const userProfile = {
      ...selectedProfile,
      token_info: {
        issued_at: new Date().toISOString(),
        expires_in: 3600,
        token_type: "Bearer"
      },
      session_info: {
        last_login: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(), // 0-4 horas atrás
        session_duration: Math.floor(Math.random() * 300) + 120, // 2-7 minutos
        ip_address: "190.216.234." + Math.floor(Math.random() * 255) // IP dinámica de Perú
      },
      preferences: {
        notifications: true,
        language: 'es',
        theme: Math.random() > 0.5 ? 'light' : 'dark'
      },
      stats: {
        totalRequests: Math.floor(Math.random() * 15) + 5, // 5-20 solicitudes
        pendingRequests: Math.floor(Math.random() * 5) + 1, // 1-5 pendientes
        approvedRequests: Math.floor(Math.random() * 10) + 2, // 2-12 aprobadas
        rejectedRequests: Math.floor(Math.random() * 3) // 0-2 rechazadas
      }
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
