#!/usr/bin/env node

/**
 * Script para probar la conexión a PostgreSQL y verificar el estado de las tablas
 * Ejecuta con: node scripts/test-database-connection.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
});

async function testConnection() {
  console.log('🔍 Probando conexión a PostgreSQL...');
  console.log(`📍 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
  console.log(`👤 User: ${process.env.DB_USER}`);
  console.log('');

  try {
    // Test básico de conexión
    const client = await pool.connect();
    console.log('✅ Conexión establecida correctamente');

    // Verificar timestamp
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log(`⏰ Timestamp del servidor: ${timeResult.rows[0].current_time}`);
    
    // Verificar tablas existentes
    console.log('\n📋 Verificando tablas existentes...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('requests', 'requests_audit', 'users', 'scoring_configurations')
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    
    if (tablesResult.rows.length > 0) {
      console.log('✅ Tablas encontradas:');
      tablesResult.rows.forEach(row => {
        console.log(`   • ${row.table_name}`);
      });
      
      // Contar registros en cada tabla
      console.log('\n📊 Conteo de registros:');
      for (const row of tablesResult.rows) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${row.table_name}`);
          console.log(`   • ${row.table_name}: ${countResult.rows[0].count} registros`);
        } catch (error) {
          console.log(`   • ${row.table_name}: Error al contar (${error.message})`);
        }
      }
    } else {
      console.log('⚠️  No se encontraron las tablas principales del sistema');
      console.log('💡 Puede que necesites ejecutar las migraciones de la base de datos');
    }

    // Test de consulta en requests_audit (si existe)
    try {
      const auditTest = await client.query(`
        SELECT COUNT(*) as audit_count 
        FROM requests_audit 
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `);
      console.log(`\n📝 Registros de auditoría (últimos 7 días): ${auditTest.rows[0].audit_count}`);
    } catch (error) {
      console.log(`\n⚠️  No se pudo verificar tabla requests_audit: ${error.message}`);
    }

    client.release();
    console.log('\n✅ Test de conexión completado exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.error('\n🔧 Posibles soluciones:');
    console.error('   1. Verifica que PostgreSQL esté ejecutándose');
    console.error('   2. Confirma las credenciales en .env.local');
    console.error('   3. Verifica que el puerto esté abierto');
    console.error('   4. Confirma que la base de datos existe');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Probando endpoints API localmente...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test endpoint de test de base de datos
    console.log('🔍 Probando /api/database/test...');
    try {
      const response = await fetch('http://localhost:3000/api/database/test');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ API endpoint funcional');
        console.log(`   • Database: ${data.database}`);
        console.log(`   • Host: ${data.host}:${data.port}`);
      } else {
        console.log('❌ API endpoint reporta error:', data.message);
      }
    } catch (error) {
      console.log('⚠️  No se pudo conectar a la API local (¿está el servidor corriendo?)');
      console.log('💡 Ejecuta: npm run dev');
    }
    
  } catch (error) {
    console.log('⚠️  No se pudo probar endpoints API:', error.message);
  }
}

// Ejecutar tests
async function main() {
  console.log('🚀 Iniciando pruebas de conectividad...\n');
  
  await testConnection();
  await testAPIEndpoints();
  
  console.log('\n🎉 Pruebas completadas');
  console.log('\n💡 Siguiente paso: Ejecuta "npm run dev" para iniciar el servidor');
}

main().catch(console.error);
