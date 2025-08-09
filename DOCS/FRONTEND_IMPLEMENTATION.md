Título: Implementación Frontend (Chat UX con Resumen Provisional, Aclaraciones y Cierre)

Resumen
Este documento detalla los cambios en el frontend para soportar:
- Conversación 100% en el chat
- Resumen provisional en una “burbuja rica” solo en stage=summary_preview
- Modo de aclaración (summary_refine) que oculta el resumen y hace preguntas focalizadas
- Confirmación explícita y generación de PDF (modal) y cierre
- Consistencia con backend y n8n

1. Estados y contrato con backend
- session.stage:
  - discovery
  - summary_preview
  - summary_refine
  - completed
- Estructura esperada del payload (resumen):
  {
    "agent": "summary_agent",
    "status": "ok",
    "session": { "session_id": "uuid", "stage": "summary_preview", "completeness": 100, "should_continue": true },
    "message": "…",
    "ui": {
      "rich_summary": {
        "title": "…",
        "chips": [{ "label": "Proyecto", "variant": "success" }, …],
        "score": 92,
        "sections": [{ "title": "Problema", "content": "…" }, …],
        "actions": [
          { "id": "clarify", "label": "Aclarar un punto" },
          { "id": "validate_and_finish", "label": "Validar y finalizar" }
        ]
      }
    }
  }
- En summary_refine:
  {
    "session": { "stage": "summary_refine" },
    "ui": { "directives": { "hide_summary": true }, "actions": [{ "id": "back_to_summary", "label": "Volver a ver resumen" }] }
  }
- En completed:
  {
    "session": { "stage": "completed" },
    "ui": { "pdf": { "available": true, "url": "https://…" } }
  }

2. Componentes nuevos/reusados
- MessageBubbleAgentSummary
  - Props: summary: { title, chips[], score, sections[], actions[] }
  - Render: Card + Badge + Grid + Buttons
  - Acciones:
    - clarify → onClarify()
    - validate_and_finish → onValidateAndFinish()
  - Visibilidad: solo si stage === "summary_preview" y ui.rich_summary existe
- PdfViewerDialog
  - Props: url, open, onClose
  - Implementación: Shadcn Dialog + iframe/object con width:80vw; height:80vh
- MessageBubbleStatus
  - Para estados de “Generando PDF…”, “Enviando informe…”, “Enviado”

3. Lógica de interacción
- Aclarar un punto:
  - El usuario puede:
    - pulsar el botón “Aclarar un punto”
    - o escribir directamente “falta X / no estoy de acuerdo”
  - En ambos casos front envía al webhook:
    POST /webhook
    { message: userText (si hay), context: { intent: "clarify" }, session_id }
  - Esperar respuesta con stage=summary_refine; ocultar resumen; mostrar preguntas del agente y seguir la conversación.
- Volver a ver resumen:
  - Botón opcional “Volver a ver resumen”
  - Envía intent:"show_summary" → servidor devuelve último ui.rich_summary y stage=summary_preview
- Validar y finalizar:
  - POST /api/reports/generate con audience:"both" y el último resumen consolidado
  - Al recibir user_pdf_url: abrir PdfViewerDialog
  - Mostrar mensaje final y cerrar sesión localmente (stage=completed)

4. Integraciones API
- /webhook
  - Entrada: { session_id, message, context? }
  - Salida: envelope con session.stage y ui
- /api/reports/generate
  - Entrada: { session_id, summary, audience, template_id? }
  - Salida: { success, user_pdf_url?, leader_pdf_url?, report_id }

5. Manejo de errores
- Si status="error" → Toast con mensaje de reintento
- Si /api/reports/generate falla → reintentar y mostrar feedback amigable
- Context loss: si session_id no existe, solicitar reintentar o iniciar sesión nueva

6. Estándares de UI/UX
- No modales de edición. Todo texto de usuario es un mensaje en el chat
- Botones inline discretos en la burbuja del resumen
- Mantener consistencia con Shadcn (Button, Card, Badge, Dialog)
- Accesibilidad: enfocar el Dialog al abrir; tecla Esc para cerrar; role adecuado

7. Checklist Front
- [ ] Crear MessageBubbleAgentSummary
- [ ] Crear PdfViewerDialog
- [ ] Ajustar chat-interface para estados summary_preview/refine/completed
- [ ] Handlers: onClarify, onValidateAndFinish, onBackToSummary
- [ ] Conectar con /webhook y /api/reports/generate
- [ ] Toasts/estados
- [ ] Pruebas: casos de aclaración, confirmación y error
