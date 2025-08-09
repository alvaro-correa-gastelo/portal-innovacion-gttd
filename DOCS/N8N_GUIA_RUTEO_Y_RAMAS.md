# Guía de Implementación: Ruteo y Ramas de Agentes en n8n

Este documento detalla los pasos para implementar la lógica de ruteo y las ramas de agentes (Discovery, Summary, Report) en tu workflow de n8n, utilizando la salida del nodo "Combinar datos de sesión".

## Resumen del Flujo

El flujo de datos después de "Combinar datos de sesión" es el siguiente:

1.  **Entrada**: El objeto JSON que ya validamos, con `session_data` (incluyendo `history_summary` y `completeness_score`).
2.  **Clasificación y Ruteo (Nodo Switch)**: Se decide a qué agente enviar la conversación.
3.  **Ejecución de Rama de Agente**: Cada rama (Discovery, Summary, Report) ejecuta su propia lógica.
4.  **Actualización de Estado**: Se actualiza la base de datos (`session_states` y `conversation_messages`).
5.  **Respuesta al Usuario**: Se construye y envía la respuesta final.

---

## Paso 1: Implementar el Ruteo con un Nodo `Switch`

Después de tu nodo "Combinar datos de sesión", añade un nodo `Switch`. Este nodo dirigirá el flujo a la rama correcta sin necesidad de que un "clasificador" modifique el payload.

**Configuración del Nodo `Switch`:**a

- **Property**: `{{ $json.session_data.completeness_score }}`
- **Type**: `Number`

**Routing Rules:**

1.  **Ruta 0 (Summary/Report)**
    - **Operation**: `Larger Or Equal`
    - **Value**: `75`
    - **Salida**: `0` (Esta será la rama para `summary_agent` y `report_sender`).

2.  **Ruta 1 (Discovery)**
    - **Operation**: `Smaller`
    - **Value**: `75`
    - **Salida**: `1` (Esta es la rama para `discovery_agent`).

---

## Paso 2: Implementar las Ramas de Agentes

### A. Rama Discovery (Salida 1 del Switch)

Esta es la rama para conversaciones que aún no tienen suficiente información (`completeness_score < 75`).

**Nodos requeridos:**

1.  **LLM - Discovery Agent (Nodo OpenAI / HTTP Request)**:
    - **Propósito**: Generar una pregunta para obtener más información del usuario.
    - **Prompt (Input)**: Utiliza `session_data.user_query`, `session_data.history_summary` y `session_data.user_profile`.
    - **Salida**: Un texto simple con la pregunta del agente.

2.  **Postgres - Save Assistant Message**:
    - **Propósito**: Guardar la respuesta del agente en la base de datos.
    - **SQL Query**:
      ```sql
      INSERT INTO conversation_messages (message_id, session_id, role, message, agent_name, created_at)
      VALUES (gen_random_uuid(), '{{ $json.session_data.session_id }}', 'assistant', '{{ $json.assistant_response }}', 'discovery_agent', NOW());
      ```
      *Nota: `$json.assistant_response` es la salida del nodo LLM anterior.*

3.  **Postgres - Update Session**:
    - **Propósito**: Actualizar la fecha de la sesión. Opcionalmente, puedes recalcular y actualizar el `completeness_score` aquí.
    - **SQL Query**:
      ```sql
      UPDATE session_states
      SET updated_at = NOW()
      WHERE session_id = '{{ $json.session_data.session_id }}';
      ```

4.  **Set - Build Response**:
    - **Propósito**: Preparar el JSON final de respuesta para el frontend.
    - **Value**:
      ```json
      {
        "response_type": "text",
        "text": "{{ $json.assistant_response }}"
      }
      ```

### B. Rama Summary / Report (Salida 0 del Switch)

Esta rama maneja conversaciones casi completas (`completeness_score >= 75`). Aquí puedes añadir otro `Switch` si necesitas diferenciar entre "generar resumen" y "generar reporte".

**Nodos requeridos para "Summary Preview":**

1.  **LLM - Summary Preview**:
    - **Propósito**: Generar un resumen estructurado de la conversación.
    - **Prompt (Input)**: Utiliza `session_data.history_summary` y `session_data.user_profile`.
    - **Salida**: Un objeto JSON con el resumen. Ej: `{ "title": "...", "sections": [...] }`.

2.  **HTTP Request - Calculate Metrics (Opcional)**:
    - **Propósito**: Llamar a tu API para cálculos adicionales si es necesario.
    - **URL**: `http://localhost:3001/api/analysis/simple-calculate` (o la URL de tu backend).
    - **Method**: `POST`
    - **Body**: `{{ { "session_id": $json.session_data.session_id, "summary": $json.summary_output } }}`
      *Nota: `$json.summary_output` es la salida del LLM anterior.*

3.  **Postgres - Update Session with Summary**:
    - **Propósito**: Actualizar el estado de la sesión con el nuevo resumen.
    - **SQL Query**:
      ```sql
      UPDATE session_states
      SET
        current_stage = 'summary_preview',
        conversation_data = jsonb_set(
          COALESCE(conversation_data, '{}'::jsonb),
          '{last_summary}',
          '{{ JSON.stringify($json.summary_output) }}'::jsonb
        ),
        updated_at = NOW()
      WHERE session_id = '{{ $json.session_data.session_id }}';
      ```

4.  **Postgres - Save Summary Message**:
    - **Propósito**: Guardar el resumen como un mensaje del `summary_agent`.
    - **SQL Query**:
      ```sql
      INSERT INTO conversation_messages (message_id, session_id, role, message, agent_name, created_at)
      VALUES (gen_random_uuid(), '{{ $json.session_data.session_id }}', 'assistant', '{{ JSON.stringify($json.summary_output) }}', 'summary_agent', NOW());
      ```

5.  **Set - Build Rich Response**:
    - **Propósito**: Preparar una respuesta enriquecida para el frontend.
    - **Value**:
      ```json
      {
        "response_type": "rich_summary",
        "summary": "{{ $json.summary_output }}"
      }
      ```

---

## Paso 3: Probar el Flujo End-to-End

Ahora que tienes el frontend en `http://localhost:3000` y el workflow de n8n con la nueva lógica, puedes probarlo.

**Simula una petición desde tu frontend al webhook de n8n.**

**Caso de Prueba 1: Discovery (`u-qa-prof-01`, score 45)**

- **Payload a enviar al webhook de n8n:**
  ```json
  {
    "message": "Hola, sigo con el problema de las notas, ¿alguna idea?",
    "user": { "id": "u-qa-prof-01" }
  }
  ```
- **Resultado Esperado**: El flujo debe tomar la **Ruta 1 (Discovery)** del `Switch`. El `discovery_agent` debe generar una nueva pregunta, guardarla en la BD y devolverla al frontend.

**Caso de Prueba 2: Summary (`u-qa-admin-02`, score 82)**

- **Payload a enviar al webhook de n8n:**
  ```json
  {
    "message": "Ok, creo que ya te di toda la información que necesitabas sobre el reporte.",
    "user": { "id": "u-qa-admin-02" }
  }
  ```
- **Resultado Esperado**: El flujo debe tomar la **Ruta 0 (Summary/Report)**. El `summary_agent` debe generar un resumen, guardarlo en `conversation_data.last_summary` y devolver una respuesta enriquecida (`rich_summary`).

Copia el contenido de este archivo y pégalo en tu editor de n8n para construir el flujo.
