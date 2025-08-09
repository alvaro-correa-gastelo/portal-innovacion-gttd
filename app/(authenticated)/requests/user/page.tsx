'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserRequestDetailModal } from "@/components/user-request-detail-modal"
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
  Eye
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
  days_since_created: number
  hours_waiting: number
  leader_comments: string | null
  technical_analysis: any
  platforms: any[]
  score: number
  user_id: string
  beneficiaries: string
  frequency: string
  timeframe: string
}

export default function UserRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    fetchMyRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm])

  // Abrir modal automáticamente si viene ?open_request=ID
  useEffect(() => {
    const idFromUrl = searchParams?.get('open_request')
    if (!idFromUrl) return

    // Intentar buscar en la lista actual primero
    const found = requests.find(r => r.id === idFromUrl)

    const openFromRequest = (req: Request) => {
      const modalRequest = {
        id: req.id,
        title: req.title,
        type: req.classification === 'proyecto' ? 'Proyecto' : 'Requerimiento',
        requester: 'Tú',
        department: req.department,
        status: mapStatusToModal(req.status),
        priority: mapPriorityToModal(req.priority),
        estimatedBudget: '$' + ((req.score || 0) * 1000).toLocaleString(),
        submissionDate: new Date(req.created_at).toLocaleDateString('es-ES'),
        daysInStatus: req.days_since_created,
        description: req.problem,
        impact: req.objective,
        domain: req.department
      }
      setSelectedRequest(modalRequest)
      setIsModalOpen(true)
    }

    if (found) {
      openFromRequest(found)
      return
    }

    // Si no está en lista, cargar por API directa
    (async () => {
      try {
        const resp = await fetch(`/api/requests/${encodeURIComponent(idFromUrl)}`)
        if (resp.ok) {
          const json = await resp.json()
          const data = json?.data
          if (data) {
            // Adaptar shape parcial a Request
            const req: Request = {
              id: data.id,
              title: data.title,
              problem: data.problem,
              objective: data.objective,
              status: data.status,
              priority: data.priority,
              classification: data.classification,
              department: data.department,
              created_at: data.created_at,
              days_since_created: data.days_since_created ?? 0,
              hours_waiting: data.hours_waiting ?? 0,
              leader_comments: data.leader_comments ?? null,
              technical_analysis: data.technical_analysis ?? {},
              platforms: data.platforms ?? [],
              score: data.score ?? 0,
              user_id: data.user_id,
              beneficiaries: data.beneficiaries ?? '',
              frequency: data.frequency ?? '',
              timeframe: data.timeframe ?? ''
            }
            openFromRequest(req)
          }
        }
      } catch (e) {
        // Silencioso: si falla, el usuario aún verá la lista
      }
    })()

    // Limpia el query param para evitar re-abrir al navegar dentro
    try {
      const url = new URL(window.location.href)
      url.searchParams.delete('open_request')
      router.replace(url.pathname + (url.search ? '?' + url.searchParams.toString() : ''))
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, requests])

  const fetchMyRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userId = 'test.user@utp.edu.pe'
      const response = await fetch(`/api/requests?user_id=${userId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar las solicitudes')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setRequests(data.data || [])
      } else {
        setError(data.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.problem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.department?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredRequests(filtered)
  }

  const groupRequests = () => {
    const active = filteredRequests.filter(r => 
      ['pending_approval', 'pending_technical_analysis', 'in_evaluation'].includes(r.status)
    )
    const completed = filteredRequests.filter(r => 
      ['approved', 'rejected'].includes(r.status)
    )
    const onHold = filteredRequests.filter(r => r.status === 'on_hold')
    
    return { active, completed, onHold }
  }

  const getStats = () => {
    const total = requests.length
    const pending = requests.filter(r => ['pending_approval', 'pending_technical_analysis'].includes(r.status)).length
    const approved = requests.filter(r => r.status === 'approved').length
    const avgScore = requests.length > 0 ? Math.round(requests.reduce((sum, r) => sum + (r.score || 0), 0) / requests.length) : 0
    
    return { total, pending, approved, avgScore }
  }

  const openRequestDetail = (request: Request) => {
    const modalRequest = {
      id: request.id,
      title: request.title,
      type: request.classification === 'proyecto' ? 'Proyecto' : 'Requerimiento',
      requester: 'Tú',
      department: request.department,
      status: mapStatusToModal(request.status),
      priority: mapPriorityToModal(request.priority),
      estimatedBudget: '$' + (request.score * 1000).toLocaleString(),
      submissionDate: new Date(request.created_at).toLocaleDateString('es-ES'),
      daysInStatus: request.days_since_created,
      description: request.problem,
      impact: request.objective,
      domain: request.department
    }
    
    setSelectedRequest(modalRequest)
    setIsModalOpen(true)
  }

  const mapStatusToModal = (status: string) => {
    const mapping = {
      'pending_approval': 'Pendiente',
      'pending_technical_analysis': 'En Evaluación',
      'in_evaluation': 'En Evaluación',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'on_hold': 'En Espera'
    }
    return mapping[status] || 'Pendiente'
  }

  const mapPriorityToModal = (priority: string) => {
    const mapping = {
      'P1': 'Alta',
      'P2': 'Media', 
      'P3': 'Baja',
      'P4': 'Baja'
    }
    return mapping[priority] || 'Media'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando mis solicitudes...</p>
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
            <Button onClick={fetchMyRequests} variant="outline">
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header - Vista de Usuario */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Mis Solicitudes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Seguimiento de tus solicitudes de innovación
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={fetchMyRequests} 
              variant="outline" 
              size="sm"
              className="hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Estadísticas simplificadas para usuarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Enviadas</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-600 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">En Proceso</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-600 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Búsqueda */}
      <Card className="mb-6 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Buscar Solicitudes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por título, problema o departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger 
            value="active" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Clock className="h-4 w-4" />
            En Proceso ({grouped.active.length})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <CheckCircle className="h-4 w-4" />
            Completadas ({grouped.completed.length})
          </TabsTrigger>
          <TabsTrigger 
            value="onHold" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <AlertCircle className="h-4 w-4" />
            En Espera ({grouped.onHold.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <UserRequestsList requests={grouped.active} type="active" onOpenDetail={openRequestDetail} />
        </TabsContent>

        <TabsContent value="completed">
          <UserRequestsList requests={grouped.completed} type="completed" onOpenDetail={openRequestDetail} />
        </TabsContent>

        <TabsContent value="onHold">
          <UserRequestsList requests={grouped.onHold} type="onHold" onOpenDetail={openRequestDetail} />
        </TabsContent>
      </Tabs>

      {/* Modal de detalles */}
      <UserRequestDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  )
}

// Componente para listar solicitudes de usuario
function UserRequestsList({ requests, type, onOpenDetail }: { requests: Request[], type: string, onOpenDetail: (request: Request) => void }) {
  if (requests.length === 0) {
    const messages = {
      active: "No tienes solicitudes en proceso en este momento",
      completed: "No tienes solicitudes completadas aún", 
      onHold: "No tienes solicitudes en espera"
    }

    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            Sin solicitudes
          </h3>
          <p className="text-gray-500 dark:text-gray-500 text-center max-w-md">
            {messages[type] || "No se encontraron solicitudes"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {requests.map((request) => (
        <UserRequestCard key={request.id} request={request} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  )
}

// Componente de tarjeta simplificado para usuarios
function UserRequestCard({ request, onOpenDetail }: { request: Request, onOpenDetail: (request: Request) => void }) {
  const getStatusConfig = (status: string) => {
    const configs = {
      'pending_approval': {
        label: 'Esperando Aprobación',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        iconColor: 'text-yellow-600'
      },
      'pending_technical_analysis': {
        label: 'En Análisis',
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
    }
    return configs[status] || configs['pending_approval']
  }

  const statusConfig = getStatusConfig(request.status)
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
          
          <div className="flex flex-wrap gap-2">
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Enviado</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hace {request.days_since_created || 0} días</p>
            </div>
          </div>
        </div>

        {/* Comentarios del líder si existen */}
        {request.leader_comments && (
          <div className="bg-green-50 dark:bg-green-950/50 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-green-200 text-green-800 text-xs">
                  LG
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-green-800 dark:text-green-200 mb-1 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Mensaje del equipo:
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">{request.leader_comments}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botón Ver Detalles */}
        <div className="flex justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
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
