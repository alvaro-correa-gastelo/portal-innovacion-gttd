-- Script para verificar el estado de leader_comments en requests
-- Verificar estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'requests' 
AND table_schema = 'public'
AND column_name IN ('leader_comments', 'updated_at', 'clasificacion_final', 'prioridad_final', 'leader_override', 'override_reason')
ORDER BY ordinal_position;

-- Verificar datos actuales con leader_comments
SELECT 
    id,
    titulo_solicitud,
    status,
    leader_comments,
    clasificacion_final,
    prioridad_final,
    leader_override,
    created_at,
    updated_at
FROM requests 
WHERE leader_comments IS NOT NULL 
   OR clasificacion_final IS NOT NULL 
   OR prioridad_final IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Verificar todos los requests con su estado actual
SELECT 
    id,
    LEFT(titulo_solicitud, 50) as titulo,
    status,
    CASE 
        WHEN leader_comments IS NULL OR leader_comments = '' THEN 'Sin comentarios'
        ELSE LEFT(leader_comments, 50) || '...'
    END as comentarios_resumen,
    clasificacion_sugerida,
    clasificacion_final,
    prioridad_sugerida,
    prioridad_final,
    leader_override,
    created_at
FROM requests 
ORDER BY created_at DESC;
