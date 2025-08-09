"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  MessageCircle, 
  FileText, 
  HelpCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Video,
  BookOpen
} from "lucide-react"
import { UTPHeader } from "@/components/ui/utp-logo"

export default function HelpView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)
  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
    priority: "media"
  })

  const faqData = [
    {
      id: "como-solicitar",
      question: "¿Cómo puedo crear una nueva solicitud de innovación?",
      answer: "Para crear una nueva solicitud, ve a la pestaña 'Mi Espacio / Nueva Solicitud' y haz clic en 'Iniciar Nueva Solicitud'. Nuestro asistente de IA te guiará paso a paso para recopilar toda la información necesaria sobre tu proyecto o requerimiento.",
      category: "Básico",
      tags: ["solicitud", "nuevo", "proceso"]
    },
    {
      id: "informacion-necesaria",
      question: "¿Qué información necesito proporcionar en mi solicitud?",
      answer: "Necesitarás describir: el problema que quieres resolver, los objetivos esperados, los beneficiarios, las plataformas involucradas, y cualquier contexto adicional. El asistente te hará preguntas específicas para obtener todos los detalles necesarios.",
      category: "Básico", 
      tags: ["información", "requisitos", "datos"]
    },
    {
      id: "tiempo-respuesta",
      question: "¿Cuánto tiempo toma obtener una respuesta?",
      answer: "El tiempo de respuesta varía según la complejidad de tu solicitud:\n\n• Consultas simples: 1-2 días hábiles\n• Proyectos medianos: 3-5 días hábiles\n• Proyectos complejos: 1-2 semanas\n\nRecibirás notificaciones sobre el progreso de tu solicitud.",
      category: "Proceso",
      tags: ["tiempo", "respuesta", "plazos"]
    },
    {
      id: "seguimiento-solicitud",
      question: "¿Cómo puedo hacer seguimiento a mi solicitud?",
      answer: "Puedes ver el estado de todas tus solicitudes en la pestaña 'Mis Solicitudes'. Cada solicitud muestra su estado actual, fecha de creación y última actualización. También recibirás notificaciones por email cuando haya cambios.",
      category: "Seguimiento",
      tags: ["seguimiento", "estado", "progreso"]
    },
    {
      id: "tipos-solicitud",
      question: "¿Qué tipos de solicitudes puedo hacer?",
      answer: "Puedes solicitar:\n\n• Desarrollo de nuevos sistemas\n• Automatización de procesos\n• Integración de sistemas\n• Reportes y dashboards\n• Mejoras a sistemas existentes\n• Consultas técnicas\n• Capacitación en tecnologías",
      category: "Tipos",
      tags: ["tipos", "categorías", "desarrollo"]
    },
    {
      id: "modificar-solicitud",
      question: "¿Puedo modificar mi solicitud después de enviarla?",
      answer: "Una vez enviada, no puedes modificar directamente la solicitud. Sin embargo, puedes contactar al equipo GTTD a través del formulario de soporte o crear una nueva solicitud con las modificaciones necesarias.",
      category: "Proceso",
      tags: ["modificar", "cambios", "editar"]
    },
    {
      id: "urgente-solicitud",
      question: "¿Cómo marco una solicitud como urgente?",
      answer: "Durante la conversación con el asistente, menciona claramente la urgencia y las razones. El sistema automáticamente clasificará la prioridad basado en factores como fechas límite, impacto en el negocio y beneficiarios afectados.",
      category: "Prioridad",
      tags: ["urgente", "prioridad", "clasificación"]
    },
    {
      id: "notificaciones",
      question: "¿Cómo configuro las notificaciones?",
      answer: "Ve a 'Configuración' para personalizar tus preferencias de notificaciones. Puedes elegir recibir actualizaciones por email, configurar horarios de notificación y seleccionar qué eventos deseas que te notifiquen.",
      category: "Configuración",
      tags: ["notificaciones", "configuración", "email"]
    }
  ]

  const tips = [
    {
      title: "Sé específico en tu descripción",
      description: "Proporciona detalles claros sobre el problema y la solución esperada. Esto ayuda a evaluar mejor tu solicitud.",
      icon: Lightbulb
    },
    {
      title: "Incluye contexto de negocio",
      description: "Explica cómo tu solicitud beneficiará a la organización o mejorará procesos existentes.",
      icon: AlertCircle
    },
    {
      title: "Menciona fechas importantes",
      description: "Si hay fechas límite o eventos específicos, compártelos para una mejor priorización.",
      icon: Clock
    },
    {
      title: "Usa ejemplos concretos",
      description: "Si es posible, proporciona ejemplos de sistemas similares o referencias que tengas en mente.",
      icon: CheckCircle
    }
  ]

  const filteredFAQs = faqData.filter(
    faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSupportSubmit = () => {
    // Aquí se enviaría el formulario de soporte
    console.log("Formulario de soporte enviado:", supportForm)
    alert("Tu consulta ha sido enviada. Te responderemos pronto por email.")
    setSupportForm({ subject: "", message: "", priority: "media" })
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header UTP */}
        <UTPHeader 
          title="Centro de Ayuda" 
          subtitle="Encuentra respuestas a preguntas frecuentes, consejos para crear mejores solicitudes y contacta con nuestro equipo de soporte."
          size="lg"
        />

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              Consejos para crear solicitudes efectivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <tip.icon className="w-5 h-5 mt-0.5 text-utp-blue dark:text-utp-red flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Preguntas Frecuentes
            </CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar en preguntas frecuentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <Collapsible 
                  key={faq.id}
                  open={openFAQ === faq.id}
                  onOpenChange={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between text-left p-4 h-auto hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{faq.question}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {faq.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {faq.tags.slice(0, 2).join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                      {openFAQ === faq.id ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mt-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron resultados</h3>
                <p className="text-gray-500">
                  Intenta con otros términos de búsqueda o contacta con nuestro equipo de soporte.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Video className="w-8 h-8 text-utp-blue dark:text-utp-red mx-auto mb-3" />
              <h3 className="font-medium mb-2">Videos Tutoriales</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Aprende a usar el portal paso a paso
              </p>
              <Button variant="outline" size="sm" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-utp-blue dark:text-utp-red mx-auto mb-3" />
              <h3 className="font-medium mb-2">Guías Detalladas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Documentación completa del portal
              </p>
              <Button variant="outline" size="sm" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-utp-blue dark:text-utp-red mx-auto mb-3" />
              <h3 className="font-medium mb-2">Plantillas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ejemplos de solicitudes exitosas
              </p>
              <Button variant="outline" size="sm" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Support Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contactar Soporte
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No encontraste lo que buscabas? Contáctanos directamente.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Asunto</label>
                  <Input
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                    placeholder="Describe brevemente tu consulta"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Prioridad</label>
                  <select 
                    value={supportForm.priority}
                    onChange={(e) => setSupportForm({...supportForm, priority: e.target.value})}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-background"
                  >
                    <option value="baja">Baja - Consulta general</option>
                    <option value="media">Media - Necesito ayuda</option>
                    <option value="alta">Alta - Problema urgente</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Mensaje</label>
                  <Textarea
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                    placeholder="Describe tu consulta o problema en detalle..."
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleSupportSubmit}
                  disabled={!supportForm.subject.trim() || !supportForm.message.trim()}
                  className="w-full bg-utp-blue hover:bg-utp-blue-dark dark:bg-utp-red dark:hover:bg-utp-red-dark"
                >
                  Enviar Consulta
                </Button>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Información de Contacto
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> gttd@utp.edu.pe</p>
                    <p><strong>Teléfono:</strong> +51 1 315-9600 ext. 1234</p>
                    <p><strong>Horario:</strong> Lun-Vie 8:00-18:00</p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Tiempo de Respuesta
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>• <strong>Consultas simples:</strong> 24 horas</p>
                    <p>• <strong>Problemas técnicos:</strong> 48 horas</p>
                    <p>• <strong>Urgentes:</strong> 4 horas</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
