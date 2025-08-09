// Ejemplo de implementación de APIs para timeline y mensajes
// Este archivo muestra cómo podrías implementar los endpoints necesarios

import type { NextApiRequest, NextApiResponse } from 'next'

// Tipos de datos esperados
interface TimelineEvent {
  id: number
  request_id: number
  status: string
  comment?: string
  user_name?: string
  user_role?: string
  created_at: string
  changed_by?: string
  fecha_cambio?: string
}

interface MessageEvent {
  id: number
  request_id: number
  from: string
  user_name?: string
  user_role?: string
  comment: string
  message?: string
  type: 'status_change' | 'comment' | 'approval' | 'rejection'
  created_at: string
  timestamp?: string
}

// ENDPOINT 1: GET /api/requests/[id]/timeline
export async function getRequestTimeline(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Conectar a tu base de datos y obtener el historial
    // Ejemplo de consulta SQL (ajustar según tu schema):
    /*
    SELECT 
      id,
      request_id,
      status,
      comment,
      user_name,
      user_role,
      created_at,
      changed_by
    FROM request_status_history 
    WHERE request_id = ? 
    ORDER BY created_at ASC
    */

    // Ejemplo de datos que podrías obtener de la BD
    const timelineEvents: TimelineEvent[] = [
      {
        id: 1,
        request_id: Number(id),
        status: 'pending_approval',
        comment: 'Solicitud recibida automáticamente',
        user_name: 'Sistema',
        user_role: 'system',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        request_id: Number(id),
        status: 'in_evaluation',
        comment: 'Iniciando evaluación de la solicitud',
        user_name: 'Juan Pérez',
        user_role: 'lider_dominio',
        created_at: '2024-01-16T14:30:00Z'
      },
      {
        id: 3,
        request_id: Number(id),
        status: 'approved',
        comment: 'Solicitud aprobada tras análisis detallado. La clasificación final es proyecto con prioridad P2.',
        user_name: 'Juan Pérez',
        user_role: 'lider_dominio',
        created_at: '2024-01-18T09:15:00Z'
      }
    ]

    return res.status(200).json(timelineEvents)

  } catch (error) {
    console.error('Error fetching timeline:', error)
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el historial de la solicitud'
    })
  }
}

// ENDPOINT 2: GET /api/requests/[id]/messages
export async function getRequestMessages(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Conectar a tu base de datos y obtener los mensajes/comentarios
    // Ejemplo de consulta SQL (ajustar según tu schema):
    /*
    SELECT 
      rsh.id,
      rsh.request_id,
      rsh.comment as message,
      rsh.status,
      rsh.created_at,
      u.name as user_name,
      u.role as user_role,
      CASE 
        WHEN rsh.status = 'approved' THEN 'approval'
        WHEN rsh.status = 'rejected' THEN 'rejection'
        WHEN rsh.status IS NOT NULL AND rsh.comment IS NOT NULL THEN 'status_change'
        ELSE 'comment'
      END as type
    FROM request_status_history rsh
    LEFT JOIN users u ON rsh.changed_by = u.id
    WHERE rsh.request_id = ? 
      AND rsh.comment IS NOT NULL 
      AND rsh.comment != ''
      AND u.role = 'lider_dominio'  -- Solo comentarios de líderes para usuarios
    ORDER BY rsh.created_at DESC
    */

    // Ejemplo de datos que podrías obtener de la BD
    const messageEvents: MessageEvent[] = [
      {
        id: 1,
        request_id: Number(id),
        from: 'Juan Pérez',
        user_name: 'Juan Pérez',
        user_role: 'lider_dominio',
        comment: 'Hemos recibido tu solicitud y la estamos evaluando. Te mantendremos informado del progreso.',
        type: 'comment',
        created_at: '2024-01-16T14:30:00Z'
      },
      {
        id: 2,
        request_id: Number(id),
        from: 'Juan Pérez',
        user_name: 'Juan Pérez',
        user_role: 'lider_dominio',
        comment: 'Solicitud aprobada tras análisis detallado. La clasificación final es proyecto con prioridad P2.',
        type: 'approval',
        created_at: '2024-01-18T09:15:00Z'
      }
    ]

    return res.status(200).json(messageEvents)

  } catch (error) {
    console.error('Error fetching messages:', error)
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo obtener los mensajes de la solicitud'
    })
  }
}

// EJEMPLO DE CÓMO CONECTAR CON UNA BASE DE DATOS REAL
/*
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

export async function getRequestTimelineFromDB(requestId: number): Promise<TimelineEvent[]> {
  const connection = await mysql.createConnection(dbConfig)
  
  try {
    const [rows] = await connection.execute(`
      SELECT 
        rsh.id,
        rsh.request_id,
        rsh.status,
        rsh.comment,
        rsh.created_at,
        u.name as user_name,
        u.role as user_role
      FROM request_status_history rsh
      LEFT JOIN users u ON rsh.changed_by = u.id
      WHERE rsh.request_id = ?
      ORDER BY rsh.created_at ASC
    `, [requestId])

    return rows as TimelineEvent[]
  } finally {
    await connection.end()
  }
}

export async function getRequestMessagesFromDB(requestId: number): Promise<MessageEvent[]> {
  const connection = await mysql.createConnection(dbConfig)
  
  try {
    const [rows] = await connection.execute(`
      SELECT 
        rsh.id,
        rsh.request_id,
        rsh.comment as message,
        rsh.status,
        rsh.created_at,
        u.name as user_name,
        u.role as user_role,
        CASE 
          WHEN rsh.status = 'approved' THEN 'approval'
          WHEN rsh.status = 'rejected' THEN 'rejection'
          WHEN rsh.status IS NOT NULL AND rsh.comment IS NOT NULL THEN 'status_change'
          ELSE 'comment'
        END as type
      FROM request_status_history rsh
      LEFT JOIN users u ON rsh.changed_by = u.id
      WHERE rsh.request_id = ? 
        AND rsh.comment IS NOT NULL 
        AND rsh.comment != ''
        AND u.role = 'lider_dominio'
      ORDER BY rsh.created_at DESC
    `, [requestId])

    return rows as MessageEvent[]
  } finally {
    await connection.end()
  }
}
*/

// INSTRUCCIONES PARA IMPLEMENTAR EN TU PROYECTO:
/*
1. Crea estos archivos en tu directorio de API:
   - pages/api/requests/[id]/timeline.ts
   - pages/api/requests/[id]/messages.ts

2. En cada archivo, implementa las funciones correspondientes:

   // pages/api/requests/[id]/timeline.ts
   import { getRequestTimeline } from '../../../../api/examples/request-timeline-messages'
   export default getRequestTimeline

   // pages/api/requests/[id]/messages.ts
   import { getRequestMessages } from '../../../../api/examples/request-timeline-messages'
   export default getRequestMessages

3. Ajusta las consultas SQL según tu esquema de base de datos

4. Configura las variables de entorno para la conexión a la BD:
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database

5. Instala las dependencias necesarias:
   npm install mysql2
   # o si usas PostgreSQL:
   npm install pg
   # o si usas otro ORM como Prisma:
   npm install prisma @prisma/client

6. Los hooks useRequestTimeline y useRequestMessages automáticamente 
   consumirán estos endpoints cuando se abra el modal de usuario
*/
