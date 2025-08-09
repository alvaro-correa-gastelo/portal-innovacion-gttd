'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RequestDetailModal } from "@/components/request-detail-modal"
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
  Settings,
  Shield,
  Database,
  Activity,
  PieChart,
  Target
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

export default function AdminRequestsPage() {
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
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>('all')

  useEffect(() => {
    fetchAllRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter, priorityFilter, departmentFilter, timeRangeFilter])

  const fetchAllRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Para administradores: obtener todas las solicitudes con datos completos
      const response = await fetch('/api/requests?admin=true')
      
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

    // Filtro por rango de tiempo
    if (timeRangeFilter !== 'all') {
      const now = new Date()
      const daysThreshold = timeRangeFilter === '7d' ? 7 : 
                           timeRangeFilter === '30d' ? 30 : 
                           timeRangeFilter === '90d' ? 90 : 0
      
      if (daysThreshold > 0) {
        filtered = filtered.filter(request => {
          const requestDate = new Date(request.created_at)
          const daysDiff = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff <= daysThreshold
        })
      }
    }

    setFilteredRequests(filtered)
  }

  const groupRequests = () => {
    const byStatus = {
      pending: filteredRequests.filter(r => ['pending_approval', 'pending_technical_analysis'].includes(r.status)),
      inReview: filteredRequests.filter(r => r.status === 'in_evaluation'),
      completed: filteredRequests.filter(r => ['approved', 'rejected'].includes(r.status)),
      onHold: filteredRequests.filter(r => r.status === 'on_hold')
    }

    const byPriority = {
      P1: filteredRequests.filter(r => r.priority === 'P1'),
      P2: filteredRequests.filter(r => r.priority === 'P2'),
      P3: filteredRequests.filter(r => r.priority === 'P3'),
      P4: filteredRequests.filter(r => r.priority === 'P4')
    }

    return { byStatus, byPriority }
  }

  const getAdvancedStats = () => {
    const total = requests.length
    const pending = requests.filter(r => ['pending_approval', 'pending_technical_analysis'].includes(r.status)).length
    const approved = requests.filter(r => r.status === 'approved').length
    const rejected = requests.filter(r => r.status === 'rejected').length
    const avgScore = requests.length > 0 ? Math.round(requests.reduce((sum, r) => sum + (r.score || 0), 0) / requests.length) : 0
    const highPriority = requests.filter(r => r.priority === 'P1').length
    const avgProcessingTime = requests.length > 0 ? Math.round(requests.reduce((sum, r) => sum + (r.days_since_created || 0), 0) / requests.length) : 0
    
    // Estadísticas por departamento
    const departmentStats = {}
    requests.forEach(r => {
      if (r.department) {
        if (!departmentStats[r.department]) {
          departmentStats[r.department] = { total: 0, approved: 0, pending: 0 }
        }
        departmentStats[r.department].total++
        if (r.status === 'approved') departmentStats[r.department].approved++
        if (['pending_approval', 'pending_technical_analysis'].includes(r.status)) departmentStats[r.department].pending++
      }
    })

    // Tendencias mensuales
    const monthlyTrends = {}
    requests.forEach(r => {
      const month = new Date(r.created_at).toISOString().slice(0, 7)
      monthlyTrends[month] = (monthlyTrends[month] || 0) + 1
    })
    
    return { 
      total, pending, approved, rejected, avgScore, highPriority, avgProcessingTime,
      departmentStats, monthlyTrends,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      pendingRate: total > 0 ? Math.round((pending / total) * 100) : 0
    }
  }

  const getDepartments = () => {
    const departments = [...new Set(requests.map(r => r.department).filter(Boolean))]
    return departments.sort()
  }

  const openRequestDetail = (request: Request) => {
    // Formato completo para administradores con todos los datos
    const modalRequest = {
      id: request.id,
      title: request.title,
      type: request.classification === 'proyecto' ? 'Proyecto' : 'Requerimiento',
      requester: request.user_id,
      department: request.department,
      status: mapStatusToModal(request.status),
      priority: mapPriorityToModal(request.priority),
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
      timeframe: request.timeframe,
      leaderComments: request.leader_comments
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
    return mapping[status] || 'Pendiente'
  }

  const mapPriorityToModal = (priority: string) => {
    const mapping = {
      'P1': 'Alta',
      'P2': 'Media', 
      'P3': 'Baja',
      'P4': 'Muy Baja'
    }
    return mapping[priority] || 'Media'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando panel administrativo...</p>
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
  const stats = getAdvancedStats()
  const departments = getDepartments()

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header - Vista Administrativa */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Panel Administrativo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Análisis completo y administración del sistema de solicitudes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={fetchAllRequests} 
              variant="outline" 
              size="sm"
              className="hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar Datos
            </Button>
          </div>
        </div>

        {/* Dashboard de métricas avanzadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Sistema</p>
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
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-600 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Tasa Aprobación</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.approvalRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-600 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Alta Prioridad</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.highPriority}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Score Promedio</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.avgScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-600 rounded-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{stats.avgProcessingTime}d</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros administrativos avanzados */}
      <Card className="mb-6 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filtros Avanzados de Administración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Búsqueda por texto */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cualquier campo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro por estado */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending_approval">Pendiente Aprobación</SelectItem>
                <SelectItem value="pending_technical_analysis">Análisis Técnico</SelectItem>
                <SelectItem value="in_evaluation">En Evaluación</SelectItem>
                <SelectItem value="approved">Aprobadas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
                <SelectItem value="on_hold">En Espera</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por prioridad */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="P1">Alta (P1)</SelectItem>
                <SelectItem value="P2">Media (P2)</SelectItem>
                <SelectItem value="P3">Baja (P3)</SelectItem>
                <SelectItem value="P4">Muy Baja (P4)</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por departamento */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los departamentos</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por tiempo */}
            <Select value={timeRangeFilter} onValueChange={setTimeRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rango de tiempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el tiempo</SelectItem>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>

            {/* Botón limpiar filtros */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setPriorityFilter('all')
                setDepartmentFilter('all')
                setTimeRangeFilter('all')
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs administrativos con análisis */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <PieChart className="h-4 w-4" />
            Resumen General
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Clock className="h-4 w-4" />
            Pendientes ({grouped.byStatus.pending.length})
          </TabsTrigger>
          <TabsTrigger 
            value="inReview" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4" />
            En Revisión ({grouped.byStatus.inReview.length})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <CheckCircle className="h-4 w-4" />
            Completadas ({grouped.byStatus.completed.length})
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4" />
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminOverviewSection stats={stats} departments={departments} />
        </TabsContent>

        <TabsContent value="pending">
          <AdminRequestsList requests={grouped.byStatus.pending} type="pending" onOpenDetail={openRequestDetail} />
        </TabsContent>

        <TabsContent value="inReview">
          <AdminRequestsList requests={grouped.byStatus.inReview} type="inReview" onOpenDetail={openRequestDetail} />
        </TabsContent>

        <TabsContent value="completed">
          <AdminRequestsList requests={grouped.byStatus.completed} type="completed" onOpenDetail={openRequestDetail} />
        </TabsContent>

        <TabsContent value="analytics">
          <AdminAnalyticsSection stats={stats} requests={requests} />
        </TabsContent>
      </Tabs>

      {/* Modal de detalles completo para administradores */}
      <RequestDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        userRole="admin"
      />
    </div>
  )
}

// Componente de resumen para administradores
function AdminOverviewSection({ stats, departments }: { stats: any, departments: string[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Aprobadas</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: `${stats.approvalRate}%`}}></div>
                  </div>
                  <span className="text-sm font-medium">{stats.approvalRate}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pendientes</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${stats.pendingRate}%`}}></div>
                  </div>
                  <span className="text-sm font-medium">{stats.pendingRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Top Departamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.departmentStats)
                .sort(([,a], [,b]) => b.total - a.total)
                .slice(0, 5)
                .map(([dept, data]) => (
                  <div key={dept} className="flex justify-between items-center">
                    <span className="text-sm truncate">{dept}</span>
                    <Badge variant="outline">{data.total}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente de análisis para administradores
function AdminAnalyticsSection({ stats, requests }: { stats: any, requests: any[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas Clave</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Tiempo promedio de procesamiento</span>
              <span className="font-semibold">{stats.avgProcessingTime} días</span>
            </div>
            <div className="flex justify-between">
              <span>Score promedio</span>
              <span className="font-semibold">{stats.avgScore}</span>
            </div>
            <div className="flex justify-between">
              <span>Solicitudes de alta prioridad</span>
              <span className="font-semibold">{stats.highPriority}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Análisis de tendencias mensuales y patrones de solicitudes.
            </div>
            <div className="space-y-2">
              {Object.entries(stats.monthlyTrends)
                .sort()
                .slice(-6)
                .map(([month, count]) => (
                  <div key={month} className="flex justify-between">
                    <span className="text-sm">{month}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rendimiento del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Eficiencia de aprobación</span>
                  <span>{stats.approvalRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${stats.approvalRate}%`}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Velocidad de procesamiento</span>
                  <span>{100 - Math.min(stats.avgProcessingTime, 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${100 - Math.min(stats.avgProcessingTime, 100)}%`}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente para listar solicitudes del administrador
function AdminRequestsList({ requests, type, onOpenDetail }: { requests: Request[], type: string, onOpenDetail: (request: Request) => void }) {
  if (requests.length === 0) {
    const messages = {
      pending: "No hay solicitudes pendientes de revisión",
      inReview: "No hay solicitudes en proceso de evaluación", 
      completed: "No hay solicitudes completadas"
    }

    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Database className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
            Sin datos en esta categoría
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
        <AdminRequestCard key={request.id} request={request} onOpenDetail={onOpenDetail} />
      ))}
    </div>
  )
}

// Componente de tarjeta administrativo
function AdminRequestCard({ request, onOpenDetail }: { request: Request, onOpenDetail: (request: Request) => void }) {
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
    }
    return configs[status] || configs['pending_approval']
  }

  const getPriorityConfig = (priority: string) => {
    const configs = {
      'P1': { 
        label: 'Crítica', 
        color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300',
        badge: 'destructive' as const
      },
      'P2': { 
        label: 'Alta', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
        badge: 'secondary' as const
      },
      'P3': { 
        label: 'Media', 
        color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300',
        badge: 'outline' as const
      },
      'P4': { 
        label: 'Baja', 
        color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300',
        badge: 'outline' as const
      }
    }
    return configs[priority] || configs['P2']
  }

  const statusConfig = getStatusConfig(request.status)
  const priorityConfig = getPriorityConfig(request.priority)
  const StatusIcon = statusConfig.icon

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-purple-500">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
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
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Score: {request.score}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información administrativa detallada */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Usuario</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{request.user_id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Building className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Departamento</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{request.department || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Días en sistema</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{request.days_since_created || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Tag className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Clasificación</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{request.classification || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Botones de acción administrativos */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs text-purple-700 hover:bg-purple-50">
              <Shield className="h-3 w-3 mr-1" />
              Admin Actions
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Configurar
            </Button>
          </div>
          
          <Button 
            onClick={() => onOpenDetail(request)}
            variant="outline" 
            className="flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950 border-purple-200 text-purple-700 hover:border-purple-300"
          >
            <Eye className="h-4 w-4" />
            Análisis Completo
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
