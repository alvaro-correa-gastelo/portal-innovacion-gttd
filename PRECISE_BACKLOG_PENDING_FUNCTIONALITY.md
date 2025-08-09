# 🎯 PRECISE BACKLOG - PENDING FUNCTIONALITY
## Componentes Pendientes vs Estado Actual

**Fecha:** Enero 2025  
**Basado en:** Audit Step 1 + Documentación Completa + Strategic Roadmap

---

## 📊 RESUMEN EJECUTIVO

### ✅ COMPLETADO (Frontend 100%)
- **React + Next.js 15** con TypeScript completo
- **Sistema de diseño** shadcn/ui implementado
- **Todos los componentes UI** por rol funcionales
- **Navegación dinámica** y sistema de roles
- **Mock data** y simulación de flujos completos

### ⏳ COMPONENTES PENDIENTES CRÍTICOS

| Componente | Estado | Criticidad | Esfuerzo |
|------------|--------|------------|----------|
| **Backend n8n Workflows** | 0% | 🔴 Crítica | 8-10 semanas |
| **Base de Datos Supabase** | 10% | 🔴 Crítica | 2-3 semanas |
| **APIs Next.js** | 15% | 🔴 Crítica | 4-5 semanas |
| **Integración Gemini IA** | 0% | 🔴 Crítica | 3-4 semanas |
| **Pipeline RAG** | 0% | 🟠 Alta | 4-5 semanas |
| **Integraciones Externas** | 0% | 🟡 Media | 6-8 semanas |

---

## 🛠️ BACKEND N8N WORKFLOWS (⏳ PENDIENTE COMPLETO)

### 1. Agente 1: InsightBot (Discovery Conversacional)
**Estado:** ❌ No implementado
**Criticidad:** 🔴 Crítica
**Esfuerzo:** 4-5 semanas

#### Workflows Faltantes:
- **Webhook de entrada** - Recepción de mensajes del frontend
- **Gestión de sesiones** - Crear/recuperar estados de conversación  
- **Motor conversacional** - Integración con Gemini API
- **Clasificación inteligente** - Proyecto vs Requerimiento
- **Generación de informes** - Structured output para líderes
- **Sistema de notificaciones** - Multi-canal (Portal + Teams + Email)

#### Endpoints n8n Requeridos:
```
POST /webhook/chat/send
GET /sessions/{session_id}
POST /sessions/create
POST /reports/generate-insight
POST /notifications/send
```

### 2. Agente 2: Planificador Experto (Pipeline RAG)
**Estado:** ❌ No implementado  
**Criticidad:** 🟠 Alta
**Esfuerzo:** 4-5 semanas

#### Componentes Faltantes:
- **Generación de embeddings** - Vectorización con Gemini
- **Búsqueda por similitud** - Query vectorial en Supabase
- **Análisis predictivo** - Estimaciones basadas en histórico
- **Informes de planificación** - Templates estructurados
- **Sistema de validación** - Rangos de confianza

#### Pipeline RAG Completo:
```
Ficha Técnica → Embedding → Similarity Search → 
Historical Projects → Predictive Analysis → Report Generation
```

### 3. Sistema de Estados y Transiciones
**Estado:** ❌ No implementado
**Criticidad:** 🔴 Crítica  
**Esfuerzo:** 2-3 semanas

#### Estados del Sistema:
- `discovery` → `summary_preview` → `summary_refine` → `completed`
- `nueva` → `en_evaluacion` → `aprobada/rechazada/escalada`
- `pending_technical_analysis` → `pending_approval` → `in_evaluation`

---

## 🗄️ BASE DE DATOS SUPABASE (⏳ PENDIENTE 90%)

### 1. Esquema Principal (10% implementado)
**Estado:** ⚠️ Parcialmente configurado
**Criticidad:** 🔴 Crítica
**Esfuerzo:** 2-3 semanas

#### Tablas Implementadas:
- ✅ `session_states` - Estados de conversación
- ✅ `conversation_messages` - Mensajes del chat
- ✅ `scoring_configurations` - Reglas de negocio
- ✅ `configuration_audit` - Auditoría de cambios

#### Tablas Faltantes Críticas:
```sql
-- ⏳ TABLA PRINCIPAL FALTANTE
CREATE TABLE requests (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES session_states(session_id),
    user_id VARCHAR NOT NULL,
    titulo_solicitud VARCHAR(255),
    problema_principal TEXT,
    objetivo_esperado TEXT,
    beneficiarios TEXT,
    plataformas_involucradas JSONB,
    score_estimado INTEGER,
    clasificacion_sugerida VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending_technical_analysis',
    technical_analysis JSONB,
    leader_comments TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ⏳ SISTEMA DE USUARIOS
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL, -- solicitante, lider_dominio, lider_gerencial
    domain VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ⏳ BASE VECTORIAL PARA RAG
CREATE TABLE historical_documents (
    id UUID PRIMARY KEY,
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- pgvector
    project_type VARCHAR,
    domain VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ⏳ MENSAJERÍA INTERNA
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    request_id UUID REFERENCES requests(id),
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ⏳ REPORTES DE IA
CREATE TABLE ai_reports (
    id UUID PRIMARY KEY,
    request_id UUID REFERENCES requests(id),
    type VARCHAR NOT NULL, -- insight, planning
    content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Configuración pgvector (⏳ Pendiente)
**Estado:** ❌ No configurado
**Criticidad:** 🟠 Alta
**Esfuerzo:** 1 semana

```sql
-- Extensión vectorial faltante
CREATE EXTENSION IF NOT EXISTS vector;

-- Función de búsqueda por similitud faltante  
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
) RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
);
```

### 3. Políticas de Seguridad RLS (⏳ Pendiente)
**Estado:** ❌ No configurado
**Criticidad:** 🟠 Alta
**Esfuerzo:** 1 semana

```sql
-- Row Level Security faltante
CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "Leaders can view domain requests" ON requests
  FOR SELECT USING (/* lógica de dominio */);
```

---

## 🌐 APIS NEXT.JS (⏳ PENDIENTE 85%)

### 1. API Routes Críticas Faltantes
**Estado:** ❌ Solo structure básica existe  
**Criticidad:** 🔴 Crítica
**Esfuerzo:** 4-5 semanas

#### Endpoints Faltantes:
```typescript
// ⏳ AUTENTICACIÓN Y USUARIOS
POST   /api/auth/login
GET    /api/users/profile
PUT    /api/users/profile

// ⏳ GESTIÓN DE SOLICITUDES  
GET    /api/requests/my-requests
GET    /api/requests/{id}
GET    /api/requests/domain
GET    /api/requests/all
POST   /api/requests/{id}/status
POST   /api/requests/{id}/escalate

// ⏳ CONVERSACIONES Y MENSAJES
POST   /api/chat/send
GET    /api/chat/history
POST   /api/messages/send
GET    /api/messages/{request_id}

// ⏳ ANÁLISIS E IA
POST   /api/requests/{id}/analyze
POST   /api/analysis/simple-calculate
POST   /api/embeddings/generate

// ⏳ REPORTES Y DOCUMENTOS
POST   /api/reports/generate
GET    /api/reports/{id}/download
GET    /api/documents/search

// ⏳ INTEGRACIÓN Y NOTIFICACIONES
POST   /api/projects/formalize
POST   /api/notifications/send
GET    /api/notifications/list

// ⏳ MÉTRICAS Y DASHBOARDS
GET    /api/metrics/domain
GET    /api/metrics/global
GET    /api/analytics/reports
```

### 2. API Existente con Funcionalidad Limitada
**Estado:** ⚠️ 15% funcional (mock data only)
**Ubicación:** `/app/api/configurations/audit/route.ts`

```typescript
// ✅ IMPLEMENTADO (básico)
export async function GET() {
  return Response.json({
    status: "success", 
    data: mockAuditData
  });
}

// ⏳ FALTA INTEGRACIÓN REAL CON:
// - Supabase database
// - Validación de autenticación  
// - Manejo de errores
// - Rate limiting
// - Caching
```

### 3. Middleware de Seguridad (⏳ Pendiente)
**Estado:** ❌ No implementado
**Criticidad:** 🟠 Alta
**Esfuerzo:** 1-2 semanas

```typescript
// ⏳ MIDDLEWARE FALTANTE
// - Autenticación JWT/Supabase
// - Autorización por roles
// - Rate limiting  
// - CORS configuration
// - Request validation
// - Audit logging
```

---

## 🤖 INTEGRACIÓN GEMINI IA (⏳ PENDIENTE COMPLETO)

### 1. Configuración Base
**Estado:** ❌ No configurado
**Criticidad:** 🔴 Crítica
**Esfuerzo:** 1-2 semanas

#### Componentes Faltantes:
```typescript
// ⏳ CONFIGURACIÓN GEMINI
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// ⏳ PROMPTS ESPECIALIZADOS
const INSIGHT_PROMPT = `/* Sistema para InsightBot */`;
const PLANNING_PROMPT = `/* Sistema para Planificador */`;
const CLASSIFICATION_PROMPT = `/* Rúbricas de clasificación */`;
```

### 2. Agentes de IA Especializados
**Estado:** ❌ No desarrollados
**Criticidad:** 🔴 Crítica  
**Esfuerzo:** 3-4 semanas

#### Agente 1 - InsightBot:
- **Conversación guiada** - Preguntas estratégicas
- **Extracción de información** - Problema, objetivo, beneficiarios
- **Clasificación automática** - Proyecto vs Requerimiento
- **Análisis de sentimiento** - Urgencia, frustración, oportunidad
- **Generación de informes** - Templates estructurados

#### Agente 2 - Planificador Experto:
- **Análisis predictivo** - Basado en proyectos similares
- **Estimación de tiempos** - Rangos optimista/pesimista
- **Recomendación de recursos** - Equipo ideal
- **Análisis de riesgos** - Probabilidades basadas en histórico
- **Validación cruzada** - Consistency checks

### 3. Rate Limiting y Error Handling
**Estado:** ❌ No implementado
**Criticidad:** 🟡 Media
**Esfuerzo:** 1 semana

```typescript
// ⏳ MANEJO DE LÍMITES FALTANTE
// - Exponential backoff
// - Queue management
// - Fallback responses
// - Cost monitoring
// - Token usage tracking
```

---

## 🔄 INTEGRACIONES EXTERNAS (⏳ PENDIENTE COMPLETO)

### 1. Monday.com Integration
**Estado:** ❌ No implementado
**Criticidad:** 🟠 Alta
**Esfuerzo:** 3-4 semanas

#### APIs Faltantes:
```typescript
// ⏳ MONDAY.COM INTEGRATION
const mondayClient = {
  // Crear proyecto automáticamente
  createProject: async (projectData) => { /* ... */ },
  
  // Sincronización bidireccional
  syncProjectStatus: async (projectId) => { /* ... */ },
  
  // Adjuntar documentos
  attachDocuments: async (projectId, docs) => { /* ... */ },
  
  // Asignar equipo
  assignTeam: async (projectId, members) => { /* ... */ }
};
```

#### Flujo de Formalización:
1. **Proyecto aprobado** → Trigger automático
2. **Formulario pre-poblado** → Datos del análisis predictivo
3. **Creación en Monday** → API call con estructura completa
4. **Sincronización** → Estados bidireccionales
5. **Notificaciones** → Equipo asignado

### 2. Microsoft Teams Bot
**Estado:** ❌ No implementado  
**Criticidad:** 🟡 Media
**Esfuerzo:** 2-3 semanas

#### Componentes Faltantes:
```typescript
// ⏳ TEAMS BOT INTEGRATION
const teamsBot = {
  // Notificaciones directas
  sendDirectMessage: async (userId, message) => { /* ... */ },
  
  // Links contextuales
  generateDeepLink: (requestId) => { /* ... */ },
  
  // Webhook management
  configureWebhooks: async () => { /* ... */ }
};
```

### 3. Jira API (Read-only)
**Estado:** ❌ No implementado
**Criticidad:** 🟡 Media  
**Esfuerzo:** 1-2 semanas

#### Vista "Mi Equipo":
```typescript
// ⏳ JIRA CAPACITY INTEGRATION
const jiraCapacity = {
  // Carga de trabajo por persona
  getTeamCapacity: async (domain) => { /* ... */ },
  
  // Tareas activas
  getActiveTasks: async (userId) => { /* ... */ },
  
  // Cálculo de disponibilidad  
  calculateAvailability: (assignedHours, totalHours) => { /* ... */ }
};
```

### 4. Sistema de Email/SMTP  
**Estado:** ❌ No implementado
**Criticidad:** 🟡 Media
**Esfuerzo:** 1 semana

```typescript
// ⏳ EMAIL NOTIFICATIONS
const emailService = {
  // Templates de notificación
  sendRequestNotification: async (leaderId, requestData) => { /* ... */ },
  
  // Updates de estado
  sendStatusUpdate: async (requesterId, status) => { /* ... */ },
  
  // Reportes por email
  sendReportEmail: async (recipients, reportUrl) => { /* ... */ }
};
```

---

## 📱 SCREENS Y UX PENDIENTES (Frontend Completo pero sin Backend)

### 1. Funcionalidades Frontend Implementadas SIN Backend

#### Chat Interface (✅ UI + ❌ Backend)
- **Componente:** `ChatInterface.tsx` - ✅ Completo
- **Estado:** UI perfecta, 0% funcionalidad real
- **Faltante:** Conexión a n8n webhook, estados reales, IA responses

#### Leader Dashboard (✅ UI + ❌ Backend)  
- **Componente:** `LeaderDashboard.tsx` - ✅ Completo
- **Estado:** Mock data funcional, 0% datos reales  
- **Faltante:** APIs de solicitudes, métricas reales, acciones de gestión

#### Request Detail Modal (✅ UI + ❌ Backend)
- **Componente:** `RequestDetailModal.tsx` - ✅ Completo  
- **Estado:** Navegación perfecta, 0% operaciones reales
- **Faltante:** Agente 2 integration, approval workflows, comunicación

#### Global Dashboard (✅ UI + ❌ Backend)
- **Componente:** `GlobalDashboard.tsx` - ✅ Completo
- **Estado:** Métricas simuladas, 0% datos agregados reales
- **Faltante:** Analytics APIs, cross-domain metrics, reportes

#### Strategic Roadmap (✅ UI + ❌ Backend)
- **Componente:** `StrategicRoadmap.tsx` - ✅ Completo
- **Estado:** Timeline simulado, 0% proyectos reales
- **Faltante:** Monday.com sync, project timelines, milestone tracking

### 2. Gaps de UX por Falta de Backend

| Screen | UI Status | Backend Status | Gap Impact |
|--------|-----------|----------------|------------|
| **Chat Interface** | ✅ Perfecto | ❌ 0% | 🔴 No funcional |
| **My Requests** | ✅ Perfecto | ❌ 0% | 🔴 No funcional |  
| **Tracking Panel** | ✅ Perfecto | ❌ 0% | 🔴 No funcional |
| **Leader Dashboard** | ✅ Perfecto | ❌ 5% | 🔴 Solo mock |
| **Team View** | ✅ Perfecto | ❌ 0% | 🟠 Sin Jira sync |
| **Approvals Inbox** | ✅ Perfecto | ❌ 0% | 🔴 No funcional |
| **Reports Analytics** | ✅ Perfecto | ❌ 0% | 🟠 Sin métricas |
| **Settings** | ✅ Perfecto | ❌ 0% | 🟡 Sin persistencia |

---

## 🎯 ROADMAP DE IMPLEMENTACIÓN PRIORIZADO

### Fase 1: Backend Crítico (Semanas 1-8)
**Objetivo:** Sistema funcional básico end-to-end

#### Sprint 1-2: Infraestructura Base (2 semanas)
- ✅ **Supabase:** Configurar esquema completo + pgvector  
- ✅ **n8n:** Deploy en Docker + configuración básica
- ✅ **Gemini API:** Integración y prompts básicos
- ✅ **Auth:** Sistema de autenticación con Supabase

#### Sprint 3-4: Agente 1 InsightBot (2 semanas)  
- ✅ **Workflow n8n:** Conversación básica con Gemini
- ✅ **Classification:** Proyecto vs Requerimiento
- ✅ **API Integration:** Frontend ↔ n8n ↔ Supabase
- ✅ **Basic Reports:** Generación de informes técnicos

#### Sprint 5-6: Estados y Gestión (2 semanas)
- ✅ **Request Management:** CRUD completo de solicitudes  
- ✅ **Leader Views:** APIs para dashboards de líderes
- ✅ **Status Workflows:** Transiciones de estado
- ✅ **Notifications:** Sistema básico de notificaciones

#### Sprint 7-8: Validación E2E (2 semanas)
- ✅ **Integration Testing:** Flujo completo funcional
- ✅ **Bug Fixes:** Issues críticos identificados  
- ✅ **Performance:** Optimización básica
- ✅ **Security:** Validaciones y RLS policies

### Fase 2: Funcionalidades Avanzadas (Semanas 9-16)
**Objetivo:** Sistema completo con IA avanzada

#### Sprint 9-10: Agente 2 Planificador (2 semanas)
- ✅ **RAG Pipeline:** Embeddings + similarity search
- ✅ **Historical Data:** Carga de proyectos históricos  
- ✅ **Predictive Analysis:** Estimaciones basadas en datos
- ✅ **Advanced Reports:** Informes de planificación

#### Sprint 11-12: Integraciones Externas (2 semanas)
- ✅ **Monday.com:** Creación automática de proyectos
- ✅ **Teams Bot:** Notificaciones y deep links
- ✅ **Email System:** Templates y envío automático
- ✅ **Jira Sync:** Vista de capacidad de equipos

#### Sprint 13-14: Analytics y Métricas (2 semanas)  
- ✅ **Dashboards:** Métricas reales y visualizaciones
- ✅ **Reports Export:** PDF/Excel generation
- ✅ **Semantic Search:** Búsqueda inteligente global
- ✅ **Audit System:** Logs completos y trazabilidad

#### Sprint 15-16: Optimización y Launch (2 semanas)
- ✅ **Performance:** Caching, CDN, optimización DB
- ✅ **Training Data:** Calibración de algoritmos IA  
- ✅ **User Training:** Documentación y capacitación
- ✅ **Monitoring:** Alertas y métricas de sistema

### Fase 3: Expansión y Mejora (Semanas 17-24)
**Objetivo:** Adopción masiva y optimización continua

#### Funcionalidades de Expansión:
- **Mobile Optimization:** Responsive mejorado
- **Advanced Analytics:** Predictive insights
- **Multi-tenant:** Expansión a otras áreas UTP
- **API Ecosystem:** Integraciones adicionales

---

## 📊 ESTIMACIÓN DE ESFUERZO DETALLADA

### Por Componente:
| Componente | Esfuerzo | Complejidad | Dependencias |
|------------|----------|-------------|--------------|
| **Backend n8n** | 8-10 sem | 🔴 Alta | Gemini API |
| **Database Setup** | 2-3 sem | 🟠 Media | Supabase |  
| **Next.js APIs** | 4-5 sem | 🟠 Media | Database |
| **Gemini Integration** | 3-4 sem | 🟠 Media | n8n |
| **RAG Pipeline** | 4-5 sem | 🔴 Alta | Database + IA |
| **External APIs** | 6-8 sem | 🟡 Baja | Credentials |
| **Testing & QA** | 3-4 sem | 🟠 Media | Todo |

### Por Desarrollador:
- **Backend Developer:** 12-16 semanas
- **IA/ML Developer:** 8-10 semanas  
- **Integration Developer:** 6-8 semanas
- **QA Engineer:** 4-6 semanas

### **Total Estimado:** 16-24 semanas (4-6 meses)

---

## 🚨 DEPENDENCIAS CRÍTICAS Y RIESGOS

### Dependencias Externas:
1. **API Keys:** Gemini, Monday.com, Teams
2. **Infrastructure:** Supabase tier, n8n hosting
3. **Historical Data:** Calidad de proyectos pasados para RAG
4. **Stakeholder Access:** Permisos y credenciales

### Riesgos Principales:
1. **Gemini API Limits** → Impacto en UX, mitigar con queue
2. **Historical Data Quality** → Afecta precisión IA, limpiar antes
3. **Integration Complexity** → Monday.com APIs, POC temprano  
4. **User Adoption** → Change management crítico, training

### Mitigación:
- **POCs tempranos** para validar integraciones críticas
- **Desarrollo incremental** con testing continuo
- **Fallbacks** para servicios externos
- **Training paralelo** durante desarrollo

---

## ✅ CONCLUSIÓN Y PRÓXIMOS PASOS

### Estado Actual:
- **Frontend:** ✅ 100% implementado, listo para producción
- **Backend:** ⏳ 10% completado, crítico para funcionalidad
- **Integrations:** ❌ 0% implementado, impacta experiencia completa

### Acción Inmediata Requerida:
1. **Priorizar Backend:** Agente 1 InsightBot para quick wins
2. **Setup Infrastructure:** Supabase + n8n deployment
3. **Secure API Keys:** Gemini, Monday.com, Teams credentials
4. **Plan Training:** User adoption strategy paralela

### Success Metrics:
- **Technical:** Sistema end-to-end funcional en 8 semanas
- **Business:** >80% adopción en 6 meses post-launch  
- **Quality:** >4.5/5 user satisfaction score
- **Process:** 50% reducción en tiempo de clarificación

**El frontend excepcional ya construido está esperando un backend robusto que lo haga realidad. La brecha es significativa pero bien definida, y con la hoja de ruta correcta, el Portal de Innovación GTTD puede transformar completamente la gestión de demanda tecnológica en UTP.**

---

*Documento generado basado en audit step 1, documentación técnica completa, y análisis del strategic roadmap. Última actualización: Enero 2025*
