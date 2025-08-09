"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Save, 
  RotateCcw,
  TestTube,
  AlertTriangle,
  Target,
  Cpu,
  Building2
} from "lucide-react"

interface SimpleConfig {
  scoring_weights: {
    problem_identified: number;
    description_detailed: number;
    impact_defined: number;
    platforms_mentioned: number;
    stakeholders_identified: number;
  };
  timeframe_points: {
    menos_1_mes: number;
    '1_a_3_meses': number;
    '3_a_6_meses': number;
    sin_definir: number;
  };
  classification_thresholds: {
    project_min_score: number;
    priority_p1_min: number;
    priority_p2_min: number;
    priority_p3_min: number;
  };
  platform_bonus: Record<string, number>;
  department_weights: Record<string, number>;
}

export function SimpleConfigurationPanel() {
  const [config, setConfig] = useState<SimpleConfig | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newPlatformName, setNewPlatformName] = useState("")
  const [newPlatformBonus, setNewPlatformBonus] = useState(5)

  // Cargar configuración actual
  useEffect(() => {
    loadCurrentConfiguration()
  }, [])

  const loadCurrentConfiguration = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/configurations/active', {
        cache: 'no-store' // Soluciona el problema de caché
      });
      if (!response.ok) throw new Error('Failed to fetch configuration');
      
      const data = await response.json();
      if (data.success && data.config) {
        const cfg = data.config?.config_data ?? data.config;
        // Asegurarse de que valid_enums exista para evitar errores de renderizado
        // Asegurarse de que las nuevas propiedades existan para evitar errores
        if (!cfg.timeframe_points) {
          cfg.timeframe_points = {
            'menos_1_mes': 25,
            '1_a_3_meses': 15,
            '3_a_6_meses': 10,
            'sin_definir': 5,
          };
        }
        if (cfg.scoring_weights && cfg.scoring_weights.urgency_high) {
          delete cfg.scoring_weights.urgency_high;
        }
        setConfig(cfg);
      } else {
        throw new Error(data.error || 'Unknown error loading configuration');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      setConfig(null); // Poner config a null para mostrar el mensaje de error
    } finally {
      setLoading(false);
    }
  }

  const updateConfig = (section: string, key: string, value: number) => {
    if (!config) return
    
    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section as keyof SimpleConfig],
        [key]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const saveConfiguration = async () => {
    try {
      // Paso 1: Guardar la nueva configuración (siempre se crea como inactiva)
      const createResponse = await fetch('/api/configurations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Config v${Date.now()}`,
          version: '2.1', // O un sistema de versionado mejor
          config_data: config,
          description: 'Actualización desde el panel de administración',
          created_by: 'mapi.salas@utp.edu.pe' // Reemplazar con el usuario logueado
        })
      });

      if (!createResponse.ok) {
        throw new Error('Error al guardar la nueva configuración');
      }

      const newConfigData = await createResponse.json();
      // Asumiendo que la API devuelve el ID en `newConfigData.configuration.id`
      const newConfigId = newConfigData.configuration.id;

      if (!newConfigId) {
        throw new Error('No se recibió el ID de la nueva configuración');
      }

      // Paso 2: Activar la configuración recién creada
      const activateResponse = await fetch(`/api/configurations/${newConfigId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changed_by: 'mapi.salas@utp.edu.pe' }) // Reemplazar
      });

      if (!activateResponse.ok) {
        throw new Error('Error al activar la nueva configuración');
      }

      const activationResult = await activateResponse.json();

      if (!activationResult.success || !activationResult.activated_config) {
        throw new Error('La API no devolvió la configuración activada.');
      }

      // Actualizar el estado local con la nueva configuración activa, sin recargar
      const newActiveConfig = activationResult.activated_config.config_data;
      setConfig(newActiveConfig);

      setHasUnsavedChanges(false);
      alert('Configuración guardada y activada exitosamente.');

    } catch (error) {
      console.error('Error en el proceso de guardado y activación:', error);
      alert(`Ocurrió un error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const runSimulation = async () => {
    try {
      const testRequest = {
        problema_principal: "Canvas está muy lento para subir calificaciones",
        objetivo_esperado: "Mejorar velocidad de carga de calificaciones",
        plataformas_involucradas: ["Canvas"],
        beneficiarios: "50 profesores del área académica",
        frecuencia_uso: "diario",
        plazo_deseado: "menos_1_mes",
        departamento_solicitante: "Académico"
      }

      const response = await fetch('/api/analysis/simple-calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: testRequest }) // CORRECCIÓN: No enviar config local
      })

      const result = await response.json()
      setSimulationResult(result)
    } catch (error) {
      console.error('Error running simulation:', error)
    }
  }

  const addPlatform = () => {
    if (!config || !newPlatformName.trim()) {
      alert("Por favor, introduce un nombre para la plataforma.");
      return;
    }
    if (config.platform_bonus.hasOwnProperty(newPlatformName)) {
      alert("Esa plataforma ya existe. Puedes editar su valor directamente.");
      return;
    }

    const updatedBonus = {
      ...config.platform_bonus,
      [newPlatformName.trim()]: newPlatformBonus
    };

    setConfig({
      ...config,
      platform_bonus: updatedBonus
    });
    setHasUnsavedChanges(true);
    setNewPlatformName("");
    setNewPlatformBonus(5);
  };

  if (loading) {
    return <div className="p-6">Cargando configuración...</div>
  }

  if (!config) {
    return <div className="p-6">Error al cargar configuración</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración del Sistema de Scoring</h1>
          <p className="text-gray-600">Panel de administración para mapi.salas@utp.edu.pe</p>
        </div>
        <div className="flex space-x-2">
          {hasUnsavedChanges && (
            <Alert className="w-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Tienes cambios sin guardar</AlertDescription>
            </Alert>
          )}
          <Button onClick={saveConfiguration} disabled={!hasUnsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="weights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="weights">Pesos Scoring</TabsTrigger>
          <TabsTrigger value="timeframe">Sensibilidad Tiempo</TabsTrigger>
          <TabsTrigger value="thresholds">Umbrales</TabsTrigger>
          <TabsTrigger value="platforms">Plataformas</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
        </TabsList>

        {/* Tab 1: Pesos de Scoring */}
        <TabsContent value="weights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Pesos de Scoring</span>
              </CardTitle>
              <CardDescription>
                Configura cuántos puntos otorga cada criterio (Total recomendado: ~100 puntos)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(config.scoring_weights).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Badge variant="outline">{value} puntos</Badge>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(newValue) => updateConfig('scoring_weights', key, newValue[0])}
                    max={30}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    {getWeightDescription(key)}
                  </p>
                </div>
              ))}
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Total base:</strong> {Object.values(config.scoring_weights).reduce((a, b) => a + b, 0)} puntos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Sensibilidad al Tiempo */}
        <TabsContent value="timeframe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Puntos por Plazo Deseado</span>
              </CardTitle>
              <CardDescription>
                Define los puntos adicionales según el plazo esperado por el usuario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(config.timeframe_points).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-4">
                  <Label className="w-48 text-sm">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                  </Label>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => updateConfig('timeframe_points', key, parseInt(e.target.value))}
                    className="w-20"
                    min="0"
                    max="50"
                  />
                  <span className="text-sm text-gray-500">puntos</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Umbrales */}
        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Umbrales de Clasificación</span>
              </CardTitle>
              <CardDescription>
                Define los puntos mínimos para cada clasificación y prioridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(config.classification_thresholds).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-4">
                  <Label className="w-48 text-sm">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                  </Label>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => updateConfig('classification_thresholds', key, parseInt(e.target.value))}
                    className="w-20"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm text-gray-500">puntos</span>
                  <Badge variant={getThresholdColor(key)}>
                    {getThresholdLabel(key)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Plataformas */}
        <TabsContent value="platforms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="h-5 w-5" />
                <span>Bonus por Plataformas</span>
              </CardTitle>
              <CardDescription>
                Puntos adicionales cuando se mencionan plataformas específicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(config.platform_bonus).map(([platform, bonus]) => (
                  <div key={platform} className="flex items-center space-x-3">
                    <Label className="w-24 text-sm truncate" title={platform}>{platform}:</Label>
                    <Input
                      type="number"
                      value={bonus}
                      onChange={(e) => updateConfig('platform_bonus', platform, parseInt(e.target.value))}
                      className="w-20"
                      min="0"
                      max="30"
                    />
                    <span className="text-xs text-gray-500">pts</span>
                  </div>
                ))}
              </div>
              
              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Añadir Nueva Plataforma</h4>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Nombre de la Plataforma"
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Bonus"
                    value={newPlatformBonus}
                    onChange={(e) => setNewPlatformBonus(parseInt(e.target.value))}
                    className="w-24"
                  />
                  <Button onClick={addPlatform}>Añadir</Button>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Nota:</strong> Los bonus se suman cuando se detectan estas plataformas en la solicitud
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Simulador */}
        <TabsContent value="simulator">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Simulador de Configuración</span>
              </CardTitle>
              <CardDescription>
                Prueba cómo funcionaría el scoring con tu configuración actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={runSimulation} className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                Ejecutar Simulación de Prueba
              </Button>
              
              {simulationResult && (
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold">Resultado de Simulación</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {simulationResult.total_score}
                      </p>
                      <p className="text-sm text-gray-600">Score Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {simulationResult.classification}
                      </p>
                      <p className="text-sm text-gray-600">Clasificación</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm"><strong>Prioridad:</strong> {simulationResult.priority}</p>
                    <p className="text-sm"><strong>Explicación:</strong> {simulationResult.reasoning}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Funciones auxiliares
function getWeightDescription(key: string): string {
  const descriptions = {
    problem_identified: "Se otorga cuando se identifica claramente un problema",
    description_detailed: "Se otorga cuando hay una descripción detallada del objetivo",
    impact_defined: "Se otorga cuando se especifica quiénes se benefician",
    platforms_mentioned: "Se otorga cuando se mencionan plataformas específicas",
    stakeholders_identified: "Se otorga cuando se identifican usuarios específicos"
  }
  return descriptions[key as keyof typeof descriptions] || ""
}

function getThresholdColor(key: string): "default" | "secondary" | "destructive" | "outline" {
  if (key.includes('p1')) return 'destructive'
  if (key.includes('p2')) return 'default'
  if (key.includes('project')) return 'secondary'
  return 'outline'
}

function getThresholdLabel(key: string): string {
  const labels = {
    project_min_score: "Proyecto vs Requerimiento",
    priority_p1_min: "Prioridad Crítica",
    priority_p2_min: "Prioridad Alta", 
    priority_p3_min: "Prioridad Media"
  }
  return labels[key as keyof typeof labels] || key
}
