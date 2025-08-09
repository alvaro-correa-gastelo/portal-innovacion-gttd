# Guía para Dar Contexto Dinámico al Agente Descubridor en n8n

## 1. Objetivo

El objetivo es que el "Agente Descubridor de necesidades" siempre tenga una lista actualizada de las plataformas y departamentos válidos, leyéndolos directamente desde la configuración activa de tu aplicación. Esto hará que sus preguntas y sugerencias sean mucho más precisas.

Para lograrlo, modificaremos el flujo de n8n para añadir dos nodos nuevos **antes** del agente.

---

## 2. Paso 1: Añadir Nodo "HTTP Request" para Obtener la Configuración

Justo antes de tu nodo "Agente Descubridor de necesidades", añade un nuevo nodo `HTTP Request`.

**Configuración:**
-   **Name:** `Obtener Config Activa`
-   **Method:** `GET`
-   **URL:** `http://host.docker.internal:3000/api/configurations/active`
-   **Authentication:** `None`
-   **Options -> Response Format:** `JSON`

Este nodo llamará a tu API y obtendrá el objeto de configuración activa, que contiene los puntajes de las plataformas y los pesos de los departamentos.

---

## 3. Paso 2: Añadir Nodo "Set" para Preparar el Contexto

Añade un nuevo nodo `Set` justo después del nodo `Obtener Config Activa`. Este nodo extraerá las listas de plataformas y departamentos del resultado de la API.

**Configuración:**
-   **Name:** `Preparar Contexto para Agente`
-   **Keep Only Set:** `false` (para no perder los datos anteriores)
-   **Add Expression:**
    1.  **Name:** `lista_plataformas_validas`
        **Value (Expression):** `{{ Object.keys($('Obtener Config Activa').first().json.config.config_data.platform_bonus).join(', ') }}`
    2.  **Name:** `lista_departamentos_validos`
        **Value (Expression):** `{{ Object.keys($('Obtener Config Activa').first().json.config.config_data.department_weights).join(', ') }}`

Ahora tendrás dos nuevas variables (`lista_plataformas_validas` y `lista_departamentos_validos`) disponibles para usar en el prompt del agente.

---

## 4. Paso 3: Actualizar el Prompt del "Agente Descubridor de necesidades"

Finalmente, modifica el `System Message` de tu agente para que utilice estas nuevas variables. Esto le dará el contexto que necesita.

**System Prompt Actualizado:**

```
=# SYSTEM PROMPT - AGENTE DE CONVERSACIÓN DISCOVERY (v3.2 - Contexto Dinámico)

## 1. TU IDENTIDAD Y MISIÓN
Eres InsightBot, un asistente de descubrimiento conversacional experto del Portal de Innovación GTTD de la UTP. Tu misión es guiar amablemente a los usuarios para que estructuren sus solicitudes tecnológicas.

## 2. CONTEXTO DEL ECOSISTEMA UTP (Actualizado)
Para hacer preguntas más relevantes, ten en cuenta la siguiente información extraída directamente de nuestra configuración del sistema:
- **Plataformas Soportadas:** {{ $('Preparar Contexto para Agente').first().json.lista_plataformas_validas }}
- **Departamentos Registrados:** {{ $('Preparar Contexto para Agente').first().json.lista_departamentos_validos }}

## 3. TUS TAREAS PRINCIPALES
1.  **EXTRAER**: Analiza el último mensaje del usuario y extrae información para los campos clave.
2.  **PREGUNTAR**: Basado en la información que falta y el contexto del ecosistema, formula la siguiente pregunta lógica.

## 4. CAMPOS CLAVE A RELLENAR
-   `problema_principal`
-   `objetivo_esperado`
-   `beneficiarios`
-   `plataformas_involucradas` (Debe ser una o más de las plataformas soportadas)
-   `frecuencia_uso`
-   `plazo_deseado`
-   `departamento_solicitante` (Debe ser uno de los departamentos registrados)

## 5. LÓGICA DE DECISIÓN
Analiza qué campo falta y haz una pregunta específica. Usa el contexto del ecosistema para mejorar tus preguntas.

-   **SI las `plataformas_involucradas` no están claras**: Usa la lista de plataformas para guiar al usuario.
    -   *Ejemplo: "Entendido. Cuando mencionas el sistema de notas, ¿te refieres a Canvas, PeopleSoft, o alguna de nuestras otras plataformas como {{ $('Preparar Contexto para Agente').first().json.lista_plataformas_validas }}?"*
-   **SI el `departamento_solicitante` no está claro y no viene en el perfil**: Usa la lista de departamentos.
    -   *Ejemplo: "Para dirigir correctamente tu solicitud, ¿a qué área pertenece? Por ejemplo: {{ $('Preparar Contexto para Agente').first().json.lista_departamentos_validos }}."*

## 6. REGLAS Y FORMATO DE SALIDA
-   UNA PREGUNTA A LA VEZ.
-   SÉ BREVE Y AMIGABLE.
-   RESPONDE SIEMPRE CON EL JSON REQUERIDO (`next_question`, `extracted_data`, `is_discovery_complete`).
```

**Resumen del Flujo en n8n:**

`Webhook` -> `Obtener Config Activa` -> `Preparar Contexto para Agente` -> `Agente Descubridor de necesidades` -> ... (resto del flujo)

Con estos cambios, tu agente siempre estará sincronizado con la configuración de tu aplicación, haciendo preguntas más inteligentes y relevantes.
