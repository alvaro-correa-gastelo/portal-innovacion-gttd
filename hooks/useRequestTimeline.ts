import { useState, useEffect } from 'react'

interface TimelineEvent {
  id: number
  status: string
  date: string
  description: string
  icon: string
  color: string
  bgColor: string
  completed: boolean
  comment?: string
  user?: string
}

interface UseRequestTimelineResult {
  timeline: TimelineEvent[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useRequestTimeline(requestId: number | string): UseRequestTimelineResult {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeline = async () => {
    if (!requestId) return

    setLoading(true)
    setError(null)

    try {
      // Llamar a la API para obtener el historial real de la solicitud
      const response = await fetch(`/api/requests/${requestId}/timeline`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const raw = await response.json()
      const data = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
      
      // Transformar los datos de la API al formato esperado
      const transformedTimeline: TimelineEvent[] = data.map((event: any, index: number) => {
        const actionType = event.action_type || event.status || 'unknown'
        
        return {
          id: event.id || index + 1,
          status: getStatusLabel(actionType),
          date: formatDate(event.created_at || event.fecha_cambio),
          description: event.comments || event.comment || getDefaultDescription(actionType),
          icon: getStatusIcon(actionType),
          color: getStatusColor(actionType),
          bgColor: getStatusBgColor(actionType),
          completed: true,
          comment: event.comments || event.comment,
          user: event.leader_id || event.user_name || event.changed_by
        }
      })

      setTimeline(transformedTimeline)
    } catch (err) {
      console.error('Error loading timeline:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      
      // Fallback a timeline básico en caso de error
      setTimeline(getBasicTimeline())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTimeline()
  }, [requestId])

  const refetch = () => {
    fetchTimeline()
  }

  return {
    timeline,
    loading,
    error,
    refetch
  }
}

// Funciones auxiliares para transformar datos
function getStatusLabel(status: string): string {
  const statusMap: { [key: string]: string } = {
    // Estados en español
    'pending_technical_analysis': 'Análisis Técnico Inicial',
    'pending_approval': 'Pendiente de Aprobación',
    'in_evaluation': 'En Evaluación',
    'on_hold': 'En Pausa',
    'approved': 'Solicitud Aprobada',
    'rejected': 'Solicitud Rechazada',
    
    // Acciones que aparecen en BD (en inglés) → español
    'update_classification': 'Solicitud Aprobada',
    'update': 'Solicitud Actualizada',
    'approve': 'Solicitud Aprobada',
    'reject': 'Solicitud Rechazada',
    'hold': 'Solicitud Pausada',
    'evaluate': 'En Evaluación',
    
    // Otros casos comunes
    'created': 'Solicitud Creada',
    'submitted': 'Solicitud Enviada',
    'assigned': 'Solicitud Asignada'
  }
  return statusMap[status] || 'Estado Actualizado'
}

function getStatusIcon(status: string): string {
  const iconMap: { [key: string]: string } = {
    'pending_approval': 'FileText',
    'in_evaluation': 'TrendingUp',
    'pending_technical_analysis': 'Zap',
    'approved': 'CheckCircle',
    'rejected': 'AlertCircle',
    'on_hold': 'Clock'
  }
  return iconMap[status] || 'Clock'
}

function getStatusColor(status: string): string {
  const colorMap: { [key: string]: string } = {
    'pending_approval': 'text-blue-600',
    'in_evaluation': 'text-orange-600',
    'pending_technical_analysis': 'text-purple-600',
    'approved': 'text-green-600',
    'rejected': 'text-red-600',
    'on_hold': 'text-gray-600'
  }
  return colorMap[status] || 'text-gray-600'
}

function getStatusBgColor(status: string): string {
  const bgColorMap: { [key: string]: string } = {
    'pending_approval': 'bg-blue-100',
    'in_evaluation': 'bg-orange-100',
    'pending_technical_analysis': 'bg-purple-100',
    'approved': 'bg-green-100',
    'rejected': 'bg-red-100',
    'on_hold': 'bg-gray-100'
  }
  return bgColorMap[status] || 'bg-gray-100'
}

function getDefaultDescription(status: string): string {
  const descriptionMap: { [key: string]: string } = {
    'pending_approval': 'Tu solicitud ha sido recibida y está siendo procesada',
    'in_evaluation': 'Un líder de dominio está evaluando tu solicitud',
    'pending_technical_analysis': 'Se está realizando el análisis técnico de viabilidad',
    'approved': '¡Felicitaciones! Tu solicitud fue aprobada',
    'rejected': 'Tu solicitud no fue aprobada en esta ocasión',
    'on_hold': 'Tu solicitud está temporalmente pausada'
  }
  return descriptionMap[status] || 'Estado actualizado'
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Fecha no disponible'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (err) {
    return dateString
  }
}

function getBasicTimeline(): TimelineEvent[] {
  return [
    {
      id: 1,
      status: "Solicitud Enviada",
      date: "Fecha no disponible",
      description: "Tu solicitud ha sido recibida",
      icon: "FileText",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      completed: true
    }
  ]
}
