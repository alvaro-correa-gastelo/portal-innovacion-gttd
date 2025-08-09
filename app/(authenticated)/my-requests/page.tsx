'use client'

import { RequestRouter } from '@/components/request-router'

/**
 * Página de redirección inteligente que envía al usuario
 * a la vista correcta según su rol
 */
export default function MyRequestsPage() {
  // En un entorno real, obtendríamos el email del usuario desde:
  // - Context de autenticación
  // - JWT token
  // - Session storage
  // - API call
  
  // Para demo, puedes cambiar este valor para probar diferentes roles:
  // - null o 'user@example.com' -> Vista de usuario
  // - 'leader@example.com' -> Vista de líder  
  // - 'admin@example.com' -> Vista de administrador
  const userEmail = 'test.user@utp.edu.pe' // Cambiar según el rol que quieras probar
  
  return (
    <RequestRouter 
      userEmail={userEmail} 
      fallbackRole="user" 
    />
  )
}
