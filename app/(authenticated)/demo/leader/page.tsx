'use client'

import { RequestRouter } from '@/components/request-router'

/**
 * Demostración de vista de Líder de Dominio
 * Acceso directo: /demo/leader
 */
export default function DemoLeaderPage() {
  return (
    <RequestRouter 
      userEmail="demo.leader@utp.edu.pe" 
      fallbackRole="leader" 
    />
  )
}
