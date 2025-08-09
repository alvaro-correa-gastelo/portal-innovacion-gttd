-- VERIFICAR Y LIMPIAR TRIGGERS EN LA TABLA REQUESTS

DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    RAISE NOTICE '🔍 TRIGGERS ACTUALES EN LA TABLA REQUESTS:';
    RAISE NOTICE '';
    
    -- Mostrar todos los triggers en la tabla requests
    FOR trigger_record IN 
        SELECT trigger_name, action_timing, event_manipulation
        FROM information_schema.triggers 
        WHERE event_object_table = 'requests'
        ORDER BY trigger_name
    LOOP
        RAISE NOTICE '  📌 %: % %', 
            trigger_record.trigger_name, 
            trigger_record.action_timing, 
            trigger_record.event_manipulation;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 TRIGGERS NECESARIOS:';
    RAISE NOTICE '  ✅ update_requests_updated_at (para updated_at automático)';
    RAISE NOTICE '  ✅ trigger_update_leader_override (para leader_override automático)';
    RAISE NOTICE '';
    
    -- Verificar si tenemos exactamente los triggers correctos
    IF EXISTS (SELECT 1 FROM information_schema.triggers 
               WHERE event_object_table = 'requests' 
               AND trigger_name = 'update_requests_updated_at') 
    AND EXISTS (SELECT 1 FROM information_schema.triggers 
                WHERE event_object_table = 'requests' 
                AND trigger_name = 'trigger_update_leader_override') THEN
        
        RAISE NOTICE '✅ Los dos triggers necesarios están presentes';
        
        -- Contar triggers totales
        DECLARE
            total_triggers INTEGER;
        BEGIN
            SELECT COUNT(*) INTO total_triggers
            FROM information_schema.triggers 
            WHERE event_object_table = 'requests';
            
            IF total_triggers = 2 THEN
                RAISE NOTICE '🎉 ¡CONFIGURACIÓN PERFECTA! Solo los triggers necesarios';
            ELSE
                RAISE NOTICE '⚠️ Hay % triggers en total, pero solo necesitamos 2', total_triggers;
                RAISE NOTICE '💡 Puedes mantenerlos si funcionan, o eliminar los extras';
            END IF;
        END;
    ELSE
        RAISE NOTICE '❌ Faltan triggers necesarios';
    END IF;
    
END $$;
