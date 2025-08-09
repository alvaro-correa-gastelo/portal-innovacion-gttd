"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Zap,
  AlertTriangle,
  TrendingUp,
  Database,
  Users
} from "lucide-react"
import { StatusManager } from "@/components/status-manager"
import { BidirectionalChat } from "@/components/bidirectional-chat"
import { InternalCollabChat } from "@/components/internal-collab-chat"
import { getEffectivePriorityFromRequest, getPriorityBadgeClass, getPriorityLabel } from "@/lib/priority-helper"

interface RealisticLeaderModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
  userRole?: "lider_dominio" | "lider_gerencial"
}

export function RealisticLeaderModal({ isOpen, onClose, request, userRole = "lider_dominio" }: RealisticLeaderModalProps) {
  const [activeTab, setActiveTab] = useState("summary")
  const [leaderComment, setLeaderComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Helpers numéricos robustos
  const toNum = (v: any, d = 0) => {
    const n = typeof v === 'string' ? parseFloat(v) : (typeof v === 'number' ? v : d)
    return Number.isFinite(n) ? n : d
  }

  // Clasificación para mostrar, siempre consistente con BD y con heurística por score
  const getDisplayClassification = () => {
    const finalCls = request?.clasificacion_final || request?.final_classification
    const suggested = request?.clasificacion_sugerida || request?.classification
    const base = finalCls || suggested
    if (base) return base
    // Heurística: puntaje alto => proyecto
    return effectiveScore >= 80 ? 'proyecto' : 'requerimiento'
  }

  // Score efectivo desde varias fuentes posibles
  const effectiveScore = (() => {
    // posibles ubicaciones
    const fromFlat = request?.score ?? request?.score_estimado ?? request?.scoring_total
    const fromObj = request?.scoring?.total
    return Math.max(toNum(fromFlat, 0), toNum(fromObj, 0))
  })()

  // Parseo seguro del análisis técnico
  const getTechnicalObject = () => {
    const ta = request?.technical_analysis
    if (!ta) return null
    try {
      if (typeof ta === 'string') {
        const trimmed = ta.trim()
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          return JSON.parse(trimmed)
        }
        // cadenas no JSON: retornar null para usar fallback pre
        return null
      }
      if (typeof ta === 'object') return ta
      return null
    } catch {
      return null
    }
  }

  // Estados para edición - Lógica correcta de valores efectivos
  const getEffectiveClassification = () => {
    // Si el líder ya modificó, usar su valor final
    if (request?.clasificacion_final || request?.final_classification) {
      return request.clasificacion_final || request.final_classification
    }
    // Si no ha modificado, usar la sugerencia de IA
    return request?.clasificacion_sugerida || request?.classification || 'requerimiento'
  }
  
  const getEffectivePriority = () => {
    // Si el líder ya modificó, usar su valor final 
    if (request?.prioridad_final || request?.final_priority) {
      return request.prioridad_final || request.final_priority
    }
    // Si no ha modificado, usar la sugerencia de IA
    return request?.prioridad_sugerida || request?.priority || 'P2'
  }

  // Función para determinar si el líder ya modificó los valores
  const hasLeaderOverride = () => {
    return request?.leader_override === true || 
           (request?.clasificacion_final && request?.clasificacion_final !== request?.clasificacion_sugerida) ||
           (request?.prioridad_final && request?.prioridad_final !== request?.prioridad_sugerida)
  }
  
  const [editableClassification, setEditableClassification] = useState(getEffectiveClassification())
  const [editablePriority, setEditablePriority] = useState(getEffectivePriority())
  const [hasChanges, setHasChanges] = useState(false)

  // Console log para debugging
  console.log('🔍 Modal Debug Info:', {
    clasificacion_sugerida: request?.clasificacion_sugerida,
    clasificacion_final: request?.clasificacion_final,
    classification: request?.classification,
    final_classification: request?.final_classification,
    effectiveScore,
    editableClassification,
    getEffectiveResult: getEffectiveClassification()
  })

  if (!isOpen || !request) return null

  // Funciones de acción reales
  const handleStatusChange = async (newStatus: string, comment?: string) => {
    setIsSubmitting(true)
    try {
      const finalComment = comment || leaderComment
      const response = await fetch(`/api/requests/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          leader_comments: finalComment,
          leader_id: 'current_leader@utp.edu.pe', // TODO: obtener del contexto
          action: newStatus === 'approved' ? 'approve' : 
                 newStatus === 'rejected' ? 'reject' : 'update'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`Solicitud ${newStatus}:`, result.message)
        
        // Actualizar el request local para mostrar los comentarios inmediatamente
        request.leader_comments = finalComment
        request.status = newStatus
        
        // Limpiar el campo de comentario
        setLeaderComment('')
        
        // Mostrar un mensaje de éxito
        alert(`✅ Solicitud ${newStatus === 'approved' ? 'aprobada' : newStatus === 'rejected' ? 'rechazada' : 'actualizada'} correctamente.${finalComment ? '\nComentario guardado: ' + finalComment : ''}`)
        
        // Cerrar modal después de un breve delay para que el usuario vea la actualización
        setTimeout(() => {
          onClose()
          // Emitir evento SPA para refrescar todos los listados sin recargar
          try { window.dispatchEvent(new CustomEvent('requests:refresh')) } catch {}
        }, 2000)
      } else {
        const error = await response.json()
        alert('Error al actualizar la solicitud: ' + (error.message || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error updating request:', error)
      alert('Error de conexión. Por favor, intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para guardar cambios de clasificación y prioridad
  const handleSaveChanges = async () => {
    setIsSubmitting(true)
    try {
      // Al guardar ajustes, mover al flujo normal según clasificación final
      const targetStatus = (editableClassification === 'proyecto')
        ? 'pending_approval'
        : 'in_evaluation'

      const comment = `Clasificación final: ${editableClassification}. Prioridad final: ${editablePriority}.` +
        (targetStatus === 'pending_approval'
          ? ' Enviado a aprobación gerencial.'
          : ' En evaluación del líder de dominio.')

      const response = await fetch(`/api/requests/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          leader_comments: comment,
          clasificacion_final: editableClassification,
          prioridad_final: editablePriority,
          override_reason: 'Ajustado por criterio del líder de dominio',
          leader_id: 'current_leader@utp.edu.pe',
          action: 'update_classification'
        })
      })
      
      if (response.ok) {
        console.log('Cambios guardados exitosamente')
        setHasChanges(false)
        // Actualizar el request local para reflejar los cambios inmediatos
        request.final_classification = editableClassification
        request.clasificacion_final = editableClassification
        request.prioridad_final = editablePriority
        request.leader_override = true
        request.status = targetStatus
        request.leader_comments = comment

        // Notificar y cerrar
        alert('✅ Ajustes guardados y solicitud movida al flujo correspondiente.')
        setTimeout(() => {
          try { window.dispatchEvent(new CustomEvent('requests:refresh')) } catch {}
          onClose()
        }, 1000)
      } else {
        const err = await response.json().catch(() => ({}))
        alert('Error al guardar los cambios. ' + (err.message || 'Intenta de nuevo.'))
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      alert('Error de conexión. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = () => {
    // Validar que la solicitud no esté ya aprobada o rechazada
    if (request?.status === 'approved') {
      alert('⚠️ Esta solicitud ya ha sido aprobada previamente. No se puede aprobar nuevamente.')
      return
    }
    
    if (request?.status === 'rejected') {
      alert('⚠️ Esta solicitud fue rechazada. Para aprobarla debe cambiar primero el estado a "En Evaluación" usando la pestaña Estados.')
      return
    }
    
    // CORREGIDO: Usar el valor efectivo ACTUAL de BD, NO el dropdown editable
    const currentClassification = getEffectiveClassification()
    const currentPriority = getEffectivePriority()
    
    // Construir el comentario final priorizando el comentario del líder
    let finalComment = ''
    
    if (leaderComment.trim()) {
      // Si hay comentario manual, usarlo como principal
      finalComment = leaderComment.trim()
    }
    
    // Agregar información técnica solo si es necesario
    if (currentClassification === 'proyecto' && userRole === 'lider_dominio') {
      // Proyectos requieren aprobación gerencial
      const technicalInfo = `\n\n---\nINFO: Aprobado por líder de dominio. Requiere aprobación gerencial.\nClasificación: ${currentClassification} | Prioridad: ${currentPriority}`
      
      if (finalComment) {
        finalComment += technicalInfo
      } else {
        finalComment = `Aprobado por líder de dominio. Requiere aprobación gerencial.\n\nClasificación: ${currentClassification}\nPrioridad: ${currentPriority}`
      }
      
      handleStatusChange('pending_approval', finalComment)
    } else {
      // Requerimientos pueden ser aprobados directamente
      const technicalInfo = `\n\n---\nINFO: Aprobado como ${currentClassification} con prioridad ${currentPriority}.`
      
      if (finalComment) {
        finalComment += technicalInfo
      } else {
        finalComment = `Aprobado como ${currentClassification} con prioridad ${currentPriority}.`
      }
      
      handleStatusChange('approved', finalComment)
    }
  }

  const handleReject = () => {
    // Validar que la solicitud no esté ya rechazada o aprobada
    if (request?.status === 'rejected') {
      alert('⚠️ Esta solicitud ya ha sido rechazada previamente. No se puede rechazar nuevamente.')
      return
    }
    
    if (request?.status === 'approved') {
      alert('⚠️ Esta solicitud ya fue aprobada. Para rechazarla debe cambiar primero el estado a "En Evaluación" usando la pestaña Estados.')
      return
    }
    
    if (leaderComment.trim()) {
      handleStatusChange('rejected', leaderComment)
    } else {
      alert('Por favor agregue un comentario explicando el motivo del rechazo')
    }
  }

  const handlePause = () => {
    let finalComment = ''
    
    if (leaderComment.trim()) {
      finalComment = leaderComment.trim()
    } else {
      finalComment = 'Solicitud pausada temporalmente por el líder de dominio.'
    }
    
    handleStatusChange('on_hold', finalComment)
  }

  type StatusKey = 'pending_approval' | 'pending_technical_analysis' | 'in_evaluation' | 'approved' | 'rejected' | 'on_hold'
  const getStatusBadgeColor = (status: string) => {
    const colors: Record<StatusKey, string> = {
      pending_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      pending_technical_analysis: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      in_evaluation: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      on_hold: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
    const key = (status as StatusKey)
    return colors[key] ?? colors['pending_approval']
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<StatusKey, string> = {
      pending_approval: 'Pendiente Aprobación',
      pending_technical_analysis: 'Análisis Técnico',
      in_evaluation: 'En Evaluación',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      on_hold: 'En Espera'
    }
    const key = (status as StatusKey)
    return labels[key] ?? status
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 w-full h-full max-w-5xl max-h-[90vh] rounded-lg shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
                    getDisplayClassification() === "proyecto"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  }>
                    {getDisplayClassification() === "proyecto" ? "Proyecto" : "Requerimiento"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span><strong>ID:</strong> {request?.id?.substring(0, 8) || 'N/A'}</span>
                  <span><strong>Solicitante:</strong> {request?.requester || request?.user_id}</span>
                  <span><strong>Departamento:</strong> {request?.department || request?.departamento_solicitante}</span>
                  <span><strong>Días esperando:</strong> {request?.daysInStatus || request?.days_since_created || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* CORREGIDO: Líder de Dominio = 5 tabs, Líder Gerencial = 3 tabs */}
              <TabsList className={userRole === "lider_dominio" ? "grid w-full grid-cols-5 bg-transparent p-0 h-auto" : "grid w-full grid-cols-3 bg-transparent p-0 h-auto"}>
                
                {/* Tab 1: Detalles - Ambos roles */}
                <TabsTrigger
                  value="summary"
                  className="flex items-center justify-center py-4 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="font-medium">Detalles</span>
                </TabsTrigger>
                
                {/* Tab 2: Análisis IA - SOLO Líder de Dominio */}
                {userRole === "lider_dominio" && (
                  <TabsTrigger
                    value="technical"
                    className="flex items-center justify-center py-4 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    <span className="font-medium">Análisis IA</span>
                  </TabsTrigger>
                )}
                
                {/* Tab 3: Planificación - SOLO Líder de Dominio */}
                {userRole === "lider_dominio" && (
                  <TabsTrigger
                    value="planning"
                    className="flex items-center justify-center py-4 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span className="font-medium">Planificación</span>
                  </TabsTrigger>
                )}
                
                {/* Tab 4: Chat - AMBOS roles (dominio y gerencial) */}
                <TabsTrigger
                  value="messages"
                  className="flex items-center justify-center py-4 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="font-medium">Chat</span>
                </TabsTrigger>
                
                {/* Tab último: Gestión/Aprobación - Ambos roles */}
                <TabsTrigger
                  value="actions"
                  className="flex items-center justify-center py-4 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 hover:bg-white/50 dark:hover:bg-gray-900/50 transition-all"
                >
                  <Target className="h-4 w-4 mr-2" />
                  <span className="font-medium">{userRole === "lider_dominio" ? "Gestión" : "Aprobación"}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="h-full overflow-y-auto p-6" style={{maxHeight: 'calc(100vh - 280px)'}}>
              
              {/* Tab 1: Detalles de Solicitud */}
              <TabsContent value="summary" className="space-y-6 mt-0 h-full">
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  {/* Información Principal */}
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Resumen de la Solicitud
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
                            Prioridad
                          </h4>
                          <Badge
                            variant="secondary"
                            className={getPriorityBadgeClass(getEffectivePriorityFromRequest(request))}
                          >
                            {getPriorityLabel(getEffectivePriorityFromRequest(request))}
                          </Badge>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            Score Estimado
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {effectiveScore || 'Sin evaluar'} / 100
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab 2: Información Técnica */}
              <TabsContent value="technical" className="space-y-6 mt-0 h-full">
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <Database className="h-5 w-5 mr-2 text-blue-600" />
                        Detalles Técnicos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      {/* Beneficiarios */}
                      {(request?.beneficiaries || request?.beneficiarios) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Beneficiarios:</h4>
                          <p className="text-gray-800 dark:text-gray-200">
                            {request?.beneficiaries || request?.beneficiarios}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Plataformas */}
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
                                ))
                              }
                            </div>
                          </div>
                        )}

                        {/* Frecuencia */}
                        {(request?.frequency || request?.frecuencia_uso) && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Frecuencia de Uso</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {request?.frequency || request?.frecuencia_uso}
                            </p>
                          </div>
                        )}

                        {/* Plazo */}
                        {(request?.timeframe || request?.plazo_deseado) && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Plazo Deseado</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {(request?.timeframe || request?.plazo_deseado)?.replace('_', ' ')}
                            </p>
                          </div>
                        )}

                        {/* Clasificación */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Clasificación</h4>
                          <Badge variant="secondary" className={
                            getDisplayClassification() === 'proyecto'
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          }>
                            {getDisplayClassification() === 'proyecto' ? 'Proyecto' : 'Requerimiento'}
                          </Badge>
                        </div>
                      </div>

                      {/* Análisis de Scoring Framework */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                          Análisis de Scoring (5 Dimensiones)
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">🎯 Impacto:</span>
                              <span className="font-medium">{toNum(request?.scoring?.impact, Math.round(toNum(request?.score_estimado,0)*0.25))} pts</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">🔄 Frecuencia:</span>
                              <span className="font-medium">{toNum(request?.scoring?.frequency, request?.frecuencia_uso === 'diario' ? 20 : request?.frecuencia_uso === 'semanal' ? 15 : 10)} pts</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">⏳ Urgencia:</span>
                              <span className="font-medium">{toNum(request?.scoring?.urgency, request?.plazo_deseado === '1_mes' ? 20 : request?.plazo_deseado === '3_meses' ? 15 : 10)} pts</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">🧩 Complejidad:</span>
                              <span className="font-medium">{toNum(request?.scoring?.complexity, (request?.plataformas_involucradas?.length || 1) > 2 ? 15 : 10)} pts</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">✅ Completitud:</span>
                              <span className="font-medium">{toNum(request?.scoring?.completeness, (request?.problema_principal && request?.objetivo_esperado) ? 18 : 12)} pts</span>
                            </div>
                            <div className="flex justify-between font-bold text-blue-700 dark:text-blue-300 border-t pt-2">
                              <span>Score Total:</span>
                              <span>{effectiveScore}/100</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estimación de Esfuerzo y ROI */}
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                          Estimación de Esfuerzo
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-700 dark:text-gray-300">Tipo:</span>
                            <p className="font-medium">
                              {getDisplayClassification() === 'proyecto' ? 'Proyecto' : 'Requerimiento'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-700 dark:text-gray-300">Esfuerzo:</span>
                            <p className="font-medium">
                              {getDisplayClassification() === 'proyecto' ? '40-120h' : '<40h'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-700 dark:text-gray-300">ROI Esperado:</span>
                            <p className="font-medium">
                              {(request?.score_estimado || 0) >= 80 ? 'Alto' : 
                               (request?.score_estimado || 0) >= 60 ? 'Medio' : 'Bajo'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Análisis de Capacidad del Equipo */}
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-green-600" />
                          Análisis de Capacidad del Equipo
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">Carga Actual:</span>
                            <Badge className="bg-yellow-100 text-yellow-700">75% ocupado</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">Disponibilidad:</span>
                            <span className="font-medium">2-3 semanas</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-700 dark:text-gray-300">Recursos Sugeridos:</span>
                            <span className="font-medium">
                              {getDisplayClassification() === 'proyecto' ? '1 PM + 2-3 devs' : '1 dev'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recomendación Técnica */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-purple-600" />
                          Recomendación Técnica
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {(request?.score_estimado || 0) >= 80 
                            ? "✅ Prioridad P1/P2: Proyecto estratégico con alto ROI. Coordinar recursos y planificar discovery técnico detallado."
                            : (request?.score_estimado || 0) >= 60
                            ? "⚠️ Prioridad P2/P3: Evaluar en siguiente sprint planning. Considerar refinamiento de requerimientos."
                            : "🔍 Prioridad P4: Requiere más información o puede ser candidato para backlog futuro."
                          }
                        </p>
                      </div>

                      {/* Análisis Técnico Original si existe */}
                      {request?.technical_analysis && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Análisis Técnico Detallado:</h4>
                          {(() => {
                            const obj = getTechnicalObject()
                            if (!obj) {
                              return (
                                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                  {typeof request.technical_analysis === 'string' 
                                    ? request.technical_analysis 
                                    : JSON.stringify(request.technical_analysis, null, 2)}
                                </pre>
                              )
                            }

                            // Estructura amigable para claves comunes
                            const Section = ({title, children}: any) => (
                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{title}</h5>
                                <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
                              </div>
                            )

                            const renderList = (items: any) => {
                              const arr = Array.isArray(items) ? items : typeof items === 'string' ? [items] : []
                              return (
                                <ul className="list-disc pl-5 space-y-1">
                                  {arr.map((it, idx) => <li key={idx}>{String(it)}</li>)}
                                </ul>
                              )
                            }

                            return (
                              <div className="space-y-3">
                                {obj.risk_items && (
                                  <Section title="Riesgos">{renderList(obj.risk_items)}</Section>
                                )}
                                {obj.dependencies && (
                                  <Section title="Dependencias">{renderList(obj.dependencies)}</Section>
                                )}
                                {obj.suggested_envs && (
                                  <Section title="Entornos Sugeridos">{renderList(obj.suggested_envs)}</Section>
                                )}
                                {obj.affected_systems && (
                                  <Section title="Sistemas Afectados">{renderList(obj.affected_systems)}</Section>
                                )}
                                {obj.compliance_flags && (
                                  <Section title="Banderas de Cumplimiento">{renderList(obj.compliance_flags)}</Section>
                                )}
                                {obj.suggestions && (
                                  <Section title="Sugerencias">{renderList(obj.suggestions)}</Section>
                                )}
                                {/* Fallback: mostrar resto de claves no listadas arriba */}
                                <details className="mt-2">
                                  <summary className="cursor-pointer text-xs text-gray-500">Ver JSON completo</summary>
                                  <pre className="text-xs mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                    {JSON.stringify(obj, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab 3: Planificación */}
              <TabsContent value="planning" className="space-y-6 mt-0 h-full">
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <Users className="h-5 w-5 mr-2 text-purple-600" />
                        Planificación y Recursos
                        <Badge variant="outline" className="ml-auto bg-purple-50 text-purple-700 border-purple-300">
                          Funcional
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Planifica recursos, equipo y estrategia de implementación
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Análisis de Recursos */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-blue-600" />
                          Análisis de Recursos Necesarios
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Equipo Sugerido:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {editableClassification === 'proyecto' 
                                ? '• 1 Project Manager\n• 2-3 Desarrolladores\n• 1 QA/Tester\n• 1 DevOps (si aplica)' 
                                : '• 1 Desarrollador Senior\n• 1 QA (para validación)'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimación Temporal:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {editableClassification === 'proyecto' 
                                ? '6-12 semanas (depende de complejidad)' 
                                : '2-4 semanas'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Roadmap de Implementación */}
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-green-600" />
                          Roadmap de Implementación
                        </h4>
                        <div className="space-y-3">
                          {editableClassification === 'proyecto' ? (
                            <>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">1</div>
                                <div>
                                  <p className="font-medium text-sm">Discovery & Análisis (1-2 semanas)</p>
                                  <p className="text-xs text-gray-600">Refinamiento de requisitos, arquitectura técnica</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">2</div>
                                <div>
                                  <p className="font-medium text-sm">Desarrollo & Testing (4-8 semanas)</p>
                                  <p className="text-xs text-gray-600">Implementación por sprints, testing continuo</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">3</div>
                                <div>
                                  <p className="font-medium text-sm">Deploy & Monitoreo (1-2 semanas)</p>
                                  <p className="text-xs text-gray-600">Despliegue gradual, capacitación, seguimiento</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">1</div>
                                <div>
                                  <p className="font-medium text-sm">Análisis Rápido (2-3 días)</p>
                                  <p className="text-xs text-gray-600">Clarificar requisitos específicos</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">2</div>
                                <div>
                                  <p className="font-medium text-sm">Implementación (1-3 semanas)</p>
                                  <p className="text-xs text-gray-600">Desarrollo, testing y despliegue</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Riesgos y Consideraciones */}
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                          Riesgos y Consideraciones
                        </h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                          <li className="flex items-start space-x-2">
                            <span className="text-yellow-600 mt-0.5">⚠️</span>
                            <span>Dependencias con otros sistemas o solicitudes</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-yellow-600 mt-0.5">⚠️</span>
                            <span>Disponibilidad actual del equipo técnico</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-yellow-600 mt-0.5">⚠️</span>
                            <span>Impacto en sistemas productivos</span>
                          </li>
                          {editableClassification === 'proyecto' && (
                            <li className="flex items-start space-x-2">
                              <span className="text-yellow-600 mt-0.5">⚠️</span>
                              <span>Requiere aprobación gerencial antes de iniciar</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Plan de Comunicación */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-purple-600" />
                          Plan de Comunicación
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stakeholders:</p>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• {request?.requester || 'Solicitante'}</li>
                              <li>• {request?.department || 'Departamento'}</li>
                              <li>• Equipo de desarrollo</li>
                              {editableClassification === 'proyecto' && <li>• Gerencia (para aprobación)</li>}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frecuencia de Updates:</p>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <li>• Semanal: Progreso general</li>
                              <li>• Inmediato: Cambios o bloqueos</li>
                              <li>• Al final: Entrega y resultados</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Documento de Planificación Final */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-600" />
                            Documento de Planificación
                          </h4>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                            Para Líder Gerencial
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Este resumen será enviado al líder gerencial para su revisión y aprobación.
                        </p>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded border text-xs">
                          <p className="font-medium mb-2">RESUMEN EJECUTIVO - PLANIFICACIÓN</p>
                          <p><strong>Solicitud:</strong> {request?.title}</p>
                          <p><strong>Clasificación Final:</strong> {editableClassification}</p>
                          <p><strong>Prioridad Final:</strong> {editablePriority}</p>
                          <p><strong>Estimación:</strong> {editableClassification === 'proyecto' ? '6-12 semanas' : '2-4 semanas'}</p>
                          <p><strong>Recursos:</strong> {editableClassification === 'proyecto' ? '1 PM + 2-3 devs + QA' : '1 dev senior + QA'}</p>
                          <p><strong>Riesgos Identificados:</strong> Dependencias técnicas, disponibilidad de equipo</p>
                          <p><strong>Recomendación del Líder de Dominio:</strong> {(request?.score_estimado || 0) >= 80 ? 'Aprobación recomendada' : 'Requiere evaluación adicional'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab 4: Chat - AMBOS roles con subpestañas */}
              <TabsContent value="messages" className="space-y-6 mt-0 h-full">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Sub-tabs: Solicitate vs Colaboración interna */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="border-b border-gray-200 dark:border-gray-700 px-4 pt-4">
                      <Tabs defaultValue="public" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="public">Chat con Solicitante</TabsTrigger>
                          <TabsTrigger value="internal">Colaboración Interna</TabsTrigger>
                        </TabsList>
                        <TabsContent value="public" className="p-4">
                          <BidirectionalChat 
                            requestId={request?.id || request?.session_id || 'demo'}
                            currentUserRole="leader"
                            currentUserName={userRole === "lider_dominio" ? "Líder de Dominio" : "Líder Gerencial"}
                            currentUserEmail="leader@utp.edu.pe"
                          />
                        </TabsContent>
                        <TabsContent value="internal" className="p-4">
                          <InternalCollabChat 
                            requestId={request?.id || request?.session_id || 'demo'}
                            currentUserName={userRole === "lider_dominio" ? "Líder de Dominio" : "Líder Gerencial"}
                            currentUserRole={userRole === "lider_dominio" ? 'lider_dominio' : 'lider_gerencial'}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 5: Estados y Gestión Unificado */}
              <TabsContent value="actions" className="space-y-6 mt-0 h-full">
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  {/* Ajustar Clasificación y Prioridad - EDITABLE */}
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                        Ajustar Sugerencias de IA
                        <Badge variant="outline" className="ml-auto bg-orange-50 text-orange-700 border-orange-300">
                          Editable
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                          💡 <strong>Estas son sugerencias de IA</strong> que puedes ajustar basándote en tu criterio de líder.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Clasificación editable */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              🏷️ Clasificación {hasLeaderOverride() ? 
                                `(Actual: ${getEffectiveClassification()}, IA sugirió: ${request?.clasificacion_sugerida || 'requerimiento'})` : 
                                `(Sugerida por IA: ${request?.clasificacion_sugerida || 'requerimiento'})`
                              }
                            </Label>
                            <Select
                              value={editableClassification}
                              onValueChange={(value) => {
                                setEditableClassification(value)
                                setHasChanges(true)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="requerimiento">
                                  📋 Requerimiento (menor complejidad)
                                </SelectItem>
                                <SelectItem value="proyecto">
                                  🚀 Proyecto (mayor complejidad)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              {editableClassification === 'proyecto' 
                                ? '⚠️ Los proyectos requieren aprobación gerencial adicional'
                                : '✅ Los requerimientos pueden aprobarse directamente'
                              }
                            </p>
                          </div>

                          {/* Prioridad editable */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              ⚡ Prioridad {hasLeaderOverride() ? 
                                `(Actual: ${getEffectivePriority()}, IA sugirió: ${request?.prioridad_sugerida || 'P2'})` : 
                                `(Sugerida por IA: ${request?.prioridad_sugerida || 'P2'})`
                              }
                            </Label>
                            <Select
                              value={editablePriority}
                              onValueChange={(value) => {
                                setEditablePriority(value)
                                setHasChanges(true)
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="P1">
                                  🔴 P1 - Crítica (máxima urgencia)
                                </SelectItem>
                                <SelectItem value="P2">
                                  🟡 P2 - Alta (importante)
                                </SelectItem>
                                <SelectItem value="P3">
                                  🟢 P3 - Media (planificar)
                                </SelectItem>
                                <SelectItem value="P4">
                                  ⚪ P4 - Baja (backlog)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              {editablePriority === 'P1' && '🚨 Atención inmediata requerida'}
                              {editablePriority === 'P2' && '⚡ Prioridad alta para siguiente sprint'}
                              {editablePriority === 'P3' && '📋 Incluir en planificación regular'}
                              {editablePriority === 'P4' && '💤 Considerar para backlog futuro'}
                            </p>
                          </div>
                        </div>

                        {/* Botón para guardar cambios */}
                        {hasChanges && (
                          <div className="flex justify-end mt-4">
                            <Button
                              onClick={handleSaveChanges}
                              disabled={isSubmitting}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                              size="sm"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Guardar Ajustes
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comentarios del líder anteriores */}
                  {request?.leader_comments && (
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                          <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                          Comentarios Anteriores
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

                  {/* Acciones disponibles */}
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                        <Target className="h-5 w-5 mr-2 text-blue-600" />
                        Acciones de Gestión
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      
                      {/* Comentario del líder */}
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

                      {/* Botones de acción */}
                      <div className="flex flex-wrap gap-3 pt-4">
                        {request?.status !== 'approved' && (
                          <Button 
                            onClick={handleApprove} 
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {/* CORREGIDO: Usar la clasificación EFECTIVA ACTUAL de BD, NO el dropdown */}
                            {getEffectiveClassification() === 'proyecto' && userRole === 'lider_dominio' 
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

                      {/* Estados rápidos */}
                      <div className="pt-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Estados rápidos</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            disabled={isSubmitting || request?.status === 'in_evaluation'}
                            onClick={() => handleStatusChange('in_evaluation', leaderComment || 'Estado establecido a "En Evaluación" por el líder de dominio.')}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            En Evaluación
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={isSubmitting || request?.status === 'pending_technical_analysis'}
                            onClick={() => handleStatusChange('pending_technical_analysis', leaderComment || 'Derivado a análisis técnico por el líder de dominio.')}
                          >
                            <Database className="h-4 w-4 mr-2" />
                            Análisis Técnico
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={isSubmitting || request?.status === 'pending_approval'}
                            onClick={() => handleStatusChange('pending_approval', leaderComment || 'Enviado a aprobación gerencial por el líder de dominio.')}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Enviar a Aprobación
                          </Button>
                          {request?.status === 'on_hold' && (
                            <Button
                              variant="outline"
                              disabled={isSubmitting}
                              onClick={() => handleStatusChange('in_evaluation', leaderComment || 'Se retira la pausa y vuelve a evaluación.')}
                            >
                              Quitar Pausa
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Info sobre el flujo */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
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
  )
}
