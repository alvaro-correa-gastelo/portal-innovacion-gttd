# 🤖 AGENTE 1 - CLASIFICADOR DE INTENCIONES
## Documentación del Flujo Completo

### 📊 **RESUMEN EJECUTIVO**
El Agente 1 es el punto de entrada del sistema educativo inteligente. Su función principal es **clasificar la intención** del usuario y **preparar el contexto** para los agentes especializados.

---

## 🔄 **FLUJO COMPLETO DEL AGENTE 1**

### **1. ENTRADA DEL SISTEMA**
- **Webhook** recibe la consulta del usuario
- **Datos de entrada:**
  - `user_query`: Pregunta/mensaje del usuario
  - `user_profile`: Perfil del usuario (ID, nombre, departamento, rol, etc.)
  - `user_context`: Contexto adicional

### **2. GESTIÓN DE SESIONES**

#### **2.1 Verificación de Sesión Existente**
```sql
SELECT * FROM user_sessions 
WHERE user_id = $user_id 
AND status = 'active' 
ORDER BY created_at DESC 
LIMIT 1
```

**Resultados posibles:**
- ✅ **Sesión encontrada** → Continuar conversación existente
- ❌ **No hay sesión** → Crear nueva sesión

#### **2.2 Creación de Nueva Sesión (si es necesario)**
```sql
INSERT INTO user_sessions (
  session_id, user_id, current_stage, 
  completeness_score, conversation_data, status
) VALUES (
  $session_id, $user_id, 'start', 
  0, '{}', 'active'
)
```

### **3. GESTIÓN DEL HISTORIAL**

#### **3.1 Lógica Condicional del Historial**
```javascript
if (isExistingSession) {
  // CARGAR historial de la sesión actual
  conversationHistory = loadHistoryFromDB();
} else {
  // NO CARGAR historial (conversación nueva)
  conversationHistory = [];
}
```

#### **3.2 Consulta del Historial (solo sesiones existentes)**
```sql
SELECT role, message, created_at 
FROM conversation_history 
WHERE session_id = $session_id 
ORDER BY created_at ASC
```

### **4. COMBINACIÓN DE DATOS**

#### **4.1 Estructura del Input para Text Classifier**
```javascript
{
  text: `Usuario: ${name} (${department})
Mensaje: ${user_query}
Etapa actual: ${current_stage}
Completitud: ${completeness_score}%
Estado: ${status}
Tipo de sesión: ${isExistingSession ? 'Continuación' : 'Nueva'}
${historyText}`,

  session_data: {
    session_id,
    user_query,
    current_step,
    user_profile,
    completeness_score,
    conversation_data,
    user_context,
    conversation_history,
    is_existing_session
  }
}
```

### **5. CLASIFICACIÓN DE INTENCIONES**

#### **5.1 Text Classifier (OpenAI)**
**Entrada:** Texto estructurado con contexto completo
**Salida:** Clasificación de la intención del usuario

**Categorías esperadas:**
- 📚 **Consulta académica** → Agente Académico
- 🔧 **Problema técnico** → Agente Técnico  
- 📋 **Proceso administrativo** → Agente Administrativo
- ❓ **Consulta general** → Agente General
- 🆘 **Escalación** → Agente Humano

---

## 🎯 **ESTADOS DEL SISTEMA**

### **Tipos de Sesión**
1. **Nueva Sesión**
   - `current_stage: 'start'`
   - `completeness_score: 0`
   - `conversation_history: []`
   - Sin historial previo

2. **Sesión Existente**
   - `current_stage: variable`
   - `completeness_score: 0-100`
   - `conversation_history: [mensajes...]`
   - Con contexto previo

### **Flujo de Datos**
```
Webhook → Combinar Datos → Verificar Sesión → [Crear Sesión] → 
[Extraer Historial] → Combinar Todo → Text Classifier → Agente Especializado
```

---

## 🚀 **PRÓXIMOS PASOS SUGERIDOS**

### **FASE 2: AGENTES ESPECIALIZADOS**

#### **1. Agente Académico** 🎓
- **Función:** Responder consultas sobre materias, tareas, exámenes
- **Entrada:** Datos del Agente 1 + clasificación "académica"
- **Salida:** Respuesta educativa personalizada

#### **2. Agente Técnico** 🔧
- **Función:** Resolver problemas técnicos (plataformas, acceso, etc.)
- **Entrada:** Datos del Agente 1 + clasificación "técnica"
- **Salida:** Solución técnica paso a paso

#### **3. Agente Administrativo** 📋
- **Función:** Procesos administrativos (inscripciones, certificados, etc.)
- **Entrada:** Datos del Agente 1 + clasificación "administrativa"
- **Salida:** Guía de procesos administrativos

#### **4. Agente de Seguimiento** 📊
- **Función:** Actualizar sesiones, guardar respuestas, métricas
- **Entrada:** Respuesta de cualquier agente especializado
- **Salida:** Sesión actualizada + historial guardado

### **FASE 3: MEJORAS AVANZADAS**

#### **1. Sistema de Escalación**
- Detección automática de consultas complejas
- Transferencia a agentes humanos
- Sistema de tickets

#### **2. Análisis de Sentimientos**
- Detección de frustración/satisfacción
- Ajuste del tono de respuesta
- Métricas de experiencia

#### **3. Personalización Avanzada**
- Aprendizaje de preferencias del usuario
- Adaptación del estilo de comunicación
- Recomendaciones proactivas

---

## 📈 **MÉTRICAS Y MONITOREO**

### **KPIs del Agente 1**
- ✅ **Precisión de clasificación** (% intenciones correctas)
- ⚡ **Tiempo de respuesta** (ms)
- 🔄 **Tasa de sesiones continuadas** vs nuevas
- 📊 **Distribución de tipos de consulta**

### **Logs Importantes**
- Sesiones creadas vs reutilizadas
- Errores en carga de historial
- Tiempo de procesamiento por componente
- Clasificaciones por categoría

---

## 🛠️ **CONFIGURACIÓN TÉCNICA**

### **Nodos n8n Utilizados**
1. **Webhook** - Entrada del sistema
2. **Postgres** - Gestión de sesiones e historial
3. **Code** - Lógica de combinación de datos
4. **OpenAI Text Classifier** - Clasificación de intenciones
5. **Switch** - Enrutamiento a agentes especializados

### **Base de Datos**
- **Tabla:** `user_sessions`
- **Tabla:** `conversation_history`
- **Índices:** user_id, session_id, created_at

---

## ✅ **ESTADO ACTUAL**
- [x] Gestión de sesiones ✅
- [x] Carga condicional de historial ✅
- [x] Combinación de datos ✅
- [x] Clasificación de intenciones ✅
- [ ] Agentes especializados 🚧
- [ ] Sistema de seguimiento 🚧
- [ ] Métricas y monitoreo 🚧

**El Agente 1 está COMPLETO y listo para integrar con los agentes especializados.** 🎉
