"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Send, CheckCircle, Edit3, Star, Bot, User, Sparkles, MessageCircle, FileText } from "lucide-react"

export function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [showSummary, setShowSummary] = useState(false)
  const [rating, setRating] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [webhookUrl, setWebhookUrl] = useState("https://n8n.automacore.shop/webhook-test/insightbot-test/chat") // Webhook Automacore para pruebas
  const [showConfig, setShowConfig] = useState(false)
  const [userToken, setUserToken] = useState<string>("")
  const [userInfo, setUserInfo] = useState<any>(null)

  // Obtener información del usuario autenticado
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('current_user')

    if (token && user) {
      setUserToken(token)
      setUserInfo(JSON.parse(user))
    }
  }, [])

  const platformOptions = [
    { id: "canvas", label: "Canvas", description: "Sistema de gestión académica" },
    { id: "peoplesoft", label: "PeopleSoft", description: "Sistema de recursos humanos" },
    { id: "oracle", label: "Oracle", description: "Base de datos empresarial" },
    { id: "otros", label: "Otros", description: "Otra plataforma" },
  ]

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue
    if (!text.trim() || isLoading) return

    const newMessage = {
      id: Date.now(),
      type: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
    setIsLoading(true)

    // Agregar mensaje de "escribiendo..."
    const typingMessage = {
      id: Date.now() + 1,
      type: "bot",
      content: "⏳ Procesando tu solicitud...",
      timestamp: new Date(),
      isTyping: true
    }
    setMessages((prev) => [...prev, typingMessage])

    try {
      // Llamar al webhook de n8n
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          user: {
            auth_token: userToken || "demo_token_user_001",
            user_id: userInfo?.user_id || "user_001"
          },
          context: {
            timestamp: new Date().toISOString(),
            source: 'portal_vercel',
            frontend_url: window.location.href,
            user_name: userInfo?.name || "Usuario",
            user_area: userInfo?.area || "GTTD"
          }
        })
      })

      // Remover mensaje de "escribiendo..."
      setMessages((prev) => prev.filter(msg => !msg.isTyping))

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('📥 Respuesta de n8n:', result)

      // Procesar la respuesta del webhook
      displayBotResponse(result)

    } catch (error) {
      console.error('❌ Error:', error)

      // Remover mensaje de "escribiendo..."
      setMessages((prev) => prev.filter(msg => !msg.isTyping))

      // Mostrar error al usuario de manera amigable
      const errorMessage = {
        id: Date.now() + 2,
        type: "bot",
        content: `Lo siento, tuve un problema técnico al procesar tu mensaje. 😔\n\nPor favor, intenta nuevamente en unos momentos. Si el problema persiste, puedes contactar al equipo de soporte técnico.\n\n**Detalles técnicos:** ${error.message}`,
        timestamp: new Date(),
        isError: true
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Función para procesar la respuesta del webhook
  const displayBotResponse = (result: any) => {
    if (Array.isArray(result) && result.length > 0) {
      const agentResponse = result[0]

      // Actualizar session ID si viene en la respuesta
      if (agentResponse.session?.session_id) {
        setSessionId(agentResponse.session.session_id)
      }

      // Mensaje principal del agente
      const botMessage = {
        id: Date.now() + 3,
        type: "bot",
        content: agentResponse.message || "Respuesta procesada correctamente",
        timestamp: new Date(),
        agentData: agentResponse
      }
      setMessages((prev) => [...prev, botMessage])

      // Mostrar información de progreso si está disponible
      if (agentResponse.ui?.progress) {
        const progressMessage = {
          id: Date.now() + 4,
          type: "progress",
          content: agentResponse.ui.progress,
          timestamp: new Date()
        }
        setMessages((prev) => [...prev, progressMessage])
      }

      // Mostrar opciones de interacción si están disponibles
      if (agentResponse.ui?.interaction?.next_questions?.length > 0) {
        setTimeout(() => {
          setShowOptions(true)
          const optionsMessage = {
            id: Date.now() + 5,
            type: "options",
            content: "agent-questions",
            timestamp: new Date(),
            questions: agentResponse.ui.interaction.next_questions
          }
          setMessages((prev) => [...prev, optionsMessage])
        }, 1000)
      }

      // Mostrar resumen si la completitud es alta
      if (agentResponse.session?.completeness >= 75) {
        setTimeout(() => setShowSummary(true), 2000)
      }

    } else if (result.action === 'route') {
      // Formato de respuesta del Session Manager
      const sessionInfo = `✅ Solicitud procesada correctamente

📊 Información de Sesión:
🆔 ID: ${result.session_data?.session_id || 'N/A'}
🎯 Siguiente Agente: ${result.next_agent}
💭 Razón: ${result.reasoning}`

      const botMessage = {
        id: Date.now() + 3,
        type: "bot",
        content: sessionInfo,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, botMessage])

      // Mensaje contextual según el agente
      const agentMessages = {
        'discovery_agent': '🔍 Iniciando proceso de descubrimiento... Te haré algunas preguntas para entender mejor tu necesidad.',
        'summary_agent': '📋 Generando resumen... Tengo suficiente información para crear un resumen de tu solicitud.',
        'report_sender': '📧 Enviando reporte... Tu solicitud está siendo procesada y enviada a los responsables.'
      }

      const contextMessage = agentMessages[result.next_agent] || '⚙️ Procesando con el agente correspondiente...'
      const contextBotMessage = {
        id: Date.now() + 4,
        type: "bot",
        content: contextMessage,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, contextBotMessage])

    } else if (result.error) {
      const errorMessage = {
        id: Date.now() + 3,
        type: "bot",
        content: `❌ Error: ${result.message}`,
        timestamp: new Date(),
        isError: true
      }
      setMessages((prev) => [...prev, errorMessage])
    } else {
      // Respuesta genérica
      const genericMessage = {
        id: Date.now() + 3,
        type: "bot",
        content: `📄 Respuesta recibida: ${JSON.stringify(result, null, 2)}`,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, genericMessage])
    }
  }

  // Función para agregar mensaje de bienvenida inicial
  const addWelcomeMessage = () => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        type: "bot",
        content: userInfo
          ? `¡Hola ${userInfo.name}! 😊 Soy tu asistente de innovación tecnológica. Estoy aquí para ayudarte a estructurar tu solicitud de la mejor manera posible.\n\n¿En qué proyecto o necesidad tecnológica puedo ayudarte hoy?`
          : `¡Hola! 😊 Soy tu asistente de innovación tecnológica. Estoy aquí para ayudarte a crear una solicitud clara y completa.\n\n¿Cuéntame sobre tu proyecto o necesidad tecnológica?`,
        timestamp: new Date(),
        isWelcome: true
      }
      setMessages([welcomeMessage])
    }
  }

  // Agregar mensaje de bienvenida cuando se carga el componente
  useEffect(() => {
    if (userInfo && messages.length === 0) {
      addWelcomeMessage()
    }
  }, [userInfo])



  const handleOptionSelect = (option: any) => {
    const optionMessage = {
      id: Date.now(),
      type: "user",
      content: `He seleccionado: ${option.label} - ${option.description}`,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, optionMessage])
    setShowOptions(false)

    // Bot response to selection
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: `Perfecto! ${option.label} es una excelente elección. Ahora que conozco la plataforma principal, ¿podrías contarme más sobre los problemas específicos que estás experimentando con ${option.label}?`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-3xl">
        <div className="w-20 h-20 bg-utp-blue/20 dark:bg-utp-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-10 h-10 text-utp-blue dark:text-utp-red" />
        </div>

        {userInfo ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              ¡Hola, {userInfo.name}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Estoy aquí para ayudarte a crear tu solicitud de innovación tecnológica.
              Cuéntame sobre tu proyecto o necesidad y juntos la estructuraremos de la mejor manera.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Portal de Innovación UTP
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Bienvenido al asistente inteligente para solicitudes de innovación.
              Describe tu proyecto y te ayudaré a estructurar tu solicitud.
            </p>
          </>
        )}

        {/* Consejos mejorados */}
        <div className="text-left space-y-3 text-sm text-gray-600 dark:text-gray-400 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-blue-100 dark:border-gray-600">
          <div className="flex items-center mb-3">
            <Sparkles className="w-5 h-5 text-utp-blue dark:text-utp-red mr-2" />
            <p className="font-medium text-gray-900 dark:text-gray-100">Consejos para una solicitud exitosa:</p>
          </div>
          <div className="space-y-2 ml-7">
            <p>• <strong>Contexto:</strong> Explica la situación actual y el problema a resolver</p>
            <p>• <strong>Objetivo:</strong> Define claramente qué quieres lograr</p>
            <p>• <strong>Impacto:</strong> Menciona cómo beneficiará a tu área o la universidad</p>
            <p>• <strong>Detalles técnicos:</strong> Incluye sistemas involucrados o preferencias tecnológicas</p>
            <p>• <strong>Urgencia:</strong> Indica si hay fechas límite o prioridades especiales</p>
          </div>
        </div>

        {/* Botón para iniciar conversación */}
        <div className="mt-8">
          <Button
            onClick={addWelcomeMessage}
            className="bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark text-white px-8 py-3 text-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Iniciar Nueva Solicitud
          </Button>
        </div>
      </div>
    </div>
  )

  // RF-S02: Componente de Tarjeta de Resumen Interactivo
  const InteractiveSummaryCard = () => (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-4 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          Resumen de tu Solicitud
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🎯 Problema</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Falta de control y seguimiento eficiente de los activos tecnológicos del departamento de TI.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🚀 Objetivo</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Implementar un sistema de gestión de inventarios con seguimiento en tiempo real y alertas automáticas.
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">📈 Impacto</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Reducir pérdidas por 40%, mejorar eficiencia operativa y optimizar asignación de recursos.
            </p>
          </div>
        </div>

        <Separator className="bg-gray-200 dark:bg-gray-700" />

        <div className="flex space-x-3">
          <Button className="flex-1 bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark text-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            ✔️ Validar y Enviar
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            ✏️ Aclarar un Punto
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // RF-S03: Componente Selector de Opciones
  const PlatformSelector = () => (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-4 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
          ¿Qué plataforma principal se ve afectada?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {platformOptions.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="h-auto p-4 text-left border-gray-200 dark:border-gray-700 hover:bg-utp-blue/10 hover:border-utp-blue dark:hover:bg-utp-red/10 dark:hover:border-utp-red bg-transparent"
              onClick={() => handleOptionSelect(option)}
            >
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  // RF-S04: Componente Vista Previa de Documentos
  const DocumentPreview = ({ fileName, fileSize }: { fileName: string; fileSize: string }) => (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-4 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-utp-blue/10 dark:bg-utp-red/10 rounded-lg">
            <FileText className="w-6 h-6 text-utp-blue dark:text-utp-red" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">{fileName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{fileSize} • Subido correctamente</p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
      </CardContent>
    </Card>
  )

  // Componente de Preguntas Guía (NO clickeables)
  const QuestionGuide = ({ questions }: { questions: string[] }) => (
    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-4 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center">
          <MessageCircle className="w-4 h-4 mr-2" />
          Para ayudarte mejor, puedes contarme sobre:
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {questions.map((question, index) => (
            <div
              key={index}
              className="flex items-start space-x-2 text-sm text-blue-700 dark:text-blue-300"
            >
              <span className="text-blue-500 dark:text-blue-400 mt-0.5">•</span>
              <span>{question}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 italic">
          💬 Escribe tu respuesta en el chat de abajo
        </div>
      </CardContent>
    </Card>
  )

  // Componente de Progreso del Agente
  const ProgressDisplay = ({ progress }: { progress: any }) => (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Progreso de Análisis</h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">{progress.percentage}%</span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progress.color === 'danger' ? 'bg-red-500' :
                progress.color === 'warning' ? 'bg-yellow-500' :
                progress.color === 'success' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {progress.status_message && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{progress.status_message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )

  // RF-S05: Componente Encuesta de Satisfacción
  const SatisfactionSurvey = () => (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">¿Cómo calificarías tu experiencia?</h4>
        <div className="flex space-x-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setRating(star)} className="transition-colors">
              <Star
                className={`w-6 h-6 ${
                  star <= rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600 hover:text-yellow-300"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tu feedback nos ayuda a mejorar el Portal de Innovación
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === "options" && message.content === "platform-selector" ? (
                <PlatformSelector />
              ) : message.type === "options" && message.content === "agent-questions" ? (
                <QuestionGuide questions={message.questions || []} />
              ) : message.type === "progress" ? (
                <ProgressDisplay progress={message.content} />
              ) : (
                <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "user"
                          ? "bg-utp-blue dark:bg-utp-red ml-3"
                          : message.isError
                          ? "bg-red-100 dark:bg-red-900 mr-3"
                          : "bg-gray-100 dark:bg-gray-800 mr-3"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className={`w-4 h-4 ${message.isError ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`} />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-4 ${
                        message.type === "user"
                          ? "bg-utp-blue dark:bg-utp-red text-white"
                          : message.isError
                          ? "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showSummary && (
            <div className="space-y-4">
              <InteractiveSummaryCard />
              <SatisfactionSurvey />
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex space-x-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={userInfo
              ? `Hola ${userInfo.name}, cuéntame sobre tu proyecto o necesidad...`
              : "Describe tu proyecto o necesidad tecnológica..."
            }
            className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-utp-blue dark:focus:border-utp-red"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={() => handleSendMessage()}
            className="bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark text-white"
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Presiona Enter para enviar • {userInfo ? `Conectado como ${userInfo.name} (${userInfo.area})` : 'Sistema de asistencia inteligente activo'}
        </p>
      </div>
    </div>
  )
}
