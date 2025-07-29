# Contexto Completo: Portal de Innovación GTTD
## Documento Maestro de Contexto y Hilo Conductor

**Versión:** 2.1  
**Fecha:** 28 de julio de 2025  
**Propósito:** Servir como el documento de referencia central que consolida toda la información del proyecto, asegurando coherencia y continuidad en cada iteración, modificación o mejora del Portal de Innovación GTTD.

---

## 1. VISIÓN GENERAL DEL PROYECTO

### 1.1 Contexto Organizacional
- **Organización:** Universidad Tecnológica del Perú (UTP)
- **Área Responsable:** Gerencia de Tecnología y Transformación Digital (GTTD)
- **Misión GTTD:** Crear soluciones tecnológicas e innovadoras que brindan la mejor experiencia digital a estudiantes, docentes y colaboradores

### 1.2 Problemática Central
La GTTD gestiona más de 40 proyectos anuales y múltiples requerimientos operativos, pero carece de un proceso estandarizado para la gestión de la demanda:

**Problemas Identificados:**
- No existe un flujo único de recepción y evaluación de solicitudes
- Cada líder maneja solicitudes de forma diferente (correo, WhatsApp, reuniones)
- No hay criterios compartidos para priorizar
- Retrabajo en planificación por falta de claridad en las solicitudes
- Cuellos de botella en el levantamiento de necesidades (principal cuello de botella identificado)
- Falta de visibilidad de la capacidad real del equipo
- Impacto negativo en el KPI de "entregables a tiempo"
- Tiempo de respuesta no medido ni estandarizado (cada líder maneja tiempos diferentes)

### 1.3 Reto Principal
**¿Cómo diseñar un proceso ágil y colaborativo que permita gestionar, priorizar y formalizar de forma efectiva la demanda de proyectos y requerimientos de Tecnología y Transformación Digital?**

### 1.4 Datos Clave del Contexto Actual
- **Volumen:** 40+ proyectos anuales + requerimientos no mapeados
- **Planificación anual:** 80 proyectos mapeados inicialmente
- **Usuarios Monday.com:** 20 personas (10-12 líderes principales + sub-líderes + equipo GTTD)
- **Dominios:** 6 áreas principales (Prospección, Planificación/Matrícula, Servicios al Alumno, Gestión Docente, Aprendizaje/Evaluación, Gestión Administrativa)
- **Herramientas actuales:** Monday.com (macro), Jira (micro), Teams, Excel individual por líder

---

## 2. ARQUITECTURA DE LA SOLUCIÓN

### 2.1 Enfoque Tecnológico
**Arquitectura Desacoplada de 4 Capas:**

1. **Frontend (Capa de Presentación)**
   - Tecnología: React + Next.js 15 + TypeScript
   - Estilo: Tailwind CSS + shadcn/ui
   - Responsabilidad: Interfaces diferenciadas por rol

2. **Backend (Capa de Orquestación)**
   - Tecnología: n8n auto-alojado en Docker
   - Responsabilidad: API Gateway, lógica de negocio, orquestación de workflows

3. **Inteligencia (Capa de IA)**
   - Tecnología: API de Google Gemini 2.5 Pro
   - Responsabilidad: Agentes de IA especializados

4. **Persistencia (Capa de Datos)**
   - Tecnología: Supabase (PostgreSQL + pgvector)
   - Responsabilidad: Datos estructurados + embeddings vectoriales

### 2.2 Agentes de IA Especializados

#### Agente 1: "InsightBot" (Descubrimiento Conversacional)
- **Propósito:** Estandarizar la recepción de solicitudes mediante conversación guiada
- **Tecnología:** Workflow en n8n + API Gemini
- **Resultado:** "Informe Técnico para Líder" estructurado
- **Beneficio:** Elimina ambigüedad y retrabajo en el levantamiento
- **Preguntas Clave Obligatorias:**
  - ¿Cuál es el problema principal que se busca resolver?
  - ¿Quiénes son los principales beneficiados o afectados?
  - ¿Cuál es el objetivo de negocio o el resultado ideal esperado?
  - ¿Qué plataformas o procesos actuales se verían impactados?

#### Agente 2: "Planificador Experto" (Pipeline RAG)
- **Propósito:** Mejorar estimaciones usando conocimiento histórico
- **Tecnología:** RAG nativo en n8n + Supabase/pgvector
- **Resultado:** "Informe de Planificación Predictiva"
- **Beneficio:** Estimaciones más precisas basadas en datos históricos
- **Alimentación:** Fichas de cierre obligatorias de proyectos completados

---

## 3. ROLES Y PORTALES DIFERENCIADOS

### 3.1 Portal del Solicitante
**Filosofía:** Experiencia conversacional, interactiva y transparente

#### 3.1.1 Vista Principal: 🏠 Mi Espacio de Innovación
**Descripción:** Interfaz de chat a pantalla completa que simula una conversación con ChatGPT, pero con componentes ricos integrados.

**Flujo de Interacción Detallado:**
1. **Estado Inicial (Empty State):**
   - Se muestra un ícono de Sparkles en un círculo azul/rojo UTP
   - Título: "Mi Espacio de Innovación"
   - 4 tarjetas de sugerencias predefinidas con íconos (Lightbulb, Zap, Target, Sparkles)
   - Consejos para una mejor solicitud en la parte inferior

2. **Inicio de Conversación:**
   - Usuario hace clic en una sugerencia O escribe en el input inferior
   - **Trigger:** `handleSendMessage()` se ejecuta
   - Se crea mensaje tipo "user" con timestamp
   - Bot responde automáticamente después de 1 segundo con `getBotResponse()`

3. **Componentes Ricos Renderizados en el Chat:**

   **a) Tarjeta de Resumen Interactivo (RF-S02):**
   - **Cuándo aparece:** Después de 4-5 intercambios de mensajes
   - **Trigger:** `setShowSummary(true)` después de 2 segundos
   - **Contenido:** 3 columnas (Problema, Objetivo, Impacto) con datos extraídos de la conversación
   - **Acciones:** Botones [✔️ Validar y Enviar] y [✏️ Aclarar un Punto]
   - **Comportamiento:** Al hacer clic en "Validar", se cierra el chat y aparece en "Mis Solicitudes"

   **b) Selector de Plataformas (RF-S03):**
   - **Cuándo aparece:** Cuando el usuario menciona "plataforma" o "sistema"
   - **Trigger:** Detección de palabras clave en `handleSendMessage()`
   - **Contenido:** 4 botones con opciones (Canvas, PeopleSoft, Oracle, Otros)
   - **Comportamiento:** Al seleccionar, se envía mensaje automático y continúa conversación

   **c) Vista Previa de Documentos (RF-S04):**
   - **Cuándo aparece:** Cuando usuario adjunta archivo (funcionalidad futura)
   - **Contenido:** Ícono de archivo, nombre, tamaño, checkmark verde
   - **Comportamiento:** Confirmación visual de subida exitosa

   **d) Encuesta de Satisfacción (RF-S05):**
   - **Cuándo aparece:** Al finalizar la conversación exitosamente
   - **Contenido:** 5 estrellas interactivas con estado hover
   - **Comportamiento:** `setRating(star)` actualiza el estado visual

#### 3.1.2 Vista: 📊 Mis Solicitudes
**Descripción:** Dashboard personal con cuadrícula de tarjetas de solicitudes.

**Estructura de Tarjetas:**
- **Header:** Título + ID + badges de estado y tipo
- **Contenido:** Descripción truncada + fecha de envío
- **Footer:** Botón "Ver Detalles" que abre el tracking panel

**Estados Visuales:**
- Nueva: Badge azul
- En Evaluación: Badge amarillo
- Aprobada: Badge verde
- Rechazada: Badge rojo

#### 3.1.3 Panel: 🔍 Seguimiento Detallado
**Descripción:** Drawer lateral que se desliza desde la derecha.

**Componentes del Panel:**
1. **Análisis IA (Superior):** Estimación del próximo paso generada por IA
2. **Línea de Tiempo (Central):** Timeline vertical cronológica con íconos, descripciones, fechas exactas
3. **Documentos (Inferior):** Lista de documentos descargables
4. **Pestaña Mensajes:** Chat interno para comunicación con líderes

**Triggers de Apertura:**
- Clic en "Ver Detalles" desde Mis Solicitudes
- Llamada a `handleOpenTracking(request)` desde cualquier componente

### 3.2 Portal del Líder de Dominio
**Filosofía:** Centro de gestión táctica y operativa

#### 3.2.1 Vista Principal: 📊 Dashboard de mi Dominio
**Descripción:** Dashboard táctico con KPIs superiores y tabla de solicitudes filtrada por dominio.

**Estructura del Dashboard:**

**a) Header Superior:**
- Título: "Dashboard de mi Dominio"
- Badges: Dominio asignado (ej: "Infraestructura TI") + Nombre del líder
- Botones: [📈 Reportes] y [🗺️ Ver Roadmap]

**b) KPIs Superiores (4 tarjetas):**
1. **Solicitudes Pendientes:** Número + cambio porcentual + ícono Clock
2. **Aprobadas este Mes:** Número + cambio + ícono CheckCircle  
3. **Presupuesto Asignado:** Monto + cambio + ícono DollarSign
4. **Tiempo Promedio:** Días + cambio + ícono TrendingUp

**c) Filtros y Búsqueda:**
- Input de búsqueda con ícono Search
- Botón [Filtros] con ícono Filter
- Contador total de solicitudes

**d) Tabla de Solicitudes con Tabs:**
- **Tab "Pendientes":** Solicitudes en estado "Nueva" o "En Evaluación"
- **Tab "Procesadas":** Solicitudes "Aprobadas" o "Rechazadas"

**Estructura de Tarjetas de Solicitud:**
- **Header:** Título + badges (Tipo, Prioridad, Urgencia)
- **Descripción:** Texto truncado con line-clamp-2
- **Grid de Información:** 4 columnas (Solicitante, Presupuesto, Fecha, Tiempo en Estado)
- **Acciones:** Botón [👁️ Revisar] + menú de 3 puntos

**Triggers de Interacción:**
- Clic en tarjeta completa: `handleViewRequest(request)`
- Clic en botón "Revisar": Abre `RequestDetailModal`
- Búsqueda: Filtrado en tiempo real con `searchTerm`

#### 3.2.2 Vista: 👥 Mi Equipo
**Descripción:** Vista de solo lectura sincronizada con Jira/Monday para mostrar capacidad del equipo.

**Título:** "Capacidad y Carga de mi Equipo"

**Estructura:**
- **Header:** Botón [🔄 Sincronizar Ahora] en esquina superior derecha
- **Grid de Tarjetas:** Cada miembro del equipo en una tarjeta

**Contenido de Tarjeta de Miembro:**
- **Avatar + Nombre:** Foto de perfil + nombre completo
- **Rol:** Etiqueta con posición (ej: "Desarrollador Senior")
- **Carga de Trabajo:** Barra de progreso o porcentaje calculado desde Jira
- **Entregables Actuales:** Lista de 2-3 épicas/tareas más importantes
- **Estado:** Indicador visual de disponibilidad

**Fuente de Datos:** Integración en tiempo real con APIs de Jira y Monday.com

#### 3.2.3 Vista: 📈 Métricas de Dominio
**Descripción:** Dashboard analítico con gráficos interactivos del rendimiento del dominio.

**Título:** "Análisis de Métricas del Dominio"

**Controles Superiores:**
- **Filtro de Fecha:** Selector dropdown (Últimos 30 días, Último Trimestre, Último Año)

**Layout de Gráficos (2x2):**

**Fila Superior:**
1. **Gráfico de Barras:** "Solicitudes por Tipo" (Proyectos vs Requerimientos)
2. **Gráfico de Pastel:** "Solicitudes por Prioridad" (Alta, Media, Baja)

**Fila Inferior:**
3. **Gráfico de Línea:** "Tiempo Promedio de Ciclo" (evolución temporal)
4. **Gráfico de Cuello de Botella:** "Tiempo Promedio por Estado" (días por fase)

**Tecnología:** Implementado con Recharts para interactividad

#### 3.2.4 Modal: 🔍 Modo Focus (Request Detail Modal)
**Descripción:** Modal de pantalla completa para evaluación detallada de solicitudes.

**Estructura de Pestañas:**
1. **Resumen IA:** Informe del InsightBot + botones de decisión
2. **Planificación Asistida:** Flujo completo del Agente 2
3. **Historial y Métricas:** Log de auditoría + medidores de tiempo
4. **Colaboración:** Chat interno entre líderes

**Botones de Decisión (Pestaña Resumen):**
- **Para Líder de Dominio:**
  - [✅ Aprobar Requerimiento]
  - [🚀 Elevar para Aprobación Gerencial] (solo proyectos)
  - [❌ Rechazar]
  - [⏸️ Poner en Espera]

**Flujo de Elevación:**
- Al hacer clic en "Elevar": Se abre modal que requiere justificación obligatoria
- Campo de texto para explicar por qué se eleva
- Botón [Confirmar Elevación] que cambia estado a "Pendiente de Aprobación Gerencial"

**Capacidades de Decisión:**
- Aprobar requerimientos directamente (sin escalamiento)
- Elevar proyectos para aprobación gerencial (con justificación)
- Gestionar comunicación bidireccional con solicitantes
- Invitar a otros líderes a colaborar (@menciones)

### 3.3 Portal del Líder Gerencial
**Filosofía:** Centro de mando estratégico y analítico

#### 3.3.1 Vista Principal: 🌍 Dashboard Global
**Descripción:** Vista de "helicóptero" que muestra la salud de toda la demanda GTTD.

**Título:** "Dashboard Global GTTD"

**KPIs Superiores (Agregados Organizacionales):**
1. **Solicitudes Totales Pendientes:** Número total en pipeline
2. **Presupuesto Solicitado (Q3):** Suma de presupuestos estimados
3. **Tiempo Promedio de Ciclo (Global):** Tiempo desde entrada hasta aprobación/rechazo
4. **Salud del Proceso:** Indicador de cuello de botella (fase con más acumulación)

**Tabla Principal: "Todas las Solicitudes"**
- **Alcance:** TODAS las solicitudes de TODOS los dominios
- **Filtros Avanzados:** Dominio, Líder Asignado, Estado, Prioridad, Tipo, Rango de Presupuesto
- **Acción Principal:** [👁️ Ver Detalle] (sin capacidades de gestión directa)

**Diferencia Clave:** No se toman decisiones aquí, solo se observa y filtra

#### 3.3.2 Vista: 📬 Bandeja de Aprobaciones
**Descripción:** Centro de acción principal del Líder Gerencial para proyectos elevados.

**Título:** "Bandeja de Aprobaciones"

**Contenido:** Lista de tarjetas de solicitudes elevadas por Líderes de Dominio

**Estructura de Tarjeta de Aprobación:**
- **Header:** Título de la solicitud + badge de dominio
- **Líder que Eleva:** Nombre del Líder de Dominio responsable
- **Justificación:** Texto de la justificación proporcionada al elevar
- **Metadatos:** Presupuesto estimado, impacto, urgencia
- **Acción:** Botón [🔍 Revisar y Decidir]

**Modal de Decisión Estratégica:**
Al hacer clic en "Revisar y Decidir" se abre modal con:

**Información Destacada:**
1. **Justificación del Líder de Dominio** (prominente en la parte superior)
2. **Informe Completo de la IA** (InsightBot + Planificador si aplica)
3. **Historial de la Solicitud** (timeline completa)

**Botones de Decisión Final:**
- [✅ Aprobación Final y Asignación de Presupuesto]
- [❌ Rechazar Proyecto]
- [❓ Solicitar más Información al Líder de Dominio]

**Flujo Post-Decisión:**
- Sistema actualiza estado en BD
- Notificaciones automáticas a Líder de Dominio Y Solicitante
- Actualización de líneas de tiempo en todos los portales

#### 3.3.3 Vista: 🗺️ Roadmap Estratégico
**Descripción:** Vista de cronograma de alto nivel tipo Gantt/timeline para comunicar estrategia.

**Título:** "Roadmap Estratégico"

**Contenido:**
- **Cronograma Visual:** Barras horizontales representando proyectos aprobados
- **Información por Barra:** Dominio responsable, fechas clave (inicio/fin), dependencias
- **Filtro de Contenido:** Solo grandes iniciativas estratégicas (NO requerimientos pequeños)
- **Período:** Vista trimestral/anual

**Propósito:** Comunicar expectativas y gestionar la estrategia organizacional

#### 3.3.4 Vista: 📈 Reportes y Analíticas
**Descripción:** Cerebro analítico del portal con gráficos interactivos para optimización.

**Título:** "Reportes y Analíticas"

**Componentes Analíticos:**

**a) Mapa de Calor de la Demanda:**
- Gráfico que muestra qué áreas de UTP generan más solicitudes
- Ejes: Áreas (Marketing, Académico, etc.) vs Volumen de solicitudes

**b) Análisis de Tendencias:**
- Gráficos de líneas: Solicitudes vs Aprobaciones a lo largo del tiempo
- Comparativas mensuales/trimestrales

**c) Análisis de Rendimiento del Proceso:**
- Gráficos de cuello de botella: Identificación de fases problemáticas
- Tiempo promedio por estado del proceso

**d) Análisis Presupuestario:**
- Comparativa: Presupuesto Solicitado vs Aprobado vs Ejecutado
- Distribución por dominios

**Funcionalidades Avanzadas:**
- **Búsqueda Semántica Global:** Barra de búsqueda con IA para encontrar patrones históricos
- **Exportación:** Botones para PDF/Excel de reportes
- **Filtros Temporales:** Rangos de fecha personalizables

**Capacidades Estratégicas:**
- Aprobación final de proyectos (solo desde Bandeja de Aprobaciones)
- Asignación de presupuesto (campo obligatorio en aprobación)
- Gestión de dominios (vista de rendimiento por área)
- Análisis de tendencias (identificación de patrones y optimizaciones)

---

## 4. FLUJOS DE PROCESO DETALLADOS

### 4.1 Flujo Principal: Registro de Nueva Solicitud

#### Paso 1: Inicio de Conversación
**Actor:** Solicitante  
**Acción:** Hace clic en [+ Nueva Solicitud] en sidebar O accede a "Mi Espacio de Innovación"  
**Trigger Técnico:** `setCurrentView("chat")` en `app/page.tsx`  
**Estado Visual:** Se carga `ChatInterface` component con empty state

#### Paso 2: Interacción con InsightBot
**Actor:** Solicitante + Agente 1  
**Flujo Detallado:**
1. **Usuario escribe o selecciona sugerencia**
   - `handleSendMessage()` ejecuta
   - Mensaje se añade al array `messages` con tipo "user"
   - `getBotResponse()` se ejecuta después de 1 segundo

2. **Bot responde con preguntas guiadas**
   - Preguntas clave del Manual de Gobernanza:
     - ¿Cuál es el problema principal?
     - ¿Quiénes son los beneficiados?
     - ¿Cuál es el objetivo de negocio?
     - ¿Qué plataformas se impactan?

3. **Renderizado de componentes ricos según contexto:**
   - **Selector de plataformas:** Si menciona "plataforma/sistema"
   - **Vista previa de documentos:** Si adjunta archivos
   - **Tarjeta de resumen:** Después de 4-5 intercambios

#### Paso 3: Generación de Informe Técnico
**Actor:** Agente 1 (InsightBot)  
**Trigger:** Usuario hace clic en [✔️ Validar y Enviar] en tarjeta de resumen  
**Proceso Backend (n8n):**
1. **Endpoint:** `POST /chat/finalize`
2. **Análisis de IA:** Aplicación de rúbricas de clasificación
3. **Generación de informe** con estructura:
   ```
   - Título sugerido
   - Clasificación: Proyecto/Requerimiento
   - Prioridad: P1/P2/P3/P4
   - Análisis de sentimiento
   - Detalles clave extraídos
   - Transcripción completa
   ```

#### Paso 4: Asignación Automática
**Actor:** Sistema  
**Lógica de Asignación:**
- **Mapeo por palabras clave:** Canvas → Líder Académico, PeopleSoft → Líder RRHH
- **Dominio por defecto:** Si no hay match, asigna a "Infraestructura TI"
- **Notificación:** Email + Teams + notificación en portal

#### Paso 5: Aparición en Dashboard del Líder
**Actor:** Sistema  
**Efecto Visual:**
- Nueva tarjeta aparece en tab "Pendientes" del `LeaderDashboard`
- Estado inicial: "Nueva" (badge azul)
- Contador de "Solicitudes Pendientes" se incrementa
- Notificación visual en sidebar del líder

### 4.2 Flujo de Comunicación Líder ↔ Solicitante

#### Iniciación por el Líder
**Trigger:** Líder hace clic en [💬 Enviar Mensaje al Solicitante] desde `RequestDetailModal`  
**Proceso:**
1. **Modal de Chat se abre** con campo de texto
2. **Líder escribe mensaje** y hace clic en [Enviar]
3. **Backend (n8n):** `POST /messages/send`
   ```json
   {
     "requestId": "REQ-2025-001",
     "senderId": "leader_id",
     "receiverId": "user_id",
     "message": "Necesito aclaración sobre..."
   }
   ```

#### Notificación al Solicitante
**Canales Múltiples:**
1. **Portal:** Badge rojo en ícono de notificaciones
2. **Teams:** Mensaje directo del bot
3. **Email:** Notificación con link directo

#### Respuesta del Solicitante
**Trigger:** Solicitante abre `TrackingPanel` y va a pestaña "Mensajes"  
**Interface:** Chat bidireccional con historial completo  
**Trazabilidad:** Cada mensaje se registra en timeline con timestamp exacto

### 4.3 Flujo de Evaluación y Decisión del Líder de Dominio

#### Cambio de Estado: Nueva → En Evaluación
**Trigger:** Líder arrastra tarjeta en Kanban O hace clic en [Iniciar Evaluación]  
**Efecto Inmediato:**
- Estado cambia en BD
- Timeline del solicitante se actualiza: "[Fecha/Hora] - [Nombre del Líder] ha comenzado la evaluación"
- Badge cambia de azul a amarillo

#### Proceso de Evaluación
**Ubicación:** `RequestDetailModal` en pestaña "Resumen IA"  
**Información Disponible:**
- Informe completo del InsightBot
- Análisis de sentimiento
- Clasificación sugerida
- Transcripción de conversación

#### Toma de Decisión
**Opciones para Requerimientos:**
- [✅ Aprobar Requerimiento] → Estado: "Aprobada"
- [❌ Rechazar] → Estado: "Rechazada"
- [⏸️ Poner en Espera] → Estado: "En Espera"

**Opciones para Proyectos:**
- [✅ Aprobar Proyecto] → Estado: "Aprobada"
- [🚀 Elevar para Aprobación Gerencial] → Estado: "Pendiente de Aprobación Gerencial"
- [❌ Rechazar] → Estado: "Rechazada"

#### Flujo de Elevación (Solo Proyectos)
**Trigger:** Clic en [🚀 Elevar para Aprobación Gerencial]  
**Modal de Justificación:**
- Campo de texto obligatorio: "Justificación para elevación"
- Botón [Confirmar Elevación] (deshabilitado hasta que se escriba)
- **Efecto:** Solicitud aparece en "Bandeja de Aprobaciones" del Líder Gerencial

### 4.4 Flujo de Planificación Asistida (Agente 2)

#### Activación del Planificador Experto
**Prerequisito:** Proyecto aprobado por Líder de Dominio  
**Trigger:** Líder hace clic en pestaña "Planificación Asistida" en `RequestDetailModal`  
**Interface:** Formulario para "Ficha Técnica"

#### Creación de Ficha Técnica
**Campos Obligatorios:**
- Descripción detallada del proyecto
- Objetivos específicos
- Entregables principales
- Restricciones técnicas
- Presupuesto estimado

#### Procesamiento por Agente 2
**Backend (n8n):** `POST /requests/{id}/analyze`  
**Pipeline RAG:**
1. **Generación de embedding** de la ficha técnica
2. **Búsqueda por similitud** en base vectorial
3. **Recuperación** de proyectos históricos similares
4. **Construcción de prompt** enriquecido
5. **Llamada a Gemini** para análisis predictivo

#### Generación de Informe Predictivo
**Estructura del Informe:**
```
- Proyectos históricos similares (3-5 referencias)
- Estimación realista: X semanas/meses
- Rango de confianza: Optimista (-20%) a Pesimista (+30%)
- Perfil del equipo ideal
- Análisis de riesgos potenciales con probabilidades
```

#### Validación y Ajuste
**Actor:** Líder de Dominio  
**Acciones Disponibles:**
- Revisar estimaciones y ajustar si necesario
- Añadir comentarios específicos
- Aprobar plan para formalización

### 4.5 Flujo de Formalización y Transición a Monday.com

#### Formulario de Formalización
**Trigger:** Líder hace clic en [🚀 Formalizar Proyecto]  
**Campos Pre-poblados:**
- Título (del informe IA)
- Descripción (de la ficha técnica)
- Presupuesto (estimado)
- Fechas tentativas (del análisis predictivo)

#### Creación Automática en Monday.com
**Backend (n8n):** Workflow de integración  
**Proceso:**
1. **Validación** de campos obligatorios
2. **Llamada a Monday.com API** para crear proyecto
3. **Adjunto** de documentos (Ficha Técnica + Informe Predictivo)
4. **Asignación** de equipo según recomendaciones de IA

#### Notificaciones Finales
**Destinatarios:** Solicitante + Líder de Dominio + Equipo asignado  
**Canales:** Portal + Teams + Email  
**Contenido:** "Tu solicitud ha sido formalizada como proyecto [ID] en Monday.com"

### 4.6 Flujo de Escalamiento y Decisión Gerencial

#### Aparición en Bandeja de Aprobaciones
**Trigger:** Líder de Dominio eleva proyecto  
**Efecto:** Nueva tarjeta aparece en `ApprovalsInbox` del Líder Gerencial  
**Información Destacada:** Justificación del líder + resumen del proyecto

#### Proceso de Revisión Gerencial
**Ubicación:** Modal de "Decisión Estratégica"  
**Información Completa:**
- Justificación del Líder de Dominio (prominente)
- Informe completo de InsightBot
- Análisis predictivo del Planificador Experto
- Historial completo de la solicitud

#### Decisión Final
**Opciones Estratégicas:**
- [✅ Aprobación Final y Asignación de Presupuesto]
  - Requiere monto específico de presupuesto
  - Proyecto pasa a estado "Aprobada - Presupuesto Asignado"
- [❌ Rechazar Proyecto]
  - Requiere justificación de rechazo
  - Proyecto pasa a estado "Rechazada - Nivel Gerencial"
- [❓ Solicitar más Información al Líder de Dominio]
  - Abre chat directo con el líder
  - Proyecto permanece en "Pendiente de Aprobación Gerencial"

#### Efectos Post-Decisión
**Notificaciones Automáticas:**
- Líder de Dominio: Decisión + próximos pasos
- Solicitante: Resultado final + timeline actualizada
- Equipo (si aprobado): Asignación de proyecto

**Actualizaciones de Estado:**
- Todas las vistas se actualizan en tiempo real
- Métricas y KPIs se recalculan automáticamente
- Timeline completa queda registrada para auditoría

---

## 5. GOBERNANZA Y TRANSPARENCIA

### 5.1 Rúbricas de Clasificación (Transparentes y Auditables)

#### 5.1.1 Clasificación: Proyecto vs. Requerimiento
**Algoritmo de Decisión del Agente 1:**

**Se clasifica como PROYECTO si cumple al menos DOS de las siguientes condiciones:**
1. **Esfuerzo estimado:** Supera las 40 horas de trabajo
2. **Impacto multi-dominio:** Afecta a más de dos dominios o plataformas críticas (Canvas, PeopleSoft, Oracle)
3. **Presupuesto:** Requiere asignación de presupuesto mayor a $5,000 USD
4. **Complejidad técnica:** Requiere arquitectura nueva o integración compleja

**Se clasifica como REQUERIMIENTO en todos los demás casos:**
- Cambios menores en plataformas existentes
- Un solo dominio afectado
- Presupuesto menor a $5,000 USD
- Implementación directa sin arquitectura nueva

#### 5.1.2 Priorización (P1, P2, P3, P4)
**Matriz de Priorización del Agente 1:**

**P1 - Crítica:**
- Solicitudes de carácter regulatorio/obligatorio (SUNEDU, etc.)
- Fallas críticas que impactan la operación
- Objetivos estratégicos principales del trimestre
- Impacto en experiencia del estudiante (crítico)

**P2 - Alta:**
- Alto impacto en experiencia del estudiante o eficiencia operativa
- Implementación factible con recursos actuales
- Alineado con objetivos estratégicos secundarios
- ROI claro y medible

**P3 - Media:**
- Mejoras incrementales valiosas
- Optimizaciones de procesos existentes
- No urgentes pero con beneficio claro
- Recursos disponibles sin afectar P1/P2

**P4 - Baja:**
- Cambios menores o "nice to have"
- Sin impacto crítico en operación
- Puede postergarse sin consecuencias
- Recursos limitados o inciertos

#### 5.1.3 Análisis de Sentimiento
**Indicadores que detecta el Agente 1:**
- **Urgencia Detectada:** Palabras como "urgente", "inmediato", "crítico"
- **Frustración del Usuario:** Tono negativo, problemas recurrentes
- **Oportunidad de Negocio:** Palabras como "crecimiento", "eficiencia", "ahorro"
- **Presión Regulatoria:** Menciones de entidades externas, compliance

### 5.2 Plantillas Estandarizadas

#### 5.2.1 Informe Técnico para Líder (Agente 1)
**Estructura Obligatoria:**
```
TÍTULO DE LA SOLICITUD: [Generado por IA]

SOLICITANTE: [Nombre] | ÁREA: [Área del Usuario]

RESUMEN EJECUTIVO:
[Párrafo que resume problema y objetivo]

ANÁLISIS DE LA IA:
- Clasificación Sugerida: [Requerimiento/Proyecto]
- Prioridad Sugerida: [P1/P2/P3/P4]
- Análisis de Sentimiento: [Urgencia/Frustración/Oportunidad/etc.]

DETALLES CLAVE RECOPILADOS:
- Problema Raíz: [Descripción específica]
- Objetivo de Negocio: [Resultado esperado]
- Plataformas Impactadas: [Lista de sistemas]
- Beneficiarios: [Quiénes se benefician]
- Restricciones: [Limitaciones técnicas/temporales]

TRANSCRIPCIÓN COMPLETA:
[Historial completo de la conversación]
```

#### 5.2.2 Informe de Planificación Predictiva (Agente 2)
**Estructura Obligatoria:**
```
TÍTULO DEL PROYECTO ANALIZADO: [Nombre del proyecto]

PROYECTOS HISTÓRICOS SIMILARES UTILIZADOS COMO REFERENCIA:
1. [Proyecto A] - Similitud: X%
2. [Proyecto B] - Similitud: Y%
3. [Proyecto C] - Similitud: Z%

ESTIMACIÓN DE TIEMPOS (BASADA EN DATOS):
- Estimación Realista: X semanas/meses
- Rango de Confianza: 
  * Optimista: X - 20%
  * Pesimista: X + 30%

SUGERENCIA DE ASIGNACIÓN DE RECURSOS:
- Perfil del Equipo Ideal: [Ej: 1 Líder Técnico, 2 Devs, 1 QA]
- Habilidades Clave Requeridas: [Lista específica]

ANÁLISIS DE RIESGOS POTENCIALES (BASADO EN HISTÓRICO):
- Riesgo 1: [Descripción] - Probabilidad: [Alta/Media/Baja]
- Riesgo 2: [Descripción] - Probabilidad: [Alta/Media/Baja]
- Riesgo 3: [Descripción] - Probabilidad: [Alta/Media/Baja]

RECOMENDACIONES ESPECÍFICAS:
[Sugerencias basadas en lecciones aprendidas]
```

#### 5.2.3 Ficha de Cierre de Proyecto (Alimentación del Agente 2)
**Plantilla Obligatoria para Líderes:**
```
INFORMACIÓN BÁSICA:
- Nombre del Proyecto: [Título final]
- Descripción Final: [Qué se construyó realmente]
- Fecha de Inicio: [DD/MM/YYYY]
- Fecha de Finalización: [DD/MM/YYYY]

ANÁLISIS TEMPORAL:
- Tiempo Planificado Total: [X semanas/meses]
- Tiempo Real Total: [Y semanas/meses]
- Variación: [+/- Z%]

DESGLOSE POR FASES:
- Análisis y Diseño: Planificado [X] vs Real [Y]
- Desarrollo: Planificado [X] vs Real [Y]
- Pruebas: Planificado [X] vs Real [Y]
- Despliegue: Planificado [X] vs Real [Y]

RECURSOS:
- Equipo Planificado: [Roles y cantidad]
- Equipo Real: [Roles y cantidad real]
- Presupuesto Planificado: [Monto]
- Presupuesto Real: [Monto ejecutado]

LECCIONES APRENDIDAS:
- ¿Qué salió bien?: [Lista de éxitos]
- ¿Qué salió mal?: [Lista de problemas]
- ¿Qué haríamos diferente?: [Mejoras identificadas]

OBSTÁCULOS Y RETRASOS:
- Obstáculo 1: [Descripción] - Impacto: [X días/semanas]
- Obstáculo 2: [Descripción] - Impacto: [Y días/semanas]

CALIDAD DEL ENTREGABLE:
- Satisfacción del Usuario: [1-5]
- Bugs Post-Producción: [Cantidad]
- Cambios de Alcance: [Cantidad y razones]
```

### 5.3 Mejora Continua y Auditoría

#### 5.3.1 Proceso de Actualización de Rúbricas
**Frecuencia:** Cada 6 meses
**Responsable:** Equipo de líderes GTTD
**Proceso:**
1. Análisis de precisión de clasificaciones
2. Revisión de casos edge o problemáticos
3. Ajuste de criterios basado en feedback
4. Actualización de algoritmos de IA
5. Comunicación de cambios a usuarios

#### 5.3.2 Auditoría de Rendimiento de IA
**Métricas Tracked:**
- **Precisión de Clasificación:** % de solicitudes correctamente clasificadas
- **Precisión de Priorización:** % de prioridades que coinciden con decisión final del líder
- **Precisión de Estimaciones:** Diferencia entre estimación de IA y tiempo real
- **Satisfacción del Usuario:** Rating promedio del proceso

**Proceso de Calibración:**
- Comparación mensual de predicciones vs resultados reales
- Identificación de patrones de error
- Reentrenamiento de prompts si es necesario
- Actualización de base de conocimiento

#### 5.3.3 Sistema de Feedback Continuo
**Canales de Feedback:**
- Botón flotante de feedback en todas las pantallas
- Encuestas post-proceso automáticas
- Reuniones trimestrales con líderes
- Análisis de logs de uso

**Tipos de Feedback Capturado:**
- Errores técnicos (bugs)
- Sugerencias de mejora
- Consultas sobre el proceso
- Problemas de usabilidad

---

## 6. INTEGRACIÓN CON ECOSISTEMA UTP

### 6.1 Herramientas Existentes y Roles

#### 6.1.1 Monday.com (Gestión Macro)
**Propósito:** Vista de alto nivel de proyectos y entregables
**Usuarios:** 20 personas (líderes + sub-líderes + equipo GTTD)
**Contenido:**
- Nombre del proyecto
- Entregables principales (duración 2-4 meses cada uno)
- Fechas de inicio y fin
- Estado general del proyecto
- Responsables

**Diferenciación con Jira:**
- Monday: Entregables grandes que el usuario final puede validar
- Jira: Tareas diarias (100+ tareas por entregable de 2 meses)

#### 6.1.2 Jira (Gestión Micro)
**Propósito:** Gestión detallada de tareas diarias
**Usuarios:** Equipos de desarrollo (sin acceso a Monday)
**Contenido:**
- Tareas específicas de desarrollo
- Bugs y issues técnicos
- Sprints y planificación ágil
- Tiempo dedicado por tarea

#### 6.1.3 Microsoft Teams
**Propósito:** Comunicación y notificaciones
**Integración:**
- Bot del portal para notificaciones automáticas
- Mensajes directos sobre cambios de estado
- Links directos al portal desde notificaciones

#### 6.1.4 Supabase
**Propósito:** Base de datos principal y autenticación
**Funcionalidades:**
- Autenticación SSO con credenciales UTP
- Almacenamiento de solicitudes y conversaciones
- Base vectorial para embeddings (pgvector)
- APIs automáticas para frontend

### 6.2 Transición Automatizada a Monday.com

#### 6.2.1 Formulario de Formalización
**Trigger:** Proyecto aprobado y planificado
**Ubicación:** Pestaña "Planificación Asistida" del RequestDetailModal
**Campos Pre-poblados:**
- Título del proyecto (del informe IA)
- Descripción ejecutiva (de la ficha técnica)
- Presupuesto estimado (del análisis predictivo)
- Fechas tentativas (del análisis predictivo)
- Equipo sugerido (del análisis predictivo)

**Campos Editables por el Líder:**
- Ajustes de fechas
- Modificaciones de presupuesto
- Selección final de equipo
- Entregables principales

#### 6.2.2 Workflow de Integración (n8n)
**Endpoint:** `POST /projects/formalize`
**Proceso Automatizado:**
1. **Validación:** Verificar campos obligatorios
2. **Creación en Monday:** Llamada a Monday.com API
3. **Estructura del Proyecto:**
   ```json
   {
     "name": "Título del proyecto",
     "description": "Descripción ejecutiva",
     "budget": "Presupuesto asignado",
     "start_date": "YYYY-MM-DD",
     "end_date": "YYYY-MM-DD",
     "team": ["user_id_1", "user_id_2"],
     "deliverables": [
       {
         "name": "Entregable 1",
         "due_date": "YYYY-MM-DD",
         "description": "Descripción del entregable"
       }
     ]
   }
   ```
4. **Adjuntar Documentos:** Ficha Técnica + Informe Predictivo como archivos
5. **Asignación de Equipo:** Notificaciones automáticas a miembros asignados
6. **Actualización de Estado:** Cambio a "Formalizado" en el portal

#### 6.2.3 Sincronización Bidireccional
**Frecuencia:** Tiempo real (webhooks) + sincronización diaria
**Datos Sincronizados:**
- Estado del proyecto (Monday → Portal)
- Progreso de entregables (Monday → Portal)
- Cambios de fechas (Monday → Portal)
- Comentarios importantes (Monday → Portal)

### 6.3 Integración con Jira (Solo Lectura)

#### 6.3.1 Vista "Mi Equipo" del Líder de Dominio
**Propósito:** Mostrar capacidad y carga de trabajo en tiempo real
**Fuente de Datos:** API de Jira (solo lectura)
**Información Extraída:**
- Tareas asignadas por persona
- Estado de las tareas (To Do, In Progress, Done)
- Tiempo estimado vs tiempo real
- Épicas y sprints activos

#### 6.3.2 Cálculo de Capacidad
**Algoritmo:**
```
Capacidad = (Horas disponibles - Horas asignadas) / Horas disponibles * 100

Donde:
- Horas disponibles = 40 horas/semana por persona
- Horas asignadas = Suma de estimaciones de tareas activas
```

**Indicadores Visuales:**
- Verde (0-70%): Capacidad disponible
- Amarillo (70-90%): Capacidad alta
- Rojo (90-100%): Sobrecargado

---

## 7. MÉTRICAS Y KPIs OBJETIVO

### 7.1 Métricas de Proceso (Eficiencia)

#### 7.1.1 Tiempo de Respuesta
**Métrica:** Tiempo promedio de respuesta inicial
**Definición:** Tiempo desde que se envía una solicitud hasta que el líder la revisa por primera vez
**Objetivo:** < 24 horas (vs actual: no medido)
**Medición:** Timestamp de envío vs timestamp de primera apertura en RequestDetailModal

#### 7.1.2 Tiempo de Ciclo Completo
**Métrica:** Tiempo total desde solicitud hasta decisión final
**Definición:** Tiempo desde envío hasta estado final (Aprobada/Rechazada)
**Objetivo:** < 5 días laborales para requerimientos, < 15 días para proyectos
**Medición:** Timestamp de envío vs timestamp de decisión final

#### 7.1.3 Reducción en Iteraciones de Clarificación
**Métrica:** Número promedio de mensajes de ida y vuelta por solicitud
**Definición:** Cantidad de intercambios necesarios para clarificar una solicitud
**Objetivo:** < 3 intercambios promedio (vs actual: 5-8 estimado)
**Medición:** Conteo de mensajes en chat líder-solicitante antes de decisión

#### 7.1.4 Porcentaje de Solicitudes Bien Clasificadas
**Métrica:** Precisión de clasificación Proyecto vs Requerimiento
**Definición:** % de solicitudes donde la IA clasificó correctamente vs decisión final del líder
**Objetivo:** > 85% de precisión
**Medición:** Comparación clasificación IA vs clasificación final

### 7.2 Métricas de Calidad (Efectividad)

#### 7.2.1 Precisión de Estimaciones del Agente 2
**Métrica:** Diferencia entre estimación de IA y tiempo real de proyecto
**Definición:** |Tiempo estimado - Tiempo real| / Tiempo real * 100
**Objetivo:** < 25% de diferencia promedio
**Medición:** Comparación con fichas de cierre de proyectos

#### 7.2.2 Satisfacción del Usuario con el Proceso
**Métrica:** Rating promedio de experiencia
**Definición:** Promedio de calificaciones en encuestas post-proceso
**Objetivo:** > 4.5/5.0
**Medición:** Encuestas automáticas + feedback continuo

#### 7.2.3 Adopción del Portal por Líderes
**Métrica:** % de solicitudes que ingresan por el portal vs canales tradicionales
**Definición:** Solicitudes portal / Total solicitudes * 100
**Objetivo:** > 90% en 6 meses
**Medición:** Conteo de solicitudes por canal

#### 7.2.4 Mejora en KPI "Entregables a Tiempo"
**Métrica:** % de entregables completados en fecha comprometida
**Definición:** Entregables a tiempo / Total entregables * 100
**Objetivo:** Mejora de 15% vs baseline actual
**Medición:** Datos de Monday.com

### 7.3 Métricas de Capacidad (Optimización)

#### 7.3.1 Visibilidad de Carga de Trabajo por Dominio
**Métrica:** % de tiempo que los líderes tienen visibilidad clara de capacidad
**Definición:** Días con datos actualizados / Total días * 100
**Objetivo:** > 95% de días con datos actualizados
**Medición:** Logs de sincronización con Jira/Monday

#### 7.3.2 Tiempo Promedio por Estado
**Métrica:** Días promedio que las solicitudes permanecen en cada estado
**Estados Medidos:**
- Nueva: < 1 día
- En Evaluación: < 3 días
- Pendiente Aprobación Gerencial: < 5 días
**Medición:** Diferencia entre timestamps de cambios de estado

#### 7.3.3 Identificación de Cuellos de Botella
**Métrica:** Estado con mayor acumulación de solicitudes
**Definición:** Estado donde se concentra el mayor % de solicitudes pendientes
**Objetivo:** No más del 40% de solicitudes en un solo estado
**Medición:** Distribución de solicitudes por estado en tiempo real

#### 7.3.4 Optimización de Asignación de Recursos
**Métrica:** Balanceamiento de carga entre dominios
**Definición:** Desviación estándar de carga de trabajo entre dominios
**Objetivo:** < 20% de diferencia entre el dominio más cargado y menos cargado
**Medición:** Análisis de capacidad por dominio

### 7.4 Dashboard de Métricas

#### 7.4.1 Vista para Líder Gerencial
**Ubicación:** Sección "Reportes y Analíticas"
**Gráficos Incluidos:**
- Tiempo de ciclo promedio (línea temporal)
- Distribución de solicitudes por estado (pastel)
- Precisión de IA por mes (barras)
- Satisfacción del usuario (gauge)
- Carga de trabajo por dominio (mapa de calor)

#### 7.4.2 Vista para Líder de Dominio
**Ubicación:** Sección "Métricas de Dominio"
**Gráficos Incluidos:**
- Solicitudes por tipo (barras)
- Tiempo promedio por estado (barras horizontales)
- Tendencia de volumen (línea)
- Satisfacción específica del dominio (estrellas)

#### 7.4.3 Alertas Automáticas
**Triggers de Alerta:**
- Solicitud > 5 días sin respuesta
- Acumulación > 10 solicitudes en un estado
- Precisión de IA < 80% en una semana
- Satisfacción < 4.0 en un dominio

**Canales de Alerta:**
- Notificación en portal
- Email al líder responsable
- Mensaje en Teams (casos críticos)

---

## 8. ESTADO ACTUAL DE IMPLEMENTACIÓN

### 8.1 Componentes Completados ✅

#### 8.1.1 Frontend Completo
**Arquitectura Implementada:**
- **App Router de Next.js 15** con TypeScript
- **Sistema de autenticación** con roles diferenciados
- **Navegación dinámica** basada en rol del usuario
- **Responsive design** con modo oscuro/claro

**Componentes por Rol:**
- **Solicitante:** `ChatInterface`, `HistoryView`, `DocumentsView`, `TrackingPanel`
- **Líder Dominio:** `LeaderDashboard`, `TeamView`, `DomainMetricsView`
- **Líder Gerencial:** `GlobalDashboard`, `ApprovalsInbox`, `StrategicRoadmap`, `ReportsAnalytics`
- **Compartidos:** `RequestDetailModal`, `NotificationCenter`, `SettingsView`

#### 8.1.2 Sistema de Diseño Consistente
**shadcn/ui Implementado:**
- **Componentes base:** Button, Card, Input, Badge, Tabs, Modal, etc.
- **Tema personalizado:** Colores UTP (azul corporativo + rojo para modo oscuro)
- **Tipografía:** Inter como fuente principal
- **Iconografía:** Lucide React con íconos consistentes

#### 8.1.3 Lógica de Navegación
**Flujos Implementados:**
- **Login diferenciado:** Redirección automática según rol
- **Sidebar dinámico:** Opciones específicas por rol
- **Estado de aplicación:** Gestión centralizada en `app/page.tsx`
- **Modales y panels:** Sistema de overlays para detalles

#### 8.1.4 Simulación de Datos
**Mock Data Implementado:**
- **Solicitudes de ejemplo** con diferentes estados y tipos
- **Usuarios simulados** para cada rol
- **Métricas ficticias** para dashboards
- **Conversaciones de chat** con componentes ricos

### 8.2 Componentes Pendientes ⏳

#### 8.2.1 Backend n8n
**Workflows por Implementar:**
- **Agente 1 (InsightBot):** Workflow conversacional con Gemini
- **Agente 2 (Planificador):** Pipeline RAG completo
- **Gestión de usuarios:** Autenticación y autorización
- **Notificaciones:** Sistema multi-canal (email, Teams, portal)
- **Integraciones:** APIs de Monday.com, Jira, Teams

**Endpoints Requeridos:**
```
POST /auth/login
POST /chat/send
GET /requests/my-requests
GET /requests/{id}
GET /requests/domain
GET /requests/all
POST /requests/{id}/status
POST /requests/{id}/escalate
POST /requests/{id}/analyze
POST /messages/send
POST /projects/formalize
```

#### 8.2.2 Base de Datos Supabase
**Esquema por Implementar:**
```sql
-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL, -- solicitante, lider_dominio, lider_gerencial
  domain VARCHAR, -- para líderes de dominio
  created_at TIMESTAMP DEFAULT NOW()
);

-- Solicitudes
CREATE TABLE requests (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL, -- proyecto, requerimiento
  priority VARCHAR NOT NULL, -- P1, P2, P3, P4
  status VARCHAR NOT NULL, -- nueva, en_evaluacion, aprobada, rechazada
  requester_id UUID REFERENCES users(id),
  assigned_leader_id UUID REFERENCES users(id),
  domain VARCHAR NOT NULL,
  estimated_budget DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversaciones
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES requests(id),
  messages JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mensajes entre usuarios
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES requests(id),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documentos históricos para RAG
CREATE TABLE historical_documents (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- para pgvector
  project_type VARCHAR,
  domain VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Informes de IA
CREATE TABLE ai_reports (
  id UUID PRIMARY KEY,
  request_id UUID REFERENCES requests(id),
  type VARCHAR NOT NULL, -- insight, planning
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 8.2.3 Integración con Gemini
**Configuración Requerida:**
- **API Key de Google Gemini 2.5 Pro**
- **Prompts optimizados** para cada agente
- **Manejo de rate limits** y errores
- **Logging de interacciones** para auditoría

#### 8.2.4 Pipeline RAG
**Componentes por Implementar:**
- **Generación de embeddings** con Gemini
- **Base vectorial** en Supabase con pgvector
- **Búsqueda por similitud** optimizada
- **Chunking inteligente** de documentos
- **Reranking de resultados** por relevancia

#### 8.2.5 Integraciones Externas
**APIs por Conectar:**
- **Monday.com API:** Creación y sincronización de proyectos
- **Microsoft Teams API:** Bot para notificaciones
- **Jira API:** Lectura de capacidad de equipos
- **SMTP:** Envío de emails de notificación

### 8.3 Arquitectura de Archivos Actual

```
d:/Universidad/Impulsa UTP/Reto 1/Codigo Fuente/
├── app/                           # App Router de Next.js
│   ├── globals.css               # Estilos globales con Tailwind
│   ├── layout.tsx                # Layout raíz con providers
│   ├── loading.tsx               # Componente de carga global
│   └── page.tsx                  # Página principal con lógica de roles
├── components/                   # Componentes React
│   ├── ui/                      # Componentes base shadcn/ui
│   │   ├── button.tsx           # Botón reutilizable
│   │   ├── card.tsx             # Tarjetas de contenido
│   │   ├── input.tsx            # Campos de entrada
│   │   ├── badge.tsx            # Etiquetas de estado
│   │   ├── tabs.tsx             # Navegación por pestañas
│   │   ├── dialog.tsx           # Modales y diálogos
│   │   └── [30+ componentes más]
│   ├── chat-interface.tsx        # Interfaz conversacional principal
│   ├── leader-dashboard.tsx      # Dashboard líder dominio
│   ├── global-dashboard.tsx      # Dashboard líder gerencial
│   ├── request-detail-modal.tsx  # Modal de detalle de solicitudes
│   ├── tracking-panel.tsx        # Panel de seguimiento
│   ├── approvals-inbox.tsx       # Bandeja de aprobaciones
│   ├── strategic-roadmap.tsx     # Roadmap estratégico
│   ├── reports-analytics.tsx     # Reportes y analíticas
│   ├── team-view.tsx            # Vista de equipo
│   ├── domain-metrics-view.tsx   # Métricas de dominio
│   ├── history-view.tsx         # Historial de solicitudes
│   ├── documents-view.tsx       # Gestión de documentos
│   ├── settings-view.tsx        # Configuración de usuario
│   ├── notification-center.tsx  # Centro de notificaciones
│   ├── sidebar.tsx              # Navegación lateral
│   ├── login-page.tsx           # Página de autenticación
│   ├── theme-provider.tsx       # Proveedor de temas
│   └── theme-toggle.tsx         # Alternador de tema
├── hooks/                       # Custom hooks
│   ├── use-mobile.tsx           # Hook para detección móvil
│   └── use-toast.ts             # Hook para notificaciones
├── lib/                         # Utilidades
│   └── utils.ts                 # Funciones de utilidad
├── public/                      # Assets estáticos
│   ├── placeholder-logo.png     # Logo placeholder
│   ├── placeholder-user.jpg     # Avatar placeholder
│   └── [otros assets]
├── styles/                      # Estilos adicionales
│   └── globals.css              # Estilos globales adicionales
├── package.json                 # Dependencias del proyecto
├── tailwind.config.ts           # Configuración de Tailwind
├── tsconfig.json               # Configuración de TypeScript
├── next.config.mjs             # Configuración de Next.js
└── components.json             # Configuración de shadcn/ui
```

### 8.4 Dependencias Implementadas

```json
{
  "dependencies": {
    "next": "15.2.4",
    "react": "^19",
    "react-dom": "^19",
    "typescript": "^5",
    "@radix-ui/react-*": "latest", // Componentes base de shadcn/ui
    "tailwindcss": "^3.4.17",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "lucide-react": "^0.454.0",
    "next-themes": "latest",
    "recharts": "latest", // Para gráficos
    "react-hook-form": "^7.54.1",
    "zod": "^3.24.1"
  }
}
```

---

## 9. HILO CONDUCTOR Y PRINCIPIOS RECTORES

### 9.1 Principios de Diseño Fundamentales

#### 9.1.1 Transparencia Total
**Definición:** Toda decisión de IA debe ser explicable y auditable
**Implementación:**
- Rúbricas de clasificación visibles en sección "Gobernanza del Proceso"
- Justificación de cada decisión de IA en informes
- Logs completos de interacciones para auditoría
- Posibilidad de apelar o ajustar decisiones de IA

**Ejemplo Práctico:** Cuando la IA clasifica una solicitud como "Proyecto P2", el informe debe explicar: "Clasificado como Proyecto porque supera 40 horas estimadas y afecta múltiples plataformas. Prioridad P2 por alto impacto en experiencia del estudiante."

#### 9.1.2 Experiencia Diferenciada
**Definición:** Cada rol tiene necesidades específicas y merece una interfaz optimizada
**Implementación:**
- Solicitante: Interfaz conversacional simple y transparente
- Líder Dominio: Dashboard táctico con herramientas de gestión
- Líder Gerencial: Vista estratégica con analíticas avanzadas

**Ejemplo Práctico:** El mismo proyecto se muestra diferente en cada portal:
- Solicitante ve: Estado, próximo paso, timeline
- Líder Dominio ve: Detalles técnicos, opciones de decisión, comunicación
- Líder Gerencial ve: Impacto estratégico, presupuesto, justificación

#### 9.1.3 Automatización Inteligente
**Definición:** IA como asistente que potencia decisiones humanas, no las reemplaza
**Implementación:**
- IA sugiere, humanos deciden
- Clasificaciones son recomendaciones, no imposiciones
- Estimaciones son rangos, no valores fijos
- Siempre hay opción de override manual

**Ejemplo Práctico:** La IA sugiere "Proyecto P2" pero el líder puede cambiar a "Requerimiento P1" si tiene información adicional. El sistema registra la diferencia para aprender.

#### 9.1.4 Integración Fluida
**Definición:** Conectar y potenciar herramientas existentes, no reemplazarlas
**Implementación:**
- Monday.com sigue siendo la herramienta de gestión de proyectos
- Jira mantiene su rol en gestión de tareas
- Teams continúa como canal de comunicación
- Portal actúa como orquestador, no como reemplazo

**Ejemplo Práctico:** Cuando se aprueba un proyecto, se crea automáticamente en Monday.com con toda la información del portal, pero la gestión diaria sigue en Monday.com.

#### 9.1.5 Mejora Continua
**Definición:** Sistema que aprende y evoluciona basado en datos y feedback
**Implementación:**
- Fichas de cierre alimentan la IA para mejores estimaciones
- Feedback de usuarios mejora la experiencia
- Métricas de precisión calibran algoritmos
- Revisiones periódicas actualizan rúbricas

**Ejemplo Práctico:** Si la IA estima 8 semanas para un tipo de proyecto pero históricamente toma 12, el algoritmo se ajusta automáticamente para futuras estimaciones similares.

### 9.2 Criterios de Éxito Medibles

#### 9.2.1 Adopción Masiva
**Objetivo:** >90% de solicitudes ingresan por el portal
**Medición:** Solicitudes portal / Total solicitudes * 100
**Timeline:** 6 meses post-lanzamiento
**Estrategia:** Capacitación + incentivos + facilidad de uso

#### 9.2.2 Eficiencia Operativa
**Objetivo:** 50% reducción en tiempo de clarificación
**Medición:** Promedio de intercambios antes vs después
**Timeline:** 3 meses post-lanzamiento
**Estrategia:** Conversación guiada + componentes ricos

#### 9.2.3 Calidad Predictiva
**Objetivo:** 80% precisión en estimaciones de IA
**Medición:** |Estimado - Real| / Real < 20%
**Timeline:** 12 meses (requiere datos históricos)
**Estrategia:** Base de conocimiento robusta + calibración continua

#### 9.2.4 Satisfacción del Usuario
**Objetivo:** >4.5/5 en experiencia de usuario
**Medición:** Encuestas post-proceso + feedback continuo
**Timeline:** 3 meses post-lanzamiento
**Estrategia:** UX optimizada + respuesta rápida a feedback

#### 9.2.5 Impacto en Entregables
**Objetivo:** Mejora medible en "entregables a tiempo"
**Medición:** % entregables a tiempo antes vs después
**Timeline:** 6 meses post-lanzamiento
**Estrategia:** Mejor planificación + estimaciones precisas

### 9.3 Factores Críticos de Éxito

#### 9.3.1 Sponsorship Ejecutivo
**Importancia:** Crítica para adopción y gestión del cambio
**Acciones Requeridas:**
- Comunicación clara de beneficios por parte de liderazgo GTTD
- Mandato de uso del portal para nuevas solicitudes
- Respaldo visible en reuniones y comunicaciones
- Asignación de recursos para implementación

#### 9.3.2 Gestión del Cambio
**Importancia:** Esencial para superar resistencia al cambio
**Acciones Requeridas:**
- Plan de capacitación por roles
- Comunicación de beneficios específicos para cada usuario
- Soporte durante transición
- Celebración de quick wins

#### 9.3.3 Calidad de Datos
**Importancia:** Fundamental para efectividad de IA
**Acciones Requeridas:**
- Migración de datos históricos de calidad
- Fichas de cierre obligatorias y completas
- Validación de datos de entrada
- Limpieza y curación continua

#### 9.3.4 Iteración Rápida
**Importancia:** Clave para ajuste y mejora continua
**Acciones Requeridas:**
- Ciclos de feedback de 2 semanas
- Deployment continuo de mejoras
- A/B testing de funcionalidades
- Respuesta rápida a issues críticos

#### 9.3.5 Comunicación Clara
**Importancia:** Esencial para adopción y satisfacción
**Acciones Requeridas:**
- Beneficios tangibles comunicados por rol
- Documentación clara y accesible
- Canal de soporte dedicado
- Comunicación proactiva de cambios

---

## 10. ROADMAP DE DESARROLLO DETALLADO

### 10.1 Fase 1: Fundación (Semanas 1-4)

#### Semana 1: Infraestructura Base
**Objetivos:**
- Configurar entorno de desarrollo y producción
- Establecer base de datos y autenticación
- Configurar n8n y primeras integraciones

**Entregables:**
- Supabase configurado con esquema inicial
- n8n desplegado en Docker
- Autenticación básica funcionando
- Primeros endpoints de API

**Criterios de Aceptación:**
- Usuario puede hacer login y ver interfaz según su rol
- Base de datos acepta y almacena solicitudes básicas
- n8n puede recibir y procesar webhooks

#### Semana 2: Agente 1 (InsightBot) - Básico
**Objetivos:**
- Implementar conversación básica con Gemini
- Crear workflow de clasificación
- Generar primeros informes técnicos

**Entregables:**
- Workflow n8n para chat conversacional
- Integración con API de Gemini
- Generación de informes estructurados
- Almacenamiento de conversaciones

**Criterios de Aceptación:**
- Usuario puede conversar con bot y recibir respuestas coherentes
- Bot puede clasificar solicitudes como Proyecto/Requerimiento
- Se genera informe técnico estructurado

#### Semana 3: Integración Frontend-Backend
**Objetivos:**
- Conectar interfaz de chat con backend real
- Implementar flujo completo de solicitud
- Configurar notificaciones básicas

**Entregables:**
- Chat interface conectado a n8n
- Flujo completo: solicitud → clasificación → asignación
- Notificaciones por email funcionando
- Dashboard de líder mostrando solicitudes reales

**Criterios de Aceptación:**
- Solicitud enviada desde frontend aparece en dashboard del líder
- Líder recibe notificación de nueva solicitud
- Estados de solicitud se actualizan en tiempo real

#### Semana 4: Testing con Usuarios Piloto
**Objetivos:**
- Probar flujo completo con usuarios reales
- Identificar issues críticos
- Ajustar UX basado en feedback

**Entregables:**
- 5 usuarios piloto completando flujo completo
- Lista de issues identificados y priorizados
- Plan de mejoras para Fase 2
- Documentación básica de usuario

**Criterios de Aceptación:**
- 80% de usuarios piloto completan flujo sin asistencia
- Issues críticos identificados y documentados
- Feedback positivo general (>3.5/5)

### 10.2 Fase 2: Inteligencia (Semanas 5-8)

#### Semana 5: Agente 2 (Planificador) - Pipeline RAG
**Objetivos:**
- Implementar generación de embeddings
- Configurar base vectorial
- Crear búsqueda por similitud

**Entregables:**
- Pipeline de embeddings con Gemini
- Base vectorial en Supabase funcionando
- Algoritmo de búsqueda por similitud
- Primeros documentos históricos cargados

**Criterios de Aceptación:**
- Documentos se convierten en embeddings correctamente
- Búsqueda por similitud retorna resultados relevantes
- Performance de búsqueda < 2 segundos

#### Semana 6: Agente 2 - Análisis Predictivo
**Objetivos:**
- Implementar generación de informes predictivos
- Crear workflow completo de planificación
- Integrar con interfaz de líder

**Entregables:**
- Workflow n8n para análisis predictivo
- Generación de informes de planificación
- Interfaz de "Planificación Asistida" funcionando
- Validación de estimaciones con datos históricos

**Criterios de Aceptación:**
- Líder puede subir ficha técnica y recibir análisis
- Informe incluye estimaciones, riesgos y recomendaciones
- Estimaciones están dentro de rango razonable vs histórico

#### Semana 7: Carga de Datos Históricos
**Objetivos:**
- Migrar proyectos históricos a base vectorial
- Crear fichas de cierre para proyectos pasados
- Calibrar algoritmos con datos reales

**Entregables:**
- 50+ proyectos históricos en base vectorial
- Fichas de cierre estructuradas para proyectos clave
- Algoritmos calibrados con datos reales
- Métricas de precisión iniciales

**Criterios de Aceptación:**
- Base vectorial contiene representación diversa de proyectos
- Búsquedas retornan proyectos verdaderamente similares
- Estimaciones iniciales dentro de 30% de realidad histórica

#### Semana 8: Refinamiento de Rúbricas
**Objetivos:**
- Ajustar criterios de clasificación basado en feedback
- Optimizar prompts de IA
- Implementar sistema de feedback continuo

**Entregables:**
- Rúbricas actualizadas basadas en casos reales
- Prompts optimizados para mejor precisión
- Sistema de feedback integrado en interfaz
- Métricas de precisión mejoradas

**Criterios de Aceptación:**
- Precisión de clasificación > 75%
- Usuarios pueden dar feedback fácilmente
- Rúbricas reflejan casos edge identificados

### 10.3 Fase 3: Integración (Semanas 9-12)

#### Semana 9: Integración Monday.com
**Objetivos:**
- Conectar con API de Monday.com
- Implementar creación automática de proyectos
- Configurar sincronización bidireccional

**Entregables:**
- Integración completa con Monday.com API
- Workflow de formalización funcionando
- Sincronización de estados proyecto
- Formulario de formalización optimizado

**Criterios de Aceptación:**
- Proyecto aprobado se crea automáticamente en Monday.com
- Cambios en Monday.com se reflejan en portal
- Documentos se adjuntan correctamente

#### Semana 10: Integración Teams y Notificaciones
**Objetivos:**
- Configurar bot de Teams
- Implementar notificaciones multi-canal
- Optimizar experiencia de notificaciones

**Entregables:**
- Bot de Teams funcionando
- Notificaciones en portal, email y Teams
- Configuración de preferencias de notificación
- Links directos desde notificaciones

**Criterios de Aceptación:**
- Usuarios reciben notificaciones en canal preferido
- Links desde Teams abren portal en contexto correcto
- Notificaciones son relevantes y no spam

#### Semana 11: Dashboard de Métricas
**Objetivos:**
- Implementar dashboards analíticos
- Configurar métricas en tiempo real
- Crear reportes exportables

**Entregables:**
- Dashboard de métricas para líder gerencial
- Métricas de dominio para líderes tácticos
- Reportes exportables en PDF/Excel
- Alertas automáticas configuradas

**Criterios de Aceptación:**
- Métricas se actualizan en tiempo real
- Gráficos son interactivos y útiles
- Reportes se exportan correctamente

#### Semana 12: Capacitación de Usuarios
**Objetivos:**
- Capacitar a todos los usuarios en el nuevo proceso
- Crear documentación completa
- Establecer canal de soporte

**Entregables:**
- Sesiones de capacitación por rol completadas
- Documentación de usuario completa
- Videos tutoriales grabados
- Canal de soporte establecido

**Criterios de Aceptación:**
- 90% de usuarios capacitados
- Documentación cubre todos los flujos
- Canal de soporte responde en <24 horas

### 10.4 Fase 4: Optimización (Semanas 13-16)

#### Semana 13: Análisis de Adopción
**Objetivos:**
- Medir adopción real vs objetivo
- Identificar barreras de adopción
- Implementar mejoras de UX

**Entregables:**
- Reporte de adopción detallado
- Plan de mejoras de UX
- Optimizaciones implementadas
- Estrategia de incentivos para adopción

**Criterios de Aceptación:**
- Adopción medida y documentada
- Barreras principales identificadas
- Plan de acción para mejorar adopción

#### Semana 14: Ajustes Basados en Feedback
**Objetivos:**
- Implementar mejoras basadas en feedback de usuarios
- Optimizar performance del sistema
- Ajustar algoritmos de IA

**Entregables:**
- Mejoras de UX implementadas
- Performance optimizada
- Algoritmos de IA calibrados
- Bugs críticos resueltos

**Criterios de Aceptación:**
- Satisfacción de usuario > 4.0/5
- Performance de sistema < 2 segundos
- Precisión de IA > 80%

#### Semana 15: Expansión de Funcionalidades
**Objetivos:**
- Implementar funcionalidades adicionales solicitadas
- Preparar roadmap futuro
- Documentar lecciones aprendidas

**Entregables:**
- Funcionalidades adicionales implementadas
- Roadmap de futuras mejoras
- Documentación de lecciones aprendidas
- Plan de mantenimiento

**Criterios de Aceptación:**
- Nuevas funcionalidades funcionan correctamente
- Roadmap futuro está definido y priorizado
- Lecciones aprendidas documentadas

#### Semana 16: Documentación Final y Cierre
**Objetivos:**
- Completar documentación técnica
- Transferir conocimiento al equipo de mantenimiento
- Celebrar éxito del proyecto

**Entregables:**
- Documentación técnica completa
- Manual de mantenimiento
- Transferencia de conocimiento completada
- Reporte final de proyecto

**Criterios de Aceptación:**
- Documentación permite mantenimiento independiente
- Equipo de mantenimiento capacitado
- Objetivos del proyecto alcanzados y medidos

---

## 11. CONSIDERACIONES TÉCNICAS ESPECÍFICAS

### 11.1 Stack Tecnológico Detallado

#### 11.1.1 Frontend (Next.js 15 + React 19)
```typescript
// Configuración principal
{
  "framework": "Next.js 15",
  "runtime": "React 19",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "components": "shadcn/ui (Radix UI)",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts",
  "icons": "Lucide React",
  "themes": "next-themes"
}

// Estructura de componentes
components/
├── ui/                    // Componentes base reutilizables
├── [feature]/            // Componentes específicos por funcionalidad
└── layouts/              // Layouts compartidos

// Gestión de estado
- React Context para estado global
- useState/useEffect para estado local
- Custom hooks para lógica reutilizable
```

#### 11.1.2 Backend (n8n + Docker)
```yaml
# docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - WEBHOOK_URL=https://n8n.utp.edu.pe
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

#### 11.1.3 Base de Datos (Supabase + pgvector)
```sql
-- Configuración de pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Función para búsqueda por similitud
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    title,
    content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM historical_documents
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
```

#### 11.1.4 IA y Procesamiento (Google Gemini)
```typescript
// Configuración de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// Prompt para Agente 1 (InsightBot)
const INSIGHT_PROMPT = `
Eres InsightBot, un asistente especializado en analizar solicitudes tecnológicas.
Tu objetivo es extraer información clave y clasificar solicitudes.

Criterios de clasificación:
- PROYECTO: >40 horas, múltiples dominios, presupuesto >$5000
- REQUERIMIENTO: <40 horas, un dominio, presupuesto <$5000

Prioridades:
- P1: Regulatorio, falla crítica, objetivo estratégico
- P2: Alto impacto, eficiencia significativa
- P3: Mejoras incrementales
- P4: Cambios menores

Analiza la conversación y genera un informe estructurado.
`;

// Prompt para Agente 2 (Planificador)
const PLANNING_PROMPT = `
Eres el Planificador Experto, especializado en estimación de proyectos tecnológicos.
Basándote en proyectos históricos similares, genera estimaciones precisas.

Contexto histórico:
{historical_projects}

Proyecto a analizar:
{project_description}

Genera un informe con estimaciones, riesgos y recomendaciones.
`;
```

### 11.2 Consideraciones de Seguridad

#### 11.2.1 Autenticación y Autorización
```typescript
// Configuración de Supabase Auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Row Level Security (RLS) policies
-- Usuarios solo ven sus propias solicitudes
CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT USING (auth.uid() = requester_id);

-- Líderes ven solicitudes de su dominio
CREATE POLICY "Leaders can view domain requests" ON requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('lider_dominio', 'lider_gerencial')
      AND (users.domain = requests.domain OR users.role = 'lider_gerencial')
    )
  );
```

#### 11.2.2 Protección de Datos
```typescript
// Encriptación de datos sensibles
import { encrypt, decrypt } from '@/lib/encryption';

// Logs de auditoría
const auditLog = {
  user_id: userId,
  action: 'request_approved',
  resource_id: requestId,
  timestamp: new Date(),
  ip_address: req.ip,
  user_agent: req.headers['user-agent']
};

// Validación de entrada
const requestSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  type: z.enum(['proyecto', 'requerimiento']),
  priority: z.enum(['P1', 'P2', 'P3', 'P4'])
});
```

#### 11.2.3 Backup y Recuperación
```bash
# Backup automático diario de Supabase
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
aws s3 cp backup_$(date +%Y%m%d).sql s3://utp-backups/

# Backup de conversaciones de IA
supabase db dump --data-only --table=conversations > conversations_backup.sql
```

### 11.3 Escalabilidad y Performance

#### 11.3.1 Optimización de Base de Datos
```sql
-- Índices para consultas frecuentes
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_domain ON requests(domain);
CREATE INDEX idx_requests_created_at ON requests(created_at);

-- Índice vectorial para búsquedas de similitud
CREATE INDEX ON historical_documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Particionado por fecha para tablas grandes
CREATE TABLE requests_2025 PARTITION OF requests
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

#### 11.3.2 Cache y CDN
```typescript
// Cache de respuestas frecuentes
import { Redis } from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache de embeddings
const cacheKey = `embedding:${hash(text)}`;
const cachedEmbedding = await redis.get(cacheKey);

if (!cachedEmbedding) {
  const embedding = await generateEmbedding(text);
  await redis.setex(cacheKey, 3600, JSON.stringify(embedding));
}

// CDN para assets estáticos
const nextConfig = {
  images: {
    domains: ['cdn.utp.edu.pe'],
  },
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.utp.edu.pe' 
    : '',
};
```

#### 11.3.3 Monitoreo y Alertas
```typescript
// Monitoreo de performance
import { performance } from 'perf_hooks';

const startTime = performance.now();
// ... operación
const endTime = performance.now();
const duration = endTime - startTime;

if (duration > 2000) {
  console.warn(`Slow operation: ${duration}ms`);
  // Enviar alerta
}

// Métricas de IA
const aiMetrics = {
  classification_accuracy: 0.85,
  estimation_error: 0.23,
  response_time: 1.2,
  user_satisfaction: 4.3
};

// Alertas automáticas
if (aiMetrics.classification_accuracy < 0.8) {
  await sendAlert('IA classification accuracy below threshold');
}
```

---

## 12. CASOS DE USO DETALLADOS Y EJEMPLOS

### 12.1 Caso de Uso 1: Solicitud de Requerimiento Simple

#### Contexto
María, coordinadora académica, necesita un nuevo reporte en el sistema Canvas para seguimiento de estudiantes.

#### Flujo Detallado

**Paso 1: Inicio de Conversación**
- María accede al portal y hace clic en "Mi Espacio de Innovación"
- Ve las 4 sugerencias predefinidas y hace clic en "Dashboard BI"
- Sistema ejecuta `handleSuggestionClick()` con el prompt predefinido

**Paso 2: Conversación Guiada**
```
InsightBot: "Un dashboard de BI puede transformar cómo visualizas tus datos. ¿Qué tipo de datos necesitas analizar? ¿Ventas, rendimiento, usuarios, o métricas específicas?"

María: "Necesito un reporte que me muestre el progreso de estudiantes por curso en Canvas, con alertas cuando un estudiante está en riesgo de reprobar."

InsightBot: "Perfecto! Entiendo que necesitas un reporte de seguimiento académico. ¿Qué información específica te gustaría ver en este reporte? Por ejemplo: notas, asistencia, entrega de tareas, tiempo en plataforma?"

María: "Principalmente notas de evaluaciones, porcentaje de tareas entregadas y última fecha de acceso a Canvas."

InsightBot: "Excelente. ¿Quiénes serían los principales usuarios de este reporte? ¿Solo coordinadores académicos o también docentes?"

María: "Coordinadores académicos y jefes de carrera principalmente."
```

**Paso 3: Componente de Selector de Plataformas**
- InsightBot detecta la palabra "Canvas" y renderiza el componente selector
- María selecciona "Canvas - Sistema de gestión académica"
- Sistema ejecuta `handleOptionSelect()` y continúa la conversación

**Paso 4: Generación de Resumen**
- Después de 5 intercambios, sistema ejecuta `setShowSummary(true)`
- Se renderiza la tarjeta de resumen interactivo:

```
Problema: Falta de visibilidad en tiempo real del progreso académico de estudiantes
Objetivo: Crear reporte automatizado con alertas de riesgo académico
Impacto: Intervención temprana para mejorar retención estudiantil
```

**Paso 5: Validación y Envío**
- María hace clic en "✔️ Validar y Enviar"
- Sistema ejecuta workflow n8n para generar informe técnico
- Agente 1 clasifica como: "Requerimiento P2" basado en rúbricas

**Paso 6: Asignación Automática**
- Sistema detecta "Canvas" y asigna a "Líder Académico"
- Se envía notificación a líder correspondiente
- Solicitud aparece en dashboard del líder con estado "Nueva"

#### Resultado Esperado
- Tiempo total del proceso: 8-10 minutos
- Información capturada: Completa y estructurada
- Clasificación: Correcta (Requerimiento por ser cambio menor en una plataforma)
- Satisfacción: Alta por proceso guiado y transparente

### 12.2 Caso de Uso 2: Proyecto Complejo con Escalamiento

#### Contexto
Carlos, gerente de TI, propone una nueva plataforma de análisis predictivo para optimizar recursos académicos.

#### Flujo Detallado

**Paso 1-4: Conversación Inicial** (Similar al caso anterior)
- Conversación más extensa (15+ intercambios)
- Múltiples componentes ricos activados
- Información técnica detallada capturada

**Paso 5: Clasificación como Proyecto**
- Agente 1 clasifica como "Proyecto P1" basado en:
  - Esfuerzo estimado: >200 horas
  - Múltiples dominios afectados: Académico, TI, Analítica
  - Presupuesto estimado: $45,000
  - Impacto estratégico: Alto

**Paso 6: Evaluación por Líder de Dominio**
- Líder de TI recibe notificación
- Abre `RequestDetailModal` en pestaña "Resumen IA"
- Revisa informe completo del InsightBot
- Considera opciones: [Aprobar] [Elevar] [Rechazar]

**Paso 7: Decisión de Elevación**
- Líder decide elevar por alto presupuesto e impacto estratégico
- Hace clic en "🚀 Elevar para Aprobación Gerencial"
- Modal requiere justificación obligatoria:

```
"Este proyecto requiere aprobación gerencial por:
1. Presupuesto superior a $40,000
2. Impacto en múltiples dominios estratégicos
3. Necesidad de integración con sistemas críticos
4. Potencial ROI significativo en optimización de recursos"
```

**Paso 8: Aparición en Bandeja Gerencial**
- Solicitud aparece en `ApprovalsInbox` del Líder Gerencial
- Tarjeta muestra justificación prominentemente
- Líder Gerencial hace clic en "🔍 Revisar y Decidir"

**Paso 9: Activación del Agente 2**
- Antes de decidir, líder solicita análisis predictivo
- Líder crea "Ficha Técnica" detallada del proyecto
- Sistema activa Agente 2 (Planificador Experto)

**Paso 10: Análisis Predictivo**
- Agente 2 busca proyectos similares en base vectorial
- Encuentra 3 proyectos históricos relevantes
- Genera informe predictivo:

```
Proyectos Similares:
1. "Plataforma BI Académica 2023" - Similitud: 87%
2. "Sistema Predictivo Matrícula 2022" - Similitud: 82%
3. "Dashboard Analítico Docente 2024" - Similitud: 78%

Estimación Realista: 8-10 meses
Rango de Confianza: Optimista (6 meses) - Pesimista (13 meses)

Equipo Ideal: 1 Líder Técnico, 2 Desarrolladores Senior, 1 Data Scientist, 1 QA

Riesgos Principales:
- Integración con sistemas legacy (Probabilidad: Alta)
- Cambios de alcance durante desarrollo (Probabilidad: Media)
- Disponibilidad de datos históricos (Probabilidad: Baja)
```

**Paso 11: Decisión Final**
- Líder Gerencial revisa toda la información
- Decide aprobar con presupuesto de $45,000
- Hace clic en "✅ Aprobación Final y Asignación de Presupuesto"

**Paso 12: Formalización Automática**
- Sistema crea proyecto automáticamente en Monday.com
- Adjunta Ficha Técnica e Informe Predictivo
- Notifica a todos los stakeholders
- Proyecto pasa a fase de implementación

#### Resultado Esperado
- Tiempo total del proceso: 3-5 días
- Calidad de decisión: Alta (basada en datos históricos)
- Precisión de estimación: 80%+ (basada en proyectos similares)
- Satisfacción: Alta por proceso transparente y basado en evidencia

### 12.3 Caso de Uso 3: Comunicación Bidireccional

#### Contexto
Durante la evaluación de una solicitud, el líder necesita aclaración adicional del solicitante.

#### Flujo Detallado

**Paso 1: Identificación de Necesidad de Clarificación**
- Líder revisa solicitud en `RequestDetailModal`
- Información insuficiente para tomar decisión
- Hace clic en "💬 Enviar Mensaje al Solicitante"

**Paso 2: Envío de Mensaje**
- Modal de chat se abre
- Líder escribe: "Hola María, necesito más detalles sobre los usuarios finales del reporte. ¿Cuántos coordinadores y jefes de carrera lo usarían aproximadamente?"
- Sistema ejecuta `POST /messages/send`

**Paso 3: Notificación Multi-canal**
- **Portal:** Badge rojo aparece en NotificationCenter
- **Teams:** Bot envía mensaje directo a María
- **Email:** Notificación con link directo al portal

**Paso 4: Respuesta del Solicitante**
- María recibe notificación en Teams
- Hace clic en link que la lleva directamente al `TrackingPanel`
- Va a pestaña "Mensajes" y ve el mensaje del líder
- Responde: "Serían aproximadamente 15 coordinadores y 8 jefes de carrera en total, distribuidos en 5 campus."

**Paso 5: Continuación del Proceso**
- Líder recibe notificación de respuesta
- Con información adicional, puede tomar decisión informada
- Timeline de la solicitud registra toda la comunicación

#### Resultado Esperado
- Tiempo de respuesta: < 2 horas
- Trazabilidad: Completa en timeline
- Satisfacción: Alta por comunicación fluida y transparente

### 12.4 Caso de Uso 4: Análisis de Métricas y Optimización

#### Contexto
Líder Gerencial analiza tendencias mensuales para optimizar el proceso.

#### Flujo Detallado

**Paso 1: Acceso a Analíticas**
- Líder Gerencial accede a "📈 Reportes y Analíticas"
- Ve dashboard con múltiples gráficos interactivos

**Paso 2: Identificación de Patrón**
- Gráfico "Tiempo Promedio por Estado" muestra:
  - Nueva: 0.5 días (objetivo: <1 día) ✅
  - En Evaluación: 4.2 días (objetivo: <3 días) ❌
  - Pendiente Aprobación: 2.1 días (objetivo: <5 días) ✅

**Paso 3: Análisis Profundo**
- Hace clic en "En Evaluación" para drill-down
- Ve que el dominio "Infraestructura TI" tiene 6.8 días promedio
- Otros dominios están en 2-3 días promedio

**Paso 4: Búsqueda Semántica**
- Usa búsqueda semántica: "solicitudes infraestructura TI demoradas"
- IA encuentra patrón: Solicitudes que requieren análisis de seguridad toman más tiempo

**Paso 5: Acción Correctiva**
- Identifica necesidad de proceso específico para análisis de seguridad
- Programa reunión con líder de Infraestructura TI
- Crea task en Monday.com para optimizar proceso

#### Resultado Esperado
- Identificación proactiva de cuellos de botella
- Decisiones basadas en datos reales
- Mejora continua del proceso

---

## 13. CONCLUSIÓN Y PRÓXIMOS PASOS

### 13.1 Resumen Ejecutivo

Este documento establece el contexto completo y el hilo conductor del Portal de Innovación GTTD, consolidando toda la información necesaria para que cualquier IA o desarrollador pueda continuar, modificar o mejorar el proyecto manteniendo la coherencia con la visión original.

**Logros del Documento:**
- **Contexto Completo:** Desde la problemática organizacional hasta los detalles técnicos de implementación
- **Flujos Detallados:** Cada interacción, trigger y efecto visual documentado
- **Principios Rectores:** Guías claras para mantener la coherencia en futuras iteraciones
- **Casos de Uso Reales:** Ejemplos concretos de cómo funciona el sistema en la práctica

### 13.2 Valor para Futuras IAs

Este documento permite que cualquier IA sin acceso a los documentos originales pueda:

1. **Entender el Contexto Completo:** Problemática, solución, arquitectura y objetivos
2. **Implementar Funcionalidades Faltantes:** Con especificaciones detalladas de cada componente
3. **Mantener Coherencia:** Siguiendo los principios rectores y patrones establecidos
4. **Optimizar el Sistema:** Basándose en métricas y casos de uso documentados
5. **Evolucionar la Solución:** Respetando el hilo conductor y la visión estratégica

### 13.3 Impacto Transformacional

El Portal de Innovación GTTD representa más que una herramienta tecnológica; es una transformación fundamental en cómo la UTP gestiona la innovación:

**Antes:**
- Proceso informal y fragmentado
- Cada líder con su propio método
- Falta de visibilidad y trazabilidad
- Retrabajo constante por falta de claridad
- Decisiones subjetivas sin datos

**Después:**
- Proceso estandarizado y transparente
- IA que asiste en clasificación y estimación
- Visibilidad completa del pipeline de demanda
- Información estructurada desde el inicio
- Decisiones basadas en datos históricos

### 13.4 Factores de Éxito Críticos

Para que este proyecto alcance su potencial transformacional, es esencial:

1. **Mantener el Foco:** Cada mejora debe evaluarse contra la problemática original
2. **Iterar Basado en Datos:** Usar métricas reales para guiar optimizaciones
3. **Preservar la Experiencia del Usuario:** Mantener la simplicidad y transparencia
4. **Alimentar la IA Continuamente:** Fichas de cierre y feedback para mejorar precisión
5. **Comunicar el Valor:** Beneficios tangibles para cada tipo de usuario

### 13.5 Próximos Pasos Inmediatos

1. **Implementación del Backend:** Priorizar Agente 1 (InsightBot) para quick wins
2. **Testing con Usuarios Reales:** Validar flujos con stakeholders clave
3. **Carga de Datos Históricos:** Preparar base de conocimiento para Agente 2
4. **Plan de Gestión del Cambio:** Estrategia de adopción y capacitación
5. **Métricas de Baseline:** Establecer mediciones actuales para comparar mejoras

### 13.6 Visión a Largo Plazo

El Portal de Innovación GTTD está diseñado para evolucionar y expandirse:

**Año 1:** Consolidación del proceso básico y adopción masiva
**Año 2:** Expansión a otras áreas de UTP (RRHH, Marketing, Finanzas)
**Año 3:** IA predictiva avanzada y optimización automática de recursos
**Año 5:** Modelo de referencia para gestión de demanda en universidades

### 13.7 Documento Vivo

Este contexto debe actualizarse con cada iteración significativa del proyecto, manteniendo siempre:

- **Trazabilidad:** Entre problemática original, solución diseñada e implementación actual
- **Coherencia:** Con los principios rectores y la visión estratégica
- **Completitud:** Información suficiente para que cualquier IA pueda continuar el trabajo
- **Actualidad:** Reflejando el estado real del proyecto y lecciones aprendidas

**El éxito de este proyecto no se mide solo en la adopción de una herramienta, sino en la transformación cultural hacia un proceso de innovación más inteligente, transparente y eficiente que sirva como modelo para toda la universidad.**

---

**Fin del Documento Maestro de Contexto**

*Este documento representa la consolidación completa del conocimiento del proyecto Portal de Innovación GTTD, diseñado para asegurar continuidad, coherencia y éxito en cada iteración futura.*
