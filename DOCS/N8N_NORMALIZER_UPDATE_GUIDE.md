# Guía de Actualización del Nodo Normalizador en n8n

Este documento detalla los cambios necesarios en tu **Normalizador de Datos** para que sea compatible con el campo `plazo_deseado` y la nueva lógica de scoring.

---

### 1. Nodo: "Normalizador de Datos"

Copia y pega el siguiente texto completo en el campo `Text` (el prompt) de tu nodo "Normalizador de Datos".

**Prompt Actualizado:**

```
=# Tarea: Normaliza el siguiente objeto JSON.
{{ JSON.stringify($('Agente Descubridor de necesidades').first().json.output.extracted_data) }}

=# Usa estas reglas de mapeo:
- plataformas_involucradas: {{ JSON.stringify($('Obtener configuraciones').first().json.get_active_scoring_config.valid_enums.plataformas_involucradas) }}
- departamento_solicitante: {{ JSON.stringify($('Obtener configuraciones').first().json.get_active_scoring_config.valid_enums.departamento_solicitante) }}
- frecuencia_uso: {{ JSON.stringify($('Obtener configuraciones').first().json.get_active_scoring_config.valid_enums.frecuencia_uso) }}
- plazo_deseado:
  - Si contiene "menos de un mes" o "inmediato" -> "menos_1_mes"
  - Si contiene "1 a 3 meses" -> "1_a_3_meses"
  - Si contiene "3 a 6 meses" -> "3_a_6_meses"
  - Si no está definido o no es claro -> "sin_definir"

=# Instrucciones Adicionales:
- Responde únicamente con el objeto JSON normalizado.
- Omite campos del JSON final si no puedes mapearlos o si su valor es nulo.
- No incluyas el campo "urgencia", ya no se utiliza.
```

**Cambios Clave en este Prompt:**
-   Se eliminó la regla para `urgencia`.
-   Se añadió una nueva regla clara y específica para `plazo_deseado`, indicando cómo convertir el lenguaje natural del usuario al `enum` que espera el backend.

---

### 2. Nodo: "Structured Output Parser2" (El parser del Normalizador)

Copia y pega el siguiente JSON en el campo `Input Schema` de este nodo.

**JSON Schema Actualizado:**

```json
{
  "type": "object",
  "properties": {
    "problema_principal": { "type": "string" },
    "objetivo_esperado": { "type": "string" },
    "beneficiarios": { "type": "string" },
    "plataformas_involucradas": { "type": "array", "items": { "type": "string" } },
    "departamento_solicitante": { "type": "string" },
    "frecuencia_uso": {
      "type": "string",
      "enum": ["diario", "semanal", "mensual", "esporadico"]
    },
    "plazo_deseado": {
      "type": "string",
      "enum": ["menos_1_mes", "1_a_3_meses", "3_a_6_meses", "sin_definir"]
    }
  },
  "description": "Objeto con los datos completamente normalizados y listos para el scoring."
}
```

**Cambios Clave en este Schema:**
-   Se eliminó el campo `urgencia`.
-   Se añadió el campo `plazo_deseado` con su `enum` correspondiente. Este es el formato final que consumirán los siguientes nodos.

---

### 3. Recordatorio: ¿Qué otras partes del workflow debo modificar?

Ahora que el **Normalizador** está actualizado, debes asegurarte de que los nodos que vienen **después** usen su salida correctamente.

1.  **Nodo que Llama al Scoring (`/api/analysis/simple-calculate`):**
    *   Confirma que el `body` de la petición a la API se construye usando la salida del **Normalizador**, no la del Descubridor.
    *   El objeto `request` que envías a la API debe contener `plazo_deseado` y **no** debe contener `urgencia`.

2.  **Nodo que Prepara la Respuesta para el Chat (Tarjeta de Validación):**
    *   Este nodo también debe usar la salida del **Normalizador**.
    *   Debe construir el payload para el frontend siguiendo la guía en `DOCS/N8N_PAYLOAD_GUIDE_VALIDATION_CARD.md`.
    *   Asegúrate de que el `response_type` sea `validation_summary` y que el objeto `summary` contenga el campo `plazo_deseado` normalizado.

Al realizar estos ajustes, tu workflow estará completamente actualizado para manejar la nueva lógica de "Sensibilidad al Tiempo" de forma robusta.
