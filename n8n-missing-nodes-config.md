# CONFIGURACIÓN DE NODOS FALTANTES EN N8N

## 🎯 PROBLEMA IDENTIFICADO

El Text Classifier "Enrutador de agente" clasifica correctamente pero **solo tiene conectada la salida `discovery_agent`**. 

Las salidas `summary_agent` y `report_sender` no están implementadas.

## 🔧 SOLUCIÓN: AGREGAR NODOS FALTANTES

### **1. MODIFICAR CONEXIONES DEL TEXT CLASSIFIER**

**Nodo actual**: "Enrutador de agente" (Text Classifier)
**Salidas actuales**: Solo discovery_agent → Agente Descubridor

**Salidas requeridas**:
```
Enrutador de agente → [3 salidas]
├── Output 0: discovery_agent → Agente Descubridor (YA EXISTE)
├── Output 1: summary_agent → Summary Agent (FALTA)
└── Output 2: report_sender → Report Sender (FALTA)
```

### **2. NODO SUMMARY AGENT (Output 1)**

**Tipo**: LangChain Agent
**Nombre**: "Summary Agent"
**Posición**: Después del Text Classifier (Output 1)

**System Prompt**:
```
Eres el Summary Agent del Portal de Innovación GTTD. Tu función es generar un resumen ejecutivo y calcular el score final de solicitudes tecnológicas que ya tienen información completa (completitud ≥ 75%).

DATOS DE ENTRADA:
- Información completa de la solicitud
- Contexto del usuario y departamento
- Historial de conversación

TU TAREA:
1. Calcular score final (0-100) basado en criterios GTTD
2. Generar resumen ejecutivo para líderes
3. Clasificar como proyecto vs requerimiento
4. Asignar prioridad P1-P4
5. Preparar datos para almacenamiento en BD

CRITERIOS DE SCORING:
- Urgencia (30%): crítica=30, alta=22, media=15, baja=8
- Impacto (25%): crítico=25, alto=19, medio=12, bajo=6  
- Complejidad (20%): muy_compleja=5, compleja=10, moderada=15, simple=20
- Recursos (15%): disponibles=15, limitados=10, escasos=5
- Alineación estratégica (10%): alta=10, media=7, baja=3

RESPONDE CON JSON:
{
  "titulo_solicitud": "string",
  "problema_principal": "string", 
  "objetivo_esperado": "string",
  "plataformas_involucradas": ["array"],
  "beneficiarios": "string",
  "frecuencia_uso": "diario|semanal|mensual|esporadico",
  "urgencia": "baja|media|alta|critica",
  "departamento_solicitante": "string",
  "clasificacion_sugerida": "proyecto|requerimiento",
  "prioridad_sugerida": "P1|P2|P3|P4",
  "score_estimado": number,
  "resumen_ejecutivo": "string"
}
```

**Output Parser**: Structured Output Parser (usar el mismo que ya existe)

### **3. NODO REPORT SENDER (Output 2)**

**Tipo**: HTTP Request
**Nombre**: "Report Sender"
**Posición**: Después del Text Classifier (Output 2)

**Configuración**:
```
URL: http://localhost:3000/api/reports/send
Method: POST
Headers:
  Content-Type: application/json
  Authorization: Bearer {{ $('Combinar datos de sesión').first().json.session_data.auth_token }}

Body:
{
  "session_id": "{{ $('Combinar datos de sesión').first().json.session_id }}",
  "user_id": "{{ $('Combinar datos de sesión').first().json.user_id }}",
  "report_type": "final_summary",
  "recipient_email": "{{ $('Combinar datos de sesión').first().json.session_data.user_profile.email }}",
  "leader_email": "mapi.salas@utp.edu.pe",
  "request_data": "{{ $('Combinar datos de sesión').first().json.session_data }}",
  "timestamp": "{{ $now }}"
}
```

### **4. NODO UPDATE SESSION STATE**

**Tipo**: PostgreSQL
**Nombre**: "Update Session State"
**Posición**: Después de todos los agentes, antes de Response

**Query**:
```sql
UPDATE session_states 
SET 
  current_stage = CASE 
    WHEN '{{ $('Enrutador de agente').first().json.category }}' = 'discovery_agent' THEN 'discovery'
    WHEN '{{ $('Enrutador de agente').first().json.category }}' = 'summary_agent' THEN 'summary'
    WHEN '{{ $('Enrutador de agente').first().json.category }}' = 'report_sender' THEN 'completed'
    ELSE current_stage
  END,
  completeness_score = CASE 
    WHEN '{{ $('Enrutador de agente').first().json.category }}' = 'summary_agent' THEN 100
    WHEN '{{ $('Enrutador de agente').first().json.category }}' = 'report_sender' THEN 100
    ELSE completeness_score
  END,
  conversation_data = conversation_data || '{{ $json }}'::jsonb,
  updated_at = NOW()
WHERE session_id = '{{ $('Combinar datos de sesión').first().json.session_id }}';

-- Insertar mensaje en historial
INSERT INTO conversation_messages (session_id, role, message, agent_name, created_at)
VALUES (
  '{{ $('Combinar datos de sesión').first().json.session_id }}',
  'assistant',
  '{{ $json.message || $json.resumen_ejecutivo || "Procesamiento completado" }}',
  '{{ $('Enrutador de agente').first().json.category }}',
  NOW()
);
```

### **5. NODO MERGE RESPONSES**

**Tipo**: Merge
**Nombre**: "Merge All Responses"
**Posición**: Antes de Extract JSON from Output

**Configuración**:
```
Mode: Merge By Position
Wait for all incoming data: true

Inputs:
- Agente Descubridor (discovery_agent)
- Summary Agent (summary_agent)  
- Report Sender (report_sender)
```

### **6. CONEXIONES FINALES ACTUALIZADAS**

```
Enrutador de agente → [3 salidas]
├── discovery_agent → Agente Descubridor → Merge All Responses
├── summary_agent → Summary Agent → Update Session State → Merge All Responses
└── report_sender → Report Sender → Update Session State → Merge All Responses

Merge All Responses → Extract JSON from Output → Respond to Webhook
```

## 🔍 VERIFICACIÓN DE IMPLEMENTACIÓN

### **Pasos para verificar**:

1. **Importar workflow actualizado** en n8n
2. **Probar cada ruta**:
   - Nueva sesión → discovery_agent
   - Sesión con completitud ≥ 75% → summary_agent  
   - Sesión completada → report_sender
3. **Verificar persistencia** en PostgreSQL
4. **Confirmar respuestas** del webhook

### **Datos de prueba**:

```javascript
// Para discovery_agent
{
  "current_stage": "start",
  "completeness_score": 30
}

// Para summary_agent  
{
  "current_stage": "discovery", 
  "completeness_score": 80
}

// Para report_sender
{
  "current_stage": "summary",
  "completeness_score": 100
}
```

## 🎯 RESULTADO ESPERADO

Con estos nodos agregados, el workflow manejará correctamente:

✅ **Conversaciones multi-turno** (ya funciona)
✅ **Persistencia de contexto** (ya funciona)  
✅ **Enrutamiento inteligente** (ya funciona)
✅ **Procesamiento completo** (se completará)
✅ **Actualización de estado** (se agregará)
✅ **Envío de reportes** (se agregará)
