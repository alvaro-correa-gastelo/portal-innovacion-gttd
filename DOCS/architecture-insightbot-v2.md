# Flujo propuesto: InsightBot AI v2 – Demo End‑to‑End (Solicitante → Líder Dominio → Líder Gerencial)

Este documento resume la arquitectura funcional, responsabilidades por rol, endpoints y pendientes necesarios para la demo del MVP v2.


## 1) Roles y responsabilidades en la UI

- Solicitante (Portal del Solicitante)
  - Conversa con Agente 1 (Discovery) para refinar requerimiento
  - Recibe un Resumen Ejecutivo (mock/IA) y lo Acepta/Envía
  - Tras aceptar, se crea la Solicitud en BD y aparece en “Mis Solicitudes”

- Líder de Dominio (Modal de Gestión)
  - Tabs: Detalles | Análisis IA | Planificación | Chat (Solicitante / Interno) | Gestión
  - Ajusta clasificación/prioridad (override) y agrega comentarios
  - Aprueba requerimientos directamente o eleva “proyecto” para aprobación gerencial
  - Coordina en “Colaboración interna” (privado)

- Líder Gerencial (Modal de Aprobación)
  - Tabs: Detalles | Chat (Solicitante / Interno) | Aprobación
  - No ve “Análisis IA” ni “Planificación” (exclusivo del Líder de Dominio)
  - Revisa doc de planificación y decide Aprobación/Rechazo


## 2) Flujo de extremo a extremo (E2E)

1. Portal Solicitante – Conversación con Agente 1 (Discovery)
   - Objetivo: capturar problema, objetivo, frecuencia, plataformas, plazo, beneficiarios.
   - Output: Resumen Ejecutivo (preview) con campos normalizados para DB.

2. Aceptar Resumen → Crear Solicitud en BD
   - POST /api/requests
   - Campos mínimos:
     - title, description (problema), objective, department, requester, frequency, timeframe, platforms, beneficiaries
     - clasificacion_sugerida, prioridad_sugerida (producido por IA)
     - status=in_evaluation (o pending_technical_analysis)

3. “Mis Solicitudes” (Solicitante)
   - GET /api/requests?user={me}
   - Debe listar la nueva solicitud con estado actual

4. Notificar a Líder de Dominio
   - Opcional: webhook/queue/notificación interna

5. Modal – Líder de Dominio
   - Recibe la solicitud, puede:
     - Ajustar clasificación/prioridad (PUT /api/requests/:id)
     - Chatear con solicitante (chat público)
     - Coordinar en “Colaboración interna” (chat interno)
     - Aprobar requerimiento (approved) o Elevar proyecto (pending_approval)

6. Modal – Líder Gerencial
   - Revisa “Aprobación” con doc de planificación
   - Decide: approved | rejected
   - Comentarios quedan registrados en leader_comments (u otro campo)

7. Notificar al Solicitante
   - Chat público y/o notificación del estado final


## 3) Componentes implementados y contratos

- RealisticLeaderModal
  - Tabs por rol (condicionales):
    - Lider Dominio: Detalles | Análisis IA | Planificación | Chat | Gestión
    - Lider Gerencial: Detalles | Chat | Aprobación
  - Chat con subpestañas (nuevo):
    - Chat con Solicitante → BidirectionalChat
    - Colaboración Interna → InternalCollabChat (nuevo, con Preview/Mock si no hay endpoint)
  - Lógica de aprobación usa “valores efectivos” (getEffectiveClassification/Priority)

- BidirectionalChat (público)
  - GET /api/requests/:id/chat
  - POST /api/requests/:id/chat
  - Si falla, muestra mensaje de sistema informando el error

- InternalCollabChat (interno – nuevo)
  - GET /api/requests/:id/internal-chat
  - POST /api/requests/:id/internal-chat
  - Si el endpoint no existe, activa modo Preview/Mock con badge “Preview · Mock”


## 4) Normalización de prioridades (UI)

- Visualización descriptiva: Crítica/Alta/Media/Baja
- Backend mantiene codificación P1/P2/P3/P4
- Donde aplique, mapear P1→Crítica, P2→Alta, P3→Media, P4→Baja para textos de UI y comentarios.


## 5) API/BD – Campos sugeridos

- requests
  - id, title, description, objective, department, requester, created_at
  - frequency, timeframe, platforms (JSON/array), beneficiaries
  - clasificacion_sugerida (requerimiento|proyecto)
  - prioridad_sugerida (P1|P2|P3|P4)
  - clasificacion_final, prioridad_final, leader_override (bool)
  - status (in_evaluation|pending_approval|approved|rejected|on_hold|pending_technical_analysis)
  - leader_comments

- chat_public
  - id, request_id, user_name, user_email, user_role (leader|user), message, created_at

- chat_internal
  - id, request_id, user_name, role (lider_dominio|lider_gerencial|analista|pm), message, created_at


## 6) Endpoints mínimos (Demo)

- POST /api/requests (crear desde Portal Solicitante)
- GET /api/requests?user=me (listar en “Mis Solicitudes”)
- GET /api/requests/:id (detalles)
- PUT /api/requests/:id (actualizaciones estado/overrides)
- GET/POST /api/requests/:id/chat (chat público)
- GET/POST /api/requests/:id/internal-chat (chat interno – puede ser Mock/Preview en demo)


## 7) Integración del Agente 1 (Discovery)

- Interfaz de chat en Portal Solicitante con prompts guiados (frecuencia, plataformas, plazo, impacto)
- Normalizador/Extractor a esquema de solicitud
- Generar Resumen Ejecutivo y pedir Confirmación (Aceptar/Editar)
- Al aceptar → POST /api/requests
- (Opcional) Calcular sugerencia de clasificación/prioridad


## 8) Qué falta para la demo completa

- Portal del Solicitante:
  - Chat Agente 1 (UI/flow) y builder del Resumen Ejecutivo
  - POST /api/requests implementado
  - Vista “Mis Solicitudes” consumiendo GET /api/requests?user=me

- Backend:
  - Endpoints chat interno (GET/POST /internal-chat) – puede ser mock
  - Seguridad básica (rol, permisos)

- UI ajustes (rápidos):
  - Mapear P1/P2/P3/P4 a etiquetas texto en todos los lugares visibles al usuario
  - Badges “Datos Reales” vs “Preview/Mock” donde corresponda


## 9) Verificación InsightBot AI v2.json

- No se encontró “InsightBot AI v2.json” en el repo actual. Si existe en otra ruta, compárteme la ubicación. Recomiendo ubicarlo en `configs/insightbot/InsightBot-AI-v2.json` y versionarlo.
  - Contenido esperado: prompts, reglas del Discovery Agent, mapeos a campos de BD, plantillas del Resumen Ejecutivo.


## 10) Observaciones de calidad

- Evitar duplicación de componentes (chat) y usar subpestañas reutilizando el mismo contenedor
- Mantener distinción clara entre datos de BD y secciones “Preview/Mock”
- No mezclar IA/Planificación en el modal del Líder Gerencial


## 11) Checklist de la Demo

- [ ] Chat Agente 1 funcional en portal del solicitante
- [ ] Resumen Ejecutivo con botón Aceptar → Crea solicitud (POST)
- [ ] “Mis Solicitudes” lista la nueva solicitud
- [ ] Modal Líder Dominio con tabs correctas y chat público/interno operativos (o mock)
- [ ] Aprobación/ Elevación según clasificación efectiva
- [ ] Modal Líder Gerencial sin IA/Planificación y con chat público/interno
- [ ] Notificación final al solicitante


## 12) Tareas para ti (owner)

- Confirmar/compartir InsightBot AI v2.json (ruta exacta) o subirlo a `configs/insightbot/InsightBot-AI-v2.json`
- Implementar o stubear (mock) los endpoints de chat interno
- Implementar flujo del Portal del Solicitante (Agente 1 → Resumen → POST requests)
- Validar mapeo textual de prioridades en todas las vistas
- Revisar permisos por rol para tabs (gerencial vs dominio)


## 13) Tareas que ya quedaron hechas en este PR

- Botón Aprobar usa clasificación/prioridad efectivas de BD en lógica y texto
- Reorganización de tabs por rol (IA/Planificación solo dominio)
- Chat unificado con subpestañas: público e interno
- Componente nuevo InternalCollabChat con modo Preview/Mock y badge de estado
- Limpieza de duplicación de encabezados del chat

