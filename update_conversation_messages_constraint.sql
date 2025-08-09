-- 🔧 ACTUALIZAR CONSTRAINT DE conversation_messages
-- Esto permitirá agregar el rol 'leader' para la comunicación líder-usuario

-- 1. Primero, eliminar el constraint actual
ALTER TABLE conversation_messages 
DROP CONSTRAINT IF EXISTS conversation_messages_role_check;

-- 2. Crear nuevo constraint que incluya 'leader'
ALTER TABLE conversation_messages 
ADD CONSTRAINT conversation_messages_role_check 
CHECK (role::text = ANY (ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying, 'leader'::character varying]::text[]));

-- 3. Verificar que el constraint se creó correctamente
SELECT conname, contype, consrc 
FROM pg_constraint 
WHERE conrelid = 'conversation_messages'::regclass 
AND conname = 'conversation_messages_role_check';

-- 4. Ahora SÍ podemos insertar los mensajes de prueba
INSERT INTO conversation_messages (session_id, role, message, agent_name, created_at)
VALUES 
  -- Mensajes originales IA ↔ Usuario
  ('aa91a9b2-39cf-4d49-a236-224bc461615d', 'user', 'Necesito automatizar reportes financieros', null, NOW() - INTERVAL '2 days'),
  ('aa91a9b2-39cf-4d49-a236-224bc461615d', 'assistant', '¿Con qué frecuencia generas estos reportes actualmente?', 'discovery_agent', NOW() - INTERVAL '2 days'),
  
  -- Mensajes nuevos Líder ↔ Usuario  
  ('aa91a9b2-39cf-4d49-a236-224bc461615d', 'user', '¿Hay alguna actualización sobre mi solicitud?', null, NOW() - INTERVAL '1 day'),
  ('aa91a9b2-39cf-4d49-a236-224bc461615d', 'leader', 'Estamos revisando los requerimientos técnicos. Te contacto pronto.', null, NOW() - INTERVAL '1 day');

-- 5. Verificar que los datos se insertaron
SELECT 
  session_id, 
  role, 
  message, 
  agent_name, 
  created_at 
FROM conversation_messages 
WHERE session_id = 'aa91a9b2-39cf-4d49-a236-224bc461615d'
ORDER BY created_at DESC;
