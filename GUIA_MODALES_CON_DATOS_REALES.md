# 📋 GUÍA DE MODALES CON DATOS REALES

**Basado en la estructura real de tu BD:** `conversation_messages`, `session_states`, y `requests`

---

## 🎯 **RESUMEN EJECUTIVO**

He creado **3 tipos de modales** basándome en tus datos reales:

| Modal | Uso | Datos | Funcionalidades |
|-------|-----|-------|----------------|
| **`UserRequestDetailModal`** | ✅ **Ya perfecto** | 100% reales | Solo lectura, timeline simple |
| **`RealisticLeaderModal`** | 🆕 **Nuevo - Solo datos reales** | 100% reales | Gestión básica, sin mockups |
| **`PreviewLeaderModal`** | 🆕 **Nuevo - Preview del futuro** | Reales + demos | Gestión + preview funcionalidades |

---

## 📊 **TUS DATOS REALES DISPONIBLES**

### **De la tabla `requests`:**
```typescript
interface RealRequestData {
  // Identificación
  id: string,
  session_id: string,
  user_id: string,
  
  // Información principal
  titulo_solicitud: string,
  problema_principal: string,
  objetivo_esperado: string,
  beneficiarios: string,
  
  // Detalles técnicos  
  plataformas_involucradas: jsonb, // ["Oracle ERP", "Excel", "Power BI"]
  frecuencia_uso: string,          // "mensual", "diario"
  plazo_deseado: string,           // "3_meses", "6_meses"
  departamento_solicitante: string,
  
  // Scoring y clasificación
  score_estimado: number,          // 85, 92, 65
  clasificacion_sugerida: string, // "proyecto", "requerimiento"
  prioridad_sugerida: string,     // "P1", "P2"
  
  // Gestión
  status: string,                  // "pending_approval", "in_evaluation"
  leader_comments: string,         // Comentarios del líder
  technical_analysis: jsonb,       // Análisis técnico si existe
  created_at: timestamp
}
```

### **De la tabla `session_states`:**
- Datos adicionales del conversation_data
- Estado de completitud
- Historial de la conversación

---

## 🔧 **MODAL 1: UserRequestDetailModal (YA PERFECTO)**

### **Uso:**
- **Para:** Usuarios/solicitantes
- **Vista:** Solo lectura de sus propias solicitudes
- **Datos:** 100% reales de tu BD

### **Qué muestra:**
```typescript
// Información que SÍ tienes y muestra:
- Título de la solicitud (titulo_solicitud)
- Problema principal (problema_principal) 
- Objetivo esperado (objetivo_esperado)
- Departamento (departamento_solicitante)
- Estado actual (status)
- Días esperando (calculado desde created_at)
- Comentarios del líder (leader_comments)
- Timeline visual del progreso
```

### **Implementación:**
```jsx
<UserRequestDetailModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  request={selectedRequest}
/>
```

---

## 🆕 **MODAL 2: RealisticLeaderModal (NUEVO - SOLO REALES)**

### **Uso:**
- **Para:** Líderes de dominio/técnicos
- **Vista:** Gestión con solo funcionalidades que funcionan
- **Datos:** 100% reales, sin simulaciones

### **Qué muestra:**

#### **Tab 1: Detalles de Solicitud**
```typescript
// Información real de tu BD:
- Problema a resolver (problema_principal)
- Objetivo esperado (objetivo_esperado)  
- Solicitante (user_id)
- Departamento (departamento_solicitante)
- Score estimado (score_estimado)
- Días esperando (calculado)
```

#### **Tab 2: Información Técnica**
```typescript
// Detalles técnicos reales:
- Beneficiarios (beneficiarios)
- Plataformas involucradas (plataformas_involucradas)
- Frecuencia de uso (frecuencia_uso) 
- Plazo deseado (plazo_deseado)
- Clasificación (clasificacion_sugerida)
- Análisis técnico (technical_analysis) // si existe
```

#### **Tab 3: Acciones de Gestión**
```typescript
// Funcionalidades REALES que funcionan:
- Ver comentarios anteriores (leader_comments)
- Agregar nuevos comentarios
- Aprobar solicitud (PUT /api/requests/:id)
- Rechazar solicitud (PUT /api/requests/:id)
- Poner en espera (PUT /api/requests/:id)
- Info sobre flujo de aprobación
```

### **Implementación:**
```jsx
import { RealisticLeaderModal } from '@/components/realistic-leader-modal'

<RealisticLeaderModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  request={selectedRequest}
  userRole="lider_dominio" // o "lider_gerencial"
/>
```

---

## 🌟 **MODAL 3: PreviewLeaderModal (NUEVO - CON PREVIEW)**

### **Uso:**
- **Para:** Demos, presentaciones, mostrar roadmap
- **Vista:** Datos reales + preview de funcionalidades futuras
- **Datos:** Reales + mockups claramente etiquetados

### **Qué muestra:**

#### **Tab 1: Detalles - DATOS REALES**
- Mismo contenido que RealisticLeaderModal
- Badge verde "Datos Reales" para claridad

#### **Tab 2: IA Analysis - MOCKUP FUTURO**
```typescript
// Funcionalidades que se pueden implementar:
- Análisis predictivo con IA
- Estimación de costos automática  
- Nivel de confianza del análisis
- Recomendaciones inteligentes
// Badge: "Próximamente en v2.0"
```

#### **Tab 3: Colaboración - MOCKUP FUTURO** 
```typescript
// Funcionalidades de colaboración:
- Chat interno del equipo (simulado)
- Comunicación con solicitante
- Historial de conversaciones  
- Notificaciones automáticas
// Badge: "Próximamente en v2.0"
```

#### **Tab 4: Planificación - MOCKUP FUTURO**
```typescript
// Funcionalidades de planificación:
- Subida de documentos técnicos
- Generación de cronogramas
- Reportes PDF automáticos
- Integración Monday.com
// Badge: "Próximamente en v2.0"
```

#### **Tab 5: Gestión - DATOS REALES**
- Mismas funcionalidades reales que RealisticLeaderModal
- Badge verde "Funcional"

### **Implementación:**
```jsx
import { PreviewLeaderModal } from '@/components/preview-leader-modal'

<PreviewLeaderModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  request={selectedRequest}
  userRole="lider_dominio"
/>
```

---

## 🎨 **CUÁNDO USAR CADA MODAL**

### **Para Desarrollo/Producción:**
```jsx
// Usar RealisticLeaderModal - Solo funcionalidades reales
<RealisticLeaderModal 
  isOpen={isModalOpen}
  onClose={handleClose}
  request={realRequestData}
  userRole="lider_dominio"
/>
```

### **Para Demos/Presentaciones:**
```jsx
// Usar PreviewLeaderModal - Incluye preview del futuro
<PreviewLeaderModal 
  isOpen={isModalOpen} 
  onClose={handleClose}
  request={realRequestData}
  userRole="lider_dominio"
/>
```

### **Para Usuarios/Solicitantes:**
```jsx
// Usar UserRequestDetailModal - Ya perfecto
<UserRequestDetailModal
  isOpen={isModalOpen}
  onClose={handleClose}
  request={userRequestData}
/>
```

---

## 📋 **DATOS DE EJEMPLO PARA TESTING**

### **Estructura de datos para el modal:**
```typescript
const exampleRequest = {
  // Datos reales de tu BD:
  id: "b0ceef3f-fa8d-41ab-aa72-dde7fd2f5db5",
  user_id: "test.user@utp.edu.pe", 
  titulo_solicitud: "Automatización de reportes financieros",
  problema_principal: "Los reportes financieros se generan manualmente cada mes, tomando 3 días completos",
  objetivo_esperado: "Automatizar la generación para reducir tiempo a 2 horas",
  beneficiarios: "Área de Finanzas, Contabilidad, Gerencia", 
  plataformas_involucradas: ["Oracle ERP", "Excel", "Power BI"],
  frecuencia_uso: "mensual",
  plazo_deseado: "3_meses", 
  departamento_solicitante: "Finanzas",
  score_estimado: 85,
  clasificacion_sugerida: "proyecto",
  prioridad_sugerida: "P1",
  status: "pending_approval",
  leader_comments: null, // o comentarios si existen
  technical_analysis: null, // o JSON si existe
  created_at: "2025-08-06T05:23:16.931928Z",
  days_since_created: 2
}
```

---

## 🚀 **PRÓXIMOS PASOS**

### **Implementación inmediata:**
1. **Usar `RealisticLeaderModal`** para reemplazar el modal actual con mockups
2. **Mantener `UserRequestDetailModal`** - ya está perfecto
3. **Usar `PreviewLeaderModal`** solo para demos

### **Para demos/presentaciones:**
1. Mostrar el `PreviewLeaderModal` con badge "Preview MVP v2.0"
2. Explicar qué funcionalidades son reales vs futuras
3. Roadmap claro de implementación

### **Ventajas de este enfoque:**
- ✅ **Credibilidad total** - Lo que ven funciona realmente
- ✅ **Transparencia** - Clara separación entre real y futuro
- ✅ **Roadmap visual** - Los stakeholders ven hacia dónde va
- ✅ **Mantenimiento fácil** - Menos código simulado que mantener

---

## ✨ **CONCLUSIÓN**

Ahora tienes **3 modales optimizados** para tu estructura de BD real:

1. **`UserRequestDetailModal`** - ✅ **Perfecto como está**
2. **`RealisticLeaderModal`** - 🆕 **Solo datos reales, máxima credibilidad**  
3. **`PreviewLeaderModal`** - 🌟 **Datos reales + preview inteligente**

**Recomendación:** Usa `RealisticLeaderModal` para desarrollo y `PreviewLeaderModal` para demos. Ambos están listos para usar con tus datos reales.

---

*Elaborado basándose en la estructura real de tu BD: `conversation_messages`, `session_states`, y `requests`*
