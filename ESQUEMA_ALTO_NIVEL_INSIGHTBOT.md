# Esquema de Alto Nivel - InsightBot Workflow

## 🔄 **FLUJO PRINCIPAL**

```
ENTRADA → PROCESAMIENTO → SALIDA
```

---

## 📥 **ENTRADA (Input)**

### **Endpoint:** `POST /webhook/insightbot/chat`

### **Payload de Entrada:**
```json
{
  "conversationId": "conv_12345",
  "message": "Necesito un sistema para gestionar estudiantes",
  "currentPhase": "discovery",
  "extractedData": {
    "problem": null,
    "objective": null,
    "impact": null,
    "platforms": [],
    "stakeholders": [],
    "urgency": "low"
  },
  "conversationHistory": [
    {"role": "user", "content": "mensaje anterior"},
    {"role": "assistant", "content": "respuesta anterior"}
  ]
}
```

### **Campos de Entrada:**
- **conversationId**: ID único de la conversación
- **message**: Mensaje actual del usuario
- **currentPhase**: Fase actual (discovery/clarification/summary/complete)
- **extractedData**: Datos extraídos hasta el momento
- **conversationHistory**: Historial de mensajes previos

---

## ⚙️ **PROCESAMIENTO (Workflow Steps)**

### **Paso 1: Validación y Preparación**
- Validar entrada
- Preparar contexto conversacional
- Cargar historial de memoria

### **Paso 2: Análisis Contextual**
- **Análisis de sentimiento**: ¿Está frustrado, urgente, neutral?
- **Detección de urgencia**: critical/high/medium/low
- **Extracción de entidades**: Sistemas mencionados (Canvas, SAP, etc.)
- **Identificación de stakeholders**: Estudiantes, profesores, admin

### **Paso 3: Procesamiento con IA**
- **Agente conversacional** con Gemini 1.5 Pro
- **Extracción inteligente** de información estructurada
- **Generación de respuesta** natural y empática
- **Evaluación de completitud** de la información

### **Paso 4: Evaluación de Triggers**
- **¿Mostrar selector de plataformas?** (si menciona sistemas)
- **¿Mostrar tarjeta resumen?** (si completitud > 70%)
- **¿Habilitar carga de documentos?** (si menciona archivos)
- **¿Mostrar encuesta de satisfacción?** (si completitud > 85%)

### **Paso 5: Persistencia**
- Guardar mensaje del usuario
- Guardar respuesta del bot
- Actualizar datos extraídos
- Registrar triggers activados

---

## 📤 **SALIDA (Output)**

### **Respuesta Principal:**
```json
{
  "botMessage": "Entiendo que necesitas un sistema para gestionar estudiantes. ¿Podrías contarme qué problemas específicos tienes actualmente con la gestión estudiantil?",
  "extractedData": {
    "problem": "Gestión de estudiantes",
    "objective": "Sistema de gestión estudiantil",
    "impact": null,
    "platforms": [],
    "stakeholders": ["Estudiantes"],
    "urgency": "medium"
  },
  "triggers": {
    "platformSelector": false,
    "summaryCard": false,
    "documentUpload": false,
    "satisfactionSurvey": false,
    "urgencyIndicator": false
  },
  "nextPhase": "clarification",
  "confidence": 45
}
```

### **Campos de Salida:**
- **botMessage**: Respuesta conversacional natural
- **extractedData**: Información estructurada extraída
- **triggers**: Componentes UI a activar en el frontend
- **nextPhase**: Siguiente fase de la conversación
- **confidence**: Nivel de confianza (0-100)

---

## 🎯 **LÓGICA DE NEGOCIO**

### **Extracción de Datos:**
```
SI mensaje contiene "problema" → extraer problem
SI mensaje contiene "necesito/quiero" → extraer objective  
SI mensaje contiene "beneficio/impacto" → extraer impact
SI mensaje contiene "Canvas/SAP/Oracle" → extraer platforms
SI mensaje contiene "estudiante/profesor" → extraer stakeholders
SI mensaje contiene "urgente/crítico" → extraer urgency
```

### **Evaluación de Triggers:**
```
platformSelector = platforms.length > 0
summaryCard = confidence >= 70 AND messageCount >= 4
documentUpload = message.includes("documento|archivo")
satisfactionSurvey = confidence >= 85
urgencyIndicator = urgency IN ["high", "critical"]
```

### **Cálculo de Confianza:**
```
confidence = (
  (problem ? 25 : 0) +
  (objective ? 25 : 0) +
  (impact ? 20 : 0) +
  (platforms.length > 0 ? 15 : 0) +
  (stakeholders.length > 0 ? 10 : 0) +
  (urgency != "low" ? 5 : 0)
)
```

### **Determinación de Fase:**
```
SI confidence < 30 → "discovery"
SI confidence < 70 → "clarification"  
SI confidence < 85 → "summary"
SI confidence >= 85 → "complete"
```

---

## 🔄 **FLUJO DE CONVERSACIÓN**

### **Fase Discovery (0-30% confianza):**
- Preguntas abiertas para entender el problema
- Identificar stakeholders principales
- Detectar sistemas involucrados

### **Fase Clarification (30-70% confianza):**
- Preguntas específicas para completar información
- Validar datos extraídos
- Profundizar en impacto y urgencia

### **Fase Summary (70-85% confianza):**
- Mostrar resumen de información
- Confirmar datos con el usuario
- Activar componentes ricos

### **Fase Complete (85%+ confianza):**
- Conversación lista para finalizar
- Mostrar encuesta de satisfacción
- Preparar para crear solicitud

---

## 📊 **MÉTRICAS Y MONITOREO**

### **Métricas a Trackear:**
- **Tiempo promedio** de conversación
- **Número de mensajes** hasta completar
- **Tasa de conversión** a solicitudes
- **Nivel de confianza** promedio
- **Triggers más activados**

### **Datos para Analytics:**
- Conversaciones por día
- Fases más largas
- Sistemas más mencionados
- Stakeholders más frecuentes
- Niveles de urgencia

---

## 🎯 **CASOS DE USO TÍPICOS**

### **Caso 1: Usuario Claro**
```
Input: "Necesito urgente un dashboard en Canvas para profesores"
Output: confidence=65, triggers={platformSelector: true, urgencyIndicator: true}
```

### **Caso 2: Usuario Vago**
```
Input: "Tengo un problema con los estudiantes"
Output: confidence=15, nextPhase="discovery", pregunta específica
```

### **Caso 3: Usuario Completo**
```
Input: "Necesito integrar Canvas con PeopleSoft para automatizar matrículas de 5000 estudiantes, es crítico para el próximo semestre"
Output: confidence=90, triggers={summaryCard: true, satisfactionSurvey: true}
```

---

## 🔧 **CONFIGURACIÓN TÉCNICA**

### **Modelo IA:**
- **Gemini 1.5 Pro** con temperatura 0.7
- **Memory window** de 10 mensajes
- **JSON Schema** para respuestas estructuradas

### **Base de Datos:**
- **Tabla conversations**: Historial completo
- **Tabla requests**: Solicitudes finalizadas
- **Índices**: Por conversationId y timestamp

### **Endpoints:**
- **POST /chat**: Conversación principal
- **POST /finalize**: Crear solicitud final

Este esquema te permite implementar el workflow paso a paso, entendiendo exactamente qué debe hacer cada componente.
