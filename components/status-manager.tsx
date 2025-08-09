"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Settings,
  Play,
  Pause
} from "lucide-react"

interface StatusManagerProps {
  request: any
  onStatusChange?: (newStatus: string, comment: string) => void
  onClose?: () => void
}

export function StatusManager({ request, onStatusChange, onClose }: StatusManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState(request?.status || 'pending_approval')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const statusOptions = [
    {
      value: 'pending_approval',
      label: 'Pendiente Aprobación',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      description: 'Esperando revisión del líder'
    },
    {
      value: 'in_evaluation',
      label: 'En Evaluación',
      icon: RefreshCw,
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      description: 'Siendo evaluada técnicamente'
    },
    {
      value: 'approved',
      label: 'Aprobada',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700 border-green-300',
      description: 'Solicitud aprobada y lista para implementar'
    },
    {
      value: 'rejected',
      label: 'Rechazada',
      icon: XCircle,
      color: 'bg-red-100 text-red-700 border-red-300',
      description: 'Solicitud rechazada con comentarios'
    },
    {
      value: 'on_hold',
      label: 'En Espera',
      icon: Pause,
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      description: 'Pausada temporalmente'
    },
    {
      value: 'pending_technical_analysis',
      label: 'Análisis Técnico',
      icon: Settings,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      description: 'Requiere análisis técnico detallado'
    }
  ]

  const getCurrentStatus = () => {
    return statusOptions.find(status => status.value === request?.status) || statusOptions[0]
  }

  const getSelectedStatus = () => {
    return statusOptions.find(status => status.value === selectedStatus) || statusOptions[0]
  }

  const handleStatusChange = async () => {
    if (!comment.trim() && selectedStatus === 'rejected') {
      alert('Para rechazar una solicitud es obligatorio agregar un comentario explicativo')
      return
    }

    setIsSubmitting(true)
    try {
      // Usar la API correcta de actualización de estado
      const response = await fetch(`/api/requests/${request.id}/update-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          comment: comment.trim() || `Estado cambiado a: ${getSelectedStatus().label}`,
          leader_id: 'current_leader@utp.edu.pe', // TODO: obtener del contexto real
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          console.log('Estado cambiado exitosamente:', result.message)
          
          // Callback para el componente padre
          if (onStatusChange) {
            onStatusChange(selectedStatus, comment)
          }
          
          alert(`✅ Estado cambiado exitosamente a: ${getSelectedStatus().label}`)
          
          // Limpiar comentario después del éxito
          setComment('')
          
          // Cerrar modal si se proporciona función
          if (onClose) {
            onClose()
          }
          
          // NO recargar página automáticamente - dejar que los hooks se encarguen
        } else {
          throw new Error(result.message || 'Error en la respuesta del servidor')
        }
      } else {
        const error = await response.json()
        throw new Error(error.message || `Error HTTP: ${response.status}`)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert(`Error al cambiar el estado: ${error.message || 'Error de conexión'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentStatus = getCurrentStatus()
  const newStatus = getSelectedStatus()
  const isStatusChanged = selectedStatus !== request?.status

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
          <Settings className="h-5 w-5 mr-2 text-blue-600" />
          Gestión de Estados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Estado Actual */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Estado Actual:
          </h4>
          <div className="flex items-center space-x-2">
            {React.createElement(currentStatus.icon, { 
              className: "h-4 w-4 text-gray-600" 
            })}
            <Badge className={currentStatus.color}>
              {currentStatus.label}
            </Badge>
            <span className="text-sm text-gray-500">
              {currentStatus.description}
            </span>
          </div>
        </div>

        {/* Selector de Nuevo Estado */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Cambiar a:
          </Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center space-x-2">
                    {React.createElement(status.icon, { 
                      className: "h-4 w-4" 
                    })}
                    <span>{status.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            {newStatus.description}
          </p>
        </div>

        {/* Preview del cambio */}
        {isStatusChanged && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                {React.createElement(currentStatus.icon, { 
                  className: "h-4 w-4 text-gray-600" 
                })}
                <span className="text-sm font-medium">{currentStatus.label}</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-0.5 bg-gray-400"></div>
                <Play className="h-4 w-4 text-gray-400 mx-1" />
                <div className="w-8 h-0.5 bg-gray-400"></div>
              </div>
              
              <div className="flex items-center space-x-2">
                {React.createElement(newStatus.icon, { 
                  className: "h-4 w-4 text-blue-600" 
                })}
                <span className="text-sm font-medium text-blue-700">{newStatus.label}</span>
              </div>
            </div>
          </div>
        )}

        {/* Comentario */}
        <div>
          <Label htmlFor="status-comment" className="text-sm font-medium">
            Comentario {selectedStatus === 'rejected' && (
              <span className="text-red-600">*</span>
            )}:
          </Label>
          <Textarea
            id="status-comment"
            placeholder={
              selectedStatus === 'rejected' 
                ? "Explicar el motivo del rechazo (obligatorio)..."
                : selectedStatus === 'on_hold'
                ? "Explicar por qué se pausa temporalmente..."
                : selectedStatus === 'approved'
                ? "Comentarios adicionales sobre la aprobación..."
                : "Agregar comentarios opcionales sobre el cambio de estado..."
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2 min-h-[100px]"
          />
          {selectedStatus === 'rejected' && (
            <p className="text-xs text-red-600 mt-1">
              * Es obligatorio proporcionar un comentario para rechazar una solicitud
            </p>
          )}
        </div>

        {/* Información sobre el impacto del cambio */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
            Información del cambio:
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• El solicitante será notificado automáticamente del cambio</li>
            <li>• Los comentarios serán visibles en el portal del usuario</li>
            <li>• El historial del cambio quedará registrado</li>
            {selectedStatus === 'approved' && (
              <li className="text-green-600">• La solicitud pasará a la fase de implementación</li>
            )}
            {selectedStatus === 'rejected' && (
              <li className="text-red-600">• La solicitud será marcada como finalizada</li>
            )}
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          {onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          
          <Button
            onClick={handleStatusChange}
            disabled={isSubmitting || !isStatusChanged}
            className={
              selectedStatus === 'approved' 
                ? "bg-green-600 hover:bg-green-700 text-white"
                : selectedStatus === 'rejected'
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Cambiando...
              </>
            ) : (
              <>
                {React.createElement(newStatus.icon, { 
                  className: "h-4 w-4 mr-2" 
                })}
                Cambiar Estado
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
