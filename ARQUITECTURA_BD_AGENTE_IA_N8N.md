# Arquitectura de Base de Datos para Agente IA en n8n

## 🗄️ **ESTRATEGIA DE BASE DE DATOS**

### **OPCIÓN RECOMENDADA: UNA SOLA BASE DE DATOS**
✅ **Usar la misma BD de Supabase para todo**
- Memory del agente IA
- Datos de conversación personalizados
- Solicitudes finalizadas
- Métricas y analytics

---

## 🧠 **MEMORY DEL AGENTE IA EN N8N**

### **Cómo Funciona AI Memory en n8n:**

#### **Tabla Automática: `langchain_memory`**
```sql
-- n8n crea automáticamente esta tabla
CREATE TABLE langchain_memory (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  memory_key VARCHAR(255) DEFAULT 'chat_history',
  memory_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices automáticos
CREATE INDEX idx_langchain_memory_session_id ON langchain_memory(session_id);
CREATE INDEX idx_langchain_memory_key ON langchain_memory(memory_key);
```

#### **Estructura de Datos en memory_data:**
```json
{
  "messages": [
    {
      "type": "human",
      "content": "Necesito un sistema para gestionar estudiantes",
      "timestamp": "2025-07-28T23:17:00Z"
    },
    {
      "type": "ai", 
      "content": "Entiendo que necesitas un sistema para gestionar estudiantes...",
      "timestamp": "2025-07-28T23:17:05Z"
    }
  ],
  "metadata": {
    "conversation_count": 2,
    "last_activity": "2025-07-28T23:17:05Z"
  }
}
```

#### **Configuración en n8n:**
```javascript
// En el nodo AI Memory
{
  "sessionIdType": "customKey",
  "sessionKey": "={{ $json.conversationId }}",
  "contextWindowLength": 10,
  "memoryKey": "chat_history",
  "returnMessages": true
}
```

---

## 🏗️ **ARQUITECTURA COMPLETA DE BD**

### **ESQUEMA UNIFICADO EN SUPABASE:**

#### **1. Tabla: `langchain_memory` (Automática)**
```sql
-- Gestionada automáticamente por n8n
-- Almacena historial conversacional del agente
CREATE TABLE langchain_memory (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL, -- conversationId
  memory_key VARCHAR(255) DEFAULT 'chat_history',
  memory_data JSONB NOT NULL, -- mensajes del chat
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **2. Tabla: `conversations` (Personalizada)**
```sql
-- Para datos estructurados y analytics
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL, -- mismo que session_id
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  extracted_data JSONB, -- datos estructurados extraídos
  triggers JSONB, -- componentes UI activados
  phase VARCHAR(50), -- discovery, clarification, summary, complete
  confidence INTEGER, -- 0-100
  message_count INTEGER DEFAULT 1,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

#### **3. Tabla: `requests` (Solicitudes Finalizadas)**
```sql
-- Cuando la conversación se convierte en solicitud
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL, -- referencia a conversación
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending_assignment',
  priority VARCHAR(20) DEFAULT 'medium',
  platforms JSONB, -- sistemas involucrados
  stakeholders JSONB, -- beneficiarios
  technical_report TEXT,
  confidence_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  assigned_to VARCHAR(255),
  completed_at TIMESTAMP
);
```

#### **4. Tabla: `conversation_analytics` (Métricas)**
```sql
-- Para analytics y optimización
CREATE TABLE conversation_analytics (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  total_messages INTEGER,
  duration_minutes INTEGER,
  final_confidence INTEGER,
  conversion_to_request BOOLEAN DEFAULT FALSE,
  user_satisfaction INTEGER, -- 1-5
  most_mentioned_systems JSONB,
  phase_durations JSONB, -- tiempo en cada fase
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 **FLUJO DE DATOS**

### **Durante la Conversación:**
```
1. Usuario envía mensaje
   ↓
2. n8n AI Memory lee/escribe en `langchain_memory`
   ↓
3. Agente IA procesa con contexto automático
   ↓
4. Datos estructurados se guardan en `conversations`
   ↓
5. Respuesta al usuario
```

### **Al Finalizar Conversación:**
```
1. Datos finales en `conversations`
   ↓
2. Se crea registro en `requests`
   ↓
3. Se genera analytics en `conversation_analytics`
   ↓
4. Memory se mantiene para futuras referencias
```

---

## 🔧 **CONFIGURACIÓN EN N8N**

### **Nodo AI Memory:**
```javascript
{
  "sessionIdType": "customKey",
  "sessionKey": "={{ $json.conversationId }}",
  "contextWindowLength": 10, // últimos 10 mensajes
  "memoryKey": "chat_history",
  "inputKey": "input",
  "outputKey": "output",
  "returnMessages": true
}
```

### **Nodo Supabase (Conversations):**
```javascript
{
  "operation": "insert",
  "table": "conversations",
  "fieldsUi": {
    "fieldValues": [
      {
        "fieldId": "conversation_id",
        "fieldValue": "={{ $json.conversationId }}"
      },
      {
        "fieldId": "user_message", 
        "fieldValue": "={{ $json.message }}"
      },
      {
        "fieldId": "bot_response",
        "fieldValue": "={{ $json.output.botMessage }}"
      },
      {
        "fieldId": "extracted_data",
        "fieldValue": "={{ JSON.stringify($json.output.extractedData) }}"
      },
      {
        "fieldId": "triggers",
        "fieldValue": "={{ JSON.stringify($json.output.triggers) }}"
      },
      {
        "fieldId": "phase",
        "fieldValue": "={{ $json.output.nextPhase }}"
      },
      {
        "fieldId": "confidence",
        "fieldValue": "={{ $json.output.confidence }}"
      }
    ]
  }
}
```

---

## 📊 **VENTAJAS DE ESTA ARQUITECTURA**

### **✅ Beneficios:**
1. **Memory Automática**: n8n gestiona el historial conversacional
2. **Datos Estructurados**: Información extraída en tabla personalizada
3. **Analytics Separados**: Métricas sin afectar performance
4. **Escalabilidad**: Fácil agregar más agentes con diferentes session_id
5. **Consistencia**: Misma BD para todo el ecosistema

### **🔍 Consultas Útiles:**

#### **Ver Historial de Conversación:**
```sql
-- Desde langchain_memory (formato n8n)
SELECT 
  session_id,
  memory_data->'messages' as chat_history
FROM langchain_memory 
WHERE session_id = 'conv_12345';

-- Desde conversations (datos estructurados)
SELECT 
  user_message,
  bot_response,
  extracted_data,
  confidence,
  timestamp
FROM conversations 
WHERE conversation_id = 'conv_12345'
ORDER BY timestamp;
```

#### **Analytics de Conversaciones:**
```sql
-- Métricas generales
SELECT 
  AVG(confidence) as avg_confidence,
  AVG(message_count) as avg_messages,
  COUNT(*) as total_conversations
FROM conversations 
WHERE timestamp > NOW() - INTERVAL '7 days';

-- Sistemas más mencionados
SELECT 
  platform,
  COUNT(*) as mentions
FROM conversations,
  jsonb_array_elements_text(extracted_data->'platforms') as platform
WHERE platform IS NOT NULL
GROUP BY platform
ORDER BY mentions DESC;
```

---

## 🚀 **IMPLEMENTACIÓN PASO A PASO**

### **1. Configurar Supabase:**
```sql
-- Solo crear las tablas personalizadas
-- langchain_memory se crea automáticamente
CREATE TABLE conversations (...);
CREATE TABLE requests (...);
CREATE TABLE conversation_analytics (...);
```

### **2. Configurar n8n AI Memory:**
```javascript
// El agente automáticamente usará langchain_memory
// Solo configurar sessionKey con conversationId
```

### **3. Configurar Persistencia Personalizada:**
```javascript
// Guardar datos estructurados en conversations
// Mantener referencia con mismo conversation_id
```

### **4. Monitoreo:**
```sql
-- Ver estado de memory
SELECT session_id, jsonb_array_length(memory_data->'messages') as message_count
FROM langchain_memory;

-- Ver datos estructurados
SELECT conversation_id, confidence, phase 
FROM conversations 
ORDER BY timestamp DESC;
```

---

## 🎯 **RECOMENDACIÓN FINAL**

**USA UNA SOLA BASE DE DATOS SUPABASE** con:
- **`langchain_memory`**: Gestionada automáticamente por n8n AI Memory
- **`conversations`**: Datos estructurados personalizados
- **`requests`**: Solicitudes finalizadas
- **`conversation_analytics`**: Métricas y analytics

Esta arquitectura te da lo mejor de ambos mundos: la gestión automática de memoria de n8n y el control total sobre tus datos estructurados.
