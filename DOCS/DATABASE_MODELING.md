Título: Modelo de Datos y Persistencia para Flujo Conversacional y Reportes

Resumen
Este documento define el modelado y las operaciones de BD necesarias para soportar:
- Sesiones conversacionales con estados (discovery, summary_preview, summary_refine, completed).
- Historial de mensajes con payloads UI.
- Plantillas HTML de reportes (user_report y leader_report).
- Registro de generación y envío de PDFs.
- Reglas de consistencia y limpieza.

1) Tablas involucradas

1.1 session_states (existente)
Propósito: Mantener el estado vivo de la sesión y metadatos.
Campos sugeridos:
- id uuid PK
- user_id uuid (FK opcional)
- current_stage text CHECK (current_stage IN ('discovery','summary_preview','summary_refine','completed'))
- completeness_score int CHECK (completeness_score BETWEEN 0 AND 100)
- status text CHECK (status IN ('active','inactive')) DEFAULT 'active'
- conversation_data jsonb NULL
- created_at timestamptz DEFAULT now()
- updated_at timestamptz DEFAULT now()

Ejemplo conversation_data:
{
  "last_summary": {
    "title": "Optimización de carga en Canvas",
    "classification": "Proyecto",
    "priority": "P1",
    "score": 92,
    "sections": [...],
    "chips": [...]
  },
  "report": {
    "report_id": "6b3d-...",
    "user_pdf_url": "https://.../user.pdf",
    "leader_pdf_url": "https://.../leader.pdf"
  },
  "refine_rounds": 2
}

Índices:
- CREATE INDEX idx_session_states_user ON session_states(user_id);
- CREATE INDEX idx_session_states_status ON session_states(status);
- CREATE INDEX idx_session_states_stage ON session_states(current_stage);

1.2 conversation_messages (existente)
Propósito: Log de mensajes y payloads de UI para auditoría y reconstrucción.
Campos sugeridos:
- id uuid PK DEFAULT gen_random_uuid()
- session_id uuid NOT NULL
- role text CHECK (role IN ('user','assistant')) NOT NULL
- agent_name text NULL -- discovery_agent | summary_agent | report_sender
- stage text NULL -- discovery | summary_preview | summary_refine | completed
- message text NULL
- payload jsonb NULL -- fragmentos ui, métricas, etc.
- created_at timestamptz DEFAULT now()

Índices:
- CREATE INDEX idx_conv_msgs_session ON conversation_messages(session_id);
- CREATE INDEX idx_conv_msgs_created ON conversation_messages(created_at);

Buenas prácticas:
- Guardar en payload un resumen de ui.rich_summary (solo claves: title, chips, score) para no inflar demasiado.
- Truncar mensajes muy largos si es necesario.

1.3 report_templates (existente)
Propósito: Plantillas HTML y estilos para PDF.
Campos confirmados (por el proyecto):
- id uuid PK
- name text NOT NULL
- type text CHECK (type IN ('user_report','leader_report')) NOT NULL
- template_html text NOT NULL
- css_styles text NULL
- created_by text DEFAULT 'system'
- created_at timestamptz DEFAULT now()
- is_active boolean DEFAULT true
- version text DEFAULT 'v1.0'

Índices:
- CREATE INDEX idx_report_templates_type_active ON report_templates(type, is_active);

Registros que ya tienes:
- user_report (id: 1b2342c9-1c6a-4565-bfab-fbb9b36e8e04)
- leader_report (id: 7448c7c6-7282-46cb-8304-3475242b7cdf)

1.4 report_logs (opcional pero recomendado)
Propósito: Auditoría de generación y envío de reportes.
Campos sugeridos:
- id uuid PK DEFAULT gen_random_uuid()
- session_id uuid NOT NULL
- template_user_id uuid NULL
- template_leader_id uuid NULL
- user_pdf_url text NULL
- leader_pdf_url text NULL
- sent_to text[] NULL -- emails/ids del líder
- channel text NULL -- 'email', 'teams', 'slack'
- meta jsonb NULL -- info adicional (tiempos, tamaño PDF, errores)
- created_at timestamptz DEFAULT now()

Índices:
- CREATE INDEX idx_report_logs_session ON report_logs(session_id);
- CREATE INDEX idx_report_logs_created ON report_logs(created_at);

2) Operaciones CRUD típicas

2.1 Sesiones
- Crear nueva:
  INSERT INTO session_states (user_id, current_stage, completeness_score, status, conversation_data)
  VALUES ($1, 'discovery', 0, 'active', '{}'::jsonb)
  RETURNING id;

- Actualizar stage/completeness:
  UPDATE session_states
  SET current_stage = $2,
      completeness_score = $3,
      updated_at = now()
  WHERE id = $1;

- Guardar último resumen y rounds refine:
  UPDATE session_states
  SET conversation_data = jsonb_set(
        jsonb_set(COALESCE(conversation_data, '{}'::jsonb), '{last_summary}', to_jsonb($2::json), true),
        '{refine_rounds}',
        to_jsonb(COALESCE(($3)::int, 0)),
        true
      ),
      updated_at = now()
  WHERE id = $1;

- Cerrar sesión:
  UPDATE session_states
  SET current_stage = 'completed',
      status = 'inactive',
      updated_at = now()
  WHERE id = $1;

2.2 Mensajes
- Insertar mensaje:
  INSERT INTO conversation_messages (session_id, role, agent_name, stage, message, payload)
  VALUES ($1, $2, $3, $4, $5, $6);

2.3 Reportes
- Upsert metadata de reportes en session_states:
  UPDATE session_states
  SET conversation_data = jsonb_set(
        COALESCE(conversation_data, '{}'::jsonb),
        '{report}',
        to_jsonb($2::json),
        true
      ),
      updated_at = now()
  WHERE id = $1;

- Insertar en report_logs (si usas la tabla):
  INSERT INTO report_logs (session_id, template_user_id, template_leader_id, user_pdf_url, leader_pdf_url, sent_to, channel, meta)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

3) Reglas de consistencia y validaciones

- Etapas válidas y orden:
  discovery → summary_preview ↔ summary_refine → completed
- Validar:
  - summary_preview exige last_summary no vacío con title, classification, priority.
  - completed exige que conversation_data.report contenga report_id y user_pdf_url (leader_pdf_url puede guardarse pero no exponerse).
- Límites:
  - refine_rounds: máx 5; si supera, sugerir volver a ver resumen o validar.
- Seguridad:
  - Nunca exponer leader_pdf_url a clientes no autorizados (solo backend y n8n).
  - Sanitizar strings (evitar inyección si renderizas HTML desde la BD en otros contextos).

4) Migraciones SQL de apoyo (ejemplos)

4.1 Índices
CREATE INDEX IF NOT EXISTS idx_session_states_stage ON session_states(current_stage);
CREATE INDEX IF NOT EXISTS idx_session_states_status ON session_states(status);
CREATE INDEX IF NOT EXISTS idx_conv_msgs_session ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_conv_msgs_created ON conversation_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_report_templates_type_active ON report_templates(type, is_active);

4.2 Tabla report_logs (opcional)
CREATE TABLE IF NOT EXISTS report_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  template_user_id uuid NULL,
  template_leader_id uuid NULL,
  user_pdf_url text NULL,
  leader_pdf_url text NULL,
  sent_to text[] NULL,
  channel text NULL,
  meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

5) Consultas útiles

- Último resumen de una sesión:
SELECT conversation_data->'last_summary' AS last_summary
FROM session_states
WHERE id = $1;

- Historial de mensajes resumido:
SELECT role, agent_name, stage, message, created_at
FROM conversation_messages
WHERE session_id = $1
ORDER BY created_at ASC;

- Plantilla activa por tipo:
SELECT id, name, template_html, css_styles
FROM report_templates
WHERE type = $1 AND is_active = true
ORDER BY created_at DESC
LIMIT 1;

6) Retención y limpieza

- Conversaciones completadas antiguas:
DELETE FROM conversation_messages
WHERE session_id IN (
  SELECT id FROM session_states
  WHERE current_stage = 'completed' AND created_at < now() - interval '180 days'
);

- O bien, archivar a una tabla histórica si es necesario.

7) Checklist BD

- [ ] Confirmar schema actual de session_states y conversation_messages.
- [ ] Verificar existencia de report_templates con los dos registros provistos (user_report, leader_report).
- [ ] Crear índices recomendados.
- [ ] (Opcional) Crear report_logs para auditoría.
- [ ] Implementar procedimientos/cron de limpieza de sesiones antiguas.
- [ ] Validar reglas de consistencia en API/Workflow antes de transiciones de stage.

Con este modelo de datos y operaciones, la experiencia conversacional queda respaldada por registros auditables, estados claros de sesión, y la generación/seguimiento de reportes basada en plantillas de la BD, alineado al flujo discutido.
