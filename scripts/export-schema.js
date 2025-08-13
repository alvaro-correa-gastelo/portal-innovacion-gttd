#!/usr/bin/env node

/**
 * EXPORTAR ESQUEMA COMPLETO DE BASE DE DATOS
 * Genera un archivo SQL con el esquema completo para GitHub
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Proporciona la connection string como argumento');
  console.error('Uso: node export-schema.js "postgresql://user:pass@host:port/db"');
  process.exit(1);
}

async function exportSchema() {
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente');

    // Obtener todas las tablas
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(r => r.table_name);
    
    console.log(`📊 Encontradas ${tables.length} tablas:`, tables);

    let schemaSQL = `-- =====================================================
-- ESQUEMA DE BASE DE DATOS - PORTAL DE INNOVACIÓN GTTD
-- =====================================================
-- Esquema extraído automáticamente de la base de datos en producción
-- Ejecutar en PostgreSQL (Neon, Supabase, etc.)

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

`;

    // Para cada tabla, obtener su estructura completa
    for (const tableName of tables) {
      console.log(`📋 Procesando tabla: ${tableName}`);
      
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await client.query(columnsQuery, [tableName]);
      const columns = columnsResult.rows;

      schemaSQL += `-- =====================================================
-- TABLA: ${tableName}
-- =====================================================
CREATE TABLE IF NOT EXISTS ${tableName} (
`;

      const columnDefinitions = columns.map(col => {
        let definition = `    ${col.column_name} `;
        
        // Tipo de dato
        switch (col.data_type) {
          case 'character varying':
            definition += col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : 'VARCHAR';
            break;
          case 'timestamp without time zone':
            definition += 'TIMESTAMP';
            break;
          case 'uuid':
            definition += 'UUID';
            break;
          default:
            definition += col.data_type.toUpperCase();
        }

        // Primary key
        if (col.column_name === 'id' || col.column_name.endsWith('_id') && col.column_name.split('_').length === 2) {
          definition += ' PRIMARY KEY';
        }

        // NOT NULL
        if (col.is_nullable === 'NO') {
          definition += ' NOT NULL';
        }

        // Default
        if (col.column_default && !col.column_default.includes('nextval')) {
          definition += ` DEFAULT ${col.column_default}`;
        }

        return definition;
      });

      schemaSQL += columnDefinitions.join(',\n') + '\n);\n\n';
    }

    // Agregar índices básicos
    schemaSQL += `-- =====================================================
-- ÍNDICES BÁSICOS PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para session_states
CREATE INDEX IF NOT EXISTS idx_session_states_user_id ON session_states (user_id);
CREATE INDEX IF NOT EXISTS idx_session_states_updated_at ON session_states (updated_at);

-- Índices para conversation_messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON conversation_messages (session_id, created_at);

-- Índices para requests
CREATE INDEX IF NOT EXISTS idx_requests_session_id ON requests (session_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests (user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests (created_at);

-- Índices para requests_audit
CREATE INDEX IF NOT EXISTS idx_requests_audit_request_id ON requests_audit (request_id, created_at);

-- Índices para scoring_configurations
CREATE INDEX IF NOT EXISTS idx_scoring_config_active ON scoring_configurations (is_active);
`;

    // Escribir archivo
    const outputPath = path.join(__dirname, '..', 'db', 'sql', 'schema-complete.sql');
    
    // Crear directorio si no existe
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, schemaSQL);
    
    console.log('✅ Esquema exportado exitosamente a:', outputPath);
    console.log('📄 Archivo listo para GitHub y documentación');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

exportSchema();
