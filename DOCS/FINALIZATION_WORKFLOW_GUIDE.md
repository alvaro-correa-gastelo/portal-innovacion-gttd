# Guía del Flujo de Finalización de Solicitudes

Este documento describe el proceso completo desde que el usuario ve la tarjeta de resumen hasta que la solicitud es enviada al líder y la conversación finaliza.

## 1. La Interacción del Usuario en la Tarjeta de Resumen

La `SummaryValidationCard` debe presentar al usuario dos botones con acciones claras:

1.  **Botón Primario: "✅ Confirmar y Enviar"**
    *   **Acción del Usuario:** El usuario hace clic aquí si está de acuerdo con el resumen.
    *   **Objetivo del Sistema:** Finalizar la conversación, guardar la solicitud y notificar al líder.

2.  **Botón Secundario: "✏️ Necesito Corregir Algo"**
    *   **Acción del Usuario:** El usuario hace clic aquí si detecta un error o quiere añadir más información.
    *   **Objetivo del Sistema:** Volver al modo de descubrimiento para que el usuario pueda aclarar los puntos necesarios.

---

## 2. Flujo del Sistema al "Confirmar y Enviar"

Este es el "camino feliz" que finaliza la solicitud.

### A. Frontend (ChatInterface)
1.  Al hacer clic en "Confirmar y Enviar", el frontend debe enviar un mensaje al webhook de n8n. Para evitar confusiones, este mensaje debe ser un evento estructurado.
    ```json
    {
      "message": "El usuario ha confirmado el resumen de la solicitud.",
      "event": {
        "type": "SUMMARY_CONFIRMED"
      },
      "session_id": "...",
      "user": { ... }
    }
    ```
2.  La interfaz de chat debe mostrar un mensaje de espera, como "¡Perfecto! Procesando y enviando tu solicitud...".

### B. n8n Workflow
1.  **Nodo "Router" o "Switch":** El workflow debe tener un nodo justo al principio que revise el `event.type`.
    *   **SI `event.type` == `SUMMARY_CONFIRMED`**: El flujo se dirige a la nueva rama de "Finalización".
    *   **SI NO**: El flujo continúa hacia el "Agente Descubridor" como de costumbre.

2.  **Rama de Finalización (Nuevos Nodos):**
    *   **Nodo 1: Guardar Solicitud en BD:**
        *   **Tipo:** `Postgres` o `Code` (con una query).
        *   **Acción:** `INSERT` en la tabla `requests` con toda la información validada que está guardada en la sesión (`conversation_data`).
        *   **Importante:** La query debe devolver el `id` de la solicitud recién creada (el folio).
    *   **Nodo 2: Notificar al Líder:**
        *   **Tipo:** `Microsoft Teams`, `Slack` o `Send Email`.
        *   **Acción:** Enviar un mensaje al canal o correo del líder correspondiente.
        *   **Contenido del Mensaje:**
            > **Nueva Solicitud de Innovación (#{{ $json.folio_id }})**
            > **Solicitante:** {{ $json.user.name }}
            > **Título:** {{ $json.summary.titulo_solicitud }}
            > **Clasificación Sugerida:** {{ $json.scoring_result.classification }} ({{ $json.scoring_result.total_score }} pts)
            > **Prioridad Sugerida:** {{ $json.scoring_result.priority }}
            > **[Link al Panel de Aprobaciones para ver detalles]**
    *   **Nodo 3: Cerrar Sesión:**
        *   **Tipo:** `Postgres` o `Code`.
        *   **Acción:** `UPDATE` en la tabla `session_states` para cambiar el `status` a `completed` para el `session_id` actual.
    *   **Nodo 4: Mensaje Final al Usuario:**
        *   **Tipo:** `Respond to Webhook`.
        *   **Contenido:**
            ```json
            {
              "response_type": "text",
              "text": "¡Listo! Tu solicitud ha sido enviada con el folio #{{ $json.folio_id }}. Recibirás una notificación cuando sea revisada. ¡Gracias por tu aporte!"
            }
            ```

---

## 3. Flujo del Sistema al "Necesito Corregir Algo"

### A. Frontend (ChatInterface)
1.  Al hacer clic, el frontend envía un mensaje de texto simple al webhook.
    ```json
    {
      "message": "Necesito corregir algo del resumen.",
      "session_id": "...",
      "user": { ... }
    }
    ```

### B. n8n Workflow
1.  El nodo "Router" inicial no detecta un evento especial, por lo que envía el mensaje al **Agente Descubridor**.
2.  El **Agente Descubridor**, gracias a su prompt y al historial de conversación, entenderá el contexto y responderá de forma adecuada.
    *   **Respuesta esperada del agente:**
        ```json
        {
          "next_question": "¡Claro! Dime, ¿qué parte del resumen te gustaría que corrijamos o aclaremos?",
          "extracted_data": {},
          "is_discovery_complete": false
        }
        ```
3.  La conversación continúa en el ciclo de descubrimiento hasta que se genera un nuevo resumen y el usuario lo confirma.

Este diseño crea un flujo de cierre robusto y claro tanto para el usuario como para el sistema.
