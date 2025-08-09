Título: n8n – Flujo Conversacional con Summary Preview, Refine y Cierre

Resumen
Este documento define la orquestación en n8n para un flujo conversacional que:
- Recolecta información (discovery).
- Propone un resumen provisional (summary_preview).
- Entra en un bucle de aclaraciones (summary_refine) ocultando el resumen mientras se valida.
- Finaliza con confirmación explícita y generación/envío de PDFs (completed).
- Mantiene un contrato de respuesta uniforme para el frontend.

1) Estructura general del workflow
Nodos principales (orden lógico):
1. Webhook (entrada)
2. Get User Profile (HTTP Request, opcional si Next lo provee)
3. DB: Get/Create Session (SELECT/INSERT en session_states)
4. DB: Get Conversation History (SELECT conversation_messages)
5. Intent Router (Switch/IF)
   - Detecta context.intent y texto del usuario (“aclarar”, “no estoy de acuerdo”, “falta”, “no es así”)
6. Merge Hints (Code)
   - Une edited_fields_hints con historial/contexto
7. Discovery Agent (LLM) (si completeness < threshold)
8. Summary Agent (LLM) – dos modos:
   - preview: construir ui.rich_summary + acciones
   - refine: NO mostrar resumen, devolver 1-2 preguntas concretas
9. Recalcular Score/Prioridad (HTTP Request → /api/analysis/simple-calculate)
10. DB: Update Session State (stage, completeness_score, next_agent)
11. DB: Save Conversation Message(s) (INSERT user/assistant)
12. Report Sender (HTTP Request → Next /api/reports/generate)
13. DB: Persist Report URLs (UPDATE session_states.conversation_data)
14. Respond (formatear envelope unificado para el front)

2) Estados de la sesión y transiciones
- discovery: recabar datos; si completeness>=threshold → summary_preview
- summary_preview: mostrar resumen provisional con acciones
  - clarify → summary_refine
  - validate_and_finish → completed
- summary_refine: hacer preguntas focalizadas; ocultar resumen
  - cuando hay conformidad → summary_preview actualizado
- completed: generación de PDFs, envío a líder, sesión inactiva

Transiciones:
- discovery → summary_preview (si completeness≥75)
- summary_preview → summary_refine (si intent clarify o texto de disconformidad)
- summary_refine → summary_preview (cuando se cubren aclaraciones)
- summary_preview → completed (validación y cierre)

3) Contrato de respuesta (envelope) hacia el frontend
Siempre responder con:
{
  "agent": "discovery_agent" | "summary_agent" | "report_sender",
  "status": "ok" | "done" | "error",
  "session": {
    "session_id": "uuid",
    "stage": "discovery" | "summary_preview" | "summary_refine" | "completed",
    "completeness": 0-100,
    "should_continue": boolean
  },
  "message": "texto amigable al usuario",
  "ui": {
    "rich_summary"?: {
      "title": string,
      "chips": [{ "label": string, "variant": "success|secondary|destructive" }],
      "score": number,
      "sections": [{ "title": string, "content": string }],
      "actions": [
        { "id": "clarify", "label": "Aclarar un punto" },
        { "id": "validate_and_finish", "label": "Validar y finalizar" }
      ]
    },
    "directives"?: { "hide_summary": true },
    "pdf"?: { "available": boolean, "url"?: string }
  }
}

Notas:
- En summary_refine NO incluir ui.rich_summary y usar ui.directives.hide_summary = true.
- En completed incluir ui.pdf.available=true y opcionalmente un url del PDF del usuario si se devuelve al front (el del líder no se expone).

4) Configuración de nodos clave

4.1 Webhook (entrada)
- Método: POST
- Espera body:
  {
    "session_id"?: "uuid",
    "message": "texto del usuario o acción",
    "context"?: {
      "intent"?: "clarify" | "validate_and_finish" | "show_summary",
      "edited_fields_hints"?: "texto de ajustes/aclaraciones"
    },
    "user"?: { "auth_token"?: "..." }
  }

4.2 Intent Router (Switch/IF)
Criterios:
- Si context.intent == "clarify" o message contiene “aclarar”, “no estoy de acuerdo”, “falta”, “no es así” → ruta summary_refine.
- Si context.intent == "validate_and_finish" → ruta cierre (report_sender).
- Si completeness<75 → discovery.
- Si completeness≥75 y sin intent clarify → summary_preview.

4.3 Merge Hints (Code)
Función:
- Recibir edited_fields_hints y agregarlo al contexto del prompt del Summary Agent.
- Sanear y recortar longitud si es necesario.
- Preparar objeto consolidatedHints para el LLM.

4.4 Discovery Agent (LLM)
- Objetivo: completar campos base (problema, objetivo, plataformas, beneficiarios, frecuencia, urgencia, departamento).
- Actualizar completeness_score.
- “Salida”: si threshold alcanzado → bandera propose_summary=true.

4.5 Summary Agent (LLM)
Dos prompts/estilos:
- preview:
  - Generar resumen compacto y claro.
  - Incluir clasificación, prioridad, score.
  - Devolver ui.rich_summary y acciones clarify/validate_and_finish.
- refine:
  - NO devolver resumen; formular 1-2 preguntas específicas para cerrar brechas detectadas (usando consolidatedHints + historial).
  - Establecer ui.directives.hide_summary=true.
- Tras cada vuelta, recalcular score/prioridad con API /api/analysis/simple-calculate.

4.6 Recalcular Score/Prioridad
- HTTP Request a /api/analysis/simple-calculate con el objeto actual.
- Actualizar campos en la data del Summary Agent.

4.7 Update Session State
- current_stage: discovery | summary_preview | summary_refine | completed
- completeness_score: 0–100
- next_agent: “summary_agent” | “report_sender” | null
- conversation_data: opcional cache del último resumen (para “show_summary”)

4.8 Report Sender
- Por intent validate_and_finish o acción explícita:
  - HTTP Request → Next /api/reports/generate con:
    {
      session_id,
      summary: { ...final... },
      audience: "both" // user + leader
    }
  - Espera respuesta con report_id, user_pdf_url (NO retornar leader_pdf_url al front).
  - Persistir en session_states.conversation_data.report = { report_id, user_pdf_url, leader_pdf_url }.

4.9 Respond (salida)
- Formatear el envelope según el estado.
- En completed:
  - message: confirmación de envío al líder + link del PDF del usuario.
  - ui.pdf.available=true; url=user_pdf_url (si se decide exponerlo de inmediato).

5) Persistencia (DB)
5.1 session_states
- current_stage TEXT
- completeness_score INT
- status 'active'|'inactive'
- conversation_data JSONB:
  {
    "report": {
      "report_id": "uuid",
      "user_pdf_url": "https://...",
      "leader_pdf_url": "https://..."
    },
    "last_summary": { ... }
  }

5.2 conversation_messages
- INSERT por cada intercambio:
  - session_id, role ('user'|'assistant'), agent_name, message, payload (resumen u otras estructuras), stage, created_at

6) Manejo de errores
- Si falla perfil/DB:
  - Responder status="error" y message amigable (“Tuvimos un inconveniente, intenta nuevamente.”).
- Si falla /api/reports/generate:
  - Mensaje de error claro y permitir reintento.
- Validar que el workflow nunca devuelva contenido inconsistente (ej. summary_refine con ui.rich_summary).

7) Contención de bucles en refine
- Implementar contador de iteraciones (p.ej. en conversation_data: refine_rounds).
- Si refine_rounds > 5:
  - Sugerir “Volver a ver resumen” o “Validar y finalizar” con cautela.
- Detectar expresiones de conformidad (“de acuerdo”, “ok”, “listo”) para retornar a preview.

8) Checklist n8n
- [ ] Webhook: normalizar entrada y extraer session_id/message/context.
- [ ] DB: Get/Create Session + Get Conversation History.
- [ ] Switch/IF: routing por intent y stage.
- [ ] Code: Merge Hints (edited_fields_hints → prompt).
- [ ] LLM Discovery Agent (si completeness<threshold).
- [ ] LLM Summary Agent en modos refine/preview.
- [ ] HTTP: /api/analysis/simple-calculate para recalcular score/prioridad.
- [ ] DB: Update Session State (stage, completeness, next_agent, conversation_data.last_summary).
- [ ] DB: INSERT conversation_messages (user/assistant) con stage/agent_name/payload.
- [ ] Report Sender: HTTP → /api/reports/generate audience:"both"; persistir URLs.
- [ ] Respond: envelope uniforme para el front y manejo de errores.

9) Ejemplos de respuestas

9.1 summary_preview (mostrar resumen):
{
  "agent": "summary_agent",
  "status": "ok",
  "session": { "session_id": "abc", "stage": "summary_preview", "completeness": 88, "should_continue": true },
  "message": "Te propongo este resumen preliminar. Si falta algo, puedes aclararlo.",
  "ui": {
    "rich_summary": {
      "title": "Optimización de carga en Canvas",
      "chips": [
        { "label": "Proyecto", "variant": "success" },
        { "label": "P1", "variant": "destructive" },
        { "label": "Académico", "variant": "secondary" }
      ],
      "score": 92,
      "sections": [
        { "title": "Problema", "content": "Carga lenta de calificaciones" },
        { "title": "Objetivo", "content": "Acelerar y validar el proceso" },
        { "title": "Impacto", "content": "50 docentes, uso diario" }
      ],
      "actions": [
        { "id": "clarify", "label": "Aclarar un punto" },
        { "id": "validate_and_finish", "label": "Validar y finalizar" }
      ]
    }
  }
}

9.2 summary_refine (ocultar resumen y preguntar):
{
  "agent": "summary_agent",
  "status": "ok",
  "session": { "session_id": "abc", "stage": "summary_refine", "completeness": 82, "should_continue": true },
  "message": "Para precisar, ¿cuántos docentes exactamente se verán impactados y con qué frecuencia usan Canvas?",
  "ui": {
    "directives": { "hide_summary": true },
    "actions": [{ "id": "back_to_summary", "label": "Volver a ver resumen" }]
  }
}

9.3 completed (PDF generado y enviado):
{
  "agent": "report_sender",
  "status": "done",
  "session": { "session_id": "abc", "stage": "completed", "completeness": 100, "should_continue": false },
  "message": "Resumen validado. Generé tu PDF y envié el informe al líder.",
  "ui": {
    "pdf": { "available": true, "url": "https://…/user-report.pdf" }
  }
}

10) Buenas prácticas
- Mantener prompts claros y separados para refine vs preview.
- Recortar edited_fields_hints para evitar prompts sobredimensionados.
- Loggear transiciones de stage para auditoría.
- Controlar timeouts de HTTP Requests.
- Diseñar el workflow para ser idempotente ante reintentos del cliente.

Con este documento puedes implementar el flujo conversacional completo en n8n, alineado con el front y el backend, respetando los templates de BD y el comportamiento de aclaración/validación definido.
