"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Save, Wand2, Info } from 'lucide-react'

interface ScoringConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: (cfg: any) => void
}

const SCORING_FORMULA = "Score Total = ROUND((Score Base + Bonus Plataformas + Bonus Plazo) * Multiplicador Departamento)";

const SCORING_EXPLANATION = `El sistema de scoring calcula una puntuación de 0 a 100 para priorizar solicitudes. Se basa en la siguiente fórmula:

1.  **Score Base (0-60 pts):** Evalúa la calidad de la información proporcionada.
    *   **Problema Identificado:** +15 si el problema está bien descrito.
    *   **Descripción Detallada:** +15 si el objetivo es claro y detallado.
    *   **Impacto Definido:** +10 si se especifican los beneficiarios.
    *   **Plataformas Mencionadas:** +10 si se listan las plataformas afectadas.
    *   **Stakeholders Identificados:** +10 si los beneficiarios son específicos (ej. 'profesores', 'estudiantes').

2.  **Bonus Plataformas (variable):** Suma puntos por cada plataforma tecnológica clave involucrada (ej. SAP: +15, Canvas: +10). Se añade un bonus de +5 si se menciona más de una.

3.  **Bonus Plazo (5-25 pts):** Otorga puntos según la urgencia declarada.
    *   **Menos de 1 mes:** +25 puntos.
    *   **1 a 3 meses:** +15 puntos.
    *   **3 a 6 meses:** +10 puntos.
    *   **Sin definir:** +5 puntos.

4.  **Multiplicador por Departamento (0.9x - 1.4x):** Ajusta el score final según el peso estratégico del departamento solicitante (ej. Académico: 1.2x, GTTD: 1.4x).

El **Score Total** se usa para clasificar la solicitud como 'Proyecto' o 'Requerimiento' y asignarle una prioridad (P1 a P4).`;


export function ScoringConfigModal({ isOpen, onClose, onSaved }: ScoringConfigModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<any>({})

  const fetchConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      // Simula la carga de la configuración que se puede editar (pesos, umbrales)
      // En una implementación real, esto vendría de /api/scoring-config
      const result = await fetch('/api/scoring-config');
      if (!result.ok) throw new Error('No se pudo cargar la configuración del scoring.');
      const json = await result.json();
      setConfig(json.data || {});

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    try {
      setLoading(true)
      setError(null)
      const resp = await fetch('/api/scoring-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, updated_by: 'leader' })
      })
      if (!resp.ok) throw new Error('No se pudo guardar la configuración')
      const json = await resp.json()
      onSaved?.(json?.data)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) fetchConfig()
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Configuración y Auditoría del Sistema de Scoring</DialogTitle>
          <DialogDescription>
            Visualiza cómo funciona el algoritmo de scoring y ajusta los pesos y umbrales.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded border border-red-200 bg-red-50 text-red-700">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda: Explicación del Algoritmo */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Info className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Fórmula del Scoring</h3>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <code className="font-mono text-sm text-blue-800">{SCORING_FORMULA}</code>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-700 mb-2">
                  <Wand2 className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">¿Cómo Funciona?</h3>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {SCORING_EXPLANATION}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Configuración JSON */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Parámetros Configurables</span>
                  <Badge variant="secondary">JSON</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Modifica los pesos, bonus y umbrales. Los cambios se aplicarán a las nuevas solicitudes.
                </p>
                <Textarea
                  className="font-mono text-sm h-96"
                  value={JSON.stringify(config, null, 2)}
                  onChange={(e) => {
                    try {
                      const obj = JSON.parse(e.target.value);
                      setConfig(obj);
                    } catch {
                      // Ignorar hasta que el JSON sea válido
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={saveConfig} disabled={loading}>
            {loading ? 'Guardando...' : (<span className="flex items-center gap-2"><Save className="h-4 w-4"/> Guardar</span>)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
