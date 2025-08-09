"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Settings, 
  Save, 
  History, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"

interface ScoringConfig {
  id: string
  name: string
  version: string
  config_data: {
    scoring_weights: Record<string, number>
    classification_rules: any
    priority_matrix: any
    department_weights: Record<string, number>
  }
  created_by: string
  created_at: string
  is_active: boolean
  description: string
}

interface AuditEntry {
  id: string
  action: string
  changed_by: string
  changes: any
  timestamp: string
}

export function ConfigurationManager() {
  const [configs, setConfigs] = useState<ScoringConfig[]>([])
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([])
  const [selectedConfig, setSelectedConfig] = useState<ScoringConfig | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ScoringConfig>>({})

  // Cargar configuraciones
  useEffect(() => {
    loadConfigurations()
    loadAuditTrail()
  }, [])

  const loadConfigurations = async () => {
    try {
      const response = await fetch('/api/configurations')
      const data = await response.json()
      setConfigs(data)
    } catch (error) {
      console.error('Error loading configurations:', error)
    }
  }

  const loadAuditTrail = async () => {
    try {
      const response = await fetch('/api/configurations/audit')
      const data = await response.json()
      setAuditTrail(data)
    } catch (error) {
      console.error('Error loading audit trail:', error)
    }
  }

  const activateConfig = async (configId: string) => {
    try {
      await fetch(`/api/configurations/${configId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changed_by: 'current_user' })
      })
      loadConfigurations()
      loadAuditTrail()
    } catch (error) {
      console.error('Error activating configuration:', error)
    }
  }

  const saveConfiguration = async () => {
    try {
      const method = selectedConfig ? 'PUT' : 'POST'
      const url = selectedConfig 
        ? `/api/configurations/${selectedConfig.id}` 
        : '/api/configurations'
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          changed_by: 'current_user'
        })
      })
      
      setIsEditing(false)
      setSelectedConfig(null)
      setEditForm({})
      loadConfigurations()
      loadAuditTrail()
    } catch (error) {
      console.error('Error saving configuration:', error)
    }
  }

  const startEdit = (config?: ScoringConfig) => {
    setSelectedConfig(config || null)
    setEditForm(config ? { ...config } : {
      name: '',
      version: 'v1.0',
      description: '',
      config_data: {
        scoring_weights: {
          problem_identified: 20,
          description_detailed: 20,
          impact_defined: 15,
          frequency_specified: 10,
          volume_quantified: 10,
          tools_current: 10,
          stakeholders_identified: 10,
          urgency_defined: 5
        },
        classification_rules: {},
        priority_matrix: {},
        department_weights: {}
      }
    })
    setIsEditing(true)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Settings className="h-6 w-6 mr-2" />
              Gestión de Configuraciones
            </h1>
            <p className="text-muted-foreground">
              Administra las rúbricas de scoring y reglas de priorización
            </p>
          </div>
          <Button onClick={() => startEdit()} className="bg-utp-blue hover:bg-utp-blue-dark">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Configuración
          </Button>
        </div>

        <Tabs defaultValue="configurations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configurations">Configuraciones</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          {/* Tab: Configuraciones */}
          <TabsContent value="configurations">
            <Card>
              <CardHeader>
                <CardTitle>Configuraciones de Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Versión</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creado por</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell className="font-medium">{config.name}</TableCell>
                        <TableCell>{config.version}</TableCell>
                        <TableCell>
                          {config.is_active ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Activa
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Inactiva
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{config.created_by}</TableCell>
                        <TableCell>{new Date(config.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(config)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {!config.is_active && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => activateConfig(config.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Editor */}
          <TabsContent value="editor">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedConfig ? 'Editar Configuración' : 'Nueva Configuración'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="version">Versión</Label>
                      <Input
                        id="version"
                        value={editForm.version || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, version: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  {/* Scoring Weights Editor */}
                  <div>
                    <Label>Pesos de Scoring Básico</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {Object.entries(editForm.config_data?.scoring_weights || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Label className="text-sm w-32">{key.replace(/_/g, ' ')}</Label>
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => {
                              const newWeights = { ...editForm.config_data?.scoring_weights }
                              newWeights[key] = parseInt(e.target.value)
                              setEditForm(prev => ({
                                ...prev,
                                config_data: {
                                  ...prev.config_data!,
                                  scoring_weights: newWeights
                                }
                              }))
                            }}
                            className="w-20"
                            min="0"
                            max="25"
                          />
                          <span className="text-xs text-muted-foreground">pts</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Platform Complexity Matrix Editor */}
                  <div>
                    <Label>Matriz de Complejidad de Plataformas</Label>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {Object.entries(editForm.config_data?.platform_complexity_matrix || {}).map(([platform, config]) => (
                        <div key={platform} className="grid grid-cols-4 gap-2 items-center p-2 border rounded">
                          <Label className="text-sm font-medium">{platform}</Label>
                          <div className="flex items-center space-x-1">
                            <Label className="text-xs">Complejidad:</Label>
                            <Input
                              type="number"
                              value={config.complexity}
                              onChange={(e) => {
                                const newMatrix = { ...editForm.config_data?.platform_complexity_matrix }
                                newMatrix[platform] = { ...newMatrix[platform], complexity: parseInt(e.target.value) }
                                setEditForm(prev => ({
                                  ...prev,
                                  config_data: {
                                    ...prev.config_data!,
                                    platform_complexity_matrix: newMatrix
                                  }
                                }))
                              }}
                              className="w-16"
                              min="1"
                              max="10"
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <Label className="text-xs">Integración:</Label>
                            <Input
                              type="number"
                              value={config.integration_effort}
                              onChange={(e) => {
                                const newMatrix = { ...editForm.config_data?.platform_complexity_matrix }
                                newMatrix[platform] = { ...newMatrix[platform], integration_effort: parseInt(e.target.value) }
                                setEditForm(prev => ({
                                  ...prev,
                                  config_data: {
                                    ...prev.config_data!,
                                    platform_complexity_matrix: newMatrix
                                  }
                                }))
                              }}
                              className="w-16"
                              min="1"
                              max="10"
                            />
                          </div>
                          <div className="flex items-center space-x-1">
                            <Label className="text-xs">Impacto:</Label>
                            <Input
                              type="number"
                              value={config.user_impact}
                              onChange={(e) => {
                                const newMatrix = { ...editForm.config_data?.platform_complexity_matrix }
                                newMatrix[platform] = { ...newMatrix[platform], user_impact: parseInt(e.target.value) }
                                setEditForm(prev => ({
                                  ...prev,
                                  config_data: {
                                    ...prev.config_data!,
                                    platform_complexity_matrix: newMatrix
                                  }
                                }))
                              }}
                              className="w-16"
                              min="1"
                              max="10"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Effort Calculation Parameters */}
                  <div>
                    <Label>Parámetros de Cálculo de Esfuerzo</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Horas base por complejidad:</Label>
                        <Input
                          type="number"
                          value={editForm.config_data?.effort_calculation?.base_hours_per_complexity || 8}
                          onChange={(e) => {
                            setEditForm(prev => ({
                              ...prev,
                              config_data: {
                                ...prev.config_data!,
                                effort_calculation: {
                                  ...prev.config_data?.effort_calculation,
                                  base_hours_per_complexity: parseInt(e.target.value)
                                }
                              }
                            }))
                          }}
                          className="w-20"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Multiplicador integración:</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editForm.config_data?.effort_calculation?.integration_multiplier || 1.5}
                          onChange={(e) => {
                            setEditForm(prev => ({
                              ...prev,
                              config_data: {
                                ...prev.config_data!,
                                effort_calculation: {
                                  ...prev.config_data?.effort_calculation,
                                  integration_multiplier: parseFloat(e.target.value)
                                }
                              }
                            }))
                          }}
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Priority Matrix Editor */}
                  <div>
                    <Label>Matriz de Priorización</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {Object.entries(editForm.config_data?.priority_matrix || {}).map(([priority, thresholds]) => (
                        <div key={priority} className="flex items-center space-x-4 p-2 border rounded">
                          <Badge className={
                            priority === 'critical' ? 'bg-red-100 text-red-800' :
                            priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {priority.toUpperCase()}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Label className="text-xs">Score mín:</Label>
                            <Input
                              type="number"
                              value={thresholds.total_score_min || thresholds.total_score_max || 0}
                              onChange={(e) => {
                                const newMatrix = { ...editForm.config_data?.priority_matrix }
                                const key = thresholds.total_score_min ? 'total_score_min' : 'total_score_max'
                                newMatrix[priority] = { ...newMatrix[priority], [key]: parseInt(e.target.value) }
                                setEditForm(prev => ({
                                  ...prev,
                                  config_data: {
                                    ...prev.config_data!,
                                    priority_matrix: newMatrix
                                  }
                                }))
                              }}
                              className="w-16"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={saveConfiguration} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Selecciona una configuración para editar o crea una nueva
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab: Audit Trail */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Historial de Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Acción</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Cambios</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditTrail.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <Badge variant={
                            entry.action === 'activated' ? 'default' :
                            entry.action === 'created' ? 'secondary' : 'outline'
                          }>
                            {entry.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.changed_by}</TableCell>
                        <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
