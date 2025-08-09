# Plan de Refinamiento: De "Urgencia" a "Sensibilidad al Tiempo"

## 1. Visión General y Justificación

El objetivo de este refinamiento es reemplazar la dimensión subjetiva de **"Urgencia"** por una métrica más objetiva y cuantificable: la **"Sensibilidad al Tiempo"**. Esto se logra cambiando la pregunta de "¿Es urgente?" a **"¿En cuánto tiempo esperas ver los primeros resultados de esta solución?"**.

**Beneficios:**
- **Objetividad:** Elimina la tendencia del usuario a marcar todo como "urgente".
- **Claridad para Planificación:** Proporciona al equipo de desarrollo un plazo esperado, lo cual es más útil para el backlog y la gestión de expectativas.
- **Mejor Scoring:** La puntuación se basa en un compromiso de tiempo concreto, no en una emoción.

---

## 2. Nuevo Modelo: Dimensión "Sensibilidad al Tiempo"

Esta nueva dimensión se basará en las siguientes opciones y su mapeo a puntos de scoring:

| Opción de Plazo Deseado | Mapeo Interno (enum) | Puntos de Scoring (Ejemplo) |
| :--- | :--- | :--- |
| Menos de 1 mes | `menos_1_mes` | 90 |
| Entre 1 y 3 meses | `1_a_3_meses` | 60 |
| Entre 3 y 6 meses | `3_a_6_meses` | 30 |
| Sin fecha definida | `sin_definir` | 10 |

---

## 3. Plan de Implementación: Cambios Requeridos

### A. Agente de IA (Discovery Agent)

1.  **Actualizar System Prompt (`discovery-agent-system-prompt.md`):**
    - **ELIMINAR:** La instrucción de preguntar por la urgencia (`baja`, `media`, `alta`, `crítica`).
    - **AÑADIR:** La nueva instrucción: "Pregunta explícitamente: '¿En cuánto tiempo esperas ver los primeros resultados de esta solución?'. Ofrece las opciones: 'Menos de 1 mes', 'Entre 1 y 3 meses', 'Entre 3 y 6 meses', o 'Sin fecha definida'".

2.  **Actualizar Esquema del Parser (`discovery-agent-parser-schema.json`):**
    - **ELIMINAR:** El campo `urgencia`.
    - **AÑADIR:** Un nuevo campo `plazo_deseado` con su correspondiente `enum`:
      ```json
      "plazo_deseado": {
        "type": "string",
        "description": "El plazo en el que el usuario espera ver los primeros resultados.",
        "enum": ["menos_1_mes", "1_a_3_meses", "3_a_6_meses", "sin_definir"]
      }
      ```

### B. Workflow de n8n

1.  **Nodo "Normalizador":**
    - La lógica de normalización para `urgencia` ya no es necesaria.
    - El nuevo campo `plazo_deseado` ya viene estructurado como un `enum` desde el agente, por lo que no requiere normalización compleja. Se debe asegurar que el campo se pase correctamente al siguiente nodo.

2.  **Nodo "Calcular Score" (Llamada a API):**
    - El payload que se envía al endpoint `/api/analysis/simple-calculate` debe cambiar.
    - **ELIMINAR:** El campo `urgencia` del JSON.
    - **AÑADIR:** El campo `plazo_deseado` con el valor extraído por el agente.

### C. Backend (Next.js API)

1.  **Algoritmo de Scoring (`lib/simple-scoring-algorithm.ts`):**
    - Modificar la función `calculateScore` para que acepte `plazo_deseado` en lugar de `urgencia`.
    - La lógica de cálculo debe usar los puntos definidos en la configuración para el `plazo_deseado`.
      ```typescript
      // Ejemplo de cambio en el código
      // const urgencyPoints = config.urgency_weights[request.urgencia] || 0; // LÍNEA A ELIMINAR
      const timeframePoints = config.timeframe_points[request.plazo_deseado] || 0; // LÍNEA A AÑADIR

      // ... usar timeframePoints en el cálculo del score total
      totalScore += timeframePoints * (config.weights.timeframe || 1);
      ```

2.  **Esquema de Configuración (Base de Datos y API):**
    - El modelo de datos para las configuraciones de scoring debe ser actualizado.
    - **ELIMINAR:** `urgency_weights`.
    - **AÑADIR:** `timeframe_points` como un objeto que mapea las nuevas opciones a puntos.
      ```json
      // Ejemplo de nueva estructura en la configuración
      "timeframe_points": {
        "menos_1_mes": 90,
        "1_a_3_meses": 60,
        "3_a_6_meses": 30,
        "sin_definir": 10
      },
      "weights": {
        "impact": 1.5,
        "frequency": 1.2,
        "timeframe": 1.3, // Anteriormente "urgency"
        "complexity": 1.0,
        "completeness": 0.8
      }
      ```

### D. Frontend (React Components)

1.  **Panel de Configuración (`components/simple-configuration-panel.tsx`):**
    - La UI debe permitir a los administradores configurar los puntos para `timeframe_points` y el peso para `timeframe`.
    - Los campos de "Urgencia" deben ser reemplazados por los de "Sensibilidad al Tiempo".

2.  **Tarjeta de Resumen (`components/request-detail-modal.tsx` o similar):**
    - En la visualización del resumen de la solicitud, el campo "Urgencia" debe ser reemplazado por "Plazo Deseado".
    - Mostrar el valor amigable, no el `enum` (ej. "Menos de 1 mes" en lugar de `menos_1_mes`).

---

## 4. Pasos Recomendados para la Implementación

1.  **Backend Primero:** Actualizar el modelo de datos y el algoritmo de scoring. Esto asegura que la nueva lógica esté lista para recibir datos.
2.  **Agente y n8n:** Modificar los prompts, esquemas y el workflow para que comiencen a enviar el nuevo campo `plazo_deseado`.
3.  **Frontend al Final:** Actualizar los componentes visuales para reflejar el nuevo modelo de datos.

Este enfoque modular minimiza las interrupciones y asegura una transición controlada.
