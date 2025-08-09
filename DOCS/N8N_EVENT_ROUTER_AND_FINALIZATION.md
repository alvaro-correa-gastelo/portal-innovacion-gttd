# N8N: Router de Eventos y Rama de Finalización (alineado a InsightBot AI v2.json)

Este documento reemplaza guías antiguas y se alinea con el workflow real `InsightBot AI v2.json`.

## 1) Router Principal de Eventos
- Ubicación: inmediatamente después de `Webhook` y antes de cualquier enriquecimiento (`User Profile Data`, `Combinar Datos`, etc.).
- Nodo: `Switch` con nombre `Router Principal de Eventos`.
- Reglas:
  - Regla 1 (Finalización): Field `{{$json.body.event.type}}` Equal `SUMMARY_CONFIRMED` → salida 1.
  - Default: Conversación normal (flujo actual existente).

## 2) Rama de Finalización (salida 1)
Secuencia de nodos sugerida:

1. Postgres: Obtener Sesión para Finalizar
```sql
SELECT conversation_data, user_id, current_stage, completeness_score
FROM session_states
WHERE session_id = '{{$json.body.session_id}}'
LIMIT 1;
```

2. Postgres: Guardar Solicitud Final
```sql
INSERT INTO requests (
  session_id, user_id, titulo_solicitud, problema_principal, objetivo_esperado,
  plataformas_involucradas, beneficiarios, frecuencia_uso, plazo_deseado,
  departamento_solicitante, score_estimado, clasificacion_sugerida, prioridad_sugerida, status
) VALUES (
  '{{$json.body.session_id}}',
  '{{$("Obtener Sesión para Finalizar").first().json.user_id}}',
  '{{$("Obtener Sesión para Finalizar").first().json.conversation_data.titulo_solicitud}}',
  '{{$("Obtener Sesión para Finalizar").first().json.conversation_data.problema_principal}}',
  '{{$("Obtener Sesión para Finalizar").first().json.conversation_data.objetivo_esperado}}',
  '{{JSON.stringify($("Obtener Sesión para Finalizar").first().json.conversation_data.plataformas_involucradas)}}'::jsonb,
  '{{$("Obtener Sesión para Finalizar").first().json.conversation_data.beneficiarios}}',
  '{{$("Obtener Sesión para Finalizar").first().json.conversation_data.frecuencia_uso}}',
  '{{$("Obtener Sesión para Finalizar").first().json.conversation_data.plazo_deseado}}',
  '{{$("Obtener Sesión para Finalizar").first().json.conversation_data.departamento_solicitante}}',
  COALESCE({{$("Obtener Sesión para Finalizar").first().json.completeness_score}}, 0),
  '{{$("Obtener Sesión para Finalizar").first().json.conversation_data.clasificacion_sugerida}}',
  '{{$("Obtener Sesión para Finalizar").first().json.conversation_data.prioridad_sugerida}}',
  'pending_approval'
)
RETURNING id, created_at;
```

3. Notificar al Líder (Email/HTTP) con `{{$('Guardar Solicitud Final').first().json.id}}`.

4. Postgres: Cerrar Sesión
```sql
UPDATE session_states
SET status = 'completed', updated_at = NOW()
WHERE session_id = '{{$json.body.session_id}}';
```

5. Set: Construir Respuesta Final
```json
{
  "response_type": "text",
  "text": "¡Listo! Tu solicitud ha sido enviada con el folio #{{$('Guardar Solicitud Final').first().json.id}}.",
  "session_id": "{{$json.body.session_id}}"
}
```

6. Respond to Webhook: devolver el objeto anterior.

## 3) Contrato Frontend
- Endpoint: mismo webhook del chat `POST /insightbot-test/chat`.
- Payload al confirmar:
```json
{
  "event": { "type": "SUMMARY_CONFIRMED" },
  "session_id": "<SESSION_ID>"
}
```
- Respuesta esperada:
```json
{ "response_type": "text", "text": "¡Listo!... #<ID>", "session_id": "<SESSION_ID>" }
```

## 4) Pruebas Rápidas
1) Ejecuta el `Webhook` en n8n y envía:
```json
{ "body": { "event": { "type": "SUMMARY_CONFIRMED" }, "session_id": "test-session" } }
```
2) Verifica inserción en `requests`, notificación, `session_states.status = completed` y respuesta al frontend.

## 5) Estado actual del repositorio
- En `components/chat-interface.tsx`, el botón "Validar y Enviar" ahora dispara `SUMMARY_CONFIRMED` (callback `handleConfirmSummary`).
- Falta agregar el `Switch` de Router Principal + rama de finalización en el workflow real.

## 6) Referencias vigentes
- `DOCS/N8N_GUIA_RUTEO_Y_RAMAS.md`
- `DOCS/N8N_FINALIZATION_INTEGRATION_GUIDE.md`
- `N8N_RAMA_FINALIZACION_IMPLEMENTACION.md`

## 7) Notas
- Mantener nombres de nodos tal cual en este documento para evitar errores en expresiones `$("Nodo").first().json`.
- Ajustar columnas/tabla si tu esquema difiere.
