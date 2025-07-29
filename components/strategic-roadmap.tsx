"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar, Star, TrendingUp, DollarSign, Users, Target } from "lucide-react"

export function StrategicRoadmap() {
  const [viewMode, setViewMode] = useState("trimestral")

  // Datos simulados de dominios y proyectos
  const domains = [
    {
      id: "prospection",
      name: "Prospección",
      leader: "Ana García",
      projects: [
        {
          id: "proj-1",
          name: "CRM Inteligente",
          startDate: "2025-02-01",
          endDate: "2025-05-15",
          progress: 25,
          budget: "$85,000",
          status: "En Desarrollo",
          color: "bg-blue-500",
          milestones: [
            { date: "2025-03-01", title: "MVP Listo", icon: "⭐" },
            { date: "2025-04-15", title: "Testing", icon: "🧪" },
          ],
        },
        {
          id: "proj-2",
          name: "Portal de Leads",
          startDate: "2025-03-01",
          endDate: "2025-06-30",
          progress: 10,
          budget: "$45,000",
          status: "Planificación",
          color: "bg-green-500",
          milestones: [{ date: "2025-04-01", title: "Diseño UX", icon: "🎨" }],
        },
      ],
    },
    {
      id: "academic",
      name: "Planificación Académica",
      leader: "Carlos Mendoza",
      projects: [
        {
          id: "proj-3",
          name: "Sistema de Horarios IA",
          startDate: "2025-01-15",
          endDate: "2025-07-30",
          progress: 40,
          budget: "$120,000",
          status: "En Desarrollo",
          color: "bg-purple-500",
          milestones: [
            { date: "2025-02-28", title: "Algoritmo Base", icon: "⭐" },
            { date: "2025-05-15", title: "Integración", icon: "🔗" },
          ],
        },
      ],
    },
    {
      id: "channels",
      name: "Canales y Servicios",
      leader: "María López",
      projects: [
        {
          id: "proj-4",
          name: "App Móvil Estudiantes",
          startDate: "2025-02-15",
          endDate: "2025-08-15",
          progress: 15,
          budget: "$95,000",
          status: "En Desarrollo",
          color: "bg-orange-500",
          milestones: [
            { date: "2025-04-01", title: "Beta Release", icon: "📱" },
            { date: "2025-06-15", title: "Launch", icon: "🚀" },
          ],
        },
        {
          id: "proj-5",
          name: "Chatbot Inteligente",
          startDate: "2025-04-01",
          endDate: "2025-09-30",
          progress: 5,
          budget: "$35,000",
          status: "Aprobado",
          color: "bg-teal-500",
          milestones: [{ date: "2025-06-01", title: "Entrenamiento IA", icon: "🤖" }],
        },
      ],
    },
    {
      id: "infrastructure",
      name: "Infraestructura TI",
      leader: "Leslie Hidalgo",
      projects: [
        {
          id: "proj-6",
          name: "Migración a Cloud",
          startDate: "2025-01-01",
          endDate: "2025-12-31",
          progress: 30,
          budget: "$200,000",
          status: "En Desarrollo",
          color: "bg-red-500",
          milestones: [
            { date: "2025-03-31", title: "Fase 1 Completa", icon: "☁️" },
            { date: "2025-06-30", title: "Migración BD", icon: "💾" },
            { date: "2025-09-30", title: "Testing Final", icon: "✅" },
          ],
        },
      ],
    },
  ]

  // Generar meses para la vista
  const getMonths = () => {
    const months = []
    const startDate = new Date(2025, 0, 1) // Enero 2025
    const endDate =
      viewMode === "trimestral"
        ? new Date(2025, 2, 31) // Marzo 2025
        : new Date(2025, 11, 31) // Diciembre 2025

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      months.push({
        name: currentDate.toLocaleDateString("es-ES", { month: "short" }),
        fullName: currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
        date: new Date(currentDate),
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    return months
  }

  const months = getMonths()

  // Calcular posición y ancho de las barras de proyecto
  const getProjectBarStyle = (project: any) => {
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)
    const timelineStart = new Date(2025, 0, 1)
    const timelineEnd = viewMode === "trimestral" ? new Date(2025, 2, 31) : new Date(2025, 11, 31)

    const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
    const projectStartDays = Math.max(0, (startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))
    const projectEndDays = Math.min(totalDays, (endDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))

    const left = (projectStartDays / totalDays) * 100
    const width = ((projectEndDays - projectStartDays) / totalDays) * 100

    return {
      left: `${left}%`,
      width: `${Math.max(width, 2)}%`, // Mínimo 2% de ancho
    }
  }

  // Calcular métricas resumen
  const totalProjects = domains.reduce((acc, domain) => acc + domain.projects.length, 0)
  const totalBudget = domains.reduce(
    (acc, domain) =>
      acc + domain.projects.reduce((projAcc, proj) => projAcc + Number.parseInt(proj.budget.replace(/[$,]/g, "")), 0),
    0,
  )
  const avgProgress = Math.round(
    domains.reduce((acc, domain) => acc + domain.projects.reduce((projAcc, proj) => projAcc + proj.progress, 0), 0) /
      totalProjects,
  )

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">🗺️ Roadmap Estratégico</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Cronograma de alto nivel de proyectos estratégicos por dominio
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Métricas Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos Activos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProjects}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inversión Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ${(totalBudget / 1000).toFixed(0)}K
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dominios</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{domains.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progreso Promedio</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgProgress}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cronograma Gantt */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Cronograma de Proyectos - Vista {viewMode === "trimestral" ? "Trimestral" : "Anual"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <TooltipProvider>
              <div className="space-y-6">
                {/* Header del cronograma */}
                <div className="flex">
                  <div className="w-64 flex-shrink-0"></div>
                  <div className="flex-1 grid grid-cols-12 gap-1">
                    {months.map((month, index) => (
                      <div key={index} className="text-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{month.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">2025</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filas de dominios */}
                {domains.map((domain) => (
                  <div key={domain.id} className="space-y-3">
                    {/* Header del dominio */}
                    <div className="flex items-center">
                      <div className="w-64 flex-shrink-0">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{domain.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Líder: {domain.leader}</p>
                          <Badge variant="secondary" className="mt-1">
                            {domain.projects.length} proyectos
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1 relative h-20 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                        {/* Líneas de meses */}
                        <div className="absolute inset-0 grid grid-cols-12">
                          {months.map((_, index) => (
                            <div
                              key={index}
                              className="border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                            ></div>
                          ))}
                        </div>

                        {/* Barras de proyectos */}
                        {domain.projects.map((project, projectIndex) => (
                          <Tooltip key={project.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute h-6 ${project.color} rounded-md flex items-center px-2 cursor-pointer hover:opacity-80 transition-opacity`}
                                style={{
                                  ...getProjectBarStyle(project),
                                  top: `${10 + projectIndex * 28}px`,
                                }}
                              >
                                <span className="text-white text-xs font-medium truncate">{project.name}</span>
                                <div className="ml-auto flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                                  <span className="text-white text-xs">{project.progress}%</span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-2">
                                <p className="font-semibold">{project.name}</p>
                                <p className="text-sm">Presupuesto: {project.budget}</p>
                                <p className="text-sm">Líder: {domain.leader}</p>
                                <p className="text-sm">Estado: {project.status}</p>
                                <p className="text-sm">Progreso: {project.progress}%</p>
                                <p className="text-sm">
                                  Duración: {new Date(project.startDate).toLocaleDateString()} -{" "}
                                  {new Date(project.endDate).toLocaleDateString()}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}

                        {/* Hitos */}
                        {domain.projects.map((project) =>
                          project.milestones.map((milestone, milestoneIndex) => {
                            const milestoneDate = new Date(milestone.date)
                            const timelineStart = new Date(2025, 0, 1)
                            const timelineEnd =
                              viewMode === "trimestral" ? new Date(2025, 2, 31) : new Date(2025, 11, 31)

                            if (milestoneDate < timelineStart || milestoneDate > timelineEnd) return null

                            const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
                            const milestoneDays =
                              (milestoneDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
                            const left = (milestoneDays / totalDays) * 100

                            return (
                              <Tooltip key={`${project.id}-${milestoneIndex}`}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="absolute w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-500 transition-colors border-2 border-white shadow-md"
                                    style={{
                                      left: `${left}%`,
                                      top: "2px",
                                      transform: "translateX(-50%)",
                                    }}
                                  >
                                    <Star className="w-3 h-3 text-yellow-800" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-semibold">
                                      {milestone.icon} {milestone.title}
                                    </p>
                                    <p className="text-sm">Fecha: {milestoneDate.toLocaleDateString()}</p>
                                    <p className="text-sm">Proyecto: {project.name}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )
                          }),
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Leyenda */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg">Leyenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">En Desarrollo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Planificación</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-teal-500 rounded"></div>
                <span className="text-sm">Aprobado</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Hito Clave</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
