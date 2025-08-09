"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Send, 
  RefreshCw, 
  Loader2,
  Users,
  ShieldAlert,
  Clock
} from "lucide-react"

interface CollabMessage {
  id: number
  from: string
  role: 'lider_dominio' | 'lider_gerencial' | 'analista' | 'pm' | 'sistema'
  message: string
  timestamp: string
  avatar: string
}

interface InternalCollabChatProps {
  requestId: string | number
  currentUserName?: string
  currentUserRole?: 'lider_dominio' | 'lider_gerencial' | 'analista' | 'pm'
}

export function InternalCollabChat({
  requestId,
  currentUserName = 'Colaborador',
  currentUserRole = 'analista'
}: InternalCollabChatProps) {
  const [messages, setMessages] = useState<CollabMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  const scroll = () => endRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(scroll, [messages])

  const fetchMessages = async () => {
    if (!requestId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${requestId}/internal-chat`)
      if (!res.ok) throw new Error('no-endpoint')
      const data = await res.json()
      const transformed: CollabMessage[] = data.map((m: any, idx: number) => ({
        id: m.id || idx + 1,
        from: m.user_name || m.from || 'Colaborador',
        role: m.role || 'analista',
        message: m.message || '',
        timestamp: formatTimestamp(m.created_at || m.timestamp),
        avatar: getAvatar(m.user_name || m.from)
      }))
      setMessages(transformed)
      setIsPreview(false)
    } catch (e) {
      // Fallback preview (Mock - Próximo MVP)
      setIsPreview(true)
      setMessages([
        { id: 1, from: 'Líder de Dominio', role: 'lider_dominio', message: 'Abrí este hilo para coordinar estimaciones sin el solicitante.', timestamp: '1d', avatar: 'LD' },
        { id: 2, from: 'PM', role: 'pm', message: 'Puedo armar un estimado tentativo si definimos entregables.', timestamp: '22h', avatar: 'PM' },
        { id: 3, from: 'Líder Gerencial', role: 'lider_gerencial', message: 'Confirmen dependencias críticas para validarlo en steering.', timestamp: '20h', avatar: 'LG' }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    const i = setInterval(fetchMessages, 30000)
    return () => clearInterval(i)
  }, [requestId])

  const send = async () => {
    if (!newMessage.trim() || sending) return
    const temp: CollabMessage = {
      id: Date.now(),
      from: currentUserName,
      role: currentUserRole,
      message: newMessage.trim(),
      timestamp: 'Enviando...',
      avatar: getAvatar(currentUserName)
    }
    setMessages(prev => [...prev, temp])
    setNewMessage('')
    setSending(true)
    try {
      const res = await fetch(`/api/requests/${requestId}/internal-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: temp.message,
          user_name: currentUserName,
          role: currentUserRole
        })
      })
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === temp.id ? { ...m, timestamp: formatTimestamp(new Date().toISOString()) } : m))
      } else {
        setMessages(prev => prev.map(m => m.id === temp.id ? { ...m, timestamp: '❌ Error al enviar' } : m))
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== temp.id))
      alert('Error de conexión. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex flex-col h-[600px] overflow-hidden">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            Colaboración interna
          </div>
          <div className="flex items-center gap-2">
            {isPreview && (
              <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">Preview · Mock</span>
            )}
            {!loading && (
              <Button variant="ghost" size="sm" onClick={fetchMessages} className="h-8 w-8 p-0">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Coordina con otros líderes y PMs. Este hilo NO es visible para el solicitante.
        </p>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-3 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando conversación...</span>
            </div>
          ) : (
            <>
              {messages.length > 0 ? messages.map(m => (
                <div key={m.id} className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-purple-200 text-purple-800 text-xs">{m.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm text-purple-800 dark:text-purple-200">{m.from}</h4>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{m.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-sm text-purple-900 dark:text-purple-200 whitespace-pre-wrap">{m.message}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <ShieldAlert className="h-12 w-12 text-purple-300 dark:text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Sin mensajes internos aún</p>
                  <p className="text-xs text-gray-400">Usa este hilo para coordinar internamente sin el solicitante</p>
                </div>
              )}
              <div ref={endRef} />
            </>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder="Escribe una nota interna para el equipo..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={sending}
              />
            </div>
            <Button onClick={send} disabled={!newMessage.trim() || sending} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2" size="sm">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Este hilo es privado para líderes y PMs</span>
            {isPreview && <span className="italic">Preview (Mock) - Próximo MVP</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getAvatar(name: string) {
  if (!name) return 'U'
  const p = name.split(' ')
  return (p[0][0] + (p[1]?.[0] || '')).toUpperCase()
}

function formatTimestamp(dateString: string): string {
  if (!dateString) return 'Hace un momento'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const m = Math.floor(diff / (1000 * 60))
    const h = Math.floor(m / 60)
    const d = Math.floor(h / 24)
    if (m < 1) return 'Ahora'
    if (m < 60) return `${m}m`
    if (h < 24) return `${h}h`
    if (d < 7) return `${d}d`
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  } catch {
    return dateString
  }
}

