"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, Eye, Clock, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react"

interface HistoryViewProps {
  onOpenTracking: (request: any) => void
}

export default function HistoryView({ onOpenTracking }: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const requests = [
    {
      id: 1,
      title: "Sistema de Gestión de Inventarios",
      description: "Desarrollo de sistema para control de activos tecnológicos",
      status: "En Desarrollo",
      statusColor: "bg-blue-600",
      priority: "Alta",
      priorityColor: "bg-red-600",
      createdDate: "25/07/2025",
      lastUpdate: "28/07/2025",
      assignedTo: "Leslie Hidalgo",
      progress: 75,
      category: "Desarrollo",
    },
    {
      id: 2,
      title: "Dashboard BI para Reportes",
      description: "Implementación de dashboard para análisis de datos",
      status: "Planificación",
      statusColor: "bg-yellow-600",
      priority: "Media",
      priorityColor: "bg-yellow-600",
      createdDate: "22/07/2025",
      lastUpdate: "27/07/2025",
      assignedTo: "Carlos Mendoza",
      progress: 45,
      category: "Análisis",
    },
    {
      id: 3,
      title: "Sistema de Reportes Automáticos",
      description: "Automatización de generación de reportes mensuales",
      status: "Completado",
      statusColor: "bg-green-600",
      priority: "Baja",
      priorityColor: "bg-green-600",
      createdDate: "15/07/2025",
      lastUpdate: "26/07/2025",
      assignedTo: "Ana Torres",
      progress: 100,
      category: "Automatización",
    },
    {
      id: 4,
      title: "Integración API de Pagos",
      description: "Integración con sistema de pagos externo",
      status: "Rechazado",
      statusColor: "bg-red-600",
      priority: "Alta",
      priorityColor: "bg-red-600",
      createdDate: "20/07/2025",
      lastUpdate: "24/07/2025",
      assignedTo: "Miguel Ruiz",
      progress: 0,
      category: "Integración",
    },
    {
      id: 5,
      title: "Migración de Base de Datos",
      description: "Migración de sistema legacy a nueva arquitectura",
      status: "En Evaluación",
      statusColor: "bg-purple-600",
      priority: "Alta",
      priorityColor: "bg-red-600",
      createdDate: "18/07/2025",
      lastUpdate: "25/07/2025",
      assignedTo: "Patricia López",
      progress: 15,
      category: "Infraestructura",
    },
  ]

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (selectedFilter === "all") return matchesSearch
    if (selectedFilter === "active") return matchesSearch && !["Completado", "Rechazado"].includes(request.status)
    if (selectedFilter === "completed") return matchesSearch && request.status === "Completado"
    if (selectedFilter === "rejected") return matchesSearch && request.status === "Rechazado"

    return matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completado":
        return CheckCircle
      case "Rechazado":
        return XCircle
      case "En Desarrollo":
      case "Planificación":
      case "En Evaluación":
        return Clock
      default:
        return AlertCircle
    }
  }

  const stats = {
    total: requests.length,
    active: requests.filter((r) => !["Completado", "Rechazado"].includes(r.status)).length,
    completed: requests.filter((r) => r.status === "Completado").length,
    rejected: requests.filter((r) => r.status === "Rechazado").length,
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Historial de Solicitudes</h1>
            <p className="text-muted-foreground">Gestiona y revisa todas tus solicitudes</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Activas</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rechazadas</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar solicitudes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="active">Activas</TabsTrigger>
                  <TabsTrigger value="completed">Completadas</TabsTrigger>
                  <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status)
            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">{request.title}</h3>
                        <Badge variant="secondary" className={`${request.statusColor} text-white`}>
                          {request.status}
                        </Badge>
                        <Badge variant="outline" className={`${request.priorityColor}/20 border-current`}>
                          {request.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{request.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Creado:</span>
                          <span className="ml-2">{request.createdDate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Última actualización:</span>
                          <span className="ml-2">{request.lastUpdate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Asignado a:</span>
                          <span className="ml-2">{request.assignedTo}</span>
                        </div>
                      </div>

                      {request.progress > 0 && request.status !== "Rechazado" && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Progreso</span>
                            <span className="text-sm font-medium">{request.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${request.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => onOpenTracking(request)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron solicitudes</h3>
              <p className="text-muted-foreground">Intenta ajustar los filtros o términos de búsqueda</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
