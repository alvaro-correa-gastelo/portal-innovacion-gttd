-- PASO 4: CREAR TRIGGER PARA DETECTAR OVERRIDES DEL LÍDER
-- Actualiza automáticamente el flag leader_override cuando hay cambios

DO $$
BEGIN
    -- Eliminar trigger existente si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_leader_override' 
        AND event_object_table = 'requests'
    ) THEN
        DROP TRIGGER trigger_update_leader_override ON public.requests;
        RAISE NOTICE '🗑️ Trigger leader_override existente eliminado';
    END IF;

    -- Crear la función del trigger
    CREATE OR REPLACE FUNCTION update_leader_override()
    RETURNS TRIGGER AS $override_trigger$
    BEGIN
        -- Marcar override si hay diferencias con las sugerencias de IA
        NEW.leader_override := (
            (NEW.clasificacion_final IS NOT NULL AND NEW.clasificacion_final != NEW.clasificacion_sugerida) OR
            (NEW.prioridad_final IS NOT NULL AND NEW.prioridad_final != NEW.prioridad_sugerida)
        );
        
        RETURN NEW;
    END;
    $override_trigger$ LANGUAGE plpgsql;

    -- Crear el trigger
    CREATE TRIGGER trigger_update_leader_override
        BEFORE INSERT OR UPDATE ON public.requests
        FOR EACH ROW
        EXECUTE FUNCTION update_leader_override();

    RAISE NOTICE '✅ Trigger leader_override creado exitosamente';
    RAISE NOTICE '🔧 El flag leader_override se actualizará automáticamente';
    
END $$;
