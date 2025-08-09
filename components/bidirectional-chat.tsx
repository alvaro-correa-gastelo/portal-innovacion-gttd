"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  Loader2,
  User,
  Crown,
  Clock
} from "lucide-react"

interface ChatMessage {
  id: number
  from: string
  message: string
  timestamp: string
  avatar: string
  isFromLeader: boolean
  isFromUser?: boolean
  type?: 'message' | 'status_update' | 'approval' | 'rejection'
}

interface BidirectionalChatProps {
  requestId: string | number
  currentUserRole?: 'user' | 'leader'
  currentUserName?: string
  currentUserEmail?: string
}

export function BidirectionalChat({ 
  requestId, 
  currentUserRole = 'user',
  currentUserName = 'Usuario',
  currentUserEmail = 'usuario@utp.edu.pe'
}: BidirectionalChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!requestId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/requests/${requestId}/chat`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transformar los datos de la API al formato esperado
      const transformedMessages: ChatMessage[] = data.map((msg: any, index: number) => ({
        id: msg.id || index + 1,
        from: msg.user_name || msg.from || (msg.isFromLeader ? 'Líder de Dominio' : 'Solicitante'),
        message: msg.message || msg.comment || '',
        timestamp: formatTimestamp(msg.created_at || msg.timestamp),
        avatar: getAvatarInitials(msg.user_name || msg.from),
        isFromLeader: msg.user_role === 'leader' || msg.isFromLeader || false,
        isFromUser: msg.user_role === 'user' || msg.isFromUser || false,
        type: msg.type || 'message'
      }))

      // Ordenar mensajes por fecha (más antiguo primero para el chat)
      const sortedMessages = transformedMessages
        .filter(msg => msg.message && msg.message.trim().length > 0)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      setMessages(sortedMessages)
    } catch (err) {
      console.error('Error loading chat:', err)
      // Fallback con mensaje informativo
      setMessages([
        {
          id: 1,
          from: "Sistema",
          message: "Error al cargar el historial de mensajes. Los mensajes nuevos aparecerán aquí una vez que se conecte correctamente.",
          timestamp: "Hace un momento",
          avatar: "S",
          isFromLeader: false,
          type: 'message'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    
    // Actualizar mensajes cada 30 segundos
    const interval = setInterval(fetchMessages, 30000)
    return () => clearInterval(interval)
  }, [requestId])

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    const messageText = newMessage.trim()
    const tempId = Date.now() // ID temporal para el mensaje local
    
    // Agregar mensaje localmente primero para mejor UX
    const localMessage: ChatMessage = {
      id: tempId,
      from: currentUserName,
      message: messageText,
      timestamp: 'Enviando...',
      avatar: getAvatarInitials(currentUserName),
      isFromLeader: currentUserRole === 'leader',
      isFromUser: currentUserRole === 'user',
      type: 'message'
    }
    
    // Agregar mensaje local inmediatamente
    setMessages(prev => [...prev, localMessage])
    setNewMessage('') // Limpiar campo inmediatamente
    
    setSending(true)
    try {
      const response = await fetch(`/api/requests/${requestId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          user_name: currentUserName,
          user_email: currentUserEmail,
          user_role: currentUserRole === 'leader' ? 'leader' : 'user',
          type: 'message'
        })
      })

      if (response.ok) {
        // Actualizar con timestamp real, pero sin resetear toda la conversación
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { ...msg, timestamp: formatTimestamp(new Date().toISOString()) }
              : msg
          )
        )
        
        // Scroll hacia abajo suavemente
        setTimeout(scrollToBottom, 50)
        
        // NO actualizar automáticamente para evitar que desaparezcan los mensajes
      } else {
        // En lugar de remover el mensaje, marcarlo como fallido
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? { ...msg, timestamp: '❌ Error al enviar' }
              : msg
          )
        )
        
        const error = await response.json()
        console.warn('Error al enviar mensaje:', error.message || 'Error desconocido')
        // No mostrar alert, solo marcar el mensaje como fallido
      }
    } catch (error) {
      // Remover mensaje local si hubo error de conexión
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      
      console.error('Error sending message:', error)
      alert('Error de conexión. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getMessageColors = (isFromLeader: boolean, isFromUser: boolean, type: string) => {
    if (type === 'status_update') {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/50',
        border: 'border-yellow-200 dark:border-yellow-800',
        avatarBg: 'bg-yellow-200 text-yellow-800',
        nameColor: 'text-yellow-800 dark:text-yellow-200',
        messageColor: 'text-yellow-700 dark:text-yellow-300'
      }
    }
    
    if (isFromLeader) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/50',
        border: 'border-blue-200 dark:border-blue-800',
        avatarBg: 'bg-blue-200 text-blue-800',
        nameColor: 'text-blue-800 dark:text-blue-200',
        messageColor: 'text-blue-700 dark:text-blue-300'
      }
    } else if (isFromUser) {
      return {
        bg: 'bg-green-50 dark:bg-green-950/50',
        border: 'border-green-200 dark:border-green-800',
        avatarBg: 'bg-green-200 text-green-800',
        nameColor: 'text-green-800 dark:text-green-200',
        messageColor: 'text-green-700 dark:text-green-300'
      }
    }
    
    // Default (sistema u otros)
    return {
      bg: 'bg-gray-50 dark:bg-gray-950/50',
      border: 'border-gray-200 dark:border-gray-800',
      avatarBg: 'bg-gray-200 text-gray-800',
      nameColor: 'text-gray-800 dark:text-gray-200',
      messageColor: 'text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex flex-col h-[600px] overflow-hidden">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Chat - Comunicación Directa
          </div>
          {!loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchMessages}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Comunícate directamente con {currentUserRole === 'leader' ? 'el solicitante' : 'el líder de dominio'}
        </p>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando conversación...</span>
            </div>
          ) : (
            <>
              {messages.length > 0 ? messages.map((message) => {
                const colors = getMessageColors(message.isFromLeader, message.isFromUser, message.type || 'message')
                
                return (
                  <div key={message.id} className={`flex items-start space-x-3 p-3 ${colors.bg} rounded-lg border ${colors.border}`}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={`${colors.avatarBg} text-xs`}>
                        {message.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium text-sm ${colors.nameColor}`}>
                          {message.from}
                          {message.isFromLeader && (
                            <Crown className="h-3 w-3 inline ml-1" />
                          )}
                          {message.isFromUser && (
                            <User className="h-3 w-3 inline ml-1" />
                          )}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm ${colors.messageColor} whitespace-pre-wrap`}>
                        {message.message}
                      </p>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    No hay mensajes aún
                  </p>
                  <p className="text-xs text-gray-400">
                    Inicia la conversación escribiendo un mensaje abajo
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Área de envío de mensajes */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder={`Escribe tu mensaje como ${currentUserRole === 'leader' ? 'líder' : 'solicitante'}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[80px] resize-none"
                disabled={sending}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
              size="sm"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Enviar
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
            <span>Como: {currentUserName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Funciones auxiliares
function getAvatarInitials(name: string): string {
  if (!name) return 'U'
  
  const words = name.split(' ')
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
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
      return 'Ahora'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m`
    } else if (diffInHours < 24) {
      return `${diffInHours}h`
    } else if (diffInDays < 7) {
      return `${diffInDays}d`
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      })
    }
  } catch (err) {
    return dateString
  }
}
