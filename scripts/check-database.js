#!/usr/bin/env node

/**
 * SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
 * Portal de Innovación GTTD - UTP
 * 
 * Este script verifica que todo esté configurado correctamente
 */

const { Client } = require('pg');

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB || 'n8n_db',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password'
};

async function checkDatabase() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔍 Verificando estado de la base de datos...\n');
    
    await client.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');

    // Verificar tablas existentes
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('\n📋 Tablas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Verificar tablas específicas necesarias
    const requiredTables = ['session_states', 'conversation_messages', 'scoring_configurations', 'configuration_audit', 'report_templates'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('\n🎯 Estado de tablas requeridas:');
    requiredTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    });

    // Verificar configuración activa
    if (existingTables.includes('scoring_configurations')) {
      const configQuery = 'SELECT name, version, is_active FROM scoring_configurations ORDER BY created_at DESC';
      const configResult = await client.query(configQuery);
      
      console.log('\n⚙️ Configuraciones de scoring:');
      if (configResult.rows.length === 0) {
        console.log('  ❌ No hay configuraciones');
      } else {
        configResult.rows.forEach(row => {
          console.log(`  ${row.is_active ? '🟢' : '⚪'} ${row.name} ${row.version}`);
        });
      }
    }

    // Verificar templates
    if (existingTables.includes('report_templates')) {
      const templatesQuery = 'SELECT name, type, is_active FROM report_templates ORDER BY created_at DESC';
      const templatesResult = await client.query(templatesQuery);
      
      console.log('\n📄 Templates de reportes:');
      if (templatesResult.rows.length === 0) {
        console.log('  ❌ No hay templates');
      } else {
        templatesResult.rows.forEach(row => {
          console.log(`  ${row.is_active ? '🟢' : '⚪'} ${row.name} (${row.type})`);
        });
      }
    }

    // Verificar datos de sesiones (si existen)
    if (existingTables.includes('session_states')) {
      const sessionsQuery = 'SELECT COUNT(*) as total FROM session_states';
      const sessionsResult = await client.query(sessionsQuery);
      console.log(`\n💬 Sesiones totales: ${sessionsResult.rows[0].total}`);
    }

    console.log('\n🎉 Verificación completada!');

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Sugerencias:');
      console.log('  1. Verifica que Docker esté ejecutándose');
      console.log('  2. Ejecuta: docker-compose up -d postgres');
      console.log('  3. Verifica las variables de entorno');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  checkDatabase().catch(console.error);
}

module.exports = { checkDatabase };
