'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { RequestDetailModal } from "@/components/request-detail-modal"
import { RealisticLeaderModal } from "@/components/realistic-leader-modal"
import { ScoringConfigModal } from "@/components/scoring-config-modal"
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Search, 
  FileText, 
  MessageSquare, 
  RefreshCw,
  Calendar,
  Building,
  Tag,
  TrendingUp,
  User,
  ArrowRight,
  Zap,
  Eye,
  Filter,
  Users,
  BarChart3,
  Settings
} from "lucide-react"

interface Request {
  id: string
  title: string
  problem: string
  objective: string
  status: string
  priority: string
  classification: string
  department: string
  created_at: string
  days_since_created?: number
  hours_waiting?: number
  leader_comments?: string | null
  technical_analysis?: any
  platforms?: any[]
  score: number
  user_id: string
  beneficiaries: string
  frequency: string
  timeframe: string
}

export default function LeaderRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [isScoringOpen, setIsScoringOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    fetchAllRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter, priorityFilter, departmentFilter])

  // Auto-abrir modal de configuración de scoring desde query param
  useEffect(() => {
    const openCfg = searchParams?.get('open_scoring_config')
    if (openCfg === '1') {
      setIsScoringOpen(true)
      // limpiar el query param
      try {
        const url = new URL(window.location.href)
        url.searchParams.delete('open_scoring_config')
        router.replace(url.pathname + (url.search ? '?' + url.searchParams.toString() : ''))
      } catch {}
    }
  }, [searchParams, router])

  const fetchAllRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock data de ejemplo para demostración del dashboard del líder
      const mockLeaderRequests: Request[] = [
        {
          id: "leader-mock-001",
          title: "Sistema de Automatización de Procesos",
          problem: "Los procesos manuales causan retrasos y errores frecuentes en múltiples departamentos",
          objective: "Implementar automatización integral de procesos críticos",
          department: "Operaciones",
          status: "pending_approval",
          classification: "proyecto",
          priority: "P1",
          score: 92,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: "juan.perez",
          technical_analysis: "Se requiere integración con SAP y Canvas. Tiempo estimado: 3 meses. ROI esperado: 40%.",
          platforms: ["SAP", "Canvas", "Office 365"],
          beneficiaries: "Toda la organización (500+ usuarios)",
          frequency: "Proceso diario",
          timeframe: "3 meses"
        },
        {
          id: "leader-mock-002",
          title: "Dashboard BI para Análisis de Datos",
          problem: "No tenemos visibilidad en tiempo real de métricas críticas del negocio",
          objective: "Crear dashboard interactivo con KPIs y análisis predictivo",
          department: "Finanzas",
          status: "in_evaluation",
          classification: "proyecto",
          priority: "P2",
          score: 78,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: "maria.garcia",
          technical_analysis: "Requiere Power BI Premium y conexión a data warehouse. Complejidad media.",
          platforms: ["Power BI", "SQL Server", "Azure"],
          beneficiaries: "Gerencia y analistas (50 usuarios)",
          frequency: "Consulta diaria",
          timeframe: "2 meses"
        },
        {
          id: "leader-mock-003",
          title: "Migración a Cloud Computing",
          problem: "Infraestructura on-premise costosa y poco escalable",
          objective: "Migrar servicios críticos a la nube para mejorar disponibilidad",
          department: "IT",
          status: "approved",
          classification: "proyecto",
          priority: "P1",
          score: 95,
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: "carlos.rodriguez",
          technical_analysis: "Migración por fases. Primera fase: servicios no críticos. ROI en 18 meses.",
          platforms: ["AWS", "Azure", "Google Cloud"],
          beneficiaries: "Toda la organización",
          frequency: "24/7",
          timeframe: "6 meses",
          leader_comments: "Aprobado. Iniciar con fase piloto en Q2."
        },
        {
          id: "leader-mock-004",
          title: "App Móvil para Empleados",
          problem: "Los empleados no pueden acceder a sistemas desde dispositivos móviles",
          objective: "Desarrollar app móvil con funciones esenciales de RRHH y comunicación",
          department: "Recursos Humanos",
          status: "pending_technical_analysis",
          classification: "requerimiento",
          priority: "P3",
          score: 65,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: "ana.martinez",
          platforms: ["iOS", "Android"],
          beneficiaries: "300 empleados",
          frequency: "Uso diario",
          timeframe: "4 meses"
        },
        {
          id: "leader-mock-005",
          title: "Sistema de Gestión de Inventarios",
          problem: "Control manual del inventario genera pérdidas",
          objective: "Sistema automatizado con código de barras y alertas",
          department: "Logística",
          status: "rejected",
          classification: "proyecto",
          priority: "P2",
          score: 70,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: "pedro.sanchez",
          technical_analysis: "Complejidad alta. Requiere hardware especializado.",
          platforms: ["SAP", "Custom Development"],
          beneficiaries: "Departamento de logística (20 usuarios)",
          frequency: "Transacciones continuas",
          timeframe: "5 meses",
          leader_comments: "Rechazado. Ya existe proyecto similar en curso con otro proveedor."
        },
        {
          id: "leader-mock-006",
          title: "Portal de Autoservicio para Clientes",
          problem: "Alto volumen de consultas repetitivas al servicio al cliente",
          objective: "Portal web con FAQ, chatbot y gestión de tickets",
          department: "Servicio al Cliente",
          status: "on_hold",
          classification: "proyecto",
          priority: "P2",
          score: 75,
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          user_id: "lucia.torres",
          technical_analysis: "Requiere integración con CRM existente. Chatbot con IA.",
          platforms: ["Web", "CRM", "Chatbot AI"],
          beneficiaries: "5000+ clientes externos",
          frequency: "24/7",
          timeframe: "3 meses",
          leader_comments: "En espera de presupuesto para Q3."
        }
      ]
      
      // Obtener solicitudes reales de la BD
      const response = await fetch('/api/requests')
      
      let dbRequests: Request[] = []
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          dbRequests = data.data || []
        }
      }
      
      // Combinar solicitudes: primero las de BD (más recientes), luego las mock
      const combinedRequests = [...dbRequests, ...mockLeaderRequests]
      
      // Eliminar duplicados basados en ID
      const uniqueRequests = combinedRequests.filter((req, index, self) =>
        index === self.findIndex((r) => r.id === req.id)
      )
      
      setRequests(uniqueRequests)
      
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes')
      // Si hay error, usar solo mock data
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    // Filtro por búsqueda de texto
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.problem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    // Filtro por prioridad
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(request => request.priority === priorityFilter)
    }

    // Filtro por departamento
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(request => request.department === departmentFilter)
    }

    setFilteredRequests(filtered)
  }

  const groupRequests = () => {
    const pending = filteredRequests.filter(r => 
      ['pending_approval', 'pending_technical_analysis'].includes(r.status)
    )
    const inReview = filteredRequests.filter(r => r.status === 'in_evaluation')
    const completed = filteredRequests.filter(r => 
      ['approved', 'rejected'].includes(r.status)
    )
    const onHold = filteredRequests.filter(r => r.status === 'on_hold')
    
    return { pending, inReview, completed, onHold }
  }

  const getStats = () => {
    const total = requests.length
    const pending = requests.filter(r => ['pending_approval', 'pending_technical_analysis'].includes(r.status)).length
    const approved = requests.filter(r => r.status === 'approved').length
    const rejected = requests.filter(r => r.status === 'rejected').length
    const avgScore = requests.length > 0 ? Math.round(requests.reduce((sum, r) => sum + (r.score || 0), 0) / requests.length) : 0
    const highPriority = requests.filter(r => r.priority === 'P1').length
    
    return { total, pending, approved, rejected, avgScore, highPriority }
  }

  const getDepartments = () => {
    const departments = [...new Set(requests.map(r => r.department).filter(Boolean))]
    return departments.sort()
  }

  const openRequestDetail = (request: Request) => {
    // Conservar valores crudos para la lógica del modal
    const modalRequest = {
      ...request,
      // Campos adicionales formateados para UI sin sobreescribir los crudos
      type: request.classification === 'proyecto' ? 'Proyecto' : 'Requerimiento',
      requester: request.user_id,
      estimatedBudget: '$' + (request.score * 1000).toLocaleString(),
      submissionDate: new Date(request.created_at).toLocaleDateString('es-ES'),
      daysInStatus: request.days_since_created,
      description: request.problem,
      impact: request.objective,
      domain: request.department,
      technicalAnalysis: request.technical_analysis,
      platforms: request.platforms,
      beneficiaries: request.beneficiaries,
      frequency: request.frequency,
      timeframe: request.timeframe
    }

    setSelectedRequest(modalRequest)
    setIsModalOpen(true)
  }

  const mapStatusToModal = (status: string) => {
    const mapping = {
      'pending_approval': 'Pendiente',
      'pending_technical_analysis': 'Análisis Técnico',
      'in_evaluation': 'En Evaluación',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'on_hold': 'En Espera'
    }
    return mapping[status as keyof typeof mapping] || 'Pendiente'
  }

  const mapPriorityToModal = (priority: string) => {
    const mapping = {
      'P1': 'Alta',
      'P2': 'Media', 
      'P3': 'Baja',
      'P4': 'Muy Baja'
    }
    return mapping[priority as keyof typeof mapping] || 'Media'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando solicitudes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4 text-center">{error}</p>
            <Button onClick={fetchAllRequests} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const grouped = groupRequests()
  const stats = getStats()
  const departments = getDepartments()

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {isModalOpen && selectedRequest && (
        <RealisticLeaderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedRequest(null)
            try { window.dispatchEvent(new CustomEvent('requests:refresh')) } catch {}
          }}
          request={selectedRequest}
          userRole="lider_dominio"
        />
      )}
      {/* Header - Vista de Líder */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div>
            {/* TODO: Encabezado, filtros y estadísticas ya existentes van aquí */}
          </div>
        </div>
      </div>

      {/* Listados por estado */}
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-3">Pendientes</h2>
          <LeaderRequestsList requests={grouped.pending} type="pending" onOpenDetail={openRequestDetail} />
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-3">En Evaluación</h2>
          <LeaderRequestsList requests={grouped.inReview} type="inReview" onOpenDetail={openRequestDetail} />
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-3">Completadas</h2>
          <LeaderRequestsList requests={grouped.completed} type="completed" onOpenDetail={openRequestDetail} />
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-3">En Espera</h2>
          <LeaderRequestsList requests={grouped.onHold} type="onHold" onOpenDetail={openRequestDetail} />
        </section>
      </div>
    </div>
  )
}

// Helper component definitions
type LeaderListType = 'pending' | 'inReview' | 'completed' | 'onHold'
function LeaderRequestsList({ requests, type, onOpenDetail }: { requests: Request[], type: LeaderListType, onOpenDetail: (request: Request) => void }) {
  if (requests.length === 0) {
    const messages = {
      pending: "No hay solicitudes pendientes de revisión",
      inReview: "No hay solicitudes en proceso de evaluación", 
      completed: "No hay solicitudes completadas",
      onHold: "No hay solicitudes en espera"
    } as const

    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            Sin solicitudes
          </h3>
          <p className="text-gray-500 dark:text-gray-500 text-center max-w-md">
            {messages[type]}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {requests.map((request) => (
        <LeaderRequestCard key={request.id} request={request} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  )
}

// Componente de tarjeta avanzado para líderes
function LeaderRequestCard({ request, onOpenDetail }: { request: Request, onOpenDetail: (request: Request) => void }) {
  const getStatusConfig = (status: string) => {
    const configs = {
      'pending_approval': {
        label: 'Pendiente Aprobación',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        iconColor: 'text-yellow-600'
      },
      'pending_technical_analysis': {
        label: 'Análisis Técnico',
        icon: Zap,
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        iconColor: 'text-blue-600'
      },
      'in_evaluation': {
        label: 'En Evaluación',
        icon: TrendingUp,
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        iconColor: 'text-orange-600'
      },
      'approved': {
        label: 'Aprobada',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        iconColor: 'text-green-600'
      },
      'rejected': {
        label: 'Rechazada',
        icon: AlertCircle,
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        iconColor: 'text-red-600'
      },
      'on_hold': {
        label: 'En Espera',
        icon: Clock,
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
        iconColor: 'text-gray-600'
      }
    } as const
    return configs[status as keyof typeof configs] || configs['pending_approval']
  }

  const getPriorityConfig = (priority: string) => {
    const configs = {
      'P1': { 
        label: 'Alta', 
        color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
        badge: 'destructive' as const
      },
      'P2': { 
        label: 'Media', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
        badge: 'secondary' as const
      },
      'P3': { 
        label: 'Baja', 
        color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
        badge: 'outline' as const
      },
      'P4': { 
        label: 'Muy Baja', 
        color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300',
        badge: 'outline' as const
      }
    } as const
    return configs[priority as keyof typeof configs] || configs['P2']
  }

  const statusConfig = getStatusConfig(request.status)
  const priorityConfig = getPriorityConfig(request.priority)
  const StatusIcon = statusConfig.icon

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl leading-tight mb-2 text-gray-900 dark:text-gray-100">
                  {request.title || 'Sin título'}
                </CardTitle>
                <CardDescription className="text-base line-clamp-2 text-gray-600 dark:text-gray-400">
                  {request.problem || 'Sin descripción del problema'}
                </CardDescription>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            {request.priority && (
              <Badge variant={priorityConfig.badge} className={priorityConfig.color}>
                {priorityConfig.label}
              </Badge>
            )}
            {request.score && (
              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                Score: {request.score}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información del solicitante y detalles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Solicitante</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{request.user_id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Building className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Departamento</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{request.department || 'No especificado'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Días esperando</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{request.days_since_created || 0} días</p>
            </div>
          </div>
        </div>

        {/* Objetivo de la solicitud */}
        {request.objective && (
          <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Objetivo esperado:
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">{request.objective}</p>
          </div>
        )}

        {/* Análisis técnico si existe */}
        {request.technical_analysis && Object.keys(request.technical_analysis).length > 0 && (
          <div className="bg-purple-50 dark:bg-purple-950/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-purple-800 dark:text-purple-200 mb-1 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Análisis técnico disponible
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Análisis completado - Revisar en detalle para más información.
            </p>
          </div>
        )}

        {/* Botones de acción para líderes */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Gestionar
            </Button>
            {request.status === 'pending_approval' && (
              <Button size="sm" variant="outline" className="text-xs text-green-700 hover:bg-green-50">
                Aprobar
              </Button>
            )}
          </div>
          
          <Button 
            onClick={() => onOpenDetail(request)}
            variant="outline" 
            className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950 border-blue-200 text-blue-700 hover:border-blue-300"
          >
            <Eye className="h-4 w-4" />
            Ver Detalles Completos
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
