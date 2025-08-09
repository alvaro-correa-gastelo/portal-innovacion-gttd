-- PASO 5: VERIFICACIÓN FINAL Y RESUMEN
-- Verificar que todo esté configurado correctamente

DO $$
DECLARE
    column_count INTEGER;
    trigger_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO CONFIGURACIÓN DE BASE DE DATOS...';
    RAISE NOTICE '';
    
    -- Verificar columnas agregadas
    SELECT COUNT(*) INTO column_count 
    FROM information_schema.columns 
    WHERE table_name = 'requests' 
    AND table_schema = 'public'
    AND column_name IN ('updated_at', 'clasificacion_final', 'prioridad_final', 'leader_override', 'override_reason');
    
    IF column_count = 5 THEN
        RAISE NOTICE '✅ Todas las columnas necesarias están presentes (5/5)';
    ELSE
        RAISE NOTICE '⚠️ Faltan columnas: % de 5 encontradas', column_count;
    END IF;
    
    -- Verificar triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE event_object_table = 'requests'
    AND trigger_name IN ('update_requests_updated_at', 'trigger_update_leader_override');
    
    IF trigger_count = 2 THEN
        RAISE NOTICE '✅ Todos los triggers están configurados (2/2)';
    ELSE
        RAISE NOTICE '⚠️ Faltan triggers: % de 2 encontrados', trigger_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 ESTRUCTURA FINAL DE LA TABLA REQUESTS:';
    RAISE NOTICE '  ├── Campos originales de IA:';
    RAISE NOTICE '  │   ├── clasificacion_sugerida (preservado)';
    RAISE NOTICE '  │   └── prioridad_sugerida (preservado)';
    RAISE NOTICE '  ├── Campos de decisión del líder:';
    RAISE NOTICE '  │   ├── clasificacion_final (nueva decisión)';
    RAISE NOTICE '  │   ├── prioridad_final (nueva decisión)';
    RAISE NOTICE '  │   ├── leader_override (flag automático)';
    RAISE NOTICE '  │   └── override_reason (justificación)';
    RAISE NOTICE '  └── Timestamps:';
    RAISE NOTICE '      ├── created_at (original)';
    RAISE NOTICE '      └── updated_at (automático)';
    RAISE NOTICE '';
    
    IF column_count = 5 AND trigger_count = 2 THEN
        RAISE NOTICE '🎉 ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!';
        RAISE NOTICE '🚀 El sistema está listo para usar overrides de líder';
    ELSE
        RAISE NOTICE '❌ Configuración incompleta - revisar pasos anteriores';
    END IF;
    
END $$;
