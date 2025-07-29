# Workflow n8n Optimizado para InsightBot (Agente 1)
## Usando Agentes de IA con Tools, Memory y LLM Gemini

**Versión:** 3.0  
**Fecha:** 28 de julio de 2025  
**Propósito:** Workflow conciso y preciso usando los nuevos nodos de Agentes de IA de n8n.

---

## 🎯 **ANÁLISIS DE NODOS DISPONIBLES**

### **Nodos de Agentes de IA en n8n:**
1. **AI Agent** - Nodo principal para agentes inteligentes
2. **AI Memory** - Gestión de memoria conversacional
3. **AI Tool** - Herramientas específicas para el agente
4. **Google Gemini** - LLM principal
5. **Webhook** - Trigger de entrada
6. **Supabase** - Persistencia de datos
7. **Switch** - Lógica condicional
8. **Set** - Manipulación de datos

---

## 📋 **LISTA DE NODOS DEL WORKFLOW**

### **Workflow Principal: InsightBot_Agent**
1. **Webhook** (Trigger) - Recibe mensajes del frontend
2. **AI Memory** - Carga/gestiona contexto conversacional
3. **AI Agent** - Agente principal con Gemini + Tools
4. **AI Tool: Context Analyzer** - Analiza sentimiento y entidades
5. **AI Tool: Trigger Evaluator** - Evalúa componentes ricos
6. **AI Tool: Data Extractor** - Extrae información estructurada
7. **Supabase Save** - Persiste conversación
8. **Switch** - Decide si finalizar o continuar
9. **Response Formatter** - Formatea respuesta final

### **Workflow Secundario: Finalize_Request**
10. **Webhook Finalize** (Trigger) - Recibe solicitud de finalización
11. **AI Agent Report** - Genera informe técnico
12. **Supabase Create Request** - Crea solicitud en BD
13. **Auto Assignment** - Asigna a líder correspondiente

---

## 🤖 **CONFIGURACIÓN DE AGENTES Y TOOLS**

### **Agente Principal: InsightBot**
```yaml
Nombre: InsightBot_Conversational_Agent
LLM: Google Gemini 1.5 Pro
Temperatura: 0.7
Max Tokens: 1000
System Prompt: |
  Eres InsightBot, especialista en descubrimiento conversacional para solicitudes tecnológicas UTP.
  
  OBJETIVOS:
  - Extraer: problema, objetivo, impacto, plataformas, stakeholders, urgencia
  - Mantener conversación natural y empática
  - Hacer UNA pregunta principal por respuesta
  - Activar componentes ricos cuando sea apropiado
  
  FASES: discovery → clarification → summary → complete
  
  Responde siempre en JSON con: botMessage, extractedData, triggers, nextPhase, confidence

Tools Disponibles:
- context_analyzer
- trigger_evaluator  
- data_extractor
```

### **Tool 1: Context Analyzer**
```yaml
Nombre: context_analyzer
Descripción: Analiza sentimiento, urgencia y entidades del mensaje
Parámetros:
  - message (string): Mensaje del usuario
  - conversation_history (array): Historial previo
Retorna:
  - sentiment: urgent|frustrated|neutral|enthusiastic
  - urgency_level: low|medium|high|critical
  - mentioned_systems: array de sistemas detectados
  - stakeholders: array de beneficiarios identificados
  - project_type: development|analytics|integration|general
```

### **Tool 2: Trigger Evaluator**
```yaml
Nombre: trigger_evaluator
Descripción: Evalúa qué componentes ricos activar
Parámetros:
  - extracted_data (object): Datos extraídos hasta ahora
  - message_count (number): Número de mensajes
  - completeness_score (number): Porcentaje de completitud
Retorna:
  - platform_selector: boolean
  - summary_card: boolean
  - document_upload: boolean
  - satisfaction_survey: boolean
  - urgency_indicator: boolean
```

### **Tool 3: Data Extractor**
```yaml
Nombre: data_extractor
Descripción: Extrae y estructura información de la conversación
Parámetros:
  - message (string): Mensaje actual
  - previous_data (object): Datos extraídos previamente
Retorna:
  - problem: string|null
  - objective: string|null
  - impact: string|null
  - platforms: array
  - stakeholders: array
  - urgency: low|medium|high|critical
  - budget: string|null
  - timeline: string|null
  - completeness_percentage: number
```

---

## 🔄 **JSON DEL WORKFLOW COMPLETO**

```json
{
  "name": "InsightBot_Agent_Workflow",
  "nodes": [
    {
      "parameters": {
        "path": "insightbot/chat",
        "httpMethod": "POST",
        "responseMode": "lastNode",
        "options": {
          "rawBody": true
        }
      },
      "id": "webhook-trigger",
      "name": "Webhook Chat Input",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [200, 300]
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "={{ $json.conversationId || 'default' }}",
        "contextWindowLength": 10
      },
      "id": "ai-memory",
      "name": "AI Memory Manager",
      "type": "@n8n/n8n-nodes-langchain.memoryManager",
      "typeVersion": 1,
      "position": [400, 300]
    },
    {
      "parameters": {
        "agent": "conversationalAgent",
        "promptType": "define",
        "text": "Eres InsightBot, especialista en descubrimiento conversacional para solicitudes tecnológicas UTP.\n\nOBJETIVOS:\n- Extraer: problema, objetivo, impacto, plataformas, stakeholders, urgencia\n- Mantener conversación natural y empática\n- Hacer UNA pregunta principal por respuesta\n- Activar componentes ricos cuando sea apropiado\n\nFASES: discovery → clarification → summary → complete\n\nResponde siempre en JSON con: botMessage, extractedData, triggers, nextPhase, confidence",
        "hasOutputParser": true,
        "outputParser": "structuredOutputParser",
        "jsonSchema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"botMessage\": {\"type\": \"string\"},\n    \"extractedData\": {\n      \"type\": \"object\",\n      \"properties\": {\n        \"problem\": {\"type\": \"string\"},\n        \"objective\": {\"type\": \"string\"},\n        \"impact\": {\"type\": \"string\"},\n        \"platforms\": {\"type\": \"array\"},\n        \"stakeholders\": {\"type\": \"array\"},\n        \"urgency\": {\"type\": \"string\"}\n      }\n    },\n    \"triggers\": {\n      \"type\": \"object\",\n      \"properties\": {\n        \"platformSelector\": {\"type\": \"boolean\"},\n        \"summaryCard\": {\"type\": \"boolean\"},\n        \"documentUpload\": {\"type\": \"boolean\"},\n        \"satisfactionSurvey\": {\"type\": \"boolean\"}\n      }\n    },\n    \"nextPhase\": {\"type\": \"string\"},\n    \"confidence\": {\"type\": \"number\"}\n  }\n}",
        "model": {
          "model": "gemini-1.5-pro",
          "options": {
            "temperature": 0.7,
            "maxOutputTokens": 1000
          }
        }
      },
      "id": "ai-agent-main",
      "name": "InsightBot AI Agent",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1,
      "position": [600, 300]
    },
    {
      "parameters": {
        "name": "context_analyzer",
        "description": "Analiza sentimiento, urgencia y entidades del mensaje del usuario",
        "workflowId": "{{ $workflow.id }}",
        "specifyInputSchema": true,
        "inputSchema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"message\": {\"type\": \"string\"},\n    \"conversation_history\": {\"type\": \"array\"}\n  },\n  \"required\": [\"message\"]\n}",
        "specifyOutputSchema": true,
        "outputSchema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"sentiment\": {\"type\": \"string\"},\n    \"urgency_level\": {\"type\": \"string\"},\n    \"mentioned_systems\": {\"type\": \"array\"},\n    \"stakeholders\": {\"type\": \"array\"},\n    \"project_type\": {\"type\": \"string\"}\n  }\n}"
      },
      "id": "tool-context-analyzer",
      "name": "Context Analyzer Tool",
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 1,
      "position": [400, 500]
    },
    {
      "parameters": {
        "name": "trigger_evaluator",
        "description": "Evalúa qué componentes ricos activar basado en el contexto",
        "workflowId": "{{ $workflow.id }}",
        "specifyInputSchema": true,
        "inputSchema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"extracted_data\": {\"type\": \"object\"},\n    \"message_count\": {\"type\": \"number\"},\n    \"completeness_score\": {\"type\": \"number\"}\n  }\n}",
        "specifyOutputSchema": true,
        "outputSchema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"platform_selector\": {\"type\": \"boolean\"},\n    \"summary_card\": {\"type\": \"boolean\"},\n    \"document_upload\": {\"type\": \"boolean\"},\n    \"satisfaction_survey\": {\"type\": \"boolean\"},\n    \"urgency_indicator\": {\"type\": \"boolean\"}\n  }\n}"
      },
      "id": "tool-trigger-evaluator",
      "name": "Trigger Evaluator Tool",
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 1,
      "position": [600, 500]
    },
    {
      "parameters": {
        "name": "data_extractor",
        "description": "Extrae y estructura información específica de la conversación",
        "workflowId": "{{ $workflow.id }}",
        "specifyInputSchema": true,
        "inputSchema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"message\": {\"type\": \"string\"},\n    \"previous_data\": {\"type\": \"object\"}\n  },\n  \"required\": [\"message\"]\n}",
        "specifyOutputSchema": true,
        "outputSchema": "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"problem\": {\"type\": \"string\"},\n    \"objective\": {\"type\": \"string\"},\n    \"impact\": {\"type\": \"string\"},\n    \"platforms\": {\"type\": \"array\"},\n    \"stakeholders\": {\"type\": \"array\"},\n    \"urgency\": {\"type\": \"string\"},\n    \"completeness_percentage\": {\"type\": \"number\"}\n  }\n}"
      },
      "id": "tool-data-extractor",
      "name": "Data Extractor Tool",
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 1,
      "position": [800, 500]
    },
    {
      "parameters": {
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
            },
            {
              "fieldId": "timestamp",
              "fieldValue": "={{ $now }}"
            }
          ]
        }
      },
      "id": "supabase-save",
      "name": "Save Conversation",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [800, 300]
    },
    {
      "parameters": {
        "dataType": "number",
        "value1": "={{ $json.output.confidence }}",
        "rules": {
          "rules": [
            {
              "operation": "largerEqual",
              "value2": 85,
              "output": 0
            },
            {
              "operation": "smaller",
              "value2": 85,
              "output": 1
            }
          ]
        }
      },
      "id": "completion-switch",
      "name": "Completion Decision",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3,
      "position": [1000, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "ready_to_finalize"
            },
            {
              "name": "message",
              "value": "Conversación completa. Lista para finalizar."
            }
          ]
        }
      },
      "id": "ready-to-finalize",
      "name": "Ready to Finalize",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3,
      "position": [1200, 200]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "continue_conversation"
            }
          ]
        }
      },
      "id": "continue-conversation",
      "name": "Continue Conversation",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3,
      "position": [1200, 400]
    }
  ],
  "connections": {
    "Webhook Chat Input": {
      "main": [
        [
          {
            "node": "AI Memory Manager",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI Memory Manager": {
      "main": [
        [
          {
            "node": "InsightBot AI Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "InsightBot AI Agent": {
      "main": [
        [
          {
            "node": "Save Conversation",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Save Conversation": {
      "main": [
        [
          {
            "node": "Completion Decision",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Completion Decision": {
      "main": [
        [
          {
            "node": "Ready to Finalize",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Continue Conversation",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "tags": [
    {
      "createdAt": "2025-07-28T23:07:52.000Z",
      "updatedAt": "2025-07-28T23:07:52.000Z",
      "id": "insightbot",
      "name": "InsightBot"
    }
  ],
  "triggerCount": 1,
  "updatedAt": "2025-07-28T23:07:52.000Z",
  "versionId": "1"
}
```

---

## 🔄 **WORKFLOW SECUNDARIO: Finalización**

```json
{
  "name": "InsightBot_Finalize_Workflow",
  "nodes": [
    {
      "parameters": {
        "path": "insightbot/finalize",
        "httpMethod": "POST",
        "responseMode": "lastNode"
      },
      "id": "webhook-finalize",
      "name": "Webhook Finalize",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [200, 300]
    },
    {
      "parameters": {
        "agent": "conversationalAgent",
        "promptType": "define",
        "text": "Genera un informe técnico profesional basado en los datos extraídos de la conversación.\n\nIncluye:\n1. Resumen Ejecutivo\n2. Análisis Técnico\n3. Recomendaciones\n4. Estimación de Recursos\n5. Próximos Pasos\n\nFormato: Documento estructurado y profesional.",
        "model": {
          "model": "gemini-1.5-pro",
          "options": {
            "temperature": 0.3,
            "maxOutputTokens": 2000
          }
        }
      },
      "id": "ai-report-generator",
      "name": "AI Report Generator",
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1,
      "position": [400, 300]
    },
    {
      "parameters": {
        "operation": "insert",
        "table": "requests",
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "conversation_id",
              "fieldValue": "={{ $json.conversationId }}"
            },
            {
              "fieldId": "title",
              "fieldValue": "={{ $json.extractedData.objective || 'Nueva Solicitud Tecnológica' }}"
            },
            {
              "fieldId": "description",
              "fieldValue": "={{ $json.extractedData.problem }}"
            },
            {
              "fieldId": "status",
              "fieldValue": "pending_assignment"
            },
            {
              "fieldId": "priority",
              "fieldValue": "={{ $json.extractedData.urgency }}"
            },
            {
              "fieldId": "technical_report",
              "fieldValue": "={{ $json.output }}"
            },
            {
              "fieldId": "confidence_score",
              "fieldValue": "={{ $json.confidence }}"
            },
            {
              "fieldId": "created_at",
              "fieldValue": "={{ $now }}"
            }
          ]
        }
      },
      "id": "create-request",
      "name": "Create Request Record",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [600, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "status",
              "value": "request_created"
            },
            {
              "name": "requestId",
              "value": "={{ $json.id }}"
            },
            {
              "name": "message",
              "value": "Solicitud creada exitosamente y enviada para asignación."
            }
          ]
        }
      },
      "id": "success-response",
      "name": "Success Response",
      "type": "n8n-nodes-base.set",
      "typeVersion": 3,
      "position": [800, 300]
    }
  ],
  "connections": {
    "Webhook Finalize": {
      "main": [
        [
          {
            "node": "AI Report Generator",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI Report Generator": {
      "main": [
        [
          {
            "node": "Create Request Record",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Request Record": {
      "main": [
        [
          {
            "node": "Success Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "tags": [
    {
      "id": "insightbot-finalize",
      "name": "InsightBot Finalize"
    }
  ],
  "triggerCount": 1,
  "updatedAt": "2025-07-28T23:07:52.000Z",
  "versionId": "1"
}
```

---

## 🎯 **VENTAJAS DE ESTA ARQUITECTURA**

1. **Conciso:** Solo 10 nodos principales vs 23+ anteriores
2. **Inteligente:** Usa AI Agents nativos con memory y tools
3. **Modular:** Tools reutilizables y especializados
4. **Escalable:** Fácil agregar nuevos tools
5. **Profesional:** Sin nodos de código, solo configuración
6. **Mantenible:** Lógica clara y separada por responsabilidades

## 📋 **CONFIGURACIÓN REQUERIDA**

### **Credenciales:**
- Google AI API (para Gemini)
- Supabase (para persistencia)

### **Variables de Entorno:**
```env
GOOGLE_AI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### **Tablas de Base de Datos:**
```sql
-- Conversaciones
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

-- Solicitudes
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255),
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  priority VARCHAR(20),
  technical_report TEXT,
  confidence_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Este workflow optimizado aprovecha al máximo las capacidades de los Agentes de IA de n8n, resultando en un flujo más inteligente, conciso y profesional.
