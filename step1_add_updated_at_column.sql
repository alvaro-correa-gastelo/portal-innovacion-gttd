-- PASO 1: AGREGAR COLUMNA updated_at A LA TABLA requests
-- Este campo es necesario porque existe un trigger que lo intenta usar

DO $$
BEGIN
    -- Verificar si la columna ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'requests' 
        AND column_name = 'updated_at' 
        AND table_schema = 'public'
    ) THEN
        -- Agregar la columna updated_at
        ALTER TABLE public.requests 
        ADD COLUMN updated_at timestamp without time zone DEFAULT now();
        
        -- Inicializar con created_at para registros existentes
        UPDATE public.requests 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;
        
        RAISE NOTICE '✅ Columna updated_at agregada exitosamente';
    ELSE
        RAISE NOTICE '📋 Columna updated_at ya existe';
    END IF;
END $$;
