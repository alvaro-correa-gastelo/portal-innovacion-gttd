# Arquitectura de la Base de Datos - InsightBot

*Última actualización: 2025-08-07*

## 1. Análisis del Esquema Actual

Basado en los scripts que proporcionaste, aquí está el estado actual de tus tablas:

### Tablas en Uso Activo por el Flujo de InsightBot:
-   **`session_states`**: Correcto. Es el corazón del bot, almacena el estado de cada conversación.
-   **`conversation_messages`**: Correcto. Guarda cada mensaje intercambiado, esencial para el historial.
-   **`scoring_configurations`**: Correcto. Almacena las reglas de negocio que usa el panel de configuración y el sistema de scoring.
-   **`configuration_audit`**: Correcto. Guarda un registro de quién activa cada configuración.

### Tablas No Utilizadas por el Flujo Actual:
-   **`report_templates`**: Esta tabla **no está siendo utilizada** por ninguno de los flujos que hemos diseñado (descubrimiento, scoring, finalización). Parece ser parte de una funcionalidad de generación de reportes en PDF/HTML que no está implementada. **Sugerencia:** Si no tienes otros planes para ella, podrías considerar eliminarla para simplificar el esquema.

### Tablas Faltantes para el Flujo Avanzado:
-   **`requests`**: Esta es la tabla más importante que **necesitamos crear**. Almacenará las solicitudes una vez que el usuario las confirma, convirtiéndose en el registro permanente para el panel del líder.

---

## 2. Script para la Nueva Tabla `requests`

Esta es la estructura que propongo para la tabla `requests`. Está diseñada para soportar todo el flujo avanzado, incluyendo los nuevos estados, los comentarios del líder y el análisis técnico.

**Copia y ejecuta el siguiente script en tu base de datos:**

```sql
-- Tabla para almacenar las solicitudes de innovación finalizadas
CREATE TABLE IF NOT EXISTS public.requests
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL,
    user_id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    
    -- Datos recopilados del usuario
    titulo_solicitud character varying(255) COLLATE pg_catalog."default",
    problema_principal text COLLATE pg_catalog."default",
    objetivo_esperado text COLLATE pg_catalog."default",
    beneficiarios text COLLATE pg_catalog."default",
    plataformas_involucradas jsonb,
    frecuencia_uso character varying(50) COLLATE pg_catalog."default",
    plazo_deseado character varying(50) COLLATE pg_catalog."default",
    departamento_solicitante character varying(100) COLLATE pg_catalog."default",

    -- Datos generados por el sistema
    score_estimado integer,
    clasificacion_sugerida character varying(50) COLLATE pg_catalog."default",
    prioridad_sugerida character varying(10) COLLATE pg_catalog."default",
    technical_analysis jsonb, -- Para el análisis del Agente Técnico

    -- Ciclo de vida y gestión
    status character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending_technical_analysis'::character varying,
    leader_comments text COLLATE pg_catalog."default", -- Comentarios del líder
    created_at timestamp without time zone DEFAULT now(),
    
    CONSTRAINT requests_pkey PRIMARY KEY (id),
    CONSTRAINT requests_session_id_fkey FOREIGN KEY (session_id)
        REFERENCES public.session_states (session_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    
    -- Constraint para los estados válidos
    CONSTRAINT requests_status_check CHECK (status::text = ANY (ARRAY[
        'pending_technical_analysis'::character varying, 
        'pending_approval'::character varying, 
        'in_evaluation'::character varying, 
        'on_hold'::character varying, 
        'approved'::character varying, 
        'rejected'::character varying
    ]::text[]))
);

-- Índices para optimizar las consultas del panel del líder y del solicitante
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests USING btree (status COLLATE pg_catalog."default" ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests USING btree (user_id COLLATE pg_catalog."default" ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests USING btree (created_at DESC NULLS LAST);

ALTER TABLE IF EXISTS public.requests OWNER to postgres;

RAISE NOTICE 'Tabla requests creada y lista para el flujo avanzado.';
```

---

## 3. Próximos Pasos (Actualizado)

Con esta nueva tabla, la hoja de ruta en nuestra documentación principal debe ser actualizada para reflejar esta acción concreta. Procederé a hacerlo.
