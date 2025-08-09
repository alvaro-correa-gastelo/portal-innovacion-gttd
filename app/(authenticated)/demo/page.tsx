'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Shield, 
  Database, 
  ArrowRight, 
  Eye,
  Settings,
  BarChart3,
  TestTube
} from "lucide-react"

/**
 * Página de demostración - Enlaces directos a cada vista
 * Acceso: /demo
 */
export default function DemoIndexPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Demostración de Vistas
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Portal de Solicitudes de Innovación - Vistas por Rol de Usuario
        </p>
        <Badge variant="outline" className="mt-2">
          Demo Environment
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Vista de Usuario */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Vista de Usuario</CardTitle>
                <Badge variant="outline" className="text-xs">Solicitante</Badge>
              </div>
            </div>
            <CardDescription>
              Vista simplificada para usuarios que envían solicitudes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-green-600" />
                <span>Modal simplificado con timeline</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span>Estadísticas básicas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Solo lectura de sus solicitudes</span>
              </div>
            </div>
            
            <Link href="/demo/user">
              <Button className="w-full">
                Probar Vista de Usuario
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Vista de Líder */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Vista de Líder</CardTitle>
                <Badge variant="outline" className="text-xs">Líder de Dominio</Badge>
              </div>
            </div>
            <CardDescription>
              Panel de gestión para líderes de dominio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4 text-green-600" />
                <span>Funciones de gestión completas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span>Filtros avanzados</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-green-600" />
                <span>Modal detallado con análisis</span>
              </div>
            </div>
            
            <Link href="/demo/leader">
              <Button className="w-full" variant="outline">
                Probar Vista de Líder
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Vista de Admin */}
        <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Vista de Admin</CardTitle>
                <Badge variant="outline" className="text-xs">Administrador PS</Badge>
              </div>
            </div>
            <CardDescription>
              Panel administrativo con métricas completas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span>6 métricas avanzadas</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Settings className="h-4 w-4 text-green-600" />
                <span>Análisis de tendencias</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Database className="h-4 w-4 text-green-600" />
                <span>Vista completa del sistema</span>
              </div>
            </div>
            
            <Link href="/demo/admin">
              <Button className="w-full" variant="secondary">
                Probar Vista de Admin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Nueva sección: Prueba de Modales */}
      <Card className="mt-8 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
              <TestTube className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-800 dark:text-green-200">
                🧪 Prueba de Modales con Datos Reales
              </CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 mt-1">
                Nuevo - Basado en tu BD
              </Badge>
            </div>
          </div>
          <CardDescription className="text-green-700 dark:text-green-300">
            Compara los diferentes tipos de modales usando los datos reales de tu estructura de BD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Eye className="h-4 w-4" />
              <span><strong>RealisticLeaderModal:</strong> Solo datos reales, sin mockups</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <TestTube className="h-4 w-4" />
              <span><strong>PreviewLeaderModal:</strong> Datos reales + preview funcionalidades futuras</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Database className="h-4 w-4" />
              <span><strong>UserRequestDetailModal:</strong> Ya perfecto, usando BD real</span>
            </div>
          </div>
          
          <Link href="/test-modals">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <TestTube className="mr-2 h-4 w-4" />
              Probar Modales con Datos Reales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="mt-8 bg-gray-50 dark:bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Información Técnica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Rutas Directas:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• <code>/demo/user</code> - Vista de Usuario</li>
                <li>• <code>/demo/leader</code> - Vista de Líder</li>
                <li>• <code>/demo/admin</code> - Vista de Admin</li>
                <li>• <code>/test-modals</code> - 🧪 Prueba de Modales</li>
                <li>• <code>/my-requests</code> - Redirección inteligente</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Componentes:</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• <code>UserRequestDetailModal</code> - Modal simplificado</li>
                <li>• <code>RealisticLeaderModal</code> - Solo datos reales</li>
                <li>• <code>PreviewLeaderModal</code> - Datos + preview futuro</li>
                <li>• <code>RequestDetailModal</code> - Modal completo original</li>
                <li>• <code>RequestRouter</code> - Redirección automática</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
