-- OPCIONAL: LIMPIAR TRIGGERS EXTRA (solo si quieres tener exactamente 2)
-- ⚠️ SOLO EJECUTAR SI QUIERES ELIMINAR TRIGGERS EXTRA

DO $$
DECLARE
    trigger_record RECORD;
    triggers_needed TEXT[] := ARRAY['update_requests_updated_at', 'trigger_update_leader_override'];
BEGIN
    RAISE NOTICE '🧹 LIMPIANDO TRIGGERS EXTRA...';
    RAISE NOTICE '';
    
    -- Eliminar triggers que NO están en la lista de necesarios
    FOR trigger_record IN 
        SELECT trigger_name
        FROM information_schema.triggers 
        WHERE event_object_table = 'requests'
        AND trigger_name != ALL(triggers_needed)
    LOOP
        EXECUTE format('DROP TRIGGER %I ON public.requests', trigger_record.trigger_name);
        RAISE NOTICE '🗑️ Eliminado trigger extra: %', trigger_record.trigger_name;
    END LOOP;
    
    -- Verificar resultado final
    DECLARE
        final_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO final_count
        FROM information_schema.triggers 
        WHERE event_object_table = 'requests';
        
        RAISE NOTICE '';
        RAISE NOTICE '📊 RESULTADO FINAL: % triggers restantes', final_count;
        
        IF final_count = 2 THEN
            RAISE NOTICE '🎉 ¡PERFECTO! Solo los triggers necesarios';
        END IF;
    END;
    
END $$;
