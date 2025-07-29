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
import { useState } from "react"

interface TrackingPanelProps {
  isOpen: boolean
  onClose: () => void
  request: any
}

export function TrackingPanel({ isOpen, onClose, request }: TrackingPanelProps) {
  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState("timeline")

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
      // Aquí se enviaría el mensaje al backend
      console.log("Enviando mensaje:", newMessage)
      setNewMessage("")
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

      {/* Panel */}
      <div className="w-[500px] bg-gray-900 border-l border-gray-800 flex flex-col animate-in slide-in-from-right duration-300 h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Seguimiento Detallado</h2>
              <p className="text-sm text-gray-400 mt-1">{request?.title || "Sistema de Gestión de Inventarios"}</p>
              {/* Indicador de estado actualizado */}
              <Badge variant="secondary" className="mt-2 bg-blue-600/20 text-blue-300 border-blue-500/30">
                🔵 En Planificación
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-100">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="p-6 border-b border-gray-800 flex-shrink-0">
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                Análisis IA - Actualizado
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-200 mb-3">
                <strong>Estado actual:</strong> Planificación predictiva completada. Informe disponible para descarga.
              </p>
              <div className="flex items-center text-xs text-gray-400">
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
            <div className="px-6 pt-4 border-b border-gray-800 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-gray-700">
                  <MapPin className="w-4 h-4" />
                  Línea de Tiempo
                </TabsTrigger>
                <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-gray-700">
                  <MessageCircle className="w-4 h-4" />
                  Mensajes
                  {chatMessages.some((msg) => msg.isFromLeader) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Timeline Tab Content */}
            <TabsContent value="timeline" className="flex-1 flex flex-col mt-0 min-h-0">
              {/* Scrollable Timeline */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {timelineEvents.map((event, index) => (
                    <div key={event.id} className="flex">
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center mr-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            event.status === "completed"
                              ? "bg-green-600/20 text-green-400"
                              : event.status === "pending"
                                ? "bg-yellow-600/20 text-yellow-400"
                                : "bg-gray-600/20 text-gray-400"
                          }`}
                        >
                          <event.icon className="w-4 h-4" />
                        </div>
                        {index < timelineEvents.length - 1 && <div className="w-px h-12 bg-gray-700 mt-2" />}
                      </div>

                      {/* Event Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-200">{event.title}</h4>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              event.status === "completed"
                                ? "bg-green-600/20 text-green-300"
                                : "bg-yellow-600/20 text-yellow-300"
                            }`}
                          >
                            {event.status === "completed" ? "Completado" : "Pendiente"}
                          </Badge>
                        </div>

                        <div className="text-xs text-gray-400 mb-2">
                          {event.date} • {event.time}
                        </div>

                        <p className="text-sm text-gray-300">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Section - Fixed at bottom */}
              <div className="p-6 border-t border-gray-800 flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-300 mb-4">Documentos Disponibles</h3>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-200">{doc.name}</p>
                            {doc.isNew && <Badge className="bg-green-600 text-white text-xs px-2 py-0.5">NUEVO</Badge>}
                          </div>
                          <p className="text-xs text-gray-400">
                            {doc.type} • {doc.size}
                          </p>
                        </div>
                      </div>

                      {doc.available ? (
                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                          <Download className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-700 text-gray-400 text-xs">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Messages Tab Content */}
            <TabsContent value="messages" className="flex-1 flex flex-col mt-0 min-h-0">
              {/* Chat Messages - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="w-12 h-12 text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">Sin mensajes aún</h3>
                      <p className="text-sm text-gray-500">
                        Cuando el líder de GTTD te envíe un mensaje sobre esta solicitud, aparecerá aquí.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromLeader ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.isFromLeader
                              ? "bg-gray-800 border border-gray-700"
                              : "bg-blue-600/20 border border-blue-500/30"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-xs font-medium ${
                                message.isFromLeader ? "text-blue-300" : "text-green-300"
                              }`}
                            >
                              {message.sender}
                            </span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-400">{message.senderRole}</span>
                          </div>
                          <p className="text-sm text-gray-200 mb-2">{message.message}</p>
                          <div className="text-xs text-gray-500">{message.timestamp}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Message Input - Fixed at bottom */}
              <div className="p-6 border-t border-gray-800 flex-shrink-0">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Escribe tu respuesta aquí..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-[80px] bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">Presiona Enter para enviar, Shift+Enter para nueva línea</p>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Responder
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
