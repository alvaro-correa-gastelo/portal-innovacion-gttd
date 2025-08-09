# Propuesta: Flujo de Aprobación Avanzado con Análisis Técnico

Esta propuesta evoluciona el panel de aprobaciones a un sistema de gestión de ciclo de vida de solicitudes, incorporando un nuevo agente de IA para el análisis técnico y mejorando la visibilidad para todas las partes.

## 1. Visión General del Nuevo Flujo

El flujo ahora tendrá tres actores principales: el **Solicitante**, un **Agente de IA Técnico** y el **Líder de Dominio**.

`Solicitante confirma resumen` -> `Agente Técnico analiza` -> `Líder evalúa y decide` -> `Solicitante ve el resultado`

---

## 2. Ciclo de Vida de la Solicitud: Nuevos Estados

Para manejar el nuevo flujo, proponemos los siguientes estados para una solicitud:

-   `pending_technical_analysis`: La solicitud fue confirmada por el usuario y está esperando el análisis del agente de IA.
-   `pending_approval`: El análisis técnico está completo. La solicitud está en la bandeja de entrada del líder, esperando ser revisada.
-   `in_evaluation`: El líder ha visto la solicitud y la ha marcado activamente como "en revisión".
-   `on_hold`: El líder ha puesto la solicitud en espera (stand-by), quizás por falta de recursos o para re-evaluarla en el futuro.
-   `approved`: La solicitud ha sido aprobada.
-   `rejected`: La solicitud ha sido rechazada.

---

## 3. El Nuevo "Agente de Análisis Técnico"

Este es el componente central de la nueva propuesta.

-   **Disparador:** En n8n, este agente se ejecutará **inmediatamente después** de que el usuario confirme el resumen (evento `SUMMARY_CONFIRMED`).
-   **Misión:** Actuar como un arquitecto de soluciones o un líder técnico. Su trabajo es tomar la solicitud del usuario y enriquecerla con una capa de análisis técnico destinada exclusivamente al líder.
-   **Prompt (Ejemplo):**
    > "Eres un Arquitecto de Soluciones Senior. Analiza la siguiente solicitud de usuario y genera un informe técnico conciso. Considera la viabilidad, posibles riesgos y el esfuerzo estimado. Basado en el ecosistema UTP (Canvas, SAP, PeopleSoft), sugiere una posible pila tecnológica."
-   **Salida:** El agente generará un objeto JSON con el análisis técnico.

---

## 4. Sugerencia de Base de Datos

Para almacenar esta nueva información, sugiero **modificar la tabla `requests` existente**. Es más simple y eficiente para este MVP que crear una nueva tabla.

**Cambios en la tabla `requests`:**

1.  **Modificar la columna `status`:** Asegurarse de que pueda aceptar los nuevos valores (`pending_technical_analysis`, `in_evaluation`, etc.).
2.  **Añadir columna `leader_comments` (TEXT):** Para guardar los comentarios que el líder añade al aprobar o rechazar.
3.  **Añadir columna `technical_analysis` (JSONB):** Para almacenar el objeto JSON completo generado por el nuevo Agente Técnico.

Esta estructura mantiene toda la información de una solicitud en un solo lugar, facilitando las consultas.

---

## 5. Cambios en la Interfaz de Usuario

### A. Panel del Líder (`/dashboard`)
-   El panel ahora mostrará las solicitudes con sus nuevos estados (ej. `pending_approval`, `in_evaluation`).
-   El **Modal de Detalle** se dividirá en dos secciones:
    1.  **Información del Solicitante:** Los datos originales de la conversación.
    2.  **Análisis Técnico (Visible solo para el líder):** Una sección claramente diferenciada que muestra la salida del Agente Técnico (riesgos, complejidad, stack sugerido, etc.).
-   El modal incluirá un **campo de texto para comentarios** y los nuevos botones de acción: "Poner en Evaluación", "Dejar en Stand-by", "Aprobar", "Rechazar".

### B. Nuevo Portal del Solicitante (`/my-requests`)
-   Crearemos una nueva página donde los usuarios logueados puedan ver el historial de **sus propias solicitudes**.
-   Mostrará una lista de sus solicitudes y el **estado actual** de cada una (ej. "En Evaluación", "Aprobado").
-   Si una solicitud está "Aprobada" o "Rechazada", también mostrará los **comentarios del líder**, proveyendo feedback valioso.

---

## 6. Flujo Actualizado en n8n

La "Rama de Finalización" que diseñamos antes ahora se verá así:

1.  **Router Principal** detecta el evento `SUMMARY_CONFIRMED`.
2.  **(NUEVO) Agente de Análisis Técnico:** Se llama a este nuevo agente con los datos confirmados por el usuario.
3.  **Guardar Solicitud en BD:** La query `INSERT` en la tabla `requests` ahora guardará también el `technical_analysis` (del nuevo agente) y establecerá el `status` inicial como `pending_approval`.
4.  **Notificar al Líder:** La notificación ahora simplemente le avisa que tiene una nueva solicitud en su panel: `http://localhost:3000/dashboard`.
5.  **Cerrar Sesión:** Se marca la sesión de chat como `completed`.
6.  **Responder al Usuario:** Se le envía el mensaje final de confirmación con su número de folio.

Esta propuesta crea un ciclo completo y transparente. ¿Qué te parece este plan para evolucionar el sistema?
