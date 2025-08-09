# EJEMPLOS DE CONVERSACIÓN MULTI-TURNO - DISCOVERY AGENT

## 🎯 **EJEMPLO 1: SOLICITUD SIMPLE → COMPLEJA**

### **Turno 1**
**Usuario**: "Canvas está lento"

**Discovery Agent Response**:
```json
{
  "session_state": "discovering",
  "completeness_score": 25,
  "response_message": "Entiendo que tienes problemas con la velocidad de Canvas. Para ayudarte mejor, ¿podrías ser más específico sobre qué parte de Canvas está lenta? Por ejemplo: ¿es al subir calificaciones, cargar archivos, acceder a cursos, o algo más?",
  "next_question": "¿Qué específicamente está lento en Canvas?",
  "extracted_info": {
    "titulo_solicitud": "Problema de rendimiento en Canvas",
    "problema_principal": "Canvas presenta lentitud",
    "plataformas_involucradas": ["Canvas"],
    "departamento_solicitante": "Académico"
  },
  "missing_fields": ["objetivo_esperado", "beneficiarios", "urgencia", "frecuencia_uso"],
  "conversation_context": "Usuario reporta lentitud en Canvas, necesita especificar qué funcionalidad"
}
```

### **Turno 2**
**Usuario**: "Las calificaciones, no puedo subirlas rápido"

**Discovery Agent Response**:
```json
{
  "session_state": "discovering", 
  "completeness_score": 50,
  "response_message": "Perfecto, entiendo que el problema es específicamente con la carga de calificaciones en Canvas. Esto puede afectar tu trabajo diario. ¿Aproximadamente cuántos estudiantes tienes en tus cursos? Y ¿este problema también lo experimentan otros profesores de tu área?",
  "next_question": "¿Cuántos estudiantes tienes y si otros profesores tienen el mismo problema?",
  "extracted_info": {
    "titulo_solicitud": "Lentitud en carga de calificaciones en Canvas",
    "problema_principal": "Canvas presenta lentitud al subir calificaciones",
    "objetivo_esperado": "Mejorar velocidad de carga de calificaciones",
    "plataformas_involucradas": ["Canvas"],
    "frecuencia_uso": "diario",
    "departamento_solicitante": "Académico"
  },
  "missing_fields": ["beneficiarios", "urgencia"],
  "conversation_context": "Problema específico: lentitud en calificaciones de Canvas, uso diario confirmado"
}
```

### **Turno 3**
**Usuario**: "Tengo como 120 estudiantes en total, y sí, otros 3 profesores me han comentado lo mismo"

**Discovery Agent Response**:
```json
{
  "session_state": "ready_for_analysis",
  "completeness_score": 85,
  "response_message": "Excelente, ya tengo la información necesaria. El problema afecta a múltiples profesores y un número considerable de estudiantes. Una última pregunta: ¿qué tan urgente es resolver esto? ¿Tienes fechas límite próximas para subir calificaciones?",
  "extracted_info": {
    "titulo_solicitud": "Optimización de rendimiento para carga de calificaciones en Canvas",
    "problema_principal": "Canvas presenta lentitud significativa al subir calificaciones, afectando el trabajo diario de profesores",
    "objetivo_esperado": "Mejorar velocidad y eficiencia de carga de calificaciones en Canvas",
    "plataformas_involucradas": ["Canvas"],
    "beneficiarios": "4 profesores y aproximadamente 120 estudiantes del área académica",
    "frecuencia_uso": "diario",
    "urgencia": "alta",
    "departamento_solicitante": "Académico"
  },
  "missing_fields": [],
  "conversation_context": "Información completa recopilada: problema de rendimiento en Canvas afecta a múltiples usuarios, listo para análisis"
}
```

---

## 🎯 **EJEMPLO 2: SOLICITUD ADMINISTRATIVA**

### **Turno 1**
**Usuario**: "Necesito reportes automáticos"

**Discovery Agent Response**:
```json
{
  "session_state": "discovering",
  "completeness_score": 15,
  "response_message": "Entiendo que necesitas automatizar algunos reportes. Para diseñar la mejor solución, ¿podrías contarme qué tipo de reportes necesitas? Por ejemplo: ¿son reportes de empleados, financieros, de estudiantes, o de qué área específica?",
  "next_question": "¿Qué tipo de reportes específicos necesitas automatizar?",
  "extracted_info": {
    "titulo_solicitud": "Automatización de reportes",
    "objetivo_esperado": "Generar reportes de forma automática",
    "departamento_solicitante": "Administrativo"
  },
  "missing_fields": ["problema_principal", "plataformas_involucradas", "beneficiarios", "urgencia", "frecuencia_uso"],
  "conversation_context": "Usuario solicita automatización de reportes, necesita especificar tipo y fuente de datos"
}
```

### **Turno 2**
**Usuario**: "Reportes de asistencia de empleados, los saco manualmente de PeopleSoft cada semana"

**Discovery Agent Response**:
```json
{
  "session_state": "discovering",
  "completeness_score": 60,
  "response_message": "Perfecto, entiendo que actualmente extraes manualmente los reportes de asistencia desde PeopleSoft cada semana. Esto debe tomar bastante tiempo. ¿Aproximadamente cuánto tiempo te toma hacer este proceso manual? Y ¿estos reportes son para tu uso o los comparte con otras personas?",
  "next_question": "¿Cuánto tiempo toma el proceso manual y quién usa estos reportes?",
  "extracted_info": {
    "titulo_solicitud": "Automatización de reportes de asistencia desde PeopleSoft",
    "problema_principal": "Extracción manual semanal de reportes de asistencia desde PeopleSoft consume tiempo",
    "objetivo_esperado": "Automatizar generación de reportes de asistencia de empleados",
    "plataformas_involucradas": ["PeopleSoft"],
    "frecuencia_uso": "semanal",
    "departamento_solicitante": "Administrativo"
  },
  "missing_fields": ["beneficiarios", "urgencia"],
  "conversation_context": "Proceso manual semanal identificado, extrae datos de PeopleSoft, necesita conocer beneficiarios y urgencia"
}
```

---

## 🎯 **EJEMPLO 3: SOLICITUD TÉCNICA COMPLEJA**

### **Turno 1**
**Usuario**: "Quiero integrar sistemas para automatizar procesos"

**Discovery Agent Response**:
```json
{
  "session_state": "discovering",
  "completeness_score": 20,
  "response_message": "Me parece una excelente idea automatizar procesos mediante integración de sistemas. Para entender mejor tu necesidad, ¿podrías contarme qué sistemas específicos quieres integrar? Por ejemplo: ¿Canvas con SAP, PeopleSoft con Office 365, u otros?",
  "next_question": "¿Qué sistemas específicos quieres integrar?",
  "extracted_info": {
    "titulo_solicitud": "Integración de sistemas para automatización",
    "objetivo_esperado": "Automatizar procesos mediante integración de sistemas",
    "departamento_solicitante": "GTTD"
  },
  "missing_fields": ["problema_principal", "plataformas_involucradas", "beneficiarios", "urgencia", "frecuencia_uso"],
  "conversation_context": "Solicitud de integración de sistemas, necesita especificar cuáles y para qué proceso"
}
```

### **Turno 2**
**Usuario**: "Canvas con SAP, para que las calificaciones se reflejen automáticamente en el sistema financiero para becas"

**Discovery Agent Response**:
```json
{
  "session_state": "discovering",
  "completeness_score": 70,
  "response_message": "Excelente, entiendo que quieres integrar Canvas con SAP para automatizar el proceso de becas basado en calificaciones. Esto suena como un proyecto importante. ¿Aproximadamente cuántos estudiantes con becas se beneficiarían de esta automatización? Y ¿qué tan urgente es implementar esto?",
  "next_question": "¿Cuántos estudiantes con becas se beneficiarían y cuál es la urgencia?",
  "extracted_info": {
    "titulo_solicitud": "Integración Canvas-SAP para automatización de proceso de becas",
    "problema_principal": "Proceso manual de transferencia de calificaciones de Canvas a SAP para gestión de becas",
    "objetivo_esperado": "Automatizar transferencia de calificaciones de Canvas a SAP para proceso de becas",
    "plataformas_involucradas": ["Canvas", "SAP"],
    "frecuencia_uso": "mensual",
    "departamento_solicitante": "GTTD"
  },
  "missing_fields": ["beneficiarios", "urgencia"],
  "conversation_context": "Integración compleja Canvas-SAP para automatizar becas, proceso mensual, necesita cuantificar beneficiarios"
}
```

---

## 📊 **PATRONES DE COMPLETITUD**

### **Scoring de Completitud:**
- **Campos obligatorios** (40 puntos c/u):
  - problema_principal
  - objetivo_esperado

- **Campos importantes** (5 puntos c/u):
  - plataformas_involucradas
  - beneficiarios  
  - urgencia
  - frecuencia_uso

### **Estados de Sesión:**
- **discovering** (0-69%): Continuar preguntando
- **ready_for_analysis** (70-89%): Proceder al scoring
- **completed** (90-100%): Información completa, ir directo a summary

### **Estrategia de Preguntas:**
1. **Problema específico** → ¿Qué exactamente no funciona?
2. **Plataformas** → ¿Qué sistemas están involucrados?
3. **Beneficiarios** → ¿Quiénes se benefician y cuántos?
4. **Urgencia** → ¿Qué tan urgente es?
5. **Contexto adicional** → Detalles específicos del departamento
