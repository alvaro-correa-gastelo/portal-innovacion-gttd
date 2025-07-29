"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

export default function DomainMetricsView() {
  const [dateFilter, setDateFilter] = useState("30days")

  // Datos simulados para los gráficos
  const requestsByType = [
    { name: "Proyectos", value: 12, color: "#8B5CF6" },
    { name: "Requerimientos", value: 18, color: "#3B82F6" },
  ]

  const requestsByPriority = [
    { name: "Alta", value: 35, color: "#EF4444" },
    { name: "Media", value: 45, color: "#F59E0B" },
    { name: "Baja", value: 20, color: "#10B981" },
  ]

  const cycleTimeData = [
    { month: "Ene", tiempo: 4.2 },
    { month: "Feb", tiempo: 3.8 },
    { month: "Mar", tiempo: 4.5 },
    { month: "Abr", tiempo: 3.2 },
    { month: "May", tiempo: 2.9 },
    { month: "Jun", tiempo: 2.5 },
    { month: "Jul", tiempo: 2.8 },
  ]

  const timeByStateData = [
    { estado: "Nueva", tiempo: 0.5, color: "#3B82F6" },
    { estado: "En Evaluación", tiempo: 2.3, color: "#F59E0B" },
    { estado: "En Planificación", tiempo: 1.8, color: "#8B5CF6" },
    { estado: "En Desarrollo", tiempo: 8.2, color: "#10B981" },
    { estado: "En Testing", tiempo: 2.1, color: "#F97316" },
    { estado: "Completado", tiempo: 0.3, color: "#6B7280" },
  ]

  const getDateRangeLabel = (filter: string) => {
    switch (filter) {
      case "30days":
        return "Últimos 30 días"
      case "quarter":
        return "Último Trimestre"
      case "year":
        return "Último Año"
      default:
        return "Últimos 30 días"
    }
  }

  const COLORS = ["#EF4444", "#F59E0B", "#10B981"]

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Análisis de Métricas del Dominio</h1>
            <p className="text-muted-foreground">Sistemas de Información - Análisis de rendimiento y tendencias</p>
          </div>

          {/* Filtro de Fecha */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Período:</span>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Últimos 30 días</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Indicador del período seleccionado */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">
              📊 Mostrando datos para: <strong>{getDateRangeLabel(dateFilter)}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Fila Superior de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Solicitudes por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">📊 Solicitudes por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={requestsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} solicitudes`, "Cantidad"]}
                    labelStyle={{ color: "#374151" }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Proyectos: {requestsByType[0].value}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Requerimientos: {requestsByType[1].value}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico 2: Solicitudes por Prioridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">🥧 Solicitudes por Prioridad</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={requestsByPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {requestsByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Porcentaje"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                {requestsByPriority.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded`} style={{ backgroundColor: COLORS[index] }}></div>
                    <span>
                      {item.name}: {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fila Inferior de Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 3: Tiempo Promedio de Ciclo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">📈 Tiempo Promedio de Ciclo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cycleTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} días`, "Tiempo Promedio"]}
                    labelStyle={{ color: "#374151" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tiempo"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Tendencia:</strong> Mejora del 33% en los últimos 6 meses (de 4.2 a 2.8 días)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico 4: Tiempo Promedio por Estado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">🚧 Tiempo Promedio por Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeByStateData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="estado" type="category" width={100} />
                  <Tooltip
                    formatter={(value) => [`${value} días`, "Tiempo Promedio"]}
                    labelStyle={{ color: "#374151" }}
                  />
                  <Bar dataKey="tiempo" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estado con mayor tiempo:</span>
                  <span className="font-medium">En Desarrollo (8.2 días)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cuello de botella identificado:</span>
                  <span className="font-medium text-orange-600">En Evaluación (2.3 días)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">💡 Insights y Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">🎯 Fortalezas</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Tiempo de ciclo en mejora constante</li>
                  <li>• Balance saludable entre proyectos y requerimientos</li>
                  <li>• Proceso de completado eficiente</li>
                </ul>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">⚠️ Áreas de Mejora</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Reducir tiempo en "En Evaluación"</li>
                  <li>• Optimizar fase de desarrollo</li>
                  <li>• Balancear carga de solicitudes de alta prioridad</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
