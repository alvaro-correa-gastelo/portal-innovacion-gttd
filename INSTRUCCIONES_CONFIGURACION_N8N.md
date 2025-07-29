# Instrucciones de Configuración para n8n - InsightBot

## 📋 **ARCHIVOS PARA IMPORTAR**

1. **`InsightBot_Workflow_Import.json`** - Workflow principal de chat
2. **`InsightBot_Finalize_Workflow_Import.json`** - Workflow de finalización

## 🔧 **CONFIGURACIÓN PREVIA REQUERIDA**

### **1. Credenciales en n8n**

#### **Google AI API (Gemini)**
1. Ve a **Settings > Credentials**
2. Crea nueva credencial: **Google AI**
3. Configura:
   - **API Key**: Tu clave de Google AI (Gemini)
   - **Name**: `googleAiApi`

#### **Supabase**
1. Ve a **Settings > Credentials**
2. Crea nueva credencial: **Supabase**
3. Configura:
   - **Host**: Tu URL de Supabase
   - **Database**: postgres
   - **User**: postgres
   - **Password**: Tu password de Supabase
   - **Port**: 5432
   - **SSL**: true

### **2. Base de Datos - Tablas Requeridas**

Ejecuta estos scripts SQL en tu Supabase:

```sql
-- Tabla de conversaciones
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  extracted_data JSONB,
  triggers JSONB,
  phase VARCHAR(50),
  confidence INTEGER,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabla de solicitudes
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending_assignment',
  priority VARCHAR(20) DEFAULT 'medium',
  platforms JSONB,
  stakeholders JSONB,
  technical_report TEXT,
  confidence_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor performance
CREATE INDEX idx_conversations_conversation_id ON conversations(conversation_id);
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp);
CREATE INDEX idx_requests_conversation_id ON requests(conversation_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_at ON requests(created_at);
```

## 📥 **PASOS DE IMPORTACIÓN**

### **Paso 1: Importar Workflow Principal**
1. En n8n, ve a **Workflows**
2. Click **Import from file**
3. Selecciona `InsightBot_Workflow_Import.json`
4. Click **Import**

### **Paso 2: Importar Workflow de Finalización**
1. En n8n, ve a **Workflows**
2. Click **Import from file**
3. Selecciona `InsightBot_Finalize_Workflow_Import.json`
4. Click **Import**

### **Paso 3: Configurar Credenciales**
1. Abre el workflow **InsightBot Agent Workflow**
2. Click en el nodo **Gemini AI Call**
3. En **Authentication**, selecciona tu credencial `googleAiApi`
4. Click en el nodo **Save Conversation**
5. En **Credential**, selecciona tu credencial de Supabase
6. Repite para el workflow **InsightBot Finalize Workflow**

### **Paso 4: Activar Workflows**
1. En **InsightBot Agent Workflow**, click **Active** (toggle)
2. En **InsightBot Finalize Workflow**, click **Active** (toggle)

## 🌐 **ENDPOINTS RESULTANTES**

Una vez activados, tendrás estos endpoints:

### **Chat Principal**
```
POST https://tu-n8n-instance.com/webhook/insightbot/chat
```

**Payload de ejemplo:**
```json
{
  "conversationId": "conv_123",
  "message": "Necesito un sistema para gestionar estudiantes",
  "currentPhase": "discovery",
  "extractedData": {},
  "conversationHistory": []
}
```

**Respuesta:**
```json
{
  "botMessage": "¡Perfecto! Me ayudas a entender mejor tu necesidad...",
  "extractedData": {
    "problem": "Gestión de estudiantes",
    "objective": "Sistema de gestión",
    "impact": null,
    "platforms": [],
    "stakeholders": ["Estudiantes"],
    "urgency": "medium"
  },
  "triggers": {
    "platformSelector": false,
    "summaryCard": false,
    "documentUpload": false,
    "satisfactionSurvey": false
  },
  "nextPhase": "clarification",
  "confidence": 45
}
```

### **Finalización**
```
POST https://tu-n8n-instance.com/webhook/insightbot/finalize
```

**Payload de ejemplo:**
```json
{
  "conversationId": "conv_123",
  "extractedData": {
    "problem": "Gestión manual de estudiantes",
    "objective": "Sistema automatizado de gestión estudiantil",
    "impact": "Reducir tiempo administrativo en 60%",
    "platforms": ["Canvas", "PeopleSoft"],
    "stakeholders": ["Estudiantes", "Personal Administrativo"],
    "urgency": "high"
  },
  "confidence": 85
}
```

**Respuesta:**
```json
{
  "status": "request_created",
  "requestId": "123",
  "message": "Solicitud creada exitosamente y enviada para asignación.",
  "title": "Sistema automatizado de gestión estudiantil",
  "requestData": {
    "id": 123,
    "title": "Sistema automatizado de gestión estudiantil",
    "status": "pending_assignment",
    "priority": "high",
    "created_at": "2025-07-28T23:17:31.000Z"
  }
}
```

## 🔍 **VERIFICACIÓN**

### **Test del Workflow Principal**
1. En n8n, abre **InsightBot Agent Workflow**
2. Click **Test workflow**
3. En el nodo **Webhook Chat Input**, click **Listen for test event**
4. Usa Postman/curl para enviar un POST al webhook con el payload de ejemplo
5. Verifica que todos los nodos se ejecuten correctamente

### **Test del Workflow de Finalización**
1. En n8n, abre **InsightBot Finalize Workflow**
2. Click **Test workflow**
3. En el nodo **Webhook Finalize**, click **Listen for test event**
4. Envía un POST con datos de finalización
5. Verifica que se cree el registro en la tabla `requests`

## 🚨 **TROUBLESHOOTING**

### **Error: "Could not find property option"**
- Verifica que las credenciales estén configuradas correctamente
- Asegúrate de que los nombres de las credenciales coincidan

### **Error en Gemini AI Call**
- Verifica tu API Key de Google AI
- Asegúrate de que tienes créditos disponibles
- Verifica que la URL del endpoint sea correcta

### **Error en Supabase**
- Verifica las credenciales de conexión
- Asegúrate de que las tablas existan
- Verifica que los nombres de campos coincidan

### **Webhook no responde**
- Verifica que el workflow esté **Active**
- Asegúrate de usar la URL correcta del webhook
- Verifica que el método HTTP sea POST

## 📊 **MONITOREO**

### **Logs de Ejecución**
1. Ve a **Executions** en n8n
2. Filtra por workflow name
3. Revisa ejecuciones exitosas y fallidas

### **Base de Datos**
```sql
-- Ver conversaciones recientes
SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 10;

-- Ver solicitudes creadas
SELECT * FROM requests ORDER BY created_at DESC LIMIT 10;

-- Estadísticas de confianza
SELECT 
  AVG(confidence) as avg_confidence,
  COUNT(*) as total_conversations
FROM conversations 
WHERE timestamp > NOW() - INTERVAL '24 hours';
```

## ✅ **CHECKLIST DE CONFIGURACIÓN**

- [ ] Credencial Google AI configurada
- [ ] Credencial Supabase configurada
- [ ] Tablas de BD creadas
- [ ] Workflow principal importado
- [ ] Workflow de finalización importado
- [ ] Credenciales asignadas a nodos
- [ ] Workflows activados
- [ ] Test de webhook principal exitoso
- [ ] Test de webhook finalización exitoso
- [ ] Verificación en base de datos

¡Una vez completado este checklist, InsightBot estará listo para funcionar!
