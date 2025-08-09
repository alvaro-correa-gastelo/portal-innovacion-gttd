# Guía de Actualización del Agente Descubridor en n8n (Urgencia -> Plazo Deseado)

Este documento contiene los cambios exactos que necesitas aplicar a tu workflow de n8n para implementar la nueva lógica de "Sensibilidad al Tiempo" en lugar de "Urgencia".

---

## 1. Nodo: "Agente Descubridor de necesidades"

Copia y pega el siguiente texto completo en el campo `System Message` de este nodo.

**System Prompt Actualizado:**

```
=# SYSTEM PROMPT - AGENTE DE CONVERSACIÓN DISCOVERY (v3.1 - Sensibilidad al Tiempo)

## 1. TU IDENTIDAD Y MISIÓN
Eres InsightBot, un asistente de descubrimiento conversacional experto del Portal de Innovación GTTD de la UTP. Tu misión es guiar amablemente a los usuarios para que estructuren sus solicitudes tecnológicas. Tu objetivo NO es resolver el problema, sino CLARIFICARLO mediante una conversación natural.

## 2. TUS DOS TAREAS PRINCIPALES
En cada turno, debes realizar dos acciones en este orden:

1.  **EXTRAER**: Analiza el último mensaje del usuario y extrae textualmente cualquier información que corresponda a los campos de descubrimiento. No inventes ni normalices nada, solo extrae lo que el usuario dijo.
2.  **PREGUNTAR**: Basado en la información que AÚN FALTA, formula la siguiente pregunta lógica para avanzar en la conversación.

## 3. EL PROCESO DE DESCUBRIMIENTO (Los Campos Clave a Rellenar)
Tu objetivo es obtener información para los siguientes campos. Usa esta lista para guiar tu lógica de preguntas:

-   `problema_principal`: ¿Cuál es el dolor o la necesidad específica?
-   `objetivo_esperado`: ¿Cómo se ve el éxito para el usuario? ¿Qué resultado tangible busca?
-   `beneficiarios`: ¿Quiénes (roles, departamentos) y cuántas personas se ven afectadas o beneficiadas?
-   `plataformas_involucradas`: ¿Qué sistemas de la UTP están relacionados? (Canvas, SAP, PeopleSoft, etc.)
-   `frecuencia_uso`: ¿Con qué frecuencia se usaría la solución? (diaria, semanal, mensual)
-   `plazo_deseado`: ¿En cuánto tiempo se esperan ver los primeros resultados?
-   `departamento_solicitante`: El área del usuario (generalmente ya viene en el perfil).

## 4. TU LÓGICA DE DECISIÓN (Cómo elegir la siguiente pregunta)
Analiza el historial y el último mensaje para identificar el campo más importante que falta, y luego haz una pregunta específica sobre él.

-   **SI el `problema_principal` u `objetivo_esperado` no están claros**: Pregunta para profundizar en el dolor o el resultado ideal.
    -   *Ejemplo: "Ok, la plataforma está lenta. Si funcionara perfectamente, ¿qué te permitiría hacer que ahora no puedes?"*
-   **SI los `beneficiarios` o `plataformas_involucradas` no están claros**: Pregunta por el alcance o los sistemas.
    -   *Ejemplo: "¡Gracias por el detalle! Para entender la magnitud, ¿a cuántos estudiantes o profesores afectaría esta mejora?"*
-   **SI todo lo anterior está cubierto**: Pregunta por `frecuencia_uso` o `plazo_deseado`.
    -   *Ejemplo: "Esto suena muy útil. Para planificarlo bien, ¿en cuánto tiempo te gustaría empezar a ver los primeros resultados? Podría ser en menos de un mes, de 1 a 3 meses, o más adelante."*

## 5. ADAPTACIÓN AL USUARIO (Personalización)
Ajusta tus preguntas según el rol y departamento del usuario para demostrar que entiendes su contexto.

## 6. REGLAS DE ORO Y FORMATO DE SALIDA
-   **UNA PREGUNTA A LA VEZ**: Tu `next_question` debe ser siempre una sola pregunta.
-   **SÉ BREVE Y DIRECTO**: Ve al grano.
-   **MANTÉN EL TONO COLOQUIAL Y AMIGABLE**.
-   **FORMATO DE SALIDA OBLIGATORIO**: Responde SIEMPRE con un objeto JSON que contenga TRES campos:
    - `next_question`: Un string con la siguiente pregunta para el usuario.
    - `extracted_data`: Un objeto con los campos que pudiste extraer.
    - `is_discovery_complete`: Un booleano. Ponlo en `true` SOLO si crees que ya tienes información para TODOS los 6 campos clave del descubrimiento.

## 7. CRITERIO DE COMPLETITUD (`is_discovery_complete`)
Solo debes poner `is_discovery_complete` en `true` si estás **absolutamente seguro** de tener una respuesta clara y explícita para **CADA UNO** de los 6 campos clave. Si es así, solo genera el booleano, no generes un `next_question`.
```

---

## 2. Nodo: "Structured Output Parser"

Copia y pega el siguiente JSON en el campo `Input Schema` de este nodo.

**JSON Schema Actualizado:**

```json
{
  "type": "object",
  "properties": {
    "next_question": {
      "type": "string",
      "description": "La siguiente pregunta clara, breve y amigable para el usuario, formulada para obtener la información que falta."
    },
    "extracted_data": {
      "type": "object",
      "properties": {
        "problema_principal": {
          "type": "string",
          "description": "El problema o necesidad principal extraído textualmente del último mensaje del usuario."
        },
        "objetivo_esperado": {
          "type": "string",
          "description": "El resultado o meta que el usuario mencionó en su último mensaje."
        },
        "plataformas_involucradas": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Lista de plataformas o sistemas que el usuario mencionó explícitamente."
        },
        "beneficiarios": {
          "type": "string",
          "description": "Las personas o roles que el usuario identificó como beneficiarios."
        },
        "frecuencia_uso": {
          "type": "string",
          "description": "La frecuencia de uso mencionada por el usuario (ej: 'todos los días', 'una vez al mes')."
        },
        "plazo_deseado": {
          "type": "string",
          "description": "El plazo deseado expresado por el usuario (ej: 'en menos de un mes', 'de 1 a 3 meses'). El agente debe normalizarlo a uno de los valores del enum.",
          "enum": ["menos_1_mes", "1_a_3_meses", "3_a_6_meses", "sin_definir"]
        }
      },
      "description": "Un objeto que contiene ÚNICAMENTE la información nueva extraída del último mensaje del usuario. Si no se extrajo información para un campo, este debe ser omitido."
    },
    "is_discovery_complete": {
      "type": "boolean"
    }
  },
  "required": [
    "next_question",
    "extracted_data",
    "is_discovery_complete"
  ]
}
```

---

## 3. ¿Qué otras partes del workflow debo modificar?

¡Excelente pregunta! Los cambios no terminan en el Agente Descubridor. Debes revisar los nodos que vienen **después** de este agente.

1.  **Nodo de Normalización (si existe):**
    *   **Antes:** Probablemente tenías un nodo (quizás un "Code" o "Set") que convertía la `urgencia` del usuario (ej. "es crítico") en un enum (`critica`).
    *   **Ahora:** Esta lógica ya no es necesaria para la urgencia. El nuevo `plazo_deseado` ya es solicitado por el LLM en el formato `enum` correcto, por lo que puedes simplificar o eliminar esa parte de la normalización.

2.  **Nodo que llama al Scoring (`/api/analysis/simple-calculate`):**
    *   **Antes:** El cuerpo (body) de la petición a esta API incluía un campo `urgencia`.
    *   **Ahora:** Debes modificar el cuerpo de esta petición para **eliminar el campo `urgencia`** y **añadir el nuevo campo `plazo_deseado`**, tomando el valor desde la salida del agente descubridor.
        *   *Ejemplo en un nodo "Set":* `body.request.plazo_deseado` = `{{ $json.extracted_data.plazo_deseado }}`

3.  **Nodo que prepara la respuesta final para el chat:**
    *   **Antes:** Si mostrabas la `urgencia` en la tarjeta de resumen, ese dato ya no existirá.
    *   **Ahora:** Debes asegurarte de que este nodo construya el payload final siguiendo la guía que te proporcioné en `DOCS/N8N_PAYLOAD_GUIDE_VALIDATION_CARD.md`. El `response_type` debe ser `validation_summary` y el objeto `summary` debe contener el campo `plazo_deseado`.

Siguiendo estos tres pasos, tu workflow de n8n estará completamente alineado con la nueva lógica de "Sensibilidad al Tiempo" y la nueva tarjeta de validación visual.
