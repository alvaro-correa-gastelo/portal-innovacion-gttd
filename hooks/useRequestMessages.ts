import { useState, useEffect } from 'react'

interface RequestMessage {
  id: number
  from: string
  message: string
  timestamp: string
  avatar: string
  type: 'status_change' | 'comment' | 'approval' | 'rejection'
  isFromLeader: boolean
}

interface UseRequestMessagesResult {
  messages: RequestMessage[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useRequestMessages(requestId: number | string): UseRequestMessagesResult {
  const [messages, setMessages] = useState<RequestMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    if (!requestId) return

    setLoading(true)
    setError(null)

    try {
      // Llamar a la API para obtener los mensajes/comentarios reales
      const response = await fetch(`/api/requests/${requestId}/messages`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transformar los datos de la API al formato esperado
      const transformedMessages: RequestMessage[] = data.map((msg: any, index: number) => ({
        id: msg.id || index + 1,
        from: msg.user_name || msg.from || 'Líder de Dominio',
        message: msg.comment || msg.message || '',
        timestamp: formatTimestamp(msg.created_at || msg.timestamp),
        avatar: getAvatarInitials(msg.user_name || msg.from),
        type: msg.type || determineMessageType(msg.action_type, msg.status, msg.comment),
        isFromLeader: msg.user_role === 'lider_dominio' || msg.isFromLeader || false
      }))

      // Filtrar mensajes vacíos y ordenar por fecha (más reciente primero)
      const filteredMessages = transformedMessages
        .filter(msg => msg.message && msg.message.trim().length > 0)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setMessages(filteredMessages)
    } catch (err) {
      console.error('Error loading messages:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      
      // Fallback a mensajes básicos en caso de error
      setMessages(getBasicMessages())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [requestId])

  const refetch = () => {
    fetchMessages()
  }

  return {
    messages,
    loading,
    error,
    refetch
  }
}

// Funciones auxiliares para transformar datos
function getAvatarInitials(name: string): string {
  if (!name) return 'LD'
  
  const words = name.split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function determineMessageType(actionType?: string, status?: string, comment?: string): RequestMessage['type'] {
  if (!actionType && !status && !comment) return 'comment'
  
  // Si hay actionType, usarlo para determinar el tipo
  if (actionType) {
    if (actionType === 'approval' || actionType === 'approve') return 'approval'
    if (actionType === 'rejection' || actionType === 'reject') return 'rejection'
    if (actionType === 'status_change') return 'status_change'
  }
  
  // Si no hay actionType, usar el status como fallback
  if (status === 'approved') return 'approval'
  if (status === 'rejected') return 'rejection'
  if (status) return 'status_change'
  
  return 'comment'
}

function formatTimestamp(dateString: string): string {
  if (!dateString) return 'Hace un momento'
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) {
      return 'Hace un momento'
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`
    } else {
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  } catch (err) {
    return dateString
  }
}

function getBasicMessages(): RequestMessage[] {
  return [
    {
      id: 1,
      from: "Líder de Dominio",
      message: "Hemos recibido tu solicitud y la estamos evaluando. Te mantendremos informado del progreso.",
      timestamp: "Hace 2 días",
      avatar: "LD",
      type: "comment",
      isFromLeader: true
    }
  ]
}
