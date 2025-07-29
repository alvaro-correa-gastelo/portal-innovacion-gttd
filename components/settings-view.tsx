"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Bell,
  Shield,
  Palette,
  Mail,
  Save,
  Camera,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
} from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export default function SettingsView() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    statusUpdates: true,
    weeklyReports: false,
    projectReminders: true,
    teamMessages: true,
  })

  const [profile, setProfile] = useState({
    name: "Juan Pérez",
    email: "juan.perez@utp.edu.pe",
    phone: "+51 999 888 777",
    department: "Sistemas de Información",
    position: "Analista de Sistemas",
    employeeId: "UTP-2024-001",
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const notificationTypes = [
    {
      key: "email",
      title: "Notificaciones por Email",
      description: "Recibir actualizaciones por correo electrónico",
      icon: Mail,
    },
    {
      key: "push",
      title: "Notificaciones Push",
      description: "Notificaciones en tiempo real en el navegador",
      icon: Bell,
    },
    {
      key: "statusUpdates",
      title: "Actualizaciones de Estado",
      description: "Cuando cambie el estado de tus solicitudes",
      icon: CheckCircle,
    },
    {
      key: "weeklyReports",
      title: "Reportes Semanales",
      description: "Resumen semanal de actividad",
      icon: FileText,
    },
    {
      key: "projectReminders",
      title: "Recordatorios de Proyecto",
      description: "Recordatorios sobre fechas importantes",
      icon: Clock,
    },
    {
      key: "teamMessages",
      title: "Mensajes del Equipo",
      description: "Comunicaciones del equipo GTTD",
      icon: AlertCircle,
    },
  ]

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Gestiona tu perfil y preferencias del sistema</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Apariencia</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Seguridad</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback className="bg-red-600 text-white text-xl">JP</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="mb-2 bg-transparent">
                      <Camera className="h-4 w-4 mr-2" />
                      Cambiar Foto
                    </Button>
                    <p className="text-sm text-muted-foreground">JPG, PNG o GIF. Máximo 2MB.</p>
                  </div>
                </div>

                <Separator />

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
                    <Label htmlFor="employeeId">ID Empleado</Label>
                    <Input id="employeeId" value={profile.employeeId} disabled className="bg-muted" />
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
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={profile.position}
                      onChange={(e) => setProfile((prev) => ({ ...prev, position: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
                <p className="text-sm text-muted-foreground">Configura cómo y cuándo quieres recibir notificaciones</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {notificationTypes.map((type) => (
                  <div key={type.key} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-3">
                      <type.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{type.title}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[type.key as keyof typeof notifications]}
                      onCheckedChange={(value) => handleNotificationChange(type.key, value)}
                    />
                  </div>
                ))}

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Horario de Notificaciones</h3>
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
                  <p className="text-sm text-muted-foreground">
                    Las notificaciones solo se enviarán durante este horario
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Preferencias
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Apariencia</CardTitle>
                <p className="text-sm text-muted-foreground">Personaliza la apariencia de la aplicación</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Tema</p>
                    <p className="text-sm text-muted-foreground">Cambia entre modo claro y oscuro</p>
                  </div>
                  <ThemeToggle />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Configuración de Dashboard</h3>
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

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Idioma y Región</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Idioma</Label>
                      <select className="w-full p-2 border border-border rounded-md bg-background">
                        <option>Español (Perú)</option>
                        <option>English (US)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Zona Horaria</Label>
                      <select className="w-full p-2 border border-border rounded-md bg-background">
                        <option>Lima (UTC-5)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Seguridad</CardTitle>
                <p className="text-sm text-muted-foreground">Gestiona la seguridad de tu cuenta</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Cambiar Contraseña</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Contraseña Actual</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nueva Contraseña</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar Nueva Contraseña</Label>
                      <Input type="password" />
                    </div>
                  </div>
                  <Button variant="outline">Cambiar Contraseña</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Sesiones Activas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Navegador Actual</p>
                        <p className="text-sm text-muted-foreground">Chrome en Windows • Lima, Perú</p>
                        <p className="text-xs text-muted-foreground">Última actividad: Ahora</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                        Activa
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Móvil</p>
                        <p className="text-sm text-muted-foreground">Safari en iPhone • Lima, Perú</p>
                        <p className="text-xs text-muted-foreground">Última actividad: Hace 2 horas</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Cerrar Sesión
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Configuración de Privacidad</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Permitir análisis de uso</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Compartir datos con equipo GTTD</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
