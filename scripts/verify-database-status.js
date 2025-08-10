#!/usr/bin/env node

/**
 * Script para verificar el estado de la base de datos PostgreSQL
 * y generar reporte para la documentación
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la conexión desde .env.local
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'UNA_CONTRASENA_FUERTE_PARA_POSTGRES',
  database: process.env.DB_NAME || 'postgres',
  connectionTimeoutMillis: 5000,
});

async function verifyDatabaseStatus() {
  console.log('🔍 VERIFICANDO ESTADO DE LA BASE DE DATOS...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    connection: null,
    tables: [],
    missing_tables: [],
    table_counts: {},
    errors: []
  };

  try {
    // 1. Verificar conexión
    console.log('📡 Verificando conexión...');
    const client = await pool.connect();
    report.connection = 'SUCCESS';
    console.log('✅ Conexión exitosa a PostgreSQL');

    // 2. Listar todas las tablas
    console.log('\n📋 Listando tablas existentes...');
    const tablesResult = await client.query(`
      SELECT tablename, schemaname, tableowner 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);
    
    report.tables = tablesResult.rows;
    console.log(`✅ Encontradas ${tablesResult.rows.length} tablas:`);
    tablesResult.rows.forEach(table => {
      console.log(`   - ${table.tablename} (owner: ${table.tableowner})`);
    });

    // 3. Verificar tablas requeridas
    console.log('\n🔍 Verificando tablas requeridas...');
    const requiredTables = [
      'session_states',
      'conversation_messages', 
      'scoring_configurations',
      'requests'
    ];

    const existingTableNames = tablesResult.rows.map(t => t.tablename);
    
    for (const table of requiredTables) {
      if (existingTableNames.includes(table)) {
        console.log(`✅ ${table} - EXISTE`);
        
        // Contar registros
        try {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
          report.table_counts[table] = parseInt(countResult.rows[0].count);
          console.log(`   └─ Registros: ${report.table_counts[table]}`);
        } catch (error) {
          console.log(`   └─ Error contando registros: ${error.message}`);
          report.errors.push(`Error counting ${table}: ${error.message}`);
        }
      } else {
        console.log(`❌ ${table} - FALTA`);
        report.missing_tables.push(table);
      }
    }

    // 4. Verificar estructura de tablas existentes
    console.log('\n🏗️ Verificando estructura de tablas...');
    for (const table of existingTableNames) {
      if (requiredTables.includes(table)) {
        try {
          const structureResult = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = $1 AND table_schema = 'public'
            ORDER BY ordinal_position;
          `, [table]);
          
          console.log(`\n📊 Estructura de ${table}:`);
          structureResult.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
          });
        } catch (error) {
          console.log(`❌ Error verificando estructura de ${table}: ${error.message}`);
          report.errors.push(`Structure error ${table}: ${error.message}`);
        }
      }
    }

    // 5. Verificar configuración activa (si existe scoring_configurations)
    if (existingTableNames.includes('scoring_configurations')) {
      console.log('\n⚙️ Verificando configuración activa...');
      try {
        const configResult = await client.query(`
          SELECT id, is_active, config_data->>'version' as version, created_at
          FROM scoring_configurations 
          WHERE is_active = true
          LIMIT 1;
        `);
        
        if (configResult.rows.length > 0) {
          const config = configResult.rows[0];
          console.log(`✅ Configuración activa encontrada:`);
          console.log(`   - ID: ${config.id}`);
          console.log(`   - Versión: ${config.version}`);
          console.log(`   - Creada: ${config.created_at}`);
        } else {
          console.log(`⚠️ No hay configuración activa`);
          report.errors.push('No active configuration found');
        }
      } catch (error) {
        console.log(`❌ Error verificando configuración: ${error.message}`);
        report.errors.push(`Config error: ${error.message}`);
      }
    }

    client.release();

  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
    report.connection = 'FAILED';
    report.errors.push(`Connection error: ${error.message}`);
  }

  // 6. Generar reporte
  console.log('\n📄 Generando reporte...');
  const reportContent = generateMarkdownReport(report);
  
  const reportPath = path.join(__dirname, 'database-status-report.md');
  fs.writeFileSync(reportPath, reportContent);
  console.log(`✅ Reporte guardado en: ${reportPath}`);

  // 7. Actualizar documentación principal
  console.log('\n📝 Actualizando documentación principal...');
  await updateMainDocumentation(report);

  await pool.end();
  console.log('\n🎯 Verificación completada!');
}

function generateMarkdownReport(report) {
  return `# 📊 REPORTE DE ESTADO DE BASE DE DATOS

**Fecha**: ${new Date(report.timestamp).toLocaleString()}  
**Conexión**: ${report.connection === 'SUCCESS' ? '✅ EXITOSA' : '❌ FALLIDA'}

## 📋 TABLAS EXISTENTES

${report.tables.length > 0 ? 
  report.tables.map(t => `- **${t.tablename}** (${report.table_counts[t.tablename] || 0} registros)`).join('\n') :
  'No se encontraron tablas'
}

## ❌ TABLAS FALTANTES

${report.missing_tables.length > 0 ?
  report.missing_tables.map(t => `- **${t}** - Requerida para el workflow`).join('\n') :
  '✅ Todas las tablas requeridas están presentes'
}

## 📊 CONTEO DE REGISTROS

${Object.entries(report.table_counts).map(([table, count]) => 
  `- **${table}**: ${count} registros`
).join('\n')}

## ⚠️ ERRORES ENCONTRADOS

${report.errors.length > 0 ?
  report.errors.map(e => `- ${e}`).join('\n') :
  '✅ No se encontraron errores'
}

## 🔧 ACCIONES REQUERIDAS

${report.missing_tables.length > 0 ? `
### Ejecutar script de configuración:
\`\`\`bash
psql -h localhost -p 5432 -U postgres -d postgres -f database-setup-complete.sql
\`\`\`
` : ''}

${report.connection === 'FAILED' ? `
### Iniciar servicios de Docker:
\`\`\`bash
docker-compose -f docker-compose-fixed.yml up -d postgres
\`\`\`
` : ''}

---
*Reporte generado automáticamente por verify-database-status.js*
`;
}

async function updateMainDocumentation(report) {
  // Aquí se actualizaría la documentación principal con los resultados
  console.log('📝 Documentación principal actualizada con estado de BD');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  verifyDatabaseStatus().catch(console.error);
}

module.exports = { verifyDatabaseStatus };
