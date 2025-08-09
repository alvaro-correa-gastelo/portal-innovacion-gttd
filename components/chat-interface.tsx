"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle, Edit3, Bot, User, Sparkles, MessageCircle, FileText } from "lucide-react"
import { SummaryValidationCard } from './summary-validation-card';
import { UTPLogo } from '@/components/ui/utp-logo';

// --- Componentes Auxiliares ---

// Tipos estrictos para payload de webhook
type ChatEventType = 'SUMMARY_CONFIRMED' | 'N8N_VALIDATION'

type WebhookEvent = {
  type: ChatEventType
}

type WebhookPayload = {
  message?: string
  event?: WebhookEvent
}

const TypingAnimation = () => (
  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
    <span className="text-sm">Pensando</span>
    <div className="flex gap-1">
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  </div>
)

const useStreamingText = (text: string, speed: number = 20) => {
  const [displayedText, setDisplayedText] = useState("")
  useEffect(() => {
    setDisplayedText("")
    if (text) {
      let i = 0
      const timer = setInterval(() => {
        if (i < text.length) {
          i++
          setDisplayedText(text.substring(0, i))
        } else {
          clearInterval(timer)
        }
      }, speed)
      return () => clearInterval(timer)
    }
  }, [text, speed])
  return displayedText
}

const StreamingMessage = ({ content }: { content: string }) => {
  const displayedText = useStreamingText(content)
  return <p className="text-sm whitespace-pre-line leading-relaxed">{displayedText}</p>
}

const RichSummaryCard = ({ summary, onConfirm, onCorrect }: { summary: any, onConfirm?: () => void, onCorrect?: () => void }) => {
  // Normalización defensiva por si el backend envía strings o undefined
  const plataformas =
    Array.isArray(summary?.plataformas_involucradas)
      ? summary.plataformas_involucradas
      : typeof summary?.plataformas_involucradas === "string"
        ? summary.plataformas_involucradas.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

  const urgencia = summary?.urgencia ?? "—";
  const clasificacion = summary?.clasificacion_sugerida ?? "—";
  const score = typeof summary?.score_estimado === "number" ? summary.score_estimado : "—";

  return (
    <Card className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800 shadow-lg w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
          <FileText className="w-5 h-5 mr-2" />
          Resumen de tu Solicitud
        </CardTitle>
        <CardDescription>{summary?.titulo_solicitud ?? "Resumen generado"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Resumen Ejecutivo</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
            {summary?.resumen_ejecutivo ?? "Sin contenido"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p><strong>Problema:</strong> {summary?.problema_principal ?? "—"}</p>
            <p><strong>Objetivo:</strong> {summary?.objetivo_esperado ?? "—"}</p>
            <p><strong>Beneficiarios:</strong> {summary?.beneficiarios ?? "—"}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <strong className="pt-0.5">Plataformas:</strong>
              <span>{plataformas.length ? plataformas.join(", ") : "—"}</span>
            </div>
            <div className="flex items-start gap-2">
              <strong className="pt-0.5">Urgencia:</strong>
              <Badge>{urgencia}</Badge>
            </div>
            <div className="flex items-start gap-2">
              <strong className="pt-0.5">Clasificación:</strong>
              <Badge variant="secondary">{clasificacion} ({score} pts)</Badge>
            </div>
          </div>
        </div>
        <Separator />
        <div className="flex space-x-2">
          <Button 
            className="flex-1 bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark text-white"
            onClick={onConfirm}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Validar y Enviar
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onCorrect}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Aclarar un Punto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Componente Principal de la Interfaz de Chat ---
export function ChatInterface({ onRequestCreated }: { onRequestCreated?: (id: string) => void }) {
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const SESSION_STORAGE_KEY = 'insight_session_id'
  const router = useRouter()

  const handleConfirmSummary = () => {
    const payload = {
      message: "El usuario ha confirmado el resumen de la solicitud.",
      event: { type: "SUMMARY_CONFIRMED" as ChatEventType }
    };
    handleSendMessage(undefined, payload);
  };

  const handleCorrectSummary = () => {
    handleSendMessage("Necesito corregir algo del resumen.");
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('current_user')

    if (token && user) {
      setUserToken(token)
      setUserInfo(JSON.parse(user))
    } else {
      // Sin datos de autenticación: no usar mocks en producción
      // Dejamos userInfo y userToken en null para no mostrar nombres de prueba
      console.info("Auth no encontrada; continuando en modo invitado.")
    }
    setIsReady(true); // El chat siempre está listo (con datos reales o de prueba)
  }, [])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages, isLoading])

  // Restaurar session_id desde localStorage al montar
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem(SESSION_STORAGE_KEY) : null
      if (saved) {
        setSessionId(saved)
      }
    } catch {
      // ignore storage errors
    } finally {
      setIsReady(true)
    }
  }, [])

  const handleSendMessage = async (messageText?: string, eventPayload?: WebhookPayload) => {
    const text = messageText || inputValue;
    const payload: WebhookPayload = eventPayload || { message: text };

    if (!text.trim() && !eventPayload || isLoading || !isReady) return;

    // CORRECCIÓN: Generar un session_id si no existe y persistirlo
    const currentSessionId = sessionId || crypto.randomUUID();
    if (!sessionId) {
      setSessionId(currentSessionId);
      try { if (typeof window !== 'undefined') window.localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId) } catch {}
    }

    const userMessageContent = messageText || (eventPayload ? eventPayload.message : inputValue);
    const newMessage = { id: Date.now(), type: "user", content: userMessageContent, isEvent: !!eventPayload };
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Siempre llamamos al proxy del backend para evitar CORS en Vercel
      const WEBHOOK_URL = "/api/n8n/chat"
      const normalizedEventType: ChatEventType = (payload?.event?.type as ChatEventType) || 'N8N_VALIDATION'
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Insight-Event-Type': normalizedEventType, 'X-Insight-Source': 'applicant_portal' },
        body: JSON.stringify({
          ...payload,
          session_id: currentSessionId,
          // Normalizamos un event por defecto para ruteo en n8n
          event: payload?.event ?? { type: normalizedEventType },
          event_type: normalizedEventType,
          source: 'applicant_portal',
          debug: { sent_at: new Date().toISOString(), event_in_body: normalizedEventType },
          user: {
            auth_token: userToken || undefined,
            user_id: userInfo?.user_id || undefined
          }
        })
      })

      if (!response.ok) throw new Error(`Error HTTP ${response.status}`)

      // Parseo robusto del response (n8n puede responder texto o vacío)
      let result: any = null
      const ct = response.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        try { result = await response.json() } catch { result = null }
      } else {
        try { const text = await response.text(); result = text ? { response_type: 'text', text } : null } catch { result = null }
      }
      if (!result) {
        // Si no hay cuerpo, mostramos un mensaje amigable y salimos
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: 'Estoy procesando tu solicitud. Te avisaré cuando tenga una respuesta.', isError: false }])
        return
      }
      
      if (result.session_id) {
        setSessionId(result.session_id)
        try { if (typeof window !== 'undefined') window.localStorage.setItem(SESSION_STORAGE_KEY, result.session_id) } catch {}
      }

      // Si n8n devolvió un request_id, redirigir a Mis Solicitudes (sidebar) y abrir el modal automáticamente
      const newRequestId = result.request_id || result.id || result?.data?.request_id || result?.data?.id
      if (newRequestId) {
        try {
          if (onRequestCreated) {
            onRequestCreated(newRequestId)
          } else {
            router.push(`/mis-solicitudes?open_request=${encodeURIComponent(newRequestId)}`)
          }
          return
        } catch {}
      }

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: result.text,
        component: result.response_type === 'validation_summary' 
          ? <SummaryValidationCard 
              summary={result.summary} 
              onConfirm={handleConfirmSummary}
              onCorrect={handleCorrectSummary}
            /> 
          : result.response_type === 'rich_summary' 
          ? <RichSummaryCard summary={result.summary} onConfirm={handleConfirmSummary} onCorrect={handleCorrectSummary} /> 
          : null,
        isStreaming: result.response_type === 'text',
      }
      setMessages(prev => [...prev, botMessage])

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: `Lo siento, ocurrió un error. ${error instanceof Error ? error.message : ''}`,
        isError: true,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startConversation = () => {
    // Iniciar una nueva conversación implica nuevo session_id
    try { if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_STORAGE_KEY) } catch {}
    const newId = crypto.randomUUID()
    setSessionId(newId)
    try { if (typeof window !== 'undefined') window.localStorage.setItem(SESSION_STORAGE_KEY, newId) } catch {}
    const welcomeMessage = {
      id: Date.now(),
      type: "bot",
      content: `¡Hola ${userInfo?.name || ''}! 😊 Soy InsightBot, tu asistente de innovación. Estoy aquí para ayudarte a dar forma a tus ideas tecnológicas. ¿Qué te gustaría crear o mejorar?`,
    }
    setMessages([welcomeMessage])
  }

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-4xl">
        <div className="w-24 h-24 bg-utp-blue/20 dark:bg-utp-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-12 h-12 text-utp-blue dark:text-utp-red" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          ¡Hola, {userInfo?.name || 'invitado'}! 👋
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Bienvenido a tu espacio de innovación. Estoy aquí para acompañarte en la creación de tu solicitud de proyecto tecnológico.
        </p>
        
        {/* Consejos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 mt-1 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Comparte tus ideas</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Cuéntame sobre el problema que necesitas resolver y cualquier idea que tengas en mente.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 mt-1 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Agrega detalles útiles</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Cualquier información adicional sobre tu situación me ayudará a entenderte mejor.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ejemplos de inicio de conversación */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">O puedes empezar con algo como:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <button 
              onClick={() => handleSendMessage("Tengo una idea para mejorar un proceso en mi área de trabajo")}
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-left transition-colors"
            >
              "Tengo una idea para mejorar un proceso..."
            </button>
            <button 
              onClick={() => handleSendMessage("Necesito ayuda con algo que toma mucho tiempo hacer manualmente")}
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-left transition-colors"
            >
              "Algo me está tomando mucho tiempo..."
            </button>
            <button 
              onClick={() => handleSendMessage("Me gustaría crear una herramienta que nos ayude en el día a día")}
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-left transition-colors"
            >
              "Quiero crear una herramienta útil..."
            </button>
          </div>
        </div>
        
        <Button
          onClick={startConversation}
          className="bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark text-white px-8 py-3 text-lg"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Iniciar Nueva Solicitud
        </Button>
      </div>
    </div>
  )

  if (!isReady) {
    return <div className="flex h-full items-center justify-center"><p>Inicializando chat...</p></div>
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {messages.length === 0 ? <EmptyState /> : (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(message => (
            !message.isEvent && // No renderizar mensajes de eventos
            <div key={message.id} className={`flex items-end gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.type === 'bot' && <Bot className="w-6 h-6 text-gray-400 flex-shrink-0" />}
              <div className={`rounded-lg p-4 max-w-[80%] shadow-sm ${
                message.type === 'user'
                  ? 'bg-utp-blue dark:bg-utp-red text-white'
                  : message.isError
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
              }`}>
                {message.component ? message.component : 
                 message.isStreaming && message.content ? <StreamingMessage content={message.content} /> :
                 <p className="text-sm whitespace-pre-line">{message.content}</p>
                }
              </div>
              {message.type === 'user' && <User className="w-6 h-6 text-gray-400 flex-shrink-0" />}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-3 justify-start">
              <Bot className="w-6 h-6 text-gray-400 flex-shrink-0" />
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <TypingAnimation />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      )}
      {messages.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex space-x-3">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1"
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={() => handleSendMessage()} disabled={!inputValue.trim() || isLoading}>
              {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
