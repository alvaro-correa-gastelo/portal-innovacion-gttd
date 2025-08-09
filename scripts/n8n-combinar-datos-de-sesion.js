/**
 * Código listo para pegar en un nodo Code de n8n llamado
 * "Combinar datos de sesión" (JavaScript).
 *
 * Integra:
 * - Lectura de "Combinar datos" (perfil + message)
 * - Detección de sesión existente y, si no, uso de "Crear sesión"
 * - Extracción y RESUMEN del historial (compacto y etiquetado)
 * - Construcción de classifierInput con history_summary (no envía historial crudo)
 *
 * Requisitos previos en el workflow:
 * - Nodo "Combinar datos" que produce:
 *    { user_profile: { user_id, name, department, role, ... }, user_query, user_context, ... }
 * - Nodo Postgres "Verificar Sesiones": entrega fila con session_id,... si existe
 * - Nodo Postgres "Extraer historial de conversaciones": SELECT role,message,agent_name,created_at ORDER BY created_at ASC
 * - Nodo Postgres "Crear sesión": en caso no exista (opcional según tu flujo)
 */

const combinedData = $('Combinar datos').first().json;
let sessionData = null;
let isExistingSession = false;

// Internos para logs y DB (no enviar al LLM la lista cruda)
let conversationHistory = [];
let historyText = ''; // aquí quedará el resumen compacto para Prompt/Clasificador

console.log('=== INICIANDO PROCESAMIENTO DE SESIÓN ===');

// PASO 1: Intentar obtener sesión existente PRIMERO
try {
  const existingSessionNode = $('Verificar Sesiones');
  if (existingSessionNode && existingSessionNode.first) {
    const existingData = existingSessionNode.first().json;

    if (existingData && existingData.session_id) {
      sessionData = existingData;
      isExistingSession = true;

      console.log('✅ Sesión existente encontrada:');
      console.log('   - Session ID:', sessionData.session_id);
      console.log('   - Datos completos:', JSON.stringify(sessionData, null, 2));

      // PASO 1.1: Extraer historial SOLO para sesión existente y COMPRIMIRLO
      try {
        const historyNode = $('Extraer historial de conversaciones');
        if (historyNode && historyNode.all) {
          const historyData = historyNode.all();

          if (Array.isArray(historyData) && historyData.length > 0) {
            // Aplana a array de {role, message, agent_name, created_at}
            conversationHistory = historyData.flatMap(item => item.json || []);

            // Orden cronológico ascendente si el SQL no lo garantizara
            conversationHistory.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

            // Toma últimos N mensajes (ajusta N según tu costo de tokens)
            const last = conversationHistory.slice(-10);

            // Limpieza por línea
            const clean = (s) => String(s ?? '')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 240);

            // Etiqueta: assistant usa agent_name si existe
            const lines = last.map(m => {
              const who = m.role === 'assistant'
                ? (m.agent_name || 'assistant')
                : (m.role || 'user');
              return `${who}: ${clean(m.message)}`;
            });

            // Ensamblar resumen (usa '\n' o ' | ')
            const summary = lines.join('\n');
            historyText = `\nResumen historial:\n${summary}`;

            console.log(`✅ Historial resumido: ${conversationHistory.length} mensajes (últimos ${last.length})`);
          }
        }
      } catch (error) {
        console.log('ℹ️ Error al procesar historial:', error.message);
      }
    } else {
      console.log('ℹ️ Sesión existente está vacía o sin session_id');
    }
  } else {
    console.log('ℹ️ Nodo "Verificar Sesiones" no disponible');
  }
} catch (error) {
  console.log('ℹ️ Error al acceder a sesión existente:', error.message);
}

// PASO 2: Si NO hay sesión existente, usar datos de creación de sesión
if (!sessionData) {
  console.log('🔄 No hay sesión existente, buscando nueva sesión...');
  try {
    const newSessionNode = $('Crear sesión');
    if (newSessionNode && newSessionNode.first) {
      const rawData = newSessionNode.first().json;
      console.log('🔍 DEBUG - Datos crudos de Crear sesión:');
      console.log('   - Tipo:', typeof rawData);
      console.log('   - Es array:', Array.isArray(rawData));
      console.log('   - Contenido:', JSON.stringify(rawData, null, 2));

      if (Array.isArray(rawData) && rawData.length > 0) {
        sessionData = rawData[0];
        isExistingSession = false;
        console.log('✅ Nueva sesión extraída del array:', sessionData.session_id);
      } else if (rawData && rawData.session_id) {
        sessionData = rawData;
        isExistingSession = false;
        console.log('✅ Nueva sesión como objeto directo:', sessionData.session_id);
      } else {
        console.log('⚠️ Formato inesperado de sesión nueva:', rawData);
      }
    } else {
      console.log('⚠️ Nodo "Crear sesión" no disponible');
    }
  } catch (error) {
    console.log('❌ Error al acceder a nueva sesión:', error.message);
    try {
      console.log('🔄 Intentando método alternativo con .all()...');
      const allNewSessions = $('Crear sesión').all();
      console.log('   - Cantidad de elementos:', allNewSessions.length);

      if (allNewSessions.length > 0) {
        const firstSession = allNewSessions[0].json;
        console.log('   - Primer elemento:', JSON.stringify(firstSession, null, 2));

        if (Array.isArray(firstSession) && firstSession.length > 0) {
          sessionData = firstSession[0];
          console.log('✅ Sesión del array alternativo:', sessionData.session_id);
        } else if (firstSession && firstSession.session_id) {
          sessionData = firstSession;
          console.log('✅ Sesión objeto alternativo:', sessionData.session_id);
        }

        if (sessionData) isExistingSession = false;
      }
    } catch (altError) {
      console.log('❌ Método alternativo también falló:', altError.message);
    }
  }
}

// PASO 3: Validación final y fallback
if (!sessionData || !sessionData.session_id) {
  console.log('⚠️ FALLBACK: Creando sesión temporal');
  console.log('   - sessionData actual:', sessionData);

  sessionData = {
    session_id: 'temp-' + Date.now(),
    user_id: combinedData.user_profile?.user_id || 'demo_user',
    current_stage: 'start',
    completeness_score: 0,
    conversation_data: {},
    status: 'active'
  };
  isExistingSession = false;
  console.log('🔄 Sesión temporal creada:', sessionData.session_id);
}

// PASO 4: Extraer datos finales
const currentStage = sessionData.current_stage || sessionData.current_step || (isExistingSession ? 'discovery' : 'start');
const completenessScore = sessionData.completeness_score || sessionData.completeness || 0;
const sessionStatus = sessionData.status || 'active';
const conversationData = sessionData.conversation_data || sessionData.data || {};

// 🔍 VALIDACIÓN FINAL
console.log('🎯 SESIÓN FINAL SELECCIONADA:');
console.log('   - Tipo:', isExistingSession ? 'EXISTENTE' : 'NUEVA');
console.log('   - Session ID:', sessionData.session_id);
console.log('   - User ID:', sessionData.user_id);
console.log('   - Stage:', currentStage);
console.log('   - Completeness:', completenessScore);
console.log('   - Status:', sessionStatus);
console.log('   - Historial total (para DB/auditoría):', conversationHistory.length);

// PASO 5: Crear input para Text Classifier (usa resumen, NO historial crudo)
const classifierInput = {
  session_id: sessionData.session_id,

  text: `Usuario: ${combinedData.user_profile?.name || 'Usuario'} (${combinedData.user_profile?.department || 'Sin departamento'})
Mensaje: ${combinedData.user_query}
Session ID: ${sessionData.session_id}
Etapa actual: ${currentStage}
Completitud: ${completenessScore}%
Estado: ${sessionStatus}
Tipo de sesión: ${isExistingSession ? 'Continuación' : 'Nueva'}${historyText}`,

  session_data: {
    session_id: sessionData.session_id,
    user_query: combinedData.user_query,
    current_step: currentStage,
    user_profile: combinedData.user_profile || {},
    completeness_score: completenessScore,
    conversation_data: conversationData,
    user_context: combinedData.user_context || {},

    // Enviar SOLO el resumen al resto del flujo/LLM:
    history_summary: (historyText || '').replace(/^\nResumen historial:\n/, ''),

    // No enviar conversation_history al LLM; si lo necesitas para inserts en BD,
    // consérvalo en memoria y úsalo en los nodos de escritura a DB.
    is_existing_session: isExistingSession
  },

  user_id: sessionData.user_id || combinedData.user_profile?.user_id,
  current_stage: currentStage,
  is_existing_session: isExistingSession
};

console.log('🚀 ENVIANDO AL TEXT CLASSIFIER:');
console.log('   - Session ID confirmado:', classifierInput.session_id);
console.log('   - Tipo de sesión:', isExistingSession ? 'EXISTENTE' : 'NUEVA');

return [{ json: classifierInput }];
