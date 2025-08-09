# Mockup: Portal del Solicitante Simplificado

## 🎯 **PRINCIPIOS DE DISEÑO**

1. **Máxima Simplicidad:** Solo 3 opciones en el sidebar
2. **Información Relevante:** El solicitante solo ve lo que necesita saber
3. **Flujo Intuitivo:** Experiencia conversacional mejorada
4. **Transparencia:** Estado claro de sus solicitudes sin jerga técnica

---

## 🔧 **ESTRUCTURA ACTUAL vs PROPUESTA**

### **❌ ANTES (Complejo)**
```
Sidebar:
├── 🏠 Dashboard (con métricas complejas)
├── 💬 Mi Espacio (nombre confuso)
├── 🕐 Mis Solicitudes
├── 📁 Documentos
├── ⚙️ Configuración
└── [Barra de búsqueda] ← ELIMINAR
└── [Solicitudes Recientes] ← ELIMINAR
```

### **✅ DESPUÉS (Simplificado)**
```
Sidebar Limpio:
├── ➕ Nueva Solicitud (antes "Mi Espacio")
├── 📋 Mis Solicitudes (unificado con dashboard)
└── ❓ Ayuda (nueva sección completa)
```

---

## 📱 **MOCKUP DETALLADO**

### **Layout General**
```
┌─────────────────────────────────────────────────────────────┐
│  🏛️ UTP GTTD                              🌙 [Toggle Tema]  │
│  Portal de Innovación                                        │
├─────────────────────────────────────────────────────────────┤
│                     │                                       │
│   [SIDEBAR LIMPIO]  │         [CONTENIDO PRINCIPAL]         │
│                     │                                       │
│  ➕ Nueva Solicitud │                                       │
│  📋 Mis Solicitudes │         (Área de trabajo)            │
│  ❓ Ayuda          │                                       │
│                     │                                       │
│                     │                                       │
│  ──────────────────  │                                       │
│  👤 Juan Pérez      │                                       │
│  Analista           │                                       │
│                     │                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎭 **INTERFAZ 1: NUEVA SOLICITUD**

### **Chat Mejorado con Mensajes de Ayuda**

```
┌─────────────────────────────────────────────────────────────┐
│                    💬 Nueva Solicitud                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖 ¡Hola Juan! Soy InsightBot, tu asistente de innovación │
│      Te ayudo a convertir tu idea en una solicitud clara.  │
│                                                             │
│  💡 Consejos para una mejor conversación:                  │
│     ✓ Describe el problema que quieres resolver             │
│     ✓ Menciona qué sistemas o plataformas usas             │
│     ✓ Explica quiénes se beneficiarían                     │
│     ✓ No te preocupes por detalles técnicos                │
│                                                             │
│  🚀 Puedes empezar con una de estas ideas:                 │
│                                                             │
│  [📊 Dashboard BI]  [🤖 Automatización]                    │
│  [💻 Nueva App]     [🔧 Mejora Sistema]                    │
│                                                             │
│  ────────────────────────────────────────────────────────── │
│                                                             │
│  💬 Escríbeme tu idea aquí...                 [📎] [Enviar] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Componentes Interactivos Durante Conversación**

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 Genial! Entiendo que necesitas un dashboard para       │
│      seguimiento de estudiantes. ¿Qué plataformas usas?    │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🎯 Selector de Plataformas                            ││
│  │                                                         ││
│  │  ☑️ Canvas - Sistema de gestión académica              ││
│  │  ☐ PeopleSoft - Sistema de RRHH                       ││
│  │  ☐ Banner - Sistema estudiantil                       ││
│  │  ☐ Moodle - Plataforma de aprendizaje                 ││
│  │  ☐ Otros: _______________                             ││
│  │                                                         ││
│  │                                    [Continuar] ────────→││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### **Tarjeta de Resumen Final**

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Resumen de tu Solicitud                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 Título: Reporte de Seguimiento Académico               │
│                                                             │
│  🎯 Problema:                                               │
│     Falta visibilidad en tiempo real del progreso          │
│     estudiantil para intervención temprana                 │
│                                                             │
│  🎯 Objetivo:                                               │
│     Dashboard automatizado con alertas de riesgo           │
│     académico                                               │
│                                                             │
│  👥 Beneficiarios:                                          │
│     Coordinadores académicos y jefes de carrera            │
│                                                             │
│  💻 Plataforma:                                             │
│     Canvas - Sistema de gestión académica                  │
│                                                             │
│  ──────────────────────────────────────────────────────── │
│                                                             │
│  ✏️ ¿Todo se ve correcto?                                  │
│                                                             │
│  [← Modificar]                        [✅ Enviar Solicitud] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 **INTERFAZ 2: MIS SOLICITUDES (UNIFICADA)**

### **Vista Kanban Personal + Lista**

```
┌─────────────────────────────────────────────────────────────┐
│                    📋 Mis Solicitudes                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Buscar...                    📅 Todas las fechas ▼     │
│                                                             │
├─────────────────┬─────────────────┬─────────────────────────┤
│   📥 Nuevas     │  ⚙️ En Proceso  │     ✅ Completadas      │
│      (2)        │       (1)       │          (3)            │
├─────────────────┼─────────────────┼─────────────────────────┤
│                 │                 │                         │
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────────────┐ │
│ │📊 Dashboard │ │ │🤖 Chatbot   │ │ │💻 Portal Estudiantil│ │
│ │Académico    │ │ │Admisiones   │ │ │                     │ │
│ │             │ │ │             │ │ │✅ Completado        │ │
│ │🟢 Nueva     │ │ │🟡 Evaluando │ │ │📅 15 Nov 2024      │ │
│ │📅 28/01     │ │ │📅 22/01     │ │ └─────────────────────┘ │
│ └─────────────┘ │ └─────────────┘ │                         │
│                 │                 │ ┌─────────────────────┐ │
│ ┌─────────────┐ │                 │ │📱 App Móvil        │ │
│ │📈 Reportes  │ │                 │ │Biblioteca           │ │
│ │Automáticos  │ │                 │ │✅ Completado        │ │
│ │             │ │                 │ │📅 03 Nov 2024      │ │
│ │🟢 Nueva     │ │                 │ └─────────────────────┘ │
│ │📅 25/01     │ │                 │                         │
│ └─────────────┘ │                 │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### **Detalle de Solicitud (Solo Info Relevante)**

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Dashboard Académico                          [← Volver] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔵 Estado Actual: Nueva                                    │
│  📅 Creado: 28 de Enero, 2025                             │
│  ⏱️ Próximo Paso: Esperando revisión del líder académico   │
│                                                             │
│  ──────────────────────────────────────────────────────── │
│                                                             │
│  📝 Tu Solicitud:                                           │
│  "Necesito un reporte que muestre el progreso de          │
│  estudiantes por curso en Canvas, con alertas cuando un   │
│  estudiante está en riesgo de reprobar..."                │
│                                                             │
│  ──────────────────────────────────────────────────────── │
│                                                             │
│  💬 Conversación con el Líder:                             │
│                                                             │
│  👤 Leslie Hidalgo (Líder Académico)        📅 29/01 - 14:30│
│  "Hola Juan, necesito más detalles sobre los usuarios     │
│  finales del reporte. ¿Cuántos coordinadores y jefes?"    │
│                                                             │
│  [💬 Responder mensaje] ──────────────────────────────────→ │
│                                                             │
│  ──────────────────────────────────────────────────────── │
│                                                             │
│  📈 Historia de Estados:                                    │
│  ✅ 28/01 - Solicitud enviada                             │
│  🔄 29/01 - En revisión por Leslie Hidalgo               │
│  💬 29/01 - Mensaje del líder                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ❓ **INTERFAZ 3: AYUDA (NUEVA SECCIÓN)**

### **Centro de Ayuda Completo**

```
┌─────────────────────────────────────────────────────────────┐
│                      ❓ Centro de Ayuda                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Buscar en la ayuda...                      [🔍 Buscar] │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                🚀 Inicio Rápido                       │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │  📹 Cómo crear tu primera solicitud (2:30 min)       │ │
│  │  📹 Conversando con InsightBot (1:45 min)            │ │
│  │  📹 Seguimiento de tus solicitudes (1:20 min)        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                📚 Preguntas Frecuentes                │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │  🤔 ¿Cómo sé si mi idea es un proyecto o requerimiento?││
│  │  ⏱️ ¿Cuánto tiempo toma revisar una solicitud?        │ │
│  │  📧 ¿Cómo cambio mis preferencias de notificación?    │ │
│  │  🔄 ¿Puedo modificar una solicitud ya enviada?        │ │
│  │  👥 ¿Con quién puedo hablar si tengo dudas?          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                🎯 Consejos de Éxito                   │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │  ✅ Describe claramente el problema que quieres       │ │
│  │     resolver, no la solución técnica                 │ │
│  │  ✅ Menciona qué sistemas actuales usas              │ │
│  │  ✅ Explica el impacto en tu trabajo diario          │ │
│  │  ✅ Sé específico sobre quiénes se beneficiarán      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  🆘 ¿Necesitas ayuda personalizada?                        │
│  [📧 Enviar Ticket de Soporte] [💬 Chat con Soporte]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 **FLUJO SIMPLIFICADO COMPLETO**

### **1. Usuario Ingresa → Nueva Solicitud**
- Chat limpio con mensajes de ayuda
- Sugerencias interactivas
- Componentes ricos según contexto

### **2. Conversación Finalizada → Mis Solicitudes**  
- Aparece automáticamente en kanban personal
- Estado claro y próximos pasos visibles
- Sin información técnica compleja

### **3. Líder Contacta → Notificación**
- Badge en portal + email + Teams
- Link directo a conversación
- Respuesta fácil desde interfaz

### **4. Necesita Ayuda → Centro de Ayuda**
- Videos tutoriales cortos
- FAQ específico para solicitantes
- Soporte directo disponible

---

## ⚡ **BENEFICIOS DE LA SIMPLIFICACIÓN**

### **✅ Para el Solicitante**
- **Menos confusión:** Solo 3 opciones claras
- **Más confianza:** Sabe exactamente qué hacer
- **Mejor experiencia:** Interfaz conversacional mejorada
- **Información relevante:** Sin jerga técnica innecesaria

### **✅ Para la Adopción**
- **Menor resistencia:** Interfaz familiar y simple
- **Onboarding rápido:** Videos de <3 minutos
- **Autoservicio:** Centro de ayuda completo
- **Soporte integrado:** Tickets cuando sea necesario

### **✅ Para el Proceso**
- **Mayor calidad:** Conversación guiada mejora información
- **Menos iteraciones:** Preguntas más específicas del bot
- **Trazabilidad clara:** Historia de estados simple
- **Comunicación efectiva:** Mensajería integrada

---

## 🎯 **IMPLEMENTACIÓN TÉCNICA**

### **Archivos a Modificar**

1. **`sidebar.tsx`**
   - Reducir opciones para rol "solicitante"
   - Eliminar búsqueda y historial reciente
   - Mantener solo: Nueva Solicitud, Mis Solicitudes, Ayuda

2. **`chat-interface.tsx`**  
   - Agregar mensajes de ayuda al inicio
   - Mejorar sugerencias predefinidas
   - Componentes interactivos más claros

3. **Crear `my-requests-view.tsx`**
   - Vista unificada kanban + lista  
   - Información filtrada para solicitantes
   - Integración con mensajería

4. **Crear `help-view.tsx`**
   - Centro de ayuda completo
   - FAQ, videos, soporte
   - Búsqueda en documentación

**🎉 RESULTADO:** Portal 3x más simple, intuitivo y efectivo para el solicitante, manteniendo toda la potencia del sistema.
