# Marco de Evaluación y Priorización de Solicitudes (InsightBot)

## 1. Propósito y Filosofía

El sistema de **Scoring, Clasificación y Priorización** de InsightBot está diseñado para transformar conversaciones en solicitudes estructuradas y evaluadas de forma **objetiva, consistente y transparente**.

Nuestra filosofía se basa en tres pilares:

- **Determinismo:** El mismo input siempre produce el mismo output. Eliminamos la subjetividad y la variabilidad de un LLM para el scoring final.
- **Configurabilidad:** El modelo es flexible. Los líderes de dominio pueden ajustar los pesos y umbrales sin tocar una línea de código, adaptando el sistema a las prioridades cambiantes del negocio.
- **Transparencia:** El porqué de cada puntuación es auditable. El sistema puede explicar qué factores influyeron más en la evaluación final.

---

## 2. La Matriz de Scoring: Las 5 Dimensiones Clave

Cada solicitud se evalúa a través de cinco dimensiones fundamentales. La combinación ponderada de estas dimensiones genera un **Score Total (0-100)**.

| Dimensión | Pregunta Clave | ¿Qué Medimos? | Ejemplo de Puntuación Alta |
| :--- | :--- | :--- | :--- |
| 🎯 **Impacto** | ¿A cuántos y a quiénes afecta? | Alcance y criticidad de los beneficiarios. | Afecta a toda la organización o a un proceso de negocio crítico (ej. facturación). |
| 🔄 **Frecuencia** | ¿Qué tan a menudo ocurre el problema? | Periodicidad del dolor o de la oportunidad. | El problema ocurre diariamente, bloqueando operaciones continuas. |
| ⏳ **Sensibilidad al Tiempo** | ¿Cuándo se necesitan resultados? | Plazo esperado para la entrega de valor. | Se requieren resultados en menos de un mes para una campaña crítica. |
| 🧩 **Complejidad** | ¿Qué tan grande es el esfuerzo? | Alcance técnico y operativo. Plataformas involucradas. | Involucra múltiples sistemas core (SAP, Canvas) y requiere desarrollo nuevo. |
| ✅ **Completitud** | ¿Está clara la solicitud? | Calidad y detalle de la información proporcionada. | El problema, objetivo y métricas de éxito están claramente definidos. |

---

## 3. El Algoritmo de Scoring

El `total_score` se calcula como una suma ponderada de los puntos obtenidos en cada dimensión.

`Total Score = (Puntos_Impacto * Peso_Impacto) + (Puntos_Frecuencia * Peso_Frecuencia) + (Puntos_Sensibilidad_Tiempo * Peso_Sensibilidad_Tiempo) + ...`

- **Puntos (0-100):** Se asignan a cada dimensión basados en reglas predefinidas.
  - *Ejemplo de Impacto:* `1-10 usuarios = 20 pts`, `11-50 usuarios = 40 pts`, `>50 usuarios = 80 pts`.
- **Pesos (0.0 - 2.0):** Multiplicadores que reflejan la importancia estratégica de cada dimensión. Se configuran en el panel de administración.
  - *Ejemplo de Pesos:* Si el **Impacto** es lo más importante, su peso podría ser `1.5`, mientras que la **Completitud** podría tener un peso de `0.8`.

Este cálculo se realiza en el endpoint `/api/analysis/simple-calculate`, asegurando una lógica centralizada y consistente.

---

## 4. Clasificación: ¿Proyecto o Requerimiento?

Una vez calculado el `total_score`, la solicitud se clasifica automáticamente.

- **Proyecto:** Una iniciativa de alto impacto y complejidad que probablemente requiere un equipo dedicado y un ciclo de vida formal.
- **Requerimiento:** Una solicitud más pequeña y acotada, que puede ser manejada por un equipo de soporte o en un ciclo de desarrollo más corto.

La decisión se toma con un umbral configurable:

```json
// Ejemplo de configuración activa
{
  "project_min_score": 75
}
```

- Si `total_score >= 75` **=>** `clasificacion = "proyecto"`
- Si `total_score < 75` **=>** `clasificacion = "requerimiento"`

---

## 5. Priorización: P1, P2, P3, P4

Finalmente, asignamos un nivel de prioridad para guiar la asignación de recursos. Esto también se basa en umbrales sobre el `total_score`.

| Prioridad | Nivel | Descripción | Rango de Score (Ejemplo) |
| :--- | :--- | :--- | :--- |
| **P1** | Crítica | Atención inmediata. Impacto masivo o bloqueo crítico. | `score >= 90` |
| **P2** | Alta | Prioridad alta. Iniciativa estratégica o problema grave. | `75 <= score < 90` |
| **P3** | Media | Importante, pero no bloqueante. Planificar en el backlog. | `50 <= score < 75` |
| **P4** | Baja | Oportunidad de mejora o bajo impacto. Atender si hay recursos. | `score < 50` |

Estos umbrales (`priority_p1_min`, `priority_p2_min`, etc.) son totalmente configurables.

---

## 6. Flujo del Proceso: De la Conversación a la Decisión

1.  **Descubrimiento (Agente IA):** El bot conversa con el usuario para extraer la información clave de las 5 dimensiones.
2.  **Normalización:** El sistema limpia y estandariza los datos (ej. "muy urgente" se convierte en `urgencia: "critica"`).
3.  **Scoring:** El algoritmo calcula el `total_score` usando la configuración activa.
4.  **Clasificación y Priorización:** Se aplican los umbrales para determinar si es `proyecto`/`requerimiento` y su prioridad `P1-P4`.
5.  **Resumen Enriquecido:** El resultado se presenta al usuario y a los stakeholders en una tarjeta visual, listo para la toma de decisiones.

Este marco asegura que cada solicitud sea evaluada con el mismo rigor, alineando los esfuerzos de desarrollo con el valor real para el negocio.
