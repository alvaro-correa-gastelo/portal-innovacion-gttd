'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Eye,
  FileText,
  Sparkles,
  Database,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  Settings,
  RefreshCw
} from "lucide-react"

// Importar los modales
import { UserRequestDetailModal } from "@/components/user-request-detail-modal"
import { RealisticLeaderModal } from "@/components/realistic-leader-modal"
import { PreviewLeaderModal } from "@/components/preview-leader-modal"
import { PreviewManagerModal } from "@/components/preview-manager-modal"

export default function TestModalsPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  type RequestKey = 'financiero' | 'inventario' | 'crm' | 'dashboard'
  const [selectedRequestType, setSelectedRequestType] = useState<RequestKey>('financiero')
  const [requestIdInput, setRequestIdInput] = useState('')
  const [fetchedData, setFetchedData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Diferentes tipos de solicitudes para testing completo
  const requestTypes = {
    financiero: {
      id: "b0ceef3f-fa8d-41ab-aa72-dde7fd2f5db5",
      session_id: "aa91a9b2-39cf-4d49-a236-224bc461615d",
      user_id: "test.user@utp.edu.pe",
      titulo_solicitud: "Automatización de reportes financieros",
      problema_principal: "Los reportes financieros se generan manualmente cada mes, tomando 3 días completos",
      objetivo_esperado: "Automatizar la generación para reducir tiempo a 2 horas",
      beneficiarios: "Área de Finanzas, Contabilidad, Gerencia",
      plataformas_involucradas: ["Oracle ERP", "Excel", "Power BI"],
      frecuencia_uso: "mensual",
      plazo_deseado: "3_meses",
      departamento_solicitante: "Finanzas",
      score_estimado: 85,
      clasificacion_sugerida: "proyecto",
      prioridad_sugerida: "P1",
      status: "approved",
      leader_comments: "Aprobado por líder de dominio. Requiere aprobación gerencial.\n\nClasificación: proyecto | Prioridad: P1",
      clasificacion_final: "proyecto",
      prioridad_final: "P1",
      leader_override: false
    },
    inventario: {
      id: "c1d2e3f4-a5b6-7c8d-e9f0-a1b2c3d4e5f6",
      session_id: "bb82b0c3-40d5-5e6a-b347-335ce572726e",
      user_id: "maria.garcia@utp.edu.pe",
      titulo_solicitud: "Sistema de gestión de inventarios TI",
      problema_principal: "No tenemos control centralizado del inventario de equipos tecnológicos, perdemos equipos y no sabemos su estado actual",
      objetivo_esperado: "Implementar sistema que permita rastreo completo de todos los activos tecnológicos con códigos QR",
      beneficiarios: "Departamento de TI, Administración, Contabilidad",
      plataformas_involucradas: ["Sistema de Activos", "Excel", "Aplicación móvil"],
      frecuencia_uso: "diario",
      plazo_deseado: "6_meses",
      departamento_solicitante: "Tecnología",
      score_estimado: 92,
      clasificacion_sugerida: "requerimiento",
      prioridad_sugerida: "P2",
      status: "in_evaluation",
      leader_comments: "En proceso de evaluación por el equipo técnico. Requiere análisis de viabilidad y recursos disponibles.\n\nClasificación: requerimiento | Prioridad: P2",
      clasificacion_final: "requerimiento",
      prioridad_final: "P2",
      leader_override: false
    },
    crm: {
      id: "d4e5f6a7-b8c9-0d1e-f2a3-b4c5d6e7f8a9",
      session_id: "cc93c1d4-51e6-6f7b-c458-446df683837f",
      user_id: "carlos.mendoza@utp.edu.pe",
      titulo_solicitud: "Integración CRM con sistema académico",
      problema_principal: "Los datos de estudiantes están dispersos en múltiples sistemas, duplicamos trabajo y perdemos oportunidades de seguimiento",
      objetivo_esperado: "Unificar toda la información estudiantil en un CRM centralizado con sincronización automática",
      beneficiarios: "Admisiones, Registro Académico, Marketing, Bienestar Estudiantil",
      plataformas_involucradas: ["CRM Salesforce", "Sistema Académico", "Portal Estudiantes", "Base de datos Oracle"],
      frecuencia_uso: "diario",
      plazo_deseado: "1_año",
      departamento_solicitante: "Admisiones",
      score_estimado: 78,
      clasificacion_sugerida: "proyecto",
      prioridad_sugerida: "P3",
      status: "rejected",
      leader_comments: "Solicitud rechazada por alta complejidad técnica y falta de recursos especializados en el equipo actual. Se requiere más análisis de viabilidad.",
      clasificacion_final: "proyecto",
      prioridad_final: "P4",
      leader_override: true
    },
    dashboard: {
      id: "e7f8a9b0-c1d2-3e4f-a5b6-c7d8e9f0a1b2",
      session_id: "dd04d2e5-62f7-708c-d569-557ef794948a",
      user_id: "ana.lopez@utp.edu.pe",
      titulo_solicitud: "Dashboard ejecutivo de métricas académicas",
      problema_principal: "Los directivos no tienen acceso rápido a métricas clave, los reportes se generan manualmente cada semana",
      objetivo_esperado: "Dashboard en tiempo real con KPIs académicos, financieros y operacionales",
      beneficiarios: "Rectorado, Vicerrectorado, Directores de Escuela, Gerencia",
      plataformas_involucradas: ["Power BI", "SQL Server", "Oracle ERP", "Sistema Académico"],
      frecuencia_uso: "diario",
      plazo_deseado: "2_meses",
      departamento_solicitante: "Rectorado",
      score_estimado: 95,
      clasificacion_sugerida: "requerimiento",
      prioridad_sugerida: "P1",
      status: "pending_approval",
      leader_comments: null,
      clasificacion_final: null,
      prioridad_final: null,
      leader_override: false
    }
  }

  // Función para obtener los datos actuales según selección
  const getCurrentRequestData = () => {
    const baseData = requestTypes[selectedRequestType]
    return {
      ...baseData,
      // Campos calculados/mapeados para compatibilidad
      title: baseData.titulo_solicitud,
      problem: baseData.problema_principal,
      objective: baseData.objetivo_esperado,
      department: baseData.departamento_solicitante,
      requester: baseData.user_id,
      classification: baseData.clasificacion_sugerida,
      priority: baseData.prioridad_sugerida,
      score: baseData.score_estimado,
      platforms: baseData.plataformas_involucradas,
      frequency: baseData.frecuencia_uso,
      timeframe: baseData.plazo_deseado,
      days_since_created: 2,
      daysInStatus: 2,
      submissionDate: "06/08/2025",
      estimatedBudget: `$${baseData.score_estimado * 1000}`,
      impact: baseData.objetivo_esperado,
      description: baseData.problema_principal,
      created_at: "2025-08-06T05:23:16.931928Z",
      updated_at: "2025-08-08T17:21:53.636696Z",
      technical_analysis: null,
      override_reason: "Ajustado por criterio del líder de dominio"
    }
  }

  // Datos de ejemplo basados en tu estructura real de BD
  const sampleRequestData = getCurrentRequestData()

  const currentData = fetchedData || sampleRequestData

  const handleFetchById = async () => {
    if (!requestIdInput) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/requests/${requestIdInput}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Error desconocido')
      // json.data ya viene mapeado por el endpoint
      setFetchedData(json.data)
    } catch (e: any) {
      setError(e?.message || 'Error al cargar')
      setFetchedData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (modalType: string) => {
    setActiveModal(modalType)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          🧪 Prueba de Modales con Datos Reales
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compara los diferentes tipos de modales basados en tu estructura de BD real
        </p>
        <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-300">
          Datos reales de: conversation_messages, session_states, requests
        </Badge>
      </div>

      {/* Selector de Tipo de Solicitud */}
      <Card className="mb-6 bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-900 dark:text-yellow-100">
            <Settings className="h-5 w-5 mr-2" />
            Selector de Solicitud para Testing
          </CardTitle>
          <CardDescription>
            Cambia el tipo de solicitud para probar diferentes estados y escenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de Solicitud:
            </label>
            <Select value={selectedRequestType} onValueChange={(v) => setSelectedRequestType(v as RequestKey)}>
              <SelectTrigger className="w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financiero">
                  📊 Reportes Financieros (Proyecto Aprobado)
                </SelectItem>
                <SelectItem value="inventario">
                  📱 Sistema Inventarios TI (Requerimiento en Evaluación)
                </SelectItem>
                <SelectItem value="crm">
                  🤝 CRM Académico (Proyecto Rechazado)
                </SelectItem>
                <SelectItem value="dashboard">
                  📈 Dashboard Ejecutivo (Pendiente Aprobación)
                </SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedRequestType('financiero')}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
            <div className={`p-3 rounded-lg ${selectedRequestType === 'financiero' ? 'bg-green-100 border border-green-300' : 'bg-gray-100'}`}>
              <div className="font-semibold">📊 Financiero</div>
              <div className="text-gray-600">Proyecto • Aprobado • P1</div>
            </div>
            <div className={`p-3 rounded-lg ${selectedRequestType === 'inventario' ? 'bg-green-100 border border-green-300' : 'bg-gray-100'}`}>
              <div className="font-semibold">📱 Inventarios</div>
              <div className="text-gray-600">Requerimiento • Evaluación • P2</div>
            </div>
            <div className={`p-3 rounded-lg ${selectedRequestType === 'crm' ? 'bg-green-100 border border-green-300' : 'bg-gray-100'}`}>
              <div className="font-semibold">🤝 CRM</div>
              <div className="text-gray-600">Proyecto • Rechazado • P4</div>
            </div>
            <div className={`p-3 rounded-lg ${selectedRequestType === 'dashboard' ? 'bg-green-100 border border-green-300' : 'bg-gray-100'}`}>
              <div className="font-semibold">📈 Dashboard</div>
              <div className="text-gray-600">Requerimiento • Pendiente • P1</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cargar por Request ID (desde backend real) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Cargar Solicitud por ID (API Real)
          </CardTitle>
          <CardDescription>
            Usa el endpoint GET /api/requests/:id para traer datos reales, incluyendo technical_analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <Input 
              placeholder="UUID de la solicitud (requests.id)"
              value={requestIdInput}
              onChange={(e) => setRequestIdInput(e.target.value)}
              className="w-[420px]"
            />
            <Button onClick={handleFetchById} disabled={isLoading || !requestIdInput}>
              {isLoading ? 'Cargando...' : 'Cargar'}
            </Button>
            {error && <span className="text-sm text-red-600 ml-2">{error}</span>}
          </div>
          {fetchedData && (
            <div className="mt-3 text-sm text-gray-600">
              <div><strong>ID:</strong> {fetchedData.id}</div>
              <div><strong>Status:</strong> {fetchedData.status}</div>
              <div><strong>Clasificación:</strong> {fetchedData.classification || fetchedData.clasificacion_sugerida}</div>
              <div><strong>Prioridad:</strong> {fetchedData.priority || fetchedData.prioridad_sugerida}</div>
              <div><strong>Technical Analysis:</strong> {fetchedData.technical_analysis ? 'Disponible' : '—'}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Datos de muestra */}
      <Card className="mb-8 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900 dark:text-blue-100">
            <Database className="h-5 w-5 mr-2" />
            Datos de Ejemplo (Estructura Real de tu BD)
          </CardTitle>
          <CardDescription>
            Estos son datos de ejemplo (o los cargados desde API) que se usan en los modales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>ID:</strong> {currentData.id.substring(0, 8)}...
            </div>
            <div>
              <strong>Usuario:</strong> {currentData.user_id}
            </div>
            <div>
              <strong>Departamento:</strong> {currentData.departamento_solicitante || currentData.department}
            </div>
            <div>
              <strong>Score:</strong> {currentData.score_estimado || currentData.score}/100
            </div>
            <div>
              <strong>Status:</strong> {currentData.status}
            </div>
            <div>
              <strong>Clasificación:</strong> {currentData.clasificacion_sugerida || currentData.classification}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <strong>Plataformas:</strong> {(currentData.plataformas_involucradas || currentData.platforms || []).join(", ")}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <strong>Problema:</strong> {currentData.problema_principal || currentData.problem}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones para abrir modales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Modal de Usuario */}
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center text-green-700 dark:text-green-300">
              <Users className="h-5 w-5 mr-2" />
              UserRequestDetailModal
            </CardTitle>
            <CardDescription>
              Modal para usuarios/solicitantes - Solo lectura
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                ✅ Ya Perfecto
              </Badge>
              <Badge variant="outline" className="text-xs">
                100% Datos Reales
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Características:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Timeline visual del progreso</li>
                <li>Solo información del solicitante</li>
                <li>Mensajes del líder destacados</li>
                <li>Interface limpia y simple</li>
              </ul>
            </div>
            <Button 
              onClick={() => openModal('user')}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Probar Modal de Usuario
            </Button>
          </CardContent>
        </Card>

        {/* Modal Realista */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
              <FileText className="h-5 w-5 mr-2" />
              RealisticLeaderModal
            </CardTitle>
            <CardDescription>
              Modal para líderes - Solo funcionalidades reales
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                🆕 Nuevo
              </Badge>
              <Badge variant="outline" className="text-xs">
                100% Funcional
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Características:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>4 tabs: Detalles, Info Técnica por IA, Mensajes, Estados y Gestión</li>
                <li>Solo datos reales de tu BD</li>
                <li>Botones dinámicos según clasificación</li>
                <li>StatusManager integrado para cambios</li>
                <li>Acciones que funcionan (aprobar/rechazar)</li>
                <li>Sin mockups ni simulaciones</li>
              </ul>
            </div>
            <Button 
              onClick={() => openModal('realistic')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Probar Modal Realista
            </Button>
          </CardContent>
        </Card>

        {/* Modal Preview */}
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
              <Sparkles className="h-5 w-5 mr-2" />
              PreviewLeaderModal
            </CardTitle>
            <CardDescription>
              Modal híbrido - Reales + Preview del futuro
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                🌟 Preview v2.0
              </Badge>
              <Badge variant="outline" className="text-xs">
                Reales + Demos
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Características:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>5 tabs con badges claros</li>
                <li>Datos reales + preview futuro</li>
                <li>IA Analysis, Chat, Planificación</li>
                <li>Tooltips "Próximamente v2.0"</li>
              </ul>
            </div>
            <Button 
              onClick={() => openModal('preview')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Probar Modal Preview
            </Button>
          </CardContent>
        </Card>

        {/* Modal Manager (Gerencial) */}
        <Card className="border-2 border-indigo-200 dark:border-indigo-800">
          <CardHeader>
            <CardTitle className="flex items-center text-indigo-700 dark:text-indigo-300">
              <FileText className="h-5 w-5 mr-2" />
              PreviewManagerModal
            </CardTitle>
            <CardDescription>
              Vista para líder de área (gerencial)
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                👔 Gerencial
              </Badge>
              <Badge variant="outline" className="text-xs">
                Reusa PreviewLeaderModal
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Características:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Mismas secciones, enfoque gerencial</li>
                <li>userRole="lider_gerencial"</li>
                <li>Muestra technical_analysis si existe</li>
              </ul>
            </div>
            <Button 
              onClick={() => openModal('manager')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              Probar Modal Manager
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Render modales */}
      {activeModal === 'user' && (
        <UserRequestDetailModal 
          isOpen 
          onClose={closeModal} 
          request={currentData}
        />
      )}

      {activeModal === 'realistic' && (
        <RealisticLeaderModal 
          isOpen 
          onClose={closeModal}
          request={currentData}
        />
      )}

      {activeModal === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PreviewLeaderModal 
            isOpen 
            onClose={closeModal}
            request={currentData}
            userRole="lider_dominio"
          />
          <PreviewManagerModal 
            isOpen 
            onClose={closeModal}
            request={currentData}
            userRole="lider_gerencial"
          />
        </div>
      )}

      {activeModal === 'manager' && (
        <PreviewManagerModal 
          isOpen 
          onClose={closeModal}
          request={currentData}
          userRole="lider_gerencial"
        />
      )}

      {/* Información adicional */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
            <MessageSquare className="h-5 w-5 mr-2" />
            ¿Cuál usar y cuándo?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Para Producción
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Usa <strong>RealisticLeaderModal</strong> - Solo funcionalidades que realmente funcionan. 
                Máxima credibilidad.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/50 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                <Sparkles className="h-4 w-4 inline mr-2" />
                Para Demos
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Usa <strong>PreviewLeaderModal</strong> - Muestra roadmap y funcionalidades futuras 
                claramente etiquetadas.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                <Users className="h-4 w-4 inline mr-2" />
                Para Usuarios
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Mantén <strong>UserRequestDetailModal</strong> - Ya está perfecto. 
                Simple y enfocado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <UserRequestDetailModal
        isOpen={activeModal === 'user'}
        onClose={closeModal}
        request={sampleRequestData}
      />

      <RealisticLeaderModal
        isOpen={activeModal === 'realistic'}
        onClose={closeModal}
        request={sampleRequestData}
        userRole="lider_dominio"
      />

      <PreviewLeaderModal
        isOpen={activeModal === 'preview'}
        onClose={closeModal}
        request={sampleRequestData}
        userRole="lider_dominio"
      />
    </div>
  )
}
