"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RequestDetailModal } from "./request-detail-modal"
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  TrendingUp,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Users,
  Timer,
  Target,
  AlertCircle,
} from "lucide-react"

interface LeaderDashboardProps {
  userRole: "lider_dominio" | "lider_gerencial"
  onOpenDetail: (request: any) => void
}

export function LeaderDashboard({ userRole, onOpenDetail }: LeaderDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  // Determina el estado de presentación para el líder de dominio.
  // Si NO existe clasificación/prioridad final (solo sugeridas), se fuerza "Nueva" para que aparezca en la bandeja de categorización.
  const computeDisplayStatus = (r: any) => {
    const hasFinalClassification = Boolean(r?.clasificacion_final)
    const hasFinalPriority = Boolean(r?.prioridad_final)

    if (!hasFinalClassification && !hasFinalPriority) {
      return "Nueva"
    }

    // Mapear estado crudo a etiqueta visible sin depender de funciones definidas más abajo
    switch (r?.status) {
      case "pending_technical_analysis":
        return "Análisis Técnico"
      case "pending_approval":
        return "Pendiente Aprobación Gerencial"
      case "in_evaluation":
        return "En Evaluación"
      case "approved":
        return "Aprobada"
      case "rejected":
        return "Rechazada"
      case "on_hold":
        return "En Espera"
      default:
        return "Nueva"
    }
  }

  // Mapea porcentaje de avance por estado y tipo
  const computeProgressPercent = (status: string, type: string) => {
    if (status === "Nueva") return 0
    if (type === "Requerimiento") {
      if (status === "En Evaluación") return 30
      if (status === "Pendiente" || status === "Pendiente Aprobación Gerencial") return 60
      return 100
    }
    // Proyecto
    if (status === "En Evaluación") return 20
    if (status === "En Planificación") return 50
    if (status === "Pendiente" || status === "Pendiente Aprobación Gerencial") return 80
    return 100
  }

  // Datos reales del backend
  const [realRequests, setRealRequests] = useState<any[]>([])

  // Cargar solicitudes del dominio y refrescar ante eventos SPA
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      await fetchDomainRequests()
    }
    load()
    const onRefresh = () => load()
    try { window.addEventListener('requests:refresh', onRefresh as any) } catch {}
    return () => { cancelled = true; try { window.removeEventListener('requests:refresh', onRefresh as any) } catch {} }
  }, [])

  const mapStatusToDisplay = (status?: string) => {
    switch (status) {
      case "pending_technical_analysis":
        return "Análisis Técnico"
      case "pending_approval":
        return "Pendiente Aprobación Gerencial"
      case "in_evaluation":
        return "En Evaluación"
      case "approved":
        return "Aprobada"
      case "rejected":
        return "Rechazada"
      case "on_hold":
        return "En Espera"
      default:
        return "Nueva"
    }
  }

  const mapPriorityToDisplay = (p?: string) => {
    // Soporta P1/P2/P3 o Alta/Media/Baja
    if (!p) return "Media"
    const up = String(p).toUpperCase()
    if (up === "P1" || up === "ALTA") return "Alta"
    if (up === "P2" || up === "MEDIA") return "Media"
    if (up === "P3" || up === "BAJA") return "Baja"
    return "Media"
  }

  const fetchDomainRequests = async () => {
    try {
      const resp = await fetch(`/api/requests`)
      if (!resp.ok) return
      const json = await resp.json()
      const list = (json?.data ?? json ?? []) as any[]
      const formatted = list.map((r) => ({
        id: r.id,
        title: r.titulo_solicitud || r.title || "Sin título",
        // Tipo visible: usar final si existe; si no, sugerido, pero sin cambiar el estado a avanzado
        type: String(r.clasificacion_final || r.clasificacion_sugerida || r.classification || '')
                .toLowerCase() === 'proyecto' ? 'Proyecto' : 'Requerimiento',
        requester: r.user_id || r.requester || "",
        department: r.departamento_solicitante || r.department || "",
        // Estado visible: si no hay final (solo sugerido), forzar "Nueva"
        status: computeDisplayStatus(r),
        // Prioridad visible: usar final si existe, de lo contrario sugerida
        priority: mapPriorityToDisplay(r.prioridad_final || r.prioridad_sugerida),
        estimatedBudget: r.presupuesto_estimado ? `$${r.presupuesto_estimado}` : undefined,
        submissionDate: r.created_at || "",
        daysInStatus: r.days_since_created || 0,
        description: r.problema_principal || r.description || "",
        impact: r.objetivo_esperado || r.impact || "",
      }))
      setRealRequests(formatted)
    } catch {}
  }

  // Bandeja de aprobaciones gerenciales (solo para lider_gerencial)
  const [managerApprovals, setManagerApprovals] = useState<any[]>([])
  useEffect(() => {
    if (userRole !== 'lider_gerencial') return
    let cancelled = false
    const load = async () => {
      try {
        const resp = await fetch(`/api/requests?status=pending_approval`)
        if (!resp.ok) { if (!cancelled) setManagerApprovals([]); return }
        const json = await resp.json()
        const arr: any[] = json?.data || []
        const normalized = arr.map((r) => ({
          id: r.id,
          title: r.titulo_solicitud || r.title || 'Sin título',
          requester: r.user_id || r.requester || '',
          department: r.departamento_solicitante || r.department || '',
          type: String(r.clasificacion_final || r.clasificacion_sugerida || r.classification || '')
                  .toLowerCase() === 'proyecto' ? 'Proyecto' : 'Requerimiento',
          status: mapStatusToDisplay(r.status),
          priority: mapPriorityToDisplay(r.prioridad_final || r.prioridad_sugerida),
          estimatedBudget: r.presupuesto_estimado ? `$${r.presupuesto_estimado}` : undefined,
          submissionDate: r.created_at || '',
        }))
        if (!cancelled) setManagerApprovals(normalized)
      } catch {
        if (!cancelled) setManagerApprovals([])
      }
    }
    load()
    const onRefresh = () => load()
    try { window.addEventListener('requests:refresh', onRefresh as any) } catch {}
    return () => { cancelled = true; try { window.removeEventListener('requests:refresh', onRefresh as any) } catch {} }
  }, [userRole])

  // Datos simulados de solicitudes del dominio
  const mockDomainRequests = [
    {
      id: "REQ-2025-001",
      title: "Sistema de Gestión de Inventarios TI",
      type: "Requerimiento",
      requester: "Juan Pérez",
      department: "Sistemas",
      status: "En Evaluación",
      priority: "Alta",
      estimatedBudget: "$15,000",
      submissionDate: "2025-01-20",
      daysInStatus: 3,
      description: "Necesitamos un sistema para gestionar inventarios de equipos de TI con seguimiento en tiempo real y alertas automáticas",
      impact: "Reducir pérdidas por 40%, mejorar eficiencia operativa",
    },
    {
      id: "PROJ-2025-002",
      title: "Plataforma de Análisis Predictivo",
      type: "Proyecto",
      requester: "María González",
      department: "Desarrollo",
      status: "Nueva",
      priority: "Media",
      estimatedBudget: "$45,000",
      submissionDate: "2025-01-22",
      daysInStatus: 1,
      description: "Desarrollo de una plataforma de análisis predictivo para optimizar recursos académicos",
      impact: "Mejora en planificación académica del 25%",
    },
    {
      id: "REQ-2025-003",
      title: "Automatización de Reportes",
      type: "Requerimiento",
      requester: "Carlos Mendoza",
      department: "Operaciones",
      status: "En Evaluación",
      priority: "Baja",
      estimatedBudget: "$8,000",
      submissionDate: "2025-01-18",
      daysInStatus: 5,
      description: "Automatizar la generación de reportes mensuales y notificaciones",
      impact: "Ahorro de 20 horas/mes en tareas manuales",
    },
    {
      id: "REQ-2025-004",
      title: "Migración a Cloud",
      type: "Proyecto",
      requester: "Ana García",
      department: "Infraestructura",
      status: "Pendiente",
      priority: "Alta",
      estimatedBudget: "$75,000",
      submissionDate: "2025-01-15",
      daysInStatus: 8,
      description: "Migración de servicios críticos a infraestructura cloud",
      impact: "Reducción de costos operativos del 30%",
    },
  ]

  // Combinar reales + mocks (reales primero)
  const domainRequests = useMemo(() => {
    return [...realRequests, ...mockDomainRequests]
  }, [realRequests])

  // Soporte SPA: escuchar eventos globales para refrescar y abrir modales sin recargar
  useEffect(() => {
    const onRefresh = () => {
      fetchDomainRequests()
    }

    const onOpen = (ev: Event) => {
      const custom = ev as CustomEvent<{ id?: string }>
      const id = custom?.detail?.id
      if (!id) return

      // Buscar primero en las listas locales
      const foundLocal = [...domainRequests].find(r => r.id === id)
      const openFrom = (req: any) => {
        try {
          onOpenDetail(req)
        } catch {}
      }

      if (foundLocal) {
        openFrom(foundLocal)
      } else {
        ;(async () => {
          try {
            const resp = await fetch(`/api/requests/${encodeURIComponent(id)}`)
            if (resp.ok) {
              const json = await resp.json()
              const data = json?.data ?? json
              if (data) openFrom(data)
            }
          } catch {
            // Silenciar errores en apertura automática
          }
        })()
      }
    }

    try {
      // fetch inicial
      fetchDomainRequests()
      window.addEventListener('requests:refresh', onRefresh as EventListener)
      window.addEventListener('open_request', onOpen as EventListener)
    } catch {}

    return () => {
      try {
        window.removeEventListener('requests:refresh', onRefresh as EventListener)
        window.removeEventListener('open_request', onOpen as EventListener)
      } catch {}
    }
  }, [])

  // Datos simulados de solicitudes en colaboración
  const collaborationRequests = [
    {
      id: "PROJ-2025-005",
      title: "Portal Estudiantil Unificado",
      type: "Proyecto",
      requester: "Pedro López",
      domain: "Desarrollo Académico",
      status: "En Planificación",
      priority: "Alta",
      estimatedBudget: "$120,000",
      mentionedBy: "Luis Ramírez",
      reason: "Requiere integración con sistemas de TI",
    },
    {
      id: "REQ-2025-006",
      title: "Sistema de Videoconferencias",
      type: "Requerimiento",
      requester: "Carmen Silva",
      domain: "Recursos Humanos",
      status: "En Evaluación",
      priority: "Media",
      estimatedBudget: "$25,000",
      mentionedBy: "Ana Torres",
      reason: "Necesita infraestructura de red",
    },
  ]

  // KPIs mejorados del dashboard
  const kpis = [
    {
      title: "Nuevas por Categorizar",
      value: "4",
      change: "Requieren tu evaluación",
      changeType: "attention",
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      urgent: true,
    },
    {
      title: "Progreso General",
      value: "73%",
      change: "Reqs: 8/10 • Proyectos: 3/5",
      changeType: "neutral",
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Mi Eficiencia",
      value: "1.8 días",
      change: "Tiempo promedio de respuesta",
      changeType: "decrease",
      icon: Timer,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: "Capacidad Restante",
      value: "$42K",
      change: "Disponible este trimestre",
      changeType: "neutral",
      icon: DollarSign,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
  ]

  // Funciones de filtrado
  const filteredDomainRequests = domainRequests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.type === typeFilter
    const matchesPriority = priorityFilter === "all" || request.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesType && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nueva":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      case "En Evaluación":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "Pendiente":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
      case "En Planificación":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
      case "Aprobada":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      case "Rechazada":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
      case "Media":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "Baja":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getTypeColor = (type: string) => {
    return type === "Proyecto"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard de mi Dominio</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona las solicitudes de tu área de responsabilidad
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Infraestructura TI
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Leslie Hidalgo
            </Badge>
          </div>
        </div>

        {/* KPIs Superiores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <Card key={index} className={`${kpi.bgColor} ${kpi.borderColor} border-l-4 hover:shadow-md transition-shadow ${kpi.urgent ? 'animate-pulse' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</p>
                      {kpi.urgent && <Badge variant="destructive" className="text-xs">¡Urgente!</Badge>}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</p>
                    <div className="flex items-center mt-2">
                      {kpi.changeType === "increase" && <ArrowUp className="w-4 h-4 text-green-500 mr-1" />}
                      {kpi.changeType === "decrease" && <ArrowDown className="w-4 h-4 text-green-500 mr-1" />}
                      {kpi.changeType === "attention" && <AlertCircle className="w-4 h-4 text-red-500 mr-1" />}
                      <span className="text-xs text-gray-600 dark:text-gray-400">{kpi.change}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Barra de Herramientas */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Búsqueda */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar solicitudes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Estados</SelectItem>
                    <SelectItem value="Nueva">Nueva</SelectItem>
                    <SelectItem value="En Evaluación">En Evaluación</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En Planificación">En Planificación</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Tipos</SelectItem>
                    <SelectItem value="Proyecto">Proyecto</SelectItem>
                    <SelectItem value="Requerimiento">Requerimiento</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Prioridades</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Mostrando {filteredDomainRequests.length} de {domainRequests.length} solicitudes
            </div>
          </CardContent>
        </Card>

        {/* Sección de Categorización de Solicitudes Nuevas */}
        {filteredDomainRequests.filter(r => r.status === "Nueva").length > 0 && (
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                🔥 Solicitudes Nuevas - Requieren Categorización
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                  {filteredDomainRequests.filter(r => r.status === "Nueva").length} pendientes
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Estas solicitudes necesitan que definas su prioridad y tipo antes de continuar
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDomainRequests.filter(r => r.status === "Nueva").map((request) => (
                  <Card key={`new-${request.id}`} className="bg-white dark:bg-gray-800 border-orange-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{request.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{request.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📅 {request.submissionDate}</span>
                            <span>👤 {request.requester}</span>
                            <span>💰 {request.estimatedBudget}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <div className="flex gap-2">
                            <Select defaultValue={request.priority}>
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Prioridad" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Alta">🔴 Alta</SelectItem>
                                <SelectItem value="Media">🟡 Media</SelectItem>
                                <SelectItem value="Baja">🟢 Baja</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select defaultValue={request.type}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Proyecto">🚀 Proyecto</SelectItem>
                                <SelectItem value="Requerimiento">📋 Requerimiento</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              ✅ Categorizar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => onOpenDetail(request)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla Principal: Solicitudes de mi Dominio */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Gestión de Solicitudes
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Solicitudes categorizadas y en proceso
                </p>
              </div>
              {/* Progreso de requerimientos y proyectos */}
              <div className="flex flex-col gap-2 text-right">
                <div className="text-sm">
                  <span className="text-gray-500">Requerimientos: </span>
                  <span className="font-semibold text-green-600">8/10 completados</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Proyectos: </span>
                  <span className="font-semibold text-blue-600">3/5 en progreso</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDomainRequests.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No se encontraron solicitudes con los filtros aplicados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Solicitud & Progreso</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Solicitante</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Estado & Tiempo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Prioridad</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Presupuesto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDomainRequests.filter(r => r.status !== "Nueva").map((request) => {
                      const progressPercent = computeProgressPercent(request.status, request.type)
                      
                      return (
                        <tr key={request.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{request.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{request.id}</p>
                              {/* Barra de progreso */}
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    request.type === "Proyecto" ? "bg-purple-500" : "bg-blue-500"
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{progressPercent}% completado</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-gray-900 dark:text-gray-100">{request.requester}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{request.department}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {request.daysInStatus} días
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className={getTypeColor(request.type)}>
                              {request.type}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{request.estimatedBudget}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onOpenDetail(request)}
                                className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Evaluar
                              </Button>
                              {request.type === "Proyecto" && request.status === "En Evaluación" && (
                                <Button
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  🚀 Elevar
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aprobaciones Gerenciales (solo líder gerencial) */}
        {userRole === 'lider_gerencial' && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Aprobaciones Gerenciales Pendientes
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Solicitudes elevadas por líderes de dominio en espera de tu decisión
              </p>
            </CardHeader>
            <CardContent>
              {managerApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No tienes aprobaciones pendientes</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 dark:text-gray-400">
                        <th className="py-3 px-4">Solicitud</th>
                        <th className="py-3 px-4">Solicitante</th>
                        <th className="py-3 px-4">Dominio</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4">Prioridad</th>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4">Presupuesto</th>
                        <th className="py-3 px-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {managerApprovals.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-4 px-4 font-medium text-gray-900 dark:text-gray-100">{req.title}</td>
                          <td className="py-4 px-4">{req.requester}</td>
                          <td className="py-4 px-4">{req.department || '—'}</td>
                          <td className="py-4 px-4"><Badge className={getStatusColor(req.status)}>{req.status}</Badge></td>
                          <td className="py-4 px-4"><Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge></td>
                          <td className="py-4 px-4"><Badge className={getTypeColor(req.type)}>{req.type}</Badge></td>
                          <td className="py-4 px-4">{req.estimatedBudget || '—'}</td>
                          <td className="py-4 px-4">
                            <Button
                              size="sm"
                              onClick={() => onOpenDetail(req)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Revisar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabla Secundaria: Solicitudes en Colaboración */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Solicitudes en Colaboración
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Solicitudes de otros dominios donde has sido mencionado para colaborar
            </p>
          </CardHeader>
          <CardContent>
            {collaborationRequests.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No tienes solicitudes de colaboración pendientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {collaborationRequests.map((request) => (
                  <Card key={request.id} className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{request.title}</h4>
                            <Badge variant="secondary" className={getTypeColor(request.type)}>
                              {request.type}
                            </Badge>
                            <Badge variant="secondary" className={getPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Dominio:</span>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{request.domain}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Mencionado por:</span>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{request.mentionedBy}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Razón:</span>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{request.reason}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenDetail(request)}
                            className="hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalle
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
