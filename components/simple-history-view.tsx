"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText,
  Calendar,
  Filter,
  Search,
  Grid3X3,
  List,
  PlusCircle,
  Brain,
  Rocket,
  PauseCircle,
  RotateCcw,
  MessageCircle
} from "lucide-react"
import { UTPHeader } from "@/components/ui/utp-logo"

interface SimpleHistoryViewProps {
  onOpenTracking: (request: any) => void
  onViewChange?: (view: string) => void
}

export default function SimpleHistoryView({ onOpenTracking, onViewChange }: SimpleHistoryViewProps) {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [viewMode, setViewMode] = useState("list")
  const [searchQuery, setSearchQuery] = useState("")

  // Datos expandidos de solicitudes del usuario
  const requests = [
    {
      id: 1,
      title: "Sistema de Gestión de Inventarios",
      createdDate: "25/07/2025",
      status: "En Planificación",
      statusColor: "bg-blue-600",
      type: "Proyecto",
      priority: "Alta",
      description: "Sistema para automatizar el control de inventarios",
      hasUnreadMessages: true,
      messageCount: 3,
      estimatedWeeks: "14-16",
      leadAssigned: "Leslie Hidalgo"
    },
    {
      id: 2,
      title: "Dashboard BI para Reportes",
      createdDate: "22/07/2025", 
      status: "En Desarrollo",
      statusColor: "bg-indigo-600",
      type: "Proyecto",
      priority: "Media",
      description: "Dashboard de inteligencia de negocios",
      hasUnreadMessages: false,
      messageCount: 0,
      estimatedWeeks: "8-10",
      leadAssigned: "Carlos Mendoza"
    },
    {
      id: 3,
      title: "Sistema de Reportes Automáticos",
      createdDate: "15/07/2025",
      status: "Completada",
      statusColor: "bg-green-600",
      type: "Requerimiento",
      priority: "Media",
      description: "Automatización de reportes mensuales",
      hasUnreadMessages: false,
      messageCount: 0,
      estimatedWeeks: "Completado",
      leadAssigned: "Ana García"
    },
    {
      id: 4,
      title: "Integración API de Pagos",
      createdDate: "20/07/2025",
      status: "Rechazada",
      statusColor: "bg-red-600",
      type: "Integración",
      priority: "Alta",
      description: "Integración con pasarelas de pago",
      hasUnreadMessages: true,
      messageCount: 1,
      estimatedWeeks: "N/A",
      leadAssigned: "María Flores"
    },
    {
      id: 5,
      title: "Automatización de Procesos RR.HH.",
      createdDate: "18/07/2025",
      status: "Nueva",
      statusColor: "bg-purple-600",
      type: "Automatización",
      priority: "Baja",
      description: "Automatización de procesos de recursos humanos",
      hasUnreadMessages: false,
      messageCount: 0,
      estimatedWeeks: "Por definir",
      leadAssigned: "Pendiente"
    },
    {
      id: 6,
      title: "App Móvil de Consultas",
      createdDate: "16/07/2025",
      status: "En Evaluación",
      statusColor: "bg-yellow-600",
      type: "Aplicación",
      priority: "Media",
      description: "Aplicación móvil para consultas estudiantiles",
      hasUnreadMessages: true,
      messageCount: 2,
      estimatedWeeks: "Por evaluar",
      leadAssigned: "Roberto Silva"
    },
    {
      id: 7,
      title: "Sistema de Videoconferencias",
      createdDate: "12/07/2025",
      status: "En Pausa",
      statusColor: "bg-orange-600",
      type: "Sistema",
      priority: "Baja",
      description: "Plataforma interna de videoconferencias",
      hasUnreadMessages: false,
      messageCount: 0,
      estimatedWeeks: "En pausa",
      leadAssigned: "Leslie Hidalgo"
    },
    {
      id: 8,
      title: "Migración Base de Datos",
      createdDate: "10/07/2025",
      status: "Cancelada",
      statusColor: "bg-gray-600",
      type: "Migración",
      priority: "Alta",
      description: "Migración de base de datos legacy",
      hasUnreadMessages: false,
      messageCount: 0,
      estimatedWeeks: "Cancelado",
      leadAssigned: "Carlos Mendoza"
    }
  ]

  const filteredRequests = requests.filter((request) => {
    // Filtro por búsqueda
    const matchesSearch = searchQuery === "" ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.type.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    // Filtro por estado
    if (selectedFilter === "all") return true
    if (selectedFilter === "active") return !["Completada", "Rechazada", "Cancelada"].includes(request.status)
    if (selectedFilter === "completed") return request.status === "Completada"
    if (selectedFilter === "pending") return ["Nueva", "En Evaluación"].includes(request.status)
    if (selectedFilter === "in-progress") return ["En Planificación", "En Desarrollo"].includes(request.status)
    if (selectedFilter === "on-hold") return ["En Pausa"].includes(request.status)
    if (selectedFilter === "rejected") return ["Rechazada", "Cancelada"].includes(request.status)
    if (selectedFilter === "with-messages") return request.hasUnreadMessages
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completada":
        return CheckCircle
      case "Rechazada":
      case "Cancelada":
        return XCircle
      case "En Desarrollo":
        return Rocket
      case "En Planificación":
        return Brain
      case "En Pausa":
        return PauseCircle
      case "En Evaluación":
      case "Nueva":
        return Clock
      default:
        return AlertCircle
    }
  }

  const stats = {
    total: requests.length,
    active: requests.filter((r) => !["Completada", "Rechazada", "Cancelada"].includes(r.status)).length,
    completed: requests.filter((r) => r.status === "Completada").length,
    pending: requests.filter((r) => ["Nueva", "En Evaluación"].includes(r.status)).length,
    inProgress: requests.filter((r) => ["En Planificación", "En Desarrollo"].includes(r.status)).length,
    withMessages: requests.filter((r) => r.hasUnreadMessages).length,
  }

  // Configuración de columnas Kanban simplificada
  const kanbanColumns = [
    {
      id: "pending",
      title: "Esperando Revisión",
      color: "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800",
      statuses: ["Nueva", "En Evaluación"],
      icon: Clock
    },
    {
      id: "in-progress", 
      title: "En Desarrollo",
      color: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800",
      statuses: ["En Planificación", "En Desarrollo"],
      icon: Rocket
    },
    {
      id: "completed",
      title: "Completadas",
      color: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800",
      statuses: ["Completada"],
      icon: CheckCircle
    },
    {
      id: "other",
      title: "Otras",
      color: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20 border-gray-200 dark:border-gray-800",
      statuses: ["Rechazada", "Cancelada", "En Pausa"],
      icon: XCircle
    }
  ]

  const getRequestsByColumn = (columnId: string) => {
    const column = kanbanColumns.find(col => col.id === columnId)
    if (!column) return []
    return filteredRequests.filter(request => column.statuses.includes(request.status))
  }

  const renderKanbanView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kanbanColumns.map((column) => {
          const columnRequests = getRequestsByColumn(column.id)
          const ColumnIcon = column.icon
          
          return (
            <div key={column.id} className="space-y-3">
              {/* Header de columna simplificado */}
              <Card className={`${column.color} border`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ColumnIcon className="h-4 w-4" />
                      <h3 className="font-medium text-sm">{column.title}</h3>
                    </div>
                    <Badge variant="secondary" className="bg-white/90 text-gray-700 text-xs">
                      {columnRequests.length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Tarjetas de solicitudes simplificadas */}
              <div className="space-y-3 min-h-[300px]">
                {columnRequests.map((request) => {
                  return (
                    <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Título y mensajes */}
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm leading-tight group-hover:text-utp-blue dark:group-hover:text-utp-red transition-colors flex-1 pr-2">
                              {request.title}
                            </h4>
                            {request.hasUnreadMessages && (
                              <div className="flex items-center space-x-1 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                                <MessageCircle className="w-3 h-3 text-red-600" />
                                <span className="text-xs text-red-600 font-medium">{request.messageCount} nuevos</span>
                              </div>
                            )}
                          </div>

                          {/* Estado */}
                          <Badge 
                            variant="secondary" 
                            className={`${request.statusColor} text-white text-xs w-fit`}
                          >
                            {request.status}
                          </Badge>

                          {/* Fecha */}
                          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{request.createdDate}</span>
                          </div>

                          {/* Líder asignado si existe */}
                          {request.leadAssigned !== "Pendiente" && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Asignado a:</span> {request.leadAssigned}
                            </div>
                          )}

                          {/* Botones de acción - Siempre ambos botones */}
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Abrir panel de tracking en línea de tiempo
                                onOpenTracking({ ...request, defaultTab: 'timeline' })
                              }}
                              className="flex-1 h-8 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver Seguimiento
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Abrir panel de tracking directamente en la pestaña de mensajes
                                onOpenTracking({ ...request, defaultTab: 'messages' })
                              }}
                              className={`h-8 px-3 ${
                                request.hasUnreadMessages 
                                  ? "border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                  : "border-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              }`}
                              title="Ver mensajes"
                            >
                              <MessageCircle className="h-3 w-3" />
                              {request.hasUnreadMessages && (
                                <span className="ml-1 text-xs font-medium">{request.messageCount}</span>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}

                {/* Estado vacío por columna */}
                {columnRequests.length === 0 && (
                  <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6 text-center">
                      <ColumnIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sin solicitudes</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header UTP */}
        <UTPHeader 
          title="Mis Solicitudes" 
          subtitle="Revisa el estado de todas tus solicitudes de innovación y consulta sus detalles."
          size="lg"
        />

        {/* Stats Cards Simplificadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-blue-600/20 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total de Solicitudes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-yellow-600/20 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.active}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">En Proceso</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="p-3 bg-green-600/20 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.completed}</p>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Completadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda y Control de Vista */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
              {/* Búsqueda */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por título, tipo o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Controles de Vista */}
              <div className="flex items-center space-x-3">
                <Tabs value={viewMode} onValueChange={setViewMode}>
                  <TabsList>
                    <TabsTrigger value="list" className="text-xs">
                      <List className="h-4 w-4 mr-1" />
                      Lista
                    </TabsTrigger>
                    <TabsTrigger value="kanban" className="text-xs">
                      <Grid3X3 className="h-4 w-4 mr-1" />
                      Kanban
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewChange?.("chat")}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Nueva Solicitud
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros Simplificados */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar:</span>
                </div>
                
                <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
                  <TabsList>
                    <TabsTrigger value="all" className="text-sm">Todas</TabsTrigger>
                    <TabsTrigger value="active" className="text-sm">En Proceso</TabsTrigger>
                    <TabsTrigger value="completed" className="text-sm">Completadas</TabsTrigger>
                    <TabsTrigger value="with-messages" className="text-sm">Con Mensajes</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="text-sm text-gray-500">
                {filteredRequests.length} de {requests.length} solicitudes
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vista Principal - Lista o Kanban */}
        <Tabs value={viewMode} className="space-y-4">
          {/* Vista Lista */}
          <TabsContent value="list" className="space-y-3 mt-0">
            {filteredRequests.map((request) => {
              const StatusIcon = getStatusIcon(request.status)
              return (
                <Card key={request.id} className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                          <StatusIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-utp-blue dark:group-hover:text-utp-red transition-colors">
                              {request.title}
                            </h3>
                            {request.hasUnreadMessages && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-red-600 font-medium">{request.messageCount}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">{request.description}</p>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <span>{request.createdDate}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {request.type}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={`${request.statusColor} text-white text-xs font-medium`}
                            >
                              {request.status}
                            </Badge>
                            {request.leadAssigned !== "Pendiente" && (
                              <span className="text-xs text-gray-500">Asignado: {request.leadAssigned}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Botón de mensajes - siempre visible */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`h-8 px-2 ${
                            request.hasUnreadMessages 
                              ? "border-red-300 text-red-700 hover:bg-red-50 animate-pulse" 
                              : "border-blue-300 text-blue-700 hover:bg-blue-50"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            // Abrir panel de tracking directamente en la pestaña de mensajes
                            onOpenTracking({ ...request, defaultTab: 'messages' })
                          }}
                          title="Ver mensajes"
                        >
                          <MessageCircle className="h-3 w-3" />
                          {request.hasUnreadMessages && (
                            <span className="ml-1 text-xs">{request.messageCount}</span>
                          )}
                        </Button>
                        {/* Botón de seguimiento */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Abrir panel de tracking en línea de tiempo
                            onOpenTracking({ ...request, defaultTab: 'timeline' })
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* Vista Kanban */}
          <TabsContent value="kanban" className="mt-0">
            {renderKanbanView()}
          </TabsContent>
        </Tabs>

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay solicitudes que mostrar</h3>
              <p className="text-gray-500 mb-6">
                {selectedFilter === "all" 
                  ? "Aún no has creado ninguna solicitud. ¡Crea tu primera solicitud en 'Mi Espacio'!" 
                  : "No tienes solicitudes en esta categoría."}
              </p>
              {selectedFilter === "all" && (
                <Button 
                  className="bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark"
                  onClick={() => onViewChange?.("chat")}
                >
                  Crear Nueva Solicitud
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
