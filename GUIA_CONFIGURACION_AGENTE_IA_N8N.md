# Guía Completa: Configuración de Agente IA en n8n para InsightBot

## 🤖 **USANDO LOS NUEVOS NODOS DE AGENTE IA**

Esta guía te mostrará cómo configurar InsightBot usando los **nuevos nodos de Agente IA** de n8n, aprovechando todas las funcionalidades modernas como Memory, Tools y LLM integrado.

---

## 📋 **NODOS REQUERIDOS (6 nodos total)**

### **1. Webhook (Trigger)**
### **2. AI Agent**
### **3. AI Memory**
### **4. AI Tool: Context Analyzer**
### **5. AI Tool: Data Extractor**
### **6. Supabase (Save)**

---

## 🔧 **CONFIGURACIÓN PASO A PASO**

### **NODO 1: WEBHOOK (Trigger)**

**Ubicación:** Triggers > Webhook

**Configuración:**
```
HTTP Method: POST
Path: insightbot/chat
Response Mode: Last Node
Authentication: None
```

**Options (Expandir):**
```
✅ Raw Body: Activado
✅ Binary Data: Desactivado
```

**Posición:** (200, 300)

---

### **NODO 2: AI MEMORY**

**Ubicación:** AI > Memory > Window Buffer Memory

**Configuración:**
```
Session ID Type: Custom Key
Session Key: ={{ $json.conversationId || 'default' }}
Context Window Length: 10
```

**Descripción:** Gestiona el contexto conversacional persistente

**Posición:** (400, 300)

**Conexión:** Webhook → AI Memory

---

### **NODO 3: AI AGENT (Principal)**

**Ubicación:** AI > Agent > AI Agent

#### **Configuración del Agent:**
```
Agent Type: Conversational Agent
```

#### **System Message:**
```
Eres InsightBot, especialista en descubrimiento conversacional para solicitudes tecnológicas UTP.

OBJETIVOS:
- Extraer: problema, objetivo, impacto, plataformas, stakeholders, urgencia
- Mantener conversación natural y empática
- Hacer UNA pregunta principal por respuesta
- Activar componentes ricos cuando sea apropiado

FASES: discovery → clarification → summary → complete

CONTEXTO ACTUAL:
- Mensaje: {{ $json.message }}
- Fase: {{ $json.currentPhase || 'discovery' }}
- Datos extraídos: {{ JSON.stringify($json.extractedData || {}) }}

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

#### **Model Configuration:**
```
Model: Google Gemini
Model Name: gemini-1.5-pro
Temperature: 0.7
Max Tokens: 1000
```

#### **Output Parser:**
```
✅ Has Output Parser: Activado
Output Parser: Structured Output Parser
JSON Schema:
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

**Posición:** (600, 300)

**Conexión:** AI Memory → AI Agent

---

### **NODO 4: AI TOOL - CONTEXT ANALYZER**

**Ubicación:** AI > Tools > Tool Workflow

#### **Configuración:**
```
Tool Name: context_analyzer
Description: Analiza sentimiento, urgencia y entidades del mensaje del usuario
```

#### **Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "message": {"type": "string"},
    "conversation_history": {"type": "array"}
  },
  "required": ["message"]
}
```

#### **Output Schema:**
```json
{
  "type": "object",
  "properties": {
    "sentiment": {"type": "string"},
    "urgency_level": {"type": "string"},
    "mentioned_systems": {"type": "array"},
    "stakeholders": {"type": "array"},
    "project_type": {"type": "string"}
  }
}
```

#### **Sub-Workflow (Crear nuevo workflow):**

**Nodo 1: Webhook Trigger**
```
Path: context-analyzer
Method: POST
```

**Nodo 2: Set (Análisis)**
```javascript
// Análisis de sentimiento
const message = $json.message.toLowerCase();
const sentiment = message.includes('urgente') || message.includes('rápido') ? 'urgent' :
                 message.includes('problema') || message.includes('error') ? 'frustrated' : 'neutral';

// Nivel de urgencia
const urgency_level = message.includes('crítico') || message.includes('emergencia') ? 'critical' :
                     message.includes('urgente') ? 'high' :
                     message.includes('pronto') ? 'medium' : 'low';

// Sistemas mencionados
const mentioned_systems = [];
if (message.includes('canvas')) mentioned_systems.push('Canvas');
if (message.includes('peoplesoft')) mentioned_systems.push('PeopleSoft');
if (message.includes('oracle')) mentioned_systems.push('Oracle');
if (message.includes('sap')) mentioned_systems.push('SAP');

// Stakeholders
const stakeholders = [];
if (message.includes('estudiante')) stakeholders.push('Estudiantes');
if (message.includes('profesor')) stakeholders.push('Profesores');
if (message.includes('administrativo')) stakeholders.push('Personal Administrativo');

// Tipo de proyecto
const project_type = message.includes('sistema') || message.includes('aplicación') ? 'development' :
                    message.includes('reporte') || message.includes('dashboard') ? 'analytics' :
                    message.includes('integración') ? 'integration' : 'general';

return {
  sentiment,
  urgency_level,
  mentioned_systems,
  stakeholders,
  project_type
};
```

**Posición:** (400, 500)

---

### **NODO 5: AI TOOL - DATA EXTRACTOR**

**Ubicación:** AI > Tools > Tool Workflow

#### **Configuración:**
```
Tool Name: data_extractor
Description: Extrae y estructura información específica de la conversación
```

#### **Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "message": {"type": "string"},
    "previous_data": {"type": "object"}
  },
  "required": ["message"]
}
```

#### **Output Schema:**
```json
{
  "type": "object",
  "properties": {
    "problem": {"type": "string"},
    "objective": {"type": "string"},
    "impact": {"type": "string"},
    "platforms": {"type": "array"},
    "stakeholders": {"type": "array"},
    "urgency": {"type": "string"},
    "completeness_percentage": {"type": "number"}
  }
}
```

#### **Sub-Workflow (Crear nuevo workflow):**

**Nodo 1: Webhook Trigger**
```
Path: data-extractor
Method: POST
```

**Nodo 2: Gemini AI Call**
```
Prompt: Extrae información estructurada del mensaje: {{ $json.message }}
Datos previos: {{ JSON.stringify($json.previous_data || {}) }}

Extrae y actualiza:
- problem: descripción del problema
- objective: objetivo del proyecto
- impact: impacto esperado
- platforms: sistemas/plataformas mencionadas
- stakeholders: beneficiarios
- urgency: nivel de urgencia

Responde en JSON con la estructura requerida.
```

**Posición:** (600, 500)

---

### **NODO 6: SUPABASE (Save)**

**Ubicación:** Regular Nodes > Supabase

#### **Configuración:**
```
Operation: Insert
Table: conversations
```

#### **Fields:**
```
conversation_id: ={{ $json.conversationId }}
user_message: ={{ $json.message }}
bot_response: ={{ $json.output.botMessage }}
extracted_data: ={{ JSON.stringify($json.output.extractedData) }}
triggers: ={{ JSON.stringify($json.output.triggers) }}
phase: ={{ $json.output.nextPhase }}
confidence: ={{ $json.output.confidence }}
timestamp: ={{ $now }}
```

**Posición:** (800, 300)

**Conexión:** AI Agent → Supabase

---

## 🔗 **CONEXIONES DEL WORKFLOW**

```
Webhook → AI Memory → AI Agent → Supabase
                        ↓
                   [Tools conectados automáticamente]
                   - Context Analyzer
                   - Data Extractor
```

---

## 🎯 **CONFIGURACIÓN DE CREDENCIALES**

### **Google AI (Gemini)**
1. Ve a **Settings > Credentials**
2. **Add Credential > Google AI**
3. Configura:
   - **API Key**: Tu clave de Google AI
   - **Name**: `Google AI`

### **Supabase**
1. **Add Credential > Supabase**
2. Configura:
   - **Host**: tu-proyecto.supabase.co
   - **Database**: postgres
   - **User**: postgres
   - **Password**: tu-password
   - **Port**: 5432
   - **SSL**: true

---

## 📊 **CONFIGURACIÓN DE MEMORY**

### **Window Buffer Memory Settings:**
```
Session ID Type: Custom Key
Session Key: ={{ $json.conversationId || 'default' }}
Context Window Length: 10
Memory Key: chat_history
Input Key: input
Output Key: output
Return Messages: true
```

---

## 🛠️ **CONFIGURACIÓN AVANZADA DEL AGENTE**

### **Agent Settings:**
```
Agent Type: Conversational Agent
Max Iterations: 5
Early Stopping Method: force
Handle Parsing Errors: true
```

### **Model Settings:**
```
Model Provider: Google AI
Model: gemini-1.5-pro
Temperature: 0.7
Max Output Tokens: 1000
Top P: 0.9
Top K: 40
```

### **Tools Configuration:**
El agente automáticamente detectará y usará los tools configurados:
- `context_analyzer`: Para análisis contextual
- `data_extractor`: Para extracción de datos

---

## 🔍 **TESTING Y VALIDACIÓN**

### **Test Payload:**
```json
{
  "conversationId": "test_123",
  "message": "Necesito un sistema urgente para gestionar estudiantes en Canvas",
  "currentPhase": "discovery",
  "extractedData": {}
}
```

### **Expected Response:**
```json
{
  "botMessage": "Entiendo que necesitas un sistema urgente para gestionar estudiantes en Canvas. ¿Podrías contarme más sobre qué aspectos específicos de la gestión estudiantil te están causando problemas actualmente?",
  "extractedData": {
    "problem": "Gestión de estudiantes",
    "objective": "Sistema de gestión estudiantil",
    "impact": null,
    "platforms": ["Canvas"],
    "stakeholders": ["Estudiantes"],
    "urgency": "high"
  },
  "triggers": {
    "platformSelector": true,
    "summaryCard": false,
    "documentUpload": false,
    "satisfactionSurvey": false
  },
  "nextPhase": "clarification",
  "confidence": 65
}
```

---

## 🚨 **TROUBLESHOOTING**

### **Error: "Agent failed to parse output"**
- Verifica que el JSON Schema esté correcto
- Asegúrate de que el prompt incluya instrucciones claras de formato JSON

### **Error: "Tool not found"**
- Verifica que los sub-workflows de tools estén activos
- Asegúrate de que los nombres de tools coincidan exactamente

### **Error: "Memory not working"**
- Verifica que el Session Key esté configurado correctamente
- Asegúrate de que el conversationId se esté pasando consistentemente

### **Error: "Gemini API"**
- Verifica tu API Key de Google AI
- Asegúrate de tener créditos disponibles
- Verifica que el modelo esté disponible en tu región

---

## ✅ **CHECKLIST DE CONFIGURACIÓN**

- [ ] Webhook configurado con path correcto
- [ ] AI Memory configurado con Session Key
- [ ] AI Agent configurado con Gemini
- [ ] System prompt configurado correctamente
- [ ] JSON Schema configurado
- [ ] Tools creados y configurados
- [ ] Sub-workflows de tools activos
- [ ] Credenciales de Google AI configuradas
- [ ] Credenciales de Supabase configuradas
- [ ] Tabla de BD creada
- [ ] Workflow principal activo
- [ ] Test exitoso con payload de ejemplo

---

## 🎯 **VENTAJAS DE USAR AGENTE IA**

1. **Memory Automática**: Mantiene contexto sin configuración manual
2. **Tools Inteligentes**: El agente decide cuándo usar cada tool
3. **Parsing Automático**: Convierte respuestas a JSON automáticamente
4. **Error Handling**: Manejo inteligente de errores de parsing
5. **Escalabilidad**: Fácil agregar nuevos tools sin modificar el agente
6. **Profesionalidad**: Arquitectura moderna y mantenible

Esta configuración aprovecha al máximo las nuevas capacidades de n8n para crear un agente verdaderamente inteligente y conversacional.
