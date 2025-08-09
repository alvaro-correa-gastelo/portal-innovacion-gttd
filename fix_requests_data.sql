-- SCRIPT CORREGIDO: DATOS DE PRUEBA CON FOREIGN KEYS VÁLIDOS
-- Soluciona el error de constraint violation creando sesiones primero

-- =====================================================
-- 1. CREAR SESIONES DE PRUEBA PRIMERO
-- =====================================================

DO $$
DECLARE
    session_1 UUID := gen_random_uuid();
    session_2 UUID := gen_random_uuid();
    session_3 UUID := gen_random_uuid();
BEGIN
    RAISE NOTICE '🔧 Creando sesiones de prueba primero...';
    
    -- Crear sesiones que coincidan con las solicitudes
    INSERT INTO public.session_states (
        session_id,
        user_id,
        current_stage,
        conversation_data,
        completeness_score,
        status,
        created_at,
        updated_at
    ) VALUES 
    (
        session_1,
        'test.user@utp.edu.pe',
        'completed',
        '{
            "titulo_solicitud": "Automatización de reportes financieros",
            "problema_principal": "Los reportes financieros se generan manualmente cada mes, tomando 3 días completos",
            "objetivo_esperado": "Automatizar la generación para reducir tiempo a 2 horas",
            "beneficiarios": "Área de Finanzas, Contabilidad, Gerencia",
            "plataformas_involucradas": ["Oracle ERP", "Excel", "Power BI"],
            "frecuencia_uso": "mensual",
            "plazo_deseado": "3_meses",
            "departamento_solicitante": "Finanzas"
        }'::jsonb,
        85,
        'completed',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        session_2,
        'leader.test@utp.edu.pe',
        'completed',
        '{
            "titulo_solicitud": "Integración Canvas con Sistema Académico",
            "problema_principal": "Canvas no se sincroniza con calificaciones del sistema académico",
            "objetivo_esperado": "Integración bidireccional automática",
            "beneficiarios": "Docentes, Estudiantes, Registro Académico",
            "plataformas_involucradas": ["Canvas", "Sistema Académico", "API"],
            "frecuencia_uso": "diario",
            "plazo_deseado": "6_meses",
            "departamento_solicitante": "Registro Académico"
        }'::jsonb,
        92,
        'completed',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    ),
    (
        session_3,
        'solicitante.test@utp.edu.pe',
        'completed',
        '{
            "titulo_solicitud": "Mejora en formulario de solicitudes",
            "problema_principal": "El formulario actual es poco intuitivo y genera errores",
            "objetivo_esperado": "Rediseño UX para mejorar experiencia",
            "beneficiarios": "Todos los solicitantes del portal",
            "plataformas_involucradas": ["Portal Web", "UX Design"],
            "frecuencia_uso": "diario",
            "plazo_deseado": "1_mes",
            "departamento_solicitante": "GTTD"
        }'::jsonb,
        65,
        'completed',
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '3 hours'
    );

    RAISE NOTICE '✅ Sesiones de prueba creadas: %, %, %', session_1, session_2, session_3;

    -- =====================================================
    -- 2. CREAR SOLICITUDES CON SESSION_IDS VÁLIDOS
    -- =====================================================
    
    RAISE NOTICE '📝 Insertando solicitudes con session_ids válidos...';
    
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
        status,
        created_at
    ) VALUES 
    (
        session_1, -- Usar session_id creado arriba
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
        'pending_approval',
        NOW() - INTERVAL '2 days'
    ),
    (
        session_2, -- Usar session_id creado arriba
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
        'in_evaluation',
        NOW() - INTERVAL '1 day'
    ),
    (
        session_3, -- Usar session_id creado arriba
        'solicitante.test@utp.edu.pe',
        'Mejora en formulario de solicitudes',
        'El formulario actual es poco intuitivo y genera errores',
        'Rediseño UX para mejorar experiencia',
        'Todos los solicitantes del portal',
        '["Portal Web", "UX Design"]'::jsonb',
        'diario',
        '1_mes',
        'GTTD',
        65,
        'requerimiento',
        'P2',
        'pending_technical_analysis',
        NOW() - INTERVAL '3 hours'
    );
    
    RAISE NOTICE '✅ 3 solicitudes creadas correctamente con foreign keys válidos';
    
    -- =====================================================
    -- 3. AGREGAR MÁS SOLICITUDES PARA DASHBOARDS RICOS
    -- =====================================================
    
    -- Crear más sesiones para más datos
    INSERT INTO public.session_states (user_id, current_stage, status, conversation_data, created_at, updated_at) VALUES
    ('admin.test@utp.edu.pe', 'completed', 'completed', '{"titulo_solicitud": "Migración a la nube"}', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('rrhh.test@utp.edu.pe', 'completed', 'completed', '{"titulo_solicitud": "Portal de empleados"}', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    ('marketing.test@utp.edu.pe', 'completed', 'completed', '{"titulo_solicitud": "CRM estudiantil"}', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');
    
    -- Crear solicitudes adicionales usando los session_ids que se acaban de crear
    INSERT INTO public.requests (
        session_id, user_id, titulo_solicitud, problema_principal, 
        departamento_solicitante, status, clasificacion_sugerida, 
        prioridad_sugerida, score_estimado, created_at
    ) 
    SELECT 
        ss.session_id,
        ss.user_id,
        CASE 
            WHEN ss.user_id = 'admin.test@utp.edu.pe' THEN 'Migración a la nube'
            WHEN ss.user_id = 'rrhh.test@utp.edu.pe' THEN 'Portal de empleados'
            WHEN ss.user_id = 'marketing.test@utp.edu.pe' THEN 'CRM estudiantil'
        END,
        CASE 
            WHEN ss.user_id = 'admin.test@utp.edu.pe' THEN 'Servidores on-premise obsoletos'
            WHEN ss.user_id = 'rrhh.test@utp.edu.pe' THEN 'Procesos manuales en RRHH'
            WHEN ss.user_id = 'marketing.test@utp.edu.pe' THEN 'No hay seguimiento de leads'
        END,
        CASE 
            WHEN ss.user_id = 'admin.test@utp.edu.pe' THEN 'TI'
            WHEN ss.user_id = 'rrhh.test@utp.edu.pe' THEN 'Recursos Humanos'
            WHEN ss.user_id = 'marketing.test@utp.edu.pe' THEN 'Marketing'
        END,
        CASE 
            WHEN ss.user_id = 'admin.test@utp.edu.pe' THEN 'pending_approval'
            WHEN ss.user_id = 'rrhh.test@utp.edu.pe' THEN 'approved'
            WHEN ss.user_id = 'marketing.test@utp.edu.pe' THEN 'in_evaluation'
        END,
        'proyecto',
        CASE 
            WHEN ss.user_id = 'admin.test@utp.edu.pe' THEN 'P1'
            WHEN ss.user_id = 'rrhh.test@utp.edu.pe' THEN 'P2'
            WHEN ss.user_id = 'marketing.test@utp.edu.pe' THEN 'P1'
        END,
        CASE 
            WHEN ss.user_id = 'admin.test@utp.edu.pe' THEN 88
            WHEN ss.user_id = 'rrhh.test@utp.edu.pe' THEN 75
            WHEN ss.user_id = 'marketing.test@utp.edu.pe' THEN 82
        END,
        ss.created_at
    FROM session_states ss 
    WHERE ss.user_id IN ('admin.test@utp.edu.pe', 'rrhh.test@utp.edu.pe', 'marketing.test@utp.edu.pe')
      AND ss.session_id NOT IN (SELECT session_id FROM requests);
    
    RAISE NOTICE '✅ Datos adicionales creados para dashboards más ricos';
    
END $$;

-- =====================================================
-- 4. VERIFICACIÓN DE DATOS CREADOS
-- =====================================================

DO $$
DECLARE
    session_count INTEGER;
    request_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO session_count FROM session_states;
    SELECT COUNT(*) INTO request_count FROM requests;
    
    RAISE NOTICE '📊 RESUMEN:';
    RAISE NOTICE '   • Sesiones totales: %', session_count;
    RAISE NOTICE '   • Solicitudes totales: %', request_count;
    RAISE NOTICE '🎉 Datos de prueba creados exitosamente!';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 PRÓXIMOS PASOS:';
    RAISE NOTICE '1. Probar API: curl http://localhost:3000/api/requests';
    RAISE NOTICE '2. Abrir dashboard y verificar datos reales';
    RAISE NOTICE '3. Probar página /my-requests';
END $$;

-- =====================================================
-- 5. QUERY PARA VERIFICAR RELACIONES
-- =====================================================

-- Mostrar muestra de datos creados
SELECT 
    r.id,
    r.titulo_solicitud,
    r.status,
    r.user_id,
    r.departamento_solicitante,
    ss.current_stage,
    ss.status as session_status,
    r.created_at
FROM requests r
JOIN session_states ss ON r.session_id = ss.session_id
ORDER BY r.created_at DESC
LIMIT 10;
