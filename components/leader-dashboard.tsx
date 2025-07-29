"use client"

import { useState } from "react"
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

  // Datos simulados de solicitudes del dominio
  const domainRequests = [
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
      title: "Nuevas Solicitudes en mi Dominio",
      value: "12",
      change: "+3 esta semana",
      changeType: "increase",
      icon: AlertCircle,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Mi Tiempo Promedio de Evaluación",
      value: "2.8 días",
      change: "-0.5 días vs mes anterior",
      changeType: "decrease",
      icon: Timer,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      title: "Capacidad de mi Equipo",
      value: "78%",
      change: "6 miembros activos",
      changeType: "neutral",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      title: "Presupuesto Ejecutado",
      value: "$68K",
      change: "54% del presupuesto anual",
      changeType: "neutral",
      icon: Target,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
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
            <Card key={index} className={`${kpi.bgColor} ${kpi.borderColor} border-l-4 hover:shadow-md transition-shadow`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</p>
                    <div className="flex items-center mt-2">
                      {kpi.changeType === "increase" && <ArrowUp className="w-4 h-4 text-green-500 mr-1" />}
                      {kpi.changeType === "decrease" && <ArrowDown className="w-4 h-4 text-green-500 mr-1" />}
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

        {/* Tabla Principal: Solicitudes de mi Dominio */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Solicitudes de mi Dominio
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona las solicitudes asignadas a tu área de responsabilidad
            </p>
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
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Solicitud</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Solicitante</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Prioridad</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Presupuesto</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDomainRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{request.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{request.id}</p>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenDetail(request)}
                            className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalle
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
