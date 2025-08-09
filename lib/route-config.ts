// Configuración de rutas según el rol del usuario

export const ROUTES = {
  USER: '/requests/user',           // Vista para usuarios normales (solicitantes)
  LEADER: '/requests/leader',       // Vista para líderes de dominio
  ADMIN: '/requests/admin',         // Vista para administradores del área PS
  MY_REQUESTS: '/my-requests'       // Alias para compatibilidad (redirige según rol)
} as const

export type UserRole = 'user' | 'leader' | 'admin'

export interface RouteConfig {
  path: string
  label: string
  description: string
  icon: string
}

export const ROUTE_CONFIGS: Record<UserRole, RouteConfig> = {
  user: {
    path: ROUTES.USER,
    label: 'Mis Solicitudes',
    description: 'Seguimiento de tus solicitudes de innovación',
    icon: 'User'
  },
  leader: {
    path: ROUTES.LEADER,
    label: 'Panel de Gestión',
    description: 'Administración y revisión de solicitudes',
    icon: 'Shield'
  },
  admin: {
    path: ROUTES.ADMIN,
    label: 'Panel Administrativo',
    description: 'Análisis completo del sistema',
    icon: 'Database'
  }
}

/**
 * Obtiene la ruta apropiada basada en el rol del usuario
 */
export function getRouteForRole(role: UserRole): string {
  return ROUTE_CONFIGS[role].path
}

/**
 * Obtiene la configuración de ruta para un rol específico
 */
export function getRouteConfig(role: UserRole): RouteConfig {
  return ROUTE_CONFIGS[role]
}

/**
 * Determina el rol del usuario basado en su email/información
 * (En producción esto vendría de la base de datos o JWT)
 */
export function determineUserRole(userEmail: string | null): UserRole {
  if (!userEmail) return 'user'
  
  // Ejemplo de lógica para determinar roles
  if (userEmail.includes('admin') || userEmail.includes('ps.leader')) {
    return 'admin'
  }
  
  if (userEmail.includes('leader') || userEmail.includes('jefe')) {
    return 'leader'
  }
  
  return 'user'
}

/**
 * Valida si un usuario tiene acceso a una ruta específica
 */
export function hasAccessToRoute(userRole: UserRole, targetPath: string): boolean {
  const userConfig = ROUTE_CONFIGS[userRole]
  
  // Los usuarios pueden acceder a su propia vista
  if (targetPath === userConfig.path) {
    return true
  }
  
  // Los administradores pueden acceder a todas las vistas
  if (userRole === 'admin') {
    return true
  }
  
  // Los líderes pueden acceder a vistas de usuario y líder
  if (userRole === 'leader' && (targetPath === ROUTES.USER || targetPath === ROUTES.LEADER)) {
    return true
  }
  
  // Compatibilidad con ruta legacy
  if (targetPath === ROUTES.MY_REQUESTS) {
    return true
  }
  
  return false
}

/**
 * Obtiene las rutas disponibles para un rol específico
 */
export function getAvailableRoutes(userRole: UserRole): RouteConfig[] {
  const routes: RouteConfig[] = []
  
  // Siempre incluir la ruta propia
  routes.push(ROUTE_CONFIGS[userRole])
  
  // Agregar rutas adicionales basadas en permisos
  if (userRole === 'admin') {
    // Los admins ven todas las vistas
    routes.push(ROUTE_CONFIGS.leader, ROUTE_CONFIGS.user)
  } else if (userRole === 'leader') {
    // Los líderes pueden ver vista de usuario
    routes.push(ROUTE_CONFIGS.user)
  }
  
  // Remover duplicados y ordenar
  return routes.filter((route, index, self) => 
    index === self.findIndex(r => r.path === route.path)
  )
}
