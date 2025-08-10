# Plan de Limpieza de Documentación y JSON de Workflows

Este plan indica qué mantener, qué actualizar y qué archivar en `DOCS/ARCHIVED/`.

## Mantener y actualizar
- `README.md`: visión general, cómo correr, variables .env, despliegue.
- `DOCS/N8N_STATE_MODEL.md`: modelo de estados (incluye `submitted`) y guía de implementación en n8n.
- `DOCS/N8N_EVENT_ROUTER_AND_FINALIZATION.md`: rutas de eventos, finalización y payloads; alinear con `insightAgentFinal.json`.
- `DOCS/N8N_GUIA_RUTEO_Y_RAMAS.md`: mantener si no duplica al documento anterior; si duplica, fusionar y mantener uno solo.
- `DOCS/SCORING_FRAMEWORK_EXPLAINER.md`: guía de scoring y explicación legible.
- `GUIA_MODALES_CON_DATOS_REALES.md` y `MEJORAS_MODALES_IMPLEMENTADAS.md`: actualizar capturas y comportamiento de sanitización para solicitante.

## Archivar (mover a `DOCS/ARCHIVED/` si no están perfectamente alineados al flujo actual)
- `INSIGHTBOT-WORKFLOW-ANALYSIS.md`
- `WORKFLOW_N8N_INSIGHTBOT_OPTIMIZADO.md`
- `N8N_RAMA_FINALIZACION_IMPLEMENTACION.md`
- `n8n-missing-nodes-config.md`
- `PROMPT_PARA_GENERAR_WORKFLOW_N8N.md`
- `AGENTE_1_FLUJO_DOCUMENTACION.md`
- `Estado_Actual_Proyecto_GTTD.md`
- `ESTADO_ACTUALIZADO_IMPLEMENTACION_ENERO_2025.md`
- `CONTEXTO.md` y `CONTEXTO_COMPLETO_PORTAL_INNOVACION_GTTD.md` (conservar solo un contexto breve en README si se requiere)
- `PLAN_4_SEMANAS_IMPLEMENTACION.md`
- `PRECISE_BACKLOG_PENDING_FUNCTIONALITY.md`
- `DOCS/*_PROMPT*.md` y archivos de prompts no usados por el sistema actual

## JSON de workflows (mantener vs archivar)
- Mantener: `insightAgentFinal.json` (producción) y, si aplica, `InsightBot AI v2.json` solo si es el mismo flujo o el respaldo inmediatamente anterior.
- Archivar en `DOCS/ARCHIVED/WORKFLOWS/` todos los demás relacionados con n8n:
  - `insightAgent.json`, `insightbot_workflow.json`, `InsightBot_Workflow_Import.json`, `InsightBot_Finalize_Workflow_Import.json`, `InsightBot_AI_Agent_Workflow.json`, `discovery-agent-*.json`, etc.
  - Criterio: si no se importa en n8n actualmente o no coincide con el doc vigente, se archiva.

## Pasos
1. Crear `DOCS/ARCHIVED/` y `DOCS/ARCHIVED/WORKFLOWS/`.
2. Mover los MD y JSON listados a dichas carpetas (mantener árbol limpio en raíz).
3. Actualizar referencias internas en los MD vigentes.
4. Hacer revisión final: que README enlace solo a docs vigentes.

## Checklist de verificación
- [ ] README actualizado.
- [ ] `N8N_STATE_MODEL.md` y router/finalización alineados con el JSON de producción.
- [ ] `insightAgentFinal.json` es el único workflow activo en la repo.
- [ ] Todos los MD/JSON obsoletos movidos a `DOCS/ARCHIVED/`.
