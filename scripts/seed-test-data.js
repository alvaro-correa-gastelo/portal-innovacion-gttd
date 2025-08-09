/**
 * Seed de datos de prueba con transacción y rollback seguro.
 * Crea 2 sesiones y mensajes alineados al esquema real:
 *  - session_states(session_id uuid, user_id varchar, current_stage varchar, conversation_data jsonb, completeness_score int, status varchar, created_at, updated_at)
 *  - conversation_messages(message_id uuid, session_id uuid, role varchar, message text, agent_name varchar, metadata jsonb, created_at timestamp)
 *
 * Uso:
 *   node scripts/seed-test-data.js "postgres://USER:PASS@HOST:5432/DB"
 *   # o usando env:
 *   DB_HOST=localhost DB_PORT=5432 DB_USER=postgres DB_PASSWORD=... DB_NAME=postgres node scripts/seed-test-data.js
 *
 * Notas:
 *  - Usa pgcrypto.gen_random_uuid() si está disponible; si no, genera UUID en Node.
 *  - En caso de error, hace ROLLBACK.
 */
const { Client } = require('pg');
const crypto = require('crypto');

function buildUrlFromEnv() {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'postgres';
  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16)
  );
}

async function main() {
  const url = process.argv[2] || process.env.DATABASE_URL || buildUrlFromEnv();
  const client = new Client({ connectionString: url, ssl: false });

  console.log('▶ Conectando a:', url.replace(/:(.*?)@/, '://*****@'));
  await client.connect();

  // Verificar pgcrypto (para gen_random_uuid)
  let hasPgcrypto = false;
  try {
    const r = await client.query("SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto';");
    hasPgcrypto = r.rowCount > 0;
    if (!hasPgcrypto) {
      console.log('ℹ️ Habilitando extensión pgcrypto...');
      await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
      hasPgcrypto = true;
    }
  } catch (e) {
    console.log('⚠️ No se pudo habilitar pgcrypto, se usarán UUIDs generados en Node:', e.message);
  }

  const genUUIDSQL = hasPgcrypto ? 'gen_random_uuid()' : null;

  // Generar UUIDs por anticipado si no hay pgcrypto
  const ids = {
    s1: genUUIDSQL ? null : uuidv4(),
    s2: genUUIDSQL ? null : uuidv4(),
    u1: genUUIDSQL ? null : uuidv4(),
    a1: genUUIDSQL ? null : uuidv4(),
    u2: genUUIDSQL ? null : uuidv4(),
    a2: genUUIDSQL ? null : uuidv4(),
  };

  // Datos
  const now = new Date().toISOString();

  // Construir SQL con placeholders cuando apliquen
  const q = `
    -- SESIÓN 1: discovery (<75)
    WITH s1 AS (
      INSERT INTO session_states (session_id, user_id, current_stage, conversation_data, completeness_score, status, created_at, updated_at)
      VALUES (
        ${genUUIDSQL ?? '$1'},
        'u-qa-prof-01',
        'discovery',
        jsonb_build_object(
          'user', jsonb_build_object('id','u-qa-prof-01','name','Ana Torres','department','Académico','role','Profesor')
        ),
        45,
        'active',
        NOW(),
        NOW()
      )
      RETURNING session_id
    ),
    u1 AS (
      INSERT INTO conversation_messages (message_id, session_id, role, message, agent_name, metadata, created_at)
      SELECT
        ${genUUIDSQL ?? '$2'},
        s1.session_id,
        'user',
        'Tengo problemas para sincronizar notas de Canvas con el sistema interno.',
        NULL,
        NULL,
        NOW()
      FROM s1
      RETURNING session_id
    ),
    a1 AS (
      INSERT INTO conversation_messages (message_id, session_id, role, message, agent_name, metadata, created_at)
      SELECT
        ${genUUIDSQL ?? '$3'},
        u1.session_id,
        'assistant',
        'Entiendo, ¿qué curso y cuántos alumnos están afectados? ¿Es un problema reciente?',
        'discovery_agent',
        NULL,
        NOW()
      FROM u1
      RETURNING session_id
    ),
    -- SESIÓN 2: lista para summary (≥75)
    s2 AS (
      INSERT INTO session_states (session_id, user_id, current_stage, conversation_data, completeness_score, status, created_at, updated_at)
      VALUES (
        ${genUUIDSQL ?? '$4'},
        'u-qa-admin-02',
        'discovery',
        jsonb_build_object(
          'user', jsonb_build_object('id','u-qa-admin-02','name','Luis Pérez','department','Administrativo','role','Coordinador'),
          'last_summary', jsonb_build_object('preview_seed', true)
        ),
        82,
        'active',
        NOW(),
        NOW()
      )
      RETURNING session_id
    ),
    u2 AS (
      INSERT INTO conversation_messages (message_id, session_id, role, message, agent_name, metadata, created_at)
      SELECT
        ${genUUIDSQL ?? '$5'},
        s2.session_id,
        'user',
        'Necesito automatizar el reporte mensual de asistencia del personal desde PeopleSoft a Power BI.',
        NULL,
        NULL,
        NOW()
      FROM s2
      RETURNING session_id
    ),
    a2 AS (
      INSERT INTO conversation_messages (message_id, session_id, role, message, agent_name, metadata, created_at)
      SELECT
        ${genUUIDSQL ?? '$6'},
        u2.session_id,
        'assistant',
        'Gracias. ¿Con qué frecuencia lo necesitas y quiénes consumirán el reporte?',
        'discovery_agent',
        NULL,
        NOW()
      FROM u2
      RETURNING session_id
    )
    SELECT 'ok' as status;
  `;

  const params = genUUIDSQL
    ? [] // los UUID los genera pgcrypto
    : [ids.s1, ids.u1, ids.a1, ids.s2, ids.u2, ids.a2];

  try {
    console.log('▶ Iniciando transacción...');
    await client.query('BEGIN');

    const seedRes = await client.query(q, params);
    console.log('✔ Seed ejecutado:', seedRes.rows[0]);

    const s = await client.query(`
      SELECT user_id, session_id, current_stage, completeness_score
      FROM session_states
      WHERE user_id IN ('u-qa-prof-01','u-qa-admin-02')
      ORDER BY updated_at DESC;
    `);
    console.table(s.rows);

    const m = await client.query(`
      SELECT role, agent_name, message, created_at
      FROM conversation_messages
      WHERE session_id IN (SELECT session_id FROM session_states WHERE user_id IN ('u-qa-prof-01','u-qa-admin-02'))
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    console.dir(m.rows, { depth: null });

    await client.query('COMMIT');
    console.log('✅ Transacción confirmada (COMMIT)');
  } catch (err) {
    console.error('✖ Error durante seed, haciendo ROLLBACK:', err.message);
    try {
      await client.query('ROLLBACK');
      console.log('↩️ ROLLBACK aplicado');
    } catch (rbErr) {
      console.error('⚠️ Error al hacer ROLLBACK:', rbErr.message);
    }
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch(e => {
  console.error('✖ Fatal:', e.message);
  process.exit(1);
});
