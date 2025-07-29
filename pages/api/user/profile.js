// API Mock para autenticación de usuarios - Portal Innovación GTTD
// Esta API simula la validación de tokens JWT y devuelve perfiles de usuario

export default function handler(req, res) {
    // Configurar CORS para permitir requests desde n8n y frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Manejar preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Solo permitir GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Método no permitido',
            message: 'Solo se permiten requests GET'
        });
    }
    
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            error: 'Token requerido',
            message: 'Authorization header missing'
        });
    }
    
    // Extraer token (remover "Bearer " si existe)
    const token = authHeader.replace('Bearer ', '');
    
    // Extraer user_id del token (formato: demo_token_USER_ID)
    const tokenParts = token.split('_');
    const userId = tokenParts.length >= 3 ? tokenParts[2] : 'demo';
    
    // Base de datos mock de usuarios del Portal UTP
    const mockUsers = {
        '1': {
            user_id: 'user_001',
            name: 'María González Rodríguez',
            area: 'RRHH',
            role: 'Coordinadora de Talento Humano',
            email: 'maria.gonzalez@utp.edu.co',
            department: 'Recursos Humanos',
            phone: '+57 300 123 4567',
            location: 'Sede Principal - Pereira'
        },
        '2': {
            user_id: 'user_002', 
            name: 'Carlos Andrés Rodríguez',
            area: 'Finanzas',
            role: 'Analista Financiero Senior',
            email: 'carlos.rodriguez@utp.edu.co',
            department: 'Finanzas y Contabilidad',
            phone: '+57 300 234 5678',
            location: 'Sede Principal - Pereira'
        },
        '3': {
            user_id: 'user_003',
            name: 'Ana Patricia Martínez',
            area: 'Operaciones',
            role: 'Jefe de Operaciones',
            email: 'ana.martinez@utp.edu.co',
            department: 'Operaciones y Logística',
            phone: '+57 300 345 6789',
            location: 'Sede Principal - Pereira'
        },
        '4': {
            user_id: 'user_004',
            name: 'Luis Fernando Gómez',
            area: 'GTTD',
            role: 'Coordinador de Innovación',
            email: 'luis.gomez@utp.edu.co',
            department: 'Gestión de Tecnología y Transformación Digital',
            phone: '+57 300 456 7890',
            location: 'Sede Principal - Pereira'
        },
        'demo': {
            user_id: 'demo_user',
            name: 'Usuario Demo',
            area: 'GTTD',
            role: 'Tester del Sistema',
            email: 'demo@utp.edu.co',
            department: 'Tecnología - Testing',
            phone: '+57 300 000 0000',
            location: 'Entorno de Pruebas'
        }
    };
    
    // Simular validación de token
    if (token.includes('invalid') || token.includes('expired')) {
        return res.status(401).json({
            error: 'Token inválido',
            message: 'JWT expired or invalid',
            code: 'TOKEN_INVALID'
        });
    }
    
    // Buscar usuario por ID
    const user = mockUsers[userId] || mockUsers['demo'];
    
    // Agregar metadata de la respuesta
    const response = {
        ...user,
        token_info: {
            issued_at: new Date().toISOString(),
            expires_in: 3600, // 1 hora
            token_type: 'Bearer'
        },
        session_info: {
            last_login: new Date(Date.now() - Math.random() * 86400000).toISOString(),
            session_duration: Math.floor(Math.random() * 3600),
            ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
        }
    };
    
    // Log para debugging (visible en Vercel Functions logs)
    console.log(`[AUTH API] Usuario autenticado: ${user.name} (${user.user_id})`);
    
    // Responder con datos del usuario
    res.status(200).json(response);
}
