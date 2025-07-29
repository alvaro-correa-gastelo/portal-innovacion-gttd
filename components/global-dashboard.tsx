"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe, DollarSign, Clock, AlertTriangle, Search, Filter, Eye, Download, Target } from "lucide-react"

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

  // Datos simulados para todas las solicitudes de todos los dominios
  const allRequests = [
    {
      id: 1,
      title: "Sistema de Gestión de Inventarios",
      requester: "Juan Pérez",
      domain: "Sistemas de Información",
      leader: "Leslie Hidalgo",
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
      status: "Pendiente Aprobación Gerencial",
      priority: "Alta",
      type: "Proyecto",
      createdDate: "22/07/2025",
      timeInStatus: "1d 2h",
      estimatedBudget: 25000,
      budgetRange: "$20K-$30K",
    },
    {
      id: 3,
      title: "Automatización de Reportes",
      requester: "Pedro López",
      domain: "Sistemas de Información",
      leader: "Leslie Hidalgo",
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
      status: "Pendiente Aprobación Gerencial",
      priority: "Alta",
      type: "Proyecto",
      createdDate: "26/07/2025",
      timeInStatus: "1d 6h",
      estimatedBudget: 60000,
      budgetRange: "$40K+",
    },
  ]

  // KPIs Globales Agregados
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
      title: "Presupuesto Solicitado (Q3)",
      value: `$${(allRequests.reduce((sum, req) => sum + req.estimatedBudget, 0) / 1000).toFixed(0)}K`,
      change: "68% del presupuesto anual",
      icon: DollarSign,
      color: "text-green-500",
      description: "Suma de presupuestos estimados",
    },
    {
      title: "Tiempo Promedio de Ciclo (Global)",
      value: "4.2 días",
      change: "-0.8 días vs mes anterior",
      icon: Clock,
      color: "text-purple-500",
      description: "Desde idea hasta aprobación/rechazo",
    },
    {
      title: "Salud del Proceso",
      value: "En Evaluación",
      change: "Cuello de botella identificado",
      icon: AlertTriangle,
      color: "text-orange-500",
      description: "Fase con mayor acumulación",
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "border-red-500 text-red-500"
      case "Media":
        return "border-yellow-500 text-yellow-500"
      case "Baja":
        return "border-green-500 text-green-500"
      default:
        return "border-gray-500 text-gray-500"
    }
  }

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case "Sistemas de Información":
        return "bg-blue-100 text-blue-700"
      case "Análisis de Datos":
        return "bg-purple-100 text-purple-700"
      case "Académico":
        return "bg-green-100 text-green-700"
      case "Marketing":
        return "bg-pink-100 text-pink-700"
      case "Infraestructura":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  // Obtener valores únicos para filtros
  const domains = [...new Set(allRequests.map((req) => req.domain))]
  const leaders = [...new Set(allRequests.map((req) => req.leader))]
  const budgetRanges = [...new Set(allRequests.map((req) => req.budgetRange))]

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🌍 Dashboard Global GTTD</h1>
            <p className="text-muted-foreground">Vista estratégica de toda la demanda organizacional</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Exportar Dashboard
            </Button>
            <Button className="bg-utp-blue hover:bg-utp-blue-dark text-white">
              <Target className="h-4 w-4 mr-2" />
              Vista Estratégica
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
                <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros Avanzados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros Avanzados - Todas las Solicitudes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Búsqueda global: título, solicitante, dominio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros en fila */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
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

              <Select value={leaderFilter} onValueChange={setLeaderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Líder Asignado" />
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

              <Select value="all">
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="Proyecto">Proyecto</SelectItem>
                  <SelectItem value="Requerimiento">Requerimiento</SelectItem>
                </SelectContent>
              </Select>

              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Presupuesto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los rangos</SelectItem>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
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
                Todas las Solicitudes - Vista Global
                <Badge variant="secondary" className="ml-2">
                  {filteredRequests.length} de {allRequests.length}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Exportar Tabla
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solicitud</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Dominio</TableHead>
                  <TableHead>Líder Asignado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Tiempo en Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-muted-foreground">ID: #{request.id.toString().padStart(4, "0")}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.requester}</TableCell>
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
                      <Badge variant="outline" className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          request.type === "Proyecto" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }
                      >
                        {request.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">${(request.estimatedBudget / 1000).toFixed(0)}K</TableCell>
                    <TableCell>
                      <div className="flex items-center">
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
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredRequests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron solicitudes con los filtros aplicados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen Estratégico */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 Resumen Estratégico</h3>
                <p className="text-blue-700">
                  Tienes{" "}
                  <strong>
                    {allRequests.filter((r) => r.status === "Pendiente Aprobación Gerencial").length} proyectos
                  </strong>{" "}
                  esperando tu aprobación gerencial. El presupuesto total solicitado representa el <strong>68%</strong>{" "}
                  del presupuesto anual de innovación.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  ${(allRequests.reduce((sum, req) => sum + req.estimatedBudget, 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-blue-500">Inversión Total Solicitada</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
