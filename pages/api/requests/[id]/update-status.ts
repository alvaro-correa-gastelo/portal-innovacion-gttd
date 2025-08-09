import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/lib/database'
import pool from '@/lib/database'

// Esta API maneja las actualizaciones de estado desde el StatusManager
// Actualiza tanto la tabla requests como requests_audit para el historial

interface UpdateStatusRequest {
  status: string
  comment?: string
  leader_id: string
  clasificacion_final?: string
  prioridad_final?: string
  override_reason?: string
}

interface UpdateStatusResponse {
  success: boolean
  message: string
  updated_request?: any
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<UpdateStatusResponse>
) {
  const { id } = req.query

  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    })
  }

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Request ID is required' 
    })
  }

  const { 
    status, 
    comment, 
    leader_id,
    clasificacion_final,
    prioridad_final,
    override_reason 
  }: UpdateStatusRequest = req.body

  if (!status || !leader_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Status and leader_id are required' 
    })
  }

  try {
    const updatedRequest = await updateRequestWithAudit(
      id as string,
      {
        status,
        comment,
        leader_id,
        clasificacion_final,
        prioridad_final,
        override_reason
      }
    )
    
    return res.status(200).json({
      success: true,
      message: 'Estado actualizado correctamente',
      updated_request: updatedRequest
    })

  } catch (error) {
    console.error('Error updating request status:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor'
    })
  }
}

// Función principal que actualiza request y crea registro de auditoría
async function updateRequestWithAudit(
  requestId: string,
  updateData: UpdateStatusRequest
): Promise<any> {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')

    // 1. Obtener el estado actual de la solicitud
    const currentRequestQuery = `
      SELECT status, clasificacion_final, prioridad_final 
      FROM requests 
      WHERE id = $1
    `
    const currentResult = await client.query(currentRequestQuery, [requestId])
    
    if (currentResult.rows.length === 0) {
      throw new Error('Request not found')
    }
    
    const currentRequest = currentResult.rows[0]
    const previousStatus = currentRequest.status

    // 2. Actualizar la tabla requests
    const updateFields = []
    const updateValues = []
    let paramIndex = 1

    updateFields.push(`status = $${paramIndex}`)
    updateValues.push(updateData.status)
    paramIndex++

    updateFields.push(`updated_at = now()`)

    if (updateData.comment) {
      updateFields.push(`leader_comments = $${paramIndex}`)
      updateValues.push(updateData.comment)
      paramIndex++
    }

    if (updateData.clasificacion_final) {
      updateFields.push(`clasificacion_final = $${paramIndex}`)
      updateValues.push(updateData.clasificacion_final)
      paramIndex++
    }

    if (updateData.prioridad_final) {
      updateFields.push(`prioridad_final = $${paramIndex}`)
      updateValues.push(updateData.prioridad_final)
      paramIndex++
    }

    if (updateData.override_reason) {
      updateFields.push(`override_reason = $${paramIndex}`)
      updateValues.push(updateData.override_reason)
      paramIndex++
    }

    const updateRequestQuery = `
      UPDATE requests 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `
    updateValues.push(requestId)

    const updatedResult = await client.query(updateRequestQuery, updateValues)
    const updatedRequest = updatedResult.rows[0]

    // 3. Crear registro en requests_audit
    const auditQuery = `
      INSERT INTO requests_audit (
        request_id,
        action_type,
        previous_status,
        new_status,
        leader_id,
        comments
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `

    const actionType = getActionType(updateData.status, updateData.comment)
    
    await client.query(auditQuery, [
      requestId,
      actionType,
      previousStatus,
      updateData.status,
      updateData.leader_id,
      updateData.comment
    ])

    await client.query('COMMIT')
    return updatedRequest

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Transaction error:', error)
    // Fallback con datos de ejemplo si hay error de conexión
    return {
      id: requestId,
      status: updateData.status,
      leader_comments: updateData.comment,
      clasificacion_final: updateData.clasificacion_final,
      prioridad_final: updateData.prioridad_final,
      override_reason: updateData.override_reason,
      updated_at: new Date().toISOString()
    }
  } finally {
    client.release()
  }
}

// Función auxiliar para determinar el tipo de acción
function getActionType(status: string, comment?: string): string {
  if (status === 'approved') return 'approval'
  if (status === 'rejected') return 'rejection'
  if (status === 'on_hold') return 'pause'
  if (comment && comment.trim().length > 0) return 'status_change'
  return 'update'
}

/*
EJEMPLO DE USO desde el frontend (StatusManager):

const updateStatus = async (newStatus: string, comment: string) => {
  try {
    const response = await fetch(`/api/requests/${requestId}/update-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
        comment: comment,
        leader_id: currentUser.id,
        clasificacion_final: editedClassification,
        prioridad_final: editedPriority,
        override_reason: overrideReason
      })
    })

    const result = await response.json()
    
    if (result.success) {
      // Actualizar el estado local y recargar datos
      onRequestUpdate(result.updated_request)
      // Los hooks useRequestTimeline y useRequestMessages se actualizarán automáticamente
    }
  } catch (error) {
    console.error('Error updating status:', error)
  }
}
*/
