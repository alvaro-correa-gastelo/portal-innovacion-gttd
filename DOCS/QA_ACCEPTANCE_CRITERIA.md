Título: Criterios de Aceptación, Casos de Prueba y Plan de QA – InsightBot

Resumen
Este documento define criterios de aceptación verificables, casos de prueba (unidad, integración y E2E) y un plan de QA alineado con el flujo conversacional acordado: discovery → summary_preview → summary_refine → completed, con generación de PDFs usando templates de BD y sin exponer el leader_pdf_url al cliente final.

1) Criterios de aceptación funcionales

1.1 Estados y visibilidad del resumen
- CA-STATE-1: El resumen se muestra únicamente cuando session.stage = "summary_preview".
- CA-STATE-2: En session.stage = "summary_refine", el frontend no renderiza el resumen y acata ui.directives.hide_summary = true.
- CA-STATE-3: En "completed", el frontend muestra confirmación y ui.pdf.available = true con el user_pdf_url.

1.2 Interacciones clave en Frontend
- CA-FE-1: El usuario puede iniciar aclaraciones escribiendo texto libre (p. ej., “falta X”) y/o pulsando el botón “Aclarar un punto”.
- CA-FE-2: El usuario puede validar y finalizar desde la burbuja del resumen (“Validar y finalizar”), lo que dispara la generación de PDFs.
- CA-FE-3: Se abre un modal visor (PdfViewerDialog) con el user_pdf_url tras la generación.
- CA-FE-4: Nunca se revela leader_pdf_url en la interfaz del solicitante.

1.3 Contrato API y Envelopes
- CA-API-1: Todas las respuestas del orquestador (n8n o pasarela Next) devuelven el envelope con { agent, status, session, message, ui? }.
- CA-API-2: En summary_preview, ui.rich_summary incluye title, chips, score, sections y actions.
- CA-API-3: En summary_refine, no existe ui.rich_summary y sí ui.directives.hide_summary = true.
- CA-API-4: En completed, ui.pdf.available = true y user_pdf_url opcionalmente presente; leader_pdf_url nunca en respuestas al solicitante.

1.4 Generación y envío de reportes
- CA-REP-1: POST /api/reports/generate permite audience: "user" | "leader" | "both"; usa plantillas de report_templates.
- CA-REP-2: Al menos un PDF válido se genera para audience="user" y ambos PDFs para audience="both".
- CA-REP-3: Se persiste en session_states.conversation_data.report = { report_id, user_pdf_url, leader_pdf_url }.
- CA-REP-4: Si se realiza envío al líder, se hace backend-to-backend (Next o n8n). El front del solicitante no recibe leader_pdf_url.

1.5 Persistencia
- CA-DB-1: conversation_messages guarda cada intercambio con role, agent_name, stage, message, payload (resumen parcial) y timestamps.
- CA-DB-2: session_states mantiene current_stage, completeness_score y conversation_data (incluyendo last_summary y report).
- CA-DB-3: (Opcional) report_logs registra los detalles de generación/envío si está habilitado.

1.6 Robustez y seguridad
- CA-SEC-1: Si hay error en generación de PDF o almacenamiento, el sistema comunica status="error" y permite reintento.
- CA-SEC-2: Sanitización de campos para render HTML en reportes; no inyectar contenido no confiable.
- CA-SEC-3: Límites y timeouts razonables en Puppeteer; cierre correcto del browser/headless.

2) Casos de prueba

2.1 Happy Path (E2E)
- PASO-HP-1: Usuario conversa hasta completeness ≥ threshold → stage cambia a summary_preview.
- PASO-HP-2: Se muestra ui.rich_summary con acciones clarify y validate_and_finish.
- PASO-HP-3: Usuario pulsa “Validar y finalizar”.
- PASO-HP-4: Backend genera ambos PDFs (audience="both"); persiste URLs; responde con user_pdf_url.
- PASO-HP-5: Front abre PdfViewerDialog con user_pdf_url y session pasa a completed.

Validaciones:
- El modal muestra un PDF válido (cabeceras correctas, tamaño razonable).
- No se expone leader_pdf_url al cliente.

2.2 Bucle de Aclaraciones (E2E)
- PASO-CL-1: En summary_preview, usuario selecciona “Aclarar un punto” o escribe disconformidad.
- PASO-CL-2: Orquestador retorna summary_refine con message de 1-2 preguntas y ui.directives.hide_summary=true.
- PASO-CL-3: Usuario responde; el flujo vuelve a preview con resumen actualizado.
- PASO-CL-4: Repetir hasta conformidad y validar.

Validaciones:
- El resumen permanece oculto durante refine.
- Contador de refine_rounds no excede 5 iteraciones; si excede, se sugiere volver a ver resumen o validar.

2.3 Errores comunes
- ERR-DB-1: Falla de BD al obtener plantillas → status="error" + mensaje “intenta nuevamente”.
- ERR-PDF-1: Puppeteer falla → status="error"; reintento manual disponible.
- ERR-STOR-1: Fallo al subir a storage → reintenta y si falla, error explícito.
- ERR-NET-1: Error al enviar al líder → persistir éxito de generación y marcar envío pendiente.

2.4 Reapertura de sesión
- Caso: Usuario escribe después de completed.
- Esperado: Se crea nueva sesión activa referenciando a la previa (si aplica) y entra a discovery.

3) Pruebas de unidad

Frontend
- FE-U-1: Render condicional de MessageBubbleAgentSummary (solo en summary_preview).
- FE-U-2: PdfViewerDialog abre/cierra y recibe URL válida.
- FE-U-3: Handlers onClarify, onValidateAndFinish, onBackToSummary emiten payloads correctos.

Backend Next
- BE-U-1: Mapper de placeholders user_report y leader_report (incluye fechas ES, escape HTML).
- BE-U-2: Motor de render de templates (Mustache/Handlebars o reemplazo seguro).
- BE-U-3: Envoltorio Puppeteer: setContent/pdf, tiempos, cierre.
- BE-U-4: No incluir leader_pdf_url en respuestas al solicitante.

n8n
- N8N-U-1: Switch de intents y stage correcto.
- N8N-U-2: Prompt refine vs preview respeta directivas de UI.
- N8N-U-3: Recalcular score con /api/analysis/simple-calculate y aplicar al resumen.

BD
- DB-U-1: Funciones de upsert en session_states.conversation_data.report.
- DB-U-2: Índices y constraints válidos; consultas de plantillas devuelven resultados.

4) Pruebas de integración

- INT-1: Front → Webhook → n8n → Front (envelopes correctos en summary_preview/refine).
- INT-2: n8n → Next (/api/reports/generate) con audience="both": genera y persiste URLs; retorna user_pdf_url a n8n; n8n actualiza BD y responde al Front.
- INT-3: Manejo de errores en cualquiera de los pasos y mensajes de retry.

5) Plan E2E automatizado (esbozo)

Herramientas: Playwright/Cypress + seed de BD + mock de n8n (opcional) o entorno staging completo.

Escenarios:
- E2E-HP: Happy Path completo (incluye ver PDF).
- E2E-CL: Aclaraciones 2 rondas y luego validación.
- E2E-ERR-PDF: Forzar error de PDF y verificar reintento.
- E2E-SEC: Confirmar que leader_pdf_url nunca aparece en el response del front.

6) Checklist de QA por área

Frontend
- [ ] Render condicional de resumen y ocultamiento en refine.
- [ ] Modal PDF con foco y Esc para cerrar.
- [ ] Botones de acciones inline, sin modales de edición.
- [ ] Toasts de error y estados de carga.

Backend Next
- [ ] /api/reports/generate con templates de BD.
- [ ] Mapear placeholders, escape HTML, fecha ES.
- [ ] Generar PDFs y subir a storage.
- [ ] Persistir en session_states y no exponer leader_pdf_url.

n8n
- [ ] Switch por intent y stage exacto.
- [ ] Summary Agent en refine/preview con contratos de UI correctos.
- [ ] Recalcular score/prioridad vía /api/analysis/simple-calculate.
- [ ] Persistir URLs y responder envelope uniforme.

BD
- [ ] Estructura de session_states y conversation_messages confirmada.
- [ ] report_templates activos para ambos tipos.
- [ ] (Opcional) report_logs creado e indexado.

Seguridad y errores
- [ ] Timeouts y cierre de Puppeteer.
- [ ] Sanitización de strings.
- [ ] Reintentos razonables y mensajes claros.

7) Criterios de salida (Definition of Done)

- DoD-1: Todos los CA de 1.1 a 1.6 cumplidos.
- DoD-2: E2E-HP y E2E-CL pasando en staging.
- DoD-3: Logs en BD de mensajes y estado de sesión coherentes.
- DoD-4: No exposición de leader_pdf_url verificada en captura de tráfico.
- DoD-5: Documentación FRONEND/BACKEND/N8N/BD actualizada en DOCS/.

Conclusión
Con estos criterios, casos y plan de QA se valida el flujo conversacional, el manejo de aclaraciones y la generación de reportes basada en plantillas de BD, garantizando consistencia entre frontend, backend, n8n y base de datos sin fugas de información sensible.
