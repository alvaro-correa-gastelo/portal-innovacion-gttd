# Prompt para que otra IA genere un Workflow JSON de n8n

## 📋 **INFORMACIÓN ESENCIAL PARA ENVIAR**

### **1. CONTEXTO DEL PROYECTO**
```
Necesito que generes un workflow JSON completo para n8n que implemente InsightBot, un agente de IA conversacional para descubrimiento de solicitudes tecnológicas en una universidad.

OBJETIVO: Crear un agente que extraiga información estructurada a través de conversación natural.
```

### **2. ESPECIFICACIONES TÉCNICAS**

#### **Arquitectura Requerida:**
```
- Usar NODOS DE AGENTE IA modernos de n8n (no HTTP requests manuales)
- 6 nodos principales: Webhook → AI Memory → AI Agent → AI Tools → Supabase → Response
- 2 sub-workflows para tools especializados
- Integración con Gemini 2.5 Pro
- Memory management automático
- JSON Schema para respuestas estructuradas
```

### **3. CONFIGURACIÓN DEL AGENTE IA**

#### **System Prompt:**
```
Eres InsightBot, especialista en descubrimiento conversacional para solicitudes tecnológicas UTP.

OBJETIVOS:
- Extraer: problema, objetivo, impacto, plataformas, stakeholders, urgencia
- Mantener conversación natural y empática
- Hacer UNA pregunta principal por respuesta
- Activar componentes ricos cuando sea apropiado

FASES: discovery → clarification → summary → complete

Responde SOLO en formato JSON válido con esta estructura:
{
  "botMessage": "tu respuesta conversacional aquí",
  "extractedData": {
    "problem": "string o null",
    "objective": "string o null",
    "impact": "string o null",
    "platforms": ["array de strings"],
    "stakeholders": ["array de strings"],
    "urgency": "low|medium|high|critical"
  },
  "triggers": {
    "platformSelector": boolean,
    "summaryCard": boolean,
    "documentUpload": boolean,
    "satisfactionSurvey": boolean
  },
  "nextPhase": "discovery|clarification|summary|complete",
  "confidence": number
}
```

#### **JSON Schema para Output Parser:**
```json
{
  "type": "object",
  "properties": {
    "botMessage": {"type": "string"},
    "extractedData": {
      "type": "object",
      "properties": {
        "problem": {"type": "string"},
        "objective": {"type": "string"},
        "impact": {"type": "string"},
        "platforms": {"type": "array"},
        "stakeholders": {"type": "array"},
        "urgency": {"type": "string"}
      }
    },
    "triggers": {
      "type": "object",
      "properties": {
        "platformSelector": {"type": "boolean"},
        "summaryCard": {"type": "boolean"},
        "documentUpload": {"type": "boolean"},
        "satisfactionSurvey": {"type": "boolean"}
      }
    },
    "nextPhase": {"type": "string"},
    "confidence": {"type": "number"}
  },
  "required": ["botMessage", "extractedData", "triggers", "nextPhase", "confidence"]
}
```

### **4. CONFIGURACIÓN DE TOOLS**

#### **Tool 1: Context Analyzer**
```
Nombre: context_analyzer
Descripción: Analiza sentimiento, urgencia y entidades del mensaje del usuario
Input Schema: {message: string, conversation_history: array}
Output Schema: {sentiment: string, urgency_level: string, mentioned_systems: array, stakeholders: array, project_type: string}
```

#### **Tool 2: Data Extractor**
```
Nombre: data_extractor
Descripción: Extrae y estructura información específica de la conversación
Input Schema: {message: string, previous_data: object}
Output Schema: {problem: string, objective: string, impact: string, platforms: array, stakeholders: array, urgency: string, completeness_percentage: number}
```

### **5. CONFIGURACIÓN DE ENDPOINTS**

#### **Webhook Principal:**
```
Path: insightbot/chat
Method: POST
Response Mode: lastNode
Raw Body: true
```

#### **Payload de Entrada Esperado:**
```json
{
  "conversationId": "string",
  "message": "string",
  "currentPhase": "discovery|clarification|summary|complete",
  "extractedData": {},
  "conversationHistory": []
}
```

#### **Respuesta Esperada:**
```json
{
  "botMessage": "string",
  "extractedData": {...},
  "triggers": {...},
  "nextPhase": "string",
  "confidence": number
}
```

### **6. CONFIGURACIÓN DE BASE DE DATOS**

#### **Tabla: conversations**
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255),
  user_message TEXT,
  bot_response TEXT,
  extracted_data JSONB,
  triggers JSONB,
  phase VARCHAR(50),
  confidence INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

#### **Campos para Supabase Insert:**
```
conversation_id: ={{ $('Webhook Chat Input').item.json.conversationId }}
user_message: ={{ $('Webhook Chat Input').item.json.message }}
bot_response: ={{ $json.output.botMessage }}
extracted_data: ={{ JSON.stringify($json.output.extractedData) }}
triggers: ={{ JSON.stringify($json.output.triggers) }}
phase: ={{ $json.output.nextPhase }}
confidence: ={{ $json.output.confidence }}
timestamp: ={{ $now }}
```

### **7. CONFIGURACIÓN DE MEMORY**

#### **AI Memory Settings:**
```
Session ID Type: Custom Key
Session Key: ={{ $json.conversationId || 'default' }}
Context Window Length: 10
Memory Key: chat_history
Input Key: input
Output Key: output
Return Messages: true
```

### **8. CONFIGURACIÓN DEL MODELO**

#### **Gemini Configuration:**
```
Model Provider: Google AI
Model: gemini-1.5-pro
Temperature: 0.7
Max Output Tokens: 1000
Top P: 0.9
Top K: 40
```

### **9. POSICIONES DE NODOS**

#### **Layout Sugerido:**
```
Webhook Chat Input: [200, 300]
AI Memory: [400, 300]
InsightBot AI Agent: [600, 300]
Context Analyzer Tool: [400, 500]
Data Extractor Tool: [600, 500]
Save Conversation: [800, 300]
```

### **10. CONEXIONES REQUERIDAS**

#### **Flujo Principal:**
```
Webhook Chat Input → AI Memory → InsightBot AI Agent → Save Conversation
```

#### **Tools (conectados automáticamente al agente):**
```
- Context Analyzer Tool
- Data Extractor Tool
```

---

## 🎯 **PROMPT COMPLETO PARA ENVIAR:**

```
Genera un workflow JSON completo para n8n que implemente InsightBot, un agente de IA conversacional para descubrimiento de solicitudes tecnológicas universitarias.

REQUERIMIENTOS TÉCNICOS:
- Usar nodos de Agente IA modernos de n8n (@n8n/n8n-nodes-langchain)
- Integración con Gemini 1.5 Pro
- Memory management automático con sessionId
- JSON Schema para respuestas estructuradas
- 2 AI Tools especializados (context_analyzer, data_extractor)
- Persistencia en Supabase

ARQUITECTURA:
6 nodos: Webhook → AI Memory → AI Agent → AI Tools → Supabase → Response

CONFIGURACIÓN DEL AGENTE:
[Incluir aquí el System Prompt y JSON Schema de arriba]

ENDPOINTS:
- POST /webhook/insightbot/chat
- Payload: {conversationId, message, currentPhase, extractedData, conversationHistory}
- Response: {botMessage, extractedData, triggers, nextPhase, confidence}

TOOLS REQUERIDOS:
1. context_analyzer: Analiza sentimiento y entidades
2. data_extractor: Extrae información estructurada con Gemini

BASE DE DATOS:
Tabla conversations con campos: conversation_id, user_message, bot_response, extracted_data, triggers, phase, confidence, timestamp

Genera el JSON completo listo para importar en n8n, incluyendo todos los parámetros, conexiones, posiciones y configuraciones especificadas.
```

---

## 📋 **DOCUMENTOS ADICIONALES A ENVIAR:**

1. **Este prompt completo**
2. **El archivo `GUIA_CONFIGURACION_AGENTE_IA_N8N.md`** (como referencia técnica)
3. **Un ejemplo de workflow JSON existente** (como `InsightBot_AI_Agent_Workflow.json`)

Con esta información, cualquier IA podrá generar un workflow JSON completo y funcional para n8n.
