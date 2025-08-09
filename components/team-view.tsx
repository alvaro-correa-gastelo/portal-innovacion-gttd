"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RefreshCw, User, Clock, CheckCircle } from "lucide-react"

export default function TeamView() {
  const [lastSync, setLastSync] = useState("Hace 5 minutos")
  const [isLoading, setIsLoading] = useState(false)

  // Datos simulados del equipo (normalmente vendrían de Jira/Monday)
  const teamMembers = [
    {
      id: 1,
      name: "Carlos Mendoza",
      role: "Desarrollador Senior",
      avatar: "CM",
      workload: 85,
      status: "Ocupado",
      currentTasks: [
        { title: "Sistema de Inventarios - Backend API", type: "Epic", priority: "Alta" },
        { title: "Refactoring Base de Datos", type: "Story", priority: "Media" },
        { title: "Code Review - Dashboard BI", type: "Task", priority: "Baja" },
      ],
      jiraTickets: 12,
      completedThisWeek: 8,
    },
    {
      id: 2,
      name: "Ana García",
      role: "Desarrolladora Full-Stack",
      avatar: "AG",
      workload: 70,
      status: "Disponible",
      currentTasks: [
        { title: "Dashboard BI - Frontend", type: "Epic", priority: "Alta" },
        { title: "Testing Automatizado", type: "Story", priority: "Media" },
      ],
      jiraTickets: 8,
      completedThisWeek: 6,
    },
    {
      id: 3,
      name: "Pedro López",
      role: "Analista de Sistemas",
      avatar: "PL",
      workload: 60,
      status: "Disponible",
      currentTasks: [
        { title: "Análisis de Requerimientos - Reportes", type: "Epic", priority: "Media" },
        { title: "Documentación Técnica", type: "Task", priority: "Baja" },
      ],
      jiraTickets: 5,
      completedThisWeek: 4,
    },
    {
      id: 4,
      name: "María Torres",
      role: "QA Engineer",
      avatar: "MT",
      workload: 90,
      status: "Muy Ocupada",
      currentTasks: [
        { title: "Testing Sistema de Inventarios", type: "Epic", priority: "Alta" },
        { title: "Automatización de Pruebas", type: "Story", priority: "Alta" },
        { title: "Bug Fixes - Dashboard", type: "Bug", priority: "Media" },
      ],
      jiraTickets: 15,
      completedThisWeek: 10,
    },
    {
      id: 5,
      name: "Roberto Silva",
      role: "DevOps Engineer",
      avatar: "RS",
      workload: 45,
      status: "Disponible",
      currentTasks: [
        { title: "Configuración CI/CD", type: "Task", priority: "Media" },
        { title: "Monitoreo de Infraestructura", type: "Story", priority: "Baja" },
      ],
      jiraTickets: 4,
      completedThisWeek: 3,
    },
    {
      id: 6,
      name: "Laura Vega",
      role: "UX/UI Designer",
      avatar: "LV",
      workload: 75,
      status: "Ocupada",
      currentTasks: [
        { title: "Diseño Dashboard BI", type: "Epic", priority: "Alta" },
        { title: "Prototipo Sistema Inventarios", type: "Story", priority: "Media" },
      ],
      jiraTickets: 6,
      completedThisWeek: 4,
    },
  ]

  const handleSync = () => {
    setIsLoading(true)
    // Simular sincronización
    setTimeout(() => {
      setLastSync("Ahora")
      setIsLoading(false)
    }, 2000)
  }

  const getWorkloadColor = (workload: number) => {
    if (workload >= 85) return "text-red-500"
    if (workload >= 70) return "text-yellow-500"
    return "text-green-500"
  }

  const getWorkloadBgColor = (workload: number) => {
    if (workload >= 85) return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
    if (workload >= 70) return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
    return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Muy Ocupada":
        return "bg-red-500 dark:bg-red-600"
      case "Ocupado":
      case "Ocupada":
        return "bg-yellow-500 dark:bg-yellow-600"
      case "Disponible":
        return "bg-green-500 dark:bg-green-600"
      default:
        return "bg-gray-500 dark:bg-gray-600"
    }
  }

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Epic":
        return "🎯"
      case "Story":
        return "📝"
      case "Task":
        return "✅"
      case "Bug":
        return "🐛"
      default:
        return "📋"
    }
  }

  // Estadísticas del equipo
  const teamStats = {
    totalMembers: teamMembers.length,
    averageWorkload: Math.round(teamMembers.reduce((sum, member) => sum + member.workload, 0) / teamMembers.length),
    totalTickets: teamMembers.reduce((sum, member) => sum + member.jiraTickets, 0),
    completedThisWeek: teamMembers.reduce((sum, member) => sum + member.completedThisWeek, 0),
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Capacidad y Carga de mi Equipo</h1>
            <p className="text-muted-foreground">
              Datos sincronizados desde Jira y Monday • Última actualización: {lastSync}
            </p>
          </div>
          <Button onClick={handleSync} disabled={isLoading} className="bg-utp-blue hover:bg-utp-blue-dark text-white">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />🔄 Sincronizar Ahora
          </Button>
        </div>

        {/* Estadísticas del Equipo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Miembros del Equipo</p>
                  <p className="text-2xl font-bold">{teamStats.totalMembers}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Carga Promedio</p>
                  <p className="text-2xl font-bold">{teamStats.averageWorkload}%</p>
                </div>
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${getWorkloadColor(teamStats.averageWorkload)}`}
                >
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tickets Activos</p>
                  <p className="text-2xl font-bold">{teamStats.totalTickets}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">J</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completados esta Semana</p>
                  <p className="text-2xl font-bold">{teamStats.completedThisWeek}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cuadrícula de Miembros del Equipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.id} className={`${getWorkloadBgColor(member.workload)} transition-all hover:shadow-md`}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                    <AvatarFallback className="bg-utp-blue dark:bg-utp-red text-white font-medium">{member.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge variant="secondary" className={`${getStatusColor(member.status)} text-white text-xs`}>
                    {member.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Carga de Trabajo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Carga de Trabajo Actual</span>
                    <span className={`text-sm font-bold ${getWorkloadColor(member.workload)} dark:opacity-90`}>{member.workload}%</span>
                  </div>
                  <Progress value={member.workload} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{member.jiraTickets} tickets activos</span>
                    <span>{member.completedThisWeek} completados esta semana</span>
                  </div>
                </div>

                {/* Entregables Principales */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Entregables Principales:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {member.currentTasks.slice(0, 3).map((task, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <span className="text-sm">{getTypeIcon(task.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate text-gray-900 dark:text-gray-100">{task.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs py-0 px-1 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                              {task.type}
                            </Badge>
                            <Badge variant="outline" className={`text-xs py-0 px-1 ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nota informativa */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-sm">ℹ️</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Datos en Tiempo Real</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Esta información se sincroniza automáticamente cada 15 minutos desde Jira y Monday.com. Los datos
                  incluyen tickets asignados, progreso de épicas y métricas de productividad.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
