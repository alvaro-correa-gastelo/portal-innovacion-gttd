# APIs NECESARIAS PARA SISTEMA AUDITABLE Y CONFIGURABLE

## 1. CONFIGURACIONES DE SCORING

### GET /api/configurations
Obtiene todas las configuraciones de scoring
```typescript
Response: {
  configurations: ScoringConfig[]
}
```

### POST /api/configurations
Crea nueva configuración
```typescript
Request: {
  name: string
  version: string
  config_data: object
  description: string
  created_by: string
}
Response: {
  id: string
  success: boolean
}
```

### PUT /api/configurations/:id
Actualiza configuración existente
```typescript
Request: {
  name?: string
  version?: string
  config_data?: object
  description?: string
  changed_by: string
}
Response: {
  success: boolean
  audit_id: string
}
```

### POST /api/configurations/:id/activate
Activa una configuración específica
```typescript
Request: {
  changed_by: string
}
Response: {
  success: boolean
  audit_id: string
}
```

### GET /api/configurations/active
Obtiene la configuración activa actual
```typescript
Response: {
  config: ScoringConfig
}
```

## 2. AUDIT TRAIL

### GET /api/configurations/audit
Obtiene historial de cambios
```typescript
Query: {
  config_id?: string
  changed_by?: string
  from_date?: string
  to_date?: string
  limit?: number
}
Response: {
  audit_entries: AuditEntry[]
  total: number
}
```

### GET /api/configurations/audit/:id
Obtiene detalles de un cambio específico
```typescript
Response: {
  audit_entry: AuditEntry
  diff: object
}
```

## 3. TEMPLATES DE REPORTES

### GET /api/templates
Obtiene todos los templates
```typescript
Query: {
  type?: 'user_report' | 'leader_report'
  active_only?: boolean
}
Response: {
  templates: ReportTemplate[]
}
```

### POST /api/templates
Crea nuevo template
```typescript
Request: {
  name: string
  type: 'user_report' | 'leader_report'
  template_html: string
  css_styles?: string
  version: string
  created_by: string
}
Response: {
  id: string
  success: boolean
}
```

### POST /api/templates/:id/activate
Activa un template específico
```typescript
Request: {
  changed_by: string
}
Response: {
  success: boolean
}
```

## 4. GENERACIÓN DE REPORTES

### POST /api/reports/generate
Genera PDF de reporte
```typescript
Request: {
  session_id: string
  report_type: 'user' | 'leader'
  data: ReportData
  template_id?: string
}
Response: {
  pdf_blob: Blob
  filename: string
}
```

### GET /api/reports/user/:session_id
Descarga reporte de usuario
```typescript
Response: PDF file
```

### GET /api/reports/leader/:session_id
Descarga reporte ejecutivo
```typescript
Response: PDF file
```

### POST /api/reports/send
Envía reporte por email
```typescript
Request: {
  session_id: string
  report_type: 'user' | 'leader'
  recipient: string
  cc?: string[]
  message?: string
}
Response: {
  success: boolean
  message_id: string
}
```

## 5. ANÁLISIS Y SCORING

### POST /api/analysis/calculate
Calcula scoring usando configuración activa
```typescript
Request: {
  session_data: object
  config_id?: string
}
Response: {
  priority_level: string
  priority_score: number
  estimated_effort: string
  classification: string
  impact_score: number
  roi_estimate: string
  calculation_details: object
}
```

### GET /api/analysis/config-impact
Simula impacto de cambio de configuración
```typescript
Query: {
  config_id: string
  sample_sessions?: string[]
}
Response: {
  affected_sessions: number
  priority_changes: object
  classification_changes: object
}
```

## 6. DASHBOARD Y MÉTRICAS

### GET /api/dashboard/metrics
Obtiene métricas del dashboard
```typescript
Query: {
  from_date?: string
  to_date?: string
  department?: string
}
Response: {
  total_requests: number
  by_priority: object
  by_classification: object
  by_department: object
  avg_completion_time: number
  config_usage: object
}
```

### GET /api/dashboard/trends
Obtiene tendencias de solicitudes
```typescript
Query: {
  period: 'week' | 'month' | 'quarter'
  metric: 'volume' | 'priority' | 'effort'
}
Response: {
  trends: TrendData[]
  insights: string[]
}
```

## 7. VALIDACIÓN Y TESTING

### POST /api/configurations/validate
Valida configuración antes de guardar
```typescript
Request: {
  config_data: object
}
Response: {
  valid: boolean
  errors: string[]
  warnings: string[]
}
```

### POST /api/configurations/test
Prueba configuración con datos de muestra
```typescript
Request: {
  config_data: object
  test_sessions: object[]
}
Response: {
  results: TestResult[]
  summary: object
}
```

## IMPLEMENTACIÓN EN NEXT.JS

### Estructura de archivos:
```
app/api/
├── configurations/
│   ├── route.ts                    # GET, POST /api/configurations
│   ├── [id]/
│   │   ├── route.ts               # PUT /api/configurations/:id
│   │   └── activate/route.ts      # POST /api/configurations/:id/activate
│   ├── active/route.ts            # GET /api/configurations/active
│   ├── audit/route.ts             # GET /api/configurations/audit
│   ├── validate/route.ts          # POST /api/configurations/validate
│   └── test/route.ts              # POST /api/configurations/test
├── templates/
│   ├── route.ts                   # GET, POST /api/templates
│   └── [id]/activate/route.ts     # POST /api/templates/:id/activate
├── reports/
│   ├── generate/route.ts          # POST /api/reports/generate
│   ├── send/route.ts              # POST /api/reports/send
│   ├── user/[session_id]/route.ts # GET /api/reports/user/:session_id
│   └── leader/[session_id]/route.ts # GET /api/reports/leader/:session_id
├── analysis/
│   ├── calculate/route.ts         # POST /api/analysis/calculate
│   └── config-impact/route.ts     # GET /api/analysis/config-impact
└── dashboard/
    ├── metrics/route.ts           # GET /api/dashboard/metrics
    └── trends/route.ts            # GET /api/dashboard/trends
```

### Dependencias necesarias:
```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "puppeteer": "^21.0.0",
    "nodemailer": "^6.9.0",
    "handlebars": "^4.7.8",
    "date-fns": "^2.30.0"
  }
}
```

### Middleware de autenticación:
```typescript
// middleware/auth.ts
export function requireRole(roles: string[]) {
  return (req: Request) => {
    const userRole = req.headers.get('x-user-role')
    if (!roles.includes(userRole)) {
      throw new Error('Insufficient permissions')
    }
  }
}

// Uso en APIs:
// requireRole(['admin', 'leader']) para configuraciones
// requireRole(['user', 'leader', 'admin']) para reportes
```
