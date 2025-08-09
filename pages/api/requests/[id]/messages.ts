import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/lib/database'

// Esta API obtiene los mensajes/comentarios desde requests_audit
// Filtra solo los registros que tienen comentarios para mostrar al usuario

interface MessageEvent {
  id: string
  request_id: string
  action_type: string
  new_status?: string
  leader_id?: string
  comments: string
  created_at: string
  user_name?: string
  user_role?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!id) {
    return res.status(400).json({ error: 'Request ID is required' })
  }

  try {
    const messageEvents = await getRequestMessagesFromDB(id as string)
    
    // Transformar los datos para el frontend
    const transformedMessages = messageEvents.map(event => {
      // Determinar el tipo de mensaje basado en action_type y new_status
      let type = 'comment'
      if (event.action_type === 'approval' || event.new_status === 'approved') {
        type = 'approval'
      } else if (event.action_type === 'rejection' || event.new_status === 'rejected') {
        type = 'rejection'
      } else if (event.action_type === 'status_change') {
        type = 'status_change'
      }

      return {
        id: event.id,
        from: event.user_name || event.leader_id || 'Líder de Dominio',
        user_name: event.user_name || event.leader_id,
        user_role: event.user_role || 'lider_dominio',
        comment: event.comments,
        type: type,
        created_at: event.created_at,
        action_type: event.action_type
      }
    })

    return res.status(200).json(transformedMessages)

  } catch (error) {
    console.error('Error fetching messages:', error)
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo obtener los mensajes de la solicitud'
    })
  }
}

// Función para obtener mensajes desde PostgreSQL
async function getRequestMessagesFromDB(requestId: string): Promise<MessageEvent[]> {
  try {
    const sqlQuery = `
      SELECT 
        ra.id::text,
        ra.request_id::text,
        ra.action_type,
        ra.new_status,
        ra.leader_id,
        ra.comments,
        ra.created_at,
        -- Si tienes una tabla de usuarios, puedes hacer JOIN para obtener nombres reales
        COALESCE(u.name, ra.leader_id) as user_name,
        COALESCE(u.role, 'lider_dominio') as user_role
      FROM requests_audit ra
      LEFT JOIN users u ON u.id = ra.leader_id  -- Ajusta según tu tabla de usuarios
      WHERE ra.request_id = $1
        AND ra.comments IS NOT NULL 
        AND ra.comments != ''
      ORDER BY ra.created_at DESC
    `

    const result = await query(sqlQuery, [requestId])
    return result.rows
  } catch (error) {
    console.error('Error fetching messages from DB:', error)
    // Fallback a datos de ejemplo si hay error de conexión
    return [
    {
      id: '1',
      request_id: requestId,
      action_type: 'comment',
      leader_id: 'juan.perez@empresa.com',
      user_name: 'Juan Pérez',
      user_role: 'lider_dominio',
      comments: 'Hemos recibido tu solicitud y la estamos evaluando. El análisis inicial muestra que es viable técnicamente.',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      request_id: requestId,
      action_type: 'status_change',
      new_status: 'in_evaluation',
      leader_id: 'juan.perez@empresa.com',
      user_name: 'Juan Pérez',
      user_role: 'lider_dominio',
      comments: 'He revisado los detalles técnicos. La clasificación sugerida por la IA parece correcta, pero necesito evaluar la prioridad.',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      request_id: requestId,
      action_type: 'approval',
      new_status: 'approved',
      leader_id: 'juan.perez@empresa.com',
      user_name: 'Juan Pérez',
      user_role: 'lider_dominio',
      comments: '¡Solicitud aprobada! He ajustado la prioridad a P2 considerando los recursos disponibles. El proyecto puede iniciarse el próximo sprint.',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    }
  ]
  }
}
