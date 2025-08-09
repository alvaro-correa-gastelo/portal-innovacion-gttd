# 🔍 GUÍA MANUAL PARA VERIFICAR BASE DE DATOS

## 📋 **PASO 1: VERIFICAR DOCKER**

Abre una terminal/PowerShell y ejecuta:

```bash
# Verificar si Docker está corriendo
docker --version
docker ps

# Si Docker no está corriendo, iniciarlo
# En Windows: Abrir Docker Desktop
```

## 📋 **PASO 2: VERIFICAR SERVICIOS POSTGRESQL**

```bash
# Verificar si PostgreSQL está corriendo
docker ps | grep postgres

# Si no está corriendo, iniciar PostgreSQL
docker-compose -f docker-compose-fixed.yml up -d postgres

# Verificar logs de PostgreSQL
docker logs postgres_db
```

## 📋 **PASO 3: CREAR ARCHIVO .ENV PARA DOCKER**

Crear archivo `.env` en la raíz del proyecto:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=UNA_CONTRASENA_FUERTE_PARA_POSTGRES
POSTGRES_DB=postgres
REDIS_PASSWORD=tu_redis_password_seguro
N8N_ENCRYPTION_KEY=tu_encryption_key_muy_seguro_de_32_caracteres
```

## 📋 **PASO 4: CONECTAR A POSTGRESQL**

### **Opción A: Desde Docker**
```bash
# Conectar directamente al contenedor
docker exec -it postgres_db psql -U postgres -d postgres

# Una vez conectado, ejecutar:
\dt                    # Listar tablas
\d session_states      # Ver estructura de session_states
\d conversation_messages  # Ver estructura de conversation_messages
```

### **Opción B: Desde herramienta externa**
- **pgAdmin**: Conectar a `localhost:5432`
- **DBeaver**: Conectar con credenciales del .env.local
- **VS Code**: Extensión PostgreSQL

## 📋 **PASO 5: VERIFICAR TABLAS EXISTENTES**

Ejecutar estas consultas SQL:

```sql
-- 1. Listar todas las tablas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Verificar tablas específicas
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'session_states') 
    THEN '✅ session_states EXISTE'
    ELSE '❌ session_states FALTA'
  END as session_states,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversation_messages') 
    THEN '✅ conversation_messages EXISTE'
    ELSE '❌ conversation_messages FALTA'
  END as conversation_messages,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'scoring_configurations') 
    THEN '✅ scoring_configurations EXISTE'
    ELSE '❌ scoring_configurations FALTA'
  END as scoring_configurations;

-- 3. Contar registros (si las tablas existen)
SELECT 'session_states' as tabla, COUNT(*) as registros FROM session_states
UNION ALL
SELECT 'conversation_messages', COUNT(*) FROM conversation_messages;
```

## 📋 **PASO 6: EJECUTAR SCRIPT DE CONFIGURACIÓN (SI FALTAN TABLAS)**

Si faltan tablas, ejecutar:

```bash
# Desde terminal en el directorio del proyecto
psql -h localhost -p 5432 -U postgres -d postgres -f database-setup-complete.sql

# O desde Docker
docker exec -i postgres_db psql -U postgres -d postgres < database-setup-complete.sql
```

## 📋 **PASO 7: VERIFICAR CONFIGURACIÓN DE N8N**

```sql
-- Verificar configuración activa
SELECT id, name, version, is_active, created_at 
FROM scoring_configurations 
WHERE is_active = true;

-- Si no hay configuración activa, insertar una por defecto
INSERT INTO scoring_configurations (name, version, config_data, is_active)
VALUES (
  'Configuración por defecto',
  '1.0.0',
  '{
    "urgencia": {"critica": 30, "alta": 22, "media": 15, "baja": 8},
    "impacto": {"critico": 25, "alto": 19, "medio": 12, "bajo": 6},
    "complejidad": {"muy_compleja": 5, "compleja": 10, "moderada": 15, "simple": 20},
    "recursos": {"disponibles": 15, "limitados": 10, "escasos": 5},
    "alineacion": {"alta": 10, "media": 7, "baja": 3}
  }',
  true
);
```

## 📋 **PASO 8: VERIFICAR DESDE LA APLICACIÓN**

1. **Iniciar la aplicación Next.js:**
   ```bash
   npm run dev
   ```

2. **Probar endpoints:**
   - `http://localhost:3000/api/configurations/active`
   - `http://localhost:3000/settings`

3. **Verificar errores en consola del navegador**

## 🎯 **RESULTADOS ESPERADOS**

### **✅ SI TODO ESTÁ BIEN:**
- PostgreSQL corriendo en puerto 5432
- Tablas `session_states`, `conversation_messages`, `scoring_configurations` existen
- Configuración activa en `scoring_configurations`
- Página `/settings` carga sin errores
- API `/api/configurations/active` responde correctamente

### **❌ SI HAY PROBLEMAS:**
- PostgreSQL no está corriendo → Iniciar Docker
- Tablas faltan → Ejecutar `database-setup-complete.sql`
- Error en `/settings` → Verificar tabla `scoring_configurations`
- Error de conexión → Verificar credenciales en `.env.local`

## 📊 **REPORTE DE ESTADO**

Una vez completada la verificación, documenta:

```
ESTADO DE LA BASE DE DATOS:
□ PostgreSQL corriendo: SÍ/NO
□ Tablas principales: session_states (SÍ/NO), conversation_messages (SÍ/NO)
□ Tabla configuración: scoring_configurations (SÍ/NO)
□ Registros en session_states: [número]
□ Registros en conversation_messages: [número]
□ Configuración activa: SÍ/NO
□ Página /settings funciona: SÍ/NO
□ API /configurations/active funciona: SÍ/NO

PRÓXIMOS PASOS:
□ Completar rutas faltantes en n8n
□ Probar workflow completo
□ Optimizar configuración
```

---

**💡 TIP**: Si tienes problemas con Docker, también puedes instalar PostgreSQL directamente en Windows y usar las mismas credenciales.
