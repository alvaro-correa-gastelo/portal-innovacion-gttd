'use client'

import { RequestRouter } from '@/components/request-router'

/**
 * Demostración de vista de Usuario/Solicitante
 * Acceso directo: /demo/user
 */
export default function DemoUserPage() {
  return (
    <RequestRouter 
      userEmail="demo.user@utp.edu.pe" 
      fallbackRole="user" 
    />
  )
}
