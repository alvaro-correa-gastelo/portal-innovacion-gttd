# 🔄 IMPLEMENTACIÓN RAMA DE FINALIZACIÓN N8N

**Objetivo:** Completar el flujo end-to-end desde conversación hasta guardado en tabla `requests`  
**Basado en:** `N8N_FINALIZATION_INTEGRATION_GUIDE.md`  
**Estado:** Crítico - Sin esto, las conversaciones no se guardan  

---

## 🎯 **PROBLEMA ACTUAL**

### ❌ **Lo que pasa ahora:**
1. Usuario completa conversación con InsightBot
2. Agente genera resumen estructurado
3. Usuario confirma el resumen
4. **NO PASA NADA MÁS** - Se pierde toda la información

### ✅ **Lo que debe pasar:**
1. Usuario completa conversación con InsightBot
2. Agente genera resumen estructurado
3. Usuario confirma el resumen → **EVENTO `SUMMARY_CONFIRMED`**
4. **N8N detecta el evento y ejecuta rama de finalización:**
   - Obtiene datos de la sesión
   - Guarda solicitud en tabla `requests`
   - Notifica al líder
   - Confirma al usuario

---

## 📋 **PASO A PASO: IMPLEMENTACIÓN**

### **PASO 1: MODIFICAR WORKFLOW EXISTENTE**

#### 1.1 Abrir N8N
```bash
# Acceder a tu instancia N8N
# URL probablemente: http://localhost:5678 o tu servidor
```

#### 1.2 Localizar workflow `InsightBot AI v2`
- Buscar en la lista de workflows
- Abrir para editar

#### 1.3 Identificar punto de inserción
**Buscar:** El nodo **Webhook** que recibe las peticiones del frontend  
**Después de:** Este webhook necesita un Router/Switch

---

### **PASO 2: AÑADIR ROUTER PRINCIPAL**

#### 2.1 Insertar nodo Switch
1. **Hacer clic derecho** después del nodo Webhook
2. **Seleccionar:** "Switch" node
3. **Renombrar a:** `Router Principal de Eventos`

#### 2.2 Configurar el Switch
**Configuración básica:**
```
Node Name: Router Principal de Eventos
```

**Routing Rules - Regla 1:**
```
Rule Name: Finalizar Solicitud
Conditions:
  - Field: {{ $json.body.event.type }}
  - Operation: String → Equal
  - Value: SUMMARY_CONFIRMED
```

**Routing Rules - Por defecto:**
```
- Todas las demás peticiones van por el flujo normal
- Conectar salida default al nodo actual (User Profile Data)
```

#### 2.3 Resultado
Ahora tienes 2 salidas:
- **Salida 1 (Finalizar):** Solo eventos `SUMMARY_CONFIRMED`
- **Salida Default:** Todo lo demás (flujo normal)

---

### **PASO 3: CONSTRUIR RAMA DE FINALIZACIÓN**

De la **Salida 1** del Router, construir secuencia de 5 nodos:

#### **NODO 1: Obtener Datos de la Sesión**
```
Tipo: PostgreSQL
Nombre: Obtener Sesión para Finalizar
Acción: Execute Query

Query:
SELECT 
  conversation_data, 
  user_id,
  current_stage,
  completeness_score
FROM session_states 
WHERE session_id = '{{ $json.body.session_id }}' 
LIMIT 1;
```

#### **NODO 2: Guardar Solicitud Final** (CRÍTICO)
```
Tipo: PostgreSQL  
Nombre: Guardar Solicitud Final
Acción: Execute Query

Query:
INSERT INTO requests (
    session_id,
    user_id,
    titulo_solicitud,
    problema_principal,
    objetivo_esperado,
    plataformas_involucradas,
    beneficiarios,
    frecuencia_uso,
    plazo_deseado,
    departamento_solicitante,
    score_estimado,
    clasificacion_sugerida,
    prioridad_sugerida,
    status
) VALUES (
    '{{ $json.body.session_id }}',
    '{{ $("Obtener Sesión para Finalizar").first().json.user_id }}',
    '{{ $("Obtener Sesión para Finalizar").first().json.conversation_data.titulo_solicitud }}',
    '{{ $("Obtener Sesión para Finalizar").first().json.conversation_data.problema_principal }}',
    '{{ $("Obtener Sesión para Finalizar").first().json.conversation_data.objetivo_esperado }}',
    '{{ JSON.stringify($("Obtener Sesión para Finalizar").first().json.conversation_data.plataformas_involucradas) }}'::jsonb,
    '{{ $("Obtener Sesión para Finalizar").first().json.conversation_data.beneficiarios }}',
    '{{ $("Obtener Sesión para Finalizar").first().json.conversation_data.frecuencia_uso }}',
    '{{ $("Obtener Sesión para Finalizar").first().json.conversation_data.plazo_deseado }}',
    '{{ $("Obtener Sesión para Finalizar").first().json.conversation_data.departamento_solicitante }}',
    COALESCE('{{ $("Obtener Sesión para Finalizar").first().json.conversation_data.score_estimado }}', 75)::integer,
    COALESCE('{{ $("Obtener Sesión para Finalizar").first().json.conversation_data.clasificacion_sugerida }}', 'requerimiento'),
    COALESCE('{{ $("Obtener Sesión para Finalizar").first().json.conversation_data.prioridad_sugerida }}', 'P2'),
    'pending_approval'
)
RETURNING id, created_at;
```

#### **NODO 3: Notificar al Líder**
```
Tipo: Send Email (o HTTP Request si usas API)
Nombre: Notificar al Líder

Email Configuration:
- To: lider.gttd@utp.edu.pe
- Subject: Nueva Solicitud de Innovación (#{{ $("Guardar Solicitud Final").first().json.id }})

Body:
Ha llegado una nueva solicitud de {{ $("Obtener Sesión para Finalizar").first().json.conversation_data.departamento_solicitante }}.

Título: {{ $("Obtener Sesión para Finalizar").first().json.conversation_data.titulo_solicitud }}

Problema: {{ $("Obtener Sesión para Finalizar").first().json.conversation_data.problema_principal }}

Por favor, revísala en el panel de aprobaciones:
[LINK AL DASHBOARD]

Folio: {{ $("Guardar Solicitud Final").first().json.id }}
```

#### **NODO 4: Cerrar Sesión**
```
Tipo: PostgreSQL
Nombre: Cerrar Sesión
Acción: Execute Query

Query:
UPDATE session_states 
SET 
  status = 'completed',
  current_stage = 'completed',
  updated_at = NOW()
WHERE session_id = '{{ $json.body.session_id }}';
```

#### **NODO 5: Construir Respuesta Final**
```
Tipo: Set
Nombre: Construir Respuesta Final

Valores a establecer:
- response_type (String): "text"
- text (String): "¡Listo! Tu solicitud ha sido enviada con el folio #{{ $("Guardar Solicitud Final").first().json.id }}. Recibirás una notificación cuando sea revisada. ¡Gracias por tu aporte!"
- session_id (String): "{{ $json.body.session_id }}"
- request_id (String): "{{ $("Guardar Solicitud Final").first().json.id }}"
- status (String): "completed"
```

#### **NODO 6: Respuesta al Frontend**
```
Tipo: Respond to Webhook
Nombre: Respuesta de Confirmación Final

Configuration:
- Respond With: "Using 'Set' node"
- Response Data From: "Construir Respuesta Final"
```

---

### **PASO 4: CONEXIONES DE NODOS**

**Flujo de la rama de finalización:**
```
Router Principal (Salida 1: Finalizar Solicitud)
    ↓
1. Obtener Sesión para Finalizar
    ↓
2. Guardar Solicitud Final
    ↓
3. Notificar al Líder
    ↓
4. Cerrar Sesión
    ↓
5. Construir Respuesta Final
    ↓
6. Respuesta de Confirmación Final
```

---

## 🧪 **PASO 5: TESTING**

### 5.1 Probar conexión a base de datos
En el nodo "Obtener Sesión para Finalizar":
```sql
-- Query de prueba
SELECT NOW() as current_time, COUNT(*) as session_count FROM session_states;
```

### 5.2 Probar inserción
En el nodo "Guardar Solicitud Final", usar datos hardcodeados primero:
```sql
-- Test de inserción
INSERT INTO requests (session_id, user_id, titulo_solicitud, status) 
VALUES ('test-session', 'test-user@utp.edu.pe', 'Test Request', 'pending_approval')
RETURNING id;
```

### 5.3 Probar flujo completo
1. **Ejecutar manualmente** el nodo Router Principal
2. **Enviar JSON de prueba:**
```json
{
  "body": {
    "event": {
      "type": "SUMMARY_CONFIRMED"
    },
    "session_id": "test-session-id"
  }
}
```

---

## 🚨 **TROUBLESHOOTING**

### Error: "session_id not found"
**Causa:** No existe la sesión en `session_states`  
**Solución:** 
```sql
-- Crear sesión de prueba
INSERT INTO session_states (session_id, user_id, status, conversation_data) 
VALUES ('test-session-id', 'test@utp.edu.pe', 'active', '{"titulo_solicitud": "Test"}');
```

### Error: "foreign key constraint"
**Causa:** La tabla `requests` requiere que exista `session_id` en `session_states`  
**Solución:** Verificar que la sesión existe primero

### Error: "column does not exist"
**Causa:** La tabla `requests` no se creó correctamente  
**Solución:** Ejecutar `create_requests_table.sql`

### Error: "webhook timeout"
**Causa:** N8N tarda mucho en procesar  
**Solución:** Configurar timeout más alto en el webhook

---

## ✅ **VERIFICACIÓN DE FUNCIONAMIENTO**

### **Test End-to-End:**
1. **Frontend:** Usuario completa conversación
2. **Frontend:** Usuario confirma resumen → envía `SUMMARY_CONFIRMED`
3. **N8N Router:** Detecta evento y ejecuta rama de finalización
4. **Database:** Solicitud se guarda en tabla `requests`
5. **Email:** Líder recibe notificación
6. **Frontend:** Usuario ve confirmación con folio
7. **Dashboard:** Líder ve nueva solicitud en bandeja

### **Query de verificación:**
```sql
-- Ver solicitudes guardadas
SELECT 
  id,
  titulo_solicitud,
  status,
  created_at,
  user_id
FROM requests 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🚀 **RESULTADO ESPERADO**

**Después de implementar esta rama:**

✅ **Usuario completa conversación** → Se guarda automáticamente en BD  
✅ **Líder recibe notificación** → Email inmediato de nueva solicitud  
✅ **Dashboard se actualiza** → Nueva solicitud aparece en bandeja  
✅ **Portal solicitante** → Usuario puede ver estado en `/my-requests`  
✅ **Flujo completo** → End-to-end completamente funcional  

**🎉 Con esto tienes el sistema completamente operativo y listo para producción.**

---

## 📝 **PRÓXIMOS PASOS DESPUÉS**

Una vez que la rama funcione:

1. **Mejorar notificaciones** - Teams, Slack
2. **Análisis técnico automático** - Agente 2
3. **Estados avanzados** - Workflow de aprobación
4. **Integraciones** - Monday.com, Jira

---

*Basado en: N8N_FINALIZATION_INTEGRATION_GUIDE.md*  
*Elaborado para: Implementación urgente backend*  
*Próxima acción: Ejecutar paso a paso en N8N*
