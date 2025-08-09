// Script simple para verificar PostgreSQL
console.log('🔍 Iniciando verificación de base de datos...\n');

try {
  const { Pool } = require('pg');
  console.log('✅ Módulo pg cargado correctamente');
  
  // Configuración desde .env.local
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'UNA_CONTRASENA_FUERTE_PARA_POSTGRES',
    database: 'postgres',
    connectionTimeoutMillis: 5000,
  });
  
  console.log('✅ Pool de conexiones creado');
  
  async function testConnection() {
    try {
      console.log('🔌 Intentando conectar...');
      const client = await pool.connect();
      console.log('✅ CONEXIÓN EXITOSA a PostgreSQL\n');
      
      // Listar tablas
      const result = await client.query(`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename;
      `);
      
      console.log('📋 Tablas encontradas:');
      if (result.rows.length === 0) {
        console.log('   ❌ No hay tablas en el esquema public');
      } else {
        result.rows.forEach((row, i) => {
          console.log(`   ${i + 1}. ${row.tablename}`);
        });
      }
      
      // Verificar tablas específicas
      console.log('\n🎯 Verificando tablas requeridas:');
      const required = ['session_states', 'conversation_messages', 'scoring_configurations'];
      const existing = result.rows.map(r => r.tablename);
      
      required.forEach(table => {
        const exists = existing.includes(table);
        console.log(`   ${exists ? '✅' : '❌'} ${table}`);
      });
      
      client.release();
      await pool.end();
      
      console.log('\n🎉 Verificación completada exitosamente!');
      
    } catch (error) {
      console.log('❌ ERROR DE CONEXIÓN:');
      console.log(`   Mensaje: ${error.message}`);
      console.log(`   Código: ${error.code || 'N/A'}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 SOLUCIONES POSIBLES:');
        console.log('   1. PostgreSQL no está corriendo');
        console.log('   2. Verificar Docker: docker ps | grep postgres');
        console.log('   3. Iniciar PostgreSQL: docker-compose up -d postgres');
        console.log('   4. Verificar puerto 5432 disponible');
      }
      
      await pool.end();
    }
  }
  
  testConnection();
  
} catch (error) {
  console.log('❌ ERROR CARGANDO DEPENDENCIAS:');
  console.log(`   ${error.message}`);
  console.log('\n💡 SOLUCIÓN:');
  console.log('   Ejecutar: npm install');
}
