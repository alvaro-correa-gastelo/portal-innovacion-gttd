"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Eye,
  MessageSquare,
  Calendar,
  User,
  TrendingUp,
  AlertCircle,
  Plus,
  FileText,
  Building
} from "lucide-react"

// Import del modal de detalles para usuarios (versión usuario)
import { UserRequestDetailModal } from "@/components/user-request-detail-modal"

interface Request {
  id: string
  title: string
  titulo_solicitud: string
  problema_principal: string
  objetivo_esperado: string
  department: string
  departamento_solicitante: string
  status: string
  clasificacion_sugerida: string
  clasificacion_final?: string
  prioridad_sugerida: string
  prioridad_final?: string
  score_estimado: number
  leader_comments?: string
  leader_override?: boolean
  created_at: string
  updated_at?: string
  days_since_created: number
  user_id: string
}

export default function MisSolicitudesPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Simulando el usuario actual (en producción vendría del contexto de autenticación)
  const currentUser = "test.user@utp.edu.pe"

  useEffect(() => {
    fetchMyRequests()
  }, [])

  // Soporte SPA: refrescar y abrir por eventos globales sin recargar
  useEffect(() => {
    const onRefresh = () => {
      fetchMyRequests()
    }
    const onOpen = (ev: Event) => {
      const custom = ev as CustomEvent<{ id?: string }>
      const id = custom?.detail?.id
      if (!id) return

      const found = requests.find(r => r.id === id)
      const openFrom = (req: any) => {
        openDetailModal({
          ...req,
          titulo_solicitud: req.title || req.titulo_solicitud,
          problema_principal: req.problema_principal,
          objetivo_esperado: req.objetivo_esperado,
          department: req.department,
          departamento_solicitante: req.departamento_solicitante || req.department,
          clasificacion_sugerida: req.classification || req.clasificacion_sugerida,
          prioridad_sugerida: req.priority || req.prioridad_sugerida,
          score_estimado: req.score || req.score_estimado,
        } as Request)
      }
      if (found) {
        openFrom(found)
      } else {
        ;(async () => {
          try {
            const resp = await fetch(`/api/requests/${encodeURIComponent(id)}`)
            if (resp.ok) {
              const json = await resp.json()
              const data = json?.data
              if (data) openFrom(data)
            }
          } catch {}
        })()
      }
    }

    try {
      window.addEventListener('requests:refresh', onRefresh as EventListener)
      window.addEventListener('open_request', onOpen as EventListener)
    } catch {}

    return () => {
      try {
        window.removeEventListener('requests:refresh', onRefresh as EventListener)
        window.removeEventListener('open_request', onOpen as EventListener)
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests])

  useEffect(() => {
    filterRequests()
  }, [requests, searchTerm, statusFilter])

  // Auto-abrir modal si viene ?open_request=ID
  useEffect(() => {
    const id = searchParams?.get('open_request')
    if (!id) return

    const found = requests.find(r => r.id === id)

    const openFrom = (req: any) => {
      openDetailModal({
        ...req,
        titulo_solicitud: req.title || req.titulo_solicitud,
        problema_principal: req.problema_principal,
        objetivo_esperado: req.objetivo_esperado,
        department: req.department,
        departamento_solicitante: req.departamento_solicitante || req.department,
        clasificacion_sugerida: req.classification || req.clasificacion_sugerida,
        prioridad_sugerida: req.priority || req.prioridad_sugerida,
        score_estimado: req.score || req.score_estimado,
      } as Request)
    }

    if (found) {
      openFrom(found)
    } else {
      ;(async () => {
        try {
          const resp = await fetch(`/api/requests/${encodeURIComponent(id)}`)
          if (resp.ok) {
            const json = await resp.json()
            const data = json?.data
            if (data) openFrom(data)
          }
        } catch {}
      })()
    }

    // limpiar query param
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
      
      // Mock data de ejemplo para demostración
      const mockRequests: Request[] = [
        {
          id: "mock-001",
          title: "Automatización de Procesos RR.HH",
          titulo_solicitud: "Automatización de Procesos RR.HH",
          problema_principal: "Los procesos manuales de RRHH generan retrasos y errores frecuentes",
          objetivo_esperado: "Automatizar los procesos principales de RRHH para mejorar eficiencia",
          department: "Recursos Humanos",
          departamento_solicitante: "Recursos Humanos",
          status: "in_evaluation",
          clasificacion_sugerida: "proyecto",
          prioridad_sugerida: "P1",
          score_estimado: 85,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          days_since_created: 2,
          user_id: currentUser
        },
        {
          id: "mock-002",
          title: "Sistema de Gestión de Inventarios",
          titulo_solicitud: "Sistema de Gestión de Inventarios",
          problema_principal: "Control manual del inventario causa pérdidas y desabastecimiento",
          objetivo_esperado: "Implementar sistema automatizado de control de inventarios",
          department: "Operaciones",
          departamento_solicitante: "Operaciones",
          status: "pending_approval",
          clasificacion_sugerida: "proyecto",
          prioridad_sugerida: "P2",
          score_estimado: 72,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          days_since_created: 5,
          user_id: currentUser
        },
        {
          id: "mock-003",
          title: "App Móvil de Consultas",
          titulo_solicitud: "App Móvil de Consultas",
          problema_principal: "Los usuarios no pueden acceder a consultas desde dispositivos móviles",
          objetivo_esperado: "Desarrollar aplicación móvil para consultas de usuarios",
          department: "Sistemas",
          departamento_solicitante: "Sistemas",
          status: "approved",
          clasificacion_sugerida: "requerimiento",
          clasificacion_final: "requerimiento",
          prioridad_sugerida: "P2",
          prioridad_final: "P1",
          score_estimado: 90,
          leader_comments: "Aprobado por alta demanda de usuarios",
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          days_since_created: 10,
          user_id: currentUser
        },
        {
          id: "mock-004",
          title: "Dashboard BI para Reportes",
          titulo_solicitud: "Dashboard BI para Reportes",
          problema_principal: "Generación manual de reportes consume mucho tiempo",
          objetivo_esperado: "Crear dashboard automatizado con KPIs en tiempo real",
          department: "Finanzas",
          departamento_solicitante: "Finanzas",
          status: "pending_technical_analysis",
          clasificacion_sugerida: "proyecto",
          prioridad_sugerida: "P3",
          score_estimado: 65,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          days_since_created: 1,
          user_id: currentUser
        },
        {
          id: "mock-005",
          title: "Sistema de Videoconferencias",
          titulo_solicitud: "Sistema de Videoconferencias",
          problema_principal: "No tenemos plataforma propia para reuniones virtuales",
          objetivo_esperado: "Implementar sistema interno de videoconferencias",
          department: "IT",
          departamento_solicitante: "IT",
          status: "on_hold",
          clasificacion_sugerida: "proyecto",
          prioridad_sugerida: "P4",
          score_estimado: 45,
          leader_comments: "En pausa por restricciones presupuestarias",
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          days_since_created: 15,
          user_id: currentUser
        },
        {
          id: "mock-006",
          title: "Migración Base de Datos",
          titulo_solicitud: "Migración Base de Datos",
          problema_principal: "Base de datos actual tiene problemas de rendimiento",
          objetivo_esperado: "Migrar a nueva arquitectura de base de datos optimizada",
          department: "Sistemas",
          departamento_solicitante: "Sistemas",
          status: "rejected",
          clasificacion_sugerida: "proyecto",
          prioridad_sugerida: "P2",
          score_estimado: 55,
          leader_comments: "Rechazado - Se optimizará la BD actual en lugar de migrar",
          created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          days_since_created: 8,
          user_id: currentUser
        }
      ]
      
      // Obtener solicitudes reales de la BD
      let dbRequests: Request[] = []

      // 1) Intento por user_id (cuando hay login demo)
      try {
        const byUserResp = await fetch(`/api/requests?user_id=${encodeURIComponent(currentUser)}`)
        if (byUserResp.ok) {
          const byUserJson = await byUserResp.json()
          if (byUserJson?.success) {
            const list = byUserJson.data || []
            dbRequests = list.map((req: any) => ({
              ...req,
              titulo_solicitud: req.title || req.titulo_solicitud,
              problema_principal: req.problema_principal || req.problem || req.descripcion_problema || req.descripcion || req.description,
              objetivo_esperado: req.objetivo_esperado || req.objective || req.objetivo || req.meta,
              departamento_solicitante: req.department || req.departamento_solicitante,
              clasificacion_sugerida: req.classification || req.clasificacion_sugerida,
              prioridad_sugerida: req.priority || req.prioridad_sugerida,
              score_estimado: req.score || req.score_estimado,
              days_since_created:
                req.days_since_created || Math.floor((Date.now() - new Date(req.created_at).getTime()) / (1000 * 60 * 60 * 24)),
            }))
          }
        }
      } catch (e) {
        // sigue fallback abajo
      }

      // 2) Fallback: si no hay resultados por user_id, traer todas
      if (!dbRequests.length) {
        try {
          const allResp = await fetch(`/api/requests`)
          if (allResp.ok) {
            const allJson = await allResp.json()
            if (allJson?.success) {
              const list = allJson.data || []
              dbRequests = list.map((req: any) => ({
                ...req,
                titulo_solicitud: req.title || req.titulo_solicitud,
                problema_principal: req.problema_principal || req.problem || req.descripcion_problema || req.descripcion || req.description,
                objetivo_esperado: req.objetivo_esperado || req.objective || req.objetivo || req.meta,
                departamento_solicitante: req.department || req.departamento_solicitante,
                clasificacion_sugerida: req.classification || req.clasificacion_sugerida,
                prioridad_sugerida: req.priority || req.prioridad_sugerida,
                score_estimado: req.score || req.score_estimado,
                days_since_created:
                  req.days_since_created || Math.floor((Date.now() - new Date(req.created_at).getTime()) / (1000 * 60 * 60 * 24)),
              }))
            }
          }
        } catch (e) {
          // si falla, dbRequests se queda vacío y mostraremos mock
        }
      }
      
      // Combinar solicitudes: primero las de BD (más recientes), luego las mock
      const combinedRequests = [...dbRequests, ...mockRequests]
      
      // Eliminar duplicados basados en ID
      const uniqueRequests = combinedRequests.filter((req, index, self) =>
        index === self.findIndex((r) => r.id === req.id)
      )
      
      setRequests(uniqueRequests)
      
    } catch (error) {
      console.error('Error en fetchMyRequests:', error)
      // Si hay error, mostrar solo mock
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    // Filtro por texto de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(req =>
        req.titulo_solicitud?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.problema_principal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.departamento_solicitante?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(req => req.status === statusFilter)
    }

    // Ordenar por fecha de creación (más recientes primero)
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    setFilteredRequests(filtered)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending_technical_analysis: {
        label: "Análisis Técnico",
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      },
      pending_approval: {
        label: "Pendiente Aprobación",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
      },
      in_evaluation: {
        label: "En Evaluación",
        className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
      },
      approved: {
        label: "Aprobada",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      },
      rejected: {
        label: "Rechazada",
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      },
      on_hold: {
        label: "En Espera",
        className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
      }
    }

    const statusConfig = config[status as keyof typeof config] || config.pending_technical_analysis
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending_technical_analysis: <Clock className="h-4 w-4 text-blue-600" />,
      pending_approval: <Clock className="h-4 w-4 text-yellow-600" />,
      in_evaluation: <TrendingUp className="h-4 w-4 text-orange-600" />,
      approved: <CheckCircle className="h-4 w-4 text-green-600" />,
      rejected: <XCircle className="h-4 w-4 text-red-600" />,
      on_hold: <Pause className="h-4 w-4 text-gray-600" />
    }
    
    return icons[status as keyof typeof icons] || icons.pending_technical_analysis
  }

  const getPriorityBadge = (priority: string, finalPriority?: string) => {
    const effectivePriority = finalPriority || priority || 'P2'
    const colors = {
      P1: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      P2: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", 
      P3: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      P4: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
    }
    
    return (
      <Badge className={colors[effectivePriority as keyof typeof colors] || colors.P2}>
        {effectivePriority}
        {finalPriority && finalPriority !== priority && " (Ajustada)"}
      </Badge>
    )
  }

  const getProgressStatus = (request: Request) => {
    const daysSince = request.days_since_created || 0
    
    if (request.status === 'approved') {
      return { 
        message: "✅ Solicitud aprobada - En proceso de implementación", 
        color: "text-green-600",
        detailed: "Tu solicitud ha sido aprobada y será incluida en el roadmap de desarrollo."
      }
    }
    
    if (request.status === 'rejected') {
      return { 
        message: "❌ Solicitud rechazada", 
        color: "text-red-600",
        detailed: "Tu solicitud ha sido rechazada. Revisa los comentarios del líder para más información."
      }
    }

    if (request.status === 'pending_approval') {
      return {
        message: `⏳ En espera de aprobación gerencial (${daysSince} días)`,
        color: "text-yellow-600", 
        detailed: "Tu solicitud está esperando la aprobación final de gerencia."
      }
    }

    if (request.status === 'in_evaluation') {
      return {
        message: `🔄 En evaluación por líder de dominio (${daysSince} días)`,
        color: "text-orange-600",
        detailed: "Un líder técnico está evaluando los detalles de tu solicitud."
      }
    }

    if (request.status === 'on_hold') {
      return {
        message: `⏸️ Solicitud pausada (${daysSince} días)`,
        color: "text-gray-600",
        detailed: "Tu solicitud ha sido pausada temporalmente. Revisa los comentarios para más información."
      }
    }
    
    if (daysSince > 7) {
      return { 
        message: `⚠️ En análisis técnico - ${daysSince} días esperando`, 
        color: "text-orange-600",
        detailed: "Tu solicitud está en la cola de análisis técnico. El tiempo de espera es mayor al esperado."
      }
    }
    
    if (daysSince > 3) {
      return { 
        message: `🔍 En análisis técnico - ${daysSince} días`, 
        color: "text-blue-600",
        detailed: "Nuestro equipo técnico está analizando los detalles de tu solicitud."
      }
    }
    
    return { 
      message: `🆕 Recibida - ${daysSince} días`, 
      color: "text-blue-600",
      detailed: "Tu solicitud ha sido recibida y está en cola para análisis técnico inicial."
    }
  }

  const openDetailModal = async (request: Request) => {
    try {
      // Traer detalles completos por ID
      const resp = await fetch(`/api/requests/${encodeURIComponent(request.id)}`)
      let data = request as any
      if (resp.ok) {
        const json = await resp.json()
        if (json?.data) data = { ...request, ...json.data }
      }

      // Merge de alias para el modal
      const merged: Request = {
        ...(data as any),
        titulo_solicitud: data.title || data.titulo_solicitud,
        problema_principal: data.problema_principal || data.problem || data.descripcion_problema || data.descripcion || data.description,
        objetivo_esperado: data.objetivo_esperado || data.objective || data.objetivo || data.meta,
        department: data.department,
        departamento_solicitante: data.departamento_solicitante || data.department,
        clasificacion_sugerida: data.classification || data.clasificacion_sugerida,
        prioridad_sugerida: data.priority || data.prioridad_sugerida,
        score_estimado: data.score || data.score_estimado,
      }

      setSelectedRequest({
        ...merged,
        title: merged.titulo_solicitud || merged.title || "Sin título",
        department: merged.departamento_solicitante || merged.department,
      })
      setIsDetailModalOpen(true)
    } catch {
      // Si falla el fetch, abrir con lo que ya tenemos
      setSelectedRequest({
        ...request,
        title: request.titulo_solicitud || request.title || "Sin título",
        department: request.departamento_solicitante || request.department
      })
      setIsDetailModalOpen(true)
    }
  }

  const closeDetailModal = () => {
    setSelectedRequest(null)
    setIsDetailModalOpen(false)
  }

  const getTotalsByStatus = () => {
    const totals = {
      total: filteredRequests.length,
      pending: filteredRequests.filter(r => r.status.includes('pending')).length,
      in_process: filteredRequests.filter(r => ['in_evaluation', 'pending_approval'].includes(r.status)).length,
      approved: filteredRequests.filter(r => r.status === 'approved').length,
      rejected: filteredRequests.filter(r => r.status === 'rejected').length
    }
    return totals
  }

  const totals = getTotalsByStatus()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Cargando mis solicitudes...</span>
        </div>
      </div>
    )
  }

  const pageContent = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <User className="h-8 w-8 mr-3 text-blue-600" />
              Mis Solicitudes de Innovación
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Seguimiento detallado del progreso de todas tus solicitudes
            </p>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/chat'}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {totals.total}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {totals.pending}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Pendientes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {totals.in_process}
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">En Proceso</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {totals.approved}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Aprobadas</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {totals.rejected}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">Rechazadas</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* Búsqueda */}
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Buscar por título, problema o departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro de estado */}
              <div className="w-full sm:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending_technical_analysis">Análisis Técnico</SelectItem>
                    <SelectItem value="pending_approval">Pendiente Aprobación</SelectItem>
                    <SelectItem value="in_evaluation">En Evaluación</SelectItem>
                    <SelectItem value="approved">Aprobadas</SelectItem>
                    <SelectItem value="rejected">Rechazadas</SelectItem>
                    <SelectItem value="on_hold">En Espera</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                onClick={fetchMyRequests}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de solicitudes */}
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {requests.length === 0 ? "¡Bienvenido al Portal de Innovación!" : "No se encontraron solicitudes"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {requests.length === 0 
                    ? "Aún no has enviado ninguna solicitud. ¡Es hora de compartir tus ideas innovadoras!" 
                    : "No hay solicitudes que coincidan con los filtros seleccionados. Prueba ajustando los criterios de búsqueda."
                  }
                </p>
                {requests.length === 0 && (
                  <Button 
                    onClick={() => window.location.href = '/chat'}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Crear mi primera solicitud
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-260px)] pr-2">
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const progress = getProgressStatus(request)
                const hasComments = request.leader_comments && request.leader_comments.trim().length > 0
               
                return (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        
                        {/* Información principal */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {request.titulo_solicitud || "Sin título"}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                {request.problema_principal || "Sin descripción del problema"}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Building className="h-4 w-4 mr-1" />
                                  {request.departamento_solicitante || request.department || "Sin departamento"}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(request.created_at).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Estado y progreso */}
                        </div>
                        
                        {/* Estado y progreso */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(request.status)}
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="space-y-1">
                            <div className={`text-sm font-medium ${progress.color}`}>
                              {progress.message}
                            </div>
                            <p className="text-xs text-gray-500">
                              {progress.detailed}
                            </p>
                          </div>
                          
                          {/* Comentarios del líder */}
                          {hasComments && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    Comentario del líder:
                                  </div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {request.leader_comments}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Override del líder */}
                          {request.leader_override && (
                            <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Clasificación o prioridad ajustada por criterio técnico
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Acción */}
                      <div className="flex items-end justify-end">
                        <Button
                          onClick={() => openDetailModal(request)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Button>
                      </div>
                    {/* Removed stray closing div here to balance JSX */}
                  </CardContent>
                </Card>
              )
            })}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedRequest && (
        <UserRequestDetailModal
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          request={selectedRequest}
        />
      )}
    </div>
  )

  return pageContent
}
