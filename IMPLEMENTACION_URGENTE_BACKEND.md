# 🚨 IMPLEMENTACIÓN URGENTE - BACKEND BÁSICO

**Fecha:** 8 de enero de 2025  
**Estado:** CRÍTICO - Frontend 100% listo, Backend 0% funcional  
**Objetivo:** Conectar frontend con datos reales en 2-3 días  

---

## 📋 **RESUMEN EJECUTIVO**

### ✅ **LO QUE TIENES FUNCIONANDO:**
- **Frontend completo** - Next.js 15, shadcn/ui, todos los dashboards perfectos
- **APIs implementadas** - `/api/requests` con GET/POST ya programados
- **N8N Discovery** - InsightBot conversacional funcional
- **Documentación** - Excepcional con todos los flujos definidos

### 🚨 **LO QUE FALTA (CRÍTICO):**
1. **Tabla `requests` en BD** - Frontend sin datos reales
2. **Conexión BD** - PostgreSQL puede no estar corriendo  
3. **Rama N8N finalización** - Conversaciones no se guardan
4. **Portal solicitante** - `/my-requests` sin backend

---

## 🎯 **FASE 1: BACKEND BÁSICO (CRÍTICO - 2-3 DÍAS)**

### **PASO 1: VERIFICAR Y CREAR TABLA REQUESTS**

#### 1.1 Verificar PostgreSQL está corriendo
```bash
# Verificar que Docker PostgreSQL esté corriendo
docker ps | grep postgres

# Si NO está corriendo, iniciarlo:
docker-compose up -d postgres

# Verificar conexión desde la app
curl http://localhost:3000/api/database/test
```

#### 1.2 Crear tabla requests (CRÍTICO)
```bash
# Conectar a PostgreSQL en Docker
docker exec -it postgres_db psql -U postgres -d postgres

# Ejecutar script (ya creado: create_requests_table.sql)
\i create_requests_table.sql

# Verificar que se creó
\dt public.requests
SELECT COUNT(*) FROM public.requests;
```

#### 1.3 Probar API inmediatamente
```bash
# Probar GET - debe devolver datos de prueba
curl http://localhost:3000/api/requests

# Si funciona, el frontend se conectará automáticamente
```

---

### **PASO 2: CONECTAR DASHBOARDS CON DATOS REALES**

#### 2.1 Verificar que frontend usa APIs reales
Los dashboards ya están programados para usar `/api/requests`. Una vez que la BD esté lista:

**✅ Dashboard Líder:** Automáticamente mostrará solicitudes reales  
**✅ Dashboard Global:** KPIs se calcularán con datos reales  
**✅ Reportes:** Gráficos con estadísticas reales  

#### 2.2 Agregar más datos de prueba (opcional)
```sql
-- Agregar más solicitudes de prueba para dashboards ricos
INSERT INTO public.requests (session_id, user_id, titulo_solicitud, problema_principal, departamento_solicitante, status, clasificacion_sugerida, prioridad_sugerida, score_estimado) VALUES
(gen_random_uuid(), 'admin.test@utp.edu.pe', 'Migración a la nube', 'Servidores on-premise obsoletos', 'TI', 'pending_approval', 'proyecto', 'P1', 88),
(gen_random_uuid(), 'rrhh.test@utp.edu.pe', 'Portal de empleados', 'Procesos manuales en RRHH', 'Recursos Humanos', 'approved', 'proyecto', 'P2', 75),
(gen_random_uuid(), 'marketing.test@utp.edu.pe', 'CRM estudiantil', 'No hay seguimiento de leads', 'Marketing', 'in_evaluation', 'requerimiento', 'P1', 82);
```

---

### **PASO 3: CREAR PÁGINA /MY-REQUESTS**

#### 3.1 Crear página para solicitantes
Archivo: `app/(authenticated)/my-requests/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { RequestCard } from '@/components/ui/request-card'
import { Badge } from '@/components/ui/badge'

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        // TODO: Obtener user_id real del contexto de autenticación
        const userId = 'test.user@utp.edu.pe' 
        const response = await fetch(`/api/requests?user_id=${userId}`)
        const data = await response.json()
        if (data.success) {
          setRequests(data.data)
        }
      } catch (error) {
        console.error('Error fetching requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMyRequests()
  }, [])

  if (loading) return <div>Cargando solicitudes...</div>

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mis Solicitudes</h1>
      
      <div className="grid gap-4">
        {requests.map((request: any) => (
          <div key={request.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{request.title}</h3>
              <Badge variant={getStatusVariant(request.status)}>
                {getStatusLabel(request.status)}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{request.problem}</p>
            <div className="text-xs text-gray-500">
              Enviado hace {request.days_since_created} días
            </div>
            {request.leader_comments && (
              <div className="mt-3 p-2 bg-blue-50 rounded">
                <strong>Comentarios del líder:</strong>
                <p className="text-sm">{request.leader_comments}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function getStatusVariant(status: string) {
  const variants = {
    'pending_approval': 'default',
    'in_evaluation': 'secondary', 
    'approved': 'success',
    'rejected': 'destructive',
    'on_hold': 'warning'
  }
  return variants[status] || 'default'
}

function getStatusLabel(status: string) {
  const labels = {
    'pending_approval': 'Pendiente Aprobación',
    'in_evaluation': 'En Evaluación',
    'approved': 'Aprobada',
    'rejected': 'Rechazada',
    'on_hold': 'En Espera'
  }
  return labels[status] || status
}
```

#### 3.2 Agregar ruta al sidebar
Archivo: `components/sidebar.tsx` - Agregar en la sección de solicitante:

```typescript
{
  title: "Mis Solicitudes", 
  href: "/my-requests",
  icon: FileText,
  role: "solicitante"
}
```

---

## 🎯 **FASE 2: FINALIZACIÓN N8N (URGENTE - 3-5 DÍAS)**

### **PASO 4: IMPLEMENTAR RAMA DE FINALIZACIÓN**

Según `N8N_FINALIZATION_INTEGRATION_GUIDE.md`, necesitas:

#### 4.1 Añadir Router Principal en N8N
1. **Abrir workflow:** `InsightBot AI v2` en n8n
2. **Añadir nodo Switch** después del Webhook
3. **Configurar regla:** 
   - Condition: `{{ $json.body.event.type }}`
   - Operation: `Equal`
   - Value: `SUMMARY_CONFIRMED`

#### 4.2 Crear Rama de Finalización (5 nodos)
```
Router Principal → [RAMA DE FINALIZACIÓN]
├── 1. Obtener Datos de Sesión (Postgres)
├── 2. Guardar Solicitud Final (Postgres) 
├── 3. Notificar al Líder (Email/Teams)
├── 4. Cerrar Sesión (Postgres)
└── 5. Respuesta Final (Webhook Response)
```

#### 4.3 Nodo 2: Guardar en tabla requests
**Query SQL:**
```sql
INSERT INTO requests (
    session_id, user_id, titulo_solicitud, problema_principal, 
    objetivo_esperado, plataformas_involucradas, beneficiarios,
    frecuencia_uso, plazo_deseado, departamento_solicitante,
    score_estimado, clasificacion_sugerida, prioridad_sugerida,
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
    75, -- score por defecto
    'requerimiento', -- clasificación por defecto
    'P2', -- prioridad por defecto  
    'pending_approval'
) RETURNING id;
```

---

## 🎯 **FASE 3: OPTIMIZACIONES (1-2 SEMANAS)**

### **PASO 5: MEJORAS ADICIONALES**

#### 5.1 Sistema de Notificaciones
- Email automático al líder cuando llega nueva solicitud
- Notificación al solicitante cuando cambia estado

#### 5.2 Análisis Técnico (Agente 2)
- Implementar el agente técnico para análisis predictivo
- Campo `technical_analysis` en requests

#### 5.3 Integraciones Avanzadas
- Monday.com para proyectos aprobados
- Microsoft Teams para notificaciones
- Jira para capacidad de equipos

---

## 🚀 **CHECKLIST DE IMPLEMENTACIÓN**

### **Hoy (CRÍTICO):**
- [ ] **Verificar PostgreSQL corriendo:** `docker ps | grep postgres`
- [ ] **Ejecutar script:** `create_requests_table.sql`  
- [ ] **Probar API:** `curl http://localhost:3000/api/requests`
- [ ] **Verificar frontend:** Abrir dashboard y ver datos reales

### **Mañana (URGENTE):**
- [ ] **Crear página /my-requests** 
- [ ] **Probar flujo completo** desde chat hasta dashboard
- [ ] **Agregar más datos de prueba** para dashboards ricos

### **Esta semana (ALTA PRIORIDAD):**
- [ ] **Implementar Router Principal** en N8N
- [ ] **Crear Rama de Finalización** con 5 nodos
- [ ] **Probar flujo end-to-end** chat → summary → save → dashboard

---

## 📞 **TROUBLESHOOTING**

### **Error: "Cannot connect to database"**
```bash
# Verificar Docker PostgreSQL
docker ps
docker logs postgres_db

# Verificar variables de entorno
cat .env.local
```

### **Error: "Table requests does not exist"**
```bash
# Conectar a PostgreSQL
docker exec -it postgres_db psql -U postgres -d postgres
\dt public.*

# Si no existe, ejecutar script
\i create_requests_table.sql
```

### **Error: "API returns empty data"**
```bash
# Verificar datos en BD
docker exec -it postgres_db psql -U postgres -d postgres -c "SELECT COUNT(*) FROM requests;"

# Si está vacía, insertar datos de prueba (ya incluidos en el script)
```

---

## 🎉 **RESULTADO ESPERADO**

**Al completar FASE 1 (2-3 días):**
- ✅ **Dashboard Líder** mostrará solicitudes reales
- ✅ **Dashboard Global** tendrá KPIs reales  
- ✅ **Reportes** con estadísticas reales
- ✅ **Página /my-requests** funcional
- ✅ **API /requests** devolviendo datos reales

**Al completar FASE 2 (1 semana):**
- ✅ **Chat InsightBot** guardará solicitudes automáticamente
- ✅ **Flujo completo** conversation → summary → database → dashboard
- ✅ **Notificaciones** al líder de nuevas solicitudes
- ✅ **Sistema end-to-end** completamente funcional

**🚀 Con esto tendrás un sistema completo y funcional listo para producción en menos de 2 semanas.**

---

*Elaborado por: Análisis técnico del estado actual*  
*Próxima revisión: Diaria durante implementación*  
*Distribución: Equipo técnico GTTD*
