"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Download, TrendingUp, AlertTriangle, Clock, CheckCircle, FileText, BarChart3 } from "lucide-react"

export function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState({
    from: "2025-01-01",
    to: "2025-01-31",
  })

  // Datos simulados para los gráficos
  const demandHeatmapData = [
    { area: "Ingeniería", solicitudes: 45, color: "#3B82F6" },
    { area: "Ciencias", solicitudes: 32, color: "#10B981" },
    { area: "Humanidades", solicitudes: 28, color: "#F59E0B" },
    { area: "Medicina", solicitudes: 38, color: "#EF4444" },
    { area: "Administración", solicitudes: 22, color: "#8B5CF6" },
    { area: "Derecho", solicitudes: 18, color: "#06B6D4" },
  ]

  const trendData = [
    { mes: "Ene", recibidas: 65, aprobadas: 48 },
    { mes: "Feb", recibidas: 78, aprobadas: 52 },
    { mes: "Mar", recibidas: 82, aprobadas: 61 },
    { mes: "Abr", recibidas: 71, aprobadas: 58 },
    { mes: "May", recibidas: 89, aprobadas: 67 },
    { mes: "Jun", recibidas: 94, aprobadas: 72 },
  ]

  const bottleneckData = [
    { estado: "Nuevas", tiempo: 1.2, color: "#10B981" },
    { estado: "En Evaluación", tiempo: 5.8, color: "#F59E0B" },
    { estado: "En Planificación", tiempo: 3.4, color: "#3B82F6" },
    { estado: "En Desarrollo", tiempo: 12.6, color: "#EF4444" },
    { estado: "En Testing", tiempo: 2.1, color: "#8B5CF6" },
  ]

  const tableData = [
    {
      id: "REQ-2025-001",
      titulo: "Sistema de Gestión de Inventarios TI",
      tipo: "Requerimiento",
      solicitante: "Juan Pérez",
      area: "Ingeniería",
      estado: "En Evaluación",
      fecha: "2025-01-20",
      presupuesto: "$15,000",
    },
    {
      id: "PROJ-2025-002",
      titulo: "Plataforma de Análisis Predictivo",
      tipo: "Proyecto",
      solicitante: "María González",
      area: "Ciencias",
      estado: "Aprobada",
      fecha: "2025-01-22",
      presupuesto: "$45,000",
    },
    {
      id: "REQ-2025-003",
      titulo: "Automatización de Reportes",
      tipo: "Requerimiento",
      solicitante: "Carlos Mendoza",
      area: "Administración",
      estado: "En Desarrollo",
      fecha: "2025-01-18",
      presupuesto: "$8,000",
    },
    {
      id: "PROJ-2025-004",
      titulo: "App Móvil Estudiantes",
      tipo: "Proyecto",
      solicitante: "Ana López",
      area: "Humanidades",
      estado: "En Planificación",
      fecha: "2025-01-25",
      presupuesto: "$32,000",
    },
    {
      id: "REQ-2025-005",
      titulo: "Dashboard BI Académico",
      tipo: "Requerimiento",
      solicitante: "Luis Ramírez",
      area: "Medicina",
      estado: "Nueva",
      fecha: "2025-01-28",
      presupuesto: "$22,000",
    },
  ]

  // Métricas de resumen
  const totalSolicitudes = 183
  const aprobadas = 142
  const enProceso = 28
  const rechazadas = 13
  const tasaAprobacion = Math.round((aprobadas / totalSolicitudes) * 100)

  const exportToCSV = () => {
    const csvContent = [
      ["ID", "Título", "Tipo", "Solicitante", "Área", "Estado", "Fecha", "Presupuesto"],
      ...tableData.map((row) => [
        row.id,
        row.titulo,
        row.tipo,
        row.solicitante,
        row.area,
        row.estado,
        row.fecha,
        row.presupuesto,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reportes-solicitudes-${dateRange.from}-${dateRange.to}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Nueva":
        return "bg-blue-100 text-blue-700"
      case "En Evaluación":
        return "bg-yellow-100 text-yellow-700"
      case "En Planificación":
        return "bg-purple-100 text-purple-700"
      case "En Desarrollo":
        return "bg-orange-100 text-orange-700"
      case "Aprobada":
        return "bg-green-100 text-green-700"
      case "Rechazada":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">📈 Reportes y Analíticas</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Análisis de datos y métricas del portal de innovación
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="date-from" className="text-sm">
                Desde:
              </Label>
              <Input
                id="date-from"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                className="w-40"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="date-to" className="text-sm">
                Hasta:
              </Label>
              <Input
                id="date-to"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                className="w-40"
              />
            </div>
          </div>
        </div>

        {/* Métricas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Solicitudes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalSolicitudes}</p>
                  <p className="text-xs text-green-600 mt-1">+12% vs mes anterior</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Aprobación</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tasaAprobacion}%</p>
                  <p className="text-xs text-green-600 mt-1">+3% vs mes anterior</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Proceso</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{enProceso}</p>
                  <p className="text-xs text-orange-600 mt-1">Tiempo promedio: 4.2 días</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rechazadas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rechazadas}</p>
                  <p className="text-xs text-red-600 mt-1">7% del total</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Widgets de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget 1: Mapa de Calor de la Demanda */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Mapa de Calor de la Demanda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demandHeatmapData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="solicitudes" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Insight:</strong> Ingeniería lidera con 45 solicitudes (25% del total). Considerar asignar
                  más recursos a esta área.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Widget 2: Tendencia de Solicitudes */}
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Tendencia de Solicitudes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="recibidas" stroke="#3B82F6" strokeWidth={2} name="Recibidas" />
                  <Line type="monotone" dataKey="aprobadas" stroke="#10B981" strokeWidth={2} name="Aprobadas" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  📈 <strong>Insight:</strong> Tendencia creciente en ambas métricas. La brecha se mantiene estable en
                  ~20 solicitudes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Widget 3: Análisis de Cuello de Botella */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Análisis de Cuello de Botella - Tiempo Promedio por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bottleneckData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="estado" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value} días`, "Tiempo promedio"]} />
                  <Bar dataKey="tiempo" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Análisis Detallado:</h4>
                {bottleneckData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium">{item.estado}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{item.tiempo} días</span>
                      {item.tiempo > 5 && <div className="text-xs text-red-600">⚠️ Cuello de botella</div>}
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    ⚠️ <strong>Alerta:</strong> "En Desarrollo" toma 12.6 días promedio. Revisar capacidad del equipo de
                    desarrollo.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget 4: Tabla de Datos Completa */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Tabla de Datos Completa
              </CardTitle>
              <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Exportar a CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Presupuesto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-sm">{row.id}</TableCell>
                      <TableCell className="font-medium">{row.titulo}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            row.tipo === "Proyecto" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                          }
                        >
                          {row.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.solicitante}</TableCell>
                      <TableCell>{row.area}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(row.estado)}>
                          {row.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.fecha}</TableCell>
                      <TableCell className="font-medium">{row.presupuesto}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Mostrando {tableData.length} de {totalSolicitudes} solicitudes
              </span>
              <span>Datos actualizados: {new Date().toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
