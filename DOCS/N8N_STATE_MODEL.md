# N8N State Model and Implementation Guide

Este documento define el modelo de estados definitivo (incluye `submitted`) y cómo implementarlo en el workflow de n8n.

## Estados soportados
- submitted (Recibida)
- in_evaluation (En Evaluación)
- pending_technical_analysis (Análisis Técnico)
- pending_approval (Pendiente Aprobación)
- approved (Aprobada)
- rejected (Rechazada)
- on_hold (En Espera)

## Reglas de transición (resumen)
- submitted → in_evaluation (cuando líder de dominio clasifica/ajusta prioridad)
- in_evaluation → pending_technical_analysis (si requiere análisis técnico)
- in_evaluation → pending_approval (si va directo a gerencia)
- pending_technical_analysis → pending_approval | in_evaluation (según resultado)
- pending_approval → approved | rejected
- Cualquier estado → on_hold (pausa), retorna al anterior al quitar pausa

## Implementación en n8n

1) Webhook inicial (POST /insightbot/chat)
- Entrada mínima requerida: `session_id`, `request_id` (si ya existe), `event_type`, payload de chat.
- Validar que `session_id` venga del cliente; si falta, retornar error.

IMPORTANTE: si tu flujo crea la solicitud recién DESPUÉS de que el usuario confirme el resumen (evento `SUMMARY_CONFIRMED`), entonces la normalización inicial (status `submitted` + primer evento de auditoría) NO va al inicio del chat. Va en la rama de finalización/creación que se activa tras `SUMMARY_CONFIRMED`.

2) Nodo `Set: Normalize Initial` (en la rama de finalización tras `SUMMARY_CONFIRMED`)
- Asegurar estructura base de `request` y del primer evento de auditoría.
- Campos sugeridos a setear:
  - request.status = "submitted"
  - audit.action_type = "created"
  - audit.previous_status = null
  - audit.new_status = "submitted"
  - audit.comments = "Solicitud creada"
  - audit.request_id = {{$json.request_id || ''}}
  - audit.session_id = {{$json.session_id}}
  - audit.user_name = {{$json.user_name || $json.email || 'solicitante'}}

3) Nodo `Function: Build Audit Row` (opcional si prefieres mapear en JS)
- Construir un objeto `audit_row` final para BD:
```js
return [{
  audit_row: {
    request_id: $json.request_id,
    action_type: 'created',
    previous_status: null,
    new_status: 'submitted',
    leader_id: $json.user_email || $json.user_name,
    comments: 'Solicitud creada',
    created_at: new Date().toISOString(),
  }
}]
```

4) Nodo de BD `Postgres: Insert requests_audit`
- Tabla: `requests_audit`
- Columnas → valores:
  - request_id → {{$json.audit_row.request_id}}
  - action_type → {{$json.audit_row.action_type}}
  - previous_status → {{$json.audit_row.previous_status}}
  - new_status → {{$json.audit_row.new_status}}
  - leader_id → {{$json.audit_row.leader_id}}
  - comments → {{$json.audit_row.comments}}
  - created_at → {{$json.audit_row.created_at}}

5) Ramas posteriores
- Clasificación/ajuste de prioridad (líder dominio) → generar evento
  - action_type: "evaluate"
  - previous_status: "submitted"
  - new_status: "in_evaluation"
  - comments: "Clasificación actualizada" (no incluir detalles sensibles)
- Enviar a gerencia →
  - action_type: "send_to_approval"
  - previous_status: "in_evaluation" | "pending_technical_analysis"
  - new_status: "pending_approval"
  - comments: "En revisión final"
- Aprobación/Rechazo gerencial →
  - action_type: "approve" | "reject"
  - new_status: "approved" | "rejected"
- Pausa →
  - action_type: "hold"
  - new_status: "on_hold"

6) Notas importantes
- Nunca generar `session_id` en n8n; siempre debe venir del cliente.
- Mantener comentarios sanitizados para el solicitante (los detalles internos se filtran en el backend con `?audience=user`).
- Si `requests_audit` está vacío, el backend sintetiza el primer evento con `submitted`, pero es mejor insertarlo desde n8n.

## Checklist de verificación
- [ ] El primer evento en cada solicitud es `created/submitted`.
- [ ] No hay eventos de `pending_approval` antes de `in_evaluation` (salvo flujo directo a gerencia).
- [ ] Todos los cambios de estado insertan fila en `requests_audit`.
- [ ] No se exponen detalles internos en `comments`.
