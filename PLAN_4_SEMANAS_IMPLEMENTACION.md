# Plan de Implementación de 4 Semanas - Portal Innovación GTTD

## 🎯 **VISIÓN GENERAL**

Transformar el portal actual en un sistema completamente funcional con IA integrada, simplificar la experiencia del solicitante, y establecer flujos completos de trabajo con notificaciones multi-canal.

---

## 📅 **SEMANA 1: FUNDACIÓN Y PORTAL SIMPLIFICADO**
**Objetivo:** Crear tabla requests, implementar endpoint de finalización InsightBot, y simplificar dramáticamente el portal del solicitante.

### **Tarea 1.1: Creación de Tabla Requests en Supabase**
**🎯 Criterios de Aceptación:**
- Tabla `requests` creada con todos los campos necesarios
- Índices optimizados para consultas frecuentes  
- Row Level Security (RLS) configurado por roles
- Foreign keys con tablas existentes

**👤 Owner:** Desarrollador Backend
**📋 Subtareas:**
1. Ejecutar script SQL para crear tabla `requests`
2. Configurar índices: status, user_id, created_at, domain
3. Implementar políticas RLS diferenciadas por rol
4. Crear triggers de auditoría para cambios de estado
5. Seed data con 10 solicitudes de ejemplo

**⏱️ Estimación:** 6 horas

### **Tarea 1.2: Endpoint de Finalización InsightBot**
**🎯 Criterios de Aceptación:**
- Endpoint `POST /chat/finalize` funcionando en n8n
- Integración con Gemini para análisis de conversación
- Clasificación automática Proyecto/Requerimiento
- Almacenamiento de solicitud en tabla `requests`

**👤 Owner:** Desarrollador IA/Backend
**📋 Subtareas:**
1. Crear workflow n8n para endpoint `/chat/finalize`
2. Configurar nodo Gemini con prompts de clasificación
3. Implementar lógica de scoring y priorización
4. Conectar con tabla `requests` para persistencia
5. Retornar informe técnico estructurado

**⏱️ Estimación:** 12 horas

### **Tarea 1.3: Simplificación Radical del Portal del Solicitante**
**🎯 Criterios de Aceptación:**
- Sidebar reducido a solo 3 opciones: Nueva Solicitud, Mis Solicitudes, Ayuda
- Eliminación de barra de búsqueda del sidebar
- Eliminación de "Solicitudes Recientes" del sidebar
- Chat mejorado con mensajes de ayuda interactivos

**👤 Owner:** Desarrollador Frontend
**📋 Subtareas:**
1. Modificar `sidebar.tsx` para rol solicitante con solo 3 opciones
2. Remover componente de búsqueda del sidebar
3. Eliminar sección "Historial Reciente" para solicitantes
4. Mejorar `chat-interface.tsx` con mensajes de ayuda
5. Renombrar "Mi Espacio" a "Nueva Solicitud"
6. Crear nueva vista "Mis Solicitudes" unificada

**⏱️ Estimación:** 8 horas

### **Tarea 1.4: Dashboard Mínimo para Líderes de Dominio**
**🎯 Criterios de Aceptación:**
- Vista kanban básica funcionando con datos reales
- 3 columnas: Nuevas, En Evaluación, Aprobadas
- Conexión con tabla `requests` de Supabase
- Funcionalidad drag & drop para cambio de estados

**👤 Owner:** Desarrollador Frontend
**📋 Subtareas:**
1. Conectar `leader-dashboard.tsx` con Supabase
2. Implementar queries para solicitudes por dominio
3. Crear componente kanban básico
4. Implementar drag & drop con actualización de BD
5. Agregar filtros básicos por fecha y prioridad

**⏱️ Estimación:** 10 horas

**📊 Métricas de Éxito Semana 1:**
- Tabla `requests` almacena solicitudes correctamente
- Portal solicitante tiene exactamente 3 opciones en sidebar
- Líderes pueden ver solicitudes de su dominio en kanban
- Endpoint de finalización clasifica correctamente 8/10 casos

---

## 📅 **SEMANA 2: WORKFLOW N8N E INTEGRACIÓN SUPABASE RLS**
**Objetivo:** Implementar workflow completo de InsightBot en producción y configurar seguridad robusta en Supabase.

### **Tarea 2.1: Workflow InsightBot Completo en N8N**
**🎯 Criterios de Aceptación:**
- Workflow conversacional completo desplegado
- Integración con Gemini 1.5 Pro funcionando
- Memory de conversación persistente
- Respuestas contextuales y clasificación inteligente

**👤 Owner:** Especialista en IA/N8N
**📋 Subtareas:**
1. Desplegar workflow completo basado en `WORKFLOW_N8N_INSIGHTBOT_OPTIMIZADO.md`
2. Configurar AI Memory con sessionId por conversación
3. Implementar lógica de componentes ricos (selector plataformas)
4. Crear tabla `conversations` para tracking detallado
5. Testing exhaustivo con 20 conversaciones diferentes

**⏱️ Estimación:** 16 horas

### **Tarea 2.2: Configuración Avanzada de Supabase RLS**
**🎯 Criterios de Aceptación:**
- Políticas RLS implementadas para todos los roles
- Solicitantes solo ven sus solicitudes
- Líderes de dominio ven solicitudes de su área
- Líderes gerenciales acceso completo con filtros

**👤 Owner:** Desarrollador Backend/DevOps
**📋 Subtareas:**
1. Crear políticas RLS para tabla `requests`
2. Configurar políticas para tabla `conversations`
3. Implementar políticas para tabla `messages`
4. Testing de seguridad por cada rol
5. Documentar políticas y permisos

**⏱️ Estimación:** 8 horas

### **Tarea 2.3: Sistema de Notificaciones Básico**
**🎯 Criterios de Aceptación:**
- Notificaciones por email funcionando
- Template de emails personalizado
- Notificaciones en tiempo real en portal
- Queue de notificaciones para evitar spam

**👤 Owner:** Desarrollador Backend
**📋 Subtareas:**
1. Configurar SMTP en n8n para envío de emails
2. Crear templates HTML para diferentes tipos de notificación
3. Implementar sistema de notificaciones en tiempo real (WebSockets/Polling)
4. Crear queue de notificaciones con Redis/Memoria
5. Testing de notificaciones para todos los flujos

**⏱️ Estimación:** 12 horas

### **Tarea 2.4: Interfaz "Mis Solicitudes" Unificada**
**🎯 Criterios de Aceptación:**
- Vista unificada que combina dashboard y listado
- Kanban personal del solicitante
- Información superficial (sin detalles técnicos internos)
- Historial de chat integrado por solicitud

**👤 Owner:** Desarrollador Frontend
**📋 Subtareas:**
1. Crear componente `my-requests-view.tsx` unificado
2. Implementar vista kanban personal del usuario
3. Integrar historial de conversación por solicitud
4. Filtrar información mostrada (solo datos que debe saber el solicitante)
5. Conectar con notificaciones en tiempo real

**⏱️ Estimación:** 12 horas

**📊 Métricas de Éxito Semana 2:**
- Workflow n8n procesa 95% de conversaciones sin errores
- RLS bloquea correctamente acceso no autorizado
- Notificaciones se envían en <30 segundos
- Solicitantes ven solo información relevante para su rol

---

## 📅 **SEMANA 3: AGENTE PLANIFICADOR Y EMBEDDINGS**
**Objetivo:** Implementar Agente 2 (Planificador Experto) con pipeline RAG completo y base de embeddings.

### **Tarea 3.1: Pipeline de Embeddings con Gemini**
**🎯 Criterios de Aceptación:**
- Generación de embeddings automática funcionando
- Base vectorial en Supabase con pgvector configurada
- Chunking inteligente de documentos
- API de búsqueda por similitud operativa

**👤 Owner:** Especialista en IA/ML
**📋 Subtareas:**
1. Configurar pgvector en Supabase
2. Crear tabla `historical_documents` con columna embedding
3. Implementar generación de embeddings con Gemini
4. Desarrollar algoritmo de chunking inteligente
5. API de búsqueda por similitud con ranking

**⏱️ Estimación:** 18 horas

### **Tarea 3.2: Workflow Agente Planificador en N8N**
**🎯 Criterios de Aceptación:**
- Workflow de análisis predictivo funcionando
- Búsqueda de proyectos similares por embeddings
- Generación de informes de planificación
- Estimaciones basadas en datos históricos

**👤 Owner:** Especialista en IA/N8N
**📋 Subtareas:**
1. Crear workflow n8n para endpoint `/requests/{id}/analyze`
2. Implementar búsqueda de proyectos similares
3. Configurar prompts para análisis predictivo
4. Integrar con base vectorial de documentos
5. Generar informes estructurados con estimaciones

**⏱️ Estimación:** 16 horas

### **Tarea 3.3: Carga de Datos Históricos**
**🎯 Criterios de Aceptación:**
- 50+ proyectos históricos cargados en base vectorial
- Diversidad de tipos de proyecto y dominios
- Embeddings generados y validados
- Búsquedas retornan resultados relevantes

**👤 Owner:** Analista de Datos/Backend
**📋 Subtareas:**
1. Recopilar documentos de proyectos históricos UTP
2. Estructurar datos en formato consistente
3. Ejecutar pipeline de embeddings masivo
4. Validar calidad de búsquedas con casos test
5. Crear dashboard para monitorear calidad embeddings

**⏱️ Estimación:** 14 horas

### **Tarea 3.4: Interfaz de Planificación Asistida**
**🎯 Criterios de Aceptación:**
- Modal de planificación integrado en líder dashboard
- Formulario de ficha técnica optimizado
- Visualización de informes de IA atractiva
- Flujo completo: ficha → análisis → informe → validación

**👤 Owner:** Desarrollador Frontend
**📋 Subtareas:**
1. Crear modal de "Planificación Asistida" en `request-detail-modal.tsx`
2. Diseñar formulario de ficha técnica intuitivo
3. Implementar visualización de informes de IA
4. Conectar con workflow de análisis predictivo
5. Agregar validación y edición de estimaciones

**⏱️ Estimación:** 12 horas

**📊 Métricas de Éxito Semana 3:**
- Base vectorial contiene 50+ documentos con embeddings válidos
- Búsquedas por similitud retornan resultados relevantes 85% del tiempo
- Agente Planificador genera estimaciones dentro de rango razonable
- Líderes pueden completar flujo de planificación asistida

---

## 📅 **SEMANA 4: INTEGRACIONES MONDAY.COM Y TEAMS + PILOTO**
**Objetivo:** Completar integraciones externas, implementar notificaciones Teams, y ejecutar prueba piloto con usuarios reales.

### **Tarea 4.1: Integración Completa Monday.com**
**🎯 Criterios de Aceptación:**
- API connection con Monday.com funcionando
- Creación automática de proyectos desde portal
- Sincronización bidireccional de estados
- Adjunto automático de documentos (ficha técnica, informes)

**👤 Owner:** Desarrollador Backend/Integrations
**📋 Subtareas:**
1. Configurar credenciales y connection Monday.com API
2. Crear workflow n8n para endpoint `/projects/formalize`
3. Implementar creación automática de proyectos
4. Configurar sincronización bidireccional de estados
5. Testing exhaustivo de integración

**⏱️ Estimación:** 16 horas

### **Tarea 4.2: Bot de Teams y Notificaciones Multi-canal**
**🎯 Criterios de Aceptación:**
- Bot de Teams configurado y funcionando
- Notificaciones automáticas en Teams para cambios de estado
- Links directos desde Teams al portal
- Configuración de preferencias de notificación

**👤 Owner:** Desarrollador Backend/DevOps
**📋 Subtareas:**
1. Configurar bot de Microsoft Teams
2. Implementar webhooks para notificaciones Teams
3. Crear templates de mensajes para Teams
4. Configurar deep linking desde Teams al portal
5. Panel de preferencias de notificación

**⏱️ Estimación:** 14 horas

### **Tarea 4.3: Sección de Ayuda y Q&A**
**🎯 Criterios de Aceptación:**
- Sección de ayuda completa con FAQ
- Búsqueda en documentación funcionando
- Videos tutoriales embebidos
- Sistema de tickets de soporte básico

**👤 Owner:** Desarrollador Frontend + Content Creator
**📋 Subtareas:**
1. Crear componente `help-view.tsx` con navegación por categorías
2. Documentar FAQ basado en casos de uso comunes
3. Implementar búsqueda en documentación
4. Crear/embeber videos tutoriales para cada rol
5. Sistema básico de tickets de soporte

**⏱️ Estimación:** 12 horas

### **Tarea 4.4: Prueba Piloto con Usuarios Reales**
**🎯 Criterios de Aceptación:**
- 10 usuarios piloto (5 solicitantes, 3 líderes dominio, 2 líderes gerenciales)
- Flujo completo ejecutado end-to-end
- Feedback documentado y priorizado
- Issues críticos identificados y resueltos

**👤 Owner:** Product Manager + QA Lead
**📋 Subtareas:**
1. Seleccionar y onboardear 10 usuarios piloto
2. Crear scripts de testing para cada rol
3. Ejecutar sesiones de testing supervisado
4. Documentar feedback y issues encontrados
5. Priorizar mejoras para post-lanzamiento

**⏱️ Estimación:** 16 horas

### **Tarea 4.5: Métricas y Monitoreo**
**🎯 Criterios de Aceptación:**
- Dashboard de métricas operacionales funcionando
- Logs de auditoría completos
- Alertas automáticas configuradas
- Reportes de adopción y satisfacción

**👤 Owner:** DevOps + Data Analyst
**📋 Subtareas:**
1. Configurar logging completo en todos los workflows
2. Crear dashboard de métricas en tiempo real
3. Implementar alertas para issues críticos
4. Sistema de recolección de feedback automático
5. Reportes semanales automatizados

**⏱️ Estimación:** 10 horas

**📊 Métricas de Éxito Semana 4:**
- 100% de proyectos aprobados se crean automáticamente en Monday.com
- Notificaciones Teams se envían en <60 segundos
- 90% de usuarios piloto completan flujo sin asistencia
- Satisfacción general de usuarios piloto >4.0/5.0

---

## 🎯 **CRITERIOS DE ACEPTACIÓN GENERALES POR SEMANA**

### **Semana 1 - Fundación**
✅ Tabla `requests` creada y operacional  
✅ Portal solicitante simplificado (3 opciones sidebar únicamente)  
✅ Endpoint `/chat/finalize` clasifica solicitudes correctamente  
✅ Dashboard líder muestra solicitudes de su dominio  

### **Semana 2 - N8N y Seguridad**  
✅ Workflow InsightBot procesa conversaciones sin errores  
✅ RLS impide acceso no autorizado a datos  
✅ Notificaciones email funcionando  
✅ Vista "Mis Solicitudes" unificada operacional  

### **Semana 3 - IA Avanzada**
✅ Base vectorial con 50+ documentos históricos  
✅ Agente Planificador genera estimaciones realistas  
✅ Búsquedas por similitud retornan resultados relevantes  
✅ Interfaz de planificación asistida completa  

### **Semana 4 - Integración y Piloto**
✅ Monday.com integrado completamente  
✅ Bot Teams envía notificaciones automáticas  
✅ 10 usuarios piloto completan flujo exitosamente  
✅ Feedback positivo general y issues críticos resueltos  

---

## 👥 **ASIGNACIÓN DE OWNERS POR ESPECIALIDAD**

### **🔧 Desarrollador Backend** (32 horas totales)
- Tarea 1.1: Tabla requests y RLS básico (6h)
- Tarea 2.2: RLS avanzado (8h)  
- Tarea 2.3: Sistema notificaciones (12h)
- Tarea 4.1: Integración Monday.com (16h)

### **🤖 Especialista IA/N8N** (44 horas totales)
- Tarea 1.2: Endpoint finalización (12h)
- Tarea 2.1: Workflow InsightBot completo (16h)
- Tarea 3.2: Workflow Agente Planificador (16h)

### **🎨 Desarrollador Frontend** (42 horas totales)
- Tarea 1.3: Simplificación portal solicitante (8h)
- Tarea 1.4: Dashboard mínimo líderes (10h)
- Tarea 2.4: Vista "Mis Solicitudes" unificada (12h)
- Tarea 3.4: Interfaz planificación asistida (12h)

### **📊 Especialista ML/Embeddings** (32 horas totales)
- Tarea 3.1: Pipeline embeddings completo (18h)
- Tarea 3.3: Carga datos históricos (14h)

### **⚡ DevOps/Integrations** (24 horas totales)
- Tarea 4.2: Bot Teams y notificaciones (14h)
- Tarea 4.5: Métricas y monitoreo (10h)

### **📝 Product Manager/QA** (28 horas totales)
- Tarea 4.3: Sección ayuda y documentación (12h)
- Tarea 4.4: Prueba piloto usuarios (16h)

---

## 📈 **MÉTRICAS DE ÉXITO FINALES**

### **Métricas Técnicas**
- ⚡ Tiempo respuesta promedio InsightBot: <2 segundos
- 🎯 Precisión clasificación IA: >80%  
- 🔒 0 vulnerabilidades de seguridad en RLS
- 📱 100% funcionalidades working en móvil

### **Métricas de Usuario**
- 😊 Satisfacción usuarios piloto: >4.0/5.0
- ⏱️ Tiempo completar flujo solicitud: <10 minutos
- 📧 Tasa apertura notificaciones: >70%
- 🎓 Usuarios completan onboarding: >90%

### **Métricas de Adopción**
- 📊 Solicitudes ingresadas por portal: 100% (piloto)
- 🔄 Proyectos sincronizados Monday.com: 100%
- 💬 Respuesta promedio mensajes Teams: <4 horas
- 📈 Reducción tiempo clarificación: >30%

---

## 🚨 **RIESGOS Y MITIGACIÓN**

### **🔴 Riesgo Alto - Integración Monday.com**
**Problema:** API Monday.com puede tener limitaciones no documentadas  
**Mitigación:** Testing temprano en Semana 3, plan B con webhooks manuales  

### **🟡 Riesgo Medio - Performance Embeddings**  
**Problema:** Búsquedas vectoriales pueden ser lentas con gran volumen  
**Mitigación:** Índices optimizados, cache de embeddings frecuentes  

### **🟡 Riesgo Medio - Adopción Usuario**
**Problema:** Resistencia al cambio de proceso actual  
**Mitigación:** Involucrar usuarios en diseño, capacitación intensiva  

### **🟢 Riesgo Bajo - Capacidad N8N**
**Problema:** N8N puede no manejar carga de producción  
**Mitigación:** Monitoring temprano, plan de scaling horizontal  

---

## 📋 **CHECKLIST FINAL - LISTO PARA PRODUCCIÓN**

### **✅ Funcional**
- [ ] Usuario puede crear solicitud conversando con IA
- [ ] IA clasifica y asigna solicitudes automáticamente  
- [ ] Líderes reciben notificaciones multi-canal
- [ ] Líderes pueden evaluar y decidir sobre solicitudes
- [ ] Proyectos aprobados se crean en Monday.com automáticamente
- [ ] Sistema de mensajería bidireccional funciona

### **✅ Seguridad**
- [ ] RLS impide acceso no autorizado
- [ ] Logs de auditoría completos
- [ ] Datos sensibles encriptados
- [ ] Backup automático configurado

### **✅ Performance**
- [ ] Tiempo respuesta <3 segundos para 95% de requests
- [ ] Base vectorial optimizada para búsquedas
- [ ] Notificaciones se envían en <60 segundos
- [ ] Sistema stable con 10 usuarios concurrentes

### **✅ UX/UI**
- [ ] Portal solicitante simplificado (3 opciones sidebar)
- [ ] Interfaz responsiva en móvil y desktop
- [ ] Documentación y ayuda completa
- [ ] Feedback users piloto incorporado

**🎉 RESULTADO FINAL:** Portal de Innovación GTTD completamente funcional, con IA integrada, flujos automatizados, y usuarios satisfechos - listo para lanzamiento organizacional.
