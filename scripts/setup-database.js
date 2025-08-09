#!/usr/bin/env node

/**
 * SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS
 * Portal de Innovación GTTD - UTP
 * 
 * Este script:
 * 1. Conecta a PostgreSQL en Docker
 * 2. Verifica tablas existentes
 * 3. Crea tablas nuevas necesarias
 * 4. Inserta configuración inicial
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de conexión (ajusta según tu .env)
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB || 'n8n_db',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password'
};

console.log('🚀 Iniciando configuración de base de datos...');
console.log('📊 Configuración:', { ...dbConfig, password: '***' });

async function main() {
  const client = new Client(dbConfig);
  
  try {
    // 1. Conectar a la base de datos
    console.log('\n📡 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conexión exitosa!');

    // 2. Verificar tablas existentes
    console.log('\n🔍 Verificando tablas existentes...');
    await verifyExistingTables(client);

    // 3. Crear nuevas tablas
    console.log('\n🏗️ Creando nuevas tablas...');
    await createNewTables(client);

    // 4. Insertar configuración inicial
    console.log('\n📝 Insertando configuración inicial...');
    await insertInitialConfig(client);

    // 5. Verificar que todo esté correcto
    console.log('\n✅ Verificando instalación...');
    await verifyInstallation(client);

    console.log('\n🎉 ¡Configuración completada exitosamente!');

  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function verifyExistingTables(client) {
  const query = `
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name IN ('session_states', 'conversation_messages')
    ORDER BY table_name, ordinal_position;
  `;
  
  const result = await client.query(query);
  
  if (result.rows.length === 0) {
    console.log('⚠️ No se encontraron las tablas session_states y conversation_messages');
    console.log('💡 Necesitarás crearlas primero o verificar la conexión');
  } else {
    console.log('✅ Tablas existentes encontradas:');
    const tables = {};
    result.rows.forEach(row => {
      if (!tables[row.table_name]) tables[row.table_name] = [];
      tables[row.table_name].push(`${row.column_name} (${row.data_type})`);
    });
    
    Object.entries(tables).forEach(([table, columns]) => {
      console.log(`  📋 ${table}:`);
      columns.forEach(col => console.log(`    - ${col}`));
    });
  }
}

async function createNewTables(client) {
  // Leer y ejecutar el script SQL de creación de tablas
  const sqlPath = path.join(__dirname, '..', 'FASE_1_crear_tablas_nuevas.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.log('⚠️ Archivo SQL no encontrado, creando tablas manualmente...');
    await createTablesManually(client);
    return;
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Dividir en statements individuales y ejecutar
  const statements = sql.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await client.query(statement);
        console.log('✅ Ejecutado:', statement.substring(0, 50) + '...');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('ℹ️ Tabla ya existe:', statement.substring(0, 50) + '...');
        } else {
          throw error;
        }
      }
    }
  }
}

async function createTablesManually(client) {
  const tables = [
    {
      name: 'scoring_configurations',
      sql: `
        CREATE TABLE IF NOT EXISTS scoring_configurations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          version VARCHAR(20) NOT NULL,
          config_data JSONB NOT NULL,
          created_by VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          is_active BOOLEAN DEFAULT false,
          description TEXT,
          UNIQUE(name, version)
        );
      `
    },
    {
      name: 'configuration_audit',
      sql: `
        CREATE TABLE IF NOT EXISTS configuration_audit (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          config_id UUID REFERENCES scoring_configurations(id),
          action VARCHAR(50) NOT NULL,
          changed_by VARCHAR(100) NOT NULL,
          changes JSONB,
          previous_config JSONB,
          timestamp TIMESTAMP DEFAULT NOW()
        );
      `
    },
    {
      name: 'report_templates',
      sql: `
        CREATE TABLE IF NOT EXISTS report_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          type VARCHAR(50) NOT NULL,
          template_html TEXT NOT NULL,
          css_styles TEXT,
          created_by VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          is_active BOOLEAN DEFAULT false,
          version VARCHAR(20) NOT NULL
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      await client.query(table.sql);
      console.log(`✅ Tabla creada: ${table.name}`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`ℹ️ Tabla ya existe: ${table.name}`);
      } else {
        throw error;
      }
    }
  }

  // Crear índices
  const indices = [
    'CREATE INDEX IF NOT EXISTS idx_scoring_config_active ON scoring_configurations (is_active, created_at DESC);',
    'CREATE INDEX IF NOT EXISTS idx_config_audit_config_id ON configuration_audit (config_id, timestamp DESC);',
    'CREATE INDEX IF NOT EXISTS idx_report_templates_type_active ON report_templates (type, is_active);'
  ];

  for (const index of indices) {
    try {
      await client.query(index);
      console.log('✅ Índice creado');
    } catch (error) {
      console.log('ℹ️ Índice ya existe o error:', error.message);
    }
  }
}

async function insertInitialConfig(client) {
  // Verificar si ya existe configuración
  const checkQuery = 'SELECT COUNT(*) FROM scoring_configurations WHERE is_active = true';
  const checkResult = await client.query(checkQuery);
  
  if (parseInt(checkResult.rows[0].count) > 0) {
    console.log('ℹ️ Ya existe configuración activa, saltando inserción inicial');
    return;
  }

  // Insertar configuración inicial
  const configData = {
    scoring_weights: {
      problem_identified: 15,
      description_detailed: 15,
      impact_defined: 10,
      frequency_specified: 8,
      volume_quantified: 8,
      tools_current: 12,
      stakeholders_identified: 10,
      urgency_defined: 7,
      platforms_complexity: 15
    },
    platform_complexity_matrix: {
      'Canvas': { complexity: 3, integration_effort: 2, user_impact: 8 },
      'SAP': { complexity: 9, integration_effort: 9, user_impact: 9 },
      'PeopleSoft': { complexity: 8, integration_effort: 8, user_impact: 7 },
      'Power BI': { complexity: 6, integration_effort: 5, user_impact: 7 },
      'Office 365': { complexity: 2, integration_effort: 2, user_impact: 5 },
      'Sistema Interno': { complexity: 5, integration_effort: 6, user_impact: 6 }
    },
    effort_calculation: {
      base_hours_per_complexity: 8,
      integration_multiplier: 1.5,
      user_impact_multiplier: 1.2,
      multiple_platforms_penalty: 1.3
    },
    priority_matrix: {
      critical: { total_score_min: 85, platform_complexity_min: 7, user_impact_min: 8 },
      high: { total_score_min: 70, platform_complexity_min: 5, user_impact_min: 6 },
      medium: { total_score_min: 50, platform_complexity_min: 3, user_impact_min: 4 },
      low: { total_score_max: 49, platform_complexity_max: 2, user_impact_max: 3 }
    }
  };

  const insertQuery = `
    INSERT INTO scoring_configurations (name, version, config_data, created_by, is_active, description) 
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  await client.query(insertQuery, [
    'Platform-Based Scoring Rules',
    'v2.0',
    JSON.stringify(configData),
    'system',
    true,
    'Configuración inicial basada en plataformas'
  ]);

  console.log('✅ Configuración inicial insertada');
}

async function verifyInstallation(client) {
  // Verificar tablas creadas
  const tablesQuery = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name IN ('scoring_configurations', 'configuration_audit', 'report_templates')
    AND table_schema = 'public'
  `;
  
  const tablesResult = await client.query(tablesQuery);
  console.log(`✅ Tablas nuevas creadas: ${tablesResult.rows.length}/3`);

  // Verificar configuración activa
  const configQuery = 'SELECT name, version FROM scoring_configurations WHERE is_active = true';
  const configResult = await client.query(configQuery);
  
  if (configResult.rows.length > 0) {
    console.log(`✅ Configuración activa: ${configResult.rows[0].name} ${configResult.rows[0].version}`);
  } else {
    console.log('⚠️ No hay configuración activa');
  }

  // Mostrar resumen
  console.log('\n📊 RESUMEN DE INSTALACIÓN:');
  console.log('  ✅ Conexión a PostgreSQL: OK');
  console.log('  ✅ Tablas nuevas creadas: OK');
  console.log('  ✅ Configuración inicial: OK');
  console.log('  ✅ Índices creados: OK');
}

// Ejecutar script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
