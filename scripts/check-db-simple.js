const { Pool } = require('pg');

// Configuración directa desde .env.local
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'UNA_CONTRASENA_FUERTE_PARA_POSTGRES',
  database: 'postgres',
  connectionTimeoutMillis: 3000,
});

async function checkDatabase() {
  console.log('🔍 Verificando conexión a PostgreSQL...\n');
  
  try {
    const client = await pool.connect();
    console.log('✅ CONEXIÓN EXITOSA a PostgreSQL\n');
    
    // Listar tablas
    console.log('📋 Listando tablas existentes:');
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No hay tablas en el esquema public');
    } else {
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.tablename}`);
      });
    }
    
    console.log('\n🔍 Verificando tablas requeridas:');
    const requiredTables = ['session_states', 'conversation_messages', 'scoring_configurations'];
    const existingTables = tablesResult.rows.map(r => r.tablename);
    
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ ${table} - EXISTE`);
      } else {
        console.log(`   ❌ ${table} - FALTA`);
      }
    });
    
    // Si existen las tablas principales, contar registros
    if (existingTables.includes('session_states')) {
      const countResult = await client.query('SELECT COUNT(*) FROM session_states');
      console.log(`\n📊 session_states: ${countResult.rows[0].count} registros`);
    }
    
    if (existingTables.includes('conversation_messages')) {
      const countResult = await client.query('SELECT COUNT(*) FROM conversation_messages');
      console.log(`📊 conversation_messages: ${countResult.rows[0].count} registros`);
    }
    
    client.release();
    
  } catch (error) {
    console.log('❌ ERROR DE CONEXIÓN:');
    console.log(`   Mensaje: ${error.message}`);
    console.log(`   Código: ${error.code}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUCIÓN:');
      console.log('   PostgreSQL no está corriendo. Opciones:');
      console.log('   1. Iniciar Docker: docker-compose up -d postgres');
      console.log('   2. Instalar PostgreSQL localmente');
      console.log('   3. Usar PostgreSQL en la nube');
    }
  }
  
  await pool.end();
}

checkDatabase().catch(console.error);
