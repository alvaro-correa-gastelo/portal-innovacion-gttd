"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Brain,
  Calendar,
  MessageCircle,
  Send,
  MapPin,
  Rocket,
} from "lucide-react"
import { useState, useEffect } from "react"
import React from "react"

interface TrackingPanelProps {
  isOpen: boolean
  onClose: () => void
  request: any
}

export function TrackingPanel({ isOpen, onClose, request }: TrackingPanelProps) {
  const [newMessage, setNewMessage] = useState("")
  // Siempre usar el defaultTab si se proporciona, sino timeline por defecto
  const [activeTab, setActiveTab] = useState("timeline")
  
  // Efecto para cambiar la pestaña basado en el defaultTab del request
  React.useEffect(() => {
    if (request?.defaultTab) {
      setActiveTab(request.defaultTab)
    } else {
      setActiveTab("timeline")
    }
  }, [request?.defaultTab])
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Leslie Hidalgo",
      senderRole: "Líder GTTD - Dominio Tecnológico",
      message:
        "Hola! He revisado tu solicitud del Sistema de Gestión de Inventarios. Me parece muy interesante la propuesta. ¿Podrías proporcionarme más detalles sobre el volumen de transacciones que esperas manejar diariamente?",
      timestamp: "26/07/2025 - 02:30 PM",
      isFromLeader: true,
    },
    {
      id: 2,
      sender: "Tú",
      senderRole: "Solicitante",
      message:
        "¡Hola Leslie! Gracias por revisar mi solicitud. Estimamos manejar aproximadamente 500-800 transacciones diarias en el primer año, con un crecimiento proyectado del 25% anual. También necesitamos integración con nuestro sistema ERP actual.",
      timestamp: "26/07/2025 - 04:15 PM",
      isFromLeader: false,
    },
    {
      id: 3,
      sender: "Leslie Hidalgo",
      senderRole: "Líder GTTD - Dominio Tecnológico",
      message:
        "Perfecto, esa información es muy útil. Con ese volumen de transacciones, definitivamente necesitaremos una arquitectura robusta. He aprobado tu solicitud y la he movido a la fase de planificación. El equipo técnico se pondrá en contacto contigo en los próximos 2-3 días para definir los detalles de implementación.",
      timestamp: "28/07/2025 - 04:55 PM",
      isFromLeader: true,
    },
    {
      id: 4,
      sender: "Leslie Hidalgo",
      senderRole: "Líder GTTD - Dominio Tecnológico",
      message:
        "¡Excelentes noticias! El Agente 2 ha completado el análisis de planificación predictiva de tu proyecto. El informe está disponible en la sección de documentos. Según el análisis, el proyecto tiene una estimación realista de 14-16 semanas con un equipo de 5-6 personas. ¡Muy emocionante!",
      timestamp: "29/07/2025 - 11:45 AM",
      isFromLeader: true,
    },
  ])

  if (!isOpen) return null

  const timelineEvents = [
    {
      id: 1,
      icon: CheckCircle,
      title: "Solicitud enviada y recibida por InsightBot",
      date: "25/07/2025",
      time: "09:15 AM",
      status: "completed",
      description: "Tu solicitud ha sido procesada exitosamente por el sistema inteligente.",
    },
    {
      id: 2,
      icon: FileText,
      title: "Informe generado y asignado a Leslie Hidalgo",
      date: "25/07/2025",
      time: "09:20 AM",
      status: "completed",
      description: "El resumen técnico ha sido creado y enviado al líder de GTTD correspondiente.",
    },
    {
      id: 3,
      icon: AlertCircle,
      title: 'Leslie Hidalgo movió tu solicitud a "En Evaluación"',
      date: "26/07/2025",
      time: "11:30 AM",
      status: "completed",
      description: "La solicitud está siendo revisada por el equipo técnico especializado.",
    },
    {
      id: 4,
      icon: CheckCircle,
      title: "Leslie Hidalgo aprobó tu solicitud",
      date: "28/07/2025",
      time: "04:55 PM",
      status: "completed",
      description: "Tu proyecto ha sido aprobado. Próximo paso: Planificación detallada.",
    },
    {
      id: 5,
      icon: Rocket,
      title: "Tu solicitud ha sido aprobada y ha pasado a la fase de 'Planificación'",
      date: "29/07/2025",
      time: "09:00 AM",
      status: "completed",
      description: "El proyecto ha entrado en la fase de planificación asistida con IA.",
    },
    {
      id: 6,
      icon: Brain,
      title: "Se ha generado el informe de planificación predictiva",
      date: "29/07/2025",
      time: "11:30 AM",
      status: "completed",
      description: "El Agente 2 ha completado el análisis y generado el plan predictivo del proyecto.",
    },
    {
      id: 7,
      icon: Clock,
      title: "Inicio de fase de desarrollo",
      date: "Pendiente",
      time: "Estimado: 1-2 semanas",
      status: "pending",
      description: "Se asignará el equipo de desarrollo según las recomendaciones del informe.",
    },
  ]

  const chatMessages = [
    {
      id: 1,
      sender: "Leslie Hidalgo",
      senderRole: "Líder GTTD - Dominio Tecnológico",
      message:
        "Hola! He revisado tu solicitud del Sistema de Gestión de Inventarios. Me parece muy interesante la propuesta. ¿Podrías proporcionarme más detalles sobre el volumen de transacciones que esperas manejar diariamente?",
      timestamp: "26/07/2025 - 02:30 PM",
      isFromLeader: true,
    },
    {
      id: 2,
      sender: "Tú",
      senderRole: "Solicitante",
      message:
        "¡Hola Leslie! Gracias por revisar mi solicitud. Estimamos manejar aproximadamente 500-800 transacciones diarias en el primer año, con un crecimiento proyectado del 25% anual. También necesitamos integración con nuestro sistema ERP actual.",
      timestamp: "26/07/2025 - 04:15 PM",
      isFromLeader: false,
    },
    {
      id: 3,
      sender: "Leslie Hidalgo",
      senderRole: "Líder GTTD - Dominio Tecnológico",
      message:
        "Perfecto, esa información es muy útil. Con ese volumen de transacciones, definitivamente necesitaremos una arquitectura robusta. He aprobado tu solicitud y la he movido a la fase de planificación. El equipo técnico se pondrá en contacto contigo en los próximos 2-3 días para definir los detalles de implementación.",
      timestamp: "28/07/2025 - 04:55 PM",
      isFromLeader: true,
    },
    {
      id: 4,
      sender: "Leslie Hidalgo",
      senderRole: "Líder GTTD - Dominio Tecnológico",
      message:
        "¡Excelentes noticias! El Agente 2 ha completado el análisis de planificación predictiva de tu proyecto. El informe está disponible en la sección de documentos. Según el análisis, el proyecto tiene una estimación realista de 14-16 semanas con un equipo de 5-6 personas. ¡Muy emocionante!",
      timestamp: "29/07/2025 - 11:45 AM",
      isFromLeader: true,
    },
  ]

  const documents = [
    {
      name: "Resumen de Usuario Original",
      type: "PDF",
      size: "245 KB",
      available: true,
    },
    {
      name: "Informe de Evaluación Técnica",
      type: "PDF",
      size: "1.2 MB",
      available: true,
    },
    {
      name: "Informe de Planificación Predictiva",
      type: "PDF",
      size: "2.8 MB",
      available: true,
      isNew: true,
    },
    {
      name: "Plan de Implementación Detallado",
      type: "PDF",
      size: "Pendiente",
      available: false,
    },
  ]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Crear nuevo mensaje
      const now = new Date()
      const timestamp = `${now.toLocaleDateString('es-PE')} - ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`
      
      const newMsg = {
        id: messages.length + 1,
        sender: "Tú",
        senderRole: "Solicitante",
        message: newMessage.trim(),
        timestamp: timestamp,
        isFromLeader: false,
      }
      
      // Agregar mensaje al chat
      setMessages(prev => [...prev, newMsg])
      
      // Limpiar input
      setNewMessage("")
      
      // Simular respuesta automática del líder después de 2 segundos
      setTimeout(() => {
        const responses = [
          "¡Gracias por la información adicional! La revisaré y te responderé pronto.",
          "Perfecto, eso me ayuda a entender mejor el contexto. Procederé con la evaluación.",
          "Excelente. Voy a coordinar con el equipo técnico para los siguientes pasos.",
          "¡Muy buena pregunta! Te haré seguimiento sobre ese punto específico."
        ]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        const leaderReply = {
          id: messages.length + 2,
          sender: "Leslie Hidalgo",
          senderRole: "Líder GTTD - Dominio Tecnológico",
          message: randomResponse,
          timestamp: `${now.toLocaleDateString('es-PE')} - ${new Date(now.getTime() + 120000).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
          isFromLeader: true,
        }
        
        setMessages(prev => [...prev, leaderReply])
      }, 2000)
      
      console.log("Mensaje enviado:", newMessage)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel - Responsive - Full Height */}
      <div className="w-full sm:w-[500px] md:w-[600px] lg:w-[500px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col animate-in slide-in-from-right duration-300 h-screen shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Seguimiento Detallado</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{request?.title || "Sistema de Gestión de Inventarios"}</p>
              {/* Indicador de estado actualizado */}
              <Badge variant="secondary" className="mt-2 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30">
                🔵 En Planificación
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-100">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-600/20 dark:to-purple-600/20 border-blue-200 dark:border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                Análisis IA - Actualizado
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-3">
                <strong>Estado actual:</strong> Planificación predictiva completada. Informe disponible para descarga.
              </p>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3 mr-1" />
                Próximo paso: Asignación de equipo en 1-2 semanas
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Container */}
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Tabs List */}
            <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800/50">
                <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  Línea de Tiempo
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <MessageCircle className="w-4 h-4" />
                  Mensajes
                  {chatMessages.some((msg) => msg.isFromLeader) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Timeline Tab Content - Solo se renderiza cuando está activo */}
            {activeTab === "timeline" && (
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* Timeline Events - Full Height */}
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="relative w-full">
                    {/* Timeline Events */}
                    <div className="space-y-8 sm:space-y-10 relative pb-8">
                      {/* Vertical Line Background - calculada dinámicamente */}
                      <div className="absolute left-6 sm:left-8 top-6 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
                      
                      {timelineEvents.map((event, index) => {
                        const IconComponent = event.icon;
                        const isLast = index === timelineEvents.length - 1;
                        return (
                          <div key={event.id} className="relative flex items-start">
                            {/* Timeline Dot */}
                            <div className="relative z-20 flex-shrink-0">
                              <div
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg border-2 ${
                                  event.status === "completed"
                                    ? "bg-green-500 text-white border-green-300"
                                    : event.status === "pending"
                                      ? "bg-yellow-500 text-white border-yellow-300"
                                      : "bg-gray-400 text-white border-gray-300"
                                }`}
                              >
                                <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                              </div>
                            </div>

                            {/* Event Content */}
                            <div className="ml-6 sm:ml-8 flex-1 min-w-0">
                              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow w-full">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 pr-4 mb-2 sm:mb-0">
                                    {event.title}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs flex-shrink-0 self-start ${
                                      event.status === "completed"
                                        ? "border-green-500 text-green-700 dark:text-green-400"
                                        : "border-yellow-500 text-yellow-700 dark:text-yellow-400"
                                    }`}
                                  >
                                    {event.status === "completed" ? "✓ Completado" : "⏳ Pendiente"}
                                  </Badge>
                                </div>

                                {/* Date and Time */}
                                <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span className="mr-3">{event.date}</span>
                                  <span className="mx-2 hidden sm:inline">•</span>
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>{event.time}</span>
                                </div>

                                {/* Description */}
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                                  {event.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Tab Content - Solo se renderiza cuando está activo */}
            {activeTab === "messages" && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Chat Messages - Scrollable with better spacing */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-6" />
                        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-3">Sin mensajes aún</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-500 max-w-md">
                          Cuando el líder de GTTD te envíe un mensaje sobre esta solicitud, aparecerá aquí.
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromLeader ? "justify-start" : "justify-end"} animate-in fade-in duration-200`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-5 shadow-sm border-2 transition-all hover:shadow-md ${
                              message.isFromLeader
                                ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                                : "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                            }`}
                          >
                            {/* Message Header */}
                            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                message.isFromLeader 
                                  ? "bg-blue-500 dark:bg-blue-600" 
                                  : "bg-green-500 dark:bg-green-600"
                              }`}>
                                {message.sender.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-semibold ${
                                      message.isFromLeader 
                                        ? "text-blue-700 dark:text-blue-300" 
                                        : "text-green-700 dark:text-green-300"
                                    }`}
                                  >
                                    {message.sender}
                                  </span>
                                  {message.isFromLeader && (
                                    <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5">
                                      Líder GTTD
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{message.senderRole}</p>
                              </div>
                            </div>
                            
                            {/* Message Content */}
                            <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
                              {message.message}
                            </p>
                            
                            {/* Message Footer */}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                              <span>{message.timestamp}</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Enviado</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Message Input - Fixed at bottom with theme support */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Escribe tu respuesta aquí..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[100px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span>Presiona</span>
                        <kbd className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 rounded border">Enter</kbd>
                        <span>para enviar,</span>
                        <kbd className="px-1.5 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 rounded border">Shift+Enter</kbd>
                        <span>para nueva línea</span>
                      </p>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Responder
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
