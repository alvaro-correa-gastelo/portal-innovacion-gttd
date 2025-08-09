Título: Backend Next.js – /api/reports/generate y Contratos Conversacionales

Resumen
Este documento detalla la implementación del backend en Next.js para:
- Generar PDFs a partir de plantillas HTML almacenadas en report_templates (BD).
- Mantener el contrato conversacional con el front y n8n (envelope uniforme).
- Persistir metadatos (report_id, URLs) en session_states y/o report_logs.
- Enviar el informe del líder backend-to-backend (SMTP/Teams/Slack o delegar a n8n).

1) Endpoints

A) POST /api/reports/generate
Objetivo: Generar PDF(s) desde plantillas HTML (user_report y/o leader_report) con datos del summary final y perfil del usuario.

Body esperado:
{
  "session_id": "uuid",
  "summary": { ...objeto final consolidado... },
  "audience": "user" | "leader" | "both",
  "template_id": "opcional (forzar template específico)"
}

Flujo interno:
1. Validar entradas: session_id, audience, summary.
2. Cargar datos complementarios:
   - Perfil del usuario (si aplica).
   - Estado de sesión (session_states) para request_id/otros datos.
3. Resolver plantilla(s):
   - Si template_id viene: SELECT * FROM report_templates WHERE id = $1 AND is_active = true.
   - Si NO viene:
     - audience="user" → SELECT por type='user_report' AND is_active = true LIMIT 1.
     - audience="leader" → type='leader_report'.
     - audience="both" → ambas.
4. Mapeo de placeholders por tipo:
   - user_report: title, user_name, department, date, description, solution, benefits, next_steps.
   - leader_report: title, request_id, date, priority, effort, roi, impact_analysis, classification, classification_reason, resources, risks, recommendation.
5. Render de HTML:
   - Preferible usar Mustache/Handlebars, o sustitución simple {{placeholder}}.
   - Combinar template_html + css_styles (si css_styles no es null).
6. Generación de PDF:
   - Puppeteer: launch headless, page.setContent(html, { waitUntil: 'networkidle0' }), page.pdf({ format: 'A4', printBackground: true }).
7. Almacenamiento:
   - Desarrollo: guardar en filesystem (p. ej. /public/reports/{report_id}.pdf).
   - Producción: S3/Supabase Storage y obtener URL pública o firmada.
8. Persistencia:
   - Actualizar session_states.conversation_data.report con { report_id, user_pdf_url?, leader_pdf_url? }.
   - Opcional: insertar en report_logs (si implementado).
9. Envío al líder (si audience incluye 'leader'):
   - SMTP/Teams/Slack (lib local) o HTTP Request a n8n para gestionar el envío.
10. Respuesta:
{
  "success": true,
  "report_id": "uuid",
  "user_pdf_url": "https://...",
  "leader_pdf_url": "https://..." // NO retornar al cliente final si la llamada proviene del front del solicitante
}

Notas de seguridad:
- Si el endpoint es consumido directamente por el front del solicitante, NO incluir leader_pdf_url en la respuesta. Reservar esa URL para comunicaciones backend-to-backend y BD.

B) Webhook de conversación (si Next actúa como pasarela)
- Entrada: { session_id, message, context }
- Reenvía a n8n (webhook del workflow) y retorna el envelope del agente (con stage y ui).
- Manejar timeouts y errores adecuadamente.

2) Mapeo de datos y utilidades

Fuentes:
- summary final del agente (n8n).
- perfil del usuario (user_name, department).
- session_id como request_id (o un correlativo si existe).
- reglas heurísticas (deriveEffortROI, buildImpactAnalysis) para leader_report.

Placeholders y sugerencias de derivación:
- title: summary.title o nombre tentativo del proyecto.
- date: formatear en es-PE (DD/MM/YYYY).
- description: problema + contexto del summary.
- solution: objetivo + recomendación sintetizada.
- benefits: beneficios/impacto resumido.
- next_steps: pasos inmediatos (agenda, validaciones, contacto).
- priority: summary.priority (P1/P2/P3).
- effort: heurística según clasificación/tipo (p. ej., proyecto “40–120h”, requerimiento “<40h”).
- roi: regla simple por impacto/frecuencia (Alto/Medio/Bajo).
- impact_analysis: texto compuesto de beneficiarios, frecuencia, urgencia, plataformas.
- classification y classification_reason: desde summary y re-cálculo con /api/analysis/simple-calculate si lo usas.
- resources: equipos y plataformas relevantes.
- risks: riesgos y dependencias.
- recommendation: recomendación ejecutiva (p. ej., “priorizar P1 y planificar discovery técnico”).

Helpers recomendados:
- formatDateES(date: Date): string
- escapeHtml(value: string): string (si usas sustitución simple)
- buildImpactAnalysis(summary): string
- deriveEffortROI(summary): { effort: string, roi: string }

3) Seguridad

- Sanitizar valores inyectados en HTML (si no usas motor de plantillas que proteja).
- No exponer leader_pdf_url a clientes no autorizados.
- Verificar session_id y permisos.
- Limitar tamaño de summary en el body.
- Manejar Puppeteer con timeouts, maxConcurrent y cierre correcto del browser.

4) Persistencia

A) session_states
- conversation_data.report:
  {
    "report_id": "uuid",
    "user_pdf_url": "https://...",
    "leader_pdf_url": "https://..."
  }
- current_stage → 'completed' tras finalizar.
- status → 'inactive' si cierras sesión.

B) report_logs (opcional)
- Estructura sugerida:
  - id (uuid), session_id (uuid)
  - template_user_id, template_leader_id (uuid)
  - user_pdf_url, leader_pdf_url (text)
  - sent_to (text[]), channel (text)
  - created_at (timestamptz)
- Útil para auditoría sin inflar session_states.

5) Envío a líder

Opciones:
- Directo desde Next: SMTP (nodemailer), Teams/Slack webhook/API.
- Delegado a n8n: HTTP POST a un workflow con payload { leader_pdf_url, metadata, recipients }.

Recomendación:
- Delegar a n8n si ya centralizas envíos/automatizaciones ahí. Mantiene el backend de Next más simple y reutiliza tu orquestación.

6) Manejo de errores y reintentos

- Generación PDF fallida:
  - Responder { success:false, error:"PDF_GENERATION_FAILED" } y loggear.
  - n8n/front: mostrar mensaje y permitir reintentar.
- Falla de almacenamiento:
  - Retentar upload; si persiste, abortar con error específico.
- Falla de envío al líder:
  - Generar PDFs y persistir igual; marcar envío pendiente y reintentar asíncronamente (job/queue o workflow en n8n).

7) Pruebas

Unitarias:
- Sustitución de placeholders (incluyendo caracteres especiales).
- Formateo de fechas.
- Derivación de effort/roi.

Integración:
- Generación de user_report y leader_report con tus 2 plantillas de BD.
- Almacenamiento en storage y persistencia en BD.
- Llamada audience:"both" con envío backend-to-backend.

E2E:
- Desde front: “Validar y finalizar” → PDF user en modal, estado completed en sesión.

8) Checklist Backend
- [ ] Implementar POST /api/reports/generate con Puppeteer.
- [ ] Integrar lectura de plantillas desde report_templates.
- [ ] Mapear placeholders para user_report y leader_report.
- [ ] Subir PDFs a storage y retornar URL(s).
- [ ] Persistir en session_states.conversation_data.report y/o report_logs.
- [ ] Implementar envío a líder (local o vía n8n).
- [ ] Asegurar no exponer leader_pdf_url a cliente final.
- [ ] Pruebas unitarias/integración/E2E.
