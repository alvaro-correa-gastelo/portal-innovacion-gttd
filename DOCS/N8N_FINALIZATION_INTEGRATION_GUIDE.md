# Guía de Integración del Flujo de Finalización en n8n

Este documento te guiará para integrar la lógica de finalización de solicitudes en tu workflow `InsightBot AI v2` de forma segura y sin interrumpir el flujo existente.

## 1. Visión General del Cambio

Vamos a insertar un nodo **Switch** justo después de tu **Webhook** inicial. Este actuará como un router principal.

**Flujo Actual (Simplificado):**
`Webhook` -> `User Profile Data` -> `(Toda la lógica de sesión y agentes)`

**Nuevo Flujo (Con Router):**

```
                      ┌───────────────────────────┐
                      │  [RAMA DE FINALIZACIÓN]   │
                      │ (Nuevos Nodos)            │
                      └───────────────────────────┘
                     /
                    / (Si el usuario confirma)
                   /
Webhook ──> Router Principal
                   \\
                    \\ (Resto de la conversación)
                     \\
                      v
                      User Profile Data ──> (Todo tu flujo existente)
```

---

## 2. Paso 1: Añadir el "Router Principal"

1.  **Añade un nuevo nodo `Switch`** y colócalo entre tu nodo `Webhook` y tu nodo `User Profile Data`.
2.  **Nombra** a este nuevo nodo: `Router Principal de Eventos`.
3.  **Conecta** la salida del `Webhook` a la entrada del `Router Principal de Eventos`.
4.  **Conecta** la salida por defecto (la primera) del `Router Principal de Eventos` a la entrada del `User Profile Data`.

Ahora, configura las reglas del **Router**:

-   **Routing Rules:** Añade 1 regla.
-   **Rule 1:**
    -   **Name:** `Finalizar Solicitud`
    -   **Conditions -> Add Condition:**
        -   **First Value:** `{{ $json.body.event.type }}`
        -   **Operation:** `String -> Equal`
        -   **Second Value:** `SUMMARY_CONFIRMED`

Esto crea una segunda salida en tu Router. Todo lo que no sea una confirmación seguirá el camino por defecto hacia tu flujo actual. La nueva salida `Finalizar Solicitud` es donde construiremos la nueva rama.

---

## 3. Paso 2: Construir la Rama de Finalización

Ahora, desde la nueva salida `Finalizar Solicitud` del Router, añade los siguientes nodos en secuencia.

### Nodo 1: Obtener Datos de la Sesión
-   **Tipo:** `Postgres`
-   **Nombre:** `Obtener Sesión para Finalizar`
-   **Acción:** `Execute Query`
-   **Query:**
    ```sql
    SELECT conversation_data, user_id FROM session_states WHERE session_id = '{{ $json.body.session_id }}' LIMIT 1;
    ```
    *Este nodo es crucial para recuperar toda la información recopilada antes de guardarla.*

### Nodo 2: Guardar Solicitud en la Base de Datos
-   **Tipo:** `Postgres`
-   **Nombre:** `Guardar Solicitud Final`
-   **Acción:** `Execute Query`
-   **Query:**
    ```sql
    INSERT INTO requests (
        session_id,
        user_id,
        titulo_solicitud,
        problema_principal,
        objetivo_esperado,
        plataformas_involucradas,
        beneficiarios,
        frecuencia_uso,
        plazo_deseado,
        departamento_solicitante,
        status
    ) VALUES (
        '{{ $json.body.session_id }}',
        '{{ $('Obtener Sesión para Finalizar').first().json.user_id }}',
        '{{ $('Obtener Sesión para Finalizar').first().json.conversation_data.titulo_solicitud }}',
        '{{ $('Obtener Sesión para Finalizar').first().json.conversation_data.problema_principal }}',
        '{{ $('Obtener Sesión para Finalizar').first().json.conversation_data.objetivo_esperado }}',
        '{{ JSON.stringify($('Obtener Sesión para Finalizar').first().json.conversation_data.plataformas_involucradas) }}'::jsonb,
        '{{ $('Obtener Sesión para Finalizar').first().json.conversation_data.beneficiarios }}',
        '{{ $('Obtener Sesión para Finalizar').first().json.conversation_data.frecuencia_uso }}',
        '{{ $('Obtener Sesión para Finalizar').first().json.conversation_data.plazo_deseado }}',
        '{{ $('Obtener Sesión para Finalizar').first().json.conversation_data.departamento_solicitante }}',
        'pending_approval'
    )
    RETURNING id;
    ```
    *Esta query inserta la solicitud y devuelve su nuevo ID (folio).*

### Nodo 3: Notificar al Líder (Ejemplo con Email)
-   **Tipo:** `Send Email` (o el que uses: Teams, Slack, etc.)
-   **Nombre:** `Notificar al Líder`
-   **To:** `lider.gttd@utp.edu.pe`
-   **Subject:** `Nueva Solicitud de Innovación (#{{ $('Guardar Solicitud Final').first().json.id }})`
-   **Text:**
    > Ha llegado una nueva solicitud de {{ $('Obtener Sesión para Finalizar').first().json.conversation_data.departamento_solicitante }}.
    > Título: {{ $('Obtener Sesión para Finalizar').first().json.conversation_data.titulo_solicitud }}
    > Por favor, revísala en el panel de aprobaciones.

### Nodo 4: Cerrar la Sesión en la Base de Datos
-   **Tipo:** `Postgres`
-   **Nombre:** `Cerrar Sesión`
-   **Acción:** `Execute Query`
-   **Query:**
    ```sql
    UPDATE session_states SET status = 'completed' WHERE session_id = '{{ $json.body.session_id }}';
    ```

### Nodo 5: Responder al Usuario con Confirmación Final
-   **Tipo:** `Respond to Webhook`
-   **Nombre:** `Respuesta de Confirmación Final`
-   **Respond With:** `First item`
-   **Source:** `From Node -> Construir Respuesta Final` (ver abajo)

Para que este último nodo funcione, añade un nodo `Set` justo antes de él:
-   **Tipo:** `Set`
-   **Nombre:** `Construir Respuesta Final`
-   **Valores:**
    -   `response_type` (String): `text`
    -   `text` (String): `¡Listo! Tu solicitud ha sido enviada con el folio #{{ $('Guardar Solicitud Final').first().json.id }}. Recibirás una notificación cuando sea revisada. ¡Gracias por tu aporte!`
    -   `session_id` (String): `{{ $json.body.session_id }}`

---

Con esta estructura, tu workflow manejará de forma segura tanto la continuación de las conversaciones como la finalización de las solicitudes confirmadas.
