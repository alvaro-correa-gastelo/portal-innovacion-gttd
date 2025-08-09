"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Globe, DollarSign, Clock, AlertTriangle, Search, Filter, Eye, Download, Target, CheckCircle, FileText, TrendingUp } from "lucide-react"

interface GlobalDashboardProps {
  onOpenDetail: (request: any) => void
}

export function GlobalDashboard({ onOpenDetail }: GlobalDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [budgetFilter, setBudgetFilter] = useState("all")
  const [leaderFilter, setLeaderFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [realRequests, setRealRequests] = useState<any[]>([])

  // Cargar solicitudes reales elevadas a aprobación gerencial
  useEffect(() => {
    let cancelled = false
    const fetchPendingApprovals = async () => {
      try {
        const res = await fetch(`/api/requests?status=pending_approval`)
        if (!res.ok) throw new Error('Error al cargar aprobaciones pendientes')
        const json = await res.json()
        const data: any[] = json?.data || []
        // Normalizar a estructura utilizada en la UI del dashboard
        const normalized = data.map((r) => ({
          id: r.id,
          title: r.titulo_solicitud || r.title,
          requester: r.user_id || r.requester || 'Solicitante',
          domain: r.departamento_solicitante || r.domain || '—',
          leader: r.current_leader || r.leader || 'Líder de Dominio',
          leaderAvatar: (r.current_leader || 'LD').split(' ').map((s: string) => s[0]).join('').slice(0,2).toUpperCase(),
          status: 'Pendiente Aprobación Gerencial',
          priority: (r.prioridad_sugerida || r.priority || 'Alta').replace('P1','Alta').replace('P2','Media').replace('P3','Baja').replace('P4','Baja'),
          type: String(r.clasificacion_final || r.clasificacion_sugerida || r.classification || 'proyecto').toLowerCase() === 'proyecto' ? 'Proyecto' : 'Requerimiento',
          createdDate: r.created_at || r.submissionDate,
          timeInStatus: r.time_in_status || '—',
          estimatedBudget: r.estimated_budget || r.presupuesto_estimado || undefined,
          budgetRange: r.budget_range || undefined,
          justification: r.leader_comments || r.justification || '',
          impactAreas: r.impact_areas || [],
          riskLevel: r.risk_level || 'Medio',
          strategicAlignment: r.strategic_alignment || 'Alta',
        }))
        if (!cancelled) setRealRequests(normalized)
      } catch (e) {
        if (!cancelled) setRealRequests([])
        console.error(e)
      }
    }
    fetchPendingApprovals()
    const onRefresh = () => fetchPendingApprovals()
    try { window.addEventListener('requests:refresh', onRefresh as any) } catch {}
    return () => { cancelled = true; try { window.removeEventListener('requests:refresh', onRefresh as any) } catch {} }
  }, [])

  // Datos simulados para todas las solicitudes de todos los dominios
  const allRequests = [
    {
      id: 1,
      title: "Sistema de Gestión de Inventarios",
      requester: "Juan Pérez",
      domain: "Sistemas de Información",
      leader: "Leslie Hidalgo",
      leaderAvatar: "LH",
      status: "En Evaluación",
      priority: "Alta",
      type: "Proyecto",
      createdDate: "25/07/2025",
      timeInStatus: "2d 4h",
      estimatedBudget: 15000,
      budgetRange: "$10K-$20K",
    },
    {
      id: 2,
      title: "Dashboard BI para Reportes",
      requester: "María García",
      domain: "Análisis de Datos",
      leader: "Carlos Mendoza",
      leaderAvatar: "CM",
      status: "Pendiente Aprobación Gerencial",
      priority: "Alta",
      type: "Proyecto",
      createdDate: "22/07/2025",
      timeInStatus: "1d 2h",
      estimatedBudget: 25000,
      budgetRange: "$20K-$30K",
      justification: "Este proyecto es crítico para mejorar la toma de decisiones basada en datos. El ROI estimado es del 340% en 18 meses. Requiere aprobación gerencial por el presupuesto superior a $20K y su impacto estratégico en toda la organización.",
      impactAreas: ["Académico", "Administrativo", "Financiero"],
      riskLevel: "Medio",
      strategicAlignment: "Alta",
    },
    {
      id: 3,
      title: "Automatización de Reportes",
      requester: "Pedro López",
      domain: "Sistemas de Información",
      leader: "Leslie Hidalgo",
      leaderAvatar: "LH",
      status: "En Planificación",
      priority: "Media",
      type: "Requerimiento",
      createdDate: "20/07/2025",
      timeInStatus: "5d 1h",
      estimatedBudget: 8000,
      budgetRange: "$5K-$10K",
    },
    {
      id: 4,
      title: "Plataforma E-learning Avanzada",
      requester: "Ana Torres",
      domain: "Académico",
      leader: "Roberto Silva",
      leaderAvatar: "RS",
      status: "Nueva",
      priority: "Alta",
      type: "Proyecto",
      createdDate: "28/07/2025",
      timeInStatus: "4h 30m",
      estimatedBudget: 45000,
      budgetRange: "$40K+",
    },
    {
      id: 5,
      title: "Sistema de Gestión de Estudiantes",
      requester: "Carlos Vega",
      domain: "Académico",
      leader: "Roberto Silva",
      leaderAvatar: "RS",
      status: "En Desarrollo",
      priority: "Alta",
      type: "Proyecto",
      createdDate: "15/07/2025",
      timeInStatus: "12d 3h",
      estimatedBudget: 35000,
      budgetRange: "$30K-$40K",
    },
    {
      id: 6,
      title: "CRM para Admisiones",
      requester: "Laura Vega",
      domain: "Marketing",
      leader: "Patricia López",
      leaderAvatar: "PL",
      status: "En Evaluación",
      priority: "Media",
      type: "Proyecto",
      createdDate: "24/07/2025",
      timeInStatus: "3d 8h",
      estimatedBudget: 18000,
      budgetRange: "$10K-$20K",
    },
    {
      id: 7,
      title: "Portal de Egresados",
      requester: "Miguel Ruiz",
      domain: "Marketing",
      leader: "Patricia López",
      leaderAvatar: "PL",
      status: "Completado",
      priority: "Baja",
      type: "Requerimiento",
      createdDate: "10/07/2025",
      timeInStatus: "0d",
      estimatedBudget: 12000,
      budgetRange: "$10K-$20K",
    },
    {
      id: 8,
      title: "Infraestructura Cloud",
      requester: "Sandra Torres",
      domain: "Infraestructura",
      leader: "Miguel Herrera",
      leaderAvatar: "MH",
      status: "Pendiente Aprobación Gerencial",
      priority: "Alta",
      type: "Proyecto",
      createdDate: "26/07/2025",
      timeInStatus: "1d 6h",
      estimatedBudget: 60000,
      budgetRange: "$40K+",
      justification: "Migración crítica a infraestructura cloud para mejorar escalabilidad y reducir costos operativos. Proyecto estratégico que afectará a todos los sistemas de la universidad. Requiere aprobación por el alto presupuesto y su naturaleza transformacional.",
      impactAreas: ["Todos los Sistemas", "Seguridad", "Operaciones"],
      riskLevel: "Alto",
      strategicAlignment: "Crítica",
    },
  ]

  // KPIs Globales Agregados
  const pendingApprovals = (realRequests.length > 0 ? realRequests : allRequests).filter((r) => r.status === "Pendiente Aprobación Gerencial")
  const globalKPIs = [
    {
      title: "Solicitudes Totales Pendientes",
      value: allRequests.filter((r) => !["Completado", "Rechazado"].includes(r.status)).length.toString(),
      change: "+3 esta semana",
      icon: Globe,
      color: "text-blue-500",
      description: "Ideas en el pipeline global",
    },
    {
      title: "Requieren mi Aprobación",
      value: pendingApprovals.length.toString(),
      change: "2 urgentes",
      icon: CheckCircle,
      color: "text-orange-500",
      description: "Proyectos elevados por líderes",
    },
    {
      title: "Presupuesto Solicitado (Q3)",
      value: `$${(allRequests.reduce((sum, req) => sum + req.estimatedBudget, 0) / 1000).toFixed(0)}K`,
      change: "68% del presupuesto anual",
      icon: DollarSign,
      color: "text-green-500",
      description: "Suma de presupuestos estimados",
    },
    {
      title: "Tiempo Promedio de Ciclo",
      value: "4.2 días",
      change: "-0.8 días vs mes anterior",
      icon: Clock,
      color: "text-purple-500",
      description: "Desde idea hasta aprobación/rechazo",
    },
  ]

  // Filtrar solicitudes
  const getFilteredRequests = () => {
    let filtered = allRequests

    if (searchQuery) {
      filtered = filtered.filter(
        (req) =>
          req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.domain.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (domainFilter !== "all") {
      filtered = filtered.filter((req) => req.domain === domainFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((req) => req.priority === priorityFilter)
    }

    if (budgetFilter !== "all") {
      filtered = filtered.filter((req) => req.budgetRange === budgetFilter)
    }

    if (leaderFilter !== "all") {
      filtered = filtered.filter((req) => req.leader === leaderFilter)
    }

    return filtered
  }

  const filteredRequests = getFilteredRequests()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nueva":
        return "bg-blue-500"
      case "En Evaluación":
        return "bg-yellow-500"
      case "En Planificación":
        return "bg-purple-500"
      case "En Desarrollo":
        return "bg-green-500"
      case "Pendiente Aprobación Gerencial":
        return "bg-orange-500"
      case "Completado":
        return "bg-green-600"
      case "Rechazado":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getOldPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "border-red-500 dark:border-red-400 text-red-500 dark:text-red-400"
      case "Media":
        return "border-yellow-500 dark:border-yellow-400 text-yellow-500 dark:text-yellow-400"
      case "Baja":
        return "border-green-500 dark:border-green-400 text-green-500 dark:text-green-400"
      default:
        return "border-gray-500 dark:border-gray-400 text-gray-500 dark:text-gray-400"
    }
  }

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case "Sistemas de Información":
        return "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
      case "Análisis de Datos":
        return "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
      case "Académico":
        return "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300"
      case "Marketing":
        return "bg-pink-100 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
      case "Infraestructura":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
    }
  }

  // Obtener valores únicos para filtros
  const domains = [...new Set(allRequests.map((req) => req.domain))]
  const leaders = [...new Set(allRequests.map((req) => req.leader))]
  const budgetRanges = [...new Set(allRequests.map((req) => req.budgetRange))]

  // Funciones auxiliares para aprobaciones
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
      case "Media":
        return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
      case "Baja":
        return "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Alto":
        return "text-red-600 dark:text-red-400"
      case "Medio":
        return "text-yellow-600 dark:text-yellow-400"
      case "Bajo":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getUrgencyIndicator = (timeWaiting: string) => {
    const hours =
      parseInt(timeWaiting.split("d")[0]) * 24 +
      (parseInt((timeWaiting.split("h")[0].split(" ").pop() || '0')) || 0)
    if (hours > 48) return { color: "text-red-500", icon: "🔴", label: "Urgente" }
    if (hours > 24) return { color: "text-yellow-500", icon: "🟡", label: "Atención" }
    return { color: "text-green-500", icon: "🟢", label: "Normal" }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🌍 Centro de Control Global</h1>
            <p className="text-muted-foreground">Dashboard estratégico con aprobaciones integradas</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300">
              {pendingApprovals.length} aprobaciones pendientes
            </Badge>
            <Button variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPIs Globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {globalKPIs.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{kpi.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">📊 Vista General</TabsTrigger>
            <TabsTrigger value="approvals" className="relative">
              ⚡ Aprobaciones Urgentes
              {pendingApprovals.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-red-500 text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {pendingApprovals.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab de Vista General */}
          <TabsContent value="overview" className="space-y-6">
            {/* Resumen Estratégico */}
            <Card className="bg-gradient-to-r from-blue-50 dark:from-blue-950/30 to-purple-50 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">📈 Resumen Estratégico del Periodo</h3>
                    <p className="text-blue-700 dark:text-blue-300">
                      Tienes <strong>{pendingApprovals.length} proyectos</strong> esperando tu aprobación gerencial.
                      El presupuesto total solicitado representa el <strong>68%</strong> del presupuesto anual de innovación.
                      <br />La tendencia muestra un <strong>+12% de crecimiento</strong> en solicitudes vs mes anterior.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${(allRequests.reduce((sum, req) => sum + req.estimatedBudget, 0) / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-blue-500 dark:text-blue-400">Inversión Total Solicitada</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filtros Simplificados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros - Todas las Solicitudes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título, solicitante o dominio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filtros principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Select value={domainFilter} onValueChange={setDomainFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Dominio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los dominios</SelectItem>
                      {domains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Nueva">Nueva</SelectItem>
                      <SelectItem value="En Evaluación">En Evaluación</SelectItem>
                      <SelectItem value="En Planificación">En Planificación</SelectItem>
                      <SelectItem value="En Desarrollo">En Desarrollo</SelectItem>
                      <SelectItem value="Pendiente Aprobación Gerencial">Pendiente Aprobación</SelectItem>
                      <SelectItem value="Completado">Completado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={leaderFilter} onValueChange={setLeaderFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Líder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los líderes</SelectItem>
                      {leaders.map((leader) => (
                        <SelectItem key={leader} value={leader}>
                          {leader}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tabla Principal: Todas las Solicitudes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Todas las Solicitudes
                    <Badge variant="secondary" className="ml-2">
                      {filteredRequests.length} de {allRequests.length}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Solicitud</TableHead>
                        <TableHead>Dominio</TableHead>
                        <TableHead>Líder</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Prioridad</TableHead>
                        <TableHead>Presupuesto</TableHead>
                        <TableHead>Tiempo</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.slice(0, 8).map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.title}</p>
                              <p className="text-sm text-muted-foreground">{request.requester}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getDomainColor(request.domain)}>
                              {request.domain}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{request.leader}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={`${getStatusColor(request.status)} text-white text-xs`}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getOldPriorityColor(request.priority)}>
                              {request.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">${(request.estimatedBudget / 1000).toFixed(0)}K</TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                              {request.timeInStatus}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onOpenDetail(request)}
                              className="bg-transparent"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredRequests.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No se encontraron solicitudes con los filtros aplicados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Aprobaciones Urgentes */}
          <TabsContent value="approvals" className="space-y-6">
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((request) => {
                  const urgency = getUrgencyIndicator(request.timeInStatus)

                  return (
                    <Card key={request.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500 dark:border-l-orange-600">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Header de la tarjeta */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold">{request.title}</h3>
                                <Badge variant="secondary" className={getPriorityColor(request.priority)}>
                                  {request.priority}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className={
                                    request.type === "Proyecto"
                                      ? "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
                                      : "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                                  }
                                >
                                  {request.type}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>ID: #{request.id.toString().padStart(4, "0")}</span>
                                <span>•</span>
                                <span>Solicitante: {request.requester}</span>
                                <span>•</span>
                                <span>Dominio: {request.domain}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">${(request.estimatedBudget / 1000).toFixed(0)}K</div>
                              <div className={`text-sm ${urgency.color}`}>
                                {urgency.icon} {urgency.label}
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Información del Líder que eleva */}
                          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">{request.leaderAvatar}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">Elevado por: {request.leader}</p>
                              <p className="text-sm text-muted-foreground">
                                {request.createdDate} • Esperando {request.timeInStatus}
                              </p>
                            </div>
                          </div>

                          {/* Justificación del Líder */}
                          {request.justification && (
                            <div className="space-y-2">
                              <h4 className="font-medium flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                Justificación del Líder:
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-l-blue-500 dark:border-l-blue-600">
                                {request.justification}
                              </p>
                            </div>
                          )}

                          {/* Métricas Estratégicas (con fallbacks) */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Áreas de Impacto</h5>
                              <div className="flex flex-wrap gap-1">
                                {(request.impactAreas && request.impactAreas.length > 0
                                  ? request.impactAreas
                                  : [request.domain || request.department || '—']
                                ).map((area: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {area || '—'}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nivel de Riesgo</h5>
                              <p className={`text-sm font-medium ${getRiskColor(request.riskLevel || 'Medio')}`}>{request.riskLevel || 'Medio'}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Alineación Estratégica
                              </h5>
                              <p className={`text-sm font-semibold ${
                                (request.strategicAlignment || 'Alta') === "Crítica" 
                                  ? "text-purple-600 dark:text-purple-400" 
                                  : "text-blue-600 dark:text-blue-400"
                              }`}>
                                {request.strategicAlignment || 'Alta'}
                              </p>
                            </div>
                          </div>

                          {/* Botones de Acción */}
                          <div className="flex space-x-3 pt-2">
                            <Button
                              onClick={() => onOpenDetail(request)}
                              className="flex-1 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white"
                            >
                              <FileText className="h-4 w-4 mr-2" />🔍 Revisar y Decidir
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">¡No hay aprobaciones pendientes!</h3>
                  <p className="text-muted-foreground">
                    Todas las solicitudes están siendo procesadas por los líderes de dominio.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
