-- PASO 3: AGREGAR CAMPOS DE OVERRIDE DEL LÍDER
-- Solo agregar los que no existen para evitar errores

DO $$
BEGIN
    -- Agregar clasificacion_final si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'requests' 
        AND column_name = 'clasificacion_final' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.requests 
        ADD COLUMN clasificacion_final character varying(50);
        RAISE NOTICE '✅ Campo clasificacion_final agregado';
    ELSE
        RAISE NOTICE '📋 Campo clasificacion_final ya existe';
    END IF;

    -- Agregar prioridad_final si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'requests' 
        AND column_name = 'prioridad_final' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.requests 
        ADD COLUMN prioridad_final character varying(10);
        RAISE NOTICE '✅ Campo prioridad_final agregado';
    ELSE
        RAISE NOTICE '📋 Campo prioridad_final ya existe';
    END IF;

    -- Agregar leader_override si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'requests' 
        AND column_name = 'leader_override' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.requests 
        ADD COLUMN leader_override boolean DEFAULT false;
        RAISE NOTICE '✅ Campo leader_override agregado';
    ELSE
        RAISE NOTICE '📋 Campo leader_override ya existe';
    END IF;

    -- Agregar override_reason si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'requests' 
        AND column_name = 'override_reason' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.requests 
        ADD COLUMN override_reason text;
        RAISE NOTICE '✅ Campo override_reason agregado';
    ELSE
        RAISE NOTICE '📋 Campo override_reason ya existe';
    END IF;

    RAISE NOTICE '🎉 Todos los campos de override verificados/agregados';
    
END $$;
