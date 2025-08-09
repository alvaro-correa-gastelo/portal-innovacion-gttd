'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { determineUserRole, getRouteForRole } from '@/lib/route-config'

interface RequestRouterProps {
  userEmail?: string | null
  fallbackRole?: 'user' | 'leader' | 'admin'
}

/**
 * Componente que redirige automáticamente a la vista correcta 
 * basada en el rol del usuario
 */
export function RequestRouter({ 
  userEmail = null, 
  fallbackRole = 'user' 
}: RequestRouterProps) {
  const router = useRouter()

  useEffect(() => {
    // Determinar el rol del usuario
    const userRole = userEmail ? determineUserRole(userEmail) : fallbackRole
    
    // Obtener la ruta correspondiente
    const targetRoute = getRouteForRole(userRole)
    
    // Redirigir a la ruta apropiada
    router.replace(targetRoute)
  }, [userEmail, fallbackRole, router])

  // Mostrar loading mientras se redirige
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Redirigiendo a tu panel personalizado...
        </p>
      </div>
    </div>
  )
}

/**
 * Hook para obtener la ruta apropiada para el usuario actual
 */
export function useUserRoute(userEmail?: string | null) {
  const userRole = determineUserRole(userEmail || null)
  const route = getRouteForRole(userRole)
  
  return {
    userRole,
    route,
    config: {
      path: route,
      label: userRole === 'admin' ? 'Panel Administrativo' : 
             userRole === 'leader' ? 'Panel de Gestión' : 'Mis Solicitudes'
    }
  }
}
