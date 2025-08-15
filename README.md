# 🏆 Portal de Innovación GTTD

**🥇 Ganador del Reto 1 - Programa Impulsa UTP 2024**

Portal web inteligente para gestión de solicitudes tecnológicas con agente IA conversacional, desarrollado para optimizar procesos de innovación en organizaciones.

## 🎯 Descripción del Proyecto

El Portal de Innovación GTTD es una plataforma integral que transforma cómo las organizaciones gestionan solicitudes tecnológicas. Combina interfaces intuitivas con inteligencia artificial para acelerar el descubrimiento, evaluación y aprobación de proyectos de innovación.

### ✨ **Problema que Resuelve:**
- Procesos manuales lentos para gestionar solicitudes tecnológicas
- Falta de estructura en la captura de requerimientos
- Dificultad para hacer seguimiento y priorizar proyectos
- Desconexión entre solicitantes y tomadores de decisión

### 🎯 **Solución:**
- **Chat IA conversacional** para descubrimiento estructurado de requerimientos
- **Dashboards diferenciados** por rol (Usuario, Líder de Dominio, Líder Gerencial)
- **Sistema de seguimiento** en tiempo real con timeline detallado
- **Flujos automatizados** de aprobación y notificaciones

## 🛠️ Stack Tecnológico

### **Frontend**
- **Next.js 15** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** + **shadcn/ui** para UI moderna
- **Framer Motion** para animaciones fluidas

### **Backend & IA**
- **PostgreSQL** (Neon) para persistencia
- **N8N** para orquestación de flujos IA
- **Google Gemini 2.5 Pro** para agente conversacional
- **Vercel** para despliegue y APIs

### **Integraciones**
- **Webhooks** para comunicación N8N ↔ Frontend
- **Rate limiting** y modo demo para protección
- **Real-time updates** con eventos del sistema

## 📋 Características Principales

### 🤖 **InsightBot - Agente IA Conversacional**
- Descubrimiento inteligente de requerimientos
- Extracción automática de información estructurada
- Conversación natural y empática
- Activación de componentes ricos según contexto

### 📊 **Dashboard Kanban**
- Tablero visual con 3 columnas: Nuevas, En Evaluación, En Planificación
- Tarjetas simplificadas con información esencial
- Indicadores de mensajes no leídos
- Búsqueda en tiempo real

### 🔄 **Sistema de Seguimiento**
- Tracking detallado de solicitudes
- Historial de conversaciones
- Métricas de progreso
- Notificaciones automáticas

### 📁 Documentos (prototipo)
- Vista experimental en `components/documents-view.tsx`
- No habilitado en producción; se mantiene como referencia UI para futuras iteraciones.

### 📈 Reportes/Analytics (prototipo)
- Vista experimental en `components/reports-analytics.tsx`
- No habilitado en producción.

## 🏗️ Arquitectura del Sistema

### **Frontend (Next.js)**
```
app/
├── page.tsx                 # Página principal
├── layout.tsx              # Layout base
├── globals.css             # Estilos globales
└── loading.tsx             # Componente de carga

components/
├── dashboard.tsx           # Dashboard Kanban
├── chat-interface.tsx      # Chat con InsightBot
├── tracking-panel.tsx      # Panel de seguimiento
├── documents-view.tsx      # Gestión de documentos
├── reports-analytics.tsx   # Reportes y analytics
└── ui/                     # Componentes UI base
```

### **Backend (n8n + Supabase)**
```
Workflows n8n:
├── InsightBot Agent        # Agente IA principal
├── Context Analyzer        # Análisis contextual
├── Data Extractor         # Extracción de datos
└── Finalization           # Creación de solicitudes

Base de Datos:
├── langchain_memory       # Memory del agente IA
├── conversations          # Datos estructurados
├── requests              # Solicitudes finalizadas
└── conversation_analytics # Métricas y analytics
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- **Node.js 18+** y npm/pnpm
- **PostgreSQL** (recomendado: Neon o Supabase)
- **N8N** (self-hosted o cloud) para orquestación IA
- **Google Gemini API Key** para el agente conversacional

### **1. Instalación Local**
```bash
# Clonar repositorio
git clone https://github.com/alvaro-correa-gastelo/portal-innovacion-gttd.git
cd portal-innovacion-gttd

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env.local

# Ejecutar en desarrollo
pnpm dev
```

### **2. Variables de Entorno**
```bash
# .env.local - Configurar con tus credenciales reales
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/chat

# Configuración opcional para modo demo
NEXT_PUBLIC_DEMO_MODE=false
DEMO_MODE=false
```

### **3. Configuración de Base de Datos**
```bash
# Ejecutar el esquema completo en tu PostgreSQL/Neon/Supabase
psql -h tu-host -U tu-usuario -d tu-database -f db/sql/schema-complete.sql

# O copiar y ejecutar manualmente desde:
# db/sql/schema-complete.sql
```

**Tablas principales:**
- `requests` - Solicitudes tecnológicas
- `audit_logs` - Registro de auditoría y timeline
- `session_states` - Estados de sesión N8N
- `scoring_configurations` - Configuraciones de scoring
- `configuration_audit` - Auditoría de configuraciones
- `report_templates` - Plantillas de reportes

## 🤖 Configuración del Agente IA (N8N)

### **Importar Workflow N8N**
1. **Colocar el workflow JSON** en la carpeta `n8n/` (por ejemplo: `n8n/InsightBot AI v2.json`).
2. **Importar en n8n**: Settings → Import from file → selecciona tu JSON.
3. **Configurar credenciales**:
   - **Google Gemini**: API Key para Gemini 2.5 Pro
   - **PostgreSQL**: Conexión a tu base de datos
   - **HTTP Request**: Webhook URL del frontend

### **Configurar Webhook**
```bash
# URL del webhook de n8n (configurar en .env.local)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://tu-n8n-instance.com/webhook/chat

# El frontend enviará payloads como:
{
  "session_id": "uuid",
  "message": "texto del usuario",
  "event_type": "USER_MESSAGE"
}
```

### **Flujo del Agente IA**
1. **Recepción**: Webhook recibe mensaje del usuario
2. **Contexto**: Carga historial de conversación
3. **Procesamiento**: Gemini 2.5 Pro genera respuesta contextual
4. **Extracción**: Analiza y estructura información
5. **Respuesta**: Envía respuesta al frontend
6. **Persistencia**: Guarda estado en base de datos


### **3. Endpoints del Agente**
```
POST /webhook/insightbot/chat      # Chat principal
POST /webhook/insightbot/finalize  # Finalización
```

## 📁 Estructura de Archivos del Proyecto

```
portal-innovacion-gttd/
├── 📄 README.md                                    # Este archivo
├── 📄 package.json                                 # Dependencias
├── 📄 next.config.mjs                             # Configuración Next.js
├── 📄 tailwind.config.ts                          # Configuración Tailwind
├── 📄 tsconfig.json                               # Configuración TypeScript
├── 📄 components.json                             # Configuración Shadcn/ui
├── 📄 .gitignore                                  # Archivos ignorados por Git
│
├── 📁 app/                                        # Aplicación Next.js
│   ├── 📄 page.tsx                               # Página principal
│   ├── 📄 layout.tsx                             # Layout base
│   ├── 📄 globals.css                            # Estilos globales
│   └── 📄 loading.tsx                            # Componente de carga
│
├── 📁 components/                                 # Componentes React
│   ├── 📄 dashboard.tsx                          # Dashboard Kanban
│   ├── 📄 chat-interface.tsx                     # Chat con InsightBot
│   ├── 📄 tracking-panel.tsx                     # Panel de seguimiento
│   ├── 📄 documents-view.tsx                     # Gestión de documentos
│   ├── 📄 reports-analytics.tsx                  # Reportes y analytics
│   ├── 📄 sidebar.tsx                            # Barra lateral
│   ├── 📄 login-page.tsx                         # Página de login
│   ├── 📄 theme-provider.tsx                     # Proveedor de tema
│   ├── 📄 theme-toggle.tsx                       # Toggle de tema
│   └── 📁 ui/                                    # Componentes UI base
│       ├── 📄 button.tsx                         # Botón
│       ├── 📄 card.tsx                           # Tarjeta
│       ├── 📄 input.tsx                          # Input
│       ├── 📄 badge.tsx                          # Badge
│       └── ... (más componentes UI)
│
├── 📁 hooks/                                     # Hooks personalizados
│   ├── 📄 use-mobile.tsx                        # Hook para móvil
│   └── 📄 use-toast.ts                          # Hook para toast
│
├── 📁 lib/                                       # Utilidades
│   └── 📄 utils.ts                              # Funciones utilitarias
│
├── 📁 public/                                    # Archivos públicos
│   ├── 📄 placeholder-logo.png                  # Logo placeholder
│   ├── 📄 placeholder-user.jpg                  # Avatar placeholder
│   └── ... (más assets)
│
├── 📁 styles/                                    # Estilos adicionales
│   └── 📄 globals.css                           # Estilos globales adicionales
│
└── 📁 DOCS/                                     # Documentación
    ├── 📄 N8N_STATE_MODEL.md                    # Estados y eventos del workflow
    ├── 📄 N8N_EVENT_ROUTER_AND_FINALIZATION.md  # Ruteo por eventos y rama de finalización (SUMMARY_CONFIRMED)
    ├── 📄 FINALIZATION_WORKFLOW_GUIDE.md        # Guía práctica de la rama de finalización
    ├── 📄 GUIA_CONFIGURACION_AGENTE_IA_N8N.md   # Setup del agente IA en n8n
    ├── 📄 DATABASE_SETUP.md                     # Variables y scripts de BD
    ├── 📄 ARQUITECTURA_TECNICA_PORTAL_INNOVACION_GTTD.md
    ├── 📄 DOCUMENTACION_VISTAS_DIFERENCIADAS.md # Diferencias por rol en modales
    ├── 📄 MEJORAS_MODALES_IMPLEMENTADAS.md
    ├── 📄 MEJORAS_MODALES_VALORES_EFECTIVOS.md
    └── 📄 api-endpoints-enhanced.md
   
```


## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ por el equipo 2 de Lima 1 de Impulsa UTP - Universidad Tecnológica del Perú**
