"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { TrackingPanel } from "@/components/tracking-panel"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notification-center"
import { Toaster } from "@/components/ui/toaster"
import { LoginPage } from "@/components/login-page"
import { LeaderDashboard } from "@/components/leader-dashboard"
import { RequestDetailModal } from "@/components/request-detail-modal"
import Dashboard from "@/components/dashboard"
import HistoryView from "@/components/history-view"
import DocumentsView from "@/components/documents-view"
import SettingsView from "@/components/settings-view"

// Importar las nuevas vistas
import TeamView from "@/components/team-view"
import DomainMetricsView from "@/components/domain-metrics-view"
import { GlobalDashboard } from "@/components/global-dashboard"
import { ApprovalsInbox } from "@/components/approvals-inbox"
import { StrategicRoadmap } from "@/components/strategic-roadmap"
import { ReportsAnalytics } from "@/components/reports-analytics"

export default function PortalInnovacion() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [isTrackingOpen, setIsTrackingOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [currentView, setCurrentView] = useState("chat")
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedDetailRequest, setSelectedDetailRequest] = useState<any>(null)

  const handleLogin = (email: string, role: string) => {
    setUserEmail(email)
    setUserRole(role)
    setIsAuthenticated(true)

    // Redirigir según el rol
    switch (role) {
      case "solicitante":
        setCurrentView("chat")
        break
      case "lider_dominio":
        setCurrentView("leader-dashboard") // Corregido: usar leader-dashboard en lugar de global-dashboard
        break
      case "lider_gerencial":
        setCurrentView("global-dashboard")
        break
      default:
        setCurrentView("chat")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole("")
    setUserEmail("")
    setCurrentView("chat")
  }

  const handleOpenTracking = (request: any) => {
    setSelectedRequest(request)
    setIsTrackingOpen(true)
  }

  const handleOpenDetail = (request: any) => {
    setSelectedDetailRequest(request)
    setIsDetailModalOpen(true)
  }

  const getViewTitle = () => {
    switch (currentView) {
      case "chat":
        return "🏠 Mi Espacio de Innovación"
      case "leader-dashboard":
        return userRole === "lider_gerencial" ? "🌍 Dashboard Global GTTD" : "📊 Dashboard de mi Dominio"
      case "global-dashboard":
        return "🌍 Dashboard Global GTTD"
      case "approvals-inbox":
        return "✅ Bandeja de Aprobaciones"
      case "strategic-roadmap":
        return "🗺️ Roadmap Estratégico"
      case "reports-analytics":
        return "📈 Reportes y Analíticas"
      case "dashboard":
        return userRole === "lider_gerencial"
          ? "📊 Dashboard Gerencial GTTD"
          : userRole === "lider_dominio"
            ? "📊 Dashboard de Dominio"
            : "📊 Mi Dashboard Personal"
      case "history":
        return "📊 Mis Solicitudes"
      case "documents":
        return "📄 Mis Documentos"
      case "settings":
        return "⚙️ Configuración"
      case "domain-team":
        return "👥 Mi Equipo"
      case "domain-metrics":
        return "📊 Métricas de Dominio"
      default:
        return "Portal UTP GTTD"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "solicitante":
        return "Solicitante"
      case "lider_dominio":
        return "Líder de Dominio"
      case "lider_gerencial":
        return "Líder Gerencial"
      default:
        return "Usuario"
    }
  }

  // Si no está autenticado, mostrar página de login
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </ThemeProvider>
    )
  }

  // Si está autenticado, mostrar la aplicación principal
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Sidebar
          onOpenTracking={handleOpenTracking}
          currentView={currentView}
          onViewChange={setCurrentView}
          userRole={userRole}
        />

        <div className="flex-1 flex flex-col">
          {/* Header with notifications and theme toggle */}
          <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{getViewTitle()}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {userEmail} • {getRoleDisplayName(userRole)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </header>

          {/* Dynamic Content Area */}
          <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
            {currentView === "chat" && <ChatInterface />}
            {currentView === "leader-dashboard" && (
              <LeaderDashboard
                userRole={userRole as "lider_dominio" | "lider_gerencial"}
                onOpenDetail={handleOpenDetail}
              />
            )}
            {currentView === "global-dashboard" && <GlobalDashboard onOpenDetail={handleOpenDetail} />}
            {currentView === "approvals-inbox" && <ApprovalsInbox onOpenDetail={handleOpenDetail} />}
            {currentView === "strategic-roadmap" && <StrategicRoadmap />}
            {currentView === "reports-analytics" && <ReportsAnalytics />}
            {currentView === "dashboard" && <Dashboard onViewChange={setCurrentView} />}
            {currentView === "history" && <HistoryView onOpenTracking={handleOpenTracking} />}
            {currentView === "documents" && <DocumentsView />}
            {currentView === "settings" && <SettingsView />}
            {currentView === "domain-team" && <TeamView />}
            {currentView === "domain-metrics" && <DomainMetricsView />}
          </main>
        </div>

        <TrackingPanel isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} request={selectedRequest} />

        <RequestDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          request={selectedDetailRequest}
          userRole={userRole as "lider_dominio" | "lider_gerencial"}
        />

        <Toaster />
      </div>
    </ThemeProvider>
  )
}
