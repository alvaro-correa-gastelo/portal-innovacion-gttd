"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Send, CheckCircle, Edit3, Star, Bot, User, Sparkles, Lightbulb, Zap, Target, FileText } from "lucide-react"

export function ChatInterface() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [showSummary, setShowSummary] = useState(false)
  const [rating, setRating] = useState(0)
  const [showOptions, setShowOptions] = useState(false)

  const suggestions = [
    {
      icon: Lightbulb,
      title: "Sistema de Gestión",
      description: "Necesito un sistema para gestionar inventarios de TI",
      prompt:
        "Necesito un sistema para gestionar inventarios de equipos de TI con seguimiento en tiempo real y alertas automáticas",
      color: "text-utp-blue dark:text-utp-red",
      bgColor: "bg-utp-blue/10 hover:bg-utp-blue/20 dark:bg-utp-red/10 dark:hover:bg-utp-red/20",
    },
    {
      icon: Zap,
      title: "Automatización",
      description: "Quiero automatizar procesos manuales",
      prompt: "Quiero automatizar el proceso de generación de reportes mensuales y notificaciones automáticas",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30",
    },
    {
      icon: Target,
      title: "Dashboard BI",
      description: "Necesito un dashboard para análisis de datos",
      prompt:
        "Requiero un dashboard de Business Intelligence para análisis de datos en tiempo real con gráficos interactivos",
      color: "text-green-500",
      bgColor: "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30",
    },
    {
      icon: Sparkles,
      title: "Integración",
      description: "Integrar sistemas existentes",
      prompt: "Necesito integrar nuestros sistemas actuales con una nueva plataforma de gestión centralizada",
      color: "text-purple-500",
      bgColor: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30",
    },
  ]

  const platformOptions = [
    { id: "canvas", label: "Canvas", description: "Sistema de gestión académica" },
    { id: "peoplesoft", label: "PeopleSoft", description: "Sistema de recursos humanos" },
    { id: "oracle", label: "Oracle", description: "Base de datos empresarial" },
    { id: "otros", label: "Otros", description: "Otra plataforma" },
  ]

  const handleSendMessage = (messageText?: string) => {
    const text = messageText || inputValue
    if (!text.trim()) return

    const newMessage = {
      id: Date.now(),
      type: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: "bot",
        content: getBotResponse(text),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])

      // Show platform selector after certain keywords
      if (text.toLowerCase().includes("plataforma") || text.toLowerCase().includes("sistema")) {
        setTimeout(() => {
          setShowOptions(true)
          const optionsMessage = {
            id: Date.now() + 2,
            type: "options",
            content: "platform-selector",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, optionsMessage])
        }, 1500)
      }

      // Show summary after a few exchanges
      if (messages.length > 4) {
        setTimeout(() => setShowSummary(true), 2000)
      }
    }, 1000)
  }

  const getBotResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("inventario") || lowerMessage.includes("gestión")) {
      return "Perfecto! Un sistema de gestión de inventarios puede ayudarte mucho. ¿Qué tipo de inventario necesitas gestionar? ¿Equipos de TI, materiales de oficina, o algo específico? También, ¿necesitas funciones como códigos QR, alertas de stock bajo, o reportes automáticos?"
    } else if (lowerMessage.includes("automatizar") || lowerMessage.includes("automático")) {
      return "Excelente idea automatizar procesos! ¿Qué proceso específico quieres automatizar? ¿Reportes, notificaciones, aprobaciones, o algo más? Cuéntame más sobre el flujo actual para poder sugerir la mejor solución."
    } else if (lowerMessage.includes("dashboard") || lowerMessage.includes("análisis")) {
      return "Un dashboard de BI puede transformar cómo visualizas tus datos. ¿Qué tipo de datos necesitas analizar? ¿Ventas, rendimiento, usuarios, o métricas específicas? ¿Necesitas gráficos en tiempo real o reportes periódicos?"
    } else if (lowerMessage.includes("integrar") || lowerMessage.includes("integración")) {
      return "Las integraciones son clave para la eficiencia. ¿Qué sistemas necesitas conectar? ¿Tienes APIs disponibles o necesitamos crear conectores personalizados? Cuéntame más sobre tu arquitectura actual."
    } else {
      return "Entiendo tu solicitud. Permíteme recopilar algunos detalles adicionales para generar el mejor resumen posible. ¿Podrías contarme más sobre el contexto y los objetivos específicos de tu proyecto?"
    }
  }

  const handleSuggestionClick = (suggestion: any) => {
    handleSendMessage(suggestion.prompt)
  }

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
      <div className="text-center max-w-4xl">
        <div className="w-20 h-20 bg-utp-blue/20 dark:bg-utp-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-utp-blue dark:text-utp-red" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mi Espacio de Innovación</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Bienvenido al sistema inteligente de solicitudes. Describe tu proyecto o necesidad tecnológica y te ayudaré a
          estructurar tu solicitud de manera profesional.
        </p>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all duration-200 border-gray-200 dark:border-gray-700 ${suggestion.bgColor} hover:shadow-md`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
                    <suggestion.icon className={`h-6 w-6 ${suggestion.color}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">{suggestion.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">💡 Consejos para una mejor solicitud:</p>
          <p>• Describe claramente el problema que quieres resolver</p>
          <p>• Menciona el impacto esperado en tu área de trabajo</p>
          <p>• Incluye cualquier restricción técnica o de tiempo</p>
          <p>• Especifica si tienes preferencias de tecnología</p>
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
              ) : (
                <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "user"
                          ? "bg-utp-blue dark:bg-utp-red ml-3"
                          : "bg-gray-100 dark:bg-gray-800 mr-3"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-4 ${
                        message.type === "user"
                          ? "bg-utp-blue dark:bg-utp-red text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
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
            placeholder="Describe tu solicitud o proyecto tecnológico..."
            className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-utp-blue dark:focus:border-utp-red"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={() => handleSendMessage()}
            className="bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark text-white"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Presiona Enter para enviar • El bot está diseñado para ayudarte a estructurar tu solicitud
        </p>
      </div>
    </div>
  )
}
