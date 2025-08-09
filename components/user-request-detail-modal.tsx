"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRequestTimeline } from "@/hooks/useRequestTimeline"
import { BidirectionalChat } from "@/components/bidirectional-chat"
import {
  X,
  CheckCircle,
  Clock,
  FileText,
  MessageSquare,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Zap,
  Building,
  Target,
  Loader2,
  RefreshCw
} from "lucide-react"

// Sanitizador de textos para vista del solicitante: oculta detalles internos
function sanitizeForRequester(input: string): string {
  if (!input) return ""
  let text = input
  // Cortar todo lo que venga después de un separador de info interna común
  text = text.replace(/\s*---\s*INFO:.*/i, "")
  // Remover bloques explícitos de clasificación/prioridad
  text = text.replace(/Clasificación\s*:\s*[^.|\n]+[.|\n]?/gi, "")
  text = text.replace(/Prioridad\s*:\s*[^.|\n]+[.|\n]?/gi, "")
  // Frases internas típicas
  text = text.replace(/(requiere|requiri\u00f3) aprobaci\u00f3n gerencial\.?/gi, "")
  text = text.replace(/aprobaci\u00f3n gerencial necesaria\.?/gi, "")
  // Normalizar espacios y puntuación sobrante
  text = text.replace(/\s{2,}/g, " ").replace(/\s+\./g, ".").trim()
  // Si quedó vacío, mostrar un mensaje genérico
  return text || "Actualización registrada"
}

interface UserRequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
}

export function UserRequestDetailModal({ isOpen, onClose, request: requestProp }: UserRequestDetailModalProps) {
  const [activeTab, setActiveTab] = useState("summary")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Mantener una copia local para refrescos en vivo
  const [requestData, setRequestData] = useState<any>(requestProp)
  // Sincronizar cuando cambia el prop
  useEffect(() => { setRequestData(requestProp) }, [requestProp])
  // Usar una referencia única para el render
  const request = requestData ?? requestProp
  // Inicializar clasificación editable desde final o sugerida
  const initialClassification = (request?.clasificacion_final || request?.final_classification || request?.clasificacion_sugerida || request?.classification || 'requerimiento') as 'proyecto' | 'requerimiento'
  const [editableClassification, setEditableClassification] = useState<'proyecto' | 'requerimiento'>(initialClassification)

  // Tipos de apoyo para helpers
  type StatusKey = 'pending_approval' | 'pending_technical_analysis' | 'in_evaluation' | 'approved' | 'rejected' | 'on_hold'
  type PriorityKey = 'P1' | 'P2' | 'P3' | 'P4'
  
  // Hooks para obtener datos reales
  const { timeline, loading: timelineLoading, error: timelineError, refetch: refetchTimeline } = useRequestTimeline(request?.id)

  // Re-fetch silencioso ante cambios globales (aprobación/rechazo, etc.)
  useEffect(() => {
    if (!request?.id) return
    let cancelled = false
    const handleRefresh = async () => {
      try {
        const res = await fetch(`/api/requests/${request.id}`)
        if (!res.ok) return
        const fresh = await res.json()
        if (!cancelled && fresh) setRequestData(fresh)
      } catch {}
      // Siempre refrescar timeline
      refetchTimeline()
    }
    window.addEventListener('requests:refresh', handleRefresh)
    window.addEventListener('request:updated', handleRefresh)
    return () => {
      cancelled = true
      window.removeEventListener('requests:refresh', handleRefresh)
      window.removeEventListener('request:updated', handleRefresh)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id])

  if (!isOpen || !request) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full h-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Simplificado */}
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
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {request?.title || request?.titulo_solicitud}
                  </h1>
                  <Badge
                    variant="secondary"
                    className={getStatusBadgeColor(request?.status)}
                  >
                    {getStatusLabel(request?.status)}
                  </Badge>
                  {/* Solo mostrar tipo final si ya fue decidido y aprobado por el líder */}
                  {(request?.clasificacion_final && request?.status === 'approved') && (
                    <Badge
                      variant="outline"
                      className={request?.clasificacion_final === 'proyecto'
                        ? "bg-purple-100 text-purple-700 border-purple-300"
                        : "bg-blue-100 text-blue-700 border-blue-300"
                      }
                    >
                      {request?.clasificacion_final === 'proyecto' ? 'Proyecto' : 'Requerimiento'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span><strong>ID:</strong> {request?.id}</span>
                  <span><strong>Enviado:</strong> {request?.submissionDate}</span>
                  <span><strong>Días transcurridos:</strong> {request?.daysInStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación Simplificada */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="summary"
                  className="flex items-center justify-center py-4 px-6 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  <span className="font-medium">Mi Solicitud</span>
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="flex items-center justify-center py-4 px-6 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-medium">Seguimiento</span>
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="flex items-center justify-center py-4 px-6 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  <span className="font-medium">Mensajes</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Contenido Simplificado */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="h-full overflow-y-auto p-6">
              
              {/* Tab 1: Resumen de la Solicitud */}
              <TabsContent value="summary" className="space-y-6 mt-0 h-full">
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  {/* Información Básica */}
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Resumen de tu Solicitud
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          <strong>Problema que quieres resolver:</strong> {request?.problema_principal || request?.description || "No especificado"}
                        </p>
                      </div>
                      
                      {(request?.objetivo_esperado || request?.impact) && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                            <strong>Objetivo buscado:</strong> {request?.objetivo_esperado || request?.impact}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center">
                            <Building className="h-4 w-4 mr-2 text-blue-600" />
                            Departamento
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{request?.departamento_solicitante || request?.department}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            Estado Actual
                          </h4>
                          <Badge className={getStatusBadgeColor(request?.status)}>
                            {getStatusLabel(request?.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Progreso General */}
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                        Progreso de tu Solicitud
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>Progreso general</span>
                          <span>{getProgressPercentage(request?.status)}%</span>
                        </div>
                        <Progress value={getProgressPercentage(request?.status)} className="h-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getProgressMessage(request?.status)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab 2: Timeline de Seguimiento */}
              <TabsContent value="timeline" className="space-y-6 mt-0 h-full">
                <div className="max-w-4xl mx-auto space-y-6">
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <Clock className="h-5 w-5 mr-2 text-blue-600" />
                        Historial de tu Solicitud
                        {timelineLoading && (
                          <Loader2 className="h-4 w-4 ml-2 animate-spin text-blue-600" />
                        )}
                        {!timelineLoading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={refetchTimeline}
                            className="ml-auto"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Seguimiento del progreso de tu solicitud paso a paso
                      </p>
                      {timelineError && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm mt-2">
                          Error al cargar el historial: {timelineError}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {timelineLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando historial...</span>
                        </div>
                      ) : (
                        <>
                        {/* Barra de progreso visual */}
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso de tu Solicitud</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{getProgressPercentage(request?.status)}% Completado</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressPercentage(request?.status)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {timeline.length > 0 ? timeline.map((step, index) => {
                            // Mapear íconos desde string a componentes React
                            const getIconComponent = (iconName: string) => {
                              const icons = {
                                FileText: FileText,
                                TrendingUp: TrendingUp, 
                                CheckCircle: CheckCircle,
                                AlertCircle: AlertCircle,
                                Clock: Clock,
                                Zap: Zap
                              } as const
                              const key = iconName as keyof typeof icons
                              return icons[key] || Clock
                            }
                            const StepIcon = getIconComponent(step.icon)
                            
                            // Determinar si este paso está activo (es el último completado o en progreso)
                            const isCurrentStep = index === timeline.filter(s => s.completed).length - 1 && step.completed
                            const isCompleted = step.completed
                            const isPending = !step.completed
                            
                            return (
                              <div key={step.id} className="relative">
                                {/* Línea de conexión más visible */}
                                {index < timeline.length - 1 && (
                                  <div className={`absolute left-6 top-16 w-0.5 h-16 ${
                                    isCompleted ? 'bg-blue-300 dark:bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                  }`}></div>
                                )}
  
                                <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 transition-all ${
                                  isCurrentStep 
                                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-600 shadow-md' 
                                    : isCompleted
                                    ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-700' 
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                                }`}>
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                                    isCurrentStep
                                      ? 'bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-500'
                                      : isCompleted 
                                      ? 'bg-green-100 border-green-400 dark:bg-green-900 dark:border-green-500'
                                      : 'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 opacity-60'
                                  }`}>
                                    <StepIcon className={`h-5 w-5 ${
                                      isCurrentStep
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : isCompleted 
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-400 dark:text-gray-500'
                                    }`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h3 className={`font-semibold ${
                                        isCurrentStep
                                          ? 'text-blue-900 dark:text-blue-100'
                                          : isCompleted 
                                          ? 'text-green-900 dark:text-green-100' 
                                          : 'text-gray-500 dark:text-gray-400'
                                      }`}>
                                        {step.status}
                                      </h3>
                                      {isCurrentStep && (
                                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                          Actual
                                        </Badge>
                                      )}
                                      {isCompleted && !isCurrentStep && (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      )}
                                    </div>
                                    <p className={`text-sm mt-1 ${
                                      isCurrentStep
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : isCompleted 
                                        ? 'text-green-700 dark:text-green-300' 
                                        : 'text-gray-400 dark:text-gray-500'
                                    }`}>
                                      {sanitizeForRequester(step.description || '')}
                                    </p>
                                    {/* Comentarios internos del líder ocultos para el solicitante */}
                                    {step.user && (
                                      <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                        <User className="h-3 w-3 inline mr-1" />
                                        {step.user}
                                      </p>
                                    )}
                                    <p className="text-xs mt-2 text-gray-400 dark:text-gray-500">
                                      <Calendar className="h-3 w-3 inline mr-1" />
                                      {step.date}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          }) : (
                            <div className="text-center py-8">
                              <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                              <p className="text-gray-500 dark:text-gray-400">
                                No hay historial disponible para esta solicitud
                              </p>
                            </div>
                          )}
                        </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab 3: Chat Bidireccional */}
              <TabsContent value="messages" className="space-y-6 mt-0 h-full">
                <div className="max-w-4xl mx-auto">
                  <BidirectionalChat 
                    requestId={request?.id}
                    currentUserRole="user"
                    currentUserName={request?.requester || "Solicitante"}
                    currentUserEmail={request?.requester_email || "solicitante@utp.edu.pe"}
                  />
                </div>
              </TabsContent>

              {/* Sección de confirmación del solicitante eliminada: la clasificación es interna */}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Funciones auxiliares
function getStatusBadgeColor(status: string) {
  const configs = {
    pending_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    pending_technical_analysis: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    in_evaluation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    on_hold: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
  } as const
  const key = (status as keyof typeof configs)
  return configs[key] || configs.in_evaluation
}

function getProgressPercentage(status: string) {
  const percentages = {
    pending_approval: 25,
    pending_technical_analysis: 35,
    in_evaluation: 60,
    approved: 100,
    rejected: 100,
    on_hold: 40
  } as const
  const key = (status as keyof typeof percentages)
  return percentages[key] ?? 25
}

function getProgressMessage(status: string) {
  const messages = {
    pending_approval: 'Tu solicitud está esperando aprobación gerencial',
    pending_technical_analysis: 'En proceso de análisis técnico',
    in_evaluation: 'Un especialista está evaluando tu solicitud',
    approved: '¡Felicitaciones! Tu solicitud ha sido aprobada',
    rejected: 'Tu solicitud no fue aprobada en esta ocasión',
    on_hold: 'Tu solicitud está pausada temporalmente'
  } as const
  const key = (status as keyof typeof messages)
  return messages[key] || 'Estado en proceso de definición'
}

function getCurrentOrEstimatedDate(status: string, step: number) {
  const now = new Date()
  if (step === 1 && ['En Evaluación', 'Aprobada', 'Rechazada'].includes(status)) {
    return new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')
  }
  if (step === 2 && ['Aprobada', 'Rechazada'].includes(status)) {
    return new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')
  }
  return 'Pendiente'
}

function getStatusLabel(status: string) {
  const statusMap = {
    pending_approval: 'Pendiente Aprobación',
    pending_technical_analysis: 'Análisis Técnico', 
    in_evaluation: 'En Evaluación',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    on_hold: 'En Espera'
  } as const
  const key = (status as keyof typeof statusMap)
  return statusMap[key] || status
}

function getPriorityBadgeColor(priority: string) {
  const colors = {
    P1: 'bg-red-100 text-red-700 border-red-300',
    P2: 'bg-yellow-100 text-yellow-700 border-yellow-300', 
    P3: 'bg-green-100 text-green-700 border-green-300',
    P4: 'bg-gray-100 text-gray-700 border-gray-300'
  } as const
  const key = (priority as keyof typeof colors)
  return colors[key] || colors.P2
}
