"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, DollarSign, FileText, AlertTriangle } from "lucide-react"

interface ApprovalsInboxProps {
  onOpenDetail: (request: any) => void
}

export function ApprovalsInbox({ onOpenDetail }: ApprovalsInboxProps) {
  // Solicitudes que requieren aprobación gerencial
  const pendingApprovals = [
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
      estimatedBudget: 25000,
      timeWaiting: "1d 2h",
      elevatedDate: "27/07/2025 14:30",
      justification:
        "Este proyecto es crítico para mejorar la toma de decisiones basada en datos. El ROI estimado es del 340% en 18 meses. Requiere aprobación gerencial por el presupuesto superior a $20K y su impacto estratégico en toda la organización.",
      impactAreas: ["Académico", "Administrativo", "Financiero"],
      riskLevel: "Medio",
      strategicAlignment: "Alta",
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
      estimatedBudget: 60000,
      timeWaiting: "1d 6h",
      elevatedDate: "27/07/2025 10:15",
      justification:
        "Migración crítica a infraestructura cloud para mejorar escalabilidad y reducir costos operativos. Proyecto estratégico que afectará a todos los sistemas de la universidad. Requiere aprobación por el alto presupuesto y su naturaleza transformacional.",
      impactAreas: ["Todos los Sistemas", "Seguridad", "Operaciones"],
      riskLevel: "Alto",
      strategicAlignment: "Crítica",
    },
    {
      id: 12,
      title: "Plataforma de Educación Virtual Avanzada",
      requester: "Roberto Silva",
      domain: "Académico",
      leader: "Ana Martínez",
      leaderAvatar: "AM",
      status: "Pendiente Aprobación Gerencial",
      priority: "Alta",
      type: "Proyecto",
      estimatedBudget: 45000,
      timeWaiting: "3h 15m",
      elevatedDate: "28/07/2025 11:45",
      justification:
        "Plataforma innovadora para educación híbrida post-pandemia. Incluye IA para personalización del aprendizaje y analytics avanzados. Proyecto estratégico para mantener competitividad en el mercado educativo digital.",
      impactAreas: ["Académico", "Estudiantes", "Docentes"],
      riskLevel: "Medio",
      strategicAlignment: "Crítica",
    },
    {
      id: 15,
      title: "Sistema Integral de CRM Universitario",
      requester: "Patricia López",
      domain: "Marketing",
      leader: "Luis Fernández",
      leaderAvatar: "LF",
      status: "Pendiente Aprobación Gerencial",
      priority: "Media",
      type: "Proyecto",
      estimatedBudget: 35000,
      timeWaiting: "2d 8h",
      elevatedDate: "26/07/2025 09:20",
      justification:
        "Sistema unificado para gestión de leads, admisiones y relación con estudiantes. Integrará todos los puntos de contacto desde prospecto hasta egresado. ROI proyectado del 280% en 24 meses por mejora en conversión y retención.",
      impactAreas: ["Marketing", "Admisiones", "Retención"],
      riskLevel: "Bajo",
      strategicAlignment: "Alta",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-700 border-red-200"
      case "Media":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Baja":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Alto":
        return "text-red-600"
      case "Medio":
        return "text-yellow-600"
      case "Bajo":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case "Crítica":
        return "text-purple-600 font-bold"
      case "Alta":
        return "text-blue-600 font-semibold"
      case "Media":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getUrgencyIndicator = (timeWaiting: string) => {
    const hours =
      Number.parseInt(timeWaiting.split("d")[0]) * 24 +
      (Number.parseInt(timeWaiting.split("h")[0].split(" ").pop()) || 0)
    if (hours > 48) return { color: "text-red-500", icon: "🔴", label: "Urgente" }
    if (hours > 24) return { color: "text-yellow-500", icon: "🟡", label: "Atención" }
    return { color: "text-green-500", icon: "🟢", label: "Normal" }
  }

  // Estadísticas de la bandeja
  const inboxStats = {
    total: pendingApprovals.length,
    urgent: pendingApprovals.filter((req) => getUrgencyIndicator(req.timeWaiting).label === "Urgente").length,
    totalBudget: pendingApprovals.reduce((sum, req) => sum + req.estimatedBudget, 0),
    avgWaitTime: "1.2 días",
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">📬 Bandeja de Aprobaciones</h1>
            <p className="text-muted-foreground">
              Centro de decisiones gerenciales - Proyectos elevados por Líderes de Dominio
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {inboxStats.total} pendientes
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              {inboxStats.urgent} urgentes
            </Badge>
          </div>
        </div>

        {/* Estadísticas de la Bandeja */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aprobaciones Pendientes</p>
                  <p className="text-2xl font-bold">{inboxStats.total}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Requieren Atención Urgente</p>
                  <p className="text-2xl font-bold text-red-600">{inboxStats.urgent}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Presupuesto Total Solicitado</p>
                  <p className="text-2xl font-bold">${(inboxStats.totalBudget / 1000).toFixed(0)}K</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tiempo Promedio de Espera</p>
                  <p className="text-2xl font-bold">{inboxStats.avgWaitTime}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Aprobaciones Pendientes */}
        <div className="space-y-4">
          {pendingApprovals.map((request) => {
            const urgency = getUrgencyIndicator(request.timeWaiting)

            return (
              <Card key={request.id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
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
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
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
                        <AvatarFallback className="bg-blue-100 text-blue-600">{request.leaderAvatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">Elevado por: {request.leader}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.elevatedDate} • Esperando {request.timeWaiting}
                        </p>
                      </div>
                    </div>

                    {/* Justificación del Líder */}
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Justificación del Líder de Dominio:
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-l-blue-500">
                        {request.justification}
                      </p>
                    </div>

                    {/* Métricas Estratégicas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Áreas de Impacto</h5>
                        <div className="flex flex-wrap gap-1">
                          {request.impactAreas.map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nivel de Riesgo</h5>
                        <p className={`text-sm font-medium ${getRiskColor(request.riskLevel)}`}>{request.riskLevel}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Alineación Estratégica
                        </h5>
                        <p className={`text-sm ${getAlignmentColor(request.strategicAlignment)}`}>
                          {request.strategicAlignment}
                        </p>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex space-x-3 pt-2">
                      <Button
                        onClick={() => onOpenDetail(request)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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

        {/* Estado vacío */}
        {pendingApprovals.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">¡Bandeja de Aprobaciones Vacía!</h3>
              <p className="text-muted-foreground">
                No hay proyectos pendientes de aprobación gerencial en este momento.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Nota informativa */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 text-sm">ℹ️</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900">Centro de Decisiones Estratégicas</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Esta bandeja contiene únicamente los proyectos que los Líderes de Dominio han elevado para aprobación
                  gerencial. Cada solicitud incluye la justificación del líder y el análisis de impacto estratégico.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
