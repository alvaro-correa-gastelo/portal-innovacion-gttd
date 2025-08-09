"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  X,
  CheckCircle,
  XCircle,
  Pause,
  Clock,
  FileText,
  MessageSquare,
  User,
  Building,
  Calendar,
  Target,
  Database,
  TrendingUp,
  Users,
  Rocket,
  Brain,
  MessageCircle,
  Send,
  Download,
  ChevronRight,
  Sparkles,
  Zap,
  Upload
} from "lucide-react"
import { getEffectivePriorityFromRequest, getPriorityBadgeClass, getPriorityLabel } from "@/lib/priority-helper"

interface PreviewLeaderModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
  userRole?: "lider_dominio" | "lider_gerencial"
}

export function PreviewLeaderModal({ isOpen, onClose, request, userRole = "lider_dominio" }: PreviewLeaderModalProps) {
  const [activeTab, setActiveTab] = useState("summary")
  const [leaderComment, setLeaderComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chatMessage, setChatMessage] = useState("")

  if (!isOpen || !request) return null

  // Funciones de acción reales (igual que el modal anterior)
  const handleStatusChange = async (newStatus: string, comment?: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          leader_comments: comment || leaderComment,
          leader_id: 'current_leader@utp.edu.pe',
          action: newStatus === 'approved' ? 'approve' : 
                 newStatus === 'rejected' ? 'reject' : 'update'
        })
      })
      
      if (response.ok) {
        console.log(`Solicitud ${newStatus}`)
        onClose()
      }
    } catch (error) {
      console.error('Error updating request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = () => {
    if (request.classification === 'proyecto' && userRole === 'lider_dominio') {
      handleStatusChange('pending_approval', `Aprobado por líder de dominio. Requiere aprobación gerencial.\n\n${leaderComment}`)
    } else {
      handleStatusChange('approved', leaderComment)
    }
  }

  const handleReject = () => {
    if (leaderComment.trim()) {
      handleStatusChange('rejected', leaderComment)
    } else {
      alert('Por favor agregue un comentario explicando el motivo del rechazo')
    }
  }

  const handlePause = () => {
    handleStatusChange('on_hold', `Solicitud pausada.\n\n${leaderComment}`)
  }

  // Funciones mockup para funcionalidades futuras
  const handleFutureFeature = (feature: string) => {
    console.log(`Funcionalidad futura: ${feature} - Próximamente en MVP v2.0`)
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending_approval': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'pending_technical_analysis': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'in_evaluation': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'approved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'on_hold': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
    return colors[status] || colors['pending_approval']
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending_approval': 'Pendiente Aprobación',
      'pending_technical_analysis': 'Análisis Técnico',
      'in_evaluation': 'En Evaluación',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'on_hold': 'En Espera'
    }
    return labels[status] || status
  }

  // Datos simulados para funcionalidades futuras
  const futureFeatures = {
    aiAnalysis: {
      confidence: 87,
      recommendation: "Proyecto viable con alta probabilidad de éxito",
      riskLevel: "Bajo",
      estimatedCost: "$45,000 - $65,000",
      timeline: "14-16 semanas"
    },
    teamChat: [
      {
        id: 1,
        user: "Leslie Hidalgo",
        message: "Esta solicitud tiene buen potencial. ¿Qué opina el equipo técnico?",
        time: "Hace 2h",
        avatar: "LH"
      },
      {
        id: 2,
        user: "Carlos Mendoza",
        message: "Coincido. Las plataformas están bien definidas y el scope es claro.",
        time: "Hace 1h",
        avatar: "CM"
      }
    ]
  }

  return (
    <TooltipProvider>
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-900 w-full h-full max-w-6xl max-h-[95vh] rounded-lg shadow-xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con badge de versión */}
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
                      {request?.title}
                    </h1>
                    <Badge className={getStatusBadgeColor(request?.status)}>
                      {getStatusLabel(request?.status)}
                    </Badge>
                    <Badge variant="secondary" className={
                      request?.type === "Proyecto" || request?.classification === "proyecto"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }>
                      {request?.type || (request?.classification === "proyecto" ? "Proyecto" : "Requerimiento")}
                    </Badge>
                    {/* Prioridad efectiva basada en helper */}
                    {(() => {
                      const pr = getEffectivePriorityFromRequest(request)
                      return (
                        <Badge variant="outline" className={getPriorityBadgeClass(pr)}>
                          {getPriorityLabel(pr)}
                        </Badge>
                      )
                    })()}
                  </div>
                  <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span><strong>ID:</strong> {request?.id?.substring(0, 8) || 'N/A'}</span>
                    <span><strong>Solicitante:</strong> {request?.requester || request?.user_id}</span>
                    <span><strong>Departamento:</strong> {request?.department || request?.departamento_solicitante}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Preview MVP v2.0
                </Badge>
              </div>
            </div>
          </div>

          {/* Navegación expandida */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="px-6">
          	<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                 <TabsList className={userRole === "lider_dominio" ? "grid w-full grid-cols-5 bg-transparent p-0 h-auto" : "grid w-full grid-cols-3 bg-transparent p-0 h-auto"}>
                  <TabsTrigger
                    value="summary"
                    className="flex items-center justify-center py-4 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="font-medium">Detalles</span>
                  </TabsTrigger>
                  {userRole === "lider_dominio" && (
                  	<TabsTrigger
                    value="ai-analysis"
                    className="flex items-center justify-center py-4 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    <span className="font-medium">IA Analysis</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      v2.0
                    </Badge>
                  	</TabsTrigger>
                  )}
                  <TabsTrigger
                    value="collaboration"
                    className="flex items-center justify-center py-4 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium">Colaboración</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      v2.0
                    </Badge>
                  </TabsTrigger>
                  {userRole === "lider_dominio" && (
                  	<TabsTrigger
                    value="planning"
                    className="flex items-center justify-center py-4 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    <span className="font-medium">Planificación (IA)</span>
                    <Badge variant="outline" className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      v2.0
                    </Badge>
                  	</TabsTrigger>
                  )}
                  <TabsTrigger
                    value="actions"
                    className="flex items-center justify-center py-4 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="font-medium">Gestión</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <div className="h-full overflow-y-auto p-6">
                
                {/* Tab 1: Detalles de Solicitud - DATOS REALES */}
                <TabsContent value="summary" className="space-y-6 mt-0 h-full">
                  <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Información Principal - REAL */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          Resumen de la Solicitud
                          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-300">
                            Datos Reales
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Problema a resolver:</h4>
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                            {request?.description || request?.problem || request?.problema_principal || "No especificado"}
                          </p>
                        </div>
                        
                        {(request?.impact || request?.objective || request?.objetivo_esperado) && (
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Objetivo esperado:</h4>
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                              {request?.impact || request?.objective || request?.objetivo_esperado}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                              <User className="h-4 w-4 mr-2 text-blue-600" />
                              Solicitante
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request?.requester || request?.user_id}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                              <Building className="h-4 w-4 mr-2 text-blue-600" />
                              Departamento
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request?.department || request?.departamento_solicitante}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                              Score Real
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request?.score || request?.score_estimado || 'Sin evaluar'} / 100
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                              Días Esperando
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {request?.daysInStatus || request?.days_since_created || 0} días
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detalles Técnicos - REAL */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <Database className="h-5 w-5 mr-2 text-blue-600" />
                          Información Técnica
                          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-300">
                            De la BD
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Plataformas reales */}
                        {(request?.platforms || request?.plataformas_involucradas) && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Plataformas Involucradas</h4>
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(request?.platforms) ? request.platforms : 
                                Array.isArray(request?.plataformas_involucradas) ? request.plataformas_involucradas :
                                typeof request?.plataformas_involucradas === 'string' ? 
                                JSON.parse(request.plataformas_involucradas) : [])
                                .map((platform: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          {(request?.frequency || request?.frecuencia_uso) && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Frecuencia</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {request?.frequency || request?.frecuencia_uso}
                              </p>
                            </div>
                          )}
                          {(request?.timeframe || request?.plazo_deseado) && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Plazo</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {(request?.timeframe || request?.plazo_deseado)?.replace('_', ' ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Tab 2: Análisis IA - MOCKUP FUTURO (solo líder de dominio) */}
                {userRole === "lider_dominio" && (
                	<TabsContent value="ai-analysis" className="space-y-6 mt-0 h-full">
                  <div className="max-w-4xl mx-auto space-y-6">
                    
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-l-4 border-l-purple-500">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <Brain className="h-5 w-5 mr-2 text-purple-600" />
                          Análisis Inteligente con IA
                          <Badge variant="outline" className="ml-auto bg-purple-50 text-purple-700 border-purple-300">
                            Próximamente en v2.0
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Recomendación IA:</h4>
                            <Badge className="bg-green-100 text-green-700">
                              {futureFeatures.aiAnalysis.confidence}% confianza
                            </Badge>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200">
                            {futureFeatures.aiAnalysis.recommendation}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg opacity-75">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Costo Estimado</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {futureFeatures.aiAnalysis.estimatedCost}
                            </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg opacity-75">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Tiempo Estimado</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {futureFeatures.aiAnalysis.timeline}
                            </p>
                          </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-yellow-600" />
                            Funcionalidades Futuras v2.0:
                          </h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Análisis predictivo basado en proyectos similares</li>
                            <li>• Estimación automática de costos y recursos</li>
                            <li>• Detección de riesgos y dependencias</li>
                            <li>• Recomendaciones de mejora automáticas</li>
                          </ul>
                        </div>

                        <div className="flex justify-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                disabled 
                                className="opacity-50 cursor-not-allowed"
                                onClick={() => handleFutureFeature('AI Analysis')}
                              >
                                <Brain className="h-4 w-4 mr-2" />
                                Generar Análisis Completo
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Disponible en MVP v2.0</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                	</TabsContent>
                )}

                {/* Tab 3: Colaboración - MOCKUP FUTURO */}
                <TabsContent value="collaboration" className="space-y-6 mt-0 h-full">
                  <div className="max-w-4xl mx-auto space-y-6">
                    
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <Users className="h-5 w-5 mr-2 text-blue-600" />
                          Chat Interno del Equipo
                          <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-300">
                            Próximamente en v2.0
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                          {futureFeatures.teamChat.map((msg) => (
                            <div key={msg.id} className="flex items-start space-x-3 opacity-75">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-200 text-blue-800 text-xs">
                                  {msg.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                    {msg.user}
                                  </h4>
                                  <span className="text-xs text-gray-500">
                                    {msg.time}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {msg.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-1">
                                <Textarea
                                  placeholder="Escribe un mensaje al equipo..."
                                  value={chatMessage}
                                  onChange={(e) => setChatMessage(e.target.value)}
                                  disabled
                                  className="opacity-50 cursor-not-allowed"
                                  rows={3}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Chat interno disponible en MVP v2.0</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                disabled 
                                className="opacity-50 cursor-not-allowed"
                                onClick={() => handleFutureFeature('Team Chat')}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Disponible en MVP v2.0</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Chat con solicitante - FUTURO */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                          Comunicación con Solicitante
                          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-300">
                            Próximamente en v2.0
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Funcionalidades v2.0:</h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Chat directo con el solicitante</li>
                            <li>• Notificaciones automáticas por Teams/Email</li>
                            <li>• Historial completo de conversaciones</li>
                            <li>• Sistema de tickets para seguimiento</li>
                          </ul>
                        </div>
                        
                        <div className="flex justify-center mt-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                disabled 
                                className="opacity-50 cursor-not-allowed"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Iniciar Conversación
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Chat directo disponible en MVP v2.0</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Tab 4: Planificación - MOCKUP FUTURO (solo líder de dominio) */}
                {userRole === "lider_dominio" && (
                	<TabsContent value="planning" className="space-y-6 mt-0 h-full">
                  <div className="max-w-4xl mx-auto space-y-6">
                    
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-l-4 border-l-orange-500">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <Rocket className="h-5 w-5 mr-2 text-orange-600" />
                          Planificación Asistida con IA
                          <Badge variant="outline" className="ml-auto bg-orange-50 text-orange-700 border-orange-300">
                            Próximamente en v2.0
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 text-orange-600" />
                            Funcionalidades Avanzadas v2.0:
                          </h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <li>• Subir documentos técnicos para análisis automático</li>
                            <li>• Generación de cronogramas basados en proyectos similares</li>
                            <li>• Estimación de recursos y equipos necesarios</li>
                            <li>• Integración directa con Monday.com para gestión</li>
                            <li>• Reportes PDF profesionales para stakeholders</li>
                            <li>• Análisis de riesgos predictivo</li>
                          </ul>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                disabled 
                                className="opacity-50 cursor-not-allowed h-24 flex-col"
                              >
                                <Upload className="h-6 w-6 mb-2" />
                                Subir Documentos
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Análisis de documentos en MVP v2.0</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                disabled 
                                className="opacity-50 cursor-not-allowed h-24 flex-col"
                              >
                                <Download className="h-6 w-6 mb-2" />
                                Generar Reporte
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Reportes automáticos en MVP v2.0</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                disabled 
                                className="opacity-50 cursor-not-allowed h-24 flex-col"
                              >
                                <Rocket className="h-6 w-6 mb-2" />
                                Enviar a Monday
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Integración Monday.com en MVP v2.0</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                	</TabsContent>
                )}

                {/* Tab 5: Acciones de Gestión - REAL */}
                <TabsContent value="actions" className="space-y-6 mt-0 h-full">
                  <div className="max-w-4xl mx-auto space-y-6">
                    
                    {/* Comentarios del líder anteriores - REAL */}
                    {request?.leader_comments && (
                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardHeader>
                          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                            Comentarios Anteriores
                            <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-300">
                              Datos Reales
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                              {request.leader_comments}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Acciones disponibles - REAL */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <Target className="h-5 w-5 mr-2 text-blue-600" />
                          Acciones de Gestión
                          <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-300">
                            Funcional
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        
                        {/* Comentario del líder - REAL */}
                        <div>
                          <Label htmlFor="leader-comment" className="text-sm font-medium">
                            Agregar comentario:
                          </Label>
                          <Textarea
                            id="leader-comment"
                            placeholder="Escribe tus comentarios, observaciones o instrucciones para el solicitante..."
                            value={leaderComment}
                            onChange={(e) => setLeaderComment(e.target.value)}
                            className="mt-2 min-h-[120px]"
                          />
                        </div>

                        {/* Botones de acción REALES */}
                        <div className="flex flex-wrap gap-3 pt-4">
                          {request?.status !== 'approved' && (
                            <Button 
                              onClick={handleApprove} 
                              disabled={isSubmitting}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {request?.clasificacion_sugerida === 'proyecto' && userRole === 'lider_dominio' 
                              ? 'Aprobar y Elevar' 
                              : 'Aprobar'}
                            </Button>
                          )}
                          
                          {request?.status !== 'rejected' && (
                            <Button
                              variant="outline"
                              onClick={handleReject}
                              disabled={isSubmitting}
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rechazar
                            </Button>
                          )}
                          
                          {request?.status !== 'on_hold' && (
                            <Button
                              variant="outline"
                              onClick={handlePause}
                              disabled={isSubmitting}
                              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Poner en Espera
                            </Button>
                          )}
                        </div>

                        {/* Info sobre el flujo - REAL */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            ℹ️ Información sobre el flujo:
                          </h4>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• <strong>Requerimientos:</strong> Pueden ser aprobados directamente por líderes de dominio</li>
                            <li>• <strong>Proyectos:</strong> Requieren aprobación gerencial adicional</li>
                            <li>• <strong>Comentarios:</strong> Serán visibles para el solicitante</li>
                            <li>• <strong>Estados:</strong> Los cambios se notificarán automáticamente</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
