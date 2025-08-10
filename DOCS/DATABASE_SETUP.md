# 🗄️ Configuración de Base de Datos PostgreSQL

## ✅ Estado Actual
- ✅ APIs conectadas a PostgreSQL
- ✅ Variables de entorno configuradas
- ✅ Funciones de base de datos implementadas
- ✅ Fallbacks para desarrollo incluidos

## 📋 Requisitos Previos

1. **PostgreSQL instalado y ejecutándose**
   - Puerto por defecto: 5432
   - Asegúrate de que el servicio PostgreSQL esté iniciado

2. **Base de datos creada**
   - Nombre de la base: `impulsa_utp` (o la que especificaste en .env.local)

3. **Tablas del esquema creadas**
   - `requests` - Tabla principal de solicitudes
   - `requests_audit` - Historial de cambios
   - `users` - Usuarios del sistema
   - `scoring_configurations` - Configuraciones de scoring

## 🔧 Configuración

### 1. Variables de Entorno
Las variables ya están configuradas en `.env.local`:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=UNA_CONTRASENA_FUERTE_PARA_POSTGRES
DB_NAME=postgres
```

### 2. Verificar Conexión
Ejecuta el script de prueba:
```bash
node scripts/test-database-connection.js
```

### 3. Endpoints API Conectados

#### 📤 Messages API
- **Endpoint**: `/api/requests/[id]/messages`
- **Función**: Obtiene mensajes/comentarios de los líderes
- **Query**: `SELECT * FROM requests_audit WHERE request_id = ? AND comments IS NOT NULL`

#### 🕒 Timeline API  
- **Endpoint**: `/api/requests/[id]/timeline`
- **Función**: Obtiene historial completo de la solicitud
- **Query**: `SELECT * FROM requests_audit WHERE request_id = ? ORDER BY created_at ASC`

#### ✏️ Update Status API
- **Endpoint**: `/api/requests/[id]/update-status`
- **Función**: Actualiza estado y crea registro de auditoría
- **Transacción**: Actualiza `requests` y crea entrada en `requests_audit`

#### 🔍 Database Test API
- **Endpoint**: `/api/database/test`
- **Función**: Verifica conectividad con PostgreSQL

## 🚀 Cómo Iniciar

### Paso 1: Verificar PostgreSQL
```bash
# Verificar que PostgreSQL esté ejecutándose
# En Windows
net start postgresql-x64-14

# En Linux/Mac
sudo systemctl start postgresql
```

### Paso 2: Probar Conexión
```bash
node scripts/test-database-connection.js
```

### Paso 3: Iniciar el Servidor
```bash
npm run dev
```

### Paso 4: Probar en el Navegador
Navega a: `http://localhost:3000/api/database/test`

## 🔄 Esquema de Datos Esperado

### Tabla `requests`
```sql
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR,
    titulo VARCHAR NOT NULL,
    descripcion TEXT,
    tipo_solicitud VARCHAR,
    urgencia VARCHAR,
    justificacion_negocio TEXT,
    clasificacion_ia VARCHAR,
    prioridad_ia VARCHAR,
    clasificacion_final VARCHAR,
    prioridad_final VARCHAR,
    confidence_score DECIMAL,
    status VARCHAR DEFAULT 'pending_technical_analysis',
    leader_comments TEXT,
    override_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla `requests_audit`
```sql
CREATE TABLE requests_audit (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES requests(id),
    action_type VARCHAR,
    previous_status VARCHAR,
    new_status VARCHAR,
    leader_id VARCHAR,
    comments TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla `users` (opcional para JOINs)
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    name VARCHAR,
    email VARCHAR,
    role VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🐛 Resolución de Problemas

### Error de Conexión
1. Verifica que PostgreSQL esté ejecutándose
2. Confirma las credenciales en `.env.local`
3. Verifica que el puerto 5432 esté disponible
4. Confirma que la base de datos existe

### Tablas No Encontradas
- Las APIs incluyen fallbacks con datos de ejemplo
- Crea las tablas usando el esquema anterior
- O ejecuta tus migraciones existentes

### Error de Permisos
- Asegúrate de que el usuario PostgreSQL tenga permisos
- Grant permisos: `GRANT ALL PRIVILEGES ON DATABASE impulsa_utp TO postgres;`

## 📊 Funcionalidades Implementadas

### ✅ UserRequestDetailModal
- 📋 **Resumen**: Muestra información básica de la solicitud
- 🕒 **Timeline**: Historial cronológico con datos reales de BD
- 💬 **Mensajes**: Comunicaciones de líderes con colores por tipo

### ✅ StatusManager (Modal de Líder)
- ✏️ **Cambio de Estado**: Actualiza BD usando transacciones
- 💬 **Comentarios**: Se almacenan en requests_audit
- 🔄 **Actualización Automática**: Los hooks se refrescan tras cambios

### ✅ Hooks de Datos
- `useRequestTimeline`: Conectado a `/api/requests/[id]/timeline`
- `useRequestMessages`: Conectado a `/api/requests/[id]/messages`
- Actualización automática tras cambios de estado

## 🎯 Siguiente Paso
¡Tu sistema está listo! Solo necesitas:
1. Crear las tablas en PostgreSQL si no existen
2. Ejecutar `npm run dev`
3. Probar los modales con solicitudes reales

El sistema funcionará con datos de ejemplo si hay errores de conexión, pero se conectará automáticamente a PostgreSQL cuando esté disponible.
