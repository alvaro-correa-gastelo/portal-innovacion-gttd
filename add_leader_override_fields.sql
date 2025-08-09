-- SCRIPT: AGREGAR CAMPOS DE OVERRIDE DEL LÍDER
-- Mantiene las sugerencias de IA intactas y agrega las decisiones finales del líder

-- =====================================================
-- AGREGAR CAMPOS DE DECISIÓN FINAL DEL LÍDER
-- =====================================================

-- Agregar campos para las decisiones finales del líder
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS clasificacion_final character varying(50),
ADD COLUMN IF NOT EXISTS prioridad_final character varying(10),
ADD COLUMN IF NOT EXISTS leader_override boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS override_reason text;

-- =====================================================
-- COMENTARIOS SOBRE LOS NUEVOS CAMPOS
-- =====================================================

COMMENT ON COLUMN public.requests.clasificacion_final IS 'Clasificación final decidida por el líder (puede diferir de la sugerida por IA)';
COMMENT ON COLUMN public.requests.prioridad_final IS 'Prioridad final decidida por el líder (puede diferir de la sugerida por IA)';
COMMENT ON COLUMN public.requests.leader_override IS 'Indica si el líder modificó las sugerencias de la IA';
COMMENT ON COLUMN public.requests.override_reason IS 'Razón por la cual el líder modificó las sugerencias (opcional)';

-- =====================================================
-- FUNCIÓN PARA DETERMINAR VALORES EFECTIVOS
-- =====================================================

-- Función que devuelve la clasificación efectiva (la del líder si existe, sino la de IA)
CREATE OR REPLACE FUNCTION get_effective_classification(req public.requests)
RETURNS varchar(50) AS $$
BEGIN
    RETURN COALESCE(req.clasificacion_final, req.clasificacion_sugerida);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función que devuelve la prioridad efectiva (la del líder si existe, sino la de IA)  
CREATE OR REPLACE FUNCTION get_effective_priority(req public.requests)
RETURNS varchar(10) AS $$
BEGIN
    RETURN COALESCE(req.prioridad_final, req.prioridad_sugerida);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- TRIGGER PARA ACTUALIZAR leader_override AUTOMÁTICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION update_leader_override()
RETURNS TRIGGER AS $$
BEGIN
    -- Marcar override si hay diferencias con las sugerencias de IA
    NEW.leader_override := (
        (NEW.clasificacion_final IS NOT NULL AND NEW.clasificacion_final != NEW.clasificacion_sugerida) OR
        (NEW.prioridad_final IS NOT NULL AND NEW.prioridad_final != NEW.prioridad_sugerida)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_leader_override
    BEFORE INSERT OR UPDATE ON public.requests
    FOR EACH ROW
    EXECUTE FUNCTION update_leader_override();

-- =====================================================
-- ÍNDICES PARA LOS NUEVOS CAMPOS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_requests_clasificacion_final ON public.requests (clasificacion_final);
CREATE INDEX IF NOT EXISTS idx_requests_prioridad_final ON public.requests (prioridad_final);
CREATE INDEX IF NOT EXISTS idx_requests_leader_override ON public.requests (leader_override);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'requests' 
               AND column_name = 'clasificacion_final' 
               AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Campos de override del líder agregados correctamente';
        
        -- Mostrar estructura actualizada
        RAISE NOTICE '📊 Estructura actualizada:';
        RAISE NOTICE '  - clasificacion_sugerida: Sugerencia original de IA';
        RAISE NOTICE '  - clasificacion_final: Decisión final del líder';
        RAISE NOTICE '  - prioridad_sugerida: Sugerencia original de IA';
        RAISE NOTICE '  - prioridad_final: Decisión final del líder';
        RAISE NOTICE '  - leader_override: Flag automático de modificación';
        RAISE NOTICE '  - override_reason: Razón de la modificación';
        
    ELSE
        RAISE EXCEPTION '❌ Error agregando campos de override';
    END IF;
END $$;

-- =====================================================
-- VISTA PARA CONSULTAS SIMPLIFICADAS
-- =====================================================

CREATE OR REPLACE VIEW requests_with_effective_values AS
SELECT 
    r.*,
    COALESCE(r.clasificacion_final, r.clasificacion_sugerida) as clasificacion_efectiva,
    COALESCE(r.prioridad_final, r.prioridad_sugerida) as prioridad_efectiva,
    CASE 
        WHEN r.leader_override THEN 'Modificado por Líder'
        ELSE 'Según IA'
    END as origen_clasificacion
FROM public.requests r;

COMMENT ON VIEW requests_with_effective_values IS 'Vista que muestra los valores efectivos (finales) de clasificación y prioridad';

RAISE NOTICE '🎯 BENEFICIOS DE ESTA ESTRUCTURA:';
RAISE NOTICE '1. ✅ Preserva sugerencias originales de IA';
RAISE NOTICE '2. ✅ Permite decisiones finales del líder';
RAISE NOTICE '3. ✅ Trazabilidad completa de cambios';
RAISE NOTICE '4. ✅ Análisis de efectividad de IA vs decisiones humanas';
RAISE NOTICE '5. ✅ Flag automático de override';
