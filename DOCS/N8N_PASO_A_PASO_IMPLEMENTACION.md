Título: n8n – Paso a Paso Exacto (Nodos, posiciones, configuraciones y flujo Mermaid)

Resumen
Este documento te guía exactamente sobre qué crear ahora en n8n con lo que ya tienes en el repo, qué nodos colocar, cómo conectarlos, qué parámetros usar y en qué orden. Incluye un diagrama Mermaid del flujo y valores de ejemplo para facilitar el armado.

Pre-requisitos (desde tu repo actual)
- Backend Next listo con:
  - POST /api/analysis/simple-calculate (app/api/analysis/simple-calculate/route.ts)
  - POST /api/reports/generate (app/api/reports/generate/route.ts)
- BD con tablas: session_states, conversation_messages y report_templates (IDs activos para user_report y leader_report).
- Prompts/parsers en el repo (summary-agent-*, discovery-agent-*) para guiar el LLM.

Objetivo del workflow
- Orquestar la conversación: discovery → summary_preview ↔ summary_refine → completed.
- Mantener contrato de respuesta uniforme para el frontend.
- Generar PDFs vía Next /api/reports/generate cuando el usuario valida.

Diagrama Mermaid (alto nivel)
```mermaid
flowchart TD
  A[Webhook: /insightbot] --> B[DB: Get/Create Session]
  B --> C[DB: Get Conversation History]
  C --> D[Intent Router]
  D -->|clarify| E[Summary Agent: refine]
  D -->|validate_and_finish| M[Report Sender]
  D -->|auto| F{Completeness >= 75?}
  F -->|No| G[Discovery Agent]
  G --> H[Update Session State]
  H --> I[DB: Save Messages]
  I --> J[Respond (discovery)]
  F -->|Sí| K[Summary Agent: preview]
  K --> L[Recalc Score (/api/analysis/simple-calculate)]
  L --> H
  E --> L
  M --> N[Persist Report URLs]
  N --> O[Update Stage: completed]
  O --> P[DB: Save Messages]
  P --> Q[Respond (completed)]
```

Secciones del workflow en n8n (paso a paso)

1) Nodo 1: Webhook (Trigger)
- Tipo: Webhook (nodes-base.webhook)
- Método: POST
- Path: insightbot (quedará /webhook/insightbot para pruebas manuales)
- Response: JSON
- Body esperado:
  {
    "session_id": "uuid (opcional en la primera interacción)",
    "message": "texto del usuario o acción",
    "context": {
      "intent": "clarify|validate_and_finish|show_summary (opcional)",
      "edited_fields_hints": "texto (opcional)"
    },
    "user": { "id": "...", "name": "...", "department": "..." }
  }

2) Nodo 2: DB – Get/Create Session
- Tipo: PostgreSQL (o MySQL según tu BD). Aquí asumiré Postgres.
- Operación: Execute Query
- Query ejemplo (Postgres):
  WITH s AS (
    SELECT id, current_stage, completeness_score, conversation_data
    FROM session_states
    WHERE (id = {{ $json.session_id || null }}) 
    LIMIT 1
  )
  SELECT COALESCE(
    (SELECT row_to_json(s) FROM s),
    (SELECT row_to_json(x) FROM (
      INSERT INTO session_states (current_stage, completeness_score, status, conversation_data)
      VALUES ('discovery', 0, 'active', '{}'::jsonb)
      RETURNING id, current_stage, completeness_score, conversation_data
    ) x)
  ) AS session;
- Salida: un JSON con session.id y estado actual.

3) Nodo 3: DB – Get Conversation History
- Tipo: PostgreSQL – Execute Query
- Query:
  SELECT role, agent_name, stage, message, payload, created_at
  FROM conversation_messages
  WHERE session_id = {{ $json.session.id }}
  ORDER BY created_at ASC;
- Nota: Guarda el resultado para enriquecer prompts.

4) Nodo 4: Intent Router (Switch)
- Tipo: Switch
- Property a evaluar:
  - Si existe context.intent explícito: {{$json.context.intent}}
  - Si no, usar función Code antes para derivar intent por keywords en message:
    - “aclarar”, “no estoy de acuerdo”, “falta”, “no es así” → clarify
    - “validar”, “finalizar” → validate_and_finish
    - default → auto
- Ramas:
  - clarify
  - validate_and_finish
  - auto

4.1) Rama clarify → Summary Agent (refine)
- Ir al Nodo 8 (Summary Agent refine).

4.2) Rama validate_and_finish → Report Sender
- Ir al Nodo 12 (Report Sender).

4.3) Rama auto → Check Completeness
- Ir al Nodo 5 (Check Completeness).

5) Nodo 5: Check Completeness (IF)
- Tipo: IF
- Condición: {{$json.session.completeness_score || 0}} >= 75
- Sí → Nodo 7 (Summary Agent preview)
- No → Nodo 6 (Discovery Agent)

6) Nodo 6: Discovery Agent (LLM)
- Tipo: OpenAI (u otro LLM) o Code + HTTP a tu proveedor.
- Prompt: Usa discovery-agent-system-prompt.md + user message + historial condensado (del nodo 3).
- Objetivo: Completar campos base y aumentar completeness_score.
- Output: 
  {
    discovery: { ...campos extraídos... },
    completeness_score: 0-100,
    message: "respuesta para usuario (tono amistoso)"
  }

7) Nodo 7: Summary Agent – modo preview (LLM)
- Tipo: OpenAI
- Prompt base: summary-agent-system-prompt.md
- Contexto:
  - Historial resumido (nodo 3)
  - Último discovery
  - Instrucciones para construir ui.rich_summary:
    - title, chips[{label,variant}], score, sections[{title,content}], actions[clarify, validate_and_finish]
- Output esperado:
  {
    summary: { title, chips, score, sections, classification, priority },
    ui: {
      rich_summary: { ...como en Frontend doc... }
    },
    completeness_score: number
  }

8) Nodo 8: Summary Agent – modo refine (LLM)
- Tipo: OpenAI
- Prompt base: summary-agent-system-prompt.md (variante refine)
- Contexto:
  - edited_fields_hints (si viene)
  - Historial y último summary (si guardaste en conversation_data)
- Regla: NO devolver ui.rich_summary; devolver 1-2 preguntas y:
  ui.directives.hide_summary = true
- Output esperado:
  {
    message: "preguntas focalizadas",
    completeness_score: number,
    ui: { directives: { hide_summary: true } }
  }

9) Nodo 9: HTTP Request – Recalcular Score/Prioridad
- Tipo: HTTP Request
- Método: POST
- URL: http://localhost:3000/api/analysis/simple-calculate
- Body JSON: el objeto summary actual (de Nodo 7 o hints resultantes de Nodo 8)
- Output: 
  {
    score: number,
    priority: "P1|P2|P3",
    classification: "Proyecto|Requerimiento|Idea",
    reasons: "texto"
  }
- Inyecta estos campos al objeto de salida para mostrar en chips/sections.

10) Nodo 10: DB – Update Session State
- Tipo: PostgreSQL – Execute Query
- Según rama:
  - Después de Nodo 6 (Discovery): stage='discovery'
  - Después de Nodo 7 (Summary preview): stage='summary_preview'
  - Después de Nodo 8 (Refine): stage='summary_refine'
- Query ejemplo:
  UPDATE session_states
  SET current_stage = {{ $json.next_stage }},
      completeness_score = {{ $json.completeness_score }},
      conversation_data = jsonb_set(
        COALESCE(conversation_data, '{}'::jsonb),
        '{last_summary}',
        to_jsonb({{ $json.summary || {} }})::jsonb,
        true
      ),
      updated_at = now()
  WHERE id = {{ $json.session.id }}
  RETURNING id, current_stage, completeness_score;

11) Nodo 11: DB – Save Conversation Messages
- Tipo: PostgreSQL – Execute Query (dos inserts)
- Insert USER:
  INSERT INTO conversation_messages (session_id, role, agent_name, stage, message, payload)
  VALUES (
    {{ $json.session.id }},
    'user',
    null,
    {{ $json.current_stage }},
    {{ $json.input_message }},
    null
  );
- Insert ASSISTANT:
  INSERT INTO conversation_messages (session_id, role, agent_name, stage, message, payload)
  VALUES (
    {{ $json.session.id }},
    'assistant',
    {{ $json.agent_name }}, -- 'discovery_agent' o 'summary_agent'
    {{ $json.current_stage }},
    {{ $json.message }},
    {{ $json.ui ? to_json($json.ui) : null }}
  );

12) Nodo 12: Report Sender – HTTP Request a Next
- Tipo: HTTP Request
- Método: POST
- URL: http://localhost:3000/api/reports/generate
- Body JSON:
  {
    "session_id": {{ $json.session.id }},
    "summary": {{ $json.summary_final }},
    "audience": "both"
  }
- Output:
  { success, report_id, user_pdf_url, leader_pdf_url }

13) Nodo 13: DB – Persist Report URLs
- Tipo: PostgreSQL – Execute Query
- Query:
  UPDATE session_states
  SET conversation_data = jsonb_set(
    COALESCE(conversation_data, '{}'::jsonb),
    '{report}',
    to_jsonb({
      "report_id": {{ $json.report_id }},
      "user_pdf_url": {{ $json.user_pdf_url }},
      "leader_pdf_url": {{ $json.leader_pdf_url }}
    })::jsonb,
    true
  ),
  updated_at = now()
  WHERE id = {{ $json.session.id }};

14) Nodo 14: DB – Update Stage to completed
- Tipo: PostgreSQL – Execute Query
- Query:
  UPDATE session_states
  SET current_stage = 'completed',
      completeness_score = 100,
      status = 'inactive',
      updated_at = now()
  WHERE id = {{ $json.session.id }}
  RETURNING id, current_stage, completeness_score;

15) Nodo 15: DB – Save Final Messages
- Tipo: PostgreSQL – Execute Query (asistente con link y estado final)
- Insert ASSISTANT:
  INSERT INTO conversation_messages (session_id, role, agent_name, stage, message, payload)
  VALUES (
    {{ $json.session.id }},
    'assistant',
    'report_sender',
    'completed',
    'Resumen validado. Generé tu PDF y envié el informe al líder.',
    to_jsonb({ "pdf": { "available": true, "url": {{ $json.user_pdf_url }} } })
  );

16) Nodo 16: Respond (Webhook Response o Return JSON)
- Tipo: Respond to Webhook (si usaste el Webhook inicial) o Set/Return JSON
- Armar envelope según stage:
  - discovery:
    { "agent":"discovery_agent","status":"ok","session":{...},"message": "...", "ui":{} }
  - summary_preview:
    { "agent":"summary_agent","status":"ok","session":{...},"message":"...", "ui":{"rich_summary":{...}} }
  - summary_refine:
    { "agent":"summary_agent","status":"ok","session":{...},"message":"...", "ui":{"directives":{"hide_summary": true}} }
  - completed:
    { "agent":"report_sender","status":"done","session":{...},"message":"...", "ui":{"pdf":{"available":true,"url": "..."}} }

Conexiones entre nodos (resumen)
- 1 Webhook → 2 Get/Create Session → 3 Get Conversation History → 4 Intent Router
- Intent Router:
  - clarify → 8 Summary refine → 9 Recalc Score → 10 Update Session → 11 Save Messages → 16 Respond
  - validate_and_finish → 12 Report Sender → 13 Persist URLs → 14 Update completed → 15 Save Final Messages → 16 Respond
  - auto → 5 Check Completeness:
    - No → 6 Discovery Agent → 10 Update Session → 11 Save Messages → 16 Respond
    - Sí → 7 Summary preview → 9 Recalc Score → 10 Update Session → 11 Save Messages → 16 Respond

Parámetros y tips de configuración

A. Webhook
- Production: usar credenciales/seguridad (token en header) y ruta no adivinable.
- Habilitar binary data si hicieras adjuntos (no requerido aquí).

B. LLM (Discovery/Preview/Refine)
- Modelo: gpt-4o, gpt-4.1, claude-3.5, etc. Ajusta temperatura 0.2–0.5.
- Limitar tokens y truncar historial a lo esencial.

C. HTTP Request (/api/analysis/simple-calculate)
- Método: POST, JSON.
- Manejo de errores: añadir rama IF por statusCode >= 400 para fallback.

D. Postgres Nodes
- Conexión: usar credenciales seguras.
- Preferir queries con parámetros (según nodo) o sanitizar variables.

E. Construcción del envelope (Respond)
- Asegurar que en summary_refine no incluyes ui.rich_summary.
- En completed, incluye solo user_pdf_url al front; leader_pdf_url nunca.

Checklist de armado en n8n
- [ ] Crear Webhook POST /insightbot y probar con curl/Postman.
- [ ] Configurar conexión DB Postgres y probar SELECT simple.
- [ ] Implementar Get/Create Session y Get Conversation History.
- [ ] Intent Router (Switch) + Code opcional para detectar intent desde message.
- [ ] Discovery Agent (LLM).
- [ ] Summary Agent: preview y refine (dos nodos LLM distintos con prompts específicos).
- [ ] HTTP a /api/analysis/simple-calculate y mapear score/prioridad.
- [ ] Update Session State según stage.
- [ ] Save Conversation Messages (2 inserts por vuelta).
- [ ] Report Sender → /api/reports/generate audience:"both".
- [ ] Persist Report URLs + Update Stage completed + Save Final Messages.
- [ ] Respond con envelope consistente según estado.

Ejemplos de payloads de salida (copiar/pegar)

A) summary_preview
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

B) summary_refine
{
  "agent": "summary_agent",
  "status": "ok",
  "session": { "session_id": "abc", "stage": "summary_refine", "completeness": 82, "should_continue": true },
  "message": "Para precisar, ¿cuántos docentes exactamente se verán impactados y con qué frecuencia usan Canvas?",
  "ui": { "directives": { "hide_summary": true } }
}

C) completed
{
  "agent": "report_sender",
  "status": "done",
  "session": { "session_id": "abc", "stage": "completed", "completeness": 100, "should_continue": false },
  "message": "Resumen validado. Generé tu PDF y envié el informe al líder.",
  "ui": { "pdf": { "available": true, "url": "https://…/user-report.pdf" } }
}

Con esto, puedes construir el workflow en n8n exactamente paso a paso, con los nodos y parámetros clave, conectándolo al Next.js y BD que ya tienes en el proyecto.
