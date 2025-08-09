-- PASO 2: RECREAR FUNCIÓN Y TRIGGER PARA updated_at
-- Eliminar y recrear para asegurar que funcione correctamente

DO $$
BEGIN
    -- Eliminar trigger existente si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_requests_updated_at' 
        AND event_object_table = 'requests'
    ) THEN
        DROP TRIGGER update_requests_updated_at ON public.requests;
        RAISE NOTICE '🗑️ Trigger existente eliminado';
    END IF;
    
    -- Recrear la función del trigger
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $trigger$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $trigger$ language 'plpgsql';
    
    -- Crear el trigger
    CREATE TRIGGER update_requests_updated_at 
        BEFORE UPDATE ON public.requests 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    
    RAISE NOTICE '✅ Trigger updated_at recreado exitosamente';
    
END $$;
