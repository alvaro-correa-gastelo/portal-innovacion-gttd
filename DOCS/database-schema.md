# 📊 Documentación del Esquema de Base de Datos

## Estructura de la Base de Datos PostgreSQL

### 🔗 **Diagrama de Relaciones**

```
session_states (1) ←→ (N) conversation_messages
       ↓
       │ (1)
       ↓
   requests (N)
       ↓
       │ (1)
       ↓
requests_audit (N)

scoring_configurations (1) ←→ (N) configuration_audit
report_templates (independiente)
```

## 📋 **Tablas Principales**

### 1. **session_states** - Estados de Sesión
Maneja las sesiones de conversación con la IA para crear solicitudes.

```sql
Campos principales:
- session_id (uuid, PK): Identificador único de sesión
- user_id (varchar): ID del usuario solicitante
- current_stage (varchar): Etapa actual [start, discovery, summary, completed]
- conversation_data (jsonb): Datos estructurados de la conversación
- completeness_score (integer): Puntuación de completitud (0-100)
- status (varchar): Estado [active, paused, completed, error]
- created_at, updated_at (timestamp)
```

### 2. **conversation_messages** - Mensajes de Conversación
Almacena todos los mensajes de la conversación con la IA.

```sql
Campos principales:
- message_id (uuid, PK): Identificador único del mensaje
- session_id (uuid, FK): Referencia a session_states
- role (varchar): Tipo [user, assistant, system]
- message (text): Contenido del mensaje
- agent_name (varchar): Nombre del agente IA
- metadata (jsonb): Metadatos adicionales
- created_at (timestamp): Fecha de creación
```

### 3. **requests** - Solicitudes Principales ⭐
**Tabla central del sistema que contiene todas las solicitudes.**

```sql
Campos de solicitud:
- id (uuid, PK): Identificador único
- session_id (uuid, FK): Sesión que generó la solicitud
- user_id (varchar): Usuario solicitante
- titulo_solicitud (varchar): Título de la solicitud
- problema_principal (text): Descripción del problema
- objetivo_esperado (text): Resultado esperado
- beneficiarios (text): Quién se beneficiará
- plataformas_involucradas (jsonb): Sistemas afectados
- frecuencia_uso (varchar): Frecuencia de uso esperada
- plazo_deseado (varchar): Timeline deseado
- departamento_solicitante (varchar): Departamento origen

Campos de análisis IA:
- score_estimado (integer): Puntuación automática
- clasificacion_sugerida (varchar): Sugerencia IA [proyecto, requerimiento]
- prioridad_sugerida (varchar): Prioridad IA [P1, P2, P3, P4]
- technical_analysis (jsonb): Análisis técnico detallado

Campos de gestión:
- status (varchar): Estado actual [pending_technical_analysis, pending_approval, in_evaluation, on_hold, approved, rejected]
- leader_comments (text): Comentarios del líder

Campos finales (decididos por líder):
- clasificacion_final (varchar): Decisión final del líder
- prioridad_final (varchar): Prioridad final del líder
- leader_override (boolean): Si el líder cambió las sugerencias IA
- override_reason (text): Razón del cambio
- created_at, updated_at (timestamp)
```

### 4. **requests_audit** - Auditoría de Solicitudes
**Tabla para el timeline/historial que necesitas para los modales.**

```sql
Campos principales:
- id (uuid, PK): Identificador único
- request_id (uuid, FK): Referencia a requests
- action_type (varchar): Tipo de acción realizada
- previous_status (varchar): Estado anterior
- new_status (varchar): Nuevo estado
- leader_id (varchar): ID del líder que realizó la acción
- comments (text): Comentarios de la acción
- created_at (timestamp): Cuándo se realizó
```

### 5. **scoring_configurations** - Configuraciones de IA
Parámetros y configuraciones para el sistema de scoring de IA.

### 6. **configuration_audit** - Auditoría de Configuraciones
Historial de cambios en las configuraciones.

### 7. **report_templates** - Plantillas de Reportes
Templates HTML para generar reportes del sistema.

## 🔧 **Funciones y Triggers**

### Función: `update_leader_override()`
**Trigger automático que detecta cuando un líder modifica las sugerencias de IA.**
```sql
-- Se ejecuta ANTES de INSERT/UPDATE en requests
-- Compara clasificacion_final vs clasificacion_sugerida
-- Compara prioridad_final vs prioridad_sugerida
-- Actualiza automáticamente leader_override = true si hay diferencias
```

### Función: `update_updated_at_column()`
**Trigger que mantiene actualizado el timestamp de modificación.**
```sql
-- Se ejecuta ANTES de UPDATE en requests
-- Actualiza automáticamente updated_at = now()
```

## 🔍 **Vista: requests_with_effective_values**
**Vista que simplifica la consulta de valores finales vs sugeridos.**

```sql
Campos adicionales calculados:
- clasificacion_efectiva: COALESCE(clasificacion_final, clasificacion_sugerida)
- prioridad_efectiva: COALESCE(prioridad_final, prioridad_sugerida)
- origen_clasificacion: 'Modificado por Líder' | 'Según IA'
```

## 📊 **Índices Optimizados**

### Índices para Performance:
- `idx_requests_status`: Búsquedas por estado
- `idx_requests_user_id`: Solicitudes por usuario
- `idx_requests_created_at`: Ordenamiento cronológico
- `idx_requests_department`: Filtros por departamento
- `idx_requests_leader_override`: Solicitudes modificadas
- `idx_requests_audit_request_id`: Timeline por solicitud

### Índices para Sesiones:
- `idx_session_states_user_active`: Sesiones activas por usuario
- `idx_conversation_messages_session_id`: Mensajes por sesión

## 🔐 **Constraints y Validaciones**

### Validaciones de Status:
```sql
-- requests.status debe ser uno de:
['pending_technical_analysis', 'pending_approval', 'in_evaluation', 
 'on_hold', 'approved', 'rejected']

-- session_states.status debe ser uno de:
['active', 'paused', 'completed', 'error']

-- conversation_messages.role debe ser uno de:
['user', 'assistant', 'system']
```

## 🔄 **Flujo de Estados de una Solicitud**

```
1. pending_technical_analysis (inicial)
   ↓
2. pending_approval (después de análisis IA)
   ↓
3. in_evaluation (líder está revisando)
   ↓
4. approved | rejected | on_hold (decisión final)
```

## 💾 **Consideraciones de Almacenamiento**

- **JSONB Fields**: `conversation_data`, `plataformas_involucradas`, `technical_analysis`, `metadata`
- **UUID**: Todas las PKs son UUID para escalabilidad
- **Timestamps**: Todas las fechas incluyen timezone
- **Text Fields**: Sin límite para `problema_principal`, `objetivo_esperado`, etc.

## 🔍 **Consultas Típicas**

### Para Dashboard de Usuario:
```sql
-- Solicitudes del usuario con valores efectivos
SELECT * FROM requests_with_effective_values 
WHERE user_id = $1 
ORDER BY created_at DESC;
```

### Para Timeline/Historial:
```sql
-- Historial completo de una solicitud
SELECT * FROM requests_audit 
WHERE request_id = $1 
ORDER BY created_at ASC;
```

### Para Dashboard de Líder:
```sql
-- Solicitudes pendientes de aprobación
SELECT * FROM requests_with_effective_values 
WHERE status IN ('pending_approval', 'in_evaluation')
ORDER BY created_at ASC;
```
