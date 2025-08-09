'use client'

import { RequestRouter } from '@/components/request-router'

/**
 * Demostración de vista de Administrador del Área PS
 * Acceso directo: /demo/admin
 */
export default function DemoAdminPage() {
  return (
    <RequestRouter 
      userEmail="demo.admin@utp.edu.pe" 
      fallbackRole="admin" 
    />
  )
}
