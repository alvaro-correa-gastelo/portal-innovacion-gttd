'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Clock, Search, FileText } from "lucide-react"

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMyRequests()
  }, [])

  const fetchMyRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // ID de prueba del usuario
      const userId = 'test.user@utp.edu.pe'
      
      const response = await fetch(`/api/requests?user_id=${userId}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar las solicitudes')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setRequests(data.data || [])
      } else {
        setError(data.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      'pending_approval': {
        label: 'Pendiente Aprobación',
        variant: 'secondary',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      },
      'pending_technical_analysis': {
        label: 'Análisis Técnico',
        variant: 'outline',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      },
      'in_evaluation': {
        label: 'En Evaluación',
        variant: 'secondary',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      },
      'approved': {
        label: 'Aprobada',
        variant: 'default',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      },
      'rejected': {
        label: 'Rechazada',
        variant: 'destructive',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      },
      'on_hold': {
        label: 'En Espera',
        variant: 'outline',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
      }
    }
    return configs[status] || configs['pending_approval']
  }

  const getPriorityConfig = (priority) => {
    const configs = {
      'P1': { label: 'Alta', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
      'P2': { label: 'Media', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
      'P3': { label: 'Baja', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
      'P4': { label: 'Muy Baja', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' }
    }
    return configs[priority] || { label: 'Media', color: 'bg-yellow-100 text-yellow-700' }
  }

  // Agrupar solicitudes por su estado
  const groupRequests = () => {
    const active = requests.filter(r => ['pending_approval', 'pending_technical_analysis', 'in_evaluation'].includes(r.status))
    const completed = requests.filter(r => ['approved', 'rejected'].includes(r.status))
    const onHold = requests.filter(r => r.status === 'on_hold')
    
    return { active, completed, onHold }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mis solicitudes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchMyRequests} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const grouped = groupRequests()

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Mis Solicitudes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Seguimiento de tus solicitudes de innovación
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            {requests.length} solicitudes totales
          </Badge>
          <Button onClick={fetchMyRequests} variant="outline" size="sm">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar en solicitudes..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs por estado */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activas ({grouped.active.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Finalizadas ({grouped.completed.length})
          </TabsTrigger>
          <TabsTrigger value="onHold" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            En Espera ({grouped.onHold.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <RequestList requests={grouped.active} />
        </TabsContent>

        <TabsContent value="completed">
          <RequestList requests={grouped.completed} />
        </TabsContent>

        <TabsContent value="onHold">
          <RequestList requests={grouped.onHold} />
        </TabsContent>
      </Tabs>
    </div>
  )

  // Componente interno para listar las solicitudes
  function RequestList({ requests }) {
    if (requests.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 text-center">
              No se encontraron solicitudes en esta categoría
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg leading-tight mb-1">
                    {request.title || 'Sin título'}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {request.problem || 'Sin descripción del problema'}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getStatusConfig(request.status).variant} className={getStatusConfig(request.status).color}>
                    {getStatusConfig(request.status).label}
                  </Badge>
                  {request.priority && (
                    <Badge variant="outline" className={getPriorityConfig(request.priority).color}>
                      {getPriorityConfig(request.priority).label}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Información básica */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  {request.department && (
                    <div>
                      <span className="text-gray-500">Departamento:</span>
                      <span className="ml-2 font-medium">{request.department}</span>
                    </div>
                  )}
                  {request.classification && (
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <span className="ml-2 font-medium capitalize">{request.classification}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Enviado:</span>
                    <span className="ml-2 font-medium">Hace {request.days_since_created || 0} días</span>
                  </div>
                </div>

                {/* Comentarios del líder (si existen) */}
                {request.leader_comments && (
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-1">
                      Comentarios del líder:
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{request.leader_comments}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}
