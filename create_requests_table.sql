-- SCRIPT CRÍTICO: CREAR TABLA REQUESTS
-- Basado en DATABASE_ARCHITECTURE.md
-- Ejecutar en PostgreSQL para completar el backend básico

-- =====================================================
-- 1. CREAR TABLA REQUESTS (CRÍTICA PARA EL BACKEND)
-- =====================================================

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
    updated_at timestamp without time zone DEFAULT now(),
    
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
        'rejected'::character varying,
        'cancelled'::character varying
    ]::text[]))
);

-- =====================================================
-- 2. ÍNDICES PARA OPTIMIZAR QUERIES DE LOS DASHBOARDS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests USING btree (status COLLATE pg_catalog."default" ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON public.requests USING btree (user_id COLLATE pg_catalog."default" ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests USING btree (created_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_requests_department ON public.requests USING btree (departamento_solicitante COLLATE pg_catalog."default" ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON public.requests USING btree (prioridad_sugerida COLLATE pg_catalog."default" ASC NULLS LAST);

-- =====================================================
-- 3. TABLA DE AUDITORÍA PARA REQUESTS (OPCIONAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.requests_audit
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    request_id uuid NOT NULL,
    action_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    previous_status character varying(50) COLLATE pg_catalog."default",
    new_status character varying(50) COLLATE pg_catalog."default",
    leader_id character varying(255) COLLATE pg_catalog."default",
    comments text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    
    CONSTRAINT requests_audit_pkey PRIMARY KEY (id),
    CONSTRAINT requests_audit_request_id_fkey FOREIGN KEY (request_id)
        REFERENCES public.requests (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_requests_audit_request_id ON public.requests_audit USING btree (request_id);
CREATE INDEX IF NOT EXISTS idx_requests_audit_created_at ON public.requests_audit USING btree (created_at DESC NULLS LAST);

-- =====================================================
-- 4. TRIGGER PARA UPDATED_AT AUTOMÁTICO
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_requests_updated_at 
    BEFORE UPDATE ON public.requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. VERIFICACIÓN DE CREACIÓN
-- =====================================================

DO $$
BEGIN
    -- Verificar que la tabla requests se creó
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'requests' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Tabla requests creada correctamente';
        
        -- Contar registros existentes
        DECLARE
            record_count integer;
        BEGIN
            SELECT COUNT(*) INTO record_count FROM public.requests;
            RAISE NOTICE '📊 Registros en requests: %', record_count;
        END;
    ELSE
        RAISE EXCEPTION '❌ Error: Tabla requests no se creó';
    END IF;
    
    -- Verificar foreign key con session_states
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'session_states' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Relación con session_states disponible';
    ELSE
        RAISE WARNING '⚠️ Tabla session_states no encontrada - some features may not work';
    END IF;
    
    RAISE NOTICE '🎉 Script de tabla requests completado exitosamente';
    RAISE NOTICE '🚀 Backend básico listo para conectar con frontend';
END $$;

-- =====================================================
-- 6. DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Insertar datos de prueba si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.requests LIMIT 1) THEN
        RAISE NOTICE '📝 Insertando datos de prueba...';
        
        INSERT INTO public.requests (
            session_id,
            user_id,
            titulo_solicitud,
            problema_principal,
            objetivo_esperado,
            beneficiarios,
            plataformas_involucradas,
            frecuencia_uso,
            plazo_deseado,
            departamento_solicitante,
            score_estimado,
            clasificacion_sugerida,
            prioridad_sugerida,
            status
        ) VALUES 
        (
            gen_random_uuid(),
            'test.user@utp.edu.pe',
            'Automatización de reportes financieros',
            'Los reportes financieros se generan manualmente cada mes, tomando 3 días completos',
            'Automatizar la generación para reducir tiempo a 2 horas',
            'Área de Finanzas, Contabilidad, Gerencia',
            '["Oracle ERP", "Excel", "Power BI"]'::jsonb,
            'mensual',
            '3_meses',
            'Finanzas',
            85,
            'proyecto',
            'P1',
            'pending_approval'
        ),
        (
            gen_random_uuid(),
            'leader.test@utp.edu.pe',
            'Integración Canvas con Sistema Académico',
            'Canvas no se sincroniza con calificaciones del sistema académico',
            'Integración bidireccional automática',
            'Docentes, Estudiantes, Registro Académico',
            '["Canvas", "Sistema Académico", "API"]'::jsonb,
            'diario',
            '6_meses',
            'Registro Académico',
            92,
            'proyecto',
            'P1',
            'in_evaluation'
        ),
        (
            gen_random_uuid(),
            'solicitante.test@utp.edu.pe',
            'Mejora en formulario de solicitudes',
            'El formulario actual es poco intuitivo y genera errores',
            'Rediseño UX para mejorar experiencia',
            'Todos los solicitantes del portal',
            '["Portal Web", "UX Design"]'::jsonb,
            'diario',
            '1_mes',
            'GTTD',
            65,
            'requerimiento',
            'P2',
            'pending_technical_analysis'
        );
        
        RAISE NOTICE '✅ 3 solicitudes de prueba insertadas';
    ELSE
        RAISE NOTICE '📊 Datos ya existen - skip inserción de prueba';
    END IF;
END $$;

ALTER TABLE IF EXISTS public.requests OWNER to postgres;
ALTER TABLE IF EXISTS public.requests_audit OWNER to postgres;

RAISE NOTICE '🎯 PRÓXIMOS PASOS:';
RAISE NOTICE '1. Probar API: GET /api/requests';
RAISE NOTICE '2. Conectar dashboards del frontend';
RAISE NOTICE '3. Implementar rama de finalización N8N';
RAISE NOTICE '4. Crear página /my-requests';
