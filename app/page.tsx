"use client"

// Nota: No exportar dynamic/revalidate/fetchCache desde Client Components

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import MisSolicitudesPage from "@/app/(authenticated)/mis-solicitudes/page"
import { TrackingPanel } from "@/components/tracking-panel"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notification-center"
import { Toaster } from "@/components/ui/toaster"
import dynamic from "next/dynamic"
const LoginPageClient = dynamic(() => import("@/components/login-page").then(m => m.LoginPage), { ssr: false })
import { LeaderDashboard } from "@/components/leader-dashboard"
import { RealisticLeaderModal } from "@/components/realistic-leader-modal"
import { UserRequestDetailModal } from "@/components/user-request-detail-modal"
import Dashboard from "@/components/dashboard"
import HistoryView from "@/components/history-view"
import SimpleHistoryView from "@/components/simple-history-view"
import DocumentsView from "@/components/documents-view"
import SettingsView from "@/components/settings-view"
import SimpleSettingsView from "@/components/simple-settings-view"
import HelpView from "@/components/help-view"

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
  const [pendingOpenRequest, setPendingOpenRequest] = useState<string | null>(null)

  const handleLogin = (email: string, role: string) => {
    setUserEmail(email)
    setUserRole(role)
    setIsAuthenticated(true)

    // Persistir sesión básica para que el chat pueda leer user/token
    try {
      const localName = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const user = { user_id: email, email, name: localName, role }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('auth_token', 'utp-portal-local-session')
        window.localStorage.setItem('current_user', JSON.stringify(user))
      }
    } catch {}

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
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('auth_token')
        window.localStorage.removeItem('current_user')
      }
    } catch {}
  }

  const handleOpenTracking = (request: any) => {
    setSelectedRequest(request)
    setIsTrackingOpen(true)
  }

  const handleOpenDetail = async (request: any) => {
    try {
      let full = request
      // Si solo viene un objeto formateado del dashboard, traer detalles completos por ID
      if (request?.id) {
        const resp = await fetch(`/api/requests/${encodeURIComponent(request.id)}`)
        if (resp.ok) {
          const json = await resp.json()
          const data = json?.data ?? json
          if (data) {
            // Merge conservando los valores crudos de BD y agregando campos de UI para mostrar
            full = {
              ...data,
              // alias UI comunes usados por los modales
              title: data.titulo_solicitud || request.title,
              submissionDate: data.created_at || request.submissionDate,
              daysInStatus: data.days_since_created ?? request.daysInStatus,
              department: data.departamento_solicitante || request.department,
              description: data.problema_principal || request.description,
              impact: data.objetivo_esperado || request.impact,
              priority: data.prioridad_final || data.prioridad_sugerida || request.priority,
              classification: data.clasificacion_final || data.clasificacion_sugerida || request.classification,
            }
          }
        }
      }
      setSelectedDetailRequest(full)
      setIsDetailModalOpen(true)
    } catch {
      setSelectedDetailRequest(request)
      setIsDetailModalOpen(true)
    }
  }

  // Cuando el chat crea una solicitud nueva, cambiar a "history" y emitir evento para abrir modal
  const handleRequestCreated = (requestId: string) => {
    setCurrentView("history")
    setPendingOpenRequest(requestId)
    // Dar un pequeño margen para que el componente monte y luego emitir el evento
    setTimeout(() => {
      try {
        window.dispatchEvent(new CustomEvent("requests:refresh"))
        window.dispatchEvent(new CustomEvent("open_request", { detail: { id: requestId } }))
      } catch {}
    }, 250)
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
      case "help":
        return "❓ Centro de Ayuda"
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
        <LoginPageClient onLogin={handleLogin} />
        <Toaster />
      </ThemeProvider>
    )
  }

  // Si está autenticado, mostrar la aplicación principal
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Sidebar - Responsive */}
        <div className={`${userRole === "solicitante" ? "hidden lg:block" : ""}`}>
          <Sidebar
            onOpenTracking={handleOpenTracking}
            currentView={currentView}
            onViewChange={setCurrentView}
            userRole={userRole}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with notifications and theme toggle - Responsive */}
          <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 shadow-sm">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">{getViewTitle()}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userEmail} • {getRoleDisplayName(userRole)}
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationCenter />
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors hidden sm:block"
              >
                Cerrar Sesión
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors sm:hidden"
                title="Cerrar Sesión"
              >
                ✕
              </button>
            </div>
          </header>

          {/* Dynamic Content Area - Responsive */}
          <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
            {currentView === "chat" && <ChatInterface onRequestCreated={handleRequestCreated} />}
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
            {currentView === "history" && (
              // Reutilizamos la página real de "Mis Solicitudes" dentro del SPA
              <MisSolicitudesPage />
            )}
            {currentView === "help" && <HelpView />}
            {currentView === "documents" && <DocumentsView />}
            {currentView === "settings" && (
              userRole === "solicitante" 
                ? <SimpleSettingsView /> 
                : <SettingsView />
            )}
            {currentView === "domain-team" && <TeamView />}
            {currentView === "domain-metrics" && <DomainMetricsView />}
          </main>
        </div>

        <TrackingPanel isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} request={selectedRequest} />

        {userRole === "solicitante" ? (
          <UserRequestDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            request={selectedDetailRequest}
          />
        ) : (
          <RealisticLeaderModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            request={selectedDetailRequest}
            userRole={userRole as "lider_dominio" | "lider_gerencial"}
          />
        )}

        <Toaster />
      </div>
    </ThemeProvider>
  )
}
