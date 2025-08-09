# Plan de Costos e Implementación: Portal de Innovación GTTD

## 1. Resumen Ejecutivo

Este documento detalla el plan de costos y la estrategia de implementación para llevar el prototipo del Portal de Innovación a un entorno de producción sostenible, **ajustado para reflejar los costos en Soles (PEN) y asumiendo que el personal de desarrollo es provisto por la UTP.**

El objetivo es proporcionar una visión clara de la inversión requerida en **infraestructura, servicios y gestión externa**. La estrategia se centra en un enfoque ágil, con una implementación por fases que permita entregar valor de forma temprana y continua.

Se estima un costo de implementación (primeros 3 meses) de **S/ 33,000 - S/ 57,000** y un costo recurrente mensual de **S/ 3,400 - S/ 7,500** para la operación y mantenimiento de la plataforma.

*Nota: Todos los costos son estimados y se utiliza un tipo de cambio de referencia de **S/ 3.80 por USD**.*

---

## 2. Desglose de Costos Estimados

### 2.1. Gestión Externa y Consultoría (Opcional)

Dado que el equipo de desarrollo es interno, se puede considerar la contratación de un gestor de proyectos o consultor externo para liderar la fase inicial, asegurar la correcta implementación de la arquitectura y facilitar la adopción de la metodología.

| Rol | Dedicación | Costo Mensual (Est.) | Costo Total (3 Meses) | Responsabilidades Clave |
| :--- | :--- | :--- | :--- | :--- |
| **Gestor de Proyecto / Consultor Externo** | 25-50% | S/ 9,500 - S/ 15,200 | S/ 28,500 - S/ 45,600 | Planificación, supervisión de hitos, aseguramiento de calidad, transferencia de conocimiento al equipo interno. |

### 2.2. Infraestructura y Servicios (Costos Mensuales Recurrentes en PEN)

Estos costos son esenciales para la operación continua de la plataforma.

| Componente | Servicio Recomendado | Plan / Nivel | Costo Mensual (Est. PEN) | Notas |
| :--- | :--- | :--- | :--- | :--- |
| **Hosting Frontend/Backend** | Vercel / Netlify | Pro | S/ 76 - S/ 190 | Despliegue continuo, escalabilidad automática, CDN global. |
| **Base de Datos (PostgreSQL)** | Supabase / Neon / Aiven | Pro | S/ 95 - S/ 285 | Backups automáticos, escalabilidad, pooling de conexiones. |
| **n8n Hosting** | n8n Cloud / DigitalOcean | Growth / Droplet 2-4 vCPU | S/ 380 - S/ 950 | **Crítico.** La opción Cloud simplifica la gestión. Self-host requiere mantenimiento. |
| **API de Modelos de Lenguaje (LLM)** | OpenAI / Anthropic / Google AI | Pago por uso | S/ 760 - S/ 1,900+ | Depende del volumen de solicitudes. Iniciar con un presupuesto y monitorear. |
| **Servicios Adicionales** | | | S/ 190 - S/ 380 | Logging (Sentry), Email (Resend/SendGrid), Monitoreo (UptimeRobot). |
| **Subtotal (Infraestructura)** | | | **S/ 1,501 - S/ 3,705** | |

### 2.3. Resumen de Costos (en PEN)

*   **Costo de Implementación (Primeros 3 meses):**
    *   Gestor Externo (Opcional): S/ 28,500 - S/ 45,600
    *   Infraestructura: S/ 4,503 - S/ 11,115
    *   **Total Estimado (3 meses): S/ 33,003 - S/ 56,715**
*   **Costo Mensual Recurrente (Post-implementación):**
    *   Infraestructura: S/ 1,501 - S/ 3,705
    *   Soporte / Consultoría (Opcional): S/ 1,900 - S/ 3,800
    *   **Total Mensual Estimado: S/ 3,401 - S/ 7,505**

---

## 3. Plan de Implementación (Fases Sugeridas)

Se propone un plan de 12 semanas para la primera versión productiva.

*   **Fase 1: Fundación y MVP (Semanas 1-4)**
    *   **Objetivo:** Desplegar la funcionalidad central en un entorno de producción.
    *   **Hitos:**
        *   Configuración de infraestructura en la nube (Vercel, Supabase, n8n Cloud).
        *   Migración y securización de la base de datos.
        *   Despliegue del flujo de creación de solicitudes y scoring.
        *   Dashboard de líder funcional con datos reales.
        *   Lanzamiento para un grupo piloto de usuarios.

*   **Fase 2: Agentes IA y Flujos Avanzados (Semanas 5-8)**
    *   **Objetivo:** Potenciar la automatización y la inteligencia del sistema.
    *   **Hitos:**
        *   Implementación y afinamiento de los agentes IA (Discovery, Summary).
        *   Workflow de finalización y enrutamiento avanzado en n8n.
        *   Implementación del chat de colaboración interna.
        *   Módulo de reportes y analíticas v1.

*   **Fase 3: Consolidación y Escalabilidad (Semanas 9-12)**
    *   **Objetivo:** Refinar la plataforma basándose en el feedback y prepararla para un uso extendido.
    *   **Hitos:**
        *   Ajuste del modelo de scoring basado en datos reales.
        *   Implementación de vistas diferenciadas y roles de usuario.
        *   Mejoras de rendimiento y seguridad.
        *   Documentación final y capacitación a usuarios clave.
        *   Lanzamiento a toda la organización.

---

## 4. Análisis de Retorno de Inversión (ROI)

La inversión en este portal se justifica a través de:

*   **Reducción de Tiempo:** Automatización de la clasificación y priorización de solicitudes, liberando horas de trabajo manual del equipo GTTD.
*   **Toma de Decisiones Basada en Datos:** El scoring objetivo permite enfocar los recursos en las iniciativas de mayor impacto estratégico.
*   **Visibilidad y Transparencia:** Centralización de todas las solicitudes de innovación, mejorando la comunicación con los stakeholders.
*   **Eficiencia Operativa:** Los agentes IA aceleran el análisis y resumen de propuestas, reduciendo el tiempo de evaluación inicial.

---

## 5. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
| :--- | :--- | :--- | :--- |
| **Costo de APIs LLM Excesivo** | Media | Alto | Implementar caching de respuestas, usar modelos más económicos para tareas simples, establecer presupuestos y alertas de gasto. |
| **Complejidad de n8n** | Media | Medio | Priorizar n8n Cloud para reducir la carga de mantenimiento. Documentar exhaustivamente los workflows. Capacitar al especialista. |
| **Adopción de Usuarios Lenta** | Baja | Medio | Involucrar a los usuarios desde las primeras fases (piloto). Realizar sesiones de capacitación y crear guías de uso claras. |
| **Desviación del Alcance** | Alta | Alto | Mantener un backlog priorizado y gestionado por el Project Manager. Apegarse a los ciclos de desarrollo y re-evaluar prioridades en cada fase. |
