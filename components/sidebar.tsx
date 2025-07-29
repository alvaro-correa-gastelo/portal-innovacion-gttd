"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  MessageSquare,
  Clock,
  FileText,
  Settings,
  ChevronRight,
  Search,
  Plus,
  Users,
  BarChart3,
  CheckCircle,
  Globe,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"

interface SidebarProps {
  onOpenTracking: (request: any) => void
  currentView: string
  onViewChange: (view: string) => void
  userRole?: string // Añadir userRole como prop
}

export function Sidebar({ onOpenTracking, currentView, onViewChange, userRole }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const chatHistory = [
    {
      id: 1,
      title: "Sistema de Gestión de Inventarios",
      date: "28/07/2025",
      status: "En Evaluación",
      statusColor: "bg-yellow-500",
    },
    {
      id: 2,
      title: "Dashboard BI para Reportes",
      date: "25/07/2025",
      status: "Aprobado",
      statusColor: "bg-green-500",
    },
    {
      id: 3,
      title: "Sistema de Reportes Automáticos",
      date: "22/07/2025",
      status: "En Planificación",
      statusColor: "bg-blue-500",
    },
  ]

  // Elementos de navegación específicos por rol
  const getNavigationItems = () => {
    if (userRole === "lider_dominio") {
      return [
        { id: "leader-dashboard", icon: Home, label: "Dashboard de mi Dominio", badge: null },
        { id: "domain-team", icon: Users, label: "Mi Equipo", badge: null },
        { id: "domain-metrics", icon: BarChart3, label: "Métricas de Dominio", badge: null },
        { id: "settings", icon: Settings, label: "Configuración", badge: null },
      ]
    } else if (userRole === "lider_gerencial") {
      return [
        { id: "global-dashboard", icon: Globe, label: "Dashboard Global", badge: null },
        { id: "approvals-inbox", icon: CheckCircle, label: "Bandeja de Aprobaciones", badge: "4" },
        { id: "strategic-roadmap", icon: BarChart3, label: "Roadmap Estratégico", badge: null },
        { id: "reports-analytics", icon: FileText, label: "Reportes y Analíticas", badge: null },
        { id: "domain-management", icon: Users, label: "Gestión de Dominios", badge: null },
        { id: "settings", icon: Settings, label: "Configuración", badge: null },
      ]
    } else {
      // Solicitante (navegación original)
      return [
        { id: "chat", icon: MessageSquare, label: "Mi Espacio", badge: null },
        { id: "dashboard", icon: Home, label: "Dashboard", badge: null },
        { id: "history", icon: Clock, label: "Mis Solicitudes", badge: "3" },
        { id: "documents", icon: FileText, label: "Documentos", badge: null },
        { id: "settings", icon: Settings, label: "Configuración", badge: null },
      ]
    }
  }

  const navigationItems = getNavigationItems()

  // Historial específico para líderes de dominio
  const getDomainHistory = () => {
    if (userRole === "lider_dominio") {
      return [
        {
          id: 1,
          title: "Sistema de Gestión de Inventarios",
          date: "28/07/2025",
          status: "En Evaluación",
          statusColor: "bg-yellow-500",
          requester: "Juan Pérez",
          priority: "Alta",
        },
        {
          id: 2,
          title: "Automatización de Reportes",
          date: "25/07/2025",
          status: "En Planificación",
          statusColor: "bg-blue-500",
          requester: "Pedro López",
          priority: "Media",
        },
        {
          id: 3,
          title: "Dashboard de Métricas TI",
          date: "22/07/2025",
          status: "Nueva",
          statusColor: "bg-green-500",
          requester: "Ana García",
          priority: "Baja",
        },
      ]
    }
    return chatHistory // Historial original para otros roles
  }

  const displayHistory = getDomainHistory()

  // Título del historial según el rol
  const getHistoryTitle = () => {
    if (userRole === "lider_dominio") {
      return "Solicitudes de mi Dominio"
    } else if (userRole === "lider_gerencial") {
      return "Solicitudes Recientes"
    }
    return "Historial Reciente"
  }

  // Botón principal según el rol
  const getPrimaryButton = () => {
    if (userRole === "lider_dominio") {
      return (
        <Button
          onClick={() => onViewChange("leader-dashboard")}
          className="w-full bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark text-white font-medium"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Ver Dashboard
        </Button>
      )
    } else if (userRole === "lider_gerencial") {
      return (
        <Button
          onClick={() => onViewChange("global-dashboard")}
          className="w-full bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark text-white font-medium"
        >
          <Globe className="w-4 h-4 mr-2" />
          Dashboard Global
        </Button>
      )
    }
    return (
      <Button
        onClick={() => onViewChange("chat")}
        className="w-full bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark text-white font-medium"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nueva Solicitud
      </Button>
    )
  }

  // Información del usuario según el rol
  const getUserInfo = () => {
    if (userRole === "lider_dominio") {
      return {
        name: "Leslie Hidalgo",
        role: "Líder de Dominio - Sistemas",
        avatar: "LH",
      }
    } else if (userRole === "lider_gerencial") {
      return {
        name: "María Salas",
        role: "Líder Gerencial GTTD",
        avatar: "MS",
      }
    }
    return {
      name: "Juan Pérez",
      role: "Analista de Sistemas",
      avatar: "JP",
    }
  }

  const userInfo = getUserInfo()

  // Filtrar historial según búsqueda
  const filteredHistory = displayHistory.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-sm">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-utp-blue dark:bg-utp-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">UTP</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">UTP GTTD</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Portal de Innovación</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Nueva Solicitud Button */}
        {getPrimaryButton()}
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start text-left relative ${
                currentView === item.id
                  ? "bg-utp-blue/10 text-utp-blue hover:bg-utp-blue/20 dark:bg-utp-red/20 dark:text-utp-red dark:hover:bg-utp-red/30"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
              {item.badge && (
                <Badge variant="secondary" className="ml-auto bg-utp-blue dark:bg-utp-red text-white text-xs">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </div>

      {/* Historial Reciente */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar solicitudes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{getHistoryTitle()}</h3>
        <div className="space-y-2">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
              onClick={() => onOpenTracking(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.date}</p>
                  {userRole === "lider_dominio" && <p className="text-xs text-gray-400 mt-1">Por: {item.requester}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <Badge variant="secondary" className={`${item.statusColor} text-white text-xs`}>
                  {item.status}
                </Badge>
                {userRole === "lider_dominio" && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      item.priority === "Alta"
                        ? "border-red-500 text-red-500"
                        : item.priority === "Media"
                          ? "border-yellow-500 text-yellow-500"
                          : "border-green-500 text-green-500"
                    }`}
                  >
                    {item.priority}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/placeholder.svg?height=40&width=40" />
            <AvatarFallback className="bg-utp-blue dark:bg-utp-red text-white">{userInfo.avatar}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{userInfo.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userInfo.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
