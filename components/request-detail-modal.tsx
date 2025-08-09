"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  X,
  CheckCircle,
  XCircle,
  Pause,
  ArrowUp,
  Clock,
  FileText,
  MessageSquare,
  Brain,
  Upload,
  Send,
  MessageCircle,
  Rocket,
  Download,
  AlertTriangle,
  Users,
  Calendar,
  Target,
  Loader2,
  CloudUpload,
  CheckCircle2,
  TrendingUp,
  User,
  Plus,
  ArrowRight,
} from "lucide-react"

interface RequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
  userRole: "lider_dominio" | "lider_gerencial"
}

export function RequestDetailModal({ isOpen, onClose, request, userRole }: RequestDetailModalProps) {
  const [activeTab, setActiveTab] = useState(request?.status === "En Planificación" ? "planning" : "summary")
  const [comment, setComment] = useState("")
  const [chatMessage, setChatMessage] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [approvalComments, setApprovalComments] = useState("")
  const [finalPriority, setFinalPriority] = useState(request?.priority || "P2")
  const [finalClassification, setFinalClassification] = useState(request?.classification || "requerimiento")

  // Estados para los modales
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false)
  const [escalationJustification, setEscalationJustification] = useState("")
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [newChatMessage, setNewChatMessage] = useState("")

  // Estados para la planificación asistida
  const [planningState, setPlanningState] = useState<"waiting" | "processing" | "completed">("waiting")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  if (!isOpen || !request) return null

  // Función para aprobar solicitud
  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/requests/${request.id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          leader_comments: approvalComments,
          priority_final: finalPriority,
          classification_final: finalClassification,
          approved_by: userRole === 'lider_dominio' ? 'Domain Leader' : 'Manager',
          approved_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        alert('✅ Solicitud aprobada exitosamente')
        setShowApprovalModal(false)
        onClose()
        // Emitir eventos SPA para refrescar listas y detalles sin recargar
        try { window.dispatchEvent(new CustomEvent('requests:refresh')) } catch {}
        try { window.dispatchEvent(new CustomEvent('request:updated', { detail: { id: request.id } })) } catch {}
      } else {
        alert('Error al aprobar la solicitud')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al aprobar la solicitud')
    } finally {
      setIsProcessing(false)
    }
  }

  // Función para rechazar solicitud
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Por favor ingrese una razón para el rechazo')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/requests/${request.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          leader_comments: rejectionReason,
          rejected_by: userRole === 'lider_dominio' ? 'Domain Leader' : 'Manager',
          rejected_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        alert('❌ Solicitud rechazada')
        setShowRejectionModal(false)
        onClose()
        try { window.dispatchEvent(new CustomEvent('requests:refresh')) } catch {}
        try { window.dispatchEvent(new CustomEvent('request:updated', { detail: { id: request.id } })) } catch {}
      } else {
        alert('Error al rechazar la solicitud')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al rechazar la solicitud')
    } finally {
      setIsProcessing(false)
    }
  }

  // Datos simulados del historial de auditoría
  const auditLog = [
    {
      id: 1,
      action: "Solicitud creada por Juan Pérez",
      timestamp: "25/07/2025 09:15 AM",
      user: "Juan Pérez",
      type: "creation",
    },
    {
      id: 2,
      action: "Solicitud asignada automáticamente a Leslie Hidalgo",
      timestamp: "25/07/2025 09:16 AM",
      user: "Sistema",
      type: "assignment",
    },
    {
      id: 3,
      action: "Leslie Hidalgo movió la solicitud a 'En Evaluación'",
      timestamp: "26/07/2025 11:30 AM",
      user: "Leslie Hidalgo",
      type: "status_change",
    },
    {
      id: 4,
      action: "Informe técnico generado por IA",
      timestamp: "26/07/2025 11:35 AM",
      user: "Agente IA",
      type: "ai_analysis",
    },
  ]

  // Métricas de tiempo por estado
  const timeMetrics = [
    { status: "Nueva", time: "2h 15m", percentage: 10 },
    { status: "En Evaluación", time: "3d 4h 30m", percentage: 75 },
    { status: "En Planificación", time: "Pendiente", percentage: 0 },
    { status: "En Desarrollo", time: "Pendiente", percentage: 0 },
  ]

  // Chat interno simulado
  const internalChat = [
    {
      id: 1,
      user: "Leslie Hidalgo",
      message: "Esta solicitud parece tener un buen ROI. ¿Qué opinan sobre la prioridad?",
      timestamp: "26/07/2025 14:20",
      avatar: "LH",
    },
    {
      id: 2,
      user: "Carlos Mendoza",
      message: "@leslie.hidalgo Coincido, pero necesitamos validar la capacidad del equipo de desarrollo",
      timestamp: "26/07/2025 14:25",
      avatar: "CM",
    },
  ]

  // Chat con solicitante simulado
  const requesterChat = [
    {
      id: 1,
      user: "Juan Pérez",
      message: "Hola Leslie, ¿hay alguna actualización sobre mi solicitud del sistema de inventarios?",
      timestamp: "26/07/2025 10:30",
      avatar: "JP",
      isRequester: true,
    },
    {
      id: 2,
      user: "Leslie Hidalgo",
      message:
        "Hola Juan, estamos revisando los detalles técnicos. ¿Podrías confirmar si necesitas integración con el sistema actual de activos?",
      timestamp: "26/07/2025 11:15",
      avatar: "LH",
      isRequester: false,
    },
    {
      id: 3,
      user: "Juan Pérez",
      message:
        "Sí, definitivamente necesitamos que se integre con nuestro sistema actual. También sería ideal si pudiera generar códigos QR automáticamente.",
      timestamp: "26/07/2025 11:45",
      avatar: "JP",
      isRequester: true,
    },
  ]

  // Datos del informe de planificación (cuando está completado)
  const planningReport = {
    timeEstimation: {
      realistic: "14-16 semanas",
      optimistic: "12-13 semanas",
      pessimistic: "18-20 semanas",
      confidence: 85,
    },
    resources: {
      teamSize: "5-6 personas",
      profiles: [
        "1 Project Manager",
        "2 Desarrolladores Full-Stack",
        "1 Diseñador UX/UI",
        "1 Analista de Datos",
        "1 QA Tester",
      ],
      budget: "$85,000 - $120,000",
    },
    risks: [
      {
        risk: "Integración con sistemas legacy",
        probability: "Alta (75%)",
        impact: "Medio",
        mitigation: "Realizar pruebas de integración tempranas",
      },
      {
        risk: "Migración de datos existentes",
        probability: "Media (45%)",
        impact: "Alto",
        mitigation: "Crear plan de migración por fases",
      },
      {
        risk: "Cambios en requerimientos",
        probability: "Media (60%)",
        impact: "Medio",
        mitigation: "Implementar metodología ágil con sprints cortos",
      },
    ],
  }

  const handleEscalate = () => {
    if (escalationJustification.trim()) {
      console.log("Escalando a aprobación gerencial:", request.id, "Justificación:", escalationJustification)
      setIsEscalationModalOpen(false)
      setEscalationJustification("")
      // Lógica de escalamiento
    }
  }

  const handlePause = () => {
    console.log("Pausando solicitud:", request.id)
    // Lógica de pausa
  }

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      console.log("Enviando mensaje:", chatMessage)
      setChatMessage("")
    }
  }

  const sendRequesterMessage = () => {
    if (newChatMessage.trim()) {
      console.log("Enviando mensaje al solicitante:", newChatMessage)
      setNewChatMessage("")
      // Aquí se agregaría el mensaje al chat
    }
  }

  // Funciones para la planificación asistida
  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    console.log("Archivo subido:", file.name)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleAnalyzeAndGenerate = () => {
    if (uploadedFile) {
      setPlanningState("processing")
      // Simular procesamiento
      setTimeout(() => {
        setPlanningState("completed")
      }, 3000)
    }
  }

  const handleDownloadReport = () => {
    console.log("Descargando informe de planificación")
    // Lógica para descargar PDF
  }

  const handleSendToMonday = () => {
    console.log("Enviando a Monday.com")
    // Lógica para enviar a Monday.com
  }

  const getActionButtons = () => {
    if (userRole === "lider_gerencial" && request.status === "Pendiente Aprobación Gerencial") {
      return (
        <div className="flex space-x-3">
          <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprobación Final y Asignación de Presupuesto
          </Button>
          <Button
            variant="outline"
            onClick={handleReject}
            className="border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rechazar
          </Button>
        </div>
      )
    }

    if (userRole === "lider_dominio") {
      return (
        <div className="flex flex-wrap gap-3">
          {request.type === "Proyecto" ? (
            <Button
              onClick={() => setIsEscalationModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <ArrowUp className="h-4 w-4 mr-2" />🔼 Elevar para Aprobación Gerencial
            </Button>
          ) : (
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="h-4 w-4 mr-2" />✅ Aprobar Requerimiento
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setIsChatModalOpen(true)}
            className="border-blue-500 text-blue-600 hover:bg-blue-50 bg-transparent"
          >
            <MessageCircle className="h-4 w-4 mr-2" />💬 Enviar Mensaje al Solicitante
          </Button>
          <Button
            variant="outline"
            onClick={handlePause}
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 bg-transparent"
          >
            <Pause className="h-4 w-4 mr-2" />
            Poner en Espera
          </Button>
          <Button
            variant="outline"
            onClick={handleReject}
            className="border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rechazar
          </Button>
        </div>
      )
    }

    return null
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full h-full max-w-7xl max-h-[95vh] rounded-lg shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Mejorado */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{request?.title}</h1>
                  <Badge
                    variant="secondary"
                    className={`${request?.type === "Proyecto"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}`}
                  >
                    {request?.type}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`${
                      request?.status === "Nueva"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : request?.status === "En Evaluación"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : request?.status === "En Planificación"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    }`}
                  >
                    {request?.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span><strong>ID:</strong> {request?.id}</span>
                  <span><strong>Solicitante:</strong> {request?.requester}</span>
                  <span><strong>Dominio:</strong> {request?.domain}</span>
                  <span><strong>Presupuesto:</strong> {request?.estimatedBudget}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-xs">
                Modo Focus
              </Badge>
            </div>
          </div>
        </div>

        {/* Navegación de Pestañas Mejorada */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="summary"
                  className="flex items-center justify-center py-4 px-6 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  <span className="font-medium">Resumen e Informe IA</span>
                </TabsTrigger>
                <TabsTrigger
                  value="planning"
                  className="flex items-center justify-center py-4 px-6 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  <span className="font-medium">Planificación Asistida</span>
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center justify-center py-4 px-6 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-medium">Historial y Métricas</span>
                </TabsTrigger>
                <TabsTrigger
                  value="collaboration"
                  className="flex items-center justify-center py-4 px-6 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                >
                  <Users className="h-5 w-5 mr-2" />
                  <span className="font-medium">Colaboración</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Contenido de las Pestañas */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="h-full overflow-y-auto p-6">
              {/* Pestaña 1: Resumen e Informe IA */}
              <TabsContent value="summary" className="space-y-6 mt-0 h-full">
                <div className="max-w-7xl mx-auto space-y-6">
                  {/* Resumen Ejecutivo */}
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Resumen Ejecutivo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          <strong>Descripción:</strong> {request?.description || "Sistema de gestión de inventarios para optimizar el control de activos tecnológicos del departamento de TI."}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Solicitante</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{request?.requester}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{request?.department}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Fecha de Solicitud</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{request?.submissionDate}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Hace {request?.daysInStatus} días</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Presupuesto Estimado</h4>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{request?.estimatedBudget}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Estimación inicial</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Prioridad</h4>
                          <Badge variant="secondary" className={`${
                            request?.priority === "Alta"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : request?.priority === "Media"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          }`}>
                            {request?.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Análisis IA Mejorado */}
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
                        <Brain className="h-5 w-5 mr-2" />
                        Análisis Técnico Generado por IA
                      </CardTitle>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Análisis automático basado en patrones de proyectos similares y mejores prácticas
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                            <Target className="h-4 w-4 mr-2 text-green-600" />
                            Viabilidad Técnica
                          </h4>
                          <div className="flex items-center space-x-2 mb-2">
                            <Progress value={85} className="flex-1" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">85%</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Alta viabilidad con tecnologías existentes</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                            <Target className="h-4 w-4 mr-2 text-blue-600" />
                            Impacto ROI
                          </h4>
                          <div className="flex items-center space-x-2 mb-2">
                            <Progress value={92} className="flex-1" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">92%</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">ROI estimado: 340% en 18 meses</p>
                        </div>
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                            Prioridad Sugerida
                          </h4>
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 mb-2">ALTA</Badge>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Impacto crítico en operaciones</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-600" />
                          Resumen Ejecutivo Detallado
                        </h4>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            El sistema de gestión de inventarios propuesto aborda una necesidad crítica identificada en el
                            departamento de TI. La solución incluye seguimiento en tiempo real, alertas automáticas y
                            reportes avanzados que optimizarán significativamente los procesos operativos.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🔧 Stack Tecnológico Recomendado</h5>
                              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <li>• Frontend: React 18 + TypeScript</li>
                                <li>• Backend: Node.js + Express</li>
                                <li>• Base de datos: PostgreSQL</li>
                                <li>• Cache: Redis para optimización</li>
                              </ul>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                              <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">👥 Recursos Necesarios</h5>
                              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                                <li>• 2 Desarrolladores Full-Stack</li>
                                <li>• 1 Diseñador UX/UI</li>
                                <li>• 1 DevOps Engineer</li>
                                <li>• Tiempo estimado: 12-16 semanas</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                          <Brain className="h-4 w-4 mr-2 text-purple-600" />
                          Fuentes de Análisis IA
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Conversación con solicitante</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Análisis de requerimientos y contexto</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Base de conocimiento técnico</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Mejores prácticas y estándares</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Proyectos similares (3 casos)</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Análisis comparativo y lecciones aprendidas</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Capacidad del equipo</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Evaluación de recursos disponibles</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Acciones de Decisión Mejoradas */}
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <Target className="h-5 w-5 mr-2 text-blue-600" />
                        Acciones de Decisión
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Toma una decisión informada basada en el análisis técnico
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Recomendación IA</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Basado en el análisis, se recomienda <strong>aprobar</strong> esta solicitud debido a su alto impacto ROI
                          y viabilidad técnica. El proyecto está alineado con los objetivos estratégicos del departamento.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {getActionButtons()}
                      </div>

                      {/* Área de comentarios mejorada */}
                      <div className="space-y-3">
                        <Label htmlFor="comment" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Comentarios adicionales (opcional)
                        </Label>
                        <Textarea
                          id="comment"
                          placeholder="Agrega comentarios sobre tu decisión, condiciones especiales, o recomendaciones adicionales..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Estos comentarios serán visibles para el solicitante y el equipo de gestión
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </TabsContent>

                {/* Pestaña 2: Planificación Asistida */}
                <TabsContent value="planning" className="space-y-6 mt-0 h-full">
                  <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header de Planificación */}
                    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
                      <CardHeader>
                        <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                          <Rocket className="h-5 w-5 mr-2" />
                          Planificación Asistida por IA
                        </CardTitle>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          Genera automáticamente un plan de proyecto detallado basado en mejores prácticas
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">📋 Fases del Proyecto</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">5 fases identificadas</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">⏱️ Duración Estimada</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">14-16 semanas</p>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">👥 Recursos Requeridos</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">4 personas clave</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cronograma Visual */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                          Cronograma del Proyecto
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            { phase: "Fase 1: Análisis y Diseño", duration: "3 semanas", progress: 0, color: "blue" },
                            { phase: "Fase 2: Desarrollo Backend", duration: "4 semanas", progress: 0, color: "purple" },
                            { phase: "Fase 3: Desarrollo Frontend", duration: "4 semanas", progress: 0, color: "green" },
                            { phase: "Fase 4: Integración y Testing", duration: "2 semanas", progress: 0, color: "orange" },
                            { phase: "Fase 5: Despliegue y Capacitación", duration: "2 semanas", progress: 0, color: "red" }
                          ].map((phase, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{phase.phase}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{phase.duration}</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full bg-${phase.color}-500`}
                                  style={{ width: `${phase.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recursos y Asignaciones */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardHeader>
                          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                            <Users className="h-5 w-5 mr-2 text-green-600" />
                            Equipo Recomendado
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {[
                              { role: "Project Manager", name: "Por asignar", workload: "100%", avatar: "PM" },
                              { role: "Full-Stack Developer", name: "Por asignar", workload: "100%", avatar: "FS" },
                              { role: "Frontend Developer", name: "Por asignar", workload: "80%", avatar: "FE" },
                              { role: "UX/UI Designer", name: "Por asignar", workload: "60%", avatar: "UX" }
                            ].map((member, index) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                    {member.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.role}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">{member.name}</p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {member.workload}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardHeader>
                          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                            Riesgos y Mitigaciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {[
                              {
                                risk: "Integración con sistemas legacy",
                                probability: "Alta",
                                impact: "Medio",
                                mitigation: "Realizar pruebas de integración tempranas"
                              },
                              {
                                risk: "Disponibilidad del equipo",
                                probability: "Media",
                                impact: "Alto",
                                mitigation: "Planificación de recursos con 2 semanas de anticipación"
                              },
                              {
                                risk: "Cambios en requerimientos",
                                probability: "Media",
                                impact: "Medio",
                                mitigation: "Metodología ágil con sprints de 2 semanas"
                              }
                            ].map((risk, index) => (
                              <div key={index} className="border-l-4 border-orange-400 pl-4 py-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{risk.risk}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Prob: <strong>{risk.probability}</strong>
                                  </span>
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Impacto: <strong>{risk.impact}</strong>
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{risk.mitigation}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Acciones de Planificación */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <Target className="h-5 w-5 mr-2 text-blue-600" />
                          Acciones de Planificación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-3">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar Plan Completo (PDF)
                          </Button>
                          <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                            <Target className="h-4 w-4 mr-2" />
                            Enviar a Monday.com
                          </Button>
                          <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                            <Users className="h-4 w-4 mr-2" />
                            Asignar Recursos
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Pestaña 3: Historial y Métricas */}
                <TabsContent value="history" className="space-y-6 mt-0 h-full">
                  <div className="max-w-7xl mx-auto space-y-6">
                    {/* Métricas de Rendimiento */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Tiempo Total</p>
                              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{request?.daysInStatus} días</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">Eficiencia</p>
                              <p className="text-lg font-bold text-green-700 dark:text-green-300">87%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-orange-600" />
                            <div>
                              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Interacciones</p>
                              <p className="text-lg font-bold text-orange-700 dark:text-orange-300">12</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">SLA</p>
                              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">Cumplido</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Métricas de Tiempo Detalladas */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <Clock className="h-5 w-5 mr-2 text-blue-600" />
                          Métricas de Tiempo por Estado
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Análisis detallado del tiempo invertido en cada fase del proceso
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {timeMetrics.map((metric, index) => (
                            <div key={index} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                    metric.status === "Enviado" ? "bg-blue-500" :
                                    metric.status === "En Revisión" ? "bg-yellow-500" :
                                    metric.status === "En Planificación" ? "bg-purple-500" :
                                    "bg-green-500"
                                  }`}></div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{metric.status}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{metric.time}</span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {metric.percentage}% del tiempo total
                                  </p>
                                </div>
                              </div>
                              <Progress value={metric.percentage} className="h-3" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Log de Auditoría Mejorado */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          Log de Auditoría Completo
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Historial completo de todas las acciones realizadas en esta solicitud
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {auditLog.map((log, index) => (
                            <div key={log.id} className="relative">
                              {/* Línea de conexión */}
                              {index < auditLog.length - 1 && (
                                <div className="absolute left-4 top-8 w-0.5 h-8 bg-gray-200 dark:bg-gray-700"></div>
                              )}

                              <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                                  {log.action.includes("Solicitud creada") && <Plus className="h-4 w-4 text-blue-600" />}
                                  {log.action.includes("Estado cambiado") && <ArrowRight className="h-4 w-4 text-blue-600" />}
                                  {log.action.includes("Comentario agregado") && <MessageSquare className="h-4 w-4 text-blue-600" />}
                                  {log.action.includes("Asignado") && <User className="h-4 w-4 text-blue-600" />}
                                  {!log.action.includes("Solicitud creada") && !log.action.includes("Estado cambiado") &&
                                   !log.action.includes("Comentario agregado") && !log.action.includes("Asignado") &&
                                   <FileText className="h-4 w-4 text-blue-600" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.action}</p>
                                  <div className="flex items-center space-x-3 mt-2">
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-xs">
                                          {log.user.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.user}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{log.timestamp}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Pestaña 4: Colaboración */}
                <TabsContent value="collaboration" className="space-y-6 mt-0 h-full">
                  <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header de Colaboración */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Participantes</p>
                              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">4 líderes</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">Mensajes</p>
                              <p className="text-lg font-bold text-green-700 dark:text-green-300">{internalChat.length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Última actividad</p>
                              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">2h</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Chat Mejorado */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                          Chat Interno - Líderes GTTD
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Colabora con otros líderes de dominio para tomar la mejor decisión
                        </p>
                      </CardHeader>
                      <CardContent>
                        {/* Mensajes del chat mejorados */}
                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          {internalChat.map((message) => (
                            <div key={message.id} className="flex items-start space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 text-sm">
                                  {message.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{message.user}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    Líder de Dominio
                                  </Badge>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{message.timestamp}</span>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{message.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Input mejorado para nuevo mensaje */}
                        <div className="space-y-3">
                          <div className="flex space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                TU
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <Input
                                placeholder="Escribe un mensaje... (usa @nombre para mencionar a otros líderes)"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>💡 Tip: Usa @nombre.apellido para mencionar</span>
                                </div>
                                <Button
                                  onClick={sendChatMessage}
                                  disabled={!chatMessage.trim()}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Panel de Participantes */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <Users className="h-5 w-5 mr-2 text-green-600" />
                          Líderes Participantes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { name: "Ana García", domain: "Infraestructura", status: "online", avatar: "AG" },
                            { name: "Carlos Mendoza", domain: "Desarrollo", status: "online", avatar: "CM" },
                            { name: "María López", domain: "Seguridad", status: "away", avatar: "ML" },
                            { name: "Roberto Silva", domain: "Datos", status: "offline", avatar: "RS" }
                          ].map((participant, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                    {participant.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-700 ${
                                  participant.status === "online" ? "bg-green-500" :
                                  participant.status === "away" ? "bg-yellow-500" : "bg-gray-400"
                                }`}></div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{participant.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Líder de {participant.domain}</p>
                              </div>
                              <Badge variant="secondary" className={`text-xs ${
                                participant.status === "online" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                                participant.status === "away" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                              }`}>
                                {participant.status === "online" ? "En línea" :
                                 participant.status === "away" ? "Ausente" : "Desconectado"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

            </div>
          </Tabs>

          {/* Botones de acción para el líder */}
          {request?.status !== 'approved' && request?.status !== 'rejected' && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectionModal(true)}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEscalationModalOpen(true)}
                  className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Escalar
                </Button>
              </div>
              <Button
                onClick={() => setShowApprovalModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprobar Solicitud
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Aprobación */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aprobar Solicitud</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Prioridad Final</Label>
              <select
                value={finalPriority}
                onChange={(e) => setFinalPriority(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="P1">P1 - Urgente</option>
                <option value="P2">P2 - Alta</option>
                <option value="P3">P3 - Media</option>
                <option value="P4">P4 - Baja</option>
              </select>
            </div>
            <div>
              <Label>Clasificación Final</Label>
              <select
                value={finalClassification}
                onChange={(e) => setFinalClassification(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="proyecto">Proyecto</option>
                <option value="requerimiento">Requerimiento</option>
              </select>
            </div>
            <div>
              <Label>Comentarios (opcional)</Label>
              <Textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Agregue comentarios sobre la aprobación..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isProcessing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Procesando...</>
              ) : (
                <><CheckCircle className="h-4 w-4 mr-2" /> Confirmar Aprobación</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rechazo */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Razón del Rechazo *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explique por qué se rechaza esta solicitud..."
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Procesando...</>
              ) : (
                <><XCircle className="h-4 w-4 mr-2" /> Confirmar Rechazo</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RequestDetailModal
