# Portal de Innovación GTTD

Portal web para gestión de solicitudes tecnológicas con agente IA conversacional para la Universidad Tecnológica del Perú.

## 🚀 Demo en Vivo
[Ver Demo](https://portal-innovacion-gttd.vercel.app) *(Próximamente)*

## 🎯 Descripción del Proyecto

El Portal de Innovación GTTD es una plataforma integral diseñada para optimizar la gestión de solicitudes tecnológicas en entornos universitarios. Incluye un agente de IA conversacional (InsightBot) que facilita el descubrimiento y estructuración de requerimientos tecnológicos.

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui, Lucide Icons
- **Agente IA**: n8n + Gemini 1.5 Pro
- **Base de Datos**: Supabase (PostgreSQL)
- **Despliegue**: Vercel

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

### 📁 **Gestión de Documentos**
- Carga y organización de archivos
- Versionado de documentos
- Integración con solicitudes

### 📈 **Analytics y Reportes**
- Métricas de rendimiento
- Reportes de solicitudes
- Dashboard ejecutivo
- Análisis de tendencias

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
- Node.js 18+
- npm o yarn
- Cuenta en Supabase
- Cuenta en n8n (para el agente IA)

### **Instalación Local**
```bash
# Clonar repositorio
git clone https://github.com/TU-USUARIO/portal-innovacion-gttd.git
cd portal-innovacion-gttd

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### **Variables de Entorno**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_key
NEXT_PUBLIC_N8N_WEBHOOK_URL=tu_n8n_webhook_url
```

## 🤖 Configuración del Agente IA

### **1. Configurar n8n**
 - Seguir la guía: `GUIA_CONFIGURACION_AGENTE_IA_N8N.md`
 - Usar el workflow de producción en n8n (este repositorio no incluye archivos JSON de workflows). Consulta `DOCS/N8N_STATE_MODEL.md` y `DOCS/N8N_EVENT_ROUTER_AND_FINALIZATION.md` para el mapa de nodos y eventos.
 - Configurar credenciales de Gemini y Supabase

### **2. Configurar Base de Datos**
```sql
-- Ejecutar en Supabase
-- Ver scripts completos en: ARQUITECTURA_BD_AGENTE_IA_N8N.md

CREATE TABLE conversations (...);
CREATE TABLE requests (...);
CREATE TABLE conversation_analytics (...);
```

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
    
    (Material histórico y borradores se encuentran en `DOCS/ARCHIVED/`, excluido del repo por Git.)
```

## 🌐 Despliegue

### **Opción Recomendada: Vercel**
1. Subir código a GitHub
2. Conectar repositorio con Vercel
3. Despliegue automático
4. URL: `https://portal-innovacion-gttd.vercel.app`

Ver guía completa: `GUIA_DESPLIEGUE_GRATUITO.md`

## 👥 Equipo y Colaboración

### **Roles del Proyecto**
- **Product Owner**: Definición de requerimientos
- **Tech Lead**: Arquitectura y desarrollo
- **UX/UI Designer**: Diseño de interfaz
- **QA Tester**: Pruebas y validación

### **Flujo de Trabajo**
1. **Feature Branch**: Crear rama para nueva funcionalidad
2. **Development**: Desarrollo y pruebas locales
3. **Pull Request**: Revisión de código
4. **Deploy**: Despliegue automático en Vercel

## 📊 Métricas y Analytics

### **KPIs del Sistema**
- Tiempo promedio de conversación
- Tasa de conversión a solicitudes
- Nivel de confianza promedio del agente
- Satisfacción del usuario

### **Monitoreo**
- Analytics de Vercel
- Métricas de n8n
- Logs de Supabase
- Feedback de usuarios

## 🤝 Transparencia y uso de IA

- Este proyecto integra un agente IA (n8n + Gemini). El código del portal y la lógica de integración son propios; los artefactos experimentales y borradores generados por IA se mantienen en `DOCS/ARCHIVED/` y no se publican.
- Recomendación para GitHub: documentar claramente el flujo real (estado inicial `submitted`, rama de finalización tras `SUMMARY_CONFIRMED`) y enlazar solo a guías vigentes en `DOCS/`.
- Recomendación para LinkedIn: comunicar que la solución combina ingeniería propia con un agente IA orquestado en n8n para acelerar descubrimiento y formalización de solicitudes. Enfatiza el resultado (ganaron el reto) y los aspectos técnicos clave (SPA con Next.js, integración n8n/Supabase, timeline robusto). No es necesario exponer prompts o borradores.

## 🔮 Roadmap

### **Fase 1: MVP** ✅
- [x] Dashboard básico
- [x] Chat interface
- [x] Agente IA funcional
- [x] Base de datos configurada

### **Fase 2: Mejoras** 🚧
- [ ] Autenticación de usuarios
- [ ] Notificaciones en tiempo real
- [ ] Integración con sistemas UTP
- [ ] Mobile app

### **Fase 3: Escalabilidad** 📋
- [ ] Multi-tenancy
- [ ] API pública
- [ ] Integraciones avanzadas
- [ ] Machine Learning mejorado

## 📞 Contacto y Soporte

### **Equipo GTTD**
- **Email**: gttd@utp.edu.pe
- **Slack**: #portal-innovacion
- **GitHub**: [Repositorio del Proyecto](https://github.com/TU-USUARIO/portal-innovacion-gttd)

### **Documentación Adicional**
- [Guía de Configuración del Agente IA](./GUIA_CONFIGURACION_AGENTE_IA_N8N.md)
- [Arquitectura de Base de Datos](./ARQUITECTURA_BD_AGENTE_IA_N8N.md)
- [Esquema de Alto Nivel](./ESQUEMA_ALTO_NIVEL_INSIGHTBOT.md)
- [Guía de Despliegue](./GUIA_DESPLIEGUE_GRATUITO.md)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ por el equipo GTTD - Universidad Tecnológica del Perú**
