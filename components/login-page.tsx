"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react"

interface LoginPageProps {
  onLogin: (email: string, role: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  // Evitar hydration mismatch en SSR renderizando el logo solo en el cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Usuarios de prueba según las especificaciones
  const testUsers = {
    "solicitante@utp.edu.pe": { password: "123456", role: "solicitante" },
    "juan.deza@utp.edu.pe": { password: "123456", role: "lider_dominio" },
    "mapi.salas@utp.edu.pe": { password: "123456", role: "lider_gerencial" },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simular validación de credenciales
    setTimeout(() => {
      const user = testUsers[email as keyof typeof testUsers]

      if (user && user.password === password) {
        // Login exitoso
        onLogin(email, user.role)
      } else {
        // Credenciales incorrectas
        setError("Correo electrónico o contraseña incorrectos")
      }

      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Tarjeta Principal de Login */}
        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-6 pt-8">
            {/* Logo UTP oficial: wrapper constante para SSR/CSR; img solo en cliente */}
            <div className="flex justify-center mb-6" style={{ minHeight: '3rem' }} suppressHydrationWarning>
              {mounted ? (
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Utplogonuevo.svg/2560px-Utplogonuevo.svg.png"
                  alt="Universidad Tecnológica del Perú"
                  className="h-12 w-auto object-contain"
                  loading="eager"
                />
              ) : (
                // Placeholder para mantener estructura y altura durante SSR
                <span className="inline-block" style={{ height: '3rem' }} aria-hidden />
              )}
            </div>

            {/* Título y Subtítulo */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Bienvenido al Portal de Innovación</h1>
              <p className="text-gray-600 text-sm">Ingresa tus credenciales para continuar</p>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de Correo Electrónico */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre.apellido@utp.edu.pe"
                    className="pl-10 h-12 border-gray-200 focus:border-utp-blue focus:ring-utp-blue"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Campo de Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-utp-blue focus:ring-utp-blue"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Mensaje de Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Opciones Adicionales */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-300 data-[state=checked]:bg-utp-blue data-[state=checked]:border-utp-blue"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    Recordarme
                  </Label>
                </div>
                <button type="button" className="text-sm text-utp-blue hover:text-utp-blue-dark transition-colors">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón de Iniciar Sesión */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-utp-blue hover:bg-utp-blue-dark text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {/* Información de Usuarios de Prueba */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-800">Usuarios de Prueba</h3>
              </div>
              <div className="space-y-2 text-xs text-blue-700">
                <div>
                  <strong>Solicitante:</strong> solicitante@utp.edu.pe
                </div>
                <div>
                  <strong>Líder de Dominio:</strong> juan.deza@utp.edu.pe
                </div>
                <div>
                  <strong>Líder Gerencial:</strong> mapi.salas@utp.edu.pe
                </div>
                <div className="pt-1 border-t border-blue-200">
                  <strong>Contraseña para todos:</strong> 123456
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie de Página */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-gray-500">
            Al iniciar sesión, aceptas nuestros{" "}
            <button className="text-utp-blue hover:text-utp-blue-dark transition-colors">Términos de Servicio</button> y{" "}
            <button className="text-utp-blue hover:text-utp-blue-dark transition-colors">Política de Privacidad</button>
          </p>
          <p className="text-xs text-gray-400">© 2025 Universidad Tecnológica del Perú - GTTD</p>
        </div>
      </div>
    </div>
  )
}
