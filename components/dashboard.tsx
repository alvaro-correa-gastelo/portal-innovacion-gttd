"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Clock,
  FileText,
  Calendar,
  Search,
  MessageCircle,
  PlusCircle,
  Eye,
  ArrowRight,
  Download,
  Crown
} from "lucide-react"

interface DashboardProps {
  onViewChange: (view: string) => void
}

export default function Dashboard({ onViewChange }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Datos simulados organizados por columnas Kanban
  const requests = [
    {
      id: 1,
      title: "Sistema de Gestión de Inventarios",
      status: "Nueva",
      priority: "Alta",
      date: "25/07/2025",
      type: "Proyecto",
      hasUnreadMessages: true,
      messageCount: 2,
    },
    {
      id: 2,
      title: "Dashboard de Analíticas BI",
      status: "Nueva",
      priority: "Media",
      date: "23/07/2025",
      type: "Proyecto",
      hasUnreadMessages: false,
      messageCount: 0,
    },
    {
      id: 3,
      title: "Automatización de Reportes",
      status: "En Evaluación",
      priority: "Alta",
      date: "20/07/2025",
      type: "Requerimiento",
      hasUnreadMessages: true,
      messageCount: 1,
    },
    {
      id: 4,
      title: "Integración API de Pagos",
      status: "En Evaluación",
      priority: "Media",
      date: "18/07/2025",
      type: "Requerimiento",
      hasUnreadMessages: false,
      messageCount: 0,
    },
    {
      id: 5,
      title: "Sistema de Notificaciones Push",
      status: "En Planificación",
      priority: "Baja",
      date: "15/07/2025",
      type: "Proyecto",
      hasUnreadMessages: true,
      messageCount: 3,
    },
    {
      id: 6,
      title: "Portal de Estudiantes",
      status: "En Planificación",
      priority: "Alta",
      date: "12/07/2025",
      type: "Proyecto",
      hasUnreadMessages: false,
      messageCount: 0,
    },
  ]

  const filteredRequests = requests.filter((request) => {
    return request.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "text-red-600 bg-red-50 border-red-200"
      case "Media":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "Baja":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  // Organizar solicitudes por columnas
  const columns = [
    { id: "Nueva", title: "Nuevas", color: "bg-blue-50 border-blue-200" },
    { id: "En Evaluación", title: "En Evaluación", color: "bg-yellow-50 border-yellow-200" },
    { id: "En Planificación", title: "En Planificación", color: "bg-green-50 border-green-200" },
  ]

  const getRequestsByStatus = (status: string) => {
    return filteredRequests.filter((request) => request.status === status)
  }

  const totalUnreadMessages = requests.filter((r) => r.hasUnreadMessages).length

  const handleOpenTracking = (request: any) => {
    console.log("Abriendo tracking para:", request.title)
  }

  const handleGenerateReport = async (request: any) => {
    try {
      console.log("Generando reporte para:", request.title)

      // Datos mock para el reporte
      const reportData = {
        session_id: `session-${request.id}`,
        user_name: "Usuario Demo",
        department: "Sistemas",
        title: request.title,
        description: `Solicitud de ${request.title}`,
        priority: request.priority.toLowerCase(),
        effort: "medium",
        classification: request.type.toLowerCase(),
        impact_analysis: "Impacto significativo en la eficiencia operativa",
        resources: "2 desarrolladores, 8 semanas",
        risks: "Riesgo bajo, dependencias mínimas",
        recommendation: "APROBAR - Alto ROI, bajo riesgo"
      }

      // Llamar a la API para generar PDF
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: reportData.session_id,
          report_type: 'user',
          data: reportData
        })
      })

      if (response.ok) {
        // Descargar el PDF
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-${request.title.replace(/\s+/g, '-').toLowerCase()}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        console.error('Error al generar reporte')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mis Solicitudes</h1>
            <p className="text-muted-foreground">Gestiona y da seguimiento a tus solicitudes tecnológicas</p>
          </div>
          <Button onClick={() => onViewChange("chat")} className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>

        {/* Banner de mensajes no leídos */}
        {totalUnreadMessages > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">
                      Tienes {totalUnreadMessages} mensaje{totalUnreadMessages > 1 ? "s" : ""} sin leer
                    </h3>
                    <p className="text-sm text-blue-700">
                      Los líderes GTTD han enviado actualizaciones sobre tus solicitudes
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Ver mensajes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Búsqueda */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar solicitudes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tablero Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map((column) => {
            const columnRequests = getRequestsByStatus(column.id)
            return (
              <div key={column.id} className="space-y-4">
                {/* Header de columna */}
                <Card className={`${column.color} border-2`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{column.title}</h3>
                      <Badge variant="secondary" className="bg-white/80">
                        {columnRequests.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Tarjetas de solicitudes */}
                <div className="space-y-3">
                  {columnRequests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header de tarjeta */}
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm leading-tight pr-2">{request.title}</h4>
                            {request.hasUnreadMessages && (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-blue-600 font-medium">{request.messageCount}</span>
                              </div>
                            )}
                          </div>

                          {/* Badges */}
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`${getPriorityColor(request.priority)} text-xs px-2 py-1`}>
                              {request.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              {request.type}
                            </Badge>
                          </div>

                          {/* Fecha */}
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{request.date}</span>
                          </div>

                          {/* Indicador de mensajes */}
                          {request.hasUnreadMessages && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                              <div className="flex items-center space-x-2">
                                <MessageCircle className="h-3 w-3 text-blue-600" />
                                <span className="text-xs text-blue-700">Nuevo mensaje</span>
                              </div>
                            </div>
                          )}

                          {/* Acciones */}
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenTracking(request)}
                              className="flex-1 h-8 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            {request.status === "Completada" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateReport(request)}
                                className="h-8 px-2 border-green-300 text-green-700 hover:bg-green-50"
                                title="Generar reporte"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                            {request.hasUnreadMessages && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                <MessageCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Estado vacío por columna */}
                  {columnRequests.length === 0 && (
                    <Card className="border-dashed border-2 border-gray-200">
                      <CardContent className="p-8 text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No hay solicitudes</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Estado vacío general */}
        {filteredRequests.length === 0 && searchQuery && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron solicitudes</h3>
              <p className="text-muted-foreground mb-4">
                Intenta con otros términos de búsqueda
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Limpiar búsqueda
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
