"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Download, 
  Eye, 
  User, 
  Crown, 
  Printer,
  Share2,
  Mail
} from "lucide-react"

interface ReportData {
  session_id: string
  user_name: string
  department: string
  title: string
  description: string
  priority: string
  effort: string
  classification: string
  impact_analysis: string
  resources: string
  risks: string
  recommendation: string
  created_at: string
}

interface ReportGeneratorProps {
  reportData: ReportData
  onClose?: () => void
}

export function ReportGenerator({ reportData, onClose }: ReportGeneratorProps) {
  const [selectedReport, setSelectedReport] = useState<'user' | 'leader'>('user')
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const generatePDF = async (reportType: 'user' | 'leader') => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: reportData.session_id,
          report_type: reportType,
          data: reportData
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-${reportType}-${reportData.session_id}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const sendReport = async (reportType: 'user' | 'leader') => {
    try {
      await fetch('/api/reports/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: reportData.session_id,
          report_type: reportType,
          recipient: reportType === 'user' ? reportData.user_name : 'GTTD Leadership'
        })
      })
    } catch (error) {
      console.error('Error sending report:', error)
    }
  }

  const UserReportPreview = () => (
    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
      <div className="text-center bg-blue-600 text-white p-4 rounded">
        <h2 className="text-xl font-bold">Reporte de Solicitud</h2>
        <p>{reportData.user_name} - {reportData.department}</p>
      </div>
      
      <div className="space-y-3">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="font-semibold">📋 Resumen de tu Solicitud</h3>
          <p className="text-sm text-gray-600">{reportData.description}</p>
        </div>
        
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="font-semibold">💡 Solución Propuesta</h3>
          <p className="text-sm text-gray-600">
            Basado en tu necesidad, recomendamos implementar una solución que optimice tus procesos actuales.
          </p>
        </div>
        
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="font-semibold">📈 Beneficios Esperados</h3>
          <p className="text-sm text-gray-600">
            Esta solución mejorará significativamente la eficiencia de tu área.
          </p>
        </div>
        
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="font-semibold">⏱️ Próximos Pasos</h3>
          <p className="text-sm text-gray-600">
            1. Revisión técnica por GTTD<br/>
            2. Aprobación de recursos<br/>
            3. Planificación de implementación
          </p>
        </div>
      </div>
    </div>
  )

  const LeaderReportPreview = () => (
    <div className="space-y-4 p-4 bg-red-50 rounded-lg">
      <div className="text-center bg-red-600 text-white p-4 rounded">
        <h2 className="text-xl font-bold">Análisis Ejecutivo GTTD</h2>
        <p>{reportData.session_id} - {new Date(reportData.created_at).toLocaleDateString()}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 my-4">
        <div className="text-center p-3 bg-gray-100 rounded">
          <h4 className="font-semibold">Prioridad</h4>
          <Badge className={
            reportData.priority === 'high' ? 'bg-red-100 text-red-800' :
            reportData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }>
            {reportData.priority.toUpperCase()}
          </Badge>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded">
          <h4 className="font-semibold">Esfuerzo</h4>
          <p className="font-bold">{reportData.effort.toUpperCase()}</p>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded">
          <h4 className="font-semibold">ROI</h4>
          <p className="font-bold">ALTO</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="border-l-4 border-red-500 pl-4">
          <h3 className="font-semibold">🎯 Análisis de Impacto</h3>
          <p className="text-sm text-gray-600">{reportData.impact_analysis}</p>
        </div>
        
        <div className="border-l-4 border-red-500 pl-4">
          <h3 className="font-semibold">📊 Clasificación</h3>
          <p className="text-sm text-gray-600">
            <strong>Tipo:</strong> {reportData.classification}<br/>
            <strong>Justificación:</strong> Basado en complejidad y recursos requeridos
          </p>
        </div>
        
        <div className="border-l-4 border-red-500 pl-4">
          <h3 className="font-semibold">💰 Recursos Necesarios</h3>
          <p className="text-sm text-gray-600">{reportData.resources}</p>
        </div>
        
        <div className="border-l-4 border-red-500 pl-4">
          <h3 className="font-semibold">⚠️ Riesgos y Dependencias</h3>
          <p className="text-sm text-gray-600">{reportData.risks}</p>
        </div>
        
        <div className="border-l-4 border-red-500 pl-4">
          <h3 className="font-semibold">✅ Recomendación</h3>
          <p className="text-sm text-gray-600">{reportData.recommendation}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Generador de Reportes
            </h1>
            <p className="text-muted-foreground">
              Genera reportes diferenciados para usuario y liderazgo
            </p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          )}
        </div>

        {/* Report Type Selector */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${
              selectedReport === 'user' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedReport('user')}
          >
            <CardContent className="p-4 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold">Reporte Usuario</h3>
              <p className="text-sm text-muted-foreground">
                Enfocado en la solución y beneficios
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              selectedReport === 'leader' ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            onClick={() => setSelectedReport('leader')}
          >
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <h3 className="font-semibold">Reporte Ejecutivo</h3>
              <p className="text-sm text-muted-foreground">
                Análisis estratégico y toma de decisiones
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Actions */}
        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            <TabsTrigger value="actions">Acciones</TabsTrigger>
          </TabsList>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Vista Previa - {selectedReport === 'user' ? 'Reporte Usuario' : 'Reporte Ejecutivo'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedReport === 'user' ? <UserReportPreview /> : <LeaderReportPreview />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Download className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold mb-2">Descargar PDF</h3>
                  <Button 
                    onClick={() => generatePDF(selectedReport)}
                    disabled={isGenerating}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isGenerating ? 'Generando...' : 'Descargar'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold mb-2">Enviar por Email</h3>
                  <Button 
                    onClick={() => sendReport(selectedReport)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Enviar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Share2 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold mb-2">Compartir</h3>
                  <Button 
                    variant="outline"
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    Obtener Link
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Report Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Reporte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold">Sesión ID</p>
                <p className="text-muted-foreground">{reportData.session_id}</p>
              </div>
              <div>
                <p className="font-semibold">Usuario</p>
                <p className="text-muted-foreground">{reportData.user_name}</p>
              </div>
              <div>
                <p className="font-semibold">Departamento</p>
                <p className="text-muted-foreground">{reportData.department}</p>
              </div>
              <div>
                <p className="font-semibold">Fecha</p>
                <p className="text-muted-foreground">
                  {new Date(reportData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
