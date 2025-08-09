"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Bell, 
  Palette, 
  Mail, 
  Save, 
  Camera,
  CheckCircle,
  Settings
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export default function SimpleSettingsView() {
  const [notifications, setNotifications] = useState({
    email: true,
    statusUpdates: true,
    weeklyReports: false,
    projectReminders: true,
  })

  const [profile, setProfile] = useState({
    name: "Juan Pérez",
    email: "juan.perez@utp.edu.pe", 
    phone: "+51 999 888 777",
    department: "Sistemas de Información",
    position: "Analista de Sistemas",
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveProfile = () => {
    console.log("Perfil guardado:", profile)
    alert("Cambios guardados correctamente")
  }

  const handleSaveNotifications = () => {
    console.log("Notificaciones guardadas:", notifications)
    alert("Preferencias de notificación guardadas")
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-utp-blue/20 dark:bg-utp-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-utp-blue dark:text-utp-red" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Configuración</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personaliza tu perfil y preferencias del portal
          </p>
        </div>

        {/* Perfil Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg?height=80&width=80" />
                <AvatarFallback className="bg-utp-blue dark:bg-utp-red text-white text-xl">JP</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" className="mb-2">
                  <Camera className="h-4 w-4 mr-2" />
                  Cambiar Foto
                </Button>
                <p className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG. Máximo 2MB.</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(e) => setProfile((prev) => ({ ...prev, department: e.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={profile.position}
                  readOnly
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  title="Este campo no se puede modificar. Contacte al administrador si necesita cambios."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  El cargo es asignado por el sistema y no puede ser modificado.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} className="bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Preferencias de Notificaciones
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configura cómo quieres recibir notificaciones sobre tus solicitudes
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Notificaciones por Email</p>
                    <p className="text-sm text-gray-500">Recibir actualizaciones por correo electrónico</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(value) => handleNotificationChange("email", value)}
                />
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Actualizaciones de Estado</p>
                    <p className="text-sm text-gray-500">Cuando cambie el estado de tus solicitudes</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.statusUpdates}
                  onCheckedChange={(value) => handleNotificationChange("statusUpdates", value)}
                />
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Reportes Semanales</p>
                    <p className="text-sm text-gray-500">Resumen semanal de actividad</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(value) => handleNotificationChange("weeklyReports", value)}
                />
              </div>

              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Recordatorios de Proyecto</p>
                    <p className="text-sm text-gray-500">Recordatorios sobre fechas importantes</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.projectReminders}
                  onCheckedChange={(value) => handleNotificationChange("projectReminders", value)}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-4">
                <h4 className="font-medium">Horario de Notificaciones</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Desde</Label>
                    <Input type="time" defaultValue="08:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Hasta</Label>
                    <Input type="time" defaultValue="18:00" />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Las notificaciones solo se enviarán durante este horario
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications} className="bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark">
                <Save className="h-4 w-4 mr-2" />
                Guardar Preferencias
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Configuración de Apariencia
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personaliza la apariencia del portal
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tema</p>
                <p className="text-sm text-gray-500">Cambia entre modo claro y oscuro</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium">Configuración de Dashboard</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mostrar estadísticas en tiempo real</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Animaciones de interfaz</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sonidos de notificación</span>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium">Idioma y Región</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <select className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-background">
                    <option>Español (Perú)</option>
                    <option>English (US)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Zona Horaria</Label>
                  <select className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-background">
                    <option>Lima (UTC-5)</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>ID Usuario:</strong> UTP-2024-001</p>
                  <p><strong>Rol:</strong> Solicitante</p>
                </div>
                <div>
                  <p><strong>Última sesión:</strong> Ahora</p>
                  <p><strong>Miembro desde:</strong> Enero 2024</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button variant="outline" size="sm">
                Cambiar Contraseña
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
